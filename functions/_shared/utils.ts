// Shared utilities for Cloudflare Pages Functions
// @ts-nocheck

export interface Env {
  DATABASE?: any;
  KV?: any;
  JWT_SECRET?: string;
  USE_MOCK?: string;
}

export type CFEnv = Env;

export interface Ctx {
  next: () => Promise<Response>;
  waitUntil?: (promise: Promise<any>) => void;
}

// ========== Base64URL Helpers ==========

function base64UrlEncode(data: string | Uint8Array): string {
  const str = typeof data === 'string' ? data : new TextDecoder().decode(data);
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - str.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

// ========== JSON Response Helpers ==========

export function jsonResponse(body: any, status = 200, extraHeaders: Record<string, string> = {}): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  return new Response(JSON.stringify(body), { status, headers });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

// ========== Cookie Helpers ==========

export function parseCookies(request: Request): Record<string, string> {
  const cookies: Record<string, string> = {};
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return cookies;
  for (const pair of cookieHeader.split(';')) {
    const [name, value] = pair.trim().split('=');
    if (name) cookies[name.trim()] = (value || '').trim();
  }
  return cookies;
}

export function setCookieHeader(
  name: string,
  value: string,
  options: { httpOnly?: boolean; secure?: boolean; sameSite?: string; maxAge?: number; path?: string; domain?: string } = {}
): string {
  const parts: string[] = [`${name}=${value}`];
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  return parts.join('; ');
}

// ========== Email Validation ==========

export function isEmailValid(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

// ========== Password Hashing (SHA-256 with salt) ==========

export async function hashPassword(password: string): Promise<string> {
  const salt = `salt_${Date.now()}_`;
  const data = new TextEncoder().encode(salt + password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashStr = base64UrlEncode(new Uint8Array(hash));
  return `${salt}$${hashStr}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split('$');
  if (parts.length !== 2) return false;
  const [salt, hashStr] = parts;
  const data = new TextEncoder().encode(salt + password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const computedHash = base64UrlEncode(new Uint8Array(hash));
  return computedHash === hashStr;
}

// ========== JWT (HMAC-SHA256) ==========

const DEFAULT_JWT_SECRET = 'owlbyte-dev-secret-change-in-production';

export async function signJWT(payload: object, secret?: string, ttlSeconds = 900): Promise<string> {
  const key = secret || DEFAULT_JWT_SECRET;
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + ttlSeconds };
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerStr = base64UrlEncode(JSON.stringify(header));
  const payloadStr = base64UrlEncode(JSON.stringify(fullPayload));
  const signingInput = `${headerStr}.${payloadStr}`;

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(signingInput));
  const sigStr = base64UrlEncode(new Uint8Array(signature));
  return `${signingInput}.${sigStr}`;
}

export async function verifyJWT(token: string, secret?: string): Promise<any> {
  try {
    const key = secret || DEFAULT_JWT_SECRET;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerStr, payloadStr, sigStr] = parts;
    const signingInput = `${headerStr}.${payloadStr}`;

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(key),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const valid = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      base64UrlDecode(sigStr),
      new TextEncoder().encode(signingInput)
    );
    if (!valid) return null;

    const payload = JSON.parse(base64UrlDecode(payloadStr));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ========== Auth Helpers ==========

export function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

export async function requireAuth(request: Request, env: Env): Promise<any> {
  const token = getBearerToken(request);
  if (!token) return null;
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) return null;
  return payload;
}

export async function requireAdmin(request: Request, env: Env): Promise<any> {
  const payload = await requireAuth(request, env);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

// ========== Mock Database ==========

const mockUsers = new Map<string, {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  role: string;
  emailVerified: boolean;
  passwordHash: string;
}>();
const mockUsersById = new Map<string, string>();

// Initialize default mock user
hashPassword('owlbyte123456').then(hash => {
  mockUsers.set('admin@owlbyte.home', {
    id: 'user_admin',
    email: 'admin@owlbyte.home',
    displayName: 'Administrator',
    avatarUrl: '',
    role: 'admin',
    emailVerified: true,
    passwordHash: hash,
  });
  mockUsersById.set('user_admin', 'admin@owlbyte.home');
});

const mockRefreshTokens = new Map<string, string>();
const mockSubscribers = new Map<string, { email: string; source?: string; unsub_token: string; status: string; createdAt: string }>();
const mockEmailVerifications = new Map<string, { email: string; token: string; createdAt: string }>();
const mockVisitors = new Map<string, { sessionId: string; path: string; referrer?: string; lastPingAt: string }>();
const mockLogs: Array<{ id: string; level: string; message: string; stack?: string; url?: string; timestamp: string }> = [];

// ========== D1 / Mock Abstraction ==========

export function isMockMode(env: Env): boolean {
  return !env.DATABASE || env.USE_MOCK === 'true';
}

export async function dbFindUserByEmail(env: Env, email: string): Promise<any> {
  if (isMockMode(env)) {
    return mockUsers.get(email) || null;
  }
  try {
    const result = await env.DATABASE.prepare(
      'SELECT id, email, display_name, avatar_url, role, email_verified, password_hash FROM users WHERE email = ?'
    ).bind(email).all();
    if (result.results && result.results.length > 0) {
      const row = result.results[0];
      return {
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        role: row.role,
        emailVerified: !!row.email_verified,
        passwordHash: row.password_hash,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function dbFindUserById(env: Env, id: string): Promise<any> {
  if (isMockMode(env)) {
    const email = mockUsersById.get(id);
    if (!email) return null;
    return mockUsers.get(email) || null;
  }
  try {
    const result = await env.DATABASE.prepare(
      'SELECT id, email, display_name, avatar_url, role, email_verified, password_hash FROM users WHERE id = ?'
    ).bind(id).all();
    if (result.results && result.results.length > 0) {
      const row = result.results[0];
      return {
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        role: row.role,
        emailVerified: !!row.email_verified,
        passwordHash: row.password_hash,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function dbCreateUser(env: Env, user: {
  id: string; email: string; displayName: string; passwordHash: string;
}): Promise<boolean> {
  if (isMockMode(env)) {
    const existing = mockUsers.get(user.email);
    if (existing) return false;
    mockUsers.set(user.email, {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: '',
      role: 'user',
      emailVerified: false,
      passwordHash: user.passwordHash,
    });
    mockUsersById.set(user.id, user.email);
    return true;
  }
  try {
    const result = await env.DATABASE.prepare(
      'INSERT INTO users (id, email, display_name, password_hash, role, email_verified) VALUES (?, ?, ?, ?, ?, 0)'
    ).bind(user.id, user.email, user.displayName, user.passwordHash, 'user').run();
    return result.success;
  } catch {
    return false;
  }
}

export async function dbStoreEmailVerification(env: Env, email: string, token: string): Promise<boolean> {
  if (isMockMode(env)) {
    mockEmailVerifications.set(token, { email, token, createdAt: new Date().toISOString() });
    return true;
  }
  try {
    const result = await env.DATABASE.prepare(
      'INSERT INTO email_verifications (token, email, created_at) VALUES (?, ?, ?)'
    ).bind(token, email, new Date().toISOString()).run();
    return result.success;
  } catch {
    return false;
  }
}

export async function dbStoreRefreshToken(env: Env, token: string, userId: string): Promise<boolean> {
  if (isMockMode(env)) {
    mockRefreshTokens.set(token, userId);
    return true;
  }
  try {
    const result = await env.DATABASE.prepare(
      'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)'
    ).bind(token, userId, new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()).run();
    return result.success;
  } catch {
    return false;
  }
}

export async function dbFindRefreshToken(env: Env, token: string): Promise<string | null> {
  if (isMockMode(env)) {
    return mockRefreshTokens.get(token) || null;
  }
  try {
    const result = await env.DATABASE.prepare(
      'SELECT user_id FROM refresh_tokens WHERE token = ? AND expires_at > ?'
    ).bind(token, new Date().toISOString()).all();
    if (result.results && result.results.length > 0) return result.results[0].user_id;
    return null;
  } catch {
    return null;
  }
}

export async function dbDeleteRefreshToken(env: Env, token: string): Promise<boolean> {
  if (isMockMode(env)) {
    mockRefreshTokens.delete(token);
    return true;
  }
  try {
    const result = await env.DATABASE.prepare('DELETE FROM refresh_tokens WHERE token = ?').bind(token).run();
    return result.success;
  } catch {
    return false;
  }
}

export async function dbAddSubscriber(env: Env, email: string, source?: string): Promise<{ success: boolean; exists: boolean }> {
  if (isMockMode(env)) {
    const existing = Array.from(mockSubscribers.values()).find(s => s.email === email);
    if (existing) return { success: true, exists: true };
    const unsubToken = crypto.randomUUID();
    mockSubscribers.set(unsubToken, {
      email, source, unsub_token: unsubToken, status: 'active', createdAt: new Date().toISOString(),
    });
    return { success: true, exists: false };
  }
  try {
    const check = await env.DATABASE.prepare('SELECT id FROM subscribers WHERE email = ?').bind(email).all();
    if (check.results && check.results.length > 0) return { success: true, exists: true };
    const unsubToken = crypto.randomUUID();
    const result = await env.DATABASE.prepare(
      'INSERT INTO subscribers (email, source, unsub_token, status, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(email, source || null, unsubToken, 'active', new Date().toISOString()).run();
    return { success: result.success, exists: false };
  } catch {
    return { success: false, exists: false };
  }
}

export async function dbUnsubscribe(env: Env, token: string): Promise<boolean> {
  if (isMockMode(env)) {
    const sub = mockSubscribers.get(token);
    if (!sub) return false;
    mockSubscribers.delete(token);
    return true;
  }
  try {
    const result = await env.DATABASE.prepare('DELETE FROM subscribers WHERE unsub_token = ?').bind(token).run();
    return result.success;
  } catch {
    return false;
  }
}

export async function dbRecordHeartbeat(env: Env, sessionId: string, path: string, referrer?: string): Promise<void> {
  const now = new Date().toISOString();
  if (isMockMode(env)) {
    mockVisitors.set(sessionId, { sessionId, path, referrer, lastPingAt: now });
    return;
  }
  try {
    await env.DATABASE.prepare(
      `INSERT INTO visitors (session_id, path, referrer, last_ping_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(session_id) DO UPDATE SET path = excluded.path, referrer = excluded.referrer, last_ping_at = excluded.last_ping_at`
    ).bind(sessionId, path, referrer || null, now).run();
  } catch {
    // ignore
  }
}

export async function dbGetOnlineVisitors(env: Env, withinHours = 2): Promise<any[]> {
  const cutoff = new Date(Date.now() - withinHours * 3600 * 1000).toISOString();
  if (isMockMode(env)) {
    return Array.from(mockVisitors.values())
      .filter(v => v.lastPingAt > cutoff)
      .map(v => ({
        sessionId: v.sessionId,
        path: v.path,
        referrer: v.referrer || null,
        lastPingAt: v.lastPingAt,
      }));
  }
  try {
    const result = await env.DATABASE.prepare(
      'SELECT session_id, path, referrer, last_ping_at FROM visitors WHERE last_ping_at > ?'
    ).bind(cutoff).all();
    if (!result.results) return [];
    return result.results.map((r: any) => ({
      sessionId: r.session_id, path: r.path, referrer: r.referrer, lastPingAt: r.last_ping_at,
    }));
  } catch {
    return [];
  }
}

export async function dbGetVisitorStats(env: Env): Promise<any> {
  if (isMockMode(env)) {
    const visitors = Array.from(mockVisitors.values());
    const total = visitors.length;
    const now = new Date().toISOString();
    const day = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const week = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    return {
      total,
      today: visitors.filter(v => v.lastPingAt > day).length,
      thisWeek: visitors.filter(v => v.lastPingAt > week).length,
      uniquePaths: new Set(visitors.map(v => v.path)).size,
      avgSessionMinutes: 0,
    };
  }
  try {
    const total = await env.DATABASE.prepare('SELECT COUNT(*) as cnt FROM visitors').all();
    const today = await env.DATABASE.prepare(
      'SELECT COUNT(*) as cnt FROM visitors WHERE last_ping_at > ?'
    ).bind(new Date(Date.now() - 24 * 3600 * 1000).toISOString()).all();
    const week = await env.DATABASE.prepare(
      'SELECT COUNT(*) as cnt FROM visitors WHERE last_ping_at > ?'
    ).bind(new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()).all();
    const paths = await env.DATABASE.prepare('SELECT COUNT(DISTINCT path) as cnt FROM visitors').all();
    return {
      total: total.results?.[0]?.cnt || 0,
      today: today.results?.[0]?.cnt || 0,
      thisWeek: week.results?.[0]?.cnt || 0,
      uniquePaths: paths.results?.[0]?.cnt || 0,
      avgSessionMinutes: 0,
    };
  } catch {
    return { total: 0, today: 0, thisWeek: 0, uniquePaths: 0, avgSessionMinutes: 0 };
  }
}

export async function dbStoreLog(env: Env, log: {
  id: string; level: string; message: string; stack?: string; url?: string; timestamp: string;
}): Promise<void> {
  if (env.KV) {
    try {
      await env.KV.put(`log_${log.id}`, JSON.stringify(log), { expirationTtl: 604800 });
      return;
    } catch {
      // fall through
    }
  }
  if (isMockMode(env)) {
    mockLogs.push(log);
    if (mockLogs.length > 500) mockLogs.shift();
    return;
  }
  try {
    await env.DATABASE.prepare(
      'INSERT INTO logs (id, level, message, stack, url, timestamp) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(log.id, log.level, log.message, log.stack || null, log.url || null, log.timestamp).run();
  } catch {
    // ignore
  }
}

export async function dbListLogs(env: Env, limit = 50): Promise<any[]> {
  if (env.KV) {
    try {
      const keys = await env.KV.list({ prefix: 'log_' });
      const logs: any[] = [];
      for (const key of keys.keys) {
        const val = await env.KV.get(key.name);
        if (val) logs.push(JSON.parse(val));
      }
      return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
    } catch {
      // fall through
    }
  }
  if (isMockMode(env)) {
    return mockLogs.slice(-limit).reverse();
  }
  try {
    const result = await env.DATABASE.prepare(
      'SELECT id, level, message, stack, url, timestamp FROM logs ORDER BY timestamp DESC LIMIT ?'
    ).bind(limit).all();
    if (!result.results) return [];
    return result.results.map((r: any) => ({
      id: r.id, level: r.level, message: r.message,
      stack: r.stack, url: r.url, timestamp: r.timestamp,
    }));
  } catch {
    return [];
  }
}

// ========== Rate Limiting ==========

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(env: Env, key: string, maxRequests = 5, windowSeconds = 3600): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}
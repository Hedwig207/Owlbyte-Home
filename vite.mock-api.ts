import type { Plugin } from 'vite';
import crypto from 'node:crypto';

type UserRow = { id: string; email: string; displayName: string; passwordHash: string; role: 'user'|'admin'; emailVerified: boolean; avatarUrl?: string };
const MOCK_USERS: Map<string, UserRow> = new Map();
const adminId = crypto.randomUUID();
MOCK_USERS.set('admin@owlbyte.home', {
  id: adminId,
  email: 'admin@owlbyte.home',
  displayName: 'Hedwig',
  passwordHash: hashPasswordSync('owlbyte123456'),
  role: 'admin',
  emailVerified: true,
  avatarUrl: '',
});

type Session = { userId: string; issuedAt: number; ttlMs: number };
const REFRESH_TOKENS: Map<string, Session> = new Map();
const VERIFY_TOKENS: Map<string, { email: string }> = new Map();
const RESET_TOKENS: Map<string, { email: string }> = new Map();
const SUBSCRIBERS: Map<string, { email: string; token: string; source?: string; subscribedAt: number }> = new Map();
type LogRow = { id: string; level: string; message: string; stack?: string; url?: string; timestamp: string };
const LOGS: LogRow[] = [];
type Visitor = { sessionId: string; path: string; referrer?: string; lastPingAt: number; ua?: string };
const VISITORS: Map<string, Visitor> = new Map();
type LogView = { id: string; sessionId: string; path: string; referrer?: string; ua?: string; timestamp: string };
const LOG_VIEWS: LogView[] = [];

function hashPasswordSync(pwd: string): string {
  const salt = `salt_${Date.now()}_`;
  const h = crypto.createHash('sha256').update(salt + pwd).digest('base64url');
  return `${salt}$${h}`;
}
function verifyPasswordSync(pwd: string, stored: string): boolean {
  const [salt, hash] = stored.split('$');
  const h = crypto.createHash('sha256').update(salt + pwd).digest('base64url');
  return h === hash;
}
const DEV_JWT_SECRET = 'dev-secret-owlbyte-local';
function base64url(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}
function decodeJwt<T>(token: string): T | null {
  try {
    const [_h, payload] = token.split('.');
    return JSON.parse(Buffer.from(payload, 'base64url').toString()) as T;
  } catch {
    return null;
  }
}
function signJwt<T extends object>(payload: T & { exp: number }): string {
  const h = base64url({ alg: 'HS256', typ: 'JWT' });
  const p = base64url(payload);
  const s = crypto.createHmac('sha256', DEV_JWT_SECRET).update(`${h}.${p}`).digest('base64url');
  return `${h}.${p}.${s}`;
}

function json(body: unknown, status = 200, extraHeaders: Record<string,string> = {}): any {
  return {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-credentials': 'true',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

function parseBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString();
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

function readCookie(cookie: string | undefined, name: string): string | null {
  if (!cookie) return null;
  const m = cookie.split(';').map((s) => s.trim()).find((s) => s.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : null;
}

export default function mockApiPlugin(): Plugin {
  return {
    name: 'owlbyte-mock-api',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        const pathname = url.pathname.replace(/^\/+/, '');

        try {
          if (req.method === 'OPTIONS') {
            res.writeHead(204, {
              'access-control-allow-origin': '*',
              'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
              'access-control-allow-headers': 'Content-Type,Authorization',
              'access-control-max-age': '86400',
            });
            return res.end();
          }

          const send = (resp: {status: number; headers: any; body: string}) => {
            res.writeHead(resp.status, resp.headers);
            res.end(resp.body);
          };
          const body = req.method === 'GET' ? Object.fromEntries(url.searchParams) : await parseBody(req);
          const cookie = req.headers.cookie as string | undefined;
          const authHeader = req.headers.authorization as string | undefined;
          const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
          const payload = token ? decodeJwt<{sub:string;email:string;role:string;exp:number}>(token) : null;
          const requireAdmin = () => {
            if (!payload || payload.role !== 'admin') { send(json({ error: '未授权' }, 401)); return false; }
            return true;
          };

          if (pathname === 'health') return send(json({ status: 'ok', mode: 'dev-mock', time: new Date().toISOString() }));

          if (pathname === 'auth/register' && req.method === 'POST') {
            const { email, password, displayName } = body as any;
            if (!/.+@.+\..+/.test(email || '')) return send(json({ error: '邮箱格式不正确' }, 400));
            if ((password || '').length < 8) return send(json({ error: '密码至少 8 位' }, 400));
            if (MOCK_USERS.has(email)) return send(json({ error: '该邮箱已注册' }, 409));
            const id = crypto.randomUUID();
            MOCK_USERS.set(email, {
              id, email,
              displayName: displayName || email.split('@')[0],
              passwordHash: hashPasswordSync(password),
              role: 'user', emailVerified: false,
            });
            const verifyToken = signJwt({ email, type: 'verify', exp: Date.now() + 24 * 3600 * 1000 });
            VERIFY_TOKENS.set(verifyToken, { email });
            return send(json({ message: '验证邮件已发送（dev mock：直接使用 /verify-email?token=' + verifyToken.slice(-8) + '…）', email }));
          }

          if (pathname === 'auth/verify-email' && req.method === 'GET') {
            const t = url.searchParams.get('token') || (body as any).token;
            if (!t) return send(json({ error: '缺少 token' }, 400));
            const decoded = decodeJwt<{email:string}>(t);
            if (!decoded?.email) return send(json({ error: 'token 无效' }, 400));
            const user = MOCK_USERS.get(decoded.email);
            if (user) user.emailVerified = true;
            return send(json({ message: '邮箱已验证', email: decoded.email }));
          }

          if (pathname === 'auth/login' && req.method === 'POST') {
            const { email, password } = body as any;
            const u = MOCK_USERS.get(email || '');
            if (!u || !verifyPasswordSync(password || '', u.passwordHash)) {
              return send(json({ error: '邮箱或密码错误' }, 401));
            }
            const accessToken = signJwt({ sub: u.id, email: u.email, role: u.role, exp: Date.now() + 15 * 60 * 1000 });
            const refreshToken = crypto.randomUUID();
            REFRESH_TOKENS.set(refreshToken, { userId: u.id, issuedAt: Date.now(), ttlMs: 7 * 24 * 3600 * 1000 });
            const cookieValue = encodeURIComponent(refreshToken);
            res.setHeader('Set-Cookie', `__Secure-refresh_token=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}`);
            return send(json({
              message: '登录成功',
              accessToken,
              user: { id: u.id, email: u.email, displayName: u.displayName, role: u.role, emailVerified: u.emailVerified, avatarUrl: u.avatarUrl || null },
            }));
          }

          if (pathname === 'auth/me' && req.method === 'GET') {
            if (!payload) return send(json({ error: '未登录' }, 401));
            if (!payload) {
              const rt = readCookie(cookie, '__Secure-refresh_token');
              if (rt) {
                const s = REFRESH_TOKENS.get(rt);
                if (s) {
                  const u = [...MOCK_USERS.values()].find((x) => x.id === s.userId);
                  if (u) {
                    const accessToken = signJwt({ sub: u.id, email: u.email, role: u.role, exp: Date.now() + 15 * 60 * 1000 });
                    return send(json({ id: u.id, email: u.email, displayName: u.displayName, role: u.role, emailVerified: u.emailVerified, avatarUrl: u.avatarUrl || null, accessToken }));
                  }
                }
              }
            }
            const u = [...MOCK_USERS.values()].find((x) => x.id === payload!.sub);
            if (!u) return send(json({ error: '用户不存在' }, 401));
            return send(json({ id: u.id, email: u.email, displayName: u.displayName, role: u.role, emailVerified: u.emailVerified, avatarUrl: u.avatarUrl || null }));
          }

          if (pathname === 'auth/refresh' && req.method === 'POST') {
            const rt = readCookie(cookie, '__Secure-refresh_token');
            if (!rt) return send(json({ error: '无 refresh token' }, 401));
            const s = REFRESH_TOKENS.get(rt);
            if (!s || Date.now() - s.issuedAt > s.ttlMs) {
              REFRESH_TOKENS.delete(rt);
              return send(json({ error: 'refresh token 已过期' }, 401));
            }
            const u = [...MOCK_USERS.values()].find((x) => x.id === s.userId);
            if (!u) return send(json({ error: '用户不存在' }, 401));
            const accessToken = signJwt({ sub: u.id, email: u.email, role: u.role, exp: Date.now() + 15 * 60 * 1000 });
            return send(json({ accessToken }));
          }

          if (pathname === 'auth/logout' && req.method === 'POST') {
            const rt = readCookie(cookie, '__Secure-refresh_token');
            if (rt) REFRESH_TOKENS.delete(rt);
            res.setHeader('Set-Cookie', `__Secure-refresh_token=deleted; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
            return send(json({ message: '已退出登录' }));
          }

          if (pathname === 'auth/forgot-password' && req.method === 'POST') {
            return send(json({ message: '如果邮箱已注册，重置链接已发送' }));
          }

          if (pathname === 'auth/reset-password' && req.method === 'POST') {
            const { token, newPassword } = body as any;
            if (!token || !newPassword) return send(json({ error: '参数不完整' }, 400));
            if (newPassword.length < 8) return send(json({ error: '密码至少 8 位' }, 400));
            const decoded = decodeJwt<{email:string}>(token);
            if (!decoded?.email) return send(json({ error: 'token 无效' }, 400));
            const u = MOCK_USERS.get(decoded.email);
            if (u) u.passwordHash = hashPasswordSync(newPassword);
            return send(json({ message: '密码已重置' }));
          }

          if (pathname === 'subscribers' && req.method === 'POST') {
            const { email, source } = body as any;
            if (!/.+@.+\..+/.test(email || '')) return send(json({ error: '邮箱格式不正确' }, 400));
            if (SUBSCRIBERS.has(email)) return send(json({ message: '您已经订阅过了', status: 'active' }, 200));
            const unsub = crypto.randomUUID();
            SUBSCRIBERS.set(email, { email, token: unsub, source, subscribedAt: Date.now() });
            return send(json({ message: '订阅成功', status: 'active', unsub_token: unsub }));
          }

          if (pathname === 'subscribers/unsubscribe' && req.method === 'POST') {
            const { token, email } = body as any;
            if (token) {
              for (const [e, s] of SUBSCRIBERS) {
                if (s.token === token) { SUBSCRIBERS.delete(e); return send(json({ message: '已退订' })); }
              }
            }
            if (email) SUBSCRIBERS.delete(email);
            return send(json({ message: '已退订' }));
          }

          if (pathname === 'visitors/heartbeat' && req.method === 'POST') {
            const { sessionId, path, referrer } = body as any;
            if (!sessionId) return send(json({ error: '缺少 sessionId' }, 400));
            const ua = req.headers['user-agent'] as string | undefined;
            VISITORS.set(sessionId, { sessionId, path: path || '/', referrer, lastPingAt: Date.now(), ua });
            return send(json({ ok: true, online: VISITORS.size }));
          }

          if (pathname === 'admin/visitors/online' && req.method === 'GET') {
            if (!requireAdmin()) return;
            const cutoff = Date.now() - 2 * 3600 * 1000;
            const list = [...VISITORS.values()].filter((v) => v.lastPingAt >= cutoff);
            return send(json({ total: list.length, rows: list }));
          }

          if (pathname === 'admin/visitors/stats' && req.method === 'GET') {
            if (!requireAdmin()) return;
            return send(json({ online: VISITORS.size, today: Math.max(VISITORS.size, 17), total: 999 + VISITORS.size, last7: [8, 12, 9, 15, 22, 18, VISITORS.size + 5] }));
          }

          if (pathname === 'logs' && req.method === 'POST') {
            const { level = 'info', message, stack, url } = body as any;
            const row: LogRow = { id: crypto.randomUUID(), level, message: message || '', stack, url: url || req.headers.referer, timestamp: new Date().toISOString() };
            LOGS.unshift(row);
            while (LOGS.length > 500) LOGS.pop();
            return send(json({ ok: true, id: row.id }, 201));
          }

          if (pathname === 'logs/list' && req.method === 'GET') {
            if (!requireAdmin()) return;
            return send(json({ total: LOGS.length, rows: LOGS.slice(0, 100) }));
          }

          if (pathname === 'log-views' && req.method === 'POST') {
            const { sessionId, path, referrer } = body as any;
            const ua = req.headers['user-agent'] as string | undefined;
            const sid = sessionId || 'anonymous';
            LOG_VIEWS.push({
              id: crypto.randomUUID(),
              sessionId: sid,
              path: path || '/log',
              referrer,
              ua,
              timestamp: new Date().toISOString(),
            });
            while (LOG_VIEWS.length > 10000) LOG_VIEWS.shift();
            return send(json({ ok: true }));
          }

          if (pathname === 'log-views' && req.method === 'GET') {
            const now = Date.now();
            const dayAgo = new Date(now - 24 * 3600 * 1000).toISOString();
            const weekAgo = new Date(now - 7 * 24 * 3600 * 1000).toISOString();
            return send(json({
              total: LOG_VIEWS.length,
              today: LOG_VIEWS.filter(v => v.timestamp > dayAgo).length,
              thisWeek: LOG_VIEWS.filter(v => v.timestamp > weekAgo).length,
              uniqueVisitors: new Set(LOG_VIEWS.map(v => v.sessionId)).size,
              recent: LOG_VIEWS.slice(-20).reverse().map(v => ({
                timestamp: v.timestamp,
                sessionId: v.sessionId,
                referrer: v.referrer,
                ua: v.ua,
              })),
            }));
          }

          next();
        } catch (err: any) {
          console.error('[mock-api error]', err);
          res.writeHead(500, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ error: err?.message ?? 'mock api error' }));
        }
      });
    },
  };
}

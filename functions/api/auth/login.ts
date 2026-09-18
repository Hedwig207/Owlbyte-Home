// POST /api/auth/login
// Handles user login, returns JWT access token and sets refresh cookie
// Body: { email, password }
// Returns: { user: { id, email, displayName, avatarUrl, role, emailVerified }, accessToken }
// Sets: __Secure-refresh_token cookie (7 days, SameSite=Lax, HttpOnly, Secure)
// @ts-nocheck

import {
  jsonResponse, errorResponse, isEmailValid, verifyPassword,
  dbFindUserByEmail, dbStoreRefreshToken, signJWT, setCookieHeader, parseCookies,
  isMockMode,
} from '../../_shared/utils';

const REFRESH_TOKEN_TTL = 7 * 24 * 3600; // 7 days

export async function onRequest(context: { request: Request; env: any; next: () => Promise<Response>; ctx: any }): Promise<Response> {
  const { request, env, ctx } = context;
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body');
  }

  const { email, password } = body || {};

  if (!email || !isEmailValid(email)) {
    return errorResponse('Invalid email');
  }
  if (!password) {
    return errorResponse('Password is required');
  }

  const user = await dbFindUserByEmail(env, email);
  if (!user) {
    if (isMockMode(env)) {
      return errorResponse('账号不存在，或开发模式内存数据已被重置（注册数据不持久），请重新注册', 401, 'INVALID_CREDENTIALS');
    }
    return errorResponse('邮箱或密码错误', 401, 'INVALID_CREDENTIALS');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return errorResponse('邮箱或密码错误', 401, 'INVALID_CREDENTIALS');
  }

  const accessToken = await signJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
  }, env.JWT_SECRET, 900); // 15 min TTL

  const refreshToken = crypto.randomUUID();
  await dbStoreRefreshToken(env, refreshToken, user.id);

  const response = jsonResponse({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl || '',
      role: user.role,
      emailVerified: user.emailVerified,
    },
    accessToken,
  });

  response.headers.set('Set-Cookie', setCookieHeader(
    '__Secure-refresh_token',
    refreshToken,
    {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: REFRESH_TOKEN_TTL,
      path: '/',
    }
  ));

  return response;
}

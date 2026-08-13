// POST /api/auth/refresh
// Refreshes access token using valid refresh token from cookie
// Returns: { accessToken, user }
// @ts-nocheck

import {
  jsonResponse, errorResponse, parseCookies, signJWT,
  dbFindRefreshToken, dbFindUserByEmail,
} from '../../_shared/utils';

export default async function handler(request: Request, env: any, ctx: any): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  const cookies = parseCookies(request);
  const refreshToken = cookies['__Secure-refresh_token'];
  if (!refreshToken) {
    return errorResponse('Refresh token not found', 401);
  }

  const userId = await dbFindRefreshToken(env, refreshToken);
  if (!userId) {
    return errorResponse('Invalid or expired refresh token', 401);
  }

  const user = await dbFindUserByEmail(env, userId);
  if (!user) {
    return errorResponse('User not found', 404);
  }

  const accessToken = await signJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
  }, env.JWT_SECRET, 900);

  return jsonResponse({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl || '',
      role: user.role,
      emailVerified: user.emailVerified,
    },
  });
}
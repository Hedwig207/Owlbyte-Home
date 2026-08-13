// POST /api/auth/logout
// Invalidates refresh token and clears the cookie
// Returns: { message: "Logged out" }
// @ts-nocheck

import {
  jsonResponse, errorResponse, parseCookies, setCookieHeader,
  dbFindRefreshToken, dbDeleteRefreshToken,
} from '../../_shared/utils';

export default async function handler(request: Request, env: any, ctx: any): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  const cookies = parseCookies(request);
  const refreshToken = cookies['__Secure-refresh_token'];

  if (refreshToken) {
    const userId = await dbFindRefreshToken(env, refreshToken);
    if (userId) {
      await dbDeleteRefreshToken(env, refreshToken);
    }
  }

  const response = jsonResponse({ message: 'Logged out' });
  response.headers.set('Set-Cookie', setCookieHeader(
    '__Secure-refresh_token',
    '',
    {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 0,
      path: '/',
    }
  ));

  return response;
}
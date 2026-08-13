// GET /api/auth/me
// Returns current authenticated user info from JWT in Authorization header
// Returns: { user: { id, email, displayName, avatarUrl, role, emailVerified } }
// @ts-nocheck

import {
  jsonResponse, errorResponse, requireAuth, parseCookies,
  dbFindRefreshToken, dbFindUserById, signJWT,
} from '../../_shared/utils';

export default async function handler(request: Request, env: any, ctx: any): Promise<Response> {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  let payload = await requireAuth(request, env).catch(() => null);
  if (!payload) {
    const cookies = parseCookies(request);
    const rt = cookies['__Secure-refresh_token'];
    if (rt) {
      const userId = await dbFindRefreshToken(env, rt);
      if (userId) {
        const user = await dbFindUserById(env, userId);
        if (user) {
          const accessToken = await signJWT(
            { sub: user.id, email: user.email, role: user.role },
            env.JWT_SECRET,
            900
          );
          return jsonResponse({
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
            },
            accessToken,
          });
        }
      }
    }
    if (!payload) return errorResponse('未登录', 401);
  }

  return jsonResponse({
    user: {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    },
  });
}

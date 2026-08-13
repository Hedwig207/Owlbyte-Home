// GET /api/auth/me
// Returns current authenticated user info from JWT in Authorization header
// Returns: { user: { id, email, displayName, avatarUrl, role, emailVerified } }
// @ts-nocheck

import {
  jsonResponse, errorResponse, requireAuth,
} from '../../_shared/utils';

export default async function handler(request: Request, env: any, ctx: any): Promise<Response> {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  const payload = await requireAuth(request, env);
  if (!payload) {
    return errorResponse('Unauthorized', 401);
  }

  return jsonResponse({
    user: {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    },
  });
}
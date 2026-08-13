// Admin middleware for Cloudflare Pages Functions
// Requires valid admin JWT for all routes under /api/admin/*
// @ts-nocheck

import { verifyJWT, errorResponse } from '../_shared/utils';

export default async function handler(request: Request, env: any, ctx: any): Promise<Response> {
  const token = getBearerToken(request);
  if (!token) {
    return errorResponse('Authentication required', 401);
  }

  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) {
    return errorResponse('Invalid or expired token', 401);
  }
  if (payload.role !== 'admin') {
    return errorResponse('Admin access required', 403);
  }

  // Attach user info to request for downstream handlers
  request.headers.set('X-User-Id', payload.sub);
  request.headers.set('X-User-Role', payload.role);

  return ctx.next();
}

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.slice(7);
}
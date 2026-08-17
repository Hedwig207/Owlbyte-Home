// GET /api/admin/visitors/stats
// Returns visitor statistics
// Requires admin JWT (handled by _middleware.ts in this directory)
// Returns: { total, today, thisWeek, uniquePaths, avgSessionMinutes }
// @ts-nocheck

import { jsonResponse, dbGetVisitorStats } from '../../../_shared/utils';

export async function onRequest(context: { request: Request; env: any; next: () => Promise<Response>; ctx: any }): Promise<Response> {
  const { request, env, ctx } = context;
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const stats = await dbGetVisitorStats(env);

  return jsonResponse(stats);
}

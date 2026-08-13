// GET /api/admin/visitors/stats
// Returns visitor statistics
// Requires admin JWT (handled by _middleware.ts in this directory)
// Returns: { total, today, thisWeek, uniquePaths, avgSessionMinutes }
// @ts-nocheck

import { jsonResponse, dbGetVisitorStats } from '../../../_shared/utils';

export default async function handler(request: Request, env: any, ctx: any): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const stats = await dbGetVisitorStats(env);

  return jsonResponse(stats);
}
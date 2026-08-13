// GET /api/admin/visitors/online
// Returns list of visitors active within the last 2 hours
// Requires admin JWT (handled by _middleware.ts in this directory)
// Returns: { visitors: [...] }
// @ts-nocheck

import { jsonResponse, dbGetOnlineVisitors } from '../../../_shared/utils';

export default async function handler(request: Request, env: any, ctx: any): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const visitors = await dbGetOnlineVisitors(env, 2);

  return jsonResponse({
    count: visitors.length,
    visitors,
  });
}
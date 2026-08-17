// GET /api/logs/list
// Returns recent error log list
// Requires admin JWT
// Query params: limit (default 50)
// Returns: { logs: [...] }
// @ts-nocheck

import { jsonResponse, errorResponse, requireAdmin, dbListLogs } from '../../_shared/utils';

export async function onRequest(context: { request: Request; env: any; next: () => Promise<Response>; ctx: any }): Promise<Response> {
  const { request, env, ctx } = context;
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  const payload = await requireAdmin(request, env);
  if (!payload) {
    return errorResponse('Forbidden: admin access required', 403);
  }

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);

  const logs = await dbListLogs(env, Math.min(limit, 200));

  return jsonResponse({
    count: logs.length,
    logs,
  });
}

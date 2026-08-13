// POST /api/visitors/heartbeat
// Records visitor heartbeat for real-time analytics
// Body: { sessionId, path, referrer? }
// Returns: { ok: true }
// @ts-nocheck

import {
  jsonResponse, errorResponse, dbRecordHeartbeat, parseCookies,
} from '../../_shared/utils';

const SESSION_COOKIE = '__session_id';

export default async function handler(request: Request, env: any, ctx: any): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body');
  }

  const cookies = parseCookies(request);
  const sessionId = body?.sessionId || cookies[SESSION_COOKIE] || request.headers.get('X-Session-Id');
  const path = body?.path || request.headers.get('Referer') || '/';
  const referrer = body?.referrer || request.headers.get('Referer') || undefined;

  if (!sessionId) {
    return errorResponse('sessionId is required', 400);
  }

  await dbRecordHeartbeat(env, sessionId, path, referrer);

  return jsonResponse({ ok: true });
}
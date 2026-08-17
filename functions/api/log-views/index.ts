// POST /api/log-views  — 记录一次更新日志页访问
// GET  /api/log-views  — 获取访问统计（公开，用于页面上展示查看次数）
// @ts-nocheck

import {
  jsonResponse, errorResponse, dbRecordLogView, dbGetLogViewStats, parseCookies,
} from '../../_shared/utils';

const SESSION_COOKIE = '__session_id';

export async function onRequest(context: { request: Request; env: any; next: () => Promise<Response>; ctx: any }): Promise<Response> {
  const { request, env, ctx } = context;
  if (request.method === 'POST') {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // body 可选
    }

    const cookies = parseCookies(request);
    const sessionId =
      body?.sessionId ||
      cookies[SESSION_COOKIE] ||
      request.headers.get('X-Session-Id') ||
      'anonymous';
    const path = body?.path || '/log';
    const referrer = body?.referrer || request.headers.get('Referer') || undefined;
    const ua = request.headers.get('User-Agent') || undefined;

    await dbRecordLogView(env, sessionId, path, referrer, ua);

    return jsonResponse({ ok: true });
  }

  if (request.method === 'GET') {
    const stats = await dbGetLogViewStats(env);
    return jsonResponse(stats);
  }

  return errorResponse('Method not allowed', 405);
}

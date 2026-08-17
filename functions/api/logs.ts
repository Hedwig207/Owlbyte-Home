// POST /api/logs
// Frontend error log reporting endpoint
// Body: { level: "error"|"warn"|"info", message, stack?, url?, timestamp? }
// Returns: { ok: true, id: UUID }
// @ts-nocheck

import { jsonResponse, errorResponse, dbStoreLog } from '../../_shared/utils';

const VALID_LEVELS = ['error', 'warn', 'info'];

export async function onRequest(context: { request: Request; env: any; next: () => Promise<Response>; ctx: any }): Promise<Response> {
  const { request, env, ctx } = context;
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body');
  }

  const { level, message, stack, url } = body || {};

  if (!level || !VALID_LEVELS.includes(level)) {
    return errorResponse('Level must be "error", "warn", or "info"');
  }
  if (!message || typeof message !== 'string') {
    return errorResponse('Message is required');
  }

  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  await dbStoreLog(env, {
    id,
    level,
    message,
    stack: stack || undefined,
    url: url || undefined,
    timestamp,
  });

  return jsonResponse({ ok: true, id });
}

// POST /api/subscribers/unsubscribe
// Handles email unsubscription by token
// Body: { token }
// Returns: { message: "退订成功" }
// @ts-nocheck

import {
  jsonResponse, errorResponse, dbUnsubscribe,
} from '../../_shared/utils';

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

  const { token } = body || {};
  if (!token) {
    return errorResponse('Unsubscribe token is required');
  }

  const success = await dbUnsubscribe(env, token);
  if (!success) {
    return errorResponse('Invalid or expired unsubscribe token', 404);
  }

  return jsonResponse({ message: '退订成功' });
}

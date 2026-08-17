// POST /api/subscribers
// Handles new email subscription
// Body: { email, source? }
// Returns: { message: "订阅成功", status: "active" }
// @ts-nocheck

import {
  jsonResponse, errorResponse, isEmailValid, dbAddSubscriber, checkRateLimit,
} from '../../_shared/utils';

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 3600; // 1 hour

export async function onRequest(context: { request: Request; env: any; next: () => Promise<Response>; ctx: any }): Promise<Response> {
  const { request, env, ctx } = context;
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  // Rate limiting by IP
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const rateKey = `rate_${ip}`;
  if (!checkRateLimit(env, rateKey, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW)) {
    return errorResponse('Too many requests. Please try again later.', 429);
  }

  // Bot management check
  const botScore = request.cf?.botManagement?.score;
  if (botScore !== undefined && botScore < 30) {
    return errorResponse('Access denied', 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body');
  }

  const { email, source } = body || {};

  if (!email || !isEmailValid(email)) {
    return errorResponse('Invalid email format');
  }

  const result = await dbAddSubscriber(env, email, source);
  if (!result.success) {
    return errorResponse('Failed to subscribe', 500);
  }

  return jsonResponse({
    message: result.exists ? 'Already subscribed' : '订阅成功',
    status: 'active',
    alreadySubscribed: result.exists,
  }, result.exists ? 200 : 201);
}

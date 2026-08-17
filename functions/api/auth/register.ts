// POST /api/auth/register
// Handles new user registration
// Body: { email, password, displayName }
// Returns: { message: "验证邮件已发送", email }
// @ts-nocheck

import {
  jsonResponse, errorResponse, isEmailValid, hashPassword,
  dbFindUserByEmail, dbCreateUser, dbStoreEmailVerification, isMockMode,
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

  const { email, password, displayName } = body || {};

  if (!email || !isEmailValid(email)) {
    return errorResponse('Invalid email format');
  }
  if (!password || password.length < 8) {
    return errorResponse('Password must be at least 8 characters');
  }
  if (!displayName || displayName.trim().length === 0) {
    return errorResponse('Display name is required');
  }

  const existing = await dbFindUserByEmail(env, email);
  if (existing) {
    return errorResponse('Email already registered', 409);
  }

  const passwordHash = await hashPassword(password);
  const userId = crypto.randomUUID();
  const created = await dbCreateUser(env, {
    id: userId,
    email,
    displayName: displayName.trim(),
    passwordHash,
  });

  if (!created) {
    return errorResponse('Failed to create user', 500);
  }

  const token = crypto.randomUUID();
  await dbStoreEmailVerification(env, email, token);

  return jsonResponse({
    message: isMockMode(env) ? 'Mock: Verification email sent' : '验证邮件已发送',
    email,
  }, 201);
}

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
    return errorResponse('邮箱格式不正确', 400, 'INVALID_EMAIL');
  }
  if (!password || password.length < 8) {
    return errorResponse('密码至少需要 8 个字符', 400, 'WEAK_PASSWORD');
  }
  if (!displayName || displayName.trim().length === 0) {
    return errorResponse('请填写昵称', 400, 'MISSING_DISPLAY_NAME');
  }

  const existing = await dbFindUserByEmail(env, email);
  if (existing) {
    return errorResponse('该邮箱已被注册', 409, 'EMAIL_TAKEN');
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
    message: isMockMode(env)
      ? '注册成功（开发模式：数据存于内存，isolate 回收后会丢失，正式数据库接入前请知悉）'
      : '验证邮件已发送',
    email,
  }, 201);
}

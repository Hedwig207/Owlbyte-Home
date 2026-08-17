// GET /api/auth/verify-email?token=xxx
// Phase C: 从 email_verifications 表校验 token；当前 mock 通过
import { jsonResponse, errorResponse, verifyJWT, type CFEnv } from '../../_shared/utils';

export async function onRequest(context: { request: Request; env: CFEnv; next: () => Promise<Response>; ctx: any }): Promise<Response> {
  const { request, env, ctx } = context;
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    if (!token) {
      return errorResponse('缺少验证 token', 400);
    }

    // Phase C: 查询 D1 email_verifications 表
    // 现阶段 mock：解码 JWT，若有效即视为验证成功
    let payload;
    try {
      payload = await verifyJWT(token, env.JWT_SECRET);
    } catch {
      return errorResponse('验证链接无效或已过期', 400);
    }

    if (!payload) {
      return errorResponse('验证链接无效或已过期', 400);
    }

    return jsonResponse({
      message: '邮箱验证成功',
      email: payload.email,
    });
  } catch (e) {
    const err = e as Error;
    return errorResponse(err.message ?? '验证失败', 500);
  }
}

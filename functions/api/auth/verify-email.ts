// GET /api/auth/verify-email?token=xxx
// Phase C: 从 email_verifications 表校验 token；当前 mock 通过
import { jsonResponse, verifyJwt, type CFEnv } from '@functions/_shared/utils';

export const runtime = 'nodejs';

export default async function handler(request: Request, env: CFEnv): Promise<Response> {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    if (!token) {
      return jsonResponse({ error: '缺少验证 token' }, { status: 400 });
    }

    // Phase C: 查询 D1 email_verifications 表
    // 现阶段 mock：解码 JWT，若有效即视为验证成功
    let payload;
    try {
      payload = await verifyJwt(token, env.JWT_SECRET);
    } catch {
      return jsonResponse({ error: '验证链接无效或已过期' }, { status: 400 });
    }

    return jsonResponse({
      message: '邮箱验证成功',
      email: payload.email,
    });
  } catch (e) {
    const err = e as Error;
    return jsonResponse({ error: err.message ?? '验证失败' }, { status: 500 });
  }
}

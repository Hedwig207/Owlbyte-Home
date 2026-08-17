// POST /api/auth/reset-password
// Body: { token, newPassword }
// Phase C: 查 password_reset_tokens 表；当前 mock 通过
import { jsonResponse, errorResponse, hashPassword, verifyJWT, type CFEnv } from '../../_shared/utils';

export async function onRequest(context: { request: Request; env: CFEnv; next: () => Promise<Response>; ctx: any }): Promise<Response> {
  const { request, env, ctx } = context;
  try {
    const body = await request.json().catch(() => null) as { token?: string; newPassword?: string } | null;
    const { token, newPassword } = body ?? {};

    if (!token || !newPassword) {
      return errorResponse('参数不完整', 400);
    }
    if (newPassword.length < 8) {
      return errorResponse('新密码长度至少 8 位', 400);
    }

    let payload;
    try {
      payload = await verifyJWT(token, env.JWT_SECRET);
    } catch {
      return errorResponse('重置链接无效或已过期', 400);
    }

    if (!payload) {
      return errorResponse('重置链接无效或已过期', 400);
    }

    const hashed = await hashPassword(newPassword);
    // Phase C: UPDATE users SET password_hash = ? WHERE id = ?
    // 现阶段仅日志提示
    if (typeof (env as unknown as Record<string, unknown>).log === 'function') {
      (env as unknown as { log: (msg: string) => void }).log(
        `[mock] reset password for user=${payload.sub} hash=${hashed.slice(0, 16)}…`
      );
    }

    return jsonResponse({ message: '密码重置成功' });
  } catch (e) {
    const err = e as Error;
    return errorResponse(err.message ?? '重置失败', 500);
  }
}

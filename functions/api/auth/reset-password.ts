// POST /api/auth/reset-password
// Body: { token, newPassword }
// Phase C: 查 password_reset_tokens 表；当前 mock 通过
import { jsonResponse, hashPassword, verifyJwt, type CFEnv } from '@functions/_shared/utils';

export const runtime = 'nodejs';

export default async function handler(request: Request, env: CFEnv): Promise<Response> {
  try {
    const body = await request.json().catch(() => null) as { token?: string; newPassword?: string } | null;
    const { token, newPassword } = body ?? {};

    if (!token || !newPassword) {
      return jsonResponse({ error: '参数不完整' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return jsonResponse({ error: '新密码长度至少 8 位' }, { status: 400 });
    }

    let payload;
    try {
      payload = await verifyJwt(token, env.JWT_SECRET);
    } catch {
      return jsonResponse({ error: '重置链接无效或已过期' }, { status: 400 });
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
    return jsonResponse({ error: err.message ?? '重置失败' }, { status: 500 });
  }
}

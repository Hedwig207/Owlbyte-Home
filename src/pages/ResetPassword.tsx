import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { PasswordField } from '@/components/auth/AuthFormFields';
import { api } from '@/lib/api';
import type { ApiRequestError } from '@/lib/api';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('重置链接无效');
    }
  }, [token]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('重置链接无效');
      return;
    }
    if (password !== confirm) {
      setError('两次密码不一致');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => navigate('/login?reset=1'), 2500);
    } catch (err: unknown) {
      const e = err as ApiRequestError;
      setError(e.message || '重置失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="glass-panel rounded-3xl p-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-moon/15 text-moon">
              ✓
            </div>
            <h2 className="display-serif text-2xl font-light text-parchment">密码已重置</h2>
            <p className="mt-3 text-sm text-parchment/60">即将跳转登录页…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-3xl p-8 md:p-10">
          <div className="mb-8 text-center">
            <p className="mono-label text-amber/70">§ 重置密码</p>
            <h1 className="mt-2 display-serif text-3xl font-light text-parchment md:text-4xl">
              设置新密码
            </h1>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <PasswordField value={password} onChange={setPassword} label="新密码" />
            <PasswordField value={confirm} onChange={setConfirm} label="确认新密码" />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  提交中…
                </>
              ) : (
                '确认重置'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-parchment/50">
            想起密码了？{' '}
            <Link to="/login" className="text-amber/80 transition-colors hover:text-amber">
              返回登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
import { useState, FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { EmailField, PasswordField } from '@/components/auth/AuthFormFields';
import { api, setAccessToken } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { ApiRequestError } from '@/lib/api';
import type { LoginResponse } from '@/lib/types';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await api.post<LoginResponse>('/api/auth/login', { email, password });
      setAccessToken(data.accessToken);
      setSession(data.user, data.accessToken);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const e = err as ApiRequestError;
      setError(e.message || '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-3xl p-8 md:p-10">
          <div className="mb-8 text-center">
            <p className="mono-label text-amber/70">§ 守夜人登录</p>
            <h1 className="mt-2 display-serif text-3xl font-light text-parchment md:text-4xl">
              登录 OwlByte
            </h1>
            <p className="mt-2 text-sm text-parchment/50">回到守夜人的观察哨</p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 rounded-2xl border border-moon/30 bg-moon/10 px-4 py-3 text-sm text-moon">
              {success}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <EmailField value={email} onChange={setEmail} error={error ? undefined : undefined} />
            <PasswordField value={password} onChange={setPassword} />

            <div className="flex items-center justify-between text-xs">
              <Link to="/forgot-password" className="text-parchment/50 transition-colors hover:text-amber">
                忘记密码？
              </Link>
              <Link to="/register" className="text-parchment/50 transition-colors hover:text-amber">
                创建账户
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  登录中…
                </>
              ) : (
                '进入观察哨'
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center mono-label text-slate-fog">
          OwlByte · 夜行精密工坊
        </p>
      </div>
    </div>
  );
}
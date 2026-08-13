import { useState, FormEvent, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { EmailField, NicknameField, PasswordField } from '@/components/auth/AuthFormFields';
import { api } from '@/lib/api';
import type { ApiRequestError } from '@/lib/api';

function checkStrength(pwd: string): { score: number; checks: { length: boolean; upper: boolean; lower: boolean; number: boolean } } {
  const checks = {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /\d/.test(pwd),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { score, checks };
}

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const { score, checks } = useMemo(() => checkStrength(password), [password]);

  const matchError = confirm && confirm !== password ? '两次密码不一致' : undefined;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('两次密码不一致');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/register', { email, displayName, password });
      setSent(true);
      setTimeout(() => navigate('/login?pending=1'), 2500);
    } catch (err: unknown) {
      const e = err as ApiRequestError;
      setError(e.message || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="glass-panel rounded-3xl p-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-moon/15 text-moon">
              ✓
            </div>
            <h2 className="display-serif text-2xl font-light text-parchment">验证邮件已发送</h2>
            <p className="mt-3 text-sm text-parchment/60">
              请查收邮箱，点击验证链接完成注册。即将跳转登录页…
            </p>
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
            <p className="mono-label text-amber/70">§ 加入守夜人</p>
            <h1 className="mt-2 display-serif text-3xl font-light text-parchment md:text-4xl">
              创建账户
            </h1>
            <p className="mt-2 text-sm text-parchment/50">在夜间观察，在黎明交付</p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <EmailField value={email} onChange={setEmail} />
            <NicknameField value={displayName} onChange={setDisplayName} />
            <PasswordField value={password} onChange={setPassword} label="密码" />

            {password && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                        i < score
                          ? score <= 1
                            ? 'bg-red-400'
                            : score <= 2
                              ? 'bg-amber-400'
                              : score <= 3
                                ? 'bg-amber'
                                : 'bg-moon'
                          : 'bg-parchment/10'
                      }`}
                    />
                  ))}
                </div>
                <ul className="grid grid-cols-2 gap-1 text-xs">
                  <li className={checks.length ? 'text-moon/80' : 'text-parchment/30'}>
                    ✓ 至少 8 位
                  </li>
                  <li className={checks.upper ? 'text-moon/80' : 'text-parchment/30'}>
                    ✓ 含大写字母
                  </li>
                  <li className={checks.lower ? 'text-moon/80' : 'text-parchment/30'}>
                    ✓ 含小写字母
                  </li>
                  <li className={checks.number ? 'text-moon/80' : 'text-parchment/30'}>
                    ✓ 含数字
                  </li>
                </ul>
              </div>
            )}

            <PasswordField value={confirm} onChange={setConfirm} label="确认密码" error={matchError} />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  注册中…
                </>
              ) : (
                '创建账户'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-parchment/50">
            已有账户？{' '}
            <Link to="/login" className="text-amber/80 transition-colors hover:text-amber">
              前往登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
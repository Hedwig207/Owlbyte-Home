import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { EmailField } from '@/components/auth/AuthFormFields';
import { api } from '@/lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
    } catch {
      // 防止枚举：不暴露任何错误信息
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="glass-panel rounded-3xl p-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber/15 text-amber">
              ✉
            </div>
            <h2 className="display-serif text-2xl font-light text-parchment">重置链接已发送</h2>
            <p className="mt-3 text-sm text-parchment/60">
              如果邮箱已注册，重置链接已发送到你的收件箱。
            </p>
            <Link to="/login" className="btn-ghost mt-6 inline-flex">
              返回登录
            </Link>
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
            <p className="mono-label text-amber/70">§ 找回密码</p>
            <h1 className="mt-2 display-serif text-3xl font-light text-parchment md:text-4xl">
              忘记密码
            </h1>
            <p className="mt-2 text-sm text-parchment/50">
              输入邮箱，我们将发送重置链接
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <EmailField value={email} onChange={setEmail} />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  发送中…
                </>
              ) : (
                '发送重置链接'
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs">
            <Link to="/login" className="text-parchment/50 transition-colors hover:text-amber">
              返回登录
            </Link>
            <Link to="/register" className="text-parchment/50 transition-colors hover:text-amber">
              创建账户
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
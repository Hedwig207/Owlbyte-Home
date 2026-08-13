import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { ApiRequestError } from '@/lib/api';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('验证链接无效');
      return;
    }

    async function verify() {
      try {
        await api.get('/api/auth/verify-email', { auth: false });
        setStatus('success');
        setMessage('邮箱已验证');
        setTimeout(() => navigate('/login?verified=1'), 2500);
      } catch (err: unknown) {
        const e = err as ApiRequestError;
        setStatus('error');
        setMessage(e.message || '验证失败，请稍后重试');
      }
    }

    verify();
  }, [params, navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-3xl p-10 text-center">
          {status === 'verifying' && (
            <>
              <Loader2 className="mx-auto mb-5 h-10 w-10 animate-spin text-amber" />
              <h2 className="display-serif text-2xl font-light text-parchment">正在验证邮箱…</h2>
              <p className="mt-3 text-sm text-parchment/50">请稍候</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-moon/15 text-moon">
                ✓
              </div>
              <h2 className="display-serif text-2xl font-light text-parchment">{message}</h2>
              <p className="mt-3 text-sm text-parchment/60">即将跳转登录页…</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-400">
                ✕
              </div>
              <h2 className="display-serif text-2xl font-light text-parchment">验证失败</h2>
              <p className="mt-3 text-sm text-red-300">{message}</p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="btn-ghost mt-6"
              >
                返回登录
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
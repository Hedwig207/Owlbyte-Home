import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Loader2, Crown, UserCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { RequireAuth } from '@/components/AuthGuard';
import { useAuthStore } from '@/stores/authStore';
import { PasswordField } from '@/components/auth/AuthFormFields';
import { api } from '@/lib/api';
import type { ApiRequestError } from '@/lib/api';

function ProfileContent() {
  const navigate = useNavigate();
  const { user, clear } = useAuthStore();

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  if (!user) return null;

  const onLogout = () => {
    clear();
    navigate('/');
  };

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPwd !== confirmPwd) {
      setPwdError('两次密码不一致');
      return;
    }

    setLoading(true);
    try {
      await api.put('/api/auth/password', {
        currentPassword: currentPwd,
        newPassword: newPwd,
      }, { auth: true });
      setPwdSuccess('密码修改成功');
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (err: unknown) {
      const e = err as ApiRequestError;
      setPwdError(e.message || '修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="pt-28 pb-24">
        <div className="container max-w-3xl">
          <Link
            to="/"
            className="mb-10 inline-flex h-10 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/60 px-4 text-sm text-parchment/80 transition-all duration-300 hover:border-amber/40 hover:bg-amber/5 hover:text-amber"
          >
            <ArrowLeft className="h-4 w-4" />
            回到首页
          </Link>

          <div className="glass-panel rounded-3xl p-8 md:p-10">
            <div className="flex items-start gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-amber/10 text-3xl text-amber">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  <UserCircle className="h-12 w-12" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="display-serif text-3xl font-light text-parchment">
                    {user.displayName}
                  </h1>
                  {user.role === 'admin' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber/15 px-2.5 py-1 text-xs text-amber">
                      <Crown className="h-3 w-3" />
                      admin
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-parchment/60">{user.email}</p>
                <p className="mt-1 mono-label text-slate-fog">
                  注册于 {new Date(user.createdAt).toLocaleDateString()}
                </p>
                {user.emailVerified && (
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-moon/30 bg-moon/10 px-2.5 py-1 text-xs text-moon">
                    ✓ 邮箱已验证
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="glass-panel rounded-3xl p-8">
              <h2 className="mono-label mb-5 text-amber/70">订阅状态</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-parchment/60">当前方案</span>
                  <span className="text-sm text-parchment">免费版</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-parchment/60">状态</span>
                  <span className="inline-flex items-center gap-1 text-sm text-moon">
                    <span className="h-1.5 w-1.5 rounded-full bg-moon animate-pulse" />
                    活跃
                  </span>
                </div>
                <button className="btn-ghost mt-4 w-full">查看订阅详情</button>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-8">
              <h2 className="mono-label mb-5 text-amber/70">修改密码</h2>
              <form onSubmit={onChangePassword} className="space-y-4">
                <PasswordField value={currentPwd} onChange={setCurrentPwd} label="当前密码" />
                <PasswordField value={newPwd} onChange={setNewPwd} label="新密码" />
                <PasswordField value={confirmPwd} onChange={setConfirmPwd} label="确认新密码" />

                {pwdError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                    {pwdError}
                  </div>
                )}
                {pwdSuccess && (
                  <div className="rounded-xl border border-moon/30 bg-moon/10 px-3 py-2 text-xs text-moon">
                    {pwdSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full !py-2 !text-[0.7rem] disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      提交中…
                    </>
                  ) : (
                    '更新密码'
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onLogout}
              className="btn-ghost border-red-500/30 text-red-300 hover:border-red-500/60 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              登出
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function Profile() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
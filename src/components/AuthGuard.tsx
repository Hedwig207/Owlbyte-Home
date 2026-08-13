import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

/**
 * 需登录才能访问的路由守卫
 * 未登录跳 /login?redirect=<原路径>
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrated } = useAuthStore();
  const location = useLocation();

  // 会话未恢复完成时显示占位（防止闪烁）
  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="mono-label text-slate-fog">正在恢复会话…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}

/**
 * 需管理员权限的路由守卫
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, hydrated } = useAuthStore();
  const location = useLocation();

  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="mono-label text-slate-fog">正在恢复会话…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="container py-32 text-center">
        <p className="display-serif text-3xl text-parchment">权限不足</p>
        <p className="mt-3 text-sm text-parchment/60">此页面仅对管理员开放。</p>
      </div>
    );
  }

  return <>{children}</>;
}

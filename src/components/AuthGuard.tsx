import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

function AuthSkeleton() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber/30 border-t-amber" />
        <span className="mono-label text-slate-fog">正在恢复会话…</span>
      </div>
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrated } = useAuthStore();
  const location = useLocation();

  if (!hydrated) {
    return <AuthSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, hydrated } = useAuthStore();
  const location = useLocation();

  if (!hydrated) {
    return <AuthSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
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

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrated } = useAuthStore();
  const location = useLocation();

  if (!hydrated) {
    return <AuthSkeleton />;
  }

  if (isAuthenticated) {
    const from = (location.state as any)?.from || '/';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

export default AuthGuard;

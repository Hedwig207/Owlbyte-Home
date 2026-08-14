import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useErrorLogStore } from '@/stores/errorLogStore';
import { api, setAccessToken, ApiRequestError } from '@/lib/api';
import type { User } from '@/lib/types';

export function useAuth() {
  const { user, isAuthenticated, isAdmin, hydrated, setSession, clear } = useAuthStore();
  const [loading, setLoading] = useState(!hydrated);
  const addLog = useErrorLogStore((s) => s.addLog);

  useEffect(() => {
    if (hydrated) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function restore() {
      try {
        const data = await api.get<User>('/api/auth/me', { auth: true });
        if (cancelled) return;
        setSession(data, useAuthStore.getState().accessToken ?? '');
      } catch (err: unknown) {
        if (cancelled) return;
        const status = err instanceof ApiRequestError ? err.status : (err as any)?.status;
        const code = err instanceof ApiRequestError ? err.code : (err as any)?.code;
        if (code === 'UNAUTHORIZED' || status === 401) {
          clear();
        } else {
          const s = useAuthStore.getState();
          useAuthStore.setState({ ...s, hydrated: true });
        }
        const message = err instanceof Error ? err.message : String(err);
        addLog({ level: 'warn', message: `会话恢复失败: ${message}` });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, [hydrated, setSession, clear, addLog]);

  return { user, isAuthenticated, isAdmin, loading };
}
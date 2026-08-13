import { create } from 'zustand';
import type { User } from '@/lib/types';

type AuthState = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hydrated: boolean; // 启动时是否已尝试恢复会话
  setSession: (user: User, accessToken: string) => void;
  setUser: (user: User) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isAdmin: false,
  hydrated: false,
  setSession: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isAdmin: user.role === 'admin',
      hydrated: true,
    }),
  setUser: (user) =>
    set((s) => ({
      user,
      isAdmin: user.role === 'admin',
      isAuthenticated: s.isAuthenticated,
    })),
  clear: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isAdmin: false,
      hydrated: true,
    }),
}));

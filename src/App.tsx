import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import ProjectsPage from '@/pages/Projects';
import ProjectDetailPage from '@/pages/ProjectDetail';
import WatchmenPage from '@/pages/Watchmen';
import WatchmanHedwigPage from '@/pages/WatchmanHedwig';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommandPalette from '@/components/command/CommandPalette';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useCursorGlow } from '@/hooks/useCursorGlow';
import { useTheme } from '@/hooks/useTheme';
import { useVisitorHeartbeat } from '@/hooks/useVisitorHeartbeat';
import { installErrorHandlers } from '@/lib/browserLog';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import { RequireAuth, RequireAdmin } from '@/components/AuthGuard';

import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import VerifyEmailPage from '@/pages/VerifyEmail';
import ForgotPasswordPage from '@/pages/ForgotPassword';
import ResetPasswordPage from '@/pages/ResetPassword';
import ProfilePage from '@/pages/Profile';
import VisitorsPage from '@/pages/admin/Visitors';
import SettingsDebugPage from '@/pages/SettingsDebug';

const DevLog = lazy(() => import('@/pages/DevLog'));

function CursorGlow() {
  useCursorGlow();
  return <div className="cursor-glow" aria-hidden="true" />;
}

function AppShell() {
  useTheme();
  useVisitorHeartbeat();

  useEffect(() => {
    installErrorHandlers();
  }, []);

  const restoreSession = async () => {
      try {
        const data = await api.get<User>('/api/auth/me');
        useAuthStore.getState().setSession(data, '');
      } catch (e: any) {
        const code = e?.code;
        const status = e?.status;
        if (code === 'UNAUTHORIZED' || status === 401) {
          useAuthStore.getState().clear();
        } else {
          const s = useAuthStore.getState();
          useAuthStore.setState({ ...s, hydrated: true });
        }
      }
    };

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <ErrorBoundary>
      <CursorGlow />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project" element={<ProjectsPage />} />
        <Route path="/project/:id" element={<ProjectDetailPage />} />
        <Route path="/watchman" element={<WatchmenPage />} />
        <Route path="/watchman/hedwig" element={<WatchmanHedwigPage />} />
        <Route path="/log" element={<Suspense fallback={<div className="flex min-h-screen items-center justify-center text-parchment/50">加载中…</div>}><DevLog /></Suspense>} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/visitors"
          element={
            <RequireAdmin>
              <VisitorsPage />
            </RequireAdmin>
          }
        />

        <Route path="/settings" element={<SettingsDebugPage />} />
      </Routes>
      <CommandPalette />
    </ErrorBoundary>
  );
}

export default function App() {
  useEffect(() => {
    if (!document.documentElement.classList.contains('dark') && !document.documentElement.classList.contains('light')) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <Router>
      <AppShell />
    </Router>
  );
}
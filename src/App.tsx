import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import ProjectsPage from '@/pages/Projects';
import ProjectDetailPage from '@/pages/ProjectDetail';
import WatchmenPage from '@/pages/Watchmen';
import WatchmanHedwigPage from '@/pages/WatchmanHedwig';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommandPalette from '@/components/command/CommandPalette';
import { useCursorGlow } from '@/hooks/useCursorGlow';
import { useTheme } from '@/hooks/useTheme';
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
import DevLog from '@/pages/DevLog';

function CursorGlow() {
  useCursorGlow();
  return <div className="cursor-glow" aria-hidden="true" />;
}

function AppShell() {
  useTheme();

  useEffect(() => {
    installErrorHandlers();
  }, []);

  const restoreSession = async () => {
    try {
      const data = await api.get<User>('/api/auth/me', { auth: true });
      useAuthStore.getState().setSession(data, '');
    } catch {
      useAuthStore.getState().clear();
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <>
      <CursorGlow />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project" element={<ProjectsPage />} />
        <Route path="/project/:id" element={<ProjectDetailPage />} />
        <Route path="/watchman" element={<WatchmenPage />} />
        <Route path="/watchman/hedwig" element={<WatchmanHedwigPage />} />
        <Route path="/log" element={<DevLog />} />

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
    </>
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
import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';

const SESSION_KEY = 'owlbyte:visitor_session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const HEARTBEAT_INTERVAL_MS = 30 * 1000;

interface SessionData {
  sessionId: string;
  createdAt: string;
}

function loadOrCreateSession(): string {
  const now = Date.now();
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const data = JSON.parse(raw) as SessionData;
      const createdAt = new Date(data.createdAt).getTime();
      if (now - createdAt < SESSION_TTL_MS) {
        return data.sessionId;
      }
    }
  } catch {
    // ignore
  }
  const sessionId = crypto.randomUUID();
  const data: SessionData = {
    sessionId,
    createdAt: new Date(now).toISOString(),
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
  return sessionId;
}

async function sendHeartbeat(sessionId: string, pathname: string) {
  try {
    await api.post('/api/visitors/heartbeat', {
      sessionId,
      pathname,
    });
  } catch (err) {
    const status = (err as { status?: number })?.status;
    if (status && status >= 400 && status < 500) {
      return;
    }
    // other errors (5xx, network) – silently ignore
  }
}

export function useVisitorHeartbeat() {
  const sessionIdRef = useRef<string | null>(null);
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    if (sessionIdRef.current == null) {
      sessionIdRef.current = loadOrCreateSession();
    }
    const sessionId = sessionIdRef.current;

    const report = () => {
      const pathname = window.location.pathname;
      lastPathRef.current = pathname;
      void sendHeartbeat(sessionId, pathname);
    };

    report();

    const intervalId = setInterval(report, HEARTBEAT_INTERVAL_MS);

    const handleRouteChange = () => {
      const currentPath = window.location.pathname;
      if (currentPath !== lastPathRef.current) {
        lastPathRef.current = currentPath;
        void sendHeartbeat(sessionId, currentPath);
      }
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);
}

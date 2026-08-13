import { create } from 'zustand';
import { api } from '@/lib/api';

export type LogLevel = 'error' | 'warn' | 'info';

export interface ErrorLog {
  id: string;
  level: LogLevel;
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
}

interface ErrorLogState {
  logs: ErrorLog[];
  addLog: (log: Omit<ErrorLog, 'id' | 'timestamp' | 'url'> & { url?: string }) => void;
  clearLogs: () => void;
  exportLogs: () => string;
  syncToBackend: () => Promise<void>;
}

const STORAGE_KEY = 'owlbyte:error_logs';

function loadFromStorage(): ErrorLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as ErrorLog[];
    }
  } catch {
    // ignore
  }
  return [];
}

function persist(logs: ErrorLog[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(-200)));
  } catch {
    // ignore quota errors
  }
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useErrorLogStore = create<ErrorLogState>((set, get) => ({
  logs: loadFromStorage(),

  addLog: (log) => {
    const entry: ErrorLog = {
      id: genId(),
      level: log.level,
      message: log.message,
      stack: log.stack,
      url: log.url ?? window.location.pathname,
      timestamp: new Date().toISOString(),
    };
    set((state) => {
      const next = [...state.logs, entry];
      persist(next);
      return { logs: next };
    });
  },

  clearLogs: () => {
    persist([]);
    set({ logs: [] });
  },

  exportLogs: () => {
    const { logs } = get();
    return JSON.stringify(logs, null, 2);
  },

  syncToBackend: async () => {
    const { logs, clearLogs } = get();
    if (logs.length === 0) return;
    try {
      await api.post('/api/logs', { logs });
      clearLogs();
    } catch {
      // silently fail – we don't want to crash the app
    }
  },
}));
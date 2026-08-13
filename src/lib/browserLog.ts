import { useErrorLogStore } from '@/stores/errorLogStore';

let installed = false;

export function useErrorLog(message: string, details?: unknown, context?: string) {
  const store = useErrorLogStore.getState();
  store.addLog({
    level: 'error',
    message: context ? `[${context}] ${message}` : message,
    stack: details instanceof Error ? details.stack : undefined,
  });
}

export function installErrorHandlers() {
  if (installed) return;
  installed = true;

  window.onerror = (message, source, lineno, colno, error) => {
    const store = useErrorLogStore.getState();
    store.addLog({
      level: 'error',
      message: typeof message === 'string' ? message : message?.toString() ?? 'Unknown error',
      stack: error?.stack,
      url: window.location.pathname,
    });
  };

  window.onunhandledrejection = (event) => {
    const store = useErrorLogStore.getState();
    const reason = event.reason;
    store.addLog({
      level: 'error',
      message:
        typeof reason === 'string'
          ? reason
          : reason?.message ?? 'Unhandled promise rejection',
      stack: reason?.stack,
      url: window.location.pathname,
    });
  };
}
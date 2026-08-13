import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Trash2,
  Download,
  Send,
  Sun,
  Moon,
  Loader2,
  FileJson,
  Database,
  Users,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useErrorLogStore, type ErrorLog } from '@/stores/errorLogStore';
import { useUiStore } from '@/stores/uiStore';
import { useTheme } from '@/hooks/useTheme';
import { CACHE_PREFIX } from '@/lib/consts';

type TabKey = 'logs' | 'settings';

export default function SettingsDebug() {
  const [tab, setTab] = useState<TabKey>('logs');

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="pt-28 pb-24">
        <div className="container max-w-4xl">
          <Link
            to="/"
            className="mb-10 inline-flex h-10 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/60 px-4 text-sm text-parchment/80 transition-all duration-300 hover:border-amber/40 hover:bg-amber/5 hover:text-amber"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>

          <div className="mb-10">
            <p className="mono-label text-amber/70">§ 设置 / 调试</p>
            <h1 className="mt-2 display-serif text-3xl font-light text-parchment md:text-4xl">
              观察哨控制台
            </h1>
          </div>

          <div className="mb-6 flex gap-2 rounded-full border border-parchment/10 bg-ink-800/40 p-1.5">
            <TabBtn active={tab === 'logs'} onClick={() => setTab('logs')}>
              错误日志
            </TabBtn>
            <TabBtn active={tab === 'settings'} onClick={() => setTab('settings')}>
              设置
            </TabBtn>
          </div>

          {tab === 'logs' ? <LogsPanel /> : <SettingsPanel />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full px-5 py-2.5 text-sm transition-all duration-300 ${
        active
          ? 'bg-amber/90 text-ink-900 shadow-inner-amber'
          : 'text-parchment/60 hover:text-parchment'
      }`}
    >
      {children}
    </button>
  );
}

function LogsPanel() {
  const { logs, clearLogs, exportLogs, syncToBackend, addLog } = useErrorLogStore();
  const [exporting, setExporting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const onStorage = () => {
      // 触发重渲染
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleExport = useCallback(() => {
    setExporting(true);
    try {
      const json = exportLogs();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `owlbyte-error-logs-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }, [exportLogs]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      await syncToBackend();
    } finally {
      setSyncing(false);
    }
  }, [syncToBackend]);

  const handleTestLog = () => {
    addLog({
      level: 'info',
      message: '测试日志条目',
    });
  };

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="mono-label text-parchment/50">{logs.length} 条记录</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestLog}
            className="btn-ghost !py-2 !px-3 !text-[0.65rem]"
          >
            测试日志
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={logs.length === 0 || exporting}
            className="btn-ghost !py-2 !px-3 !text-[0.65rem] disabled:opacity-50"
          >
            {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
            导出 JSON
          </button>
          <button
            type="button"
            onClick={handleSync}
            disabled={logs.length === 0 || syncing}
            className="btn-ghost !py-2 !px-3 !text-[0.65rem] disabled:opacity-50"
          >
            {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            上报后端
          </button>
          <button
            type="button"
            onClick={clearLogs}
            disabled={logs.length === 0}
            className="btn-ghost !border-red-500/30 !text-red-300 !py-2 !px-3 !text-[0.65rem] hover:!border-red-500/60 disabled:opacity-50"
          >
            <Trash2 className="h-3 w-3" />
            清除
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="py-16 text-center">
          <FileJson className="mx-auto mb-4 h-10 w-10 text-parchment/20" />
          <p className="mono-label text-slate-fog">暂无错误日志</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {[...logs].reverse().map((log) => (
            <LogItem key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}

function LogItem({ log }: { log: ErrorLog }) {
  const [expanded, setExpanded] = useState(false);

  const levelColor = {
    error: 'border-red-500/40 bg-red-500/10 text-red-300',
    warn: 'border-amber/40 bg-amber/10 text-amber-200',
    info: 'border-moon/40 bg-moon/10 text-moon',
  };

  const monoColor = {
    error: 'text-red-400',
    warn: 'text-amber-400',
    info: 'text-moon',
  };

  return (
    <div className={`rounded-2xl border ${levelColor[log.level]} p-3`}>
      <div className="flex items-start gap-3">
        <span className={`mono-label ${monoColor[log.level]} uppercase`}>
          {log.level}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-parchment/90 break-words">{log.message}</p>
          <div className="mt-1 flex items-center gap-3 text-xs text-parchment/40">
            <span>{new Date(log.timestamp).toLocaleString()}</span>
            <span className="font-mono">{log.url}</span>
          </div>
        </div>
        {log.stack && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="shrink-0 text-xs text-parchment/40 hover:text-parchment/70"
          >
            {expanded ? '收起' : '展开'}
          </button>
        )}
      </div>
      {expanded && log.stack && (
        <pre className="mt-3 overflow-x-auto rounded-lg bg-ink-900/60 p-3 text-xs text-parchment/50">
          {log.stack}
        </pre>
      )}
    </div>
  );
}

function SettingsPanel() {
  const { themeMode, autoNight, setThemeMode, setAutoNight } = useUiStore();
  const { isDark } = useTheme();

  const clearGithubCache = () => {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX.github));
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  };

  const clearVisitorSessions = () => {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX.visitor));
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-8">
      <section>
        <h2 className="mono-label mb-4 text-amber/70">外观</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-parchment/10 bg-ink-800/40 p-4">
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon className="h-5 w-5 text-moon" />
              ) : (
                <Sun className="h-5 w-5 text-amber" />
              )}
              <div>
                <p className="text-sm text-parchment">主题</p>
                <p className="text-xs text-parchment/50">
                  当前：{isDark ? '深色' : '浅色'}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`rounded-full px-4 py-1.5 text-xs transition-all ${
                  themeMode === 'dark'
                    ? 'bg-moon/20 text-moon border border-moon/40'
                    : 'text-parchment/50 hover:text-parchment'
                }`}
              >
                深色
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`rounded-full px-4 py-1.5 text-xs transition-all ${
                  themeMode === 'light'
                    ? 'bg-amber/20 text-amber border border-amber/40'
                    : 'text-parchment/50 hover:text-parchment'
                }`}
              >
                浅色
              </button>
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-parchment/10 bg-ink-800/40 p-4">
            <div>
              <p className="text-sm text-parchment">夜班自动切换</p>
              <p className="text-xs text-parchment/50">22:00 – 06:00 自动启用深色</p>
            </div>
            <div
              role="switch"
              aria-checked={autoNight}
              onClick={() => setAutoNight(!autoNight)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                autoNight ? 'bg-moon' : 'bg-parchment/20'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-parchment transition-transform ${
                  autoNight ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
          </label>
        </div>
      </section>

      <section>
        <h2 className="mono-label mb-4 text-amber/70">数据清理</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={clearGithubCache}
            className="flex items-center gap-3 rounded-2xl border border-parchment/10 bg-ink-800/40 p-4 text-left transition-all hover:border-amber/30 hover:bg-amber/5"
          >
            <Database className="h-5 w-5 text-amber/70" />
            <div>
              <p className="text-sm text-parchment">清除 GitHub 缓存</p>
              <p className="text-xs text-parchment/50">README、Star 等</p>
            </div>
          </button>
          <button
            type="button"
            onClick={clearVisitorSessions}
            className="flex items-center gap-3 rounded-2xl border border-parchment/10 bg-ink-800/40 p-4 text-left transition-all hover:border-amber/30 hover:bg-amber/5"
          >
            <Users className="h-5 w-5 text-moon" />
            <div>
              <p className="text-sm text-parchment">清除访客 Session</p>
              <p className="text-xs text-parchment/50">本地访客数据</p>
            </div>
          </button>
        </div>
      </section>

      <section>
        <h2 className="mono-label mb-4 text-amber/70">版本信息</h2>
        <div className="rounded-2xl border border-parchment/10 bg-ink-800/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-parchment/70">OwlByte Home</span>
            <span className="font-mono text-xs text-parchment/50">v0.0.0</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-parchment/70">构建渠道</span>
            <span className="font-mono text-xs text-parchment/50">nightly</span>
          </div>
        </div>
      </section>
    </div>
  );
}
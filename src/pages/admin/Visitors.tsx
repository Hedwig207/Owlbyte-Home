import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Users, Eye, Globe } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { RequireAdmin } from '@/components/AuthGuard';
import { api } from '@/lib/api';
import type { VisitorOnline, VisitorStats } from '@/lib/types';

function VisitorsContent() {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [online, setOnline] = useState<VisitorOnline[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, onlineData] = await Promise.all([
        api.get<VisitorStats>('/api/admin/visitors/stats', { auth: true }),
        api.get<VisitorOnline[]>('/api/admin/visitors/online', { auth: true }),
      ]);
      setStats(statsData);
      setOnline(onlineData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const maxCount = stats?.last7Days
    ? Math.max(...stats.last7Days.map((d) => d.count), 1)
    : 1;

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="pt-28 pb-24">
        <div className="container max-w-6xl">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/60 px-4 text-sm text-parchment/80 transition-all duration-300 hover:border-amber/40 hover:bg-amber/5 hover:text-amber"
            >
              <ArrowLeft className="h-4 w-4" />
              回到首页
            </Link>
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="btn-ghost !py-2 !px-4 !text-[0.7rem] disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </div>

          <div className="mb-10">
            <p className="mono-label text-amber/70">§ 管理员看板</p>
            <h1 className="mt-2 display-serif text-3xl font-light text-parchment md:text-4xl">
              访客观察哨
            </h1>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <StatCard
              icon={<Eye className="h-5 w-5" />}
              label="在线"
              value={stats?.onlineNow ?? 0}
              accent="amber"
            />
            <StatCard
              icon={<Users className="h-5 w-5" />}
              label="今日"
              value={stats?.today ?? 0}
              accent="moon"
            />
            <StatCard
              icon={<Globe className="h-5 w-5" />}
              label="总访客"
              value={stats?.total ?? 0}
              accent="parchment"
            />
          </div>

          <div className="glass-panel mb-8 rounded-3xl p-6 md:p-8">
            <h2 className="mono-label mb-5 text-amber/70">7 日趋势</h2>
            <div className="flex items-end gap-2 h-36">
              {stats?.last7Days?.map((d) => {
                const h = (d.count / maxCount) * 100;
                const day = new Date(d.date).toLocaleDateString('zh-CN', { weekday: 'short' });
                return (
                  <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs text-parchment/50">{d.count}</span>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-amber/30 to-amber/70 transition-all duration-500"
                      style={{ height: `${Math.max(h, 4)}%` }}
                    />
                    <span className="mono-label text-[0.65rem] text-parchment/40">{day}</span>
                  </div>
                );
              }) ?? Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t bg-parchment/5" style={{ height: '4%' }} />
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 md:p-8">
            <h2 className="mono-label mb-5 text-amber/70">在线用户</h2>
            {online.length === 0 ? (
              <p className="py-10 text-center text-sm text-parchment/50">暂无在线访客</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="mono-label border-b border-parchment/10 text-parchment/50">
                      <th className="pb-3 pr-4">Session ID</th>
                      <th className="pb-3 pr-4">来源路径</th>
                      <th className="pb-3 pr-4">国家</th>
                      <th className="pb-3 pr-4">UA</th>
                      <th className="pb-3">最后活动</th>
                    </tr>
                  </thead>
                  <tbody>
                    {online.map((v) => (
                      <tr
                        key={v.sessionId}
                        className="border-b border-parchment/5 text-parchment/70 transition-colors hover:bg-parchment/5"
                      >
                        <td className="py-3 pr-4 font-mono text-xs text-parchment/90">
                          {v.sessionId.slice(0, 12)}…
                        </td>
                        <td className="py-3 pr-4 text-xs">{v.path ?? '—'}</td>
                        <td className="py-3 pr-4 text-xs">{v.country ?? '—'}</td>
                        <td className="py-3 pr-4 text-xs">{v.uaSummary ?? '—'}</td>
                        <td className="py-3 text-xs text-parchment/50">
                          {new Date(v.lastPingAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: 'amber' | 'moon' | 'parchment';
}) {
  const colorMap = {
    amber: 'text-amber bg-amber/10',
    moon: 'text-moon bg-moon/10',
    parchment: 'text-parchment bg-parchment/10',
  };

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[accent]}`}>
          {icon}
        </div>
        <div>
          <p className="mono-label text-parchment/50">{label}</p>
          <p className="text-2xl font-light text-parchment">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

export default function Visitors() {
  return (
    <RequireAdmin>
      <VisitorsContent />
    </RequireAdmin>
  );
}
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollText, ArrowLeft, ExternalLink, Eye, Users, Plus, Edit3, Bug, Trash2, Cpu } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  CHANGELOG,
  CHANGELOG_STATS,
  getLatestVersion,
  type ChangelogEntry,
  type ChangelogCategory,
  type ChangeItem,
} from '@/data/changelog';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const STATUS_STYLE: Record<ChangelogEntry['status'], { label: string; dot: string; badge: string; node: string }> = {
  released: {
    label: '已发布',
    dot: 'bg-moon',
    badge: 'border-moon/40 bg-moon/10 text-moon',
    node: 'bg-moon ring-moon/30',
  },
  'in-progress': {
    label: '进行中',
    dot: 'bg-amber animate-pulse',
    badge: 'border-amber/40 bg-amber/10 text-amber',
    node: 'bg-amber ring-amber/40 shadow-[0_0_12px_rgba(232,182,90,0.5)]',
  },
  preview: {
    label: '预览',
    dot: 'bg-parchment/50',
    badge: 'border-parchment/30 bg-parchment/5 text-parchment/70',
    node: 'bg-parchment/50 ring-parchment/20',
  },
};

function StatChip({ label, value, accent }: { label: string; value: number | string; accent?: 'amber' | 'moon' }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-parchment/10 bg-ink-800/50 px-3 py-1.5 backdrop-blur-sm">
      <span
        className={cn(
          'font-mono text-sm',
          accent === 'amber' ? 'text-amber' : accent === 'moon' ? 'text-moon' : 'text-parchment'
        )}
      >
        {value}
      </span>
      <span className="mono-label text-slate-fog">{label}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: ChangelogEntry['status'] }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide', s.badge)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  );
}

function TimelineNode({ status }: { status: ChangelogEntry['status'] }) {
  const s = STATUS_STYLE[status];
  return (
    <div className="relative flex h-full flex-col items-center">
      <div className="h-full w-px bg-gradient-to-b from-parchment/20 via-parchment/10 to-transparent" />
      <div className={cn('absolute top-0 h-3.5 w-3.5 -translate-y-0.5 rounded-full ring-4', s.node)} />
    </div>
  );
}

// MC Wiki 风格栏目定义
const SECTION_META: Record<string, { label: string; icon: any; accent: string; line: string; bullet: string }> = {
  overview: { label: '版本简介', icon: ScrollText, accent: 'text-amber', line: 'from-amber/40', bullet: 'bg-amber' },
  additions: { label: '新增内容', icon: Plus, accent: 'text-emerald-400', line: 'from-emerald-400/40', bullet: 'bg-emerald-400' },
  changes: { label: '特性更改', icon: Edit3, accent: 'text-sky-400', line: 'from-sky-400/40', bullet: 'bg-sky-400' },
  fixes: { label: '漏洞修复', icon: Bug, accent: 'text-rose-400', line: 'from-rose-400/40', bullet: 'bg-rose-400' },
  removals: { label: '移除内容', icon: Trash2, accent: 'text-purple-400', line: 'from-purple-400/40', bullet: 'bg-purple-400' },
  technical: { label: '技术性更改', icon: Cpu, accent: 'text-moon', line: 'from-moon/40', bullet: 'bg-moon' },
};

function ChangelogCard({ entry }: { entry: ChangelogEntry }) {
  const sections: Array<{ key: string; cats?: ChangelogCategory[] }> = [
    { key: 'additions', cats: entry.additions },
    { key: 'changes', cats: entry.changes },
    { key: 'fixes', cats: entry.fixes },
    { key: 'removals', cats: entry.removals },
    { key: 'technical', cats: entry.technical },
  ];

  const renderItems = (items: ChangeItem[]) => (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="rounded-lg border border-parchment/[0.06] bg-parchment/[0.02] p-3.5 transition-colors hover:border-parchment/10">
          <div className="flex flex-wrap items-baseline gap-2">
            {item.scope && (
              <span className="mono-label rounded border border-parchment/12 bg-ink-800/60 px-1.5 py-0.5 text-parchment/60">
                {item.scope}
              </span>
            )}
            <p className="text-sm text-parchment/90">{item.description}</p>
          </div>
          {item.details && item.details.length > 0 && (
            <ul className="mt-2 space-y-1 pl-5">
              {item.details.map((d, j) => (
                <li key={j} className="flex items-start gap-2 text-xs text-parchment/60">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-parchment/30" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );

  const renderSection = (key: string, cats?: ChangelogCategory[]) => {
    if (!cats || cats.length === 0) return null;
    const meta = SECTION_META[key];
    if (!meta) return null;
    const Icon = meta.icon;

    return (
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-3">
          <div className={cn('inline-flex h-8 w-8 items-center justify-center rounded-lg border border-parchment/10 bg-ink-800/60', meta.accent)}>
            <Icon className="h-4 w-4" />
          </div>
          <h3 className={cn('display-serif text-xl font-light md:text-2xl', meta.accent)}>
            {meta.label}
          </h3>
          <div className={cn('h-px flex-1 bg-gradient-to-r via-parchment/10 to-transparent', meta.line)} />
        </div>

        <div className="space-y-6 pl-2 md:pl-4">
          {cats.map((cat, ci) => (
            <div key={ci}>
              {cat.heading && (
                <div className="mb-3 flex items-center gap-2">
                  <span className={cn('h-1.5 w-1.5 rounded-full', meta.bullet)} />
                  <p className="mono-label text-[0.7rem] uppercase tracking-wider text-parchment/50">
                    {cat.heading}
                  </p>
                </div>
              )}
              {renderItems(cat.items)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex gap-6">
      <div className="w-6 flex-shrink-0">
        <TimelineNode status={entry.status} />
      </div>

      <div className="glass-panel group mb-10 flex-1 rounded-2xl p-6 transition-all duration-500 hover:border-amber/20 md:p-8">
        {/* 版本元信息栏 */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-parchment/8 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-lg font-medium text-parchment md:text-xl">{entry.version}</span>
            <StatusBadge status={entry.status} />
            {entry.codename && (
              <span className="mono-label rounded-md border border-parchment/10 bg-parchment/5 px-2 py-0.5 text-parchment/60">
                {entry.codename}
              </span>
            )}
          </div>
          <time className="mono-label text-slate-fog" dateTime={entry.date}>
            {entry.date}
          </time>
        </div>

        <h2 className="display-serif mt-5 text-2xl font-light text-parchment md:text-3xl">
          {entry.title}
        </h2>

        {/* 版本简介（MC Wiki 顶部 About） */}
        {entry.overview && (
          <div className="mt-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-parchment/10 bg-ink-800/60 text-amber">
                <ScrollText className="h-4 w-4" />
              </div>
              <h3 className="display-serif text-xl font-light text-amber md:text-2xl">
                版本简介
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-amber/40 via-parchment/10 to-transparent" />
            </div>
            <div className="rounded-xl border border-amber/20 bg-amber/[0.04] p-5 pl-6">
              <p className="text-sm leading-relaxed text-parchment/85 md:text-base">
                {entry.overview}
              </p>
            </div>
          </div>
        )}

        {/* 各栏目 */}
        {sections.map(s => renderSection(s.key, s.cats))}

        {/* 参考链接 */}
        {(entry.author || (entry.links && entry.links.length > 0)) && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-parchment/8 pt-5">
            <p className="mono-label text-slate-fog">
              — {entry.author ?? 'Hedwig'}
            </p>
            {entry.links && entry.links.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {entry.links.map((l, i) => (
                  <a
                    key={i}
                    href={l.href}
                    target={l.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="btn-ghost !py-1.5 !px-3 !text-[0.65rem]"
                  >
                    {l.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface LogViewStats {
  total: number;
  today: number;
  thisWeek: number;
  uniqueVisitors: number;
  recent: Array<{ timestamp: string; sessionId: string; referrer?: string; ua?: string }>;
}

const SESSION_KEY = 'owlbyte:visitor_session';
const VISIT_KEY = 'owlbyte:log_visits';

function getVisitorSession(): string {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data?.sessionId) return data.sessionId;
    }
    const newId = crypto.randomUUID?.() || String(Date.now()) + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ sessionId: newId, createdAt: new Date().toISOString() }));
    return newId;
  } catch {
    return 'anonymous';
  }
}

function recordLocalVisit(sessionId: string): string[] {
  try {
    const visits: string[] = JSON.parse(localStorage.getItem(VISIT_KEY) || '[]');
    visits.push(new Date().toISOString());
    if (visits.length > 5000) visits.shift();
    localStorage.setItem(VISIT_KEY, JSON.stringify(visits));
  } catch {
    // ignore
  }
  return JSON.parse(localStorage.getItem(VISIT_KEY) || '[]');
}

function computeLocalStats(sessionId: string): LogViewStats {
  let visits: string[] = [];
  try {
    visits = JSON.parse(localStorage.getItem(VISIT_KEY) || '[]');
  } catch {
    // ignore
  }
  const now = Date.now();
  const dayAgo = new Date(now - 24 * 3600 * 1000).toISOString();
  const weekAgo = new Date(now - 7 * 24 * 3600 * 1000).toISOString();
  const ua = navigator.userAgent;
  return {
    total: visits.length,
    today: visits.filter(v => v > dayAgo).length,
    thisWeek: visits.filter(v => v > weekAgo).length,
    uniqueVisitors: 1,
    recent: visits.slice(-8).reverse().map(t => ({
      timestamp: t,
      sessionId,
      referrer: document.referrer || undefined,
      ua,
    })),
  };
}

function formatUa(ua?: string): string {
  if (!ua) return '未知';
  if (/mobile|android|iphone/i.test(ua)) return '移动端';
  if (/mac/i.test(ua)) return 'macOS';
  if (/windows/i.test(ua)) return 'Windows';
  if (/linux/i.test(ua)) return 'Linux';
  return '桌面端';
}

function timeAgo(iso?: string): string {
  if (!iso) return '未知';
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '刚刚';
  if (min < 60) return `${min} 分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小时前`;
  const day = Math.floor(hr / 24);
  return `${day} 天前`;
}

function ViewStatsBar({ stats, loading }: { stats: LogViewStats | null; loading: boolean }) {
  if (loading && !stats) {
    return (
      <div className="mb-8 rounded-2xl border border-parchment/10 bg-ink-800/30 p-5 backdrop-blur-sm animate-pulse">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-parchment/20" />
              <span className="h-5 w-10 rounded bg-parchment/10" />
              <span className="mono-label text-parchment/20">加载中</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="mb-8 rounded-2xl border border-parchment/10 bg-ink-800/30 p-5 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-parchment/30" />
            <span className="font-mono text-sm text-parchment/30">--</span>
            <span className="mono-label text-slate-fog">总浏览</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-parchment/30">--</span>
            <span className="mono-label text-slate-fog">今日</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-parchment/30">--</span>
            <span className="mono-label text-slate-fog">本周</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-parchment/20" />
            <span className="font-mono text-xs text-parchment/30">--</span>
            <span className="mono-label text-slate-fog">独立访客</span>
          </div>
        </div>
        <p className="mono-label mt-3 text-parchment/30 text-[0.65rem]">
          访问统计暂时不可用 · 本次访问已被本地记录
        </p>      </div>
    );
  }

  return (
    <div className="mb-8 rounded-2xl border border-parchment/10 bg-ink-800/30 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-amber" />
          <span className="font-mono text-lg text-parchment">{stats.total}</span>
          <span className="mono-label text-slate-fog">总浏览</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-moon">{stats.today}</span>
          <span className="mono-label text-slate-fog">今日</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-moon">{stats.thisWeek}</span>
          <span className="mono-label text-slate-fog">本周</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-amber/70" />
          <span className="font-mono text-sm text-parchment/80">{stats.uniqueVisitors}</span>
          <span className="mono-label text-slate-fog">独立访客</span>
        </div>
      </div>

      {stats.recent && stats.recent.length > 0 && (
        <div className="mt-4 border-t border-parchment/8 pt-4">
          <p className="mono-label mb-2 text-parchment/40">近期访问</p>
          <div className="flex flex-wrap gap-2">
            {stats.recent.slice(0, 8).map((v, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full border border-parchment/8 bg-ink-900/50 px-2.5 py-1 font-mono text-[0.65rem] text-parchment/50"
                title={`${(v.sessionId || '').slice(0, 8)}… · ${v.referrer || '直接访问'}`}
              >
                <span className="h-1 w-1 rounded-full bg-amber/60" />
                {formatUa(v.ua)}
                <span className="text-parchment/30">·</span>
                {timeAgo(v.timestamp)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DevLog() {
  const latest = getLatestVersion();
  const showBanner = latest?.status !== 'released';
  const [viewStats, setViewStats] = useState<LogViewStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });

    const sessionId = getVisitorSession();
    recordLocalVisit(sessionId);

    api.post('/api/log-views', {
      sessionId,
      path: '/log',
      referrer: document.referrer || undefined,
    }).catch(() => {
      // 静默失败
    });

    api.get<LogViewStats>('/api/log-views')
      .then(setViewStats)
      .catch(() => {
        setViewStats(computeLocalStats(sessionId));
      })
      .finally(() => setStatsLoading(false));
  }, []);

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
            回到首页
          </Link>

          <section className="mb-10">
            <div className="glass-panel rounded-3xl p-8 md:p-12">
              <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                <div className="max-w-xl">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber/10 text-amber">
                    <ScrollText className="h-6 w-6" />
                  </div>
                  <p className="mono-label text-amber/70">§ Changelog</p>
                  <h1 className="mt-3 display-serif text-4xl font-light text-parchment md:text-6xl">
                    更新日志
                  </h1>
                  <p className="mt-5 text-sm leading-relaxed text-parchment/60 md:text-base">
                    每一次交付，都刻在羊皮纸上。
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 md:max-w-xs md:justify-end">
                  <StatChip label="总版本" value={CHANGELOG_STATS?.totalVersions ?? 0} accent="amber" />
                  <StatChip label="已发布" value={CHANGELOG_STATS?.releasedCount ?? 0} accent="moon" />
                  <StatChip label="进行中" value={CHANGELOG_STATS?.inProgressCount ?? 0} accent="amber" />
                  <StatChip label="总改动" value={CHANGELOG_STATS?.totalChanges ?? 0} />
                  <StatChip label="feat" value={CHANGELOG_STATS?.totalFeats ?? 0} accent="amber" />
                  <StatChip label="fix" value={CHANGELOG_STATS?.totalFixes ?? 0} accent="moon" />
                </div>
              </div>
            </div>
          </section>

          <ViewStatsBar stats={viewStats} loading={statsLoading} />

          {showBanner && (
            <section className="mb-12">
              <div className="relative overflow-hidden rounded-2xl border border-amber/30 bg-gradient-to-r from-amber/10 via-amber/[0.07] to-transparent p-5 backdrop-blur-sm">
                <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-amber/20 blur-3xl" />
                <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-amber" />
                    </span>
                    <div>
                      <p className="mono-label text-amber/70">正在进行</p>
                      <p className="display-serif text-lg text-parchment md:text-xl">
                        {latest?.version} · {latest?.title}
                      </p>
                    </div>
                  </div>
                  {latest?.codename && (
                    <span className="mono-label self-start rounded-md border border-amber/30 bg-amber/10 px-2.5 py-1 text-amber/90 md:self-auto">
                      {latest?.codename}
                    </span>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className="relative">
            {(CHANGELOG || []).map((entry) => (
              <ChangelogCard key={entry.version} entry={entry} />
            ))}

            <div className="ml-[1.5rem] mt-2 border-l border-parchment/10 pl-8 pb-4">
              <p className="mono-label text-parchment/30">— 2026 年 8 月 · 羊皮卷启 —</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

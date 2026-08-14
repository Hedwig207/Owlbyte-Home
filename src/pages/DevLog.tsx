import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollText, ArrowLeft, ExternalLink, Eye, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CHANGELOG, CHANGELOG_STATS, getLatestVersion, type ChangelogEntry } from '@/data/changelog';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const TYPE_LABEL: Record<ChangelogEntry['changes'][number]['type'], string> = {
  feat: 'feat',
  fix: 'fix',
  refactor: 'refactor',
  perf: 'perf',
  docs: 'docs',
  chore: 'chore',
  design: 'design',
};

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

function ChangelogCard({ entry }: { entry: ChangelogEntry }) {
  const grouped = entry.changes.reduce<Record<string, typeof entry.changes>>((acc, c) => {
    (acc[c.type] ||= []).push(c);
    return acc;
  }, {});

  const typeOrder: ChangelogEntry['changes'][number]['type'][] = ['feat', 'fix', 'refactor', 'perf', 'design', 'docs', 'chore'];

  return (
    <div className="relative flex gap-6">
      <div className="w-6 flex-shrink-0">
        <TimelineNode status={entry.status} />
      </div>

      <div className="glass-panel group mb-10 flex-1 rounded-2xl p-6 transition-all duration-500 hover:border-amber/20 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
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

        <h2 className="display-serif mt-4 text-2xl font-light text-parchment md:text-3xl">
          {entry.title}
        </h2>

        {entry.highlights && entry.highlights.length > 0 && (
          <div className="mt-5 rounded-xl border border-amber/20 bg-amber/[0.04] p-4">
            <p className="mono-label mb-2 text-amber/80">核心亮点</p>
            <ul className="space-y-1.5">
              {entry.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-parchment/85">
                  <span className="mt-0.5 text-amber">·</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 space-y-5">
          {typeOrder.map((t) =>
            grouped[t] ? (
              <div key={t}>
                <p className="mono-label mb-2.5 flex items-center gap-1.5 text-parchment/50">
                  <span className="rounded bg-ink-800/60 px-1.5 py-0.5 text-parchment/70">
                    [{TYPE_LABEL[t]}]
                  </span>
                  <span className="text-parchment/20">· {grouped[t].length}</span>
                </p>
                <ul className="space-y-3">
                  {grouped[t].map((c, i) => (
                    <li key={i} className="rounded-lg border border-parchment/[0.06] bg-parchment/[0.02] p-3.5 transition-colors hover:border-parchment/10">
                      <div className="flex flex-wrap items-baseline gap-2">
                        {c.scope && (
                          <span className="mono-label rounded border border-parchment/12 bg-ink-800/60 px-1.5 py-0.5 text-parchment/60">
                            {c.scope}
                          </span>
                        )}
                        <p className="text-sm text-parchment/90">{c.description}</p>
                      </div>
                      {c.details && c.details.length > 0 && (
                        <ul className="mt-2 space-y-1 pl-5">
                          {c.details.map((d, j) => (
                            <li key={j} className="flex items-start gap-2 text-xs text-parchment/60">
                              <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-parchment/30" />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null
          )}
        </div>

        {(entry.author || entry.links) && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-parchment/8 pt-5">
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

function getVisitorSession(): string {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data?.sessionId) return data.sessionId;
    }
  } catch {
    // ignore
  }
  return 'anonymous';
}

function formatUa(ua?: string): string {
  if (!ua) return '未知';
  if (/mobile|android|iphone/i.test(ua)) return '移动端';
  if (/mac/i.test(ua)) return 'macOS';
  if (/windows/i.test(ua)) return 'Windows';
  if (/linux/i.test(ua)) return 'Linux';
  return '桌面端';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '刚刚';
  if (min < 60) return `${min} 分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小时前`;
  const day = Math.floor(hr / 24);
  return `${day} 天前`;
}

function ViewStatsBar({ stats }: { stats: LogViewStats | null }) {
  if (!stats) return null;
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

      {stats.recent.length > 0 && (
        <div className="mt-4 border-t border-parchment/8 pt-4">
          <p className="mono-label mb-2 text-parchment/40">近期访问</p>
          <div className="flex flex-wrap gap-2">
            {stats.recent.slice(0, 8).map((v, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full border border-parchment/8 bg-ink-900/50 px-2.5 py-1 font-mono text-[0.65rem] text-parchment/50"
                title={`${v.sessionId.slice(0, 8)}… · ${v.referrer || '直接访问'}`}
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
  const showBanner = latest.status !== 'released';
  const [viewStats, setViewStats] = useState<LogViewStats | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });

    // 记录本次访问
    const sessionId = getVisitorSession();
    api.post('/api/log-views', {
      sessionId,
      path: '/log',
      referrer: document.referrer || undefined,
    }).catch(() => {
      // 静默失败，不影响页面
    });

    // 拉取访问统计
    api.get<LogViewStats>('/api/log-views')
      .then(setViewStats)
      .catch(() => {
        // 静默失败
      });
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
                  <StatChip label="总版本" value={CHANGELOG_STATS.totalVersions} accent="amber" />
                  <StatChip label="已发布" value={CHANGELOG_STATS.releasedCount} accent="moon" />
                  <StatChip label="进行中" value={CHANGELOG_STATS.inProgressCount} accent="amber" />
                  <StatChip label="总改动" value={CHANGELOG_STATS.totalChanges} />
                  <StatChip label="feat" value={CHANGELOG_STATS.totalFeats} accent="amber" />
                  <StatChip label="fix" value={CHANGELOG_STATS.totalFixes} accent="moon" />
                </div>
              </div>
            </div>
          </section>

          <ViewStatsBar stats={viewStats} />

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
                        {latest.version} · {latest.title}
                      </p>
                    </div>
                  </div>
                  {latest.codename && (
                    <span className="mono-label self-start rounded-md border border-amber/30 bg-amber/10 px-2.5 py-1 text-amber/90 md:self-auto">
                      {latest.codename}
                    </span>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className="relative">
            {CHANGELOG.map((entry) => (
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

import { Star, GitFork, Clock, AlertTriangle, Loader2, Github } from 'lucide-react';
import { useGitHubRepo } from '@/hooks/useGitHubRepo';
import { cn } from '@/lib/utils';

type RepoMeta = {
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  updatedAt: string;
  description: string | null;
  htmlUrl: string;
};

interface Props {
  repo: string;
  accent?: 'amber' | 'moon';
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return '今日';
  if (days < 30) return `${days} 天前`;
  if (days < 365) return `${Math.floor(days / 30)} 月前`;
  return `${Math.floor(days / 365)} 年前`;
}

export default function RepoMetaBar({ repo, accent = 'amber' }: Props) {
  const { data, loading, error } = useGitHubRepo<RepoMeta>(
    repo,
    '',
    (raw) => ({
      stargazersCount: raw.stargazers_count ?? 0,
      forksCount: raw.forks_count ?? 0,
      openIssuesCount: raw.open_issues_count ?? 0,
      updatedAt: raw.updated_at ?? '',
      description: raw.description ?? null,
      htmlUrl: raw.html_url ?? '',
    }),
  );

  const isMoon = accent === 'moon';
  const accentText = isMoon ? 'text-moon' : 'text-amber';

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-parchment/10 bg-ink-800/40 p-4">
        <Loader2 className="h-4 w-4 animate-spin text-slate-fog" />
        <span className="mono-label text-slate-mist">连接 GitHub…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-parchment/10 bg-ink-800/40 p-4 text-sm text-parchment/60">
        <AlertTriangle className="h-4 w-4 text-amber/70" />
        <span>GitHub 数据暂不可达</span>
        <a
          href={`https://github.com/Hedwig207/${repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn('ml-auto inline-flex items-center gap-1.5 text-xs hover:text-parchment', accentText)}
        >
          <Github className="h-3.5 w-3.5" />
          访问仓库
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-parchment/10 bg-ink-800/40 p-4 md:gap-6">
      <a
        href={data.htmlUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 transition-colors hover:text-parchment"
      >
        <Github className={cn('h-5 w-5', accentText)} />
        <span className="font-mono text-sm text-parchment">Hedwig207/{repo}</span>
      </a>

      <span className="h-4 w-px bg-parchment/10" />

      <span className="inline-flex items-center gap-1.5" title="Stars">
        <Star className={cn('h-4 w-4', accentText)} />
        <span className="font-mono text-sm text-parchment">{data.stargazersCount}</span>
      </span>

      <span className="inline-flex items-center gap-1.5" title="Forks">
        <GitFork className={cn('h-4 w-4', accentText)} />
        <span className="font-mono text-sm text-parchment">{data.forksCount}</span>
      </span>

      <span className="inline-flex items-center gap-1.5" title="最近更新">
        <Clock className="h-4 w-4 text-slate-fog" />
        <span className="font-mono text-xs text-slate-mist">
          {data.updatedAt ? formatRelative(data.updatedAt) : '—'}
        </span>
      </span>

      {data.description && (
        <span className="ml-auto hidden max-w-md truncate text-xs text-parchment/50 md:inline-block">
          {data.description}
        </span>
      )}
    </div>
  );
}

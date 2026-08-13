import { GitCommit, AlertTriangle, Loader2, ArrowUpRight } from 'lucide-react';
import { useGitHubRepo } from '@/hooks/useGitHubRepo';
import { cn } from '@/lib/utils';

type CommitItem = {
  sha: string;
  shortSha: string;
  message: string;
  authorName: string;
  authorLogin: string | null;
  date: string;
  htmlUrl: string;
};

interface Props {
  repo: string;
  accent?: 'amber' | 'moon';
  limit?: number;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

export default function RecentCommits({ repo, accent = 'amber', limit = 5 }: Props) {
  const { data, loading, error } = useGitHubRepo<CommitItem[]>(
    repo,
    `/commits?per_page=${limit}`,
    (raw) =>
      (raw ?? []).map((c: any) => ({
        sha: c.sha ?? '',
        shortSha: (c.sha ?? '').slice(0, 7),
        message: (c.commit?.message ?? '').split('\n')[0],
        authorName: c.commit?.author?.name ?? 'unknown',
        authorLogin: c.author?.login ?? null,
        date: c.commit?.author?.date ?? '',
        htmlUrl: c.html_url ?? '',
      })),
  );

  const isMoon = accent === 'moon';
  const accentText = isMoon ? 'text-moon' : 'text-amber';

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-mist">
        <Loader2 className="h-4 w-4 animate-spin" />
        拉取近期提交…
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="flex items-center gap-3 text-sm text-parchment/60">
        <AlertTriangle className="h-4 w-4 text-amber/70" />
        提交记录暂不可达
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {data.map((c) => (
        <li key={c.sha}>
          <a
            href={c.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 rounded-xl border border-parchment/8 bg-ink-900/40 p-3 transition-all duration-300 hover:border-parchment/20 hover:bg-ink-800/60"
          >
            <GitCommit className={cn('mt-0.5 h-4 w-4 shrink-0', accentText)} />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm text-parchment group-hover:text-parchment">
                {c.message}
              </p>
              <div className="mt-1 flex items-center gap-3 font-mono text-[0.65rem] text-slate-fog">
                <span className={accentText}>{c.shortSha}</span>
                <span>·</span>
                <span>{c.authorLogin ? `@${c.authorLogin}` : c.authorName}</span>
                <span>·</span>
                <span>{c.date ? formatDate(c.date) : ''}</span>
              </div>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-fog transition-all group-hover:text-parchment group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </li>
      ))}
    </ul>
  );
}

import { Tag, AlertTriangle, Loader2, Download, ArrowUpRight } from 'lucide-react';
import { useGitHubRepo } from '@/hooks/useGitHubRepo';
import { cn } from '@/lib/utils';

type ReleaseItem = {
  tagName: string;
  name: string;
  publishedAt: string;
  htmlUrl: string;
  isPrerelease: boolean;
  zipUrl: string;
  tarUrl: string;
};

interface Props {
  repo: string;
  accent?: 'amber' | 'moon';
  limit?: number;
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ReleasesList({ repo, accent = 'amber', limit = 5 }: Props) {
  const { data, loading, error } = useGitHubRepo<ReleaseItem[]>(
    repo,
    `/releases?per_page=${limit}`,
    (raw) =>
      (raw ?? []).map((r: any) => ({
        tagName: r.tag_name ?? '',
        name: r.name ?? r.tag_name ?? '',
        publishedAt: r.published_at ?? '',
        htmlUrl: r.html_url ?? '',
        isPrerelease: r.prerelease ?? false,
        zipUrl: r.zipball_url ?? '',
        tarUrl: r.tarball_url ?? '',
      })),
  );

  const isMoon = accent === 'moon';
  const accentText = isMoon ? 'text-moon' : 'text-amber';
  const accentBorder = isMoon ? 'hover:border-moon/40' : 'hover:border-amber/40';

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-mist">
        <Loader2 className="h-4 w-4 animate-spin" />
        拉取发行版…
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-parchment/10 bg-ink-900/40 p-4 text-sm text-parchment/60">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber/70" />
          <span>暂无发行版</span>
        </div>
        <a
          href={`https://github.com/Hedwig207/${repo}/releases`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn('inline-flex items-center gap-1.5 text-xs hover:text-parchment', accentText)}
        >
          访问 Releases 页
          <ArrowUpRight className="h-3 w-3" />
        </a>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {data.map((r) => (
        <li
          key={r.tagName}
          className={cn(
            'group flex flex-wrap items-center gap-3 rounded-xl border border-parchment/8 bg-ink-900/40 p-4 transition-all duration-300 hover:-translate-y-0.5',
            accentBorder,
          )}
        >
          <Tag className={cn('h-4 w-4 shrink-0', accentText)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-parchment">{r.tagName}</span>
              {r.isPrerelease && (
                <span className="rounded-full border border-amber/30 bg-amber/10 px-2 py-0.5 font-mono text-[0.55rem] uppercase text-amber">
                  预发布
                </span>
              )}
            </div>
            {r.name && r.name !== r.tagName && (
              <p className="mt-0.5 truncate text-xs text-parchment/60">{r.name}</p>
            )}
            <p className="mt-1 font-mono text-[0.65rem] text-slate-fog">
              {r.publishedAt ? formatDate(r.publishedAt) : '未发布'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={r.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-parchment/10 px-3 text-xs text-parchment/80 transition-colors hover:border-parchment/30 hover:text-parchment"
              title="查看发行说明"
            >
              <ArrowUpRight className="h-3 w-3" />
              说明
            </a>
            <a
              href={r.zipUrl}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-parchment/10 px-3 text-xs text-parchment/80 transition-colors hover:border-amber/40 hover:text-amber"
              title="下载 zip"
            >
              <Download className="h-3 w-3" />
              zip
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}

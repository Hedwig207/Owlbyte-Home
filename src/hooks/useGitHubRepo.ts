import { useEffect, useState } from 'react';
import { GITHUB_OWNER } from '@/lib/consts';
import { repoUrl, readCache, writeCache, ghCacheKey } from '@/lib/github';

type State<T> = {
  data: T | null;
  loading: boolean;
  error: boolean;
};

/**
 * 通用 GitHub 数据 hook：复用 useGitHubStats 的缓存模式
 * 1 小时 localStorage 缓存 + 失败回退 null
 */
export function useGitHubRepo<T>(
  repo: string,
  suffix: string,
  transform: (raw: any) => T,
): State<T> {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: false });

  useEffect(() => {
    let cancelled = false;
    const cacheKey = ghCacheKey(`${GITHUB_OWNER}/${repo}${suffix}`);

    async function load() {
      // 1. 读缓存
      const cached = readCache<T>(cacheKey);
      if (cached != null) {
        if (!cancelled) setState({ data: cached, loading: false, error: false });
        return;
      }

      // 2. 请求 GitHub API
      try {
        const res = await fetch(repoUrl(GITHUB_OWNER, repo, suffix));
        if (!res.ok) throw new Error(`github api ${res.status}`);
        const raw = await res.json();
        const data = transform(raw);
        writeCache(cacheKey, data);
        if (!cancelled) setState({ data, loading: false, error: false });
      } catch {
        if (!cancelled) setState({ data: null, loading: false, error: true });
      }
    }

    load();
    return () => { cancelled = true; };
  }, [repo, suffix]);

  return state;
}

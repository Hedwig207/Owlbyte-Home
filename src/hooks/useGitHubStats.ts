import { useEffect, useState } from 'react';

/**
 * 从 GitHub API 获取账号统计数据（followers 等）
 * 带 1 小时 localStorage 缓存，避免触发未认证速率限制（60/小时/IP）
 */
type GitHubStats = {
  followers: number | null;
  loading: boolean;
  error: boolean;
};

const CACHE_KEY = 'owlbyte:github_stats';
const CACHE_TTL = 1000 * 60 * 60; // 1 小时

export function useGitHubStats(username = 'Hedwig207'): GitHubStats {
  const [followers, setFollowers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 1. 读取缓存
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw);
          if (cached?.v != null && Date.now() - cached.t < CACHE_TTL) {
            if (!cancelled) {
              setFollowers(cached.v);
              setLoading(false);
            }
            return;
          }
        }
      } catch {
        // 缓存损坏 → 走网络
      }

      // 2. 请求 GitHub API
      try {
        const res = await fetch(`https://api.github.com/users/${username}`);
        if (!res.ok) throw new Error(`github api ${res.status}`);
        const data = await res.json();
        const f = typeof data.followers === 'number' ? data.followers : null;
        if (f != null) {
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ v: f, t: Date.now() }));
          } catch {
            // 存储满或被禁用 → 忽略
          }
        }
        if (!cancelled) {
          setFollowers(f);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [username]);

  return { followers, loading, error };
}

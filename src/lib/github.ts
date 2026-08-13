// GitHub API 工具函数与常量

import { GITHUB_OWNER, CACHE_PREFIX, CACHE_TTL } from './consts';

const API_ROOT = 'https://api.github.com';

// 产品 id → GitHub 仓库名映射（仅真实存在的仓库）
export const REPO_MAP: Record<string, string> = {
  opencdk: 'OpenCDK',
  // 未来若其他作品有真实仓库，在此添加
};

export function getRepoName(productId: string): string | null {
  return REPO_MAP[productId] ?? null;
}

// 构造 GitHub API URL
export function ghUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_ROOT}${p}`;
}

// 构造仓库相关 URL
export function repoUrl(owner: string = GITHUB_OWNER, repo: string, suffix: string = ''): string {
  return ghUrl(`/repos/${owner}/${repo}${suffix}`);
}

// GitHub API 返回的 README content 是 base64 编码
export function decodeBase64Utf8(b64: string): string {
  try {
    // 用 atob 解码为二进制字符串，再转 UTF-8（处理中文）
    const binary = atob(b64.replace(/\n/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    console.error('base64 解码失败', e);
    return '';
  }
}

// 通用缓存读写（与 useGitHubStats 一致的模式）
export function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { v: T; t: number };
    if (Date.now() - cached.t < CACHE_TTL.githubShort) return cached.v;
    return null;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, v: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ v, t: Date.now() }));
  } catch {
    // 存储满或被禁用 → 忽略
  }
}

export function ghCacheKey(endpoint: string): string {
  return `${CACHE_PREFIX.github}${endpoint}`;
}

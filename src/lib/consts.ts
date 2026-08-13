// 全局常量集中管理

// 后端 API 基址（Phase B 起接入；Phase A 留接口不调用）
// 通过 Vite 环境变量注入；本地开发默认 localhost:8787（Cloudflare Pages Functions 默认端口）
export const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '';

// GitHub 仓库 owner
export const GITHUB_OWNER = 'Hedwig207';

// 夜班时段（24h 制，[start, end)，跨午夜）
export const NIGHT_HOURS = { start: 22, end: 6 };

// localStorage 缓存 key 前缀
export const CACHE_PREFIX = {
  github: 'owlbyte:gh:',
  auth: 'owlbyte:auth:',
  visitor: 'owlbyte:visitor:',
};

// 缓存 TTL
export const CACHE_TTL = {
  githubShort: 1000 * 60 * 60, // 1 小时（README/star 等）
  visitorSession: 1000 * 60 * 60 * 24, // 访客 sessionId 24h
};

// 站点元信息
export const SITE = {
  name: 'OwlByte Home',
  url: 'https://owlbyte-home.pages.dev',
  description: '夜行精密工坊 · OwlByte 守夜人观察哨',
  email: 'hedwig38@163.com',
};

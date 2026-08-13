export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  codename?: string;
  status: 'released' | 'in-progress' | 'preview';
  author?: string;
  highlights?: string[];
  changes: Array<{
    type: 'feat' | 'fix' | 'refactor' | 'perf' | 'docs' | 'chore' | 'design';
    scope?: string;
    description: string;
    details?: string[];
  }>;
  links?: Array<{ label: string; href: string }>;
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: 'v0.1.2-nightly',
    date: '2026-08-13',
    title: '修复部署环境可用性 + 更新日志页上线',
    codename: 'Build 0.1.2 · 校准',
    status: 'in-progress',
    highlights: [
      '修复 Cloudflare Pages Functions 全部接口挂掉的问题（未导入 getCorsHeaders）',
      '修复管理员路由 getBearerToken 缺失',
      'Settings/调试页显示全面校准（主题按钮、版本号、管理员工具）',
      '新增「更新」页，记录每一次版本变化',
    ],
    changes: [
      {
        type: 'fix',
        scope: 'Functions',
        description: '修复全局 CORS 中间件调用未定义的 getCorsHeaders() 导致所有接口 500',
      },
      {
        type: 'fix',
        scope: 'Admin',
        description: '修复管理员路由守卫 getBearerToken 导入缺失',
      },
      {
        type: 'fix',
        scope: 'Auth',
        description: '会话恢复失败路径不会再强制清掉已登录用户',
        details: ['仅当收到 401 时才清会话', '其他错误（接口暂时 404/5xx）保留用户态'],
      },
      {
        type: 'fix',
        scope: 'API',
        description: '/api/auth/me 现在支持仅靠 refresh cookie 恢复用户',
      },
      {
        type: 'feat',
        scope: 'Pages',
        description: '上线「更新」页 /log，取代原先的占位卡片',
      },
      {
        type: 'fix',
        scope: 'UI',
        description: 'Settings/调试 外观区块：主题切换按钮与当前状态文案一致',
      },
      {
        type: 'fix',
        scope: 'UI',
        description: 'Settings 底部版本号从 v0.1.0.0.0 改为单一来源注入（__APP_VERSION__）',
      },
      {
        type: 'chore',
        scope: 'Data',
        description: '建立 CHANGELOG 数据规范，以后每次构建都追加一条更新记录',
      },
    ],
    links: [
      { label: '查看当前部署', href: 'https://owlbyte-home.pages.dev' },
    ],
  },
  {
    version: 'v0.1.1-nightly',
    date: '2026-08-13',
    title: '用户系统 + 调试面板 + 访客心跳',
    codename: 'Phase B · 守夜人协议',
    status: 'released',
    highlights: [
      '上线 8 个认证页面：登录/注册/验证邮箱/找回密码/重置/个人中心/管理员/设置调试',
      'Cloudflare Functions 后端：14 个 API 端点（auth/subscribers/visitors/logs）',
      '命令面板（⌘K / Ctrl+K）完整弹出：导航/作品/主题/社交/账户',
      'React ErrorBoundary + 浏览器级错误捕获 + /settings 错误日志展示',
    ],
    changes: [
      {
        type: 'feat', scope: 'Auth',
        description: '上线 8 个真实页面：Login Register VerifyEmail ForgotPassword ResetPassword Profile AdminVisitors SettingsDebug',
      },
      { type: 'feat', scope: 'Backend', description: 'Cloudflare Pages Functions：14 个端点，D1 未绑定自动 Mock 模式' },
      { type: 'feat', scope: 'Backend', description: '内置管理员测试账号 admin@owlbyte.home / owlbyte123456' },
      { type: 'feat', scope: 'UI', description: 'Navbar 用户下拉菜单 UserMenu：个人中心 / 管理员看板 / 退出登录' },
      { type: 'feat', scope: 'API', description: '订阅表单接入真实后端，带限流 5 次/小时、防枚举' },
      { type: 'feat', scope: 'Debug', description: '⌘K 命令面板：导航/作品/锚点/主题/社交/账户' },
      { type: 'feat', scope: 'Debug', description: 'React ErrorBoundary：任何子树错误 → 精美 fallback 卡片 + 自动入日志' },
      { type: 'feat', scope: 'Debug', description: 'window.onerror + unhandledrejection 全局捕获，Settings 页面可导出/上报/清除' },
      { type: 'feat', scope: 'Admin', description: '访客心跳：每 30 秒上报，管理员看板展示在线/今日/总访客 + 7 日趋势' },
      { type: 'feat', scope: 'Dev', description: 'Vite dev 时 mock 全部 API（vite.mock-api.ts），本地开发无需 Cloudflare CLI' },
      { type: 'refactor', scope: 'Build', description: '修复 Functions 文件路径别名（@functions/_shared → 相对路径），删除 runtime=nodejs 错误声明' },
    ],
  },
  {
    version: 'v0.1.0',
    date: '2026-08-13',
    title: 'Phase A · 命令面板、月相、GitHub 真实数据',
    codename: 'Phase A · 夜行观察哨',
    status: 'released',
    highlights: [
      '⌘K 命令面板上线',
      '月相算法 + 夜班自动切换主题',
      '作品详情页接入 GitHub 真实数据（README/star/commits/releases）',
      '社区观察者数据从 GitHub 真实获取',
    ],
    changes: [
      { type: 'feat', scope: 'Pages', description: '作品页从锚点改为独立路由 /project/:id，配返回按钮' },
      { type: 'feat', scope: 'Pages', description: '作品列表页 /project 与守夜人列表页 /watchman 上线' },
      { type: 'feat', scope: 'Pages', description: '核心人物 Hedwig 详情页 /watchman/hedwig' },
      { type: 'feat', scope: 'UI', description: '命令面板 cmdk + CommandPalette：Ctrl+K / ⌘K 弹出' },
      { type: 'feat', scope: 'UI', description: '月相可视化（8 相 + 照明率）' },
      { type: 'feat', scope: 'UI', description: '夜班主题：22:00 - 06:00 自动切深色（可手动覆盖）' },
      { type: 'feat', scope: 'UI', description: 'OpenCDK 状态改为预发布，其余三件改为预览' },
      { type: 'feat', scope: 'Data', description: 'useGitHubStats：社区观察者 followers 真实拉取（1h 缓存）' },
      { type: 'feat', scope: 'Data', description: '作品详情 RepoMetaBar：GitHub stars/forks 实时 + 近期 commits + releases 列表 + README 渲染' },
      { type: 'feat', scope: 'Brand', description: '社交链接：GitHub、Discussions 讨论区、邮箱 hedwig38@163.com' },
      { type: 'fix', scope: 'Build', description: 'Cloudflare 构建失败修复（缺少 marked/dompurify/cmdk 依赖）' },
    ],
  },
  {
    version: 'v0.0.1-nightly',
    date: '2026-08-11',
    title: '初始化 · OwlByte 首页首版发布',
    codename: 'Build 0.0.1 · 点亮',
    status: 'released',
    highlights: [
      '首页 Manifesto / Capabilities / Works / Community 四大区块完整落地',
      '深色 + 琥珀色配色、玻璃拟态设计',
      '部署 Cloudflare Pages',
    ],
    changes: [
      { type: 'feat', scope: 'Init', description: 'Vite + React + TypeScript + Tailwind 初始化项目' },
      { type: 'feat', scope: 'UI', description: 'Hero 首屏：背景图（image 文件夹）+ 夜行观察者标题 + 探看作品/阅读宣言 CTA' },
      { type: 'feat', scope: 'UI', description: 'Manifesto：克制、可读、可离三大承诺' },
      { type: 'feat', scope: 'UI', description: 'Capabilities：洞察、精度、守护三种夜行本能' },
      { type: 'feat', scope: 'UI', description: 'Works：Observatory / Lumen / Parchment / OpenCDK 四件作品卡片' },
      { type: 'feat', scope: 'UI', description: '守夜人 Hedwig 介绍区块 + 头像' },
      { type: 'feat', scope: 'UI', description: 'Community：订阅表单 + 栖息地链接 + 统计卡片' },
      { type: 'feat', scope: 'UI', description: 'Navbar + Footer + 响应式' },
      { type: 'chore', scope: 'Deploy', description: 'Cloudflare Pages 接入 GitHub 自动部署' },
    ],
  },
];

export function getLatestVersion(): ChangelogEntry {
  return CHANGELOG[0];
}

export const CHANGELOG_STATS = {
  totalVersions: CHANGELOG.length,
  releasedCount: CHANGELOG.filter(e => e.status === 'released').length,
  inProgressCount: CHANGELOG.filter(e => e.status === 'in-progress').length,
  totalChanges: CHANGELOG.reduce((a, e) => a + e.changes.length, 0),
  totalFeats: CHANGELOG.reduce((a, e) => a + e.changes.filter(c => c.type === 'feat').length, 0),
  totalFixes: CHANGELOG.reduce((a, e) => a + e.changes.filter(c => c.type === 'fix').length, 0),
};

export default CHANGELOG;

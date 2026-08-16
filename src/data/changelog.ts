// MC Wiki 风格 changelog 数据结构
// 分类参考：https://minecraft.wiki/w/版本记录
// 每个版本包含：
//   overview       — 版本简介（一段话，MC Wiki 顶部「关于」）
//   additions      — 新增内容
//   changes        — 特性更改（现有内容改动）
//   fixes          — 漏洞修复（Bug fixes）
//   removals       — 移除内容（可选）
//   technical      — 技术性更改（构建/后端/性能/重构）

export type ChangeItem = {
  scope?: string;  // 作用域：Pages / UI / API / Build 等
  description: string;
  details?: string[];  // 细分子项（嵌套列表）
};

export type ChangelogCategory = {
  heading: string;   // 子区块标题，如「页面」「命令」「UI 元素」
  items: ChangeItem[];
};

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  codename?: string;
  status: 'released' | 'in-progress' | 'preview';
  author?: string;
  overview: string;                  // 版本简介（MC Wiki 风格）
  additions?: ChangelogCategory[];   // 新增内容
  changes?: ChangelogCategory[];     // 特性更改
  fixes?: ChangelogCategory[];       // 漏洞修复
  removals?: ChangelogCategory[];    // 移除内容
  technical?: ChangelogCategory[];   // 技术性更改
  links?: Array<{ label: string; href: string }>;
}

export const CHANGELOG: ChangelogEntry[] = [
  // ─────────────── 26w02b ───────────────
  {
    version: '26w02b',
    date: '2026-08-16',
    title: '主题切换修复 + 版本号动态化 + Bug 反馈页提示',
    codename: 'Snapshot 26w02b · 守夜人修复',
    status: 'released',
    overview:
      '26w02b 是从真实 Bug 反馈中诞生的修复版本。修复了主题切换在夜间模式下无效的致命 Bug，' +
      '将全站所有版本号显示从硬编码改为动态读取最新 changelog，同时在 Bug 反馈页明确标注 localStorage 数据的跨浏览器限制。',
    fixes: [
      {
        heading: '主题系统',
        items: [
          {
            scope: 'UI',
            description: '修复命令面板主题切换在夜间模式（22:00-06:00）下无效的 Bug',
            details: [
              '根因：autoNight 模式开启时，effective 主题强制为 dark，用户的 light 选择被覆盖',
              '修复：在命令面板切换主题时自动将 autoNight 置为 false，确保用户选择生效',
              '影响范围：⌘K 命令面板「深色模式 / 浅色模式」两个按钮',
            ],
          },
        ],
      },
      {
        heading: '版本显示',
        items: [
          {
            scope: 'UI',
            description: '修复设置页（/settings）版本号硬编码为 v0.0.0 的问题',
            details: [
              'Footer「底部条」版本号改为动态读取最新 changelog 版本号',
              'SettingsDebug「版本信息」区块改为动态读取最新版本号和构建渠道',
            ],
          },
        ],
      },
    ],
    changes: [
      {
        heading: 'Bug 反馈页',
        items: [
          {
            scope: 'UI',
            description: 'Bug 反馈页底部说明文字更新：明确提示数据仅在当前浏览器可见',
            details: [
              '原文：「每次进入本页都能看到」',
              '新文：「仅在当前浏览器可见；跨设备/浏览器暂未同步」',
              '原因：localStorage 是浏览器隔离的，不同设备/浏览器无法共享数据',
            ],
          },
        ],
      },
    ],
    technical: [
      {
        heading: '数据驱动',
        items: [
          {
            scope: 'Data',
            description: '版本号统一从 CHANGELOG[0]（getLatestVersion）获取，消除硬编码',
            details: [
              'Footer 底部版本号动态化',
              'SettingsDebug 版本信息区块动态化',
              '后续只需更新 changelog，全站版本号自动同步',
            ],
          },
        ],
      },
    ],
    links: [
      { label: '查看当前部署', href: 'https://owlbyte-home.pages.dev/update' },
    ],
  },

  // ─────────────── 26w02a ───────────────
  {
    version: '26w02a',
    date: '2026-08-16',
    title: '更新日志改版 — MC Wiki 风格',
    codename: 'Snapshot 26w02a · 羊皮卷改版',
    status: 'in-progress',
    overview:
      '26w02a 是 Owlbyte 第二周的首个快照版本。本次更新将更新日志页面整体改版为 Minecraft Wiki 风格，' +
      '每个版本现在都包含「版本简介」「新增内容」「特性更改」「漏洞修复」「技术性更改」「参考链接」等独立栏目；' +
      '同时补齐了所有历史版本的分类数据，便于跨版本追溯。',
    additions: [
      {
        heading: '页面与组件',
        items: [
          {
            scope: 'UI',
            description: 'ChangelogCard 新增 MC Wiki 式分区标题栏：版本简介 / 新增内容 / 特性更改 / 漏洞修复 / 技术性更改',
          },
          {
            scope: 'UI',
            description: '版本卡片顶部版本元信息（发布日期、状态标记、代号、作者）单独成块展示',
          },
        ],
      },
      {
        heading: '数据结构',
        items: [
          {
            scope: 'Data',
            description: 'ChangelogEntry 新增 overview、additions、changes、fixes、removals、technical 六大栏目，完全对齐 MC Wiki 分类',
            details: [
              'overview：单段字符串版本简介（每个版本必填）',
              'additions/changes/fixes/removals/technical：均为 ChangelogCategory[]（heading + items[]）',
              'ChangeItem 支持 scope 标签与 details 嵌套列表',
            ],
          },
          {
            scope: 'Data',
            description: '补齐 v0.0.1 ~ 26w01a 全部 6 个历史版本的分类数据，每个条目都归入对应栏目',
          },
        ],
      },
    ],
    changes: [
      {
        heading: '显示样式',
        items: [
          {
            scope: 'UI',
            description: '原先按 [feat] [fix] 标签分组的时间轴改为按 MC Wiki 栏目分组',
            details: [
              '[feat] → 拆分到新增内容 / 特性更改（取决于是否是第一次出现的功能）',
              '[fix] → 统一归入漏洞修复栏目',
              '[perf] [refactor] [chore] [build] → 统一归入技术性更改',
              '[design] [docs] → 根据具体描述分到对应栏目',
            ],
          },
          {
            scope: 'UI',
            description: '核心亮点（highlights）取消，改为版本简介 + 栏目化展示',
          },
        ],
      },
    ],
    technical: [
      {
        heading: '构建与数据',
        items: [
          {
            scope: 'Data',
            description: 'CHANGELOG_STATS 计算方式保持不变，栏目不影响统计字段',
          },
          {
            scope: 'Types',
            description: '为 ChangelogCategory / ChangeItem 定义单独类型，便于后续类型复用',
          },
        ],
      },
    ],
    links: [
      { label: '查看当前部署', href: 'https://owlbyte-home.pages.dev/update' },
    ],
  },

  // ─────────────── 26w01a ───────────────
  {
    version: '26w01a',
    date: '2026-08-14',
    title: 'Mojang 版本号体系启动 + Bug 反馈页 + 致命会话修复',
    codename: 'Snapshot 26w01a · 校正',
    status: 'released',
    overview:
      '26w01a 是 Owlbyte Mojang 风格快照版本号体系的起点（2026 年第 1 周 a 版）。' +
      '本次更新上线了异常报告页 `/bug-report`，修复了一个会导致已登录用户被误登出的致命会话 bug，' +
      '并将「更新日志」从旧路由 `/log` 正式更名为 `/update`（保留旧路由兼容）。',
    additions: [
      {
        heading: '页面',
        items: [
          {
            scope: 'Pages',
            description: '新增异常报告页 `/bug-report`',
            details: [
              '提交表单：类别 / 出现时间 / 概述 / 复现方法 / 联系方式（可选）',
              '数据存入 localStorage（key: owlbyte:bug_reports），每次进入页面都能看到历史报告',
              '报告状态三态循环：待处理 → 已查看 → 已修复',
              '统计条：总报告 / 待处理 / 已查看 / 已修复四项计数',
            ],
          },
        ],
      },
      {
        heading: '版本号体系',
        items: [
          {
            scope: 'Versioning',
            description: '确立 Mojang 快照版本号规范：YYwWW[a-z]',
            details: [
              '26w01a = 2026 年第 1 周快照 a 版',
              '同日内多次修 bug 用字母后缀区分（a→b→c…）',
            ],
          },
        ],
      },
    ],
    changes: [
      {
        heading: '路由与导航',
        items: [
          {
            scope: 'Routing',
            description: '更新日志路由从 `/log` 更名为 `/update`，旧路由保留兼容',
            details: [
              'Footer「更新日志」跳转 /update',
              '⌘K 命令面板「开发日志」跳转 /update',
              '历史版本链接同步改为 /update',
            ],
          },
          {
            scope: 'Navigation',
            description: '异常报告入口加入 ⌘K 命令面板和 Footer「章节」列',
          },
        ],
      },
    ],
    fixes: [
      {
        heading: '认证',
        items: [
          {
            scope: 'Auth',
            description: '修复 useAuth 致命 bug：任何请求错误都会无条件 clear() 掉用户会话',
            details: [
              '仅当 code=UNAUTHORIZED 或 status=401 时才清会话',
              '其他错误（接口 404/5xx）标记 hydrated=true 保留用户态',
              '与 App.tsx restoreSession 的策略对齐',
            ],
          },
        ],
      },
    ],
    technical: [
      {
        heading: '组件',
        items: [
          {
            scope: 'Build',
            description: 'BugReport 页采用 React.lazy 懒加载，不影响主页 bundle',
          },
          {
            scope: 'Build',
            description: 'DevLog 与 BugReport 两个页面分别独立代码分割',
          },
        ],
      },
    ],
    links: [
      { label: '查看当前部署', href: 'https://owlbyte-home.pages.dev/update' },
    ],
  },

  // ─────────────── v0.1.3-nightly ───────────────
  {
    version: 'v0.1.3-nightly',
    date: '2026-08-14',
    title: '更新日志访问记录 + 页面去 emoji',
    codename: 'Build 0.1.3 · 观察记录',
    status: 'released',
    overview:
      'Build 0.1.3 关注更新日志页本身：每次访问 `/log`（今 `/update`）都会被记录并展示统计数据，' +
      '同时页面视觉去 emoji 化，改用纯文本标签；Cloudflare Functions 不可用时改用 localStorage 本地记录。',
    additions: [
      {
        heading: '后端与 API',
        items: [
          {
            scope: 'API',
            description: '新增 `/api/log-views` 端点',
            details: [
              'POST：记录一次更新日志页访问（sessionId、path、referrer、ua）',
              'GET：返回访问统计（总浏览、今日、本周、独立访客、近期访问）',
            ],
          },
          {
            scope: 'Backend',
            description: 'utils.ts 新增 dbRecordLogView + dbGetLogViewStats（Mock 模式与 D1 双支持）',
          },
        ],
      },
      {
        heading: '页面元素',
        items: [
          {
            scope: 'Pages',
            description: 'DevLog 页新增 ViewStatsBar',
            details: [
              '展示总浏览 / 今日 / 本周 / 独立访客四项指标',
              '近期访问列表显示设备类型与相对时间',
              '复用 visitor session ID 区分独立访客',
            ],
          },
          {
            scope: 'Pages',
            description: 'Cloudflare Functions 不可用时的纯前端 localStorage 降级方案',
            details: [
              '记录 key: owlbyte:log_visits（时间戳数组）',
              '自动计算 总浏览/今日/本周 指标',
              '近期访问 8 条展示，数据来自本地浏览器',
            ],
          },
        ],
      },
    ],
    fixes: [
      {
        heading: '页面样式',
        items: [
          {
            scope: 'UI',
            description: '移除 DevLog 页所有 emoji（✨🐛♻️🌟 等），改用 [feat] [fix] 纯文本标签',
          },
          {
            scope: 'UI',
            description: '移除 Navbar 顶部「更新」入口，主页恢复观察/能力/作品/群落四大区块',
          },
        ],
      },
      {
        heading: '构建',
        items: [
          {
            scope: 'Build',
            description: '修复合并冲突标记残留导致 Cloudflare 构建失败（TS1185 Merge conflict marker encountered）',
          },
        ],
      },
    ],
    technical: [
      {
        heading: '构建',
        items: [
          {
            scope: 'Build',
            description: 'DevLog 改为 React.lazy + Suspense 懒加载，主页不再加载更新日志代码',
          },
        ],
      },
    ],
    links: [
      { label: '查看当前部署', href: 'https://owlbyte-home.pages.dev/update' },
    ],
  },

  // ─────────────── v0.1.2-nightly ───────────────
  {
    version: 'v0.1.2-nightly',
    date: '2026-08-13',
    title: '修复部署环境可用性 + 更新日志页上线',
    codename: 'Build 0.1.2 · 校准',
    status: 'released',
    overview:
      'Build 0.1.2 是稳定性校准版本。' +
      '本版本修复了 Cloudflare Pages Functions 因导入缺失导致全部接口 500 的致命问题，' +
      '上线了「更新」页，校准 Settings 调试面板的主题切换与版本号显示。',
    fixes: [
      {
        heading: 'Functions',
        items: [
          {
            scope: 'Functions',
            description: '修复全局 CORS 中间件调用未定义的 getCorsHeaders() 导致所有接口 500',
          },
          {
            scope: 'Admin',
            description: '修复管理员路由守卫 getBearerToken 导入缺失',
          },
        ],
      },
      {
        heading: '认证',
        items: [
          {
            scope: 'Auth',
            description: '会话恢复失败路径不再强制清掉已登录用户',
            details: [
              '仅收到 401 时才清会话',
              '其他错误（接口暂时 404/5xx）保留用户态',
            ],
          },
          {
            scope: 'API',
            description: '/api/auth/me 现在支持仅靠 refresh cookie 恢复用户',
          },
        ],
      },
      {
        heading: '调试面板',
        items: [
          {
            scope: 'UI',
            description: 'Settings/调试外观区块：主题切换按钮与当前状态文案一致',
          },
          {
            scope: 'UI',
            description: 'Settings 底部版本号从 v0.1.0.0.0 改为单一来源注入（__APP_VERSION__）',
          },
        ],
      },
    ],
    additions: [
      {
        heading: '页面',
        items: [
          {
            scope: 'Pages',
            description: '上线「更新」页 `/log`，取代原先的占位卡片',
          },
        ],
      },
    ],
    technical: [
      {
        heading: '数据',
        items: [
          {
            scope: 'Data',
            description: '建立 CHANGELOG 数据规范，每次构建都追加一条更新记录',
          },
        ],
      },
    ],
    links: [
      { label: '查看当前部署', href: 'https://owlbyte-home.pages.dev' },
    ],
  },

  // ─────────────── v0.1.1-nightly ───────────────
  {
    version: 'v0.1.1-nightly',
    date: '2026-08-13',
    title: '用户系统 + 调试面板 + 访客心跳',
    codename: 'Phase B · 守夜人协议',
    status: 'released',
    overview:
      'Phase B「守夜人协议」版本建立了完整用户体系：注册 / 登录 / 验证邮箱 / 找回密码 / 重置密码 / 个人中心 / 管理员看板 / 设置调试 共 8 个页面。' +
      'Cloudflare Pages Functions 提供 14 个 API 端点；⌘K 命令面板、React ErrorBoundary、浏览器级错误捕获、访客心跳全部上线。',
    additions: [
      {
        heading: '认证页面',
        items: [
          {
            scope: 'Auth',
            description: '上线 8 个真实页面：Login、Register、VerifyEmail、ForgotPassword、ResetPassword、Profile、AdminVisitors、SettingsDebug',
          },
        ],
      },
      {
        heading: '后端',
        items: [
          {
            scope: 'Backend',
            description: 'Cloudflare Pages Functions 上线 14 个 API 端点，D1 未绑定时自动 Mock 模式',
          },
          {
            scope: 'Backend',
            description: '内置管理员测试账号 admin@owlbyte.home / owlbyte123456',
          },
          {
            scope: 'API',
            description: '订阅表单接入真实后端，带限流 5 次/小时、防枚举',
          },
        ],
      },
      {
        heading: '调试与诊断',
        items: [
          {
            scope: 'Debug',
            description: '⌘K 命令面板：导航 / 作品 / 锚点 / 主题 / 社交 / 账户',
          },
          {
            scope: 'Debug',
            description: 'React ErrorBoundary：任何子树错误 → 精美 fallback 卡片 + 自动入日志',
          },
          {
            scope: 'Debug',
            description: 'window.onerror + unhandledrejection 全局捕获，Settings 可导出 / 上报 / 清除',
          },
        ],
      },
      {
        heading: '管理员',
        items: [
          {
            scope: 'Admin',
            description: '访客心跳：每 30 秒上报，管理员看板展示在线 / 今日 / 总访客 + 7 日趋势',
          },
        ],
      },
      {
        heading: 'UI 元素',
        items: [
          {
            scope: 'UI',
            description: 'Navbar 用户下拉菜单 UserMenu：个人中心 / 管理员看板 / 退出登录',
          },
        ],
      },
    ],
    technical: [
      {
        heading: '开发体验',
        items: [
          {
            scope: 'Dev',
            description: 'Vite dev 时 mock 全部 API（vite.mock-api.ts），本地开发无需 Cloudflare CLI',
          },
          {
            scope: 'Build',
            description: '修复 Functions 文件路径别名（@functions/_shared → 相对路径），删除 runtime=nodejs 错误声明',
          },
        ],
      },
    ],
  },

  // ─────────────── v0.1.0 ───────────────
  {
    version: 'v0.1.0',
    date: '2026-08-13',
    title: 'Phase A · 命令面板、月相、GitHub 真实数据',
    codename: 'Phase A · 夜行观察哨',
    status: 'released',
    overview:
      'Phase A「夜行观察哨」是首个功能版本。上线 ⌘K 命令面板、月相可视化 + 夜班自动切主题；' +
      '作品详情页、社区观察者数据全部从 GitHub REST API 真实获取（1h 缓存）；作品页从锚点滚动改为独立路由。',
    additions: [
      {
        heading: '页面',
        items: [
          {
            scope: 'Pages',
            description: '作品页从锚点滚动改为独立路由 /project/:id，配返回按钮',
          },
          {
            scope: 'Pages',
            description: '作品列表页 `/project` 与守夜人列表页 `/watchman` 上线',
          },
          {
            scope: 'Pages',
            description: '核心人物 Hedwig 详情页 `/watchman/hedwig` 上线',
          },
        ],
      },
      {
        heading: 'UI 元素',
        items: [
          {
            scope: 'UI',
            description: '命令面板 cmdk + CommandPalette：Ctrl+K / ⌘K 弹出',
          },
          {
            scope: 'UI',
            description: '月相可视化（8 相 + 照明率）',
          },
          {
            scope: 'UI',
            description: '夜班主题：22:00 - 06:00 自动切深色（可手动覆盖）',
          },
          {
            scope: 'UI',
            description: 'OpenCDK 状态改为预发布，其余三件改为预览',
          },
        ],
      },
      {
        heading: '数据接入',
        items: [
          {
            scope: 'Data',
            description: 'useGitHubStats：社区观察者 followers 真实拉取（1h 缓存）',
          },
          {
            scope: 'Data',
            description: '作品详情 RepoMetaBar：GitHub stars/forks 实时 + 近期 commits + releases 列表 + README 渲染',
          },
        ],
      },
      {
        heading: '社交',
        items: [
          {
            scope: 'Brand',
            description: '社交链接：GitHub、Discussions 讨论区、邮箱 hedwig38@163.com',
          },
        ],
      },
    ],
    fixes: [
      {
        heading: '构建',
        items: [
          {
            scope: 'Build',
            description: 'Cloudflare 构建失败修复（缺少 marked / dompurify / cmdk 依赖，package.json 未推送）',
          },
        ],
      },
    ],
  },

  // ─────────────── v0.0.1-nightly ───────────────
  {
    version: 'v0.0.1-nightly',
    date: '2026-08-11',
    title: '初始化 · OwlByte 首页首版发布',
    codename: 'Build 0.0.1 · 点亮',
    status: 'released',
    overview:
      'Build 0.0.1 是 Owlbyte 首页的首版发布。深色 + 琥珀色配色、玻璃拟态设计，完整落地首页四大区块，并接入 Cloudflare Pages 自动部署。',
    additions: [
      {
        heading: '项目初始化',
        items: [
          {
            scope: 'Init',
            description: 'Vite + React + TypeScript + Tailwind 初始化项目',
          },
        ],
      },
      {
        heading: '首页区块',
        items: [
          {
            scope: 'UI',
            description: 'Hero 首屏：背景图（image 文件夹）+ 夜行观察者标题 + 探看作品/阅读宣言 CTA',
          },
          {
            scope: 'UI',
            description: 'Manifesto：克制、可读、可离三大承诺',
          },
          {
            scope: 'UI',
            description: 'Capabilities：洞察、精度、守护三种夜行本能',
          },
          {
            scope: 'UI',
            description: 'Works：Observatory / Lumen / Parchment / OpenCDK 四件作品卡片',
          },
          {
            scope: 'UI',
            description: '守夜人 Hedwig 介绍区块 + 头像',
          },
          {
            scope: 'UI',
            description: 'Community：订阅表单 + 栖息地链接 + 统计卡片',
          },
        ],
      },
      {
        heading: '导航',
        items: [
          {
            scope: 'UI',
            description: 'Navbar + Footer + 响应式布局',
          },
        ],
      },
    ],
    technical: [
      {
        heading: '部署',
        items: [
          {
            scope: 'Deploy',
            description: 'Cloudflare Pages 接入 GitHub 自动部署',
          },
        ],
      },
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
  totalChanges: CHANGELOG.reduce(
    (a, e) =>
      a +
      countItems(e.additions) +
      countItems(e.changes) +
      countItems(e.fixes) +
      countItems(e.removals) +
      countItems(e.technical),
    0
  ),
  totalFeats: CHANGELOG.reduce((a, e) => a + countItems(e.additions), 0),
  totalFixes: CHANGELOG.reduce((a, e) => a + countItems(e.fixes), 0),
};

function countItems(cats?: ChangelogCategory[]): number {
  if (!cats) return 0;
  return cats.reduce((a, c) => a + c.items.length, 0);
}

export default CHANGELOG;

# OwlByte Home — Phase 2 扩展实施计划

## Context

OwlByte Home 已在 Cloudflare Pages 上线（React SPA），现在要扩展为「内容真实化 + 用户参与 + 后端化」的完整产品。

用户期望：
1. 作品详情页接 GitHub 真实数据（README/star/commits/releases）
2. 开发日志页 `/log`（GitHub commits 自动入库 + 管理员可编辑/隐藏）
3. 订阅表单接真后端
4. ⌘K 命令面板
5. 完整多用户注册/登录/个人中心
6. 夜班主题可视化（月相 + 昼夜切换）
7. **新增**：管理员能看到进入网站的访客（在线列表 + 历史统计）

## 关键决策（已与用户确认）

| 决策 | 选择 | 说明 |
|---|---|---|
| 后端语言/框架 | Java 21 + Spring Boot 3.3 | 符合用户后端语言偏好 |
| 后端代码位置 | `backend/` 子目录（monorepo） | 与前端同仓库，独立 `pom.xml` |
| 后端部署位置 | **香橙派 + Cloudflare Tunnel** | 香橙派跑 JVM + PostgreSQL，Cloudflare Tunnel 暴露到 `api.owlbyte-home.pages.dev` 或子路径 |
| 数据库 | PostgreSQL 16 | Docker Compose 跑在香橙派 |
| 用户系统 | 完整多用户注册/登录 + 邮箱验证 + JWT | httpOnly cookie + access token 15min + refresh token 7d |
| 开发日志数据源 | GitHub Commits API（后端 PAT）+ 管理员覆盖 | 后端定时拉取入库，admin 可编辑/隐藏 |
| 邮件服务 | 163 SMTP（起步） | 后续可切 Resend，`MailService` 抽象接口 |
| 前端域名 | 保持 `owlbyte-home.pages.dev` | 后端通过 Cloudflare Tunnel 暴露，CORS 配置允许该域名 + credentials |
| 访客统计 | **新增功能** | 前端定期心跳 ping，后端记录会话，admin 后台展示 |

## 整体架构

```
浏览器（用户）
  ├─ React SPA (Cloudflare Pages: owlbyte-home.pages.dev)
  │   - zustand: auth/theme/ui
  │   - httpOnly cookie: refresh_token
  │   - localStorage: GitHub 数据缓存 1h
  │
  ├─ 直接 → GitHub API（仅公开数据：README/star/forks，前端缓存 1h）
  │
  └─ HTTPS → Cloudflare Tunnel → 香橙派（家中）
                      ├─ Spring Boot (Java 21)
                      │   ├─ /api/auth/**       (注册/登录/JWT)
                      │   ├─ /api/subscribers   (订阅)
                      │   ├─ /api/dev-logs     (开发日志)
                      │   ├─ /api/visitors      (访客心跳)
                      │   └─ /api/admin/**      (管理员)
                      │   └─ @Scheduled 30min 拉 GitHub commits
                      │
                      ├─ PostgreSQL 16 (Docker)
                      └─ 163 SMTP (邮件发送)
```

### 香橙派部署方案

- **系统**：Ubuntu 22.04 / Debian 12 (ARM64)
- **Cloudflare Tunnel**：免费、无需公网 IP、自动 HTTPS、`cloudflared` 守护进程把 `api.owlbyte-home.pages.dev`（或自定义子域）映射到香橙派 `localhost:8080`
- **Docker Compose**：postgres + spring-boot-app + cloudflared 三个服务
- **优势**：硬件成本 0（已有香橙派）、流量过 Cloudflare CDN 加速、IP 不暴露
- **风险**：家中断电/断网则后端不可用；前端首页仍正常（Cloudflare Pages 不受影响）

## 数据库 Schema

6 张主表 + 1 张访客表。完整 DDL 在 `backend/docs/schema.sql`。

### 1. `users`（注册用户）
```sql
id bigserial PK
email text UNIQUE NOT NULL
password_hash text NOT NULL              -- BCrypt cost 12
display_name text NOT NULL
avatar_url text NULL
role text NOT NULL DEFAULT 'user'        -- 'user' / 'admin'
email_verified boolean NOT NULL DEFAULT false
created_at, updated_at timestamptz
```

### 2. `email_verifications`（邮箱验证/找回 token）
```sql
id bigserial PK
user_id bigint FK→users ON DELETE CASCADE
token_hash text UNIQUE NOT NULL          -- SHA256(token)，存 hash 防库泄露
purpose text NOT NULL                    -- 'register' / 'reset_password'
expires_at timestamptz NOT NULL          -- 注册 24h，找回 1h
consumed_at timestamptz NULL
```

### 3. `subscribers`（订阅者，无需注册账号）
```sql
id bigserial PK
email text UNIQUE NOT NULL
status text NOT NULL DEFAULT 'active'    -- 'active' / 'unsubscribed'
unsub_token text UNIQUE NOT NULL         -- 退订链接用，随机 32 字符
source text NULL                        -- 'home_form' / 'footer'
ip_hash text NULL                       -- SHA256(ip+salt)，防滥用
subscribed_at, unsubscribed_at timestamptz
```

### 4. `dev_logs`（GitHub commits 入库）
```sql
id bigserial PK
repo text NOT NULL                      -- 'Owlbyte-Home'
sha text NOT NULL                       -- 完整 40 字符
short_sha text NOT NULL                 -- 7 字符
message text NOT NULL                   -- commit message 首行
body text NULL                          -- message 剩余段
author_name text NOT NULL
author_email text NOT NULL
author_github_login text NULL
committed_at timestamptz NOT NULL
fetched_at timestamptz DEFAULT now()
UNIQUE(repo, sha)
```
索引：`(repo, committed_at DESC)`、`(repo, sha) UNIQUE`

### 5. `log_overrides`（admin 覆盖）
```sql
id bigserial PK
dev_log_id bigint FK→dev_logs ON DELETE CASCADE UNIQUE
title_override text NULL
body_supplement text NULL               -- markdown 补充
hidden boolean NOT NULL DEFAULT false
edited_by bigint FK→users
updated_at timestamptz
```

### 6. `refresh_tokens`（可撤销）
```sql
id bigserial PK
user_id bigint FK→users ON DELETE CASCADE
token_hash text UNIQUE NOT NULL          -- SHA256
expires_at timestamptz NOT NULL         -- 7 天
revoked boolean DEFAULT false
user_agent text NULL
created_at timestamptz
```

### 7. `visitor_sessions`（**新增 - 访客统计**）
```sql
id bigserial PK
session_id text UNIQUE NOT NULL         -- 前端生成的 UUID，存 localStorage
user_id bigint NULL FK→users             -- 登录则关联
ip_prefix text NULL                     -- 仅留前两段，如 "1.2.0.0"
country text NULL                       -- Cloudflare Header CF-IPCountry
ua_summary text NULL                    -- 解析后的 "Chrome 120 / macOS"
path text NULL                          -- 当前页面
referrer text NULL                      -- 来源
first_seen_at timestamptz NOT NULL
last_ping_at timestamptz NOT NULL       -- 用于判断在线
pings_count int DEFAULT 1
```
索引：`(session_id) UNIQUE`、`(last_ping_at DESC)`、`(user_id)`

## API 契约

所有路径 `/api`，返回 JSON。错误格式：`{ "error": { "code", "message" } }`。

### 认证（AuthController）
| Method | Path | 入参 | 返回 | 鉴权 |
|---|---|---|---|---|
| POST | `/api/auth/register` | `{email, password, display_name}` | `{message, email}` + 发验证邮件 | 公开 |
| GET | `/api/auth/verify-email?token=xxx` | - | 重定向 `/login?verified=1` 或 `?err=expired` | 公开 |
| POST | `/api/auth/resend-verification` | `{email}` | `{message}` 限频 1/min | 公开 |
| POST | `/api/auth/login` | `{email, password}` | `{user, accessToken}` + Set-Cookie refresh_token | 公开 |
| POST | `/api/auth/refresh` | （cookie） | `{accessToken}` | 公开 |
| POST | `/api/auth/logout` | （cookie） | 撤销 + 清 cookie | 用户 |
| POST | `/api/auth/forgot-password` | `{email}` | `{message}` 防枚举 | 公开 |
| POST | `/api/auth/reset-password` | `{token, newPassword}` | `{message}` | 公开 |
| GET | `/api/auth/me` | - | `{user}` | 用户 |
| PUT | `/api/auth/me/password` | `{oldPassword, newPassword}` | `{message}` | 用户 |
| PUT | `/api/auth/me/profile` | `{displayName?, avatarUrl?}` | `{user}` | 用户 |

### 订阅（SubscriberController）
| Method | Path | 入参 | 返回 | 鉴权 |
|---|---|---|---|---|
| POST | `/api/subscribers` | `{email, source?}` | `{message, status}` 幂等 | 公开（限流 5/IP/h） |
| GET | `/api/subscribers/me?token=xxx` | - | `{email, status, subscribedAt}` | 公开 |
| POST | `/api/subscribers/unsubscribe` | `{token}` | `{message}` | 公开 |

### 开发日志（DevLogController）
| Method | Path | 入参 | 返回 | 鉴权 |
|---|---|---|---|---|
| GET | `/api/dev-logs?page=1&size=20` | - | `{items, page, total}` | 公开（includeHidden 仅 admin） |
| GET | `/api/dev-logs/{sha}` | - | `DevLogDTO`（含 override） | 公开 |
| POST | `/api/admin/dev-logs/{sha}/override` | `{titleOverride?, bodySupplement?, hidden?}` | `LogOverrideDTO` | admin |
| PUT | `/api/admin/dev-logs/{sha}/override` | 同上 | `LogOverrideDTO` | admin |
| DELETE | `/api/admin/dev-logs/{sha}/override` | - | `{message}` | admin |
| POST | `/api/admin/dev-logs/sync` | `{repo?}` | `{synced: n}` | admin |

### 访客统计（VisitorController）— **新增**
| Method | Path | 入参 | 返回 | 鉴权 |
|---|---|---|---|---|
| POST | `/api/visitors/heartbeat` | `{sessionId, path, referrer?}` | `{ok: true}` | 公开（限流 1/30s/IP） |
| GET | `/api/admin/visitors/online` | - | `{count, items: [{sessionId, country, uaSummary, path, lastPingAt, user?}]}` | admin |
| GET | `/api/admin/visitors/stats` | - | `{today, onlineNow, total, last7Days: [{date, count}]}` | admin |

### GitHub 代理（可选，给前端作品详情页用）
| Method | Path | 返回 | 鉴权 |
|---|---|---|---|
| GET | `/api/github/repos/{owner}/{repo}/readme` | `{content(markdown), htmlUrl}` | 公开（1h 缓存） |
| GET | `/api/github/repos/{owner}/{repo}` | `{stars, forks, openIssues, updatedAt}` | 公开 |
| GET | `/api/github/repos/{owner}/{repo}/commits?per_page=5` | `{items}` | 公开 |
| GET | `/api/github/repos/{owner}/{repo}/releases` | `{items}` | 公开 |

> Phase A 前端直连 GitHub API；若超 60/h 限速，Phase B 后切后端代理。

### 健康
| Method | Path | 返回 | 鉴权 |
|---|---|---|---|
| GET | `/api/health` | `{status:"ok", time}` | 公开 |

## JWT 与会话方案

- **Access Token**：JWT，TTL 15min，HS256，载荷 `{sub, email, role, exp}`
- **Refresh Token**：随机 64 字节 opaque，TTL 7d，存 `refresh_tokens.token_hash`
- **存储**：
  - Access Token → zustand authStore 内存（不落 localStorage）
  - Refresh Token → httpOnly + Secure + SameSite=Lax cookie（跨域需 SameSite=None; Secure）
- **刷新流程**：401 → `POST /api/auth/refresh` → 重放原请求；refresh 也 401 → 跳 `/login`
- **CORS**：`allowedOrigins = ["https://owlbyte-home.pages.dev", "http://localhost:5173"]`，`allowCredentials=true`

## 邮箱验证流程

1. `POST /api/auth/register` → 建 user（`email_verified=false`）+ 生成 token（24h）→ 发链接 `https://owlbyte-home.pages.dev/verify-email?token=xxx`
2. 用户点链接 → 前端 `/verify-email` → `GET /api/auth/verify-email?token=xxx` → 后端校验+置 `email_verified=true`
3. 找回密码：token 1h 过期
4. 防枚举：`forgot-password` 无论邮箱存在与否返回相同消息
5. 限频：`resend-verification` 1/min/email、5/day；`forgot-password` 1/min/email、3/day

## GitHub 同步策略

- `@Scheduled(fixedDelay = 30 * 60 * 1000)` 每 30min 拉 `Hedwig207/Owlbyte-Home` commits
- 用后端 PAT（Personal Access Token）认证，5000/h 限速
- 流程：查最新 `committed_at` → `GET /repos/.../commits?since={latest}&per_page=100` → upsert 到 `dev_logs`
- 失败重试 3 次，指数退避

## 前端改动清单

### 基础设施
| 文件 | 状态 | 职责 |
|---|---|---|
| `src/lib/api.ts` | 新建 | fetch 封装：baseURL、credentials、401 自动 refresh |
| `src/lib/types.ts` | 新建 | 后端 DTO 的 TS 类型 |
| `src/lib/consts.ts` | 新建 | `API_BASE`、`GITHUB_OWNER`、缓存 key 前缀 |
| `src/stores/authStore.ts` | 新建 | zustand：user/accessToken/isAuthenticated/isAdmin |
| `src/stores/uiStore.ts` | 新建 | zustand：命令面板开关、主题模式、夜班状态 |
| `src/hooks/useAuth.ts` | 新建 | 启动时恢复会话 |
| `src/hooks/useTheme.ts` | 修改 | 受控化：22:00-06:00 强制 dark+amber，其他时间尊重用户 |
| `src/components/AuthGuard.tsx` | 新建 | `<RequireAuth>` / `<RequireAdmin>` |
| `src/App.tsx` | 修改 | 删除强制 dark；注册新路由 |
| `.env.example` | 新建 | `VITE_API_BASE` |

### 功能 A：作品详情接 GitHub 真实数据
| 文件 | 状态 | 职责 |
|---|---|---|
| `src/hooks/useGitHubRepo.ts` | 新建 | 通用 hook，复用 `useGitHubStats` 模式，参数化 endpoint |
| `src/hooks/useReadme.ts` | 新建 | 拉 README，base64 解码 |
| `src/lib/github.ts` | 新建 | `decodeBase64Utf8`、`REPO_MAP` |
| `src/components/MarkdownRenderer.tsx` | 新建 | marked + dompurify，复用主题色 |
| `src/components/RepoMetaBar.tsx` | 新建 | star/fork/最近更新 |
| `src/components/RecentCommits.tsx` | 新建 | 最近 5 条 commits |
| `src/components/ReleasesList.tsx` | 新建 | releases 列表 |
| `src/pages/ProjectDetail.tsx` | 修改 | 插入 GitHub 数据区（仅 opencdk 等有真实仓库的） |
| `src/components/OpenCDKSpotlight.tsx` | 修改 | 硬编码 `⭐ 6` 改为动态 |

依赖新增：`marked`、`dompurify`、`@types/dompurify`

### 功能 B：开发日志 /log
| 文件 | 状态 | 职责 |
|---|---|---|
| `src/pages/DevLog.tsx` | 新建 | 时间轴页 + 分页 |
| `src/components/devlog/LogTimeline.tsx` | 新建 | 时间轴骨架（复用 ProjectDetail roadmap 样式） |
| `src/components/devlog/LogItem.tsx` | 新建 | 单条日志卡 |
| `src/components/devlog/LogItemEditor.tsx` | 新建 | admin 编辑面板 |
| `src/hooks/useDevLogs.ts` | 新建 | 分页拉取 + admin mutation |
| `src/components/devlog/LogAdminControls.tsx` | 新建 | 手动同步按钮 |
| `src/data/brand.ts` | 修改 | NAV_ITEMS 加「日志」入口 |
| `src/App.tsx` | 修改 | 注册 `/log` |

### 功能 C：订阅接后端
| 文件 | 状态 | 职责 |
|---|---|---|
| `src/components/Community.tsx` | 修改 | 模拟提交改为 `api.subscribe(email)` |
| `src/hooks/useSubscribe.ts` | 新建 | 封装 POST `/api/subscribers` |
| `src/pages/Unsubscribe.tsx` | 新建 | 退订页 |
| `src/App.tsx` | 修改 | 注册 `/unsubscribe` |

### 功能 D：⌘K 命令面板
| 文件 | 状态 | 职责 |
|---|---|---|
| `src/components/command/CommandPalette.tsx` | 新建 | cmdk 根容器，⌘K/Ctrl+K 监听 |
| `src/components/command/CommandItemGroups.tsx` | 新建 | 分组：作品/锚点/社交/主题/用户 |
| `src/hooks/useCommandPalette.ts` | 新建 | 全局快捷键 |
| `src/components/Navbar.tsx` | 修改 | 右上角搜索图标 |
| `src/App.tsx` | 修改 | 挂载 `<CommandPalette />` |

依赖新增：`cmdk`

### 功能 E：用户/登录页
| 文件 | 状态 | 职责 |
|---|---|---|
| `src/pages/Login.tsx` | 新建 | 邮箱+密码 |
| `src/pages/Register.tsx` | 新建 | 邮箱+密码+昵称 |
| `src/pages/VerifyEmail.tsx` | 新建 | 读 token 调验证 |
| `src/pages/ForgotPassword.tsx` | 新建 | 输邮箱 |
| `src/pages/ResetPassword.tsx` | 新建 | 输新密码 |
| `src/pages/Profile.tsx` | 新建 | 个人中心 |
| `src/components/auth/AuthFormFields.tsx` | 新建 | 共享输入组件 |
| `src/components/UserMenu.tsx` | 新建 | Navbar 头像下拉 |
| `src/App.tsx` | 修改 | 注册 6 个用户路由 |
| `src/components/Navbar.tsx` | 修改 | 右上角登录/头像 |

### 功能 F：夜班主题可视化
| 文件 | 状态 | 职责 |
|---|---|---|
| `src/lib/moonPhase.ts` | 新建 | 纯函数：基于已知新月 + 朔望月周期 29.53059 天 |
| `src/components/MoonPhaseGlyph.tsx` | 新建 | SVG 月相图标 |
| `src/hooks/useNightMode.ts` | 新建 | 22:00-06:00 判定 |
| `src/hooks/useTheme.ts` | 修改 | 整合夜班强制模式 |
| `src/components/Navbar.tsx` | 修改 | 插入月相组件 |

### 功能 G：访客统计（**新增**）
| 文件 | 状态 | 职责 |
|---|---|---|
| `src/hooks/useVisitorHeartbeat.ts` | 新建 | 启动生成 sessionId 存 localStorage；每 30s POST heartbeat |
| `src/pages/admin/Visitors.tsx` | 新建 | admin 访客看板：在线列表 + 今日/7 日趋势 |
| `src/components/admin/OnlineList.tsx` | 新建 | 当前在线用户表 |
| `src/components/admin/VisitorStats.tsx` | 新建 | 今日/总数/7 日图表 |
| `src/App.tsx` | 修改 | 注册 `/admin/visitors` |

### 路由总表
| 路径 | 组件 | 守卫 |
|---|---|---|
| `/` | Home | - |
| `/project` | Projects | - |
| `/project/:id` | ProjectDetail | - |
| `/watchman` | Watchmen | - |
| `/watchman/hedwig` | WatchmanHedwig | - |
| `/log` | DevLog | - |
| `/login` `/register` `/verify-email` `/forgot-password` `/reset-password` | 对应页 | - |
| `/profile` | Profile | RequireAuth |
| `/unsubscribe` | Unsubscribe | - |
| `/admin/visitors` | Visitors | RequireAdmin |
| `/admin/logs` | DevLog (admin 模式) | RequireAdmin |

## 后端项目结构（`backend/`）

```
backend/
├── pom.xml                    # Spring Boot 3.3 + Java 21
├── docker-compose.yml          # postgres + app + cloudflared
├── Dockerfile                  # ARM64 兼容
├── cloudflared/config.yml      # Tunnel 配置
├── docs/schema.sql
└── src/main/
    ├── java/com/owlbyte/home/
    │   ├── OwlbyteHomeApplication.java
    │   ├── config/             # Security/Cors/Web/RateLimit/Scheduling
    │   ├── domain/             # User/EmailVerification/Subscriber/DevLog/LogOverride/RefreshToken/VisitorSession
    │   ├── repository/         # 7 个 JPA Repository
    │   ├── service/            # Auth/EmailVerification/Subscriber/DevLog/LogOverride/GithubSync/Mail/Jwt/Visitor
    │   ├── controller/         # Auth/Subscriber/DevLog/LogOverride/Visitor/Admin/Health
    │   ├── dto/                # auth/subscriber/devlog/visitor
    │   ├── security/           # JwtAuthFilter/JwtTokenProvider/AuthUserDetails
    │   ├── exception/          # GlobalExceptionHandler/ApiError
    │   └── job/                # GithubSyncJob
    └── resources/
        ├── application.yml     # 主配置
        ├── application-dev.yml
        ├── application-prod.yml
        └── db/migration/       # Flyway: V1__init_schema.sql, V2__seed_admin.sql
```

## 分阶段实施计划

### Phase A：纯前端能立即上线（无后端依赖）
**目标**：所有不依赖后端的功能部署到 Cloudflare Pages 即可见效。

交付物：
1. 功能 D 命令面板（cmdk）
2. 功能 F 夜班主题可视化（月相 + useTheme 受控）
3. 功能 A 作品详情接 GitHub（直连 + 1h 缓存，硬编码 `⭐ 6` 改动态）
4. 基础 api.ts 骨架（暂不调真后端）
5. MarkdownRenderer

**验证**：`npm run build` 通过 + 本地 `npm run preview` 看 ⌘K/月相/README/star 动态。

**预计文件**：~12 新建 + 4 修改。

### Phase B：后端骨架 + 订阅 + 访客统计
**目标**：Spring Boot 起来，订阅接真后端，邮件能发，访客心跳能记录。

交付物：
1. 后端骨架：`/api/health` 通，Flyway 建表，PG 连上
2. Security + CORS（先放行所有，下阶段加 JWT）
3. 功能 C 订阅：`SubscriberController` + 163 SMTP 欢迎邮件 + Bucket4j 限流
4. 前端订阅表单改真 POST
5. 退订页 `/unsubscribe`
6. 功能 G 访客统计：`VisitorController` + 前端心跳 hook + admin 看板（无登录守卫，临时用 token）
7. GitHub 同步任务骨架（为 Phase D 铺垫）

**验证**：后端本地跑，curl 测订阅/心跳；前端配 `VITE_API_BASE=http://localhost:8080` 测订阅表单；查库确认 subscriber/visitor 入库；查收欢迎邮件。

**预计文件**：后端 ~18 个 + 前端 ~5 个。

### Phase C：用户系统
**目标**：注册/登录/JWT/邮箱验证/个人中心全打通。

交付物：
1. JWT 体系：JwtService + JwtAuthFilter + refresh + httpOnly cookie
2. AuthController 全部端点
3. 邮箱验证流程
4. 前端 6 个用户页面 + 路由守卫
5. Navbar 用户入口（登录/头像下拉）
6. authStore + useAuth 会话恢复
7. admin 种子脚本 `V2__seed_admin.sql`（插入 Hedwig admin）
8. 访客看板加 RequireAdmin 守卫

**验证**：注册→收验证邮件→点击→登录→访问 `/profile`→改密→登出→找回密码全流程；刷新会话保持；DevTools 看 cookie 是 httpOnly。

**预计文件**：后端 ~12 个 + 前端 ~10 个。

### Phase D：开发日志 + admin 覆盖
**目标**：`/log` 上线，commits 自动入库，admin 可编辑。

交付物：
1. DevLogController + Service（列表/单条/应用 override）
2. LogOverrideController（admin 编辑/隐藏/删除）
3. 手动同步端点
4. 前端 `/log` 时间轴页 + 分页
5. admin 编辑面板
6. Navbar/命令面板加「日志」入口
7. 隐藏 commit 不展示

**验证**：push commit → 30min 内 `/log` 出现新条目；admin 编辑标题/补充/隐藏；普通用户不可见隐藏项。

**预计文件**：后端 ~6 个 + 前端 ~6 个。

## 验证方案

### 端到端测试流程（Phase C 完成后）
1. 注册新用户 → 收到 163 邮件 → 点验证链接 → 邮箱验证成功
2. 登录 → DevTools 看 refresh_token cookie 是 httpOnly → access token 在内存
3. 刷新页面 → 自动调 `/api/auth/refresh` → 会话保持
4. 访问 `/profile` → 改密码 → 旧 refresh token 撤销
5. 忘记密码 → 收重置邮件 → 点链接 → 重置成功
6. 访问 `/admin/visitors` → 看到自己的会话在线
7. 推一个 commit → 30min 后 `/log` 出现新条目

### 香橙派部署测试
1. `cd backend && docker compose up -d` → postgres + app + cloudflared 起来
2. `curl https://api.owlbyte-home.pages.dev/api/health` → 通（证明 Tunnel 工作）
3. 前端配 `VITE_API_BASE=https://api.owlbyte-home.pages.dev` → build → 推 Cloudflare Pages
4. 访问 `owlbyte-home.pages.dev` → 订阅表单能提交 → 收邮件

## 风险与遗留

| 风险 | 应对 |
|---|---|
| 香橙派断电/断网 | 前端不受影响（Cloudflare Pages 独立）；后端断时订阅/登录不可用，加健康检查告警 |
| 163 SMTP 每日上限 | `MailService` 抽象接口，预留 Resend 实现；超限时降级为「邮件队列延后发送」 |
| GitHub API 限速（前端 60/h） | Phase A 直连 + 1h 缓存；若超限切后端代理 |
| 跨域 cookie（pages.dev ≠ tunnel 域名） | 用 SameSite=None; Secure；或把 Tunnel 也接到 `owlbyte-home.pages.dev` 子路径 |
| admin 初始化 | `V2__seed_admin.sql` 直接插 Hedwig admin（密码 hash 预生成） |
| commit 中文编码 | 后端 UTF-8 入库；前端 marked + dompurify 防 XSSI |
| 月相算法精度 | ±1 天，装饰用途足够；如需精确可换 NASA API |
| tsconfig include `api` 目录 | 后端代码放 `backend/`，前端 `tsconfig.json` 不纳入；避免前端 tsc 误编译 |
| 访客隐私 | `ip_prefix` 仅留前两段；UA 仅留浏览器+OS 摘要不存原文；session_id 不含 PII |

## Critical Files（实施时优先关注）

- [src/App.tsx](file:///f:/Owlbyte/owlbyte/Owlbyte%20Home/src/App.tsx) — 路由注册中心
- [src/hooks/useGitHubStats.ts](file:///f:/Owlbyte/owlbyte/Owlbyte%20Home/src/hooks/useGitHubStats.ts) — localStorage+1h TTL 缓存范本，功能 A 复刻
- [src/components/Community.tsx](file:///f:/Owlbyte/owlbyte/Owlbyte%20Home/src/components/Community.tsx) — 订阅表单模拟提交所在，Phase B 改造入口
- [src/components/Navbar.tsx](file:///f:/Owlbyte/owlbyte/Owlbyte%20Home/src/components/Navbar.tsx) — 用户头像/月相/命令面板/主题切换统一挂载点
- [src/hooks/useTheme.ts](file:///f:/Owlbyte/owlbyte/Owlbyte%20Home/src/hooks/useTheme.ts) — 夜班主题受控化核心
- [src/data/brand.ts](file:///f:/Owlbyte/owlbyte/Owlbyte%20Home/src/data/brand.ts) — PRODUCTS/SOCIALS/NAV_ITEMS 集中数据源
- [wrangler.toml](file:///f:/Owlbyte/owlbyte/Owlbyte%20Home/wrangler.toml) — Cloudflare Pages 部署配置

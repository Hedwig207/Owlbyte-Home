import { useEffect, useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Github, Download, Wrench, Zap, Shield, Clock, Rocket, Lock, FileText, Bell, Eye, Moon, GitBranch, HardDrive, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OpenCDKSpotlight from '@/components/OpenCDKSpotlight';
import { PRODUCTS, type Product } from '@/data/brand';
import { useReveal } from '@/hooks/useReveal';
import { cn } from '@/lib/utils';

const STATUS_LABEL: Record<Product['status'], string> = {
  GA: '正式可用',
  BETA: '预发布',
  PREVIEW: '预览',
};

const STATUS_STYLE: Record<Product['status'], string> = {
  GA: 'bg-amber/15 text-amber border-amber/30',
  BETA: 'bg-moon/15 text-moon border-moon/30',
  PREVIEW: 'bg-parchment/10 text-parchment/70 border-parchment/20',
};

type FeatureSet = {
  title: string;
  icon: any;
  items: string[];
};

const FEATURES: Record<string, FeatureSet[]> = {
  observatory: [
    {
      title: '多源统一接入',
      icon: HardDrive,
      items: [
        'Prometheus / OpenTelemetry / ClickHouse 等 12+ 数据源',
        '标准 SQL 查询接口 + PromQL 兼容模式',
        '拓扑自动发现：Kubernetes / Consul / 文件三端',
      ],
    },
    {
      title: '毫秒级流式处理',
      icon: Zap,
      items: [
        '增量窗口聚合，P99 端到端延迟 < 12ms',
        '基于 Rust 的流处理内核，单机 200k 事件/秒',
        '乱序重排与迟到数据自动补偿',
      ],
    },
    {
      title: '观察哨值守模式',
      icon: Bell,
      items: [
        '内置 30+ 降噪与合并规则，告警风暴抑制率 > 92%',
        '夜间值班分级：P0 立即唤醒 / P1 次日早会',
        '支持手机电话、短信、邮件、Webhook 全通道',
      ],
    },
  ],
  lumen: [
    {
      title: '节律建模',
      icon: Moon,
      items: [
        '基于 7+ 天行为轨迹拟合个人专注节律曲线',
        '识别深工作窗口与浅休息区间，自动分配任务',
        '跨设备（macOS / Windows / iOS）统一同步状态',
      ],
    },
    {
      title: '夜间照明',
      icon: Eye,
      items: [
        '系统级低蓝光滤镜，按日落时间平滑过渡',
        '「打开灯」模式：一键屏蔽 100+ 干扰源与通知',
        '浏览器 / IDE / 终端联动配色，夜间不刺眼',
      ],
    },
    {
      title: '走向黎明',
      icon: Clock,
      items: [
        '连续工作时长上限提醒，防止超长时间冲刺',
        '深度睡眠预估：建议的最后一次提交时间',
        '周度健康报告，提醒你何时该休息',
      ],
    },
  ],
  parchment: [
    {
      title: '版本化存档',
      icon: GitBranch,
      items: [
        '每篇内容永久保留修订历史，可逐字对比',
        'Git 存储后端，所有修改可回溯、可审计',
        '可选 IPFS 分布式归档，确保内容不被单点失效',
      ],
    },
    {
      title: '可引用长内容',
      icon: FileText,
      items: [
        '双向链接 + 引用图：让思想彼此关联',
        '「永久引用 DOI」：任意段落可被外部文章精确引用',
        'Markdown / Org-mode / LaTeX 多种语法支持',
      ],
    },
    {
      title: '归你所有',
      icon: Lock,
      items: [
        '原生支持一键自托管，数据不离你控制的服务器',
        '导出格式：静态站 / EPUB / PDF / Markdown 归档',
        '无追踪、无广告、无算法推荐打扰读者',
      ],
    },
  ],
};

const ROADMAP: Record<string, Array<{ phase: string; items: string[] }>> = {
  observatory: [
    { phase: 'Phase I · 观察架', items: ['数据源接入层 MVP', '仪表盘搭建', '基础告警'] },
    { phase: 'Phase II · 值守哨', items: ['降噪规则引擎', '夜间值守分级', '移动端 App'] },
    { phase: 'Phase III · 深空网', items: ['跨集群联邦查询', 'AIOps 根因分析', '可插拔告警插件市场'] },
  ],
  lumen: [
    { phase: 'Phase I · 点灯', items: ['节律追踪 MVP', '系统级勿扰联动', '低蓝光配色'] },
    { phase: 'Phase II · 专注', items: ['干扰源屏蔽清单', '深工作任务排程', '周度健康报告'] },
    { phase: 'Phase III · 黎明', items: ['团队版协作专注', '日历 / 任务系统深度集成', '生物节律科学研究贡献'] },
  ],
  parchment: [
    { phase: 'Phase I · 草稿', items: ['Markdown 发布 MVP', 'Git 后端', '基础主题'] },
    { phase: 'Phase II · 手稿', items: ['双向链接与引用图', '修订对比 UI', 'IPFS 归档'] },
    { phase: 'Phase III · 羊皮卷', items: ['永久 DOI 引用', '团队版协作编辑', '电子书导出流水线'] },
  ],
};

const ACCENT_RADIAL: Record<Product['accent'], string> = {
  amber: 'bg-radial-amber',
  moon: 'bg-radial-moon',
};

const ACCENT_TEXT: Record<Product['accent'], string> = {
  amber: 'text-gradient-amber',
  moon: 'text-gradient-moon',
};

const ACCENT_LABEL: Record<Product['accent'], string> = {
  amber: 'text-amber/80',
  moon: 'text-moon/80',
};

const ACCENT_GLOW: Record<Product['accent'], string> = {
  amber: 'shadow-glow-amber',
  moon: 'shadow-glow-moon',
};

function NotFound() {
  return <Navigate to="/project" replace />;
}

export default function ProjectDetailPage() {
  const { id = '' } = useParams();
  const product = useMemo(() => PRODUCTS.find((p) => p.id === id), [id]);
  const { ref, visible } = useReveal<HTMLDivElement>({ threshold: 0.1 });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

  if (!product) return <NotFound />;

  // OpenCDK 走专属 Spotlight
  if (product.id === 'opencdk') {
    return (
      <div className="relative">
        <Navbar />
        <main className="pt-28">
          <div className="container">
            <div className="mb-10 flex items-center gap-4 flex-wrap">
              <Link to="/project" className="inline-flex h-10 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/60 px-4 text-sm text-parchment/80 transition-all duration-300 hover:border-amber/40 hover:bg-amber/5 hover:text-amber">
                <ArrowLeft className="h-4 w-4" />
                作品列表
              </Link>
              <Link to="/" className="inline-flex h-10 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/60 px-4 text-sm text-parchment/80 transition-all duration-300 hover:border-moon/40 hover:bg-moon/5 hover:text-moon">
                回到首页
              </Link>
            </div>
          </div>
          <OpenCDKSpotlight />
        </main>
        <Footer />
      </div>
    );
  }

  const features = FEATURES[product.id] || [];
  const roadmap = ROADMAP[product.id] || [];
  const isMoon = product.accent === 'moon';

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="pt-28 pb-24">
        <div className="container">
          <div className="mb-10 flex items-center gap-4 flex-wrap">
            <Link to="/project" className="inline-flex h-10 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/60 px-4 text-sm text-parchment/80 transition-all duration-300 hover:border-amber/40 hover:bg-amber/5 hover:text-amber">
              <ArrowLeft className="h-4 w-4" />
              作品列表
            </Link>
            <Link to="/" className="inline-flex h-10 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/60 px-4 text-sm text-parchment/80 transition-all duration-300 hover:border-moon/40 hover:bg-moon/5 hover:text-moon">
              回到首页
            </Link>
          </div>

          <div ref={ref} className="relative pb-20">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <div className={cn('absolute left-[5%] top-1/4 h-[400px] w-[400px] rounded-full blur-[120px]', isMoon ? 'bg-moon/5' : 'bg-amber/5')} />
              <div className={cn('absolute right-[5%] bottom-1/4 h-[300px] w-[300px] rounded-full blur-[100px]', isMoon ? 'bg-amber/5' : 'bg-moon/5')} />
            </div>

            <div className="relative">
              {/* 章节头 */}
              <div className={cn('mb-16 max-w-4xl transition-all duration-1000', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10')}>
                <div className="flex flex-wrap items-center gap-3">
                  <p className={cn('mono-label', ACCENT_LABEL[product.accent])}>§ Works · {product.tagline}</p>
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-wide', STATUS_STYLE[product.status])}>
                    <span className="h-1 w-1 rounded-full bg-current" />
                    {STATUS_LABEL[product.status]}
                  </span>
                </div>
                <h1 className="mt-4 display-serif text-5xl font-light leading-tight text-parchment md:text-7xl">
                  {product.name}<span className={cn('italic', ACCENT_TEXT[product.accent])}> · </span>
                  <span className={cn('text-6xl md:text-8xl', isMoon ? 'text-moon/20' : 'text-amber/20')}>{product.symbol}</span>
                </h1>
                <p className="mt-8 text-lg leading-relaxed text-parchment/75 md:text-xl">
                  {product.description}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a
                    href="https://github.com/Hedwig207"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/60 px-5 text-sm text-parchment/85 transition-all duration-300 hover:border-amber/40 hover:bg-amber/5 hover:text-amber"
                  >
                    <Github className="h-4 w-4" />
                    关注仓库
                  </a>
                  <button
                    type="button"
                    disabled
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-parchment/10 bg-parchment/5 px-5 text-sm text-parchment/40 cursor-not-allowed"
                  >
                    <Download className="h-4 w-4" />
                    {STATUS_LABEL[product.status]}中 · 即将开放下载
                  </button>
                  <a
                    href="#roadmap"
                    className="inline-flex h-11 items-center gap-2 text-sm text-parchment/70 transition-colors hover:text-parchment"
                  >
                    <Rocket className="h-4 w-4" />
                    查看开发路线
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* 特性区 */}
              <div className={cn('transition-all duration-1000', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10')} style={{ transitionDelay: '200ms' }}>
                <div className="mb-8 flex items-end justify-between">
                  <div>
                    <p className={cn('mono-label', ACCENT_LABEL[product.accent])}>§ Core Capabilities</p>
                    <h2 className="mt-2 display-serif text-3xl font-light text-parchment md:text-4xl">
                      核心<span className={cn('italic', ACCENT_TEXT[product.accent])}>能力</span>
                    </h2>
                  </div>
                  <span className="font-mono text-[0.7rem] text-slate-fog/50">{features.length} 个能力模块</span>
                </div>
                <div className="grid gap-5 md:grid-cols-3">
                  {features.map((f, i) => (
                    <div
                      key={f.title}
                      className={cn('group relative overflow-hidden rounded-2xl border border-parchment/10 bg-ink-800/40 p-6 transition-all duration-700 hover:-translate-y-1', isMoon ? 'hover:border-moon/40 hover:shadow-glow-moon' : 'hover:border-amber/40 hover:shadow-glow-amber')}
                      style={{ transitionDelay: `${i * 120}ms` }}
                    >
                      <div className={cn('pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100', ACCENT_RADIAL[product.accent])} />
                      <div className="relative">
                        <div className={cn('inline-flex h-11 w-11 items-center justify-center rounded-xl border border-parchment/10 bg-ink-900/60', ACCENT_GLOW[product.accent])}>
                          <f.icon className={cn('h-5 w-5', ACCENT_LABEL[product.accent])} />
                        </div>
                        <h3 className="mt-5 display-serif text-xl font-light text-parchment">{f.title}</h3>
                        <ul className="mt-4 space-y-2.5">
                          {f.items.map((it) => (
                            <li key={it} className="flex gap-2.5 text-sm leading-relaxed text-parchment/70">
                              <Wrench className="mt-1.5 h-3 w-3 shrink-0 text-slate-fog/60" />
                              <span>{it}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 路线图 */}
              <div id="roadmap" className={cn('mt-24 transition-all duration-1000', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10')} style={{ transitionDelay: '400ms' }}>
                <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
                  <div>
                    <p className={cn('mono-label', ACCENT_LABEL[product.accent])}>§ Nightly Roadmap</p>
                    <h2 className="mt-2 display-serif text-3xl font-light text-parchment md:text-4xl">
                      夜间<span className={cn('italic', ACCENT_TEXT[product.accent])}>开发路线</span>
                    </h2>
                  </div>
                  <span className="font-mono text-[0.7rem] text-slate-fog/50">night-shift · on-going</span>
                </div>

                <div className="relative border-l border-parchment/15 pl-8 md:pl-12">
                  {roadmap.map((r, i) => (
                    <div key={r.phase} className="relative pb-12 last:pb-0">
                      <span className={cn('absolute -left-[33px] md:-left-[49px] top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 bg-ink-950', isMoon ? 'border-moon/50' : 'border-amber/50')}>
                        <span className={cn('h-2 w-2 rounded-full', isMoon ? 'bg-moon' : 'bg-amber')} />
                      </span>
                      <div className="rounded-2xl border border-parchment/10 bg-ink-900/50 p-6">
                        <p className={cn('mono-label', ACCENT_LABEL[product.accent])}>Phase 0{i + 1}</p>
                        <h3 className="mt-2 display-serif text-2xl font-light text-parchment">{r.phase}</h3>
                        <ul className="mt-4 grid gap-2.5 sm:grid-cols-3">
                          {r.items.map((it) => (
                            <li key={it} className="flex gap-2.5 text-sm leading-relaxed text-parchment/70">
                              <Shield className="mt-1.5 h-3 w-3 shrink-0 text-slate-fog/60" />
                              <span>{it}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className={cn('mt-24 rounded-3xl border border-parchment/10 bg-ink-900/60 p-8 md:p-12 transition-all duration-1000', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10')} style={{ transitionDelay: '600ms' }}>
                <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                  <div className="max-w-xl">
                    <h3 className="display-serif text-2xl font-light text-parchment md:text-3xl">
                      在最深的夜里，和我们一起点亮 <span className={cn('italic', ACCENT_TEXT[product.accent])}>{product.name}</span>
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-parchment/65">
                      目前处于{STATUS_LABEL[product.status]}阶段。欢迎通过 GitHub / 群落与我们交流你的使用场景与期待，
                      我们会在每一个夜间版本里认真打磨。
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href="https://github.com/orgs/community/discussions/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/60 px-5 text-sm text-parchment/85 transition-all duration-300 hover:border-moon/40 hover:bg-moon/5 hover:text-moon"
                    >
                      <Users className="h-4 w-4" />
                      加入群落讨论
                    </a>
                    <a
                      href="https://github.com/Hedwig207"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-5 text-sm text-amber transition-all duration-300 hover:bg-amber/15"
                    >
                      <Rocket className="h-4 w-4" />
                      跟进开发进度
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

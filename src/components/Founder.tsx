import { useReveal } from '@/hooks/useReveal';
import { cn } from '@/lib/utils';
import { Wrench, Users, Compass, Shield, Github, Mail } from 'lucide-react';

const ROLES = [
  { label: '首席开发者', icon: Wrench },
  { label: '核心创始人之一', icon: Users },
  { label: '工作室主理人', icon: Compass },
  { label: '工作室顶梁柱', icon: Shield },
];

const IN_DEV_PROJECTS = [
  'Assembly Coder',
  'Bitlang',
  'codechat',
  'LE',
  'Mandel',
  'OpenCDK',
  'openHDK',
  'openRender',
  'Owl Craft Luncher',
  'OwlOS',
  'SuyuanAI',
];

export default function Founder() {
  const { ref, visible } = useReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section id="founder" className="relative py-32 md:py-40">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[5%] top-1/4 h-[400px] w-[400px] rounded-full bg-moon/5 blur-[120px]" />
        <div className="absolute right-[5%] bottom-1/4 h-[300px] w-[300px] rounded-full bg-amber/5 blur-[100px]" />
      </div>

      <div ref={ref} className="container relative">
        {/* 区块头 */}
        <div
          className={cn(
            'mb-16 text-center transition-all duration-1000',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          )}
        >
          <p className="mono-label text-moon/70">§ 02.5 — The Keeper</p>
          <h2 className="mt-3 display-serif text-4xl font-light leading-tight text-parchment md:text-6xl">
            守夜人<span className="italic text-gradient-moon">·</span> Hedwig
          </h2>
        </div>

        {/* 主体：左头像 + 右信息 */}
        <div
          className={cn(
            'grid gap-10 transition-all duration-1000 lg:grid-cols-[300px_1fr] lg:gap-16',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          )}
          style={{ transitionDelay: '150ms' }}
        >
          {/* 左：Hedwig 头像/符号 */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="relative">
              {/* 装饰光晕 */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-moon/20 via-amber/10 to-transparent blur-2xl" />
              {/* H 装饰框 */}
              <div className="relative flex h-60 w-60 items-center justify-center rounded-full border-2 border-amber/30 bg-ink-900/80 shadow-glow-amber md:h-72 md:w-72">
                <div className="absolute inset-2 rounded-full border border-moon/20" />
                <span className="display-serif text-8xl font-light leading-none text-gradient-amber md:text-9xl">
                  H
                </span>
                {/* 顶点标注 */}
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full border border-amber/40 bg-ink-950 px-2.5 py-0.5 font-mono text-[0.6rem] text-amber/80">
                  HEDWIG · 01
                </span>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-moon/40 bg-ink-950 px-2.5 py-0.5 font-mono text-[0.6rem] text-moon/80">
                  night-keeper
                </span>
              </div>
            </div>

            {/* 社交快捷按钮 */}
            <div className="mt-8 flex gap-3">
              <a
                href="https://github.com/Hedwig207"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/60 px-4 text-sm text-parchment/80 transition-all duration-300 hover:border-amber/40 hover:bg-amber/5 hover:text-amber"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
              <a
                href="mailto:hedwig38@163.com"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/60 px-4 text-sm text-parchment/80 transition-all duration-300 hover:border-moon/40 hover:bg-moon/5 hover:text-moon"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            </div>
          </div>

          {/* 右：介绍信息 */}
          <div>
            {/* 身份标签 */}
            <div
              className={cn(
                'flex flex-wrap gap-2 transition-all duration-1000',
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
              style={{ transitionDelay: '200ms' }}
            >
              {ROLES.map((r, i) => (
                <span
                  key={r.label}
                  className="inline-flex items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/50 px-3.5 py-1.5"
                  style={{ transitionDelay: `${250 + i * 60}ms` }}
                >
                  <r.icon className="h-3.5 w-3.5 text-amber/80" />
                  <span className="text-xs text-parchment/80">{r.label}</span>
                </span>
              ))}
            </div>

            {/* 自述 */}
            <div
              className={cn(
                'mt-8 transition-all duration-1000',
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
              style={{ transitionDelay: '300ms' }}
            >
              <blockquote className="relative border-l-2 border-amber/40 pl-6">
                <p className="display-serif text-xl font-light leading-relaxed text-parchment md:text-2xl">
                  一个人就是一支夜间工程队伍。
                </p>
                <p className="mt-5 text-base leading-relaxed text-parchment/75 md:text-lg">
                  OwlByte 几乎所有项目（游戏除外）均由 Hedwig 独立完成全栈开发——
                  从第一行代码到最后一像素的打磨，在最深的夜里由他亲手点亮。
                </p>
                <p className="mt-4 text-sm leading-relaxed text-parchment/55">
                  前端 · 后端 · 编译器 · 操作系统 · 渲染管线 · AI — 跨领域的全栈探索者，
                  在 OwlByte 的观察哨里，一个人担起整个工作室的重量。
                </p>
              </blockquote>
            </div>

            {/* 在制作品 */}
            <div
              className={cn(
                'mt-10 rounded-2xl border border-parchment/10 bg-ink-900/50 p-6 transition-all duration-1000 md:p-8',
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
              style={{ transitionDelay: '450ms' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="mono-label text-amber/70">IN DEVELOPMENT</p>
                  <h3 className="mt-2 display-serif text-xl font-light text-parchment md:text-2xl">
                    正在打磨的 <span className="text-gradient-moon italic">{IN_DEV_PROJECTS.length}</span> 件作品
                  </h3>
                </div>
                <span className="font-mono text-[0.7rem] text-slate-fog/50">night-shift · on-going</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {IN_DEV_PROJECTS.map((p, i) => (
                  <span
                    key={p}
                    className="group relative inline-flex items-center rounded-xl border border-parchment/10 bg-ink-800/40 px-3 py-1.5 font-mono text-xs text-parchment/75 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber/30 hover:text-amber"
                    style={{ transitionDelay: `${i * 40}ms` }}
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-moon/60 group-hover:bg-amber transition-colors" />
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 底部分隔 */}
        <div className="mt-24 flex items-center justify-center gap-3 text-slate-fog/40">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-parchment/20" />
          <Wrench className="h-4 w-4" />
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em]">night-keeper · hedwig</span>
          <Users className="h-4 w-4" />
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-parchment/20" />
        </div>
      </div>
    </section>
  );
}

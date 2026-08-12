import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wrench, Users, Compass, Shield, Github, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useReveal } from '@/hooks/useReveal';
import { cn } from '@/lib/utils';
import { WATCHMEN } from '@/data/brand';

const ROLE_ICONS: Record<string, any> = {
  '首席开发者': Wrench,
  '核心创始人之一': Users,
  '工作室主理人': Compass,
  '工作室顶梁柱': Shield,
};

function defaultIcon() {
  return Wrench;
}

export default function WatchmanHedwigPage() {
  const { ref, visible } = useReveal<HTMLDivElement>({ threshold: 0.1 });
  const hedwig = WATCHMEN[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container">
          <div className="mb-14 flex items-center gap-4 flex-wrap">
            <Link
              to="/watchman"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/60 px-4 text-sm text-parchment/80 transition-all duration-300 hover:border-amber/40 hover:bg-amber/5 hover:text-amber"
            >
              <ArrowLeft className="h-4 w-4" />
              守夜人列表
            </Link>
            <Link
              to="/"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/60 px-4 text-sm text-parchment/80 transition-all duration-300 hover:border-moon/40 hover:bg-moon/5 hover:text-moon"
            >
              回到首页
            </Link>
          </div>

          <div ref={ref} className="relative pb-24">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute left-[5%] top-1/4 h-[400px] w-[400px] rounded-full bg-moon/5 blur-[120px]" />
              <div className="absolute right-[5%] bottom-1/4 h-[300px] w-[300px] rounded-full bg-amber/5 blur-[100px]" />
            </div>

            <div className="relative">
              <div className={cn('mb-16 max-w-3xl transition-all duration-1000', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10')}>
                <p className="mono-label text-moon/70">§ 02.5 — The Keeper / 守夜人序列</p>
                <h1 className="mt-3 display-serif text-5xl font-light leading-tight text-parchment md:text-7xl">
                  守夜人<span className="italic text-gradient-moon">·</span> Hedwig
                </h1>
              </div>

              <div
                className={cn('grid gap-10 transition-all duration-1000 lg:grid-cols-[340px_1fr] lg:gap-16', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10')}
                style={{ transitionDelay: '150ms' }}
              >
                <div className="flex flex-col items-center lg:items-start">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-moon/20 via-amber/10 to-transparent blur-2xl" />
                    <div className="relative h-64 w-64 overflow-hidden rounded-full border-2 border-amber/30 bg-ink-900/80 shadow-glow-amber md:h-80 md:w-80">
                      <div className="absolute inset-2 overflow-hidden rounded-full border border-moon/20">
                        {hedwig.avatar ? (
                          <img src={hedwig.avatar} alt="Hedwig" className="h-full w-full object-cover" />
                        ) : (
                          <span className="display-serif text-9xl font-light leading-none text-gradient-amber">H</span>
                        )}
                      </div>
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full border border-amber/40 bg-ink-950 px-2.5 py-0.5 font-mono text-[0.6rem] text-amber/80">
                        {hedwig.code}
                      </span>
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-moon/40 bg-ink-950 px-2.5 py-0.5 font-mono text-[0.6rem] text-moon/80">
                        {hedwig.roleLabel}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3 flex-wrap justify-center lg:justify-start">
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

                <div>
                  <div className={cn('flex flex-wrap gap-2 transition-all duration-1000', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')} style={{ transitionDelay: '200ms' }}>
                    {hedwig.roles.map((r, i) => {
                      const Icon = ROLE_ICONS[r] || defaultIcon();
                      return (
                        <span
                          key={r}
                          className="inline-flex items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/50 px-3.5 py-1.5"
                          style={{ transitionDelay: `${250 + i * 60}ms` }}
                        >
                          <Icon className="h-3.5 w-3.5 text-amber/80" />
                          <span className="text-xs text-parchment/80">{r}</span>
                        </span>
                      );
                    })}
                  </div>

                  <div className={cn('mt-8 transition-all duration-1000', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')} style={{ transitionDelay: '300ms' }}>
                    <blockquote className="relative border-l-2 border-amber/40 pl-6">
                      <p className="display-serif text-2xl font-light leading-relaxed text-parchment md:text-3xl">
                        「{hedwig.quote}」
                      </p>
                      <p className="mt-5 text-base leading-relaxed text-parchment/75 md:text-lg">
                        {hedwig.description}
                      </p>
                      <p className="mt-4 text-sm leading-relaxed text-parchment/55">
                        前端 · 后端 · 编译器 · 操作系统 · 渲染管线 · AI — 跨领域的全栈探索者，
                        在 OwlByte 的观察哨里，一个人担起整个工作室的重量。
                      </p>
                    </blockquote>
                  </div>

                  <div className={cn('mt-10 rounded-2xl border border-parchment/10 bg-ink-900/50 p-6 transition-all duration-1000 md:p-8', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')} style={{ transitionDelay: '450ms' }}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="mono-label text-amber/70">IN DEVELOPMENT</p>
                        <h2 className="mt-2 display-serif text-xl font-light text-parchment md:text-2xl">
                          正在打磨的 <span className="text-gradient-moon italic">{hedwig.inDevProjects.length}</span> 件作品
                        </h2>
                      </div>
                      <span className="font-mono text-[0.7rem] text-slate-fog/50">night-shift · on-going</span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {hedwig.inDevProjects.map((p, i) => (
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
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-3 text-slate-fog/40">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-parchment/20" />
            <Wrench className="h-4 w-4" />
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em]">night-keeper · hedwig</span>
            <Users className="h-4 w-4" />
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-parchment/20" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, ArrowUpRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { WATCHMEN, type Watchman } from '@/data/brand';
import { useReveal } from '@/hooks/useReveal';
import { cn } from '@/lib/utils';

const ACCENT_CLASS: Record<Watchman['accent'], string> = {
  amber: 'hover:border-amber/40 hover:shadow-glow-amber',
  moon: 'hover:border-moon/40 hover:shadow-glow-moon',
  parchment: 'hover:border-parchment/30 hover:shadow-glow-moon',
};

const TEXT_ACCENT: Record<Watchman['accent'], string> = {
  amber: 'text-amber/80',
  moon: 'text-moon/80',
  parchment: 'text-parchment/80',
};

const SYMBOL_ACCENT: Record<Watchman['accent'], string> = {
  amber: 'text-amber/30',
  moon: 'text-moon/30',
  parchment: 'text-parchment/30',
};

const GRADIENT_ACCENT: Record<Watchman['accent'], string> = {
  amber: 'bg-radial-amber',
  moon: 'bg-radial-moon',
  parchment: 'bg-radial-moon',
};

function Card({ watchman, index }: { watchman: Watchman; index: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <Link
      ref={ref as any}
      to={watchman.href}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-parchment/10 bg-ink-800/40 p-7 transition-all duration-700 hover:-translate-y-1 min-h-[320px]',
        ACCENT_CLASS[watchman.accent],
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100',
          GRADIENT_ACCENT[watchman.accent]
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-amber/30 bg-ink-900/80">
          {watchman.avatar ? (
            <img src={watchman.avatar} alt={watchman.name} className="h-full w-full object-cover" />
          ) : (
            <span className="display-serif text-4xl font-light text-gradient-amber">
              {watchman.name[0]}
            </span>
          )}
        </div>
        <span className="font-mono text-[0.55rem] text-slate-fog/60">0{index + 1}</span>
      </div>

      <div className="relative mt-6 flex-1">
        <p className={cn('mono-label', TEXT_ACCENT[watchman.accent])}>
          {watchman.roleLabel} · {watchman.code}
        </p>
        <h3 className="mt-3 display-serif text-3xl font-light text-parchment">
          守夜人 · <span className={cn('italic', SYMBOL_ACCENT[watchman.accent]).replace('/30', '')}>{watchman.name}</span>
        </h3>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {watchman.roles.slice(0, 3).map((r) => (
            <span
              key={r}
              className="inline-flex items-center rounded-full border border-parchment/10 bg-ink-900/50 px-2.5 py-1 font-mono text-[0.6rem] text-parchment/75"
            >
              {r}
            </span>
          ))}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-parchment/65 line-clamp-3">
          {watchman.description}
        </p>

        <blockquote className="mt-4 border-l-2 border-amber/30 pl-4">
          <p className="display-serif text-base font-light italic text-parchment/80">
            「{watchman.quote}」
          </p>
        </blockquote>
      </div>

      <div className="relative mt-6 flex items-center gap-2 text-parchment/60 transition-colors group-hover:text-parchment">
        <span className="font-mono text-xs uppercase tracking-wide">查看人物介绍</span>
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}

export default function WatchmenPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container">
          <div className="mb-14 flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/60 px-4 text-sm text-parchment/80 transition-all duration-300 hover:border-moon/40 hover:bg-moon/5 hover:text-moon"
            >
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>
          </div>

          <div className="mb-20 max-w-3xl">
            <p className="mono-label text-moon/70">§ The Keeper — 守夜人总目</p>
            <h1 className="mt-3 display-serif text-5xl font-light leading-tight text-parchment md:text-7xl">
              守夜<span className="italic text-gradient-moon">人</span>序列
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-parchment/70">
              在最深的夜里，守夜人点亮观察哨。他们是支撑起 OwlByte 夜空的每一个名字——
              每一行代码、每一个像素、每一次彻夜的思考，都是他们亲手留下的痕迹。
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-parchment/20 bg-parchment/5 px-3 py-1 font-mono text-xs text-parchment/80">
                <Users className="h-3 w-3" />
                {WATCHMEN.length} 位守夜人
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-3 py-1 font-mono text-xs text-amber">
                首席开发者 · 主理人
              </span>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {WATCHMEN.map((w, i) => (
              <Card key={w.id} watchman={w} index={i} />
            ))}
          </div>

          <div className="mt-24 flex items-center justify-center gap-3 text-slate-fog/40">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-parchment/20" />
            <Users className="h-4 w-4" />
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em]">night-keeper · registry</span>
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-parchment/20" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

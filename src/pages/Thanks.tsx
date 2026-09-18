import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, GraduationCap, BookOpen, Sparkles, Compass } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useReveal } from '@/hooks/useReveal';
import { cn } from '@/lib/utils';

const TEACHERS = [
  {
    name: '唐老师',
    initial: '唐',
    accent: 'amber' as const,
    icon: Compass,
    dedication: '启蒙之恩',
    message:
      '是您为我推开了代码世界的大门。那些最初的语法、最初的逻辑、最初的"Hello, World"，都源自您的耐心指引。行稳致远的第一步，是您扶我上马。',
  },
  {
    name: '葛老师',
    initial: '葛',
    accent: 'moon' as const,
    icon: BookOpen,
    dedication: '治学之道',
    message:
      '您教会我的不只是知识本身，更是对待知识的姿态——严谨、踏实、刨根问底。每一次答疑、每一份批注，都在悄悄塑造我解决问题的思维方式。',
  },
  {
    name: '许老师',
    initial: '许',
    accent: 'parchment' as const,
    icon: Sparkles,
    dedication: '同行之谊',
    message:
      '感谢您在我困顿时的鼓励与提点。您让我明白，成长从来不是孤军奋战——有人愿意相信你、点拨你，是夜路上最珍贵的一盏灯。',
  },
];

const ACCENT_STYLE: Record<string, { border: string; text: string; glow: string; ring: string }> = {
  amber: {
    border: 'hover:border-amber/40',
    text: 'text-amber',
    glow: 'from-amber/10',
    ring: 'border-amber/30',
  },
  moon: {
    border: 'hover:border-moon/40',
    text: 'text-moon',
    glow: 'from-moon/10',
    ring: 'border-moon/30',
  },
  parchment: {
    border: 'hover:border-parchment/40',
    text: 'text-parchment',
    glow: 'from-parchment/10',
    ring: 'border-parchment/30',
  },
};

export default function ThanksPage() {
  const { ref, visible } = useReveal<HTMLDivElement>({ threshold: 0.1 });

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
              to="/"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/60 px-4 text-sm text-parchment/80 transition-all duration-300 hover:border-amber/40 hover:bg-amber/5 hover:text-amber"
            >
              <ArrowLeft className="h-4 w-4" />
              回到首页
            </Link>
          </div>

          <div ref={ref} className="relative pb-16">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute left-[10%] top-1/4 h-[400px] w-[400px] rounded-full bg-amber/5 blur-[120px]" />
              <div className="absolute right-[10%] bottom-1/4 h-[300px] w-[300px] rounded-full bg-moon/5 blur-[100px]" />
            </div>

            <div className="relative">
              <div className={cn('mb-6 max-w-3xl transition-all duration-1000', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10')}>
                <p className="mono-label text-moon/70">§ ACKNOWLEDGEMENTS — 致谢</p>
                <h1 className="mt-3 display-serif text-5xl font-light leading-tight text-parchment md:text-7xl">
                  灯火<span className="italic text-gradient-amber">·</span>致谢
                </h1>
              </div>

              <div className={cn('max-w-2xl transition-all duration-1000', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')} style={{ transitionDelay: '150ms' }}>
                <p className="text-base leading-relaxed text-parchment/70 md:text-lg">
                  OwlByte 的每一行代码背后，都站着我尚未言谢的人。
                  谨以此页，感谢我的三位老师——没有你们点亮的那盏灯，就没有这条夜行之路。
                </p>
              </div>

              <div className="mt-14 grid gap-6 md:grid-cols-3">
                {TEACHERS.map((t, i) => {
                  const style = ACCENT_STYLE[t.accent];
                  const Icon = t.icon;
                  return (
                    <div
                      key={t.name}
                      className={cn(
                        'glass-panel group relative overflow-hidden rounded-2xl border p-7 transition-all duration-500 hover:-translate-y-1',
                        style.border,
                        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                      )}
                      style={{ transitionDelay: `${250 + i * 120}ms` }}
                    >
                      <div className={cn('pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br to-transparent blur-3xl opacity-60', style.glow)} />

                      <div className="relative">
                        <div className="flex items-center justify-between">
                          <div className={cn('flex h-16 w-16 items-center justify-center rounded-full border-2 bg-ink-900/70 display-serif text-3xl font-light', style.ring, style.text)}>
                            {t.initial}
                          </div>
                          <Icon className={cn('h-5 w-5 opacity-50 transition-opacity group-hover:opacity-100', style.text)} />
                        </div>

                        <h2 className="mt-6 display-serif text-2xl font-light text-parchment">{t.name}</h2>
                        <p className={cn('mono-label mt-1.5', style.text)}>{t.dedication}</p>

                        <p className="mt-5 text-sm leading-relaxed text-parchment/70">
                          {t.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={cn('mt-14 flex items-center justify-center gap-3 text-slate-fog/50 transition-all duration-1000', visible ? 'opacity-100' : 'opacity-0')} style={{ transitionDelay: '700ms' }}>
                <GraduationCap className="h-4 w-4" />
                <span className="font-mono text-xs">师者，所以传道受业解惑也</span>
                <Heart className="h-4 w-4 text-amber/70" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

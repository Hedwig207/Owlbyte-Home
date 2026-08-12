import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { useCountUp } from '@/hooks/useCountUp';
import { SOCIALS, STATS } from '@/data/brand';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'loading' | 'success' | 'error';

function StatItem({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>({ threshold: 0.4 });
  const count = useCountUp(value, { duration: 1800, startOn: visible });
  return (
    <div
      ref={ref}
      className={cn(
        'border-l border-amber/30 pl-4 transition-all duration-700',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <p className="display-serif text-4xl font-light text-parchment md:text-5xl">
        {count.toLocaleString()}
        <span className="text-amber">{suffix}</span>
      </p>
      <p className="mt-1 mono-label text-slate-mist">{label}</p>
    </div>
  );
}

export default function Community() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const { ref: formRef, visible: formVisible } = useReveal<HTMLFormElement>({ threshold: 0.3 });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'loading' || status === 'success') return;
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    // 模拟提交
    await new Promise((r) => setTimeout(r, 900));
    setStatus('success');
    setTimeout(() => {
      setStatus('idle');
      setEmail('');
    }, 2400);
  };

  return (
    <section id="community" className="relative py-32 md:py-48">
      {/* 背景装饰光晕 */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber/5 blur-3xl" />
      </div>

      <div className="container">
        <div className="grid items-start gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
          {/* 左侧 — 邀请文案 + 统计 */}
          <div>
            <p className="mono-label text-amber/70">§ 04 — Community</p>
            <h2 className="mt-3 display-serif text-4xl font-light leading-[1.05] text-parchment md:text-6xl">
              加入<span className="italic text-gradient-amber">夜班</span>，
              <br />
              一起观察。
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-parchment/70">
              我们不发送噪声。每一封 OwlByte 信件都来自一次真实的夜间观察——
              产品进展、工程笔记、偶尔的一首深夜钢琴曲。
            </p>

            {/* 统计 */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              {STATS.map((s, i) => (
                <StatItem key={s.label} value={s.value} suffix={s.suffix} label={s.label} delay={i * 120} />
              ))}
            </div>

            {/* 社交链接 */}
            <div className="mt-14">
              <p className="mono-label mb-4 text-slate-mist">其它栖息地</p>
              <div className="flex flex-wrap gap-3">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="group inline-flex items-center gap-3 rounded-full border border-parchment/10 bg-ink-800/40 px-4 py-2.5 transition-all duration-300 hover:border-amber/40 hover:bg-amber/5"
                  >
                    <span className="text-sm text-parchment/80 transition-colors group-hover:text-amber">
                      {s.label}
                    </span>
                    <span className="font-mono text-xs text-slate-fog transition-colors group-hover:text-parchment/70">
                      {s.handle}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧 — 订阅卡 */}
          <div className="relative">
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className={cn(
                'glass-panel relative overflow-hidden rounded-3xl p-8 shadow-card transition-all duration-1000 md:p-10',
                formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
              noValidate
            >
              {/* 卡片装饰 — 角部刻度 */}
              <div className="absolute right-6 top-6 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber animate-blink" />
                <span className="mono-label text-slate-fog">Night Mail</span>
              </div>

              <h3 className="mt-2 display-serif text-2xl font-light text-parchment md:text-3xl">
                收下下一封夜信
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-parchment/60">
                留下邮箱地址。我们承诺：仅用于发送 OwlByte 内容，永不外泄，随时退订。
              </p>

              {/* 邮箱输入 */}
              <div className="relative mt-8">
                <label htmlFor="email" className="mono-label mb-2 block text-slate-mist">
                  邮箱地址
                </label>
                <div
                  className={cn(
                    'group relative flex items-center rounded-xl border bg-ink-950/60 transition-all duration-300',
                    status === 'error'
                      ? 'border-red-400/60 shadow-[0_0_0_3px_rgba(248,113,113,0.12)]'
                      : 'border-parchment/15 focus-within:border-amber/60 focus-within:shadow-glow-amber'
                  )}
                >
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    disabled={status === 'loading' || status === 'success'}
                    placeholder="you@nightshift.io"
                    className="flex-1 bg-transparent px-4 py-3.5 font-mono text-sm text-parchment placeholder:text-slate-fog focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className="relative m-1.5 inline-flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-amber text-ink-900 transition-all hover:shadow-glow-amber disabled:opacity-70"
                    aria-label="订阅"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : status === 'success' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {status === 'error' && (
                  <p className="mt-2 font-mono text-xs text-red-400/90">
                    请输入有效的邮箱地址。
                  </p>
                )}
              </div>

              {/* 成功反馈 */}
              {status === 'success' && (
                <div className="mt-6 flex items-center gap-3 rounded-xl border border-moon/30 bg-moon/5 p-4 animate-fade-up">
                  <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-moon/15 text-moon">
                    <Check className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-parchment">已加入夜班名单。</p>
                    <p className="mt-0.5 font-mono text-xs text-slate-mist">
                      下一封信将寄至 {email}
                    </p>
                  </div>
                </div>
              )}

              {/* 承诺细则 */}
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-parchment/8 pt-6">
                {['无追踪', '无广告', '一键退订', '开源工具链'].map((p) => (
                  <span key={p} className="flex items-center gap-1.5 font-mono text-[0.7rem] text-slate-mist">
                    <span className="h-1 w-1 rounded-full bg-moon" />
                    {p}
                  </span>
                ))}
              </div>
            </form>

            {/* 装饰 — 卡片下方的二进制流 */}
            <div className="pointer-events-none absolute -bottom-10 -right-2 hidden flex-col gap-0.5 lg:flex opacity-40">
              {['01001111 01010111 01001100', '01000010 01011001 01010100 01000101'].map((l, i) => (
                <span key={i} className="binary-stream">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

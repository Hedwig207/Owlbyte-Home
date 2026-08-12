import { useReveal } from '@/hooks/useReveal';
import { cn } from '@/lib/utils';

export default function Manifesto() {
  const { ref, visible } = useReveal<HTMLDivElement>({ threshold: 0.2 });

  const lines = [
    { text: '我们不追逐每一束光，', accent: false },
    { text: '只在夜的最深处，', accent: false },
    { text: '辨识真正值得留下的东西。', accent: true },
  ];

  return (
    <section id="manifesto" className="relative py-32 md:py-48">
      {/* 章节序号 */}
      <div className="container">
        <div className="mb-16 flex items-end justify-between">
          <div>
            <p className="mono-label text-amber/70">§ 01 — Manifesto</p>
            <h2 className="mt-3 display-serif text-3xl text-parchment md:text-4xl">
              夜行观察者宣言
            </h2>
          </div>
          <p className="hidden font-mono text-xs text-slate-fog md:block">
            — 写于午夜，校于黎明
          </p>
        </div>
      </div>

      {/* 装饰性引号 */}
      <div ref={ref} className="container relative">
        <span
          className={cn(
            'pointer-events-none absolute -left-2 -top-16 display-serif text-[12rem] leading-none text-amber/15 transition-opacity duration-1000 md:-left-8 md:text-[18rem]',
            visible ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden="true"
        >
          “
        </span>

        <div className="relative max-w-5xl">
          {lines.map((line, i) => (
            <p
              key={i}
              className={cn(
                'display-serif text-[clamp(2rem,5.5vw,4.5rem)] font-light leading-[1.15] tracking-tight transition-all duration-1000',
                visible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-6 blur-sm',
                line.accent ? 'text-gradient-amber italic' : 'text-parchment/80'
              )}
              style={{ transitionDelay: `${i * 200}ms` }}
            >
              {line.text}
            </p>
          ))}
        </div>

        {/* 哲学陈述 */}
        <div
          className={cn(
            'mt-20 grid gap-10 border-t border-parchment/10 pt-12 md:grid-cols-[1.2fr_1fr] md:gap-20',
            'transition-all duration-1000',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          )}
          style={{ transitionDelay: '700ms' }}
        >
          <div>
            <p className="mono-label mb-4 text-moon/80">哲学</p>
            <p className="text-lg leading-relaxed text-parchment/75">
              OwlByte 不是一座工厂，也不试图成为。
              它更像一座<span className="text-amber">夜间开放的天文台</span>——
              我们关掉所有不必要的灯，让真正重要的信号得以浮现。
              每一个产品都是一次观察，每一次发布都是一份夜空图。
            </p>
          </div>
          <div>
            <p className="mono-label mb-4 text-moon/80">承诺</p>
            <ul className="space-y-3 text-parchment/75">
              {[
                ['克制', '功能之上是判断，判断之上是放弃。'],
                ['可读', '代码与文档同等重要，都为读者而写。'],
                ['可离', '不锁定、不纠缠，你的数据随时可带走。'],
              ].map(([k, v]) => (
                <li key={k} className="flex gap-3">
                  <span className="mt-2 h-px w-3 flex-none bg-amber" />
                  <span>
                    <span className="text-parchment">{k}</span>
                    <span className="text-slate-mist"> — {v}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

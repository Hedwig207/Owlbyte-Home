import { useEffect, useState } from 'react';
import { ArrowRight, ArrowDown } from 'lucide-react';
import backpageUrl from '../../assets/image/backpage.png';
import { BINARY_LINES } from '@/data/brand';

/** 将文本切分为字符 span，用于 stagger 入场 */
function Chars({ text, baseDelay = 0 }: { text: string; baseDelay?: number }) {
  return (
    <span className="char-stagger" aria-label={text}>
      {text.split('').map((ch, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{ animationDelay: `${baseDelay + i * 55}ms` }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden">
      {/* 背景图 */}
      <div className="absolute inset-0 -z-10">
        <img
          src={backpageUrl}
          alt=""
          className="h-full w-full object-cover object-center"
          fetchPriority="high"
        />
        {/* 暗色径向渐变叠加 — 让左侧文字可读 */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/95 via-ink-900/70 to-ink-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-ink-950/60" />
        {/* 双色径向光晕 */}
        <div className="absolute inset-0 bg-radial-moon opacity-60" />
        <div className="absolute inset-0 bg-radial-amber opacity-50" />
        {/* 扫描线纹理 */}
        <div className="absolute inset-0 bg-scanline opacity-40 mix-blend-overlay" />
      </div>

      {/* 装饰：右侧二进制流 */}
      <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col gap-1 lg:flex opacity-50">
        {BINARY_LINES.map((line, i) => (
          <span
            key={i}
            className="binary-stream animate-blink"
            style={{ animationDelay: `${i * 300}ms` }}
          >
            {line}
          </span>
        ))}
      </div>

      {/* 装饰：右上角猫头鹰眼图样 */}
      <div className="pointer-events-none absolute right-12 top-28 hidden lg:block">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="animate-float">
          <circle cx="60" cy="60" r="58" stroke="#E8B65A" strokeOpacity="0.2" strokeWidth="0.5" />
          <circle cx="60" cy="60" r="44" stroke="#5FB8A8" strokeOpacity="0.15" strokeWidth="0.5" strokeDasharray="2 4" />
          <ellipse cx="48" cy="56" rx="14" ry="16" stroke="#E8B65A" strokeOpacity="0.4" strokeWidth="1" />
          <ellipse cx="72" cy="56" rx="14" ry="16" stroke="#E8B65A" strokeOpacity="0.4" strokeWidth="1" />
          <circle cx="48" cy="56" r="3" fill="#E8B65A" fillOpacity="0.6" />
          <circle cx="72" cy="56" r="3" fill="#E8B65A" fillOpacity="0.6" />
        </svg>
      </div>

      {/* 主内容 */}
      <div className="container relative z-10 flex min-h-[100svh] flex-col justify-center pt-28 pb-24">
        <div className="max-w-4xl">
          {/* 顶部标签 */}
          <div
            className={`mb-8 flex items-center gap-3 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber" />
            </span>
            <span className="mono-label text-parchment/60">
              Night Shift · 在线观察中
            </span>
            <span className="h-px w-12 bg-parchment/20" />
            <span className="mono-label text-slate-fog">EST. 2026</span>
          </div>

          {/* 主标题 */}
          <h1 className="display-serif text-[clamp(3.5rem,12vw,11rem)] font-light leading-[0.85] tracking-tightest">
            <span className="block text-parchment">
              <Chars text="OwlByte" baseDelay={200} />
            </span>
            <span
              className="mt-2 block italic text-amber/90"
              style={{ fontWeight: 300 }}
            >
              <span
                className={`inline-block transition-all duration-1000 ${
                  mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
                style={{ transitionDelay: '900ms' }}
              >
                夜行观察者
              </span>
            </span>
          </h1>

          {/* 副标题 */}
          <p
            className={`mt-10 max-w-xl text-base leading-relaxed text-parchment/70 transition-all duration-1000 sm:text-lg ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '1100ms' }}
          >
            我们在数据的洪流中安静地观察、过滤、守护。
            为工程师与思考者打造克制而精准的工具——
            <span className="text-parchment">不喧哗，不迷失，不留余烬。</span>
          </p>

          {/* CTA */}
          <div
            className={`mt-12 flex flex-wrap items-center gap-4 transition-all duration-1000 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '1300ms' }}
          >
            <a href="#products" className="btn-primary group">
              探看作品
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#manifesto" className="btn-ghost">
              阅读宣言
            </a>
          </div>
        </div>
      </div>

      {/* 滚动指示器 */}
      <a
        href="#manifesto"
        className={`absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 transition-opacity duration-1000 md:flex ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDelay: '1800ms' }}
        aria-label="向下滚动"
      >
        <span className="mono-label text-slate-fog">Scroll</span>
        <span className="relative h-12 w-px overflow-hidden bg-parchment/15">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-drift bg-amber" style={{ animationDuration: '2.4s' }} />
        </span>
        <ArrowDown className="h-3.5 w-3.5 text-amber/60" />
      </a>
    </section>
  );
}

import { useReveal } from '@/hooks/useReveal';
import { CAPABILITIES, type Capability } from '@/data/brand';
import { cn } from '@/lib/utils';

/** 几何图标 — 自绘 SVG，避免使用 lucide 通用图标 */
function Glyph({ glyph, className }: { glyph: Capability['glyph']; className?: string }) {
  if (glyph === 'eye') {
    return (
      <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
        <path d="M4 32 C 16 16, 48 16, 60 32 C 48 48, 16 48, 4 32 Z" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="9" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="3" fill="currentColor" />
        <line x1="32" y1="6" x2="32" y2="12" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="32" y1="52" x2="32" y2="58" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
      </svg>
    );
  }
  if (glyph === 'caliper') {
    return (
      <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="18" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.5" strokeDasharray="2 3" />
        <path d="M32 6 L32 58 M6 32 L58 32" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
        <circle cx="32" cy="32" r="3" fill="currentColor" />
        <path d="M50 14 L54 10 M50 50 L54 54 M10 10 L14 14 M10 54 L14 50" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  // shield
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path
        d="M32 4 L56 12 V32 C 56 46, 44 56, 32 60 C 20 56, 8 46, 8 32 V12 Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M32 14 L48 19 V32 C 48 41, 40 48, 32 51 C 24 48, 16 41, 16 32 V19 Z"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeOpacity="0.5"
      />
      <path d="M24 32 L30 38 L42 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ACCENT_MAP = {
  amber: {
    text: 'text-amber',
    border: 'group-hover:border-amber/40',
    bg: 'group-hover:bg-amber/5',
    glow: 'group-hover:shadow-glow-amber',
  },
  moon: {
    text: 'text-moon',
    border: 'group-hover:border-moon/40',
    bg: 'group-hover:bg-moon/5',
    glow: 'group-hover:shadow-glow-moon',
  },
  parchment: {
    text: 'text-parchment',
    border: 'group-hover:border-parchment/40',
    bg: 'group-hover:bg-parchment/5',
    glow: 'group-hover:shadow-card',
  },
} as const;

function Card({ cap, index }: { cap: Capability; index: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>({ threshold: 0.25 });
  const accent = ACCENT_MAP[cap.accent];

  return (
    <div
      ref={ref}
      className={cn(
        'group relative flex flex-col rounded-2xl border border-parchment/10 bg-ink-800/30 p-8 backdrop-blur-sm transition-all duration-700',
        accent.border,
        accent.bg,
        accent.glow,
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* 序号 */}
      <div className="flex items-center justify-between">
        <span className={cn('mono-label', accent.text)}>{cap.index}</span>
        <span className="font-mono text-[0.65rem] text-slate-fog">
          {cap.subtitle}
        </span>
      </div>

      {/* 图标 */}
      <div className={cn('mt-8 transition-transform duration-700 group-hover:rotate-6', accent.text)}>
        <Glyph glyph={cap.glyph} className="h-16 w-16" />
      </div>

      {/* 标题 */}
      <h3 className="mt-6 display-serif text-3xl font-light text-parchment">
        {cap.title}
      </h3>

      {/* 描述 */}
      <p className="mt-4 text-sm leading-relaxed text-parchment/70">
        {cap.description}
      </p>

      {/* 底部装饰线 */}
      <div className="mt-8 flex items-center gap-2">
        <span className={cn('h-px w-8 transition-all duration-700 group-hover:w-16', accent.text, 'bg-current')} />
        <span className="font-mono text-[0.6rem] text-slate-fog">
          0{index + 1} / 0{CAPABILITIES.length}
        </span>
      </div>
    </div>
  );
}

export default function Capabilities() {
  return (
    <section id="capabilities" className="relative py-32 md:py-48">
      <div className="container">
        {/* 章节头 */}
        <div className="mb-20 max-w-3xl">
          <p className="mono-label text-amber/70">§ 02 — Capabilities</p>
          <h2 className="mt-3 display-serif text-4xl font-light leading-tight text-parchment md:text-6xl">
            三种<span className="italic text-gradient-moon">夜行</span>本能
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-parchment/70">
            每一只猫头鹰都靠三种本能生存。我们的产品也由此构筑：
            <span className="text-parchment">看见、对准、守候</span>。
          </p>
        </div>

        {/* 三栏卡片 */}
        <div className="grid gap-6 md:grid-cols-3">
          {CAPABILITIES.map((cap, i) => (
            <Card key={cap.id} cap={cap} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

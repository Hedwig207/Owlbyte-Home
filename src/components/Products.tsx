import { useReveal } from '@/hooks/useReveal';
import { PRODUCTS, type Product } from '@/data/brand';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
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

const SPAN_CLASS: Record<Product['span'], string> = {
  tall: 'md:row-span-2',
  wide: 'md:col-span-2',
  regular: '',
};

function Card({ product, index }: { product: Product; index: number }) {
  const { ref, visible } = useReveal<HTMLAnchorElement>({ threshold: 0.2 });
  const isMoon = product.accent === 'moon';

  return (
    <Link
      ref={ref}
      to={product.href}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-parchment/10 bg-ink-800/40 p-7 transition-all duration-700 hover:-translate-y-1',
        SPAN_CLASS[product.span],
        isMoon ? 'hover:border-moon/40 hover:shadow-glow-moon' : 'hover:border-amber/40 hover:shadow-glow-amber',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      {/* hover 时显现的渐变背景 */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100',
          isMoon ? 'bg-radial-moon' : 'bg-radial-amber'
        )}
      />

      {/* 顶部：状态 + 代号 */}
      <div className="relative flex items-start justify-between">
        <div>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-widewide',
              STATUS_STYLE[product.status]
            )}
          >
            <span className="h-1 w-1 rounded-full bg-current" />
            {product.status}
          </span>
        </div>
        {/* 大代号字符 — 装饰 */}
        <span
          className={cn(
            'display-serif text-5xl font-light leading-none transition-transform duration-700 group-hover:scale-110',
            isMoon ? 'text-moon/30' : 'text-amber/30'
          )}
        >
          {product.symbol}
        </span>
      </div>

      {/* 底部内容 */}
      <div className="relative mt-12">
        <p className={cn('mono-label', isMoon ? 'text-moon/80' : 'text-amber/80')}>
          {product.tagline}
        </p>
        <h3 className="mt-3 display-serif text-3xl font-light text-parchment md:text-4xl">
          {product.name}
        </h3>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-parchment/65">
          {product.description}
        </p>

        {/* 行动指示 */}
        <div className="mt-6 flex items-center gap-2 text-parchment/60 transition-colors group-hover:text-parchment">
          <span className="font-mono text-xs uppercase tracking-widewide">
            {STATUS_LABEL[product.status]}
          </span>
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>

      {/* 边角刻度装饰 */}
      <span className="pointer-events-none absolute right-3 top-3 font-mono text-[0.55rem] text-slate-fog/60">
        0{index + 1}
      </span>
    </Link>
  );
}

export default function Products() {
  return (
    <section id="products" className="relative py-32 md:py-48">
      <div className="container">
        {/* 章节头 */}
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="mono-label text-amber/70">§ 03 — Works</p>
            <h2 className="mt-3 display-serif text-4xl font-light leading-tight text-parchment md:text-6xl">
              夜空<span className="italic text-gradient-amber">作品</span>图谱
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-parchment/70">
              四件正在打磨的工具，每一件都对应一种观察方式。
            </p>
          </div>
          <Link to="/project" className="btn-ghost">
            查看更多
          </Link>
        </div>

        {/* 非对称网格 */}
        <div className="grid auto-rows-[minmax(220px,auto)] gap-5 md:grid-cols-3">
          {PRODUCTS.map((product, i) => (
            <Card key={product.id} product={product} index={i} />
          ))}
        </div>

        {/* 底部统计 */}
        <ProductStats />
      </div>
    </section>
  );
}

function ProductStats() {
  const { ref, visible } = useReveal<HTMLDivElement>({ threshold: 0.3 });
  // 静态展示数字，避免引入额外 hook 复杂度
  const stats: Array<{ value: string; label: string }> = [
    { value: '99.9%', label: '夜间可用率' },
    { value: '< 12ms', label: '中位响应延迟' },
    { value: '0', label: '第三方追踪器' },
    { value: '∞', label: '可带走的数据' },
  ];

  return (
    <div
      ref={ref}
      className={cn(
        'mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-parchment/10 bg-parchment/10 transition-all duration-1000 md:grid-cols-4',
        visible ? 'opacity-100' : 'opacity-0'
      )}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="bg-ink-900/80 p-8 transition-all duration-700"
          style={{ transitionDelay: `${i * 100}ms` }}
        >
          <p className="display-serif text-4xl font-light text-gradient-amber md:text-5xl">
            {s.value}
          </p>
          <p className="mt-2 mono-label text-slate-mist">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

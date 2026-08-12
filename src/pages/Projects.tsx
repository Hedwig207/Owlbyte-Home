import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PRODUCTS, type Product } from '@/data/brand';
import { useReveal } from '@/hooks/useReveal';
import { cn } from '@/lib/utils';

const STATUS_LABEL: Record<Product['status'], string> = {
  GA: '正式可用',
  BETA: '公测中',
  PREVIEW: '预览',
};

const STATUS_STYLE: Record<Product['status'], string> = {
  GA: 'bg-amber/15 text-amber border-amber/30',
  BETA: 'bg-moon/15 text-moon border-moon/30',
  PREVIEW: 'bg-parchment/10 text-parchment/70 border-parchment/20',
};

function Card({ product, index }: { product: Product; index: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>({ threshold: 0.2 });
  const isMoon = product.accent === 'moon';

  return (
    <Link
      ref={ref as any}
      to={product.href.startsWith('/') ? product.href : '#'}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-parchment/10 bg-ink-800/40 p-7 transition-all duration-700 hover:-translate-y-1 min-h-[240px]',
        isMoon ? 'hover:border-moon/40 hover:shadow-glow-moon' : 'hover:border-amber/40 hover:shadow-glow-amber',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100',
          isMoon ? 'bg-radial-moon' : 'bg-radial-amber'
        )}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-wide', STATUS_STYLE[product.status])}>
            <span className="h-1 w-1 rounded-full bg-current" />
            {STATUS_LABEL[product.status]}
          </span>
        </div>
        <span className={cn('display-serif text-5xl font-light leading-none transition-transform duration-700 group-hover:scale-110', isMoon ? 'text-moon/30' : 'text-amber/30')}>
          {product.symbol}
        </span>
      </div>

      <div className="relative mt-10">
        <p className={cn('mono-label', isMoon ? 'text-moon/80' : 'text-amber/80')}>{product.tagline}</p>
        <h3 className="mt-3 display-serif text-3xl font-light text-parchment md:text-4xl">
          {product.name}
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-parchment/65">{product.description}</p>

        <div className="mt-6 flex items-center gap-2 text-parchment/60 transition-colors group-hover:text-parchment">
          <span className="font-mono text-xs uppercase tracking-wide">查看详情</span>
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>

      <span className="pointer-events-none absolute right-3 top-3 font-mono text-[0.55rem] text-slate-fog/60">
        0{index + 1}
      </span>
    </Link>
  );
}

export default function ProjectsPage() {
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
              className="inline-flex h-10 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/60 px-4 text-sm text-parchment/80 transition-all duration-300 hover:border-amber/40 hover:bg-amber/5 hover:text-amber"
            >
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>
          </div>

          <div className="mb-20 max-w-3xl">
            <p className="mono-label text-amber/70">§ Works — 作品总目</p>
            <h1 className="mt-3 display-serif text-5xl font-light leading-tight text-parchment md:text-7xl">
              夜空<span className="italic text-gradient-amber">作品</span>图谱
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-parchment/70">
              我们在最深的夜里打磨的每一件工具，都是一种观察世界的方式。
              这里收录了 OwlByte 所有在制与已发布的作品。
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-3 py-1 font-mono text-xs text-amber">
                {PRODUCTS.filter(p => p.status === 'GA').length} 件 · 正式可用
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-moon/30 bg-moon/10 px-3 py-1 font-mono text-xs text-moon">
                {PRODUCTS.filter(p => p.status === 'BETA').length} 件 · 公测中
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-parchment/20 bg-parchment/5 px-3 py-1 font-mono text-xs text-parchment/70">
                {PRODUCTS.filter(p => p.status === 'PREVIEW').length} 件 · 预览
              </span>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((product, i) => (
              <Card key={product.id} product={product} index={i} />
            ))}
          </div>

          <div className="mt-24 flex items-center justify-center gap-3 text-slate-fog/40">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-parchment/20" />
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em]">night-shift · works-catalog</span>
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-parchment/20" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

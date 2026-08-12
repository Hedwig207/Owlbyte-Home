import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import OwlLogo from './OwlLogo';
import { NAV_ITEMS, SOCIALS, PRODUCTS } from '@/data/brand';
import { cn } from '@/lib/utils';

export default function Footer() {
  const [progress, setProgress] = useState(0); // 0..1
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      setProgress(p);
      setShowTop(window.scrollY > 600);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 圆形进度环参数
  const R = 18;
  const C = 2 * Math.PI * R;

  return (
    <footer className="relative border-t border-parchment/10 bg-ink-950">
      <div className="container py-16 md:py-20">
        {/* 顶部：Logo + 描述 */}
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <OwlLogo animate />
            <p className="mt-6 text-sm leading-relaxed text-parchment/60">
              OwlByte 是一支小型、克制、夜间活跃的工程队伍。
              我们为工程师与思考者打造工具，相信少即是多，慢即是快。
            </p>
            <p className="mt-6 mono-label text-slate-fog">
              © 2026 OwlByte · 在夜间观察，在黎明交付
            </p>
          </div>

          {/* 导航列 */}
          <FooterCol title="章节" items={NAV_ITEMS.map((n) => ({ label: n.label, href: n.href }))} />
          <FooterCol title="作品" items={PRODUCTS.map((p) => ({ label: p.name, href: p.href }))} />
          <FooterCol title="栖息地" items={SOCIALS.map((s) => ({ label: s.label, href: s.href }))} />
        </div>

        {/* 底部条 */}
        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-parchment/8 pt-8 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-slate-fog">
            <span>Build 0.1.0-nightly</span>
            <span className="h-1 w-1 rounded-full bg-slate-fog/50" />
            <span>由 Vite + React 驱动</span>
            <span className="h-1 w-1 rounded-full bg-slate-fog/50" />
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-moon animate-blink" />
              所有系统运行中
            </span>
          </div>

          {/* 回到顶部按钮 — 带圆形进度环 */}
          <button
            type="button"
            onClick={scrollToTop}
            className={cn(
              'group inline-flex items-center gap-3 rounded-full border border-parchment/15 px-4 py-2.5 transition-all duration-500 hover:border-amber/50',
              showTop ? 'opacity-100 translate-y-0' : 'pointer-events-none translate-y-4 opacity-0'
            )}
            aria-label="回到顶部"
          >
            <span className="relative inline-flex h-10 w-10 items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r={R} fill="none" stroke="rgba(244,234,213,0.12)" strokeWidth="1.5" />
                <circle
                  cx="22"
                  cy="22"
                  r={R}
                  fill="none"
                  stroke="#E8B65A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - progress)}
                  style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                />
              </svg>
              <ArrowUp className="h-4 w-4 text-parchment transition-colors group-hover:text-amber" />
            </span>
            <span className="mono-label text-parchment/70 group-hover:text-amber">
              顶部 · {Math.round(progress * 100)}%
            </span>
          </button>
        </div>
      </div>

      {/* 底部巨型水印 Logo */}
      <div className="container overflow-hidden">
        <div className="pointer-events-none select-none border-t border-parchment/8 pt-8">
          <p className="display-serif text-[clamp(4rem,18vw,16rem)] font-light leading-[0.85] tracking-tightest text-parchment/[0.04]">
            OwlByte
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const onHome = location.pathname === '/';

  const handleClick = (e: React.MouseEvent, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.slice(1);
      if (onHome) {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.location.hash = href;
      } else {
        navigate('/', { state: { scrollTo: id } });
      }
    }
  };

  return (
    <div>
      <p className="mono-label mb-5 text-slate-fog">{title}</p>
      <ul className="space-y-3">
        {items.map((it, i) => {
          const isRoute = it.href.startsWith('/');
          const isAnchor = it.href.startsWith('#');
          const cls = 'group inline-flex items-center gap-2 text-sm text-parchment/70 transition-colors hover:text-amber';
          return (
            <li key={`${it.label}-${i}`}>
              {isRoute ? (
                <Link to={it.href} className={cls}>
                  <span className="h-px w-0 bg-amber transition-all duration-300 group-hover:w-3" />
                  {it.label}
                </Link>
              ) : isAnchor ? (
                <a href={onHome ? it.href : `/${it.href}`} onClick={(e) => handleClick(e, it.href)} className={cls}>
                  <span className="h-px w-0 bg-amber transition-all duration-300 group-hover:w-3" />
                  {it.label}
                </a>
              ) : (
                <a href={it.href} target={it.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={cls}>
                  <span className="h-px w-0 bg-amber transition-all duration-300 group-hover:w-3" />
                  {it.label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

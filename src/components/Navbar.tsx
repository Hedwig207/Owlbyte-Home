import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from '@/data/brand';
import OwlLogo from './OwlLogo';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 抽屉打开时锁滚动
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          scrolled ? 'py-3' : 'py-5'
        )}
      >
        <div className="container">
          <nav
            className={cn(
              'flex items-center justify-between rounded-full px-5 py-2.5 transition-all duration-500',
              scrolled
                ? 'glass-panel shadow-card'
                : 'border border-transparent bg-transparent'
            )}
          >
            <a href="#top" className="group" aria-label="OwlByte 首页">
              <OwlLogo />
            </a>

            {/* 桌面导航 */}
            <ul className="hidden items-center gap-8 lg:flex">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="group relative inline-flex items-center gap-1.5 text-sm text-parchment/70 transition-colors hover:text-parchment"
                  >
                    <span className="font-mono text-[0.65rem] text-amber/60 transition-colors group-hover:text-amber">
                      {item.index}
                    </span>
                    <span>{item.label}</span>
                    <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-amber transition-all duration-300 group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3">
              <a href="#community" className="btn-primary hidden sm:inline-flex !py-2 !px-4 !text-[0.7rem]">
                加入群落
              </a>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-parchment/15 text-parchment hover:border-amber/50 hover:text-amber transition-colors"
                aria-label="打开菜单"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* 移动端全屏抽屉 */}
      <div
        className={cn(
          'fixed inset-0 z-[60] lg:hidden transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div
          className="absolute inset-0 bg-ink-950/80 backdrop-blur-xl"
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            'absolute right-0 top-0 h-full w-[88%] max-w-sm border-l border-parchment/10 bg-ink-900 px-7 py-6 transition-transform duration-500',
            open ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="flex items-center justify-between">
            <OwlLogo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-parchment/15 text-parchment hover:border-amber/50 hover:text-amber transition-colors"
              aria-label="关闭菜单"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <ul className="mt-12 flex flex-col gap-2">
            {NAV_ITEMS.map((item, i) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-baseline gap-4 border-b border-parchment/8 py-4"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <span className="font-mono text-xs text-amber/60">{item.index}</span>
                  <span className="display-serif text-3xl text-parchment transition-colors group-hover:text-amber">
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#community"
            onClick={() => setOpen(false)}
            className="btn-primary mt-10 w-full"
          >
            加入群落
          </a>
          <p className="mono-label mt-10 text-slate-fog">
            Night Shift · v0.1.0
          </p>
        </div>
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { NAV_ITEMS } from '@/data/brand';
import OwlLogo from './OwlLogo';
import MoonPhaseGlyph from './MoonPhaseGlyph';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

function NavAnchor({ item }: { item: typeof NAV_ITEMS[number] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const onHome = location.pathname === '/';

  const onClick = (e: React.MouseEvent) => {
    const hash = item.href.startsWith('#') ? item.href : '#';
    if (onHome) {
      // 首页内滚动：默认浏览器锚点行为 + 手动滚动平滑
      e.preventDefault();
      const targetId = hash.slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.location.hash = hash;
      }
    } else {
      // 子页面 → 跳到首页并滚动
      e.preventDefault();
      navigate('/', { replace: false, state: { scrollTo: hash.slice(1) } });
    }
  };

  return (
    <a
      href={onHome ? item.href : `/${item.href}`}
      onClick={onClick}
      className="group relative inline-flex items-center gap-1.5 text-sm text-parchment/70 transition-colors hover:text-parchment"
    >
      <span className="font-mono text-[0.65rem] text-amber/60 transition-colors group-hover:text-amber">
        {item.index}
      </span>
      <span>{item.label}</span>
      <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-amber transition-all duration-300 group-hover:w-full" />
    </a>
  );
}

function MobileNavAnchor({ item, onClose }: { item: typeof NAV_ITEMS[number]; onClose: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === '/';

  const handleClick = (e: React.MouseEvent) => {
    onClose();
    const hash = item.href.startsWith('#') ? item.href : '#';
    if (onHome) {
      e.preventDefault();
      setTimeout(() => {
        const targetId = hash.slice(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.location.hash = hash;
        }
      }, 50);
    } else {
      e.preventDefault();
      navigate('/', { state: { scrollTo: hash.slice(1) } });
    }
  };

  return (
    <a
      href={onHome ? item.href : `/${item.href}`}
      onClick={handleClick}
      className="group flex items-baseline gap-4 border-b border-parchment/8 py-4"
    >
      <span className="font-mono text-xs text-amber/60">{item.index}</span>
      <span className="display-serif text-3xl text-parchment transition-colors group-hover:text-amber">
        {item.label}
      </span>
    </a>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // 当从子页面回到首页时，读取 state.scrollTo 并滚动
  useEffect(() => {
    if (location.pathname === '/' && location.state && typeof location.state === 'object' && 'scrollTo' in location.state) {
      const id = (location.state as any).scrollTo as string;
      if (id) {
        const fn = () => {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.location.hash = `#${id}`;
          }
        };
        // 下一帧执行，保证 DOM 已渲染
        window.requestAnimationFrame(() => setTimeout(fn, 60));
      }
    }
  }, [location]);

  const onLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const onJoinClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      document.getElementById('community')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      e.preventDefault();
      navigate('/', { state: { scrollTo: 'community' } });
    }
  };

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
            <Link to="/" onClick={onLogoClick} className="group" aria-label="OwlByte 首页">
              <OwlLogo />
            </Link>

            {/* 桌面导航 */}
            <ul className="hidden items-center gap-8 lg:flex">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <NavAnchor item={item} />
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3">
              {/* 月相 */}
              <span className="hidden items-center text-parchment/60 lg:inline-flex" title="今夜月相">
                <MoonPhaseGlyph size={18} />
              </span>

              {/* ⌘K 命令面板触发 */}
              <button
                type="button"
                onClick={() => setCommandOpen(true)}
                className="hidden h-9 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/40 px-3 text-xs text-parchment/60 transition-all duration-300 hover:border-amber/40 hover:text-amber lg:inline-flex"
                aria-label="打开命令面板"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="font-mono">⌘K</span>
              </button>

              <a href="#community" onClick={onJoinClick} className="btn-primary hidden sm:inline-flex !py-2 !px-4 !text-[0.7rem]">
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
            <Link to="/" onClick={() => setOpen(false)}>
              <OwlLogo />
            </Link>
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
              <li key={item.href} style={{ transitionDelay: `${i * 60}ms` }}>
                <MobileNavAnchor item={item} onClose={() => setOpen(false)} />
              </li>
            ))}
          </ul>
          <a
            href="#community"
            onClick={(e) => {
              setOpen(false);
              onJoinClick(e);
            }}
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

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  const { user, isAdmin, clear } = useAuthStore();

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  if (!user) return null;

  const initial = user.displayName?.charAt(0).toUpperCase() ?? '?';

  const onLogout = () => {
    clear();
    setOpen(false);
    navigate('/');
  };

  const onProfile = () => {
    setOpen(false);
    navigate('/profile');
  };

  const onAdmin = () => {
    setOpen(false);
    navigate('/admin/visitors');
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-full border transition-all duration-300',
          open
            ? 'border-amber/40 bg-amber/5'
            : 'border-parchment/15 bg-ink-800/40 hover:border-amber/40 hover:bg-amber/5'
        )}
        aria-label="用户菜单"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber/20 text-xs font-semibold text-amber">
            {initial}
          </span>
        )}
        <span className="hidden pr-3 text-sm text-parchment/80 sm:inline">
          {user.displayName}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-parchment/10 bg-ink-900/90 p-2 shadow-card backdrop-blur-xl">
          <div className="px-3 py-2 text-xs text-parchment/50">
            <div className="font-medium text-parchment/90">{user.displayName}</div>
            <div>{user.email}</div>
          </div>
          <div className="my-1 h-px bg-parchment/8" />
          <button
            type="button"
            onClick={onProfile}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-parchment/80 transition-colors hover:bg-parchment/5 hover:text-parchment"
          >
            <User className="h-4 w-4" />
            个人中心
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={onAdmin}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-parchment/80 transition-colors hover:bg-parchment/5 hover:text-parchment"
            >
              <ShieldCheck className="h-4 w-4" />
              管理员看板
            </button>
          )}
          <div className="my-1 h-px bg-parchment/8" />
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-300/80 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
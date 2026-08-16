import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import {
  Search, Github, Mail, MessageCircle, FolderGit2, User, Home,
  Moon, Sun, LayoutGrid, ScrollText, ExternalLink, Bug,
} from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { PRODUCTS, SOCIALS, NAV_ITEMS } from '@/data/brand';
import { useCommandPalette } from '@/hooks/useCommandPalette';

export default function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const navigate = useNavigate();
  const { setThemeMode, themeMode, setAutoNight } = useUiStore();
  const { isAuthenticated, isAdmin, clear } = useAuthStore();

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const goAnchor = (anchor: string) => {
    navigate('/');
    setTimeout(() => {
      const el = document.querySelector(anchor);
      el?.scrollIntoView({ behavior: 'smooth' });
      setOpen(false);
    }, 100);
  };

  const itemCls = 'flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-parchment aria-selected:bg-amber/10 aria-selected:text-amber';
  const groupHeadingCls =
    '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[0.6rem] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-slate-fog';

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="命令面板"
      className="fixed inset-0 z-[100] flex items-start justify-center bg-ink-950/80 backdrop-blur-sm pt-[15vh]"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-parchment/15 bg-ink-900/95 shadow-glow-amber">
        <Command.Input
          className="w-full border-b border-parchment/10 bg-transparent px-5 py-4 text-sm text-parchment outline-none placeholder:text-slate-fog"
          placeholder="搜索作品 / 跳转 / 切换主题…"
        />
        <Command.List className="max-h-[60vh] overflow-y-auto p-2">
          <Command.Empty className="px-4 py-6 text-center text-sm text-slate-fog">没有匹配项</Command.Empty>

          <Command.Group heading="导航" className={`px-2 ${groupHeadingCls}`}>
            <Command.Item onSelect={() => go('/')} className={itemCls}>
              <Home className="h-4 w-4 text-amber" />
              首页
            </Command.Item>
            <Command.Item onSelect={() => go('/project')} className={itemCls}>
              <LayoutGrid className="h-4 w-4 text-amber" />
              作品列表
            </Command.Item>
            <Command.Item onSelect={() => go('/watchman')} className={itemCls}>
              <User className="h-4 w-4 text-moon" />
              守夜人
            </Command.Item>
            <Command.Item onSelect={() => go('/update')} className={itemCls}>
              <ScrollText className="h-4 w-4 text-amber" />
              开发日志
            </Command.Item>
            <Command.Item onSelect={() => go('/bug-report')} className={itemCls}>
              <Bug className="h-4 w-4 text-rose-400" />
              Bug 反馈
            </Command.Item>
          </Command.Group>

          <Command.Group heading="首页锚点" className={`px-2 ${groupHeadingCls}`}>
            {NAV_ITEMS.map((item) => (
              <Command.Item
                key={item.label}
                onSelect={() => goAnchor(item.href)}
                className={itemCls}
              >
                <Search className="h-3.5 w-3.5 text-slate-fog" />
                {item.label}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="作品" className={`px-2 ${groupHeadingCls}`}>
            {PRODUCTS.map((p) => (
              <Command.Item
                key={p.id}
                onSelect={() => go(`/project/${p.id}`)}
                className={itemCls}
              >
                <FolderGit2 className="h-4 w-4 text-amber" />
                {p.name}
                <span className="ml-1 text-xs text-slate-fog">{p.tagline}</span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="主题" className={`px-2 ${groupHeadingCls}`}>
            <Command.Item onSelect={() => { setThemeMode('dark'); setAutoNight(false); setOpen(false); }} className={itemCls}>
              <Moon className="h-4 w-4 text-moon" />
              深色模式
              {themeMode === 'dark' && <span className="ml-auto text-xs text-amber">●</span>}
            </Command.Item>
            <Command.Item onSelect={() => { setThemeMode('light'); setAutoNight(false); setOpen(false); }} className={itemCls}>
              <Sun className="h-4 w-4 text-amber" />
              浅色模式
              {themeMode === 'light' && <span className="ml-auto text-xs text-amber">●</span>}
            </Command.Item>
          </Command.Group>

          <Command.Group heading="群落" className={`px-2 ${groupHeadingCls}`}>
            {SOCIALS.map((s) => (
              <Command.Item
                key={s.label}
                onSelect={() => { window.open(s.href, '_blank', 'noopener'); setOpen(false); }}
                className={itemCls}
              >
                {s.label === 'GitHub' ? <Github className="h-4 w-4 text-parchment" /> :
                 s.label === 'Email' ? <Mail className="h-4 w-4 text-parchment" /> :
                 <MessageCircle className="h-4 w-4 text-parchment" />}
                {s.label}
                <span className="ml-1 text-xs text-slate-fog">{s.handle}</span>
                <ExternalLink className="ml-auto h-3 w-3 text-slate-fog" />
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Separator className="my-1 h-px bg-parchment/10" />

          <Command.Group heading="账户" className={`px-2 ${groupHeadingCls}`}>
            {isAuthenticated ? (
              <>
                <Command.Item onSelect={() => go('/profile')} className={itemCls}>
                  <User className="h-4 w-4 text-amber" />
                  个人中心
                </Command.Item>
                {isAdmin && (
                  <Command.Item onSelect={() => go('/admin/visitors')} className={itemCls}>
                    <LayoutGrid className="h-4 w-4 text-amber" />
                    管理员看板
                  </Command.Item>
                )}
                <Command.Item onSelect={() => { clear(); go('/'); }} className={itemCls}>
                  <ExternalLink className="h-4 w-4 text-slate-fog" />
                  退出登录
                </Command.Item>
              </>
            ) : (
              <>
                <Command.Item onSelect={() => go('/login')} className={itemCls}>
                  <User className="h-4 w-4 text-amber" />
                  登录
                </Command.Item>
                <Command.Item onSelect={() => go('/register')} className={itemCls}>
                  <User className="h-4 w-4 text-moon" />
                  注册
                </Command.Item>
              </>
            )}
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
}

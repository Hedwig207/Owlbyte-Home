import { useEffect } from 'react';
import { useUiStore } from '@/stores/uiStore';

/**
 * 全局快捷键：⌘K / Ctrl+K 打开命令面板，ESC 关闭
 */
export function useCommandPalette() {
  const { commandOpen, setCommandOpen } = useUiStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // ⌘K (mac) / Ctrl+K (win/linux)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(true);
        return;
      }
      // ESC 关闭
      if (e.key === 'Escape' && commandOpen) {
        setCommandOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandOpen, setCommandOpen]);

  return { open: commandOpen, setOpen: setCommandOpen };
}

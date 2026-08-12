import { useEffect } from 'react';

/**
 * 鼠标跟随光晕：将鼠标坐标写入 --cursor-x / --cursor-y CSS 变量
 * 仅在桌面端（pointer: fine）启用
 */
export function useCursorGlow() {
  useEffect(() => {
    const media = window.matchMedia('(pointer: fine)');
    if (!media.matches) return;

    let raf = 0;
    const handle = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
      });
    };
    window.addEventListener('mousemove', handle, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handle);
      cancelAnimationFrame(raf);
    };
  }, []);
}

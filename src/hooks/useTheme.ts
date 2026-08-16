import { useEffect, useMemo } from 'react';
import { useUiStore } from '@/stores/uiStore';
import { useNightMode } from './useNightMode';
import { getMoonPhase } from '@/lib/moonPhase';

/**
 * 受控主题：
 * - 夜班自动模式开启 + 当前在 22:00-06:00 → 强制 dark
 * - 其他情况 → 尊重用户选择
 * - 应用 class 到 documentElement，持久化到 localStorage
 */
export function useTheme() {
  const { themeMode, autoNight, setThemeMode, setAutoNight } = useUiStore();
  const { isNight } = useNightMode();
  const moon = useMemo(() => getMoonPhase(), []);

  // 实际生效的主题
  const effective = autoNight && isNight ? 'dark' : themeMode;

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(effective);
  }, [effective]);

  // 持久化用户选择
  useEffect(() => {
    localStorage.setItem('owlbyte:theme', themeMode);
    localStorage.setItem('owlbyte:autoNight', String(autoNight));
  }, [themeMode, autoNight]);

  // 恢复
  useEffect(() => {
    const saved = localStorage.getItem('owlbyte:theme') as 'light' | 'dark' | null;
    if (saved === 'light' || saved === 'dark') {
      setThemeMode(saved);
    }
    const savedAuto = localStorage.getItem('owlbyte:autoNight');
    if (savedAuto === 'false') {
      setAutoNight(false);
    }
  }, [setThemeMode, setAutoNight]);

  return {
    theme: effective,
    isDark: effective === 'dark',
    isNight,
    moonPhase: moon,
    toggleTheme: () => setThemeMode(themeMode === 'light' ? 'dark' : 'light'),
    setTheme: setThemeMode,
  };
}

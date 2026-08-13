import { create } from 'zustand';

type ThemeMode = 'light' | 'dark';
type UiState = {
  // 主题
  themeMode: ThemeMode;
  autoNight: boolean; // 是否启用夜班自动切换（22:00-06:00 强制 dark）
  setThemeMode: (m: ThemeMode) => void;
  toggleThemeMode: () => void;
  setAutoNight: (v: boolean) => void;

  // 命令面板
  commandOpen: boolean;
  setCommandOpen: (v: boolean) => void;
  toggleCommand: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  themeMode: 'dark',
  autoNight: true,
  setThemeMode: (m) => set({ themeMode: m }),
  toggleThemeMode: () => set((s) => ({ themeMode: s.themeMode === 'light' ? 'dark' : 'light' })),
  setAutoNight: (v) => set({ autoNight: v }),

  commandOpen: false,
  setCommandOpen: (v) => set({ commandOpen: v }),
  toggleCommand: () => set((s) => ({ commandOpen: !s.commandOpen })),
}));

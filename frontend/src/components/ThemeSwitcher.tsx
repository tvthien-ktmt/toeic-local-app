import React from 'react';
import { Sun, Moon, Coffee } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { ThemeMode } from '../context/ThemeContext';

interface ThemeOption {
  mode: ThemeMode;
  label: string;
  icon: React.ReactNode;
}

/**
 * Compact theme selector toggle switching between Sáng (light), Tối (dark), and Đọc Đêm (night warm) color schemes.
 * Follows WCAG accessible interactive button standards with aria-label, aria-pressed, and focus-visible.
 */
export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes: ThemeOption[] = [
    { mode: 'light', label: 'Sáng', icon: <Sun className="w-3.5 h-3.5" /> },
    { mode: 'dark', label: 'Tối', icon: <Moon className="w-3.5 h-3.5" /> },
    { mode: 'night', label: 'Đọc Đêm', icon: <Coffee className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      role="group"
      aria-label="Chọn giao diện"
      className="inline-flex p-1 rounded-xl bg-theme-surface-2 border border-theme space-x-1 shadow-sm"
    >
      {themes.map((themeItem) => {
        const isActive = theme === themeItem.mode;

        return (
          <button
            key={themeItem.mode}
            type="button"
            onClick={() => setTheme(themeItem.mode)}
            aria-pressed={isActive}
            aria-label={`Giao diện ${themeItem.label}`}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-theme-accent focus-visible:outline-none ${
              isActive
                ? 'bg-theme-accent text-white shadow-md'
                : 'text-theme-secondary hover:text-theme-primary'
            }`}
            title={`Chuyển sang giao diện ${themeItem.label}`}
          >
            {themeItem.icon}
            <span className="hidden sm:inline">{themeItem.label}</span>
          </button>
        );
      })}
    </div>
  );
};

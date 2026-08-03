import React from 'react';
import { Sun, Moon, Coffee } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { ThemeMode } from '../context/ThemeContext';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'light', label: 'Sáng', icon: <Sun className="w-3.5 h-3.5" /> },
    { mode: 'dark', label: 'Tối', icon: <Moon className="w-3.5 h-3.5" /> },
    { mode: 'night', label: 'Đọc Đêm', icon: <Coffee className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="inline-flex p-1 rounded-xl bg-theme-surface-2 border border-theme space-x-1 shadow-sm">
      {themes.map((t) => {
        const isActive = theme === t.mode;
        return (
          <button
            key={t.mode}
            onClick={() => setTheme(t.mode)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              isActive
                ? 'bg-theme-accent text-white shadow-md'
                : 'text-theme-secondary hover:text-theme-primary'
            }`}
            title={`Chuyển sang giao diện ${t.label}`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};

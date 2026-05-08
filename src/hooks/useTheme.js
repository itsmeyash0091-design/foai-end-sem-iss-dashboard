import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('iss_theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('iss_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('iss_theme', 'light');
    }
  }, [isDark]);

  const toggle = () => setIsDark(d => !d);

  return { isDark, toggle };
}

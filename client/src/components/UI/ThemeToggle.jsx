import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ style }) => {
  const [isDark, setIsDark] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved === 'dark' || (!saved && prefersDark);
    setIsDark(dark);
    document.documentElement[dark ? 'setAttribute' : 'removeAttribute']('data-theme', 'dark');
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement[next ? 'setAttribute' : 'removeAttribute']('data-theme', 'dark');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: hovered
          ? 'linear-gradient(135deg, rgba(248,116,16,0.25), rgba(248,116,16,0.15))'
          : 'rgba(248,116,16,0.12)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(248,116,16,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: hovered ? '#e65c00' : 'var(--primary)',
        boxShadow: hovered
          ? '0 4px 16px rgba(248,116,16,0.25), 0 0 0 1px rgba(248,116,16,0.2)'
          : '0 2px 8px rgba(248,116,16,0.1)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        flexShrink: 0,
        ...style,
      }}
    >
      {isDark
        ? <Sun size={20} />
        : <Moon size={20} />
      }
    </button>
  );
};

export default ThemeToggle;

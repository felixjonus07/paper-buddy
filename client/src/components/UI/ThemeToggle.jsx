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
        borderRadius: '14px',
        background: hovered
          ? 'linear-gradient(135deg, rgba(248,116,16,0.18), rgba(248,116,16,0.08))'
          : 'var(--clay-base)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: hovered ? '#f87410' : 'var(--text-light)',
        boxShadow: hovered
          ? '0 4px 16px rgba(248,116,16,0.25), 0 0 0 1px rgba(248,116,16,0.2)'
          : 'var(--clay-btn)',
        transition: 'all 0.22s ease',
        transform: hovered ? 'scale(1.08) rotate(15deg)' : 'scale(1) rotate(0deg)',
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

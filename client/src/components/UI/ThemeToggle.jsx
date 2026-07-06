import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ style }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setIsDark(false);
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: 'var(--clay-base)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: 'var(--clay-btn)',
        color: 'var(--text-color)',
        transition: 'all 0.2s ease',
        ...style
      }}
      onMouseDown={(e) => e.currentTarget.style.boxShadow = 'var(--clay-pressed)'}
      onMouseUp={(e) => e.currentTarget.style.boxShadow = 'var(--clay-btn)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--clay-btn)'}
      title="Toggle Dark Mode"
    >
      {isDark ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  );
};

export default ThemeToggle;

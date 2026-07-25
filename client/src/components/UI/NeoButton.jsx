import React, { useState } from 'react';

const VARIANTS = {
  primary: {
    bg: 'var(--clay-primary-bg)',
    color: 'var(--clay-primary-text)',
    border: '1px solid var(--clay-primary-border)',
    shadow: 'var(--clay-btn-primary)',
    shadowHover: 'var(--clay-btn-primary)',
    shadowPressed: 'var(--clay-primary-pressed)',
  },
  mint: {
    bg: 'var(--clay-primary-bg)',
    color: 'var(--clay-primary-text)',
    border: '1px solid var(--clay-primary-border)',
    shadow: 'var(--clay-btn-primary)',
    shadowHover: 'var(--clay-btn-primary)',
    shadowPressed: 'var(--clay-primary-pressed)',
  },
  pink: {
    bg: 'var(--clay-primary-bg)',
    color: 'var(--clay-primary-text)',
    border: '1px solid var(--clay-primary-border)',
    shadow: 'var(--clay-btn-primary)',
    shadowHover: 'var(--clay-btn-primary)',
    shadowPressed: 'var(--clay-primary-pressed)',
  },
  peach: {
    bg: 'var(--clay-primary-bg)',
    color: 'var(--clay-primary-text)',
    border: '1px solid var(--clay-primary-border)',
    shadow: 'var(--clay-btn-primary)',
    shadowHover: 'var(--clay-btn-primary)',
    shadowPressed: 'var(--clay-primary-pressed)',
  },
  secondary: {
    bg: 'var(--clay-base)',
    color: 'var(--text-color)',
    border: '1px solid var(--border)',
    shadow: 'var(--clay-btn)',
    shadowHover: 'var(--clay-btn)',
    shadowPressed: 'var(--clay-pressed)',
  },
};

const NeoButton = ({ children, onClick, type = 'button', className = '', style, variant = 'primary', disabled = false }) => {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const v = VARIANTS[variant] || VARIANTS.primary;

  const shadow = pressed ? v.shadowPressed : hovered ? v.shadowHover : v.shadow;

  const baseStyle = {
    background: v.bg,
    backdropFilter: 'blur(12px) saturate(140%)',
    WebkitBackdropFilter: 'blur(12px) saturate(140%)',
    color: v.color,
    border: v.border || 'none',
    borderRadius: '50px',
    padding: '0.8rem 1.6rem',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: shadow,
    transform: pressed ? 'scale(0.96) translateY(1px)' : hovered ? 'scale(1.02) translateY(-1px)' : 'scale(1)',
    transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    opacity: disabled ? 0.5 : 1,
    letterSpacing: '0.01em',
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  return (
    <button
      type={type}
      className={`glass-btn ${className}`}
      style={baseStyle}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => !disabled && setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default NeoButton;

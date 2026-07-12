import React, { useState } from 'react';

const VARIANTS = {
  primary: {
    bg: 'var(--clay-primary-bg)',
    color: 'var(--clay-primary-text)',
    border: '1px solid var(--clay-primary-border)',
    shadow: '0 4px 12px rgba(248,116,16,0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
    shadowHover: '0 8px 24px rgba(248,116,16,0.25), inset 0 1px 0 rgba(255,255,255,0.7)',
    shadowPressed: '0 2px 4px rgba(248,116,16,0.1), inset 0 1px 0 rgba(255,255,255,0.3)',
  },
  mint: {
    bg: 'var(--clay-primary-bg)',
    color: 'var(--clay-primary-text)',
    border: '1px solid var(--clay-primary-border)',
    shadow: '0 4px 12px rgba(248,116,16,0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
    shadowHover: '0 8px 24px rgba(248,116,16,0.25), inset 0 1px 0 rgba(255,255,255,0.7)',
    shadowPressed: '0 2px 4px rgba(248,116,16,0.1), inset 0 1px 0 rgba(255,255,255,0.3)',
  },
  pink: {
    bg: 'var(--clay-primary-bg)',
    color: 'var(--clay-primary-text)',
    border: '1px solid var(--clay-primary-border)',
    shadow: '0 4px 12px rgba(248,116,16,0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
    shadowHover: '0 8px 24px rgba(248,116,16,0.25), inset 0 1px 0 rgba(255,255,255,0.7)',
    shadowPressed: '0 2px 4px rgba(248,116,16,0.1), inset 0 1px 0 rgba(255,255,255,0.3)',
  },
  peach: {
    bg: 'var(--clay-primary-bg)',
    color: 'var(--clay-primary-text)',
    border: '1px solid var(--clay-primary-border)',
    shadow: '0 4px 12px rgba(248,116,16,0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
    shadowHover: '0 8px 24px rgba(248,116,16,0.25), inset 0 1px 0 rgba(255,255,255,0.7)',
    shadowPressed: '0 2px 4px rgba(248,116,16,0.1), inset 0 1px 0 rgba(255,255,255,0.3)',
  },
  secondary: {
    bg: 'var(--clay-base)',
    color: 'var(--text-color)',
    border: '1px solid var(--border)',
    shadow: '0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.3)',
    shadowHover: '0 4px 20px rgba(0,0,0,0.1)',
    shadowPressed: 'inset 0 2px 8px rgba(0,0,0,0.15)',
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
      className={className}
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
      {/* shine overlay */}
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      {children}
    </button>
  );
};

export default NeoButton;

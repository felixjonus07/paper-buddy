import React, { useState } from 'react';

const NeoCard = ({ children, className = '', style, onClick, ...props }) => {
  const [hovered, setHovered] = useState(false);

  const baseStyle = {
    /* Core glass surface - very low opacity so bg glows bleed through */
    background: 'var(--clay-base)',
    backdropFilter: 'blur(32px) saturate(180%)',
    WebkitBackdropFilter: 'blur(32px) saturate(180%)',
    borderRadius: '24px',
    border: '1px solid var(--border)',
    padding: '1.5rem',
    boxShadow: hovered
      ? 'var(--clay-card), 0 0 0 1px rgba(248,116,16,0.18), 0 20px 60px rgba(0,0,0,0.25)'
      : 'var(--clay-card)',
    transition: 'box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease',
    transform: hovered && onClick ? 'translateY(-4px)' : 'translateY(0)',
    borderColor: hovered ? 'rgba(248,116,16,0.22)' : 'var(--border)',
    cursor: onClick ? 'pointer' : 'default',
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  return (
    <div
      className={className}
      style={baseStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      {...props}
    >
      {/* Top-edge shine */}
      <div style={{
        position: 'absolute', top: 0, left: '5%', right: '5%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)',
        pointerEvents: 'none',
      }} />
      {/* Subtle bottom-edge dark line for depth */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '1px',
        background: 'rgba(0,0,0,0.12)',
        pointerEvents: 'none',
      }} />
      {children}
    </div>
  );
};

export default NeoCard;

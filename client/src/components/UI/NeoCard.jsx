import React, { useState } from 'react';

const NeoCard = ({ children, className = '', style, onClick, ...props }) => {
  const [hovered, setHovered] = useState(false);

  const baseStyle = {
    borderRadius: '24px',
    border: '1px solid var(--border)',
    padding: '1.5rem',
    boxShadow: hovered
      ? 'var(--clay-card), 0 0 0 1px rgba(248,116,16,0.18), 0 20px 60px rgba(0,0,0,0.25)'
      : 'var(--clay-card)',
    transition: 'box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease',
    transform: hovered && onClick ? 'translateY(-4px) translateZ(0)' : 'translateY(0) translateZ(0)',
    borderColor: hovered ? 'rgba(248,116,16,0.22)' : 'var(--border)',
    cursor: onClick ? 'pointer' : 'default',
    position: 'relative',
    zIndex: hovered ? 10 : 1,
    overflow: 'hidden',
    willChange: 'transform, box-shadow',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
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
      {/* SEPARATE GLASS LAYER: completely fixes Chromium backdrop-filter dirty rect bugs! */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--clay-base)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        zIndex: -1,
        pointerEvents: 'none',
        borderRadius: 'inherit'
      }} />

      {/* Top-edge shine */}
      <div style={{
        position: 'absolute', top: 0, left: '5%', right: '5%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      {/* Subtle bottom-edge dark line for depth */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '1px',
        background: 'rgba(0,0,0,0.12)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      
      {children}
    </div>
  );
};

export default NeoCard;

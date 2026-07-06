import React, { useState } from 'react';

const NeoButton = ({ children, onClick, type = 'button', className = '', style, variant = 'primary' }) => {
  const [isPressed, setIsPressed] = useState(false);

  const getBackgroundColor = () => {
    switch(variant) {
      case 'primary': return 'var(--primary)';
      case 'mint': return 'var(--clay-mint)';
      case 'pink': return 'var(--clay-pink)';
      case 'peach': return 'var(--clay-peach)';
      default: return 'var(--clay-base)';
    }
  };

  const getShadow = () => {
    if (isPressed) {
      return variant === 'secondary' ? 'var(--clay-pressed)' : (variant === 'primary' ? 'var(--clay-primary-pressed)' : 'var(--clay-color-pressed)');
    }
    switch(variant) {
      case 'primary': return 'var(--clay-btn-primary)';
      case 'mint': return 'var(--clay-btn-mint)';
      case 'pink': return 'var(--clay-btn-pink)';
      case 'peach': return 'var(--clay-btn-peach)';
      default: return 'var(--clay-btn)';
    }
  };

  const baseStyle = {
    backgroundColor: getBackgroundColor(),
    color: variant === 'secondary' || !variant ? 'var(--text-color)' : 'var(--bg-color)',
    border: 'none',
    borderRadius: '50px', /* Pill shape */
    padding: '0.8rem 1.6rem',
    fontSize: '0.95rem',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: getShadow(),
    transform: isPressed ? 'scale(0.96) translateY(2px)' : 'scale(1) translateY(0)',
    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    ...style
  };

  return (
    <button
      type={type}
      className={className}
      style={baseStyle}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      {children}
    </button>
  );
};

export default NeoButton;

import React, { useState } from 'react';

const NeoButton = ({ children, onClick, type = 'button', className = '', style, variant = 'primary' }) => {
  const [isPressed, setIsPressed] = useState(false);

  const baseStyle = {
    backgroundColor: 'var(--bg-color)',
    color: variant === 'primary' ? 'var(--primary)' : 'var(--text-color)',
    border: 'none',
    borderRadius: '15px',
    padding: '0.8rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: isPressed ? 'var(--neu-inner-shadow)' : 'var(--neu-shadow)',
    transition: 'all 0.2s ease-in-out',
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

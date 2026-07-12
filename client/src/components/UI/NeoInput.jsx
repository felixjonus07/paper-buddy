import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const NeoInput = ({ type = 'text', placeholder, value, onChange, name, required = false, className = '', Icon }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const wrapperStyle = {
    position: 'relative',
    width: '100%',
  };

  const inputStyle = {
    width: '100%',
    background: focused
      ? 'rgba(248,116,16,0.04)'
      : 'var(--clay-base)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: focused
      ? '1px solid rgba(248,116,16,0.5)'
      : '1px solid var(--border-strong)',
    borderRadius: '16px',
    padding: `0.875rem ${isPassword ? '3rem' : '1.25rem'} 0.875rem ${Icon ? '3rem' : '1.25rem'}`,
    fontSize: '0.9rem',
    fontWeight: '500',
    color: 'var(--text-color)',
    outline: 'none',
    boxShadow: focused
      ? '0 0 0 3px rgba(248,116,16,0.12), 0 4px 16px rgba(248,116,16,0.08)'
      : 'inset 0 1px 3px rgba(0,0,0,0.06)',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  };

  const iconStyle = (side) => ({
    position: 'absolute',
    [side]: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: focused ? 'var(--primary)' : 'var(--text-light)',
    display: 'flex',
    alignItems: 'center',
    zIndex: 1,
    transition: 'color 0.2s ease',
  });

  return (
    <div style={wrapperStyle}>
      {Icon && (
        <div style={iconStyle('left')}>
          <Icon size={17} />
        </div>
      )}
      <input
        type={inputType}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={className}
        style={inputStyle}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {isPassword && (
        <div
          onClick={() => setShowPassword(!showPassword)}
          style={{ ...iconStyle('right'), cursor: 'pointer' }}
        >
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </div>
      )}
    </div>
  );
};

export default NeoInput;

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const NeoInput = ({ type = 'text', placeholder, value, onChange, name, required = false, className = '', icon: Icon }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {Icon && (
        <div style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-light)', /* Softer icon color */
          display: 'flex',
          zIndex: 1
        }}>
          <Icon size={18} />
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
        style={{
          width: '100%',
          backgroundColor: 'var(--bg-color)', /* Darker/Sunken appearance */
          border: 'none',
          borderRadius: '50px', /* Pill shape */
          padding: `1rem ${isPassword ? '3rem' : '1.5rem'} 1rem ${Icon ? '3rem' : '1.5rem'}`,
          fontSize: '0.95rem',
          fontWeight: '700',
          color: 'var(--text-color)',
          boxShadow: 'var(--clay-pressed)', /* Deep inset shadow for that sunken clay hole look */
          outline: 'none',
          transition: 'all 0.2s ease'
        }}
        onFocus={(e) => {
          e.target.style.boxShadow = 'var(--clay-pressed), 0 0 0 2px var(--primary-light)';
        }}
        onBlur={(e) => {
          e.target.style.boxShadow = 'var(--clay-pressed)';
        }}
      />
      {isPassword && (
        <div 
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-light)',
            display: 'flex',
            zIndex: 1,
            cursor: 'pointer'
          }}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </div>
      )}
    </div>
  );
};

export default NeoInput;

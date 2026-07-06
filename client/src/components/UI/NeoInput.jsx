import React from 'react';

const NeoInput = ({ type = 'text', placeholder, value, onChange, name, required = false, className = '', icon: Icon }) => {
  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: '1.5rem' }}>
      {Icon && (
        <div style={{
          position: 'absolute',
          left: '15px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-light)',
          display: 'flex'
        }}>
          <Icon size={20} />
        </div>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={className}
        style={{
          width: '100%',
          backgroundColor: 'var(--bg-color)',
          border: 'none',
          borderRadius: '15px',
          padding: Icon ? '1rem 1rem 1rem 3rem' : '1rem',
          fontSize: '1rem',
          color: 'var(--text-color)',
          boxShadow: 'var(--neu-inner-shadow)',
          outline: 'none',
          transition: 'all 0.2s ease'
        }}
      />
    </div>
  );
};

export default NeoInput;

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const NeoSelect = ({ value, onChange, options, placeholder, required, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      {/* Hidden select for standard form submission/validation if needed */}
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        required={required}
        style={{ display: 'none' }}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '1rem',
          borderRadius: '20px',
          backgroundColor: 'var(--clay-base)',
          boxShadow: isOpen 
            ? 'var(--clay-pressed)'
            : 'inset 5px 5px 10px rgba(163, 177, 198, 0.4), inset -5px -5px 10px rgba(255, 255, 255, 0.8)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          color: selectedOption ? 'var(--text-color)' : 'var(--text-light)',
          fontSize: '0.95rem',
          userSelect: 'none'
        }}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '0.5rem',
          backgroundColor: 'var(--clay-base)',
          borderRadius: '15px',
          boxShadow: 'var(--clay-outer)',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          padding: '0.5rem'
        }}>
          {/* Default Option (placeholder) */}
          <div
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            style={{
              padding: '0.8rem',
              borderRadius: '10px',
              cursor: 'pointer',
              color: 'var(--text-light)',
              backgroundColor: value === '' ? 'var(--overlay-bg)' : 'transparent',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--overlay-bg)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = value === '' ? 'var(--overlay-bg)' : 'transparent'}
          >
            {placeholder}
          </div>
          
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                padding: '0.8rem',
                borderRadius: '10px',
                cursor: 'pointer',
                color: 'var(--text-color)',
                backgroundColor: value === opt.value ? 'var(--overlay-bg)' : 'transparent',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--overlay-bg)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = value === opt.value ? 'var(--overlay-bg)' : 'transparent'}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NeoSelect;

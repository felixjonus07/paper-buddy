import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

const NeoSelect = ({ value, onChange, options, placeholder, required, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        if (!event.target.closest('.neo-select-dropdown')) {
          setIsOpen(false);
        }
      }
    };
    
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        zIndex: 999999,
      });
      
      const handleScroll = (e) => {
        if (!e.target.closest?.('.neo-select-dropdown')) {
          setIsOpen(false);
        }
      };
      
      window.addEventListener('scroll', handleScroll, true);
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

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
          backgroundColor: 'rgba(128,128,128,0.1)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: isOpen ? 'var(--clay-pressed)' : 'var(--clay-card)',
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

      {isOpen && createPortal(
        <div className="neo-select-dropdown" style={{
          ...dropdownStyle,
          backgroundColor: 'var(--bg-color)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
          maxHeight: '200px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          padding: '0.5rem'
        }}>
          <div
            onClick={() => { onChange(''); setIsOpen(false); }}
            style={{
              padding: '0.8rem', borderRadius: '10px', cursor: 'pointer',
              color: 'var(--text-light)', backgroundColor: value === '' ? 'var(--overlay-bg)' : 'transparent',
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
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              style={{
                padding: '0.8rem', borderRadius: '10px', cursor: 'pointer',
                color: 'var(--text-color)', backgroundColor: value === opt.value ? 'var(--overlay-bg)' : 'transparent',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--overlay-bg)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = value === opt.value ? 'var(--overlay-bg)' : 'transparent'}
            >
              {opt.label}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default NeoSelect;

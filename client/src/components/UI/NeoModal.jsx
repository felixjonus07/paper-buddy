import React from 'react';
import NeoCard from './NeoCard';
import { X } from 'lucide-react';

const NeoModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'var(--overlay-bg)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <NeoCard style={{
        position: 'relative',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        animation: 'slideUp 0.3s ease-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: 'var(--primary)' }}>{title}</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'var(--clay-base)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-light)',
              boxShadow: 'var(--clay-btn)',
              transition: 'all 0.2s ease'
            }}
            onMouseDown={(e) => e.currentTarget.style.boxShadow = 'var(--clay-pressed)'}
            onMouseUp={(e) => e.currentTarget.style.boxShadow = 'var(--clay-btn)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--clay-btn)'}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </NeoCard>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default NeoModal;

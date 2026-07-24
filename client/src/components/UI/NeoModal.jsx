import React from 'react';
import { X } from 'lucide-react';

const NeoModal = ({ isOpen, onClose, title, children, width = '100%', maxWidth = '520px' }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px) saturate(150%)',
        WebkitBackdropFilter: 'blur(12px) saturate(150%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div style={{
        position: 'relative',
        width,
        maxWidth,
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'var(--bg-color)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderRadius: '28px',
        border: '1px solid rgba(248,116,16,0.15)',
        boxShadow: `
          0 0 0 1px rgba(255,255,255,0.06),
          0 24px 64px rgba(0,0,0,0.5),
          0 8px 24px rgba(0,0,0,0.3),
          inset 0 1px 0 rgba(255,255,255,0.1)
        `,
        padding: '2rem',
        animation: 'popIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {/* Orange accent bar at top */}
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #f87410, transparent)',
          borderRadius: '0 0 4px 4px',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-light)',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,116,16,0.15)'; e.currentTarget.style.color = '#f87410'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-light)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default NeoModal;

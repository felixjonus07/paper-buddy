import React from 'react';

const NeoCard = ({ children, className = '', style }) => {
  return (
    <div 
      className={className}
      style={{
        backgroundColor: 'var(--bg-color)',
        borderRadius: '20px',
        boxShadow: 'var(--neu-shadow)',
        padding: '2rem',
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default NeoCard;

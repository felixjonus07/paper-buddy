import React from 'react';

const NeoCard = ({ children, className = '', style }) => {
  return (
    <div 
      className={className}
      style={{
        backgroundColor: 'var(--clay-base)',
        borderRadius: '30px', /* Increased for softer, fluffier feel */
        boxShadow: 'var(--clay-card)',
        padding: '1.8rem', 
        border: 'none', /* Removed sharp border */
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default NeoCard;

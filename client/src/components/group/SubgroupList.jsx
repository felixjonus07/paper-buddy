import React from 'react';
import NeoCard from '../UI/NeoCard';

const SubgroupList = ({ subgroups, navigate }) => {
  if (!subgroups || subgroups.length === 0) return null;

  return (
    <NeoCard style={{ flex: '1', minWidth: '300px' }}>
      <h3 style={{ marginBottom: '1rem' }}>Subgroups</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {subgroups.map(sub => (
          <div 
            key={sub._id}
            onClick={() => {
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              const basePath = user.role === 'mentor' ? '/mentor' : '/admin';
              navigate(`${basePath}/groups/${sub._id}`);
            }}
            style={{
              padding: '1rem',
              backgroundColor: 'var(--clay-base)',
              borderRadius: '15px',
              cursor: 'pointer',
              boxShadow: 'var(--clay-btn)',
              transition: 'all 0.2s',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>{sub?.name || 'Unnamed Group'}</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>{sub?.description || 'No description'}</p>
          </div>
        ))}
      </div>
    </NeoCard>
  );
};

export default SubgroupList;

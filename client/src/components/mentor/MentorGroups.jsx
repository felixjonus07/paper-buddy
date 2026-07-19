import React from 'react';
import NeoCard from '../UI/NeoCard';

const MentorGroups = ({ groups, navigate }) => {
  return (
    <div className="card-grid">
      {groups.map(g => (
        <NeoCard 
          key={g._id} 
          style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1.2rem', cursor: 'pointer' }} 
          onClick={() => navigate('/mentor/groups/' + g._id)}
        >
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{g.name}</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)', flex: 1 }}>{g.description || 'No description provided'}</p>
          
          {g.isGlobal && (
            <span style={{ 
              fontSize: '0.8rem', color: 'var(--primary-dark)', display: 'inline-block', 
              backgroundColor: 'var(--clay-peach-light)', 
              padding: '0.2rem 0.5rem', borderRadius: '8px', alignSelf: 'flex-start', fontWeight: 'bold' 
            }}>
              GLOBAL GROUP
            </span>
          )}
        </NeoCard>
      ))}
      {groups.length === 0 && <p style={{ color: 'var(--text-light)' }}>No groups assigned.</p>}
    </div>
  );
};

export default MentorGroups;

import React from 'react';
import NeoCard from '../UI/NeoCard';
import NeoButton from '../UI/NeoButton';
import { Plus, Users } from 'lucide-react';

const GroupManagement = ({
  groups,
  navigate,
  setGroupModalOpen,
  setEditGroupData,
  setEditGroupModalOpen,
  setSelectedGroupForSub,
  setAssignSubgroupModalOpen,
  mentorData,
  setMentorData,
  setCreateMentorModalOpen,
  isReadOnly
}) => {
  return (
    <div style={{ animation: 'slideUp 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)' }}>Group Management</h2>
        {!isReadOnly && (
          <NeoButton variant="pink" onClick={() => setGroupModalOpen(true)}>
            <Plus size={20} /> Create Group
          </NeoButton>
        )}
      </div>
      
      <div className="card-grid">
        {groups.map(g => (
          <NeoCard key={g._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1.2rem', cursor: 'pointer' }} onClick={() => navigate('/admin/groups/' + g._id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{g.name}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                {new Date(g.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            {g.parentGroups && g.parentGroups.length > 0 && (
              <span style={{ 
                fontSize: '0.8rem', color: 'var(--primary-dark)', display: 'inline-block', 
                backgroundColor: 'var(--clay-peach-light)', 
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.4)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.5)',
                padding: '0.2rem 0.5rem', borderRadius: '8px', alignSelf: 'flex-start', fontWeight: 'bold' 
              }}>
                Subgroup of: {g.parentGroups.map(p => p.name).join(', ')}
              </span>
            )}
            
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)', flex: 1 }}>{g.description || 'No description provided'}</p>
            
            {!isReadOnly && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(128,128,128,0.1)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <NeoButton variant="mint" style={{ flex: '1 1 45%', padding: '0.5rem', fontSize: '0.85rem' }} onClick={(e) => { 
                  e.stopPropagation(); 
                  setEditGroupData({ _id: g._id, name: g.name, description: g.description || '', isGlobal: g.isGlobal || false });
                  setEditGroupModalOpen(true);
                }}>
                  Edit
                </NeoButton>
                <NeoButton variant="pink" style={{ flex: '1 1 45%', padding: '0.5rem', fontSize: '0.85rem' }} onClick={(e) => { e.stopPropagation(); setSelectedGroupForSub(g); setAssignSubgroupModalOpen(true); }}>
                  Parent Group
                </NeoButton>
                <NeoButton variant="secondary" style={{ flex: '1 1 100%', padding: '0.5rem', fontSize: '0.85rem' }} onClick={(e) => { 
                  e.stopPropagation(); 
                  setMentorData({ ...mentorData, groupId: g._id });
                  setCreateMentorModalOpen(true);
                }}>
                  <Users size={16} style={{ display: 'inline', marginRight: '5px' }} /> Create Mentor
                </NeoButton>
              </div>
            )}
          </NeoCard>
        ))}
        {groups.length === 0 && <p style={{ textAlign: 'center', width: '100%', color: 'var(--text-light)' }}>No groups found</p>}
      </div>
    </div>
  );
};

export default GroupManagement;

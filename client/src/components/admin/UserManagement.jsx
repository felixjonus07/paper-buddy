import React from 'react';
import NeoCard from '../UI/NeoCard';
import NeoButton from '../UI/NeoButton';
import { Plus } from 'lucide-react';

const UserManagement = ({
  users,
  expandedUser,
  setExpandedUser,
  setUserModalOpen,
  setEditUserData,
  setEditUserModalOpen,
  setSelectedUserForGroup,
  setAssignStudentModalOpen,
  isReadOnly
}) => {
  return (
    <div style={{ animation: 'slideUp 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)' }}>User Management</h2>
        {!isReadOnly && (
          <NeoButton variant="mint" onClick={() => setUserModalOpen(true)}>
            <Plus size={20} /> Bulk Create
          </NeoButton>
        )}
      </div>
      
      <div className="card-grid">
        {users.map(u => (
          <NeoCard key={u._id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.2rem', cursor: 'pointer' }} onClick={() => setExpandedUser(expandedUser === u._id ? null : u._id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0 }}>{u.name}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>@{u.username}</span>
              </div>
              <span style={{ 
                padding: '0.3rem 0.6rem', 
                borderRadius: '12px', 
                backgroundColor: u.role === 'admin' ? 'var(--clay-pink-light)' : 'var(--clay-mint-light)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.4)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.5)',
                color: u.role === 'admin' ? 'var(--primary-dark)' : 'var(--primary)',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {u.role.toUpperCase()}
              </span>
            </div>

            {expandedUser === u._id && (
              <div style={{ backgroundColor: 'rgba(128,128,128,0.05)', padding: '0.8rem', borderRadius: '12px', marginTop: '0.5rem' }}>
                <strong style={{ fontSize: '0.85rem' }}>Enrolled Groups:</strong> 
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {u.groups && u.groups.length > 0 ? u.groups.map(g => (
                    <span key={g._id} style={{ padding: '0.3rem 0.6rem', borderRadius: '10px', backgroundColor: 'var(--clay-base)', boxShadow: 'var(--clay-outer)', fontSize: '0.8rem' }}>{g.name}</span>
                  )) : <span style={{ fontStyle: 'italic', color: 'var(--text-light)', fontSize: '0.8rem' }}>No groups assigned</span>}
                </div>
              </div>
            )}

            {u.role === 'user' && !isReadOnly && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem' }}>
                <NeoButton variant="peach" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); setEditUserData({ _id: u._id, scholarship: u.scholarship?._id || 'NONE', academicScore: u.academicScore || 0 }); setEditUserModalOpen(true); }}>Edit Profile</NeoButton>
                <NeoButton variant="mint" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); setSelectedUserForGroup(u); setAssignStudentModalOpen(true); }}>Assign Group</NeoButton>
              </div>
            )}
          </NeoCard>
        ))}
        {users.length === 0 && <p style={{ textAlign: 'center', width: '100%', color: 'var(--text-light)' }}>No users found</p>}
      </div>
    </div>
  );
};

export default UserManagement;

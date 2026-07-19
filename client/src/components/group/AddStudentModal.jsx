import React from 'react';
import NeoModal from '../UI/NeoModal';
import NeoButton from '../UI/NeoButton';

const AddStudentModal = ({
  isAddStudentsModalOpen,
  setIsAddStudentsModalOpen,
  searchTerm,
  setSearchTerm,
  allSystemUsers,
  group,
  selectedStudentIds,
  setSelectedStudentIds,
  isAddingStudents,
  handleAddStudentsSubmit
}) => {
  if (!isAddStudentsModalOpen) return null;

  return (
    <NeoModal isOpen={isAddStudentsModalOpen} onClose={() => setIsAddStudentsModalOpen(false)} title="Add Students to Group">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p>Select students to enroll in this group. Students already in the group are hidden.</p>
        
        <input 
          type="text" 
          placeholder="Search students..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={{
            padding: '0.8rem',
            borderRadius: '15px',
            border: 'none',
            backgroundColor: 'var(--clay-base)',
            boxShadow: 'inset 5px 5px 10px rgba(163, 177, 198, 0.4), inset -5px -5px 10px rgba(255, 255, 255, 0.8)',
            outline: 'none',
            width: '100%'
          }}
        />
        
        <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem' }}>
          {allSystemUsers
            .filter(u => !u.groups.some(g => g._id === group._id)) // Hide users already in group
            .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.username.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(u => (
              <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', backgroundColor: 'var(--clay-base)', borderRadius: '15px', cursor: 'pointer' }} onClick={() => {
                setSelectedStudentIds(prev => prev.includes(u._id) ? prev.filter(id => id !== u._id) : [...prev, u._id]);
              }}>
                <input type="checkbox" checked={selectedStudentIds.includes(u._id)} readOnly style={{ accentColor: 'var(--primary)' }} />
                <div>
                  <strong>{u.name}</strong> <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>({u.username})</span>
                </div>
              </div>
          ))}
          {allSystemUsers.length > 0 && allSystemUsers.filter(u => !u.groups.some(g => g._id === group._id)).length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>All available students are already in this group.</p>
          )}
          {isAddingStudents && <p style={{ textAlign: 'center' }}>Loading users...</p>}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <NeoButton variant="secondary" onClick={() => setIsAddStudentsModalOpen(false)} style={{ flex: 1 }}>Cancel</NeoButton>
          <NeoButton variant="primary" onClick={handleAddStudentsSubmit} disabled={selectedStudentIds.length === 0} style={{ flex: 1 }}>Add Selected ({selectedStudentIds.length})</NeoButton>
        </div>
      </div>
    </NeoModal>
  );
};

export default AddStudentModal;

import React from 'react';
import NeoModal from '../UI/NeoModal';
import NeoButton from '../UI/NeoButton';
import NeoInput from '../UI/NeoInput';
import { Search } from 'lucide-react';

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

  const availableUsers = allSystemUsers.filter(u => !u.groups.some(g => g?._id === group?._id));
  const filteredUsers = availableUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <NeoModal isOpen={isAddStudentsModalOpen} onClose={() => setIsAddStudentsModalOpen(false)} title="Add Students to Group">
      <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center', lineHeight: '1.4' }}>
        Select students to enroll in this group. Once added, any fee assigned to this group will automatically apply to them.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <NeoInput 
          Icon={Search}
          placeholder="Search students..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        
        <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem' }}>
          {filteredUsers.map(u => (
              <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', backgroundColor: 'var(--clay-base)', borderRadius: '15px', cursor: 'pointer' }} onClick={() => {
                setSelectedStudentIds(prev => prev.includes(u._id) ? prev.filter(id => id !== u._id) : [...prev, u._id]);
              }}>
                <input type="checkbox" checked={selectedStudentIds.includes(u._id)} readOnly style={{ accentColor: 'var(--primary)', transform: 'scale(1.2)' }} />
                <div>
                  <strong style={{ color: 'var(--text-color)' }}>{u.name}</strong> <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>({u.username})</span>
                </div>
              </div>
          ))}
          {allSystemUsers.length > 0 && availableUsers.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>All available students are already in this group.</p>
          )}
          {availableUsers.length > 0 && filteredUsers.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>No students found matching "{searchTerm}".</p>
          )}
          {isAddingStudents && <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Loading users...</p>}
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

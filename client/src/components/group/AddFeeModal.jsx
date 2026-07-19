import React from 'react';
import NeoModal from '../UI/NeoModal';
import NeoButton from '../UI/NeoButton';
import NeoInput from '../UI/NeoInput';
import NeoSelect from '../UI/NeoSelect';

const AddFeeModal = ({
  isAddFeeModalOpen,
  setIsAddFeeModalOpen,
  selectedUserIdForFee,
  newFee,
  setNewFee,
  feeTypes,
  isAddingFee,
  handleAddFeeSubmit
}) => {
  if (!isAddFeeModalOpen) return null;

  return (
    <NeoModal isOpen={isAddFeeModalOpen} onClose={() => setIsAddFeeModalOpen(false)} title={selectedUserIdForFee ? "Assign Fee to User" : "Assign Fee to Group"}>
      <form onSubmit={handleAddFeeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
          {selectedUserIdForFee ? "Assigning a fee will apply it specifically to this user." : "Assigning a fee will apply it to all current students in this group."}
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 'bold', marginLeft: '0.5rem' }}>Fee Title</label>
          <NeoInput 
            type="text" 
            placeholder="Fee Title (e.g. Exam Fee)" 
            value={newFee.title} 
            onChange={e => setNewFee({...newFee, title: e.target.value})} 
            required 
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 'bold', marginLeft: '0.5rem' }}>Amount (₹)</label>
          <NeoInput 
            type="number" 
            placeholder="Amount (₹)" 
            value={newFee.amount} 
            onChange={e => setNewFee({...newFee, amount: e.target.value})} 
            required 
            min="0"
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 'bold', marginLeft: '0.5rem' }}>Fee Type</label>
          <div style={{ position: 'relative' }}>
            <NeoSelect 
              value={newFee.feeType}
              onChange={val => setNewFee({...newFee, feeType: val})}
              required={true}
              placeholder="Select Fee Type..."
              options={feeTypes.map(t => ({ value: t._id, label: t.name }))}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <NeoButton variant="secondary" type="button" onClick={() => setIsAddFeeModalOpen(false)} style={{ flex: 1 }}>Cancel</NeoButton>
          <NeoButton variant="primary" type="submit" disabled={isAddingFee} style={{ flex: 1 }}>
            {isAddingFee ? 'Assigning...' : 'Assign Fee'}
          </NeoButton>
        </div>
      </form>
    </NeoModal>
  );
};

export default AddFeeModal;

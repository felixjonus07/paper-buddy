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
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center', lineHeight: '1.4' }}>
          {selectedUserIdForFee ? "Assigning a fee here will apply it specifically to this user only." : "Assigning a fee here will apply it to everyone currently in this group."}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 'bold', marginLeft: '0.5rem' }}>Deadline Date (Optional)</label>
          <NeoInput 
            type="date" 
            value={newFee.deadlineDate || ''} 
            onChange={e => setNewFee({...newFee, deadlineDate: e.target.value})} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 'bold', marginLeft: '0.5rem' }}>Late Fee Fine (₹)</label>
            <NeoInput 
              type="number" 
              placeholder="Fine Amount" 
              value={newFee.lateFeeFine || ''} 
              onChange={e => setNewFee({...newFee, lateFeeFine: e.target.value})} 
              min="0"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 'bold', marginLeft: '0.5rem' }}>Late Fee Type</label>
            <div style={{ position: 'relative' }}>
              <NeoSelect 
                value={newFee.lateFeeFineType || 'total'}
                onChange={val => setNewFee({...newFee, lateFeeFineType: val})}
                options={[
                  { value: 'total', label: 'Total (Fixed)' },
                  { value: 'per day', label: 'Per Day' },
                  { value: 'per month', label: 'Per Month' }
                ]}
              />
            </div>
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

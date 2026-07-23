import React from 'react';
import NeoCard from '../UI/NeoCard';
import NeoButton from '../UI/NeoButton';
import NeoInput from '../UI/NeoInput';

const FeeTypesManagement = ({ 
  masterMessage, 
  handleCreateFeeType, 
  newFeeType, 
  setNewFeeType, 
  feeTypes, 
  handleDeleteFeeType,
  isReadOnly
}) => {
  return (
    <div style={{ animation: 'slideUp 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)' }}>Fee Types</h2>
      </div>

      {masterMessage && <p style={{ color: 'var(--clay-mint)', textAlign: 'center', marginBottom: '1rem' }}>{masterMessage}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <NeoCard>
          {!isReadOnly && (
            <form onSubmit={handleCreateFeeType} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <NeoInput type="text" placeholder="Fee Type Name (e.g. Tuition)" value={newFeeType.name} onChange={e => setNewFeeType({...newFeeType, name: e.target.value})} required />
              <NeoInput type="text" placeholder="Description" value={newFeeType.description} onChange={e => setNewFeeType({...newFeeType, description: e.target.value})} />
              <NeoButton variant="pink" type="submit">Create Fee Type</NeoButton>
            </form>
          )}

          <h3 style={{marginBottom: '1rem' }}>Existing Fee Types</h3>
          <div className="card-grid">
            {feeTypes.map(c => (
              <NeoCard key={c._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1rem', backgroundColor: 'var(--bg-color)', boxShadow: 'var(--clay-outer)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{c.name}</h4>
                  {!isReadOnly && <NeoButton variant="peach" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handleDeleteFeeType(c._id)}>Delete</NeoButton>}
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)', flex: 1 }}>{c.description || 'No description provided'}</p>
              </NeoCard>
            ))}
            {feeTypes.length === 0 && <p style={{ textAlign: 'center', width: '100%', color: 'var(--text-light)' }}>No fee types defined</p>}
          </div>
        </NeoCard>
      </div>
    </div>
  );
};

export default FeeTypesManagement;

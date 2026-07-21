import React from 'react';
import NeoCard from '../UI/NeoCard';
import NeoButton from '../UI/NeoButton';
import { Plus } from 'lucide-react';

const FeeManagement = ({ fees, setFeeModalOpen, handleDeleteFee, isReadOnly }) => {
  return (
    <div style={{ animation: 'slideUp 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)' }}>Fee Management</h2>
        {!isReadOnly && (
          <NeoButton variant="peach" onClick={() => setFeeModalOpen(true)}>
            <Plus size={20} /> Assign Fee
          </NeoButton>
        )}
      </div>

      <div className="card-grid">
        {fees.map(f => (
          <NeoCard key={f._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1.2rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{f.title}</h3>
            <div style={{ color: 'var(--clay-peach)', fontSize: '1.8rem', fontWeight: 'bold' }}>₹{f.amount}</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ 
                padding: '0.4rem 0.8rem', 
                borderRadius: '12px', 
                backgroundColor: 'var(--bg-color)',
                boxShadow: 'var(--clay-outer)',
                fontSize: '0.85rem'
              }}>
                <strong>Type:</strong> {f.feeType?.name || 'N/A'}
              </span>
              <span style={{ 
                padding: '0.4rem 0.8rem', 
                borderRadius: '12px', 
                backgroundColor: 'var(--bg-color)',
                boxShadow: 'var(--clay-outer)',
                fontSize: '0.85rem'
              }}>
                <strong>Assigned To:</strong> {f.assignedToGroup ? f.assignedToGroup.name : 'Individual'}
              </span>
            </div>

            {!isReadOnly && (
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(128,128,128,0.1)' }}>
                <NeoButton variant="peach" style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }} onClick={() => handleDeleteFee(f._id)}>Delete Fee</NeoButton>
              </div>
            )}
          </NeoCard>
        ))}
        {fees.length === 0 && <p style={{ textAlign: 'center', width: '100%', color: 'var(--text-light)' }}>No fees found</p>}
      </div>
    </div>
  );
};

export default FeeManagement;

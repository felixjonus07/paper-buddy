import React from 'react';
import NeoCard from '../UI/NeoCard';
import NeoButton from '../UI/NeoButton';
import { Download } from 'lucide-react';

const UserPaidFees = ({ studentFees, handleDownloadReceipt }) => {
  const paidFees = studentFees.filter(f => f.status === 'PAID');
  
  return (
    <div style={{ animation: 'slideUp 0.3s ease-out', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ color: 'var(--primary)', margin: 0, textAlign: 'left' }}>Payment History</h2>
      </div>
      <div className="stats-grid">
        {paidFees.map(f => (
          <NeoCard key={f._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)' }}>{f.feeId?.title || 'Unknown Fee'}</h3>
            </div>
            
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>
              ₹{f.finalAmount.toFixed(2)}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Base Amount:</span>
                <span>₹{f.baseAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Discount:</span>
                <span style={{ color: 'var(--clay-mint)', fontWeight: 'bold' }}>-₹{f.discountAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(128,128,128,0.2)', fontSize: '0.85rem', color: 'var(--text-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Paid on {new Date(f.updatedAt).toLocaleDateString()}</span>
              <NeoButton variant="mint" onClick={() => handleDownloadReceipt(f)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Download size={14} /> Receipt
              </NeoButton>
            </div>
          </NeoCard>
        ))}
        {paidFees.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-light)', width: '100%', gridColumn: '1 / -1' }}>No paid fees found.</p>
        )}
      </div>
    </div>
  );
};

export default UserPaidFees;

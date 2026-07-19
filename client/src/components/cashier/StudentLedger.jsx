import React from 'react';
import NeoCard from '../UI/NeoCard';
import NeoButton from '../UI/NeoButton';
import { CheckCircle } from 'lucide-react';

const StudentLedger = ({ selectedStudent, setSelectedStudent, pendingFees, handleCashPayment }) => {
  if (!selectedStudent) return null;

  return (
    <NeoCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>Student Ledger</h3>
          <p style={{ margin: 0, marginTop: '0.2rem', color: 'var(--text-color)' }}>
            <strong>{selectedStudent.name}</strong> (@{selectedStudent.username})
          </p>
        </div>
        <NeoButton variant="secondary" onClick={() => setSelectedStudent(null)} style={{ padding: '0.4rem 1rem' }}>
          Clear Selection
        </NeoButton>
      </div>

      {pendingFees.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--clay-mint-light)', borderRadius: '16px', border: '1px solid var(--clay-mint)' }}>
          <CheckCircle size={40} color="var(--clay-mint)" style={{ marginBottom: '1rem' }} />
          <h4 style={{ color: 'var(--text-color)', margin: 0 }}>All Clear!</h4>
          <p style={{ color: 'var(--text-light)', margin: 0 }}>This student has no pending fees to pay.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pendingFees.map(fee => (
            <div key={fee._id} style={{ 
              padding: '1.2rem', 
              borderRadius: '16px', 
              backgroundColor: 'var(--bg-secondary)', 
              border: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h4 style={{ margin: 0, color: 'var(--text-color)' }}>{fee.feeId?.title || 'Unknown Fee'}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
                  Base Amount: ₹{fee.baseAmount}
                  {fee.discountAmount > 0 && ` | Discount: ₹${fee.discountAmount}`}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-light)' }}>Amount Payable</span>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--clay-peach)' }}>₹{fee.finalAmount}</strong>
                </div>
                <NeoButton variant="primary" onClick={() => handleCashPayment(fee._id)}>
                  Record Cash Payment
                </NeoButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </NeoCard>
  );
};

export default StudentLedger;

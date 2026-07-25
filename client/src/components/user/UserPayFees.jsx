import React from 'react';
import NeoCard from '../UI/NeoCard';
import NeoButton from '../UI/NeoButton';

const UserPayFees = ({ studentFees, fees, handlePayFee }) => {
  const pendingStudentFees = studentFees.filter(f => f.status === 'PENDING');
  const missingFees = fees.filter(f => !studentFees.some(sf => sf.feeId?._id === f._id || sf.feeId === f._id));
  
  const allPending = [
    ...pendingStudentFees.map(sf => ({
      id: sf._id,
      title: sf.feeId?.title || 'Unknown Fee',
      amountDue: sf.finalAmount,
      isMissing: false,
      hasLateFee: sf.finalAmount > (sf.baseAmount - (sf.discountAmount || 0)),
      deadline: sf.feeId?.deadlineDate
    })),
    ...missingFees.map(f => ({
      id: f._id,
      title: f.title,
      amountDue: f.amount,
      isMissing: true,
      hasLateFee: false, // Missing fees are calculated at checkout, but we can't easily know here without extra logic
      deadline: f.deadlineDate
    }))
  ];

  return (
    <div style={{ animation: 'slideUp 0.3s ease-out', width: '100%' }}>
      <div className="stats-grid" style={{ marginBottom: '3rem' }}>
        {allPending.map(f => (
          <NeoCard key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)' }}>{f.title}</h3>
            </div>
            {f.deadline && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                Due: {new Date(f.deadline).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            )}
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>
              ₹{f.amountDue.toFixed(2)}
              {f.hasLateFee && (
                <span style={{ fontSize: '0.9rem', color: 'var(--clay-peach)', marginLeft: '0.8rem', fontWeight: 'bold' }}>
                  (+ Late Fee)
                </span>
              )}
            </div>
            <NeoButton 
              variant="mint" 
              onClick={() => handlePayFee(f.id, f.isMissing)} 
              style={{ marginTop: 'auto', width: '100%', padding: '0.8rem' }}
            >
              Pay Now
            </NeoButton>
          </NeoCard>
        ))}
        {allPending.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-light)', width: '100%', gridColumn: '1 / -1' }}>No outstanding fees to pay!</p>
        )}
      </div>
    </div>
  );
};

export default UserPayFees;

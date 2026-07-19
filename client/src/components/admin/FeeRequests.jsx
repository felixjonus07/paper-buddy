import React from 'react';
import NeoCard from '../UI/NeoCard';
import NeoButton from '../UI/NeoButton';

const FeeRequests = ({ feeRequests, handleUpdateFeeRequestStatus }) => {
  return (
    <div style={{ animation: 'slideUp 0.3s ease-out' }}>
      <h2 style={{ margin: 0, color: 'var(--primary)', marginBottom: '2rem' }}>Student Fee Requests</h2>
      
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {feeRequests.map(r => (
          <NeoCard key={r._id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.2rem' }}>{r.requestedFeeTitle}</h3>
                <p style={{ margin: '0.2rem 0', color: 'var(--text-color)', fontWeight: 'bold' }}>Requested by: {r.studentId?.name} (@{r.studentId?.username})</p>
                <p style={{ margin: '0', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                  {r.studentId?.studentClass || 'N/A'} - {r.studentId?.section || 'N/A'} | Reg No: {r.studentId?.registerNumber || 'N/A'}
                </p>
              </div>
              <div>
                <span style={{ 
                  padding: '0.3rem 0.6rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 'bold',
                  backgroundColor: r.status === 'pending' ? 'var(--clay-peach-light)' : r.status === 'approved' ? 'var(--clay-mint-light)' : 'var(--clay-pink-light)',
                  color: r.status === 'pending' ? '#9a3412' : r.status === 'approved' ? '#115e59' : '#831843'
                }}>
                  {r.status.toUpperCase()}
                </span>
              </div>
            </div>
            {r.reason && (
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text-color)' }}>
                <strong>Reason:</strong> {r.reason}
              </div>
            )}
            <div style={{ display: 'flex', gap: '2rem', padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text-color)' }}>
              <div><strong>Suggested Amount:</strong> ₹{r.amount}</div>
              <div><strong>Suggested Type:</strong> {r.feeType?.name || 'Unknown'}</div>
            </div>
            
            {r.status === 'pending' && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <NeoButton variant="mint" onClick={() => handleUpdateFeeRequestStatus(r._id, 'approved')}>Approve & Assign Fee</NeoButton>
                <NeoButton variant="peach" onClick={() => handleUpdateFeeRequestStatus(r._id, 'rejected')}>Reject</NeoButton>
              </div>
            )}
          </NeoCard>
        ))}
        {feeRequests.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>No fee requests found.</p>}
      </div>
    </div>
  );
};

export default FeeRequests;

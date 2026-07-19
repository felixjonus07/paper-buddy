import React from 'react';
import NeoCard from '../UI/NeoCard';
import NeoButton from '../UI/NeoButton';
import { PlusCircle } from 'lucide-react';

const UserFeeRequests = ({ feeRequests, feeTypes, setRequestFeeModalOpen }) => {
  return (
    <div style={{ animation: 'slideUp 0.3s ease-out', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ color: 'var(--primary)', margin: 0 }}>My Fee Requests</h2>
        <NeoButton variant="mint" onClick={() => setRequestFeeModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={18} /> Request Fee Add-on
        </NeoButton>
      </div>

      <NeoCard>
        <div className="table-container">
          <table style={{ backgroundColor: 'transparent' }}>
            <thead>
              <tr>
                <th style={{ color: 'var(--text-color)' }}>Fee Title</th>
                <th style={{ color: 'var(--text-color)' }}>Amount</th>
                <th style={{ color: 'var(--text-color)' }}>Type</th>
                <th style={{ color: 'var(--text-color)' }}>Reason</th>
                <th style={{ color: 'var(--text-color)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {feeRequests.map(r => (
                <tr key={r._id}>
                  <td style={{ backgroundColor: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>{r.requestedFeeTitle}</td>
                  <td style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>₹{r.amount}</td>
                  <td style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>{feeTypes.find(t => t._id === r.feeType)?.name || 'Unknown'}</td>
                  <td style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>{r.reason || '-'}</td>
                  <td style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>
                    <span style={{ 
                      padding: '0.3rem 0.6rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold',
                      backgroundColor: r.status === 'pending' ? 'var(--clay-peach-light)' : r.status === 'approved' ? 'var(--clay-mint-light)' : 'var(--clay-pink-light)',
                      color: r.status === 'pending' ? '#9a3412' : r.status === 'approved' ? '#115e59' : '#831843'
                    }}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {feeRequests.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.4)' }}>No requests submitted</td></tr>}
            </tbody>
          </table>
        </div>
      </NeoCard>
    </div>
  );
};

export default UserFeeRequests;

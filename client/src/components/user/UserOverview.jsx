import React from 'react';
import NeoCard from '../UI/NeoCard';
import { User, IndianRupee, FileText } from 'lucide-react';

const UserOverview = ({ user, studentFees, loans, profile }) => {
  const pendingFees = studentFees.filter(f => f.status === 'PENDING');
  const totalFees = pendingFees.reduce((sum, f) => sum + f.finalAmount, 0);
  const pendingLoans = loans.filter(l => l.status === 'pending');

  return (
    <div style={{ animation: 'slideUp 0.3s ease-out' }}>
      <NeoCard style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
         <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--clay-peach)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--clay-outer)' }}>
           <User size={40} color="white" />
         </div>
         <div>
           <h2 style={{ margin: 0, color: 'var(--primary)' }}>Hello, {user.name}!</h2>
           <p>Welcome to your personal Paper Buddy dashboard.</p>
         </div>
      </NeoCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <NeoCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: 'var(--clay-primary-bg)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid var(--clay-primary-border)',
              color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(248,116,16,0.15), inset 0 1px 0 rgba(255,255,255,0.4)',
              flexShrink: 0
            }}>
              <IndianRupee size={20} />
            </div>
          <h4 style={{ margin: 0 }}>Outstanding Fees</h4>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)', wordBreak: 'break-word' }}>₹{totalFees.toFixed(2)}</p>
        </NeoCard>

        <NeoCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: 'var(--clay-primary-bg)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid var(--clay-primary-border)',
              color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(248,116,16,0.15), inset 0 1px 0 rgba(255,255,255,0.4)',
              flexShrink: 0
            }}>
              <FileText size={20} />
            </div>
            <h4 style={{ margin: 0 }}>Pending Loans</h4>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>{pendingLoans.length}</p>
        </NeoCard>
        
        {profile?.scholarship && (
          <NeoCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '50%',
                background: 'var(--clay-primary-bg)',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid var(--clay-primary-border)',
                color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(248,116,16,0.15), inset 0 1px 0 rgba(255,255,255,0.4)',
                flexShrink: 0
              }}>
                <FileText size={20} />
              </div>
              <h4 style={{ margin: 0 }}>Active Scholarship</h4>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-color)' }}>{profile.scholarship.name}</p>
            <p style={{ margin: 0, color: 'var(--clay-mint)', fontWeight: 'bold' }}>{profile.scholarship.discountPercentage}% Discount</p>
          </NeoCard>
        )}
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <NeoCard style={{ flex: '1', minWidth: '350px' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Loan History</h3>
          <div className="table-container">
            <table style={{ backgroundColor: 'transparent' }}>
              <thead>
                <tr>
                  <th style={{ color: 'var(--text-color)' }}>Amount</th>
                  <th style={{ color: 'var(--text-color)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(l => (
                  <tr key={l._id}>
                    <td style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>₹{l.amount}</td>
                    <td style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>
                      <span style={{ 
                        padding: '0.3rem 0.6rem', borderRadius: '10px', fontSize: '0.8rem',
                        backgroundColor: l.status === 'pending' ? 'var(--clay-peach-light)' : l.status === 'approved' ? 'var(--clay-mint-light)' : 'var(--clay-pink-light)',
                        color: l.status === 'pending' ? '#9a3412' : l.status === 'approved' ? '#115e59' : '#831843'
                      }}>
                        {l.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {loans.length === 0 && <tr><td colSpan="2" style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.4)' }}>No loans found</td></tr>}
              </tbody>
            </table>
          </div>
        </NeoCard>
      </div>
    </div>
  );
};

export default UserOverview;

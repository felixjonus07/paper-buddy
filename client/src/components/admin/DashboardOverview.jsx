import React from 'react';
import NeoCard from '../UI/NeoCard';
import { Users, Activity, IndianRupee, FileText, CreditCard } from 'lucide-react';

const DashboardOverview = ({ users, groups, fees, feeRequests = [], paymentStatus, monthlyPayments = [] }) => {
  const pendingFeeAmount = feeRequests.filter(r => r.status === 'pending').reduce((sum, f) => sum + f.amount, 0);
  const collectedThisMonth = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingRequests = feeRequests.filter(r => r.status === 'pending').length;

  const bubbleStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '42px',
    height: '42px',
    backgroundColor: 'var(--clay-base)',
    borderRadius: '16px',
    color: 'var(--primary)',
    boxShadow: 'inset 2px 2px 5px rgba(255, 255, 255, 0.5), inset -3px -3px 7px rgba(0, 0, 0, 0.05)'
  };

  return (
    <div style={{ animation: 'slideUp 0.3s ease-out' }}>

      {/* Header Hero Card */}
      <NeoCard style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--primary)' }}>Welcome back, Admin! </h2>
          <p>Here's a quick overview of the Paper Buddy system today.</p>
        </div>
      </NeoCard>

      <div className="stats-grid">
        <NeoCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={bubbleStyle}>
              <Users size={20} />
            </div>
            <h4 style={{ margin: 0 }}>Total Users</h4>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>{users.length}</p>
        </NeoCard>
        <NeoCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={bubbleStyle}>
              <Activity size={20} />
            </div>
            <h4 style={{ margin: 0 }}>Total Groups</h4>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>{groups.length}</p>
        </NeoCard>
        <NeoCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={bubbleStyle}>
              <IndianRupee size={20} />
            </div>
            <h4 style={{ margin: 0 }}>Collected (Month)</h4>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>₹{collectedThisMonth.toFixed(2)}</p>
        </NeoCard>
        <NeoCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={bubbleStyle}>
              <FileText size={20} />
            </div>
            <h4 style={{ margin: 0 }}>Pending Fee Amt.</h4>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: pendingFeeAmount > 0 ? '#d97706' : 'var(--text-color)' }}>₹{pendingFeeAmount.toFixed(2)}</p>
        </NeoCard>
        <NeoCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={bubbleStyle}>
              <FileText size={20} />
            </div>
            <h4 style={{ margin: 0 }}>Pending Fee Req.</h4>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: pendingRequests > 0 ? '#d97706' : 'var(--text-color)' }}>{pendingRequests}</p>
        </NeoCard>
        <NeoCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={bubbleStyle}>
              <FileText size={20} />
            </div>
            <h4 style={{ margin: 0 }}>Payment Mode</h4>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: pendingRequests > 0 ? '#d97706' : 'var(--text-color)' }}> {paymentStatus === 'DECENTRALIZED' ? 'Decentralized' : 'Centralized'}</p>
        </NeoCard>
      </div>
    </div>
  );
};

export default DashboardOverview;

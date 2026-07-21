import React from 'react';
import NeoCard from '../UI/NeoCard';
import { Users, Activity, IndianRupee, FileText, CreditCard } from 'lucide-react';

const DashboardOverview = ({ users, groups, fees, feeRequests = [], paymentStatus, monthlyPayments = [] }) => {
  const pendingFeeAmount = feeRequests.filter(r => r.status === 'pending').reduce((sum, f) => sum + f.amount, 0);
  const collectedThisMonth = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingRequests = feeRequests.filter(r => r.status === 'pending').length;

  return (
    <div style={{ animation: 'slideUp 0.3s ease-out' }}>
      
      {/* Header Hero Card */}
      <NeoCard style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
         <div>
           <h2 style={{ margin: 0, color: 'var(--primary)' }}>Welcome back, Admin! 👋</h2>
           <p>Here's a quick overview of the Paper Buddy system today.</p>
         </div>
      </NeoCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <NeoCard>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--clay-mint-light)', borderRadius: '15px', color: 'var(--icon-mint)' }}>
              <Users size={20} />
            </div>
            <h4 style={{ margin: 0 }}>Total Users</h4>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>{users.length}</p>
        </NeoCard>
        <NeoCard>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--clay-pink-light)', borderRadius: '15px', color: 'var(--icon-pink)' }}>
              <Activity size={20} />
            </div>
            <h4 style={{ margin: 0 }}>Total Groups</h4>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>{groups.length}</p>
        </NeoCard>
        <NeoCard>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--clay-peach-light)', borderRadius: '15px', color: 'var(--icon-peach)' }}>
              <IndianRupee size={20} />
            </div>
            <h4 style={{ margin: 0 }}>Collected This Month</h4>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>₹{collectedThisMonth.toFixed(2)}</p>
        </NeoCard>
        <NeoCard>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--clay-base)', borderRadius: '15px', color: '#f59e0b', boxShadow: 'inset 2px 2px 5px rgba(255, 255, 255, 0.5), inset -3px -3px 7px rgba(0, 0, 0, 0.05)' }}>
              <FileText size={20} />
            </div>
            <h4 style={{ margin: 0 }}>Pending Fee Amt.</h4>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: pendingFeeAmount > 0 ? '#d97706' : 'var(--text-color)' }}>₹{pendingFeeAmount.toFixed(2)}</p>
        </NeoCard>
        <NeoCard>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--clay-base)', borderRadius: '15px', color: '#f59e0b', boxShadow: 'inset 2px 2px 5px rgba(255, 255, 255, 0.5), inset -3px -3px 7px rgba(0, 0, 0, 0.05)' }}>
              <FileText size={20} />
            </div>
            <h4 style={{ margin: 0 }}>Pending Fee Req.</h4>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: pendingRequests > 0 ? '#d97706' : 'var(--text-color)' }}>{pendingRequests}</p>
        </NeoCard>
        <NeoCard>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--clay-base)', borderRadius: '15px', color: '#3b82f6', boxShadow: 'inset 2px 2px 5px rgba(255, 255, 255, 0.5), inset -3px -3px 7px rgba(0, 0, 0, 0.05)' }}>
              <CreditCard size={20} />
            </div>
            <h4 style={{ margin: 0 }}>Payment Mode</h4>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <span style={{ 
              padding: '0.3rem 0.8rem', 
              borderRadius: '20px', 
              fontSize: '0.85rem', 
              fontWeight: 'bold', 
              backgroundColor: paymentStatus === 'DECENTRALIZED' ? 'rgba(45, 212, 191, 0.1)' : 'rgba(99, 102, 241, 0.1)', 
              color: paymentStatus === 'DECENTRALIZED' ? 'var(--clay-mint)' : 'var(--primary)' 
            }}>
              {paymentStatus === 'DECENTRALIZED' ? 'Decentralized' : 'Centralized'}
            </span>
          </div>
        </NeoCard>
      </div>
    </div>
  );
};

export default DashboardOverview;

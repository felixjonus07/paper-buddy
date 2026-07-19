import React from 'react';
import NeoCard from '../UI/NeoCard';
import { Users, Activity, IndianRupee } from 'lucide-react';

const DashboardOverview = ({ users, groups, fees }) => {
  const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);

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
            <h4 style={{ margin: 0 }}>Total Fees</h4>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>₹{totalFees.toFixed(2)}</p>
        </NeoCard>
      </div>
    </div>
  );
};

export default DashboardOverview;

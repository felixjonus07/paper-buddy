import React from 'react';
import NeoCard from '../UI/NeoCard';
import { Users, Activity, IndianRupee } from 'lucide-react';

const GroupStats = ({ users, totalAssignedValue, amountCollected, amountPending }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
      <NeoCard>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '10px', backgroundColor: 'var(--clay-mint-light)', borderRadius: '15px', color: 'var(--icon-mint)' }}>
            <Users size={20} />
          </div>
          <h4 style={{ margin: 0 }}>Enrolled Students</h4>
        </div>
        <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>{users?.length || 0}</p>
      </NeoCard>
      <NeoCard>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '10px', backgroundColor: 'var(--clay-lavender-light)', borderRadius: '15px', color: 'var(--icon-lavender)' }}>
            <Activity size={20} />
          </div>
          <h4 style={{ margin: 0 }}>Total Assigned</h4>
        </div>
        <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>₹{totalAssignedValue?.toFixed(2) || '0.00'}</p>
      </NeoCard>
      <NeoCard>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '10px', backgroundColor: 'var(--clay-mint-light)', borderRadius: '15px', color: 'var(--icon-mint)' }}>
            <IndianRupee size={20} />
          </div>
          <h4 style={{ margin: 0 }}>Amount Collected</h4>
        </div>
        <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>₹{amountCollected?.toFixed(2) || '0.00'}</p>
      </NeoCard>
      <NeoCard>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '10px', backgroundColor: 'var(--clay-pink-light)', borderRadius: '15px', color: 'var(--icon-pink)' }}>
            <IndianRupee size={20} />
          </div>
          <h4 style={{ margin: 0 }}>Amount Pending</h4>
        </div>
        <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>₹{amountPending?.toFixed(2) || '0.00'}</p>
      </NeoCard>
    </div>
  );
};

export default GroupStats;

import React from 'react';
import NeoCard from '../UI/NeoCard';
import { Users, Activity, IndianRupee } from 'lucide-react';

const GroupStats = ({ users, totalAssignedValue, amountCollected, amountPending }) => {
  return (
    <div className="stats-grid-small" style={{ marginBottom: '2rem' }}>
      <NeoCard>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '50%',
            background: 'var(--clay-primary-bg)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid var(--clay-primary-border)',
            color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(248,116,16,0.15), inset 0 1px 0 rgba(255,255,255,0.4)'
          }}>
            <Users size={20} />
          </div>
          <h4 style={{ margin: 0 }}>Enrolled Students</h4>
        </div>
        <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>{users?.length || 0}</p>
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
            boxShadow: '0 4px 12px rgba(248,116,16,0.15), inset 0 1px 0 rgba(255,255,255,0.4)'
          }}>
            <Activity size={20} />
          </div>
          <h4 style={{ margin: 0 }}>Total Assigned</h4>
        </div>
        <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>₹{totalAssignedValue?.toFixed(2) || '0.00'}</p>
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
            boxShadow: '0 4px 12px rgba(248,116,16,0.15), inset 0 1px 0 rgba(255,255,255,0.4)'
          }}>
            <IndianRupee size={20} />
          </div>
          <h4 style={{ margin: 0 }}>Amount Collected</h4>
        </div>
        <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>₹{amountCollected?.toFixed(2) || '0.00'}</p>
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
            boxShadow: '0 4px 12px rgba(248,116,16,0.15), inset 0 1px 0 rgba(255,255,255,0.4)'
          }}>
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

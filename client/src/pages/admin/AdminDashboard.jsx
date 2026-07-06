import React from 'react';
import NeoCard from '../../components/UI/NeoCard';
import NeoButton from '../../components/UI/NeoButton';
import { Users, FileText, Activity } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="app-container">
      <h1 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>Admin Portal</h1>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
        <NeoCard style={{ flex: '1', minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Users size={32} color="var(--primary)" />
            <h3>Total Users</h3>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>1,432</p>
          <p>+12 this week</p>
        </NeoCard>

        <NeoCard style={{ flex: '1', minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <FileText size={32} color="var(--primary)" />
            <h3>Pending Loans</h3>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>28</p>
          <p>Requires review</p>
        </NeoCard>
        
        <NeoCard style={{ flex: '1', minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Activity size={32} color="var(--primary)" />
            <h3>System Health</h3>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>All Systems Go</p>
          <p>API & DB Connected</p>
        </NeoCard>
      </div>

      <NeoCard>
        <h3 style={{ marginBottom: '1rem' }}>Recent Loan Applications</h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--shadow-dark)' }}>
              <th style={{ padding: '1rem' }}>Student</th>
              <th style={{ padding: '1rem' }}>Amount</th>
              <th style={{ padding: '1rem' }}>Purpose</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '1rem' }}>John Doe</td>
              <td style={{ padding: '1rem' }}>$5,000</td>
              <td style={{ padding: '1rem' }}>Tuition Fall 2026</td>
              <td style={{ padding: '1rem', color: '#f59e0b', fontWeight: 'bold' }}>Pending</td>
              <td style={{ padding: '1rem' }}>
                <NeoButton style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Review</NeoButton>
              </td>
            </tr>
          </tbody>
        </table>
      </NeoCard>

    </div>
  );
};

export default AdminDashboard;

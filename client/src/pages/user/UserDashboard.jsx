import React from 'react';
import NeoCard from '../../components/UI/NeoCard';
import NeoButton from '../../components/UI/NeoButton';
import { DollarSign, BookOpen, Clock } from 'lucide-react';

const UserDashboard = () => {
  return (
    <div className="app-container">
      <h1 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>Student Dashboard</h1>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
        <NeoCard style={{ flex: '1', minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <DollarSign size={32} color="var(--primary)" />
            <h3>Current Balance</h3>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>$1,250.00</p>
          <p>Next payment due: Aug 1st</p>
          <NeoButton style={{ marginTop: '1rem', width: '100%' }}>Make Payment</NeoButton>
        </NeoCard>

        <NeoCard style={{ flex: '1', minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Clock size={32} color="var(--primary)" />
            <h3>Loan Applications</h3>
          </div>
          <p style={{ fontSize: '1.2rem', fontWeight: '500' }}>Fall Semester Grant</p>
          <p style={{ color: '#f59e0b' }}>Status: Pending Approval</p>
          <NeoButton variant="secondary" style={{ marginTop: '1rem', width: '100%' }}>Apply for New Loan</NeoButton>
        </NeoCard>
        
        <NeoCard style={{ flex: '1', minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <BookOpen size={32} color="var(--primary)" />
            <h3>Financial Literacy</h3>
          </div>
          <p>Module 2: Budgeting 101</p>
          <div style={{ width: '100%', backgroundColor: 'var(--shadow-dark)', height: '10px', borderRadius: '5px', marginTop: '10px' }}>
            <div style={{ width: '60%', backgroundColor: 'var(--primary)', height: '10px', borderRadius: '5px' }}></div>
          </div>
          <p style={{ marginTop: '5px', fontSize: '0.8rem' }}>60% Completed</p>
        </NeoCard>
      </div>

    </div>
  );
};

export default UserDashboard;

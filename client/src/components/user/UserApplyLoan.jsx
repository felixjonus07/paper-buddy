import React from 'react';
import NeoCard from '../UI/NeoCard';
import NeoButton from '../UI/NeoButton';
import NeoInput from '../UI/NeoInput';
import { IndianRupee, FileText } from 'lucide-react';

const UserApplyLoan = ({ handleApplyLoan, loanData, setLoanData, loanMessage }) => {
  return (
    <div style={{ animation: 'slideUp 0.3s ease-out', maxWidth: '600px', margin: '0 auto' }}>
      <NeoCard>
        <h2 style={{ color: 'var(--primary)', marginBottom: '2rem', textAlign: 'center' }}>Apply for a Loan</h2>
        <form onSubmit={handleApplyLoan} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <NeoInput 
            type="number" 
            placeholder="Loan Amount (₹)" 
            value={loanData.amount} 
            onChange={e => setLoanData({...loanData, amount: e.target.value})} 
            Icon={IndianRupee}
            required 
          />
          <NeoInput 
            type="text" 
            placeholder="Purpose (e.g. Tuition, Books)" 
            value={loanData.purpose} 
            onChange={e => setLoanData({...loanData, purpose: e.target.value})} 
            Icon={FileText}
            required 
          />
          <NeoButton variant="mint" type="submit">Submit Application</NeoButton>
          {loanMessage && <p style={{ marginTop: '1rem', color: 'var(--clay-mint)', textAlign: 'center' }}>{loanMessage}</p>}
        </form>
      </NeoCard>
    </div>
  );
};

export default UserApplyLoan;

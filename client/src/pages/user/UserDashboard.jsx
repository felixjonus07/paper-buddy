import React, { useState, useEffect } from 'react';
import NeoCard from '../../components/UI/NeoCard';
import NeoButton from '../../components/UI/NeoButton';
import NeoInput from '../../components/UI/NeoInput';
import ThemeToggle from '../../components/UI/ThemeToggle';
import { DollarSign, FileText, User, Settings, LayoutDashboard, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [fees, setFees] = useState([]);
  const [loans, setLoans] = useState([]);
  
  const [loanData, setLoanData] = useState({ amount: '', purpose: '' });
  const [loanMessage, setLoanMessage] = useState('');
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [feesRes, loansRes] = await Promise.all([
        fetch('http://localhost:5000/api/user/fees', { headers }),
        fetch('http://localhost:5000/api/user/loans', { headers })
      ]);

      if (feesRes.ok) setFees(await feesRes.json());
      if (loansRes.ok) setLoans(await loansRes.json());
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleApplyLoan = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/user/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(loanData)
      });
      const data = await res.json();
      setLoanMessage(res.ok ? 'Loan application submitted successfully!' : (data.message || 'Failed to submit'));
      if (res.ok) {
        setLoanData({ amount: '', purpose: '' });
        fetchData();
      }
    } catch (err) { setLoanMessage('Server error'); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(passwordData)
      });
      const data = await res.json();
      setPasswordMessage(res.ok ? 'Password updated successfully!' : (data.message || 'Failed to update'));
      if (res.ok) setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) { setPasswordMessage('Server error'); }
  };

  // Render Helpers
  const renderDashboard = () => {
    const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
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
              <div style={{ padding: '10px', backgroundColor: 'var(--clay-pink-light)', borderRadius: '15px', color: 'var(--icon-pink)' }}>
                <DollarSign size={20} />
              </div>
              <h4 style={{ margin: 0 }}>Outstanding Fees</h4>
            </div>
            <p style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-color)' }}>${totalFees.toFixed(2)}</p>
          </NeoCard>

          <NeoCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <div style={{ padding: '10px', backgroundColor: 'var(--clay-mint-light)', borderRadius: '15px', color: 'var(--icon-mint)' }}>
                <FileText size={20} />
              </div>
              <h4 style={{ margin: 0 }}>Pending Loans</h4>
            </div>
            <p style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-color)' }}>{pendingLoans.length}</p>
          </NeoCard>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <NeoCard style={{ flex: '1', minWidth: '350px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Fee Breakdown</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map(f => (
                    <tr key={f._id}>
                      <td>{f.title}</td>
                      <td style={{ fontWeight: 'bold' }}>${f.amount}</td>
                    </tr>
                  ))}
                  {fees.length === 0 && <tr><td colSpan="2" style={{ textAlign: 'center' }}>No assigned fees</td></tr>}
                </tbody>
              </table>
            </div>
          </NeoCard>

          <NeoCard style={{ flex: '1', minWidth: '350px', backgroundColor: 'var(--clay-lavender-light)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--icon-lavender)' }}>Loan History</h3>
            <div className="table-container">
              <table style={{ backgroundColor: 'transparent' }}>
                <thead>
                  <tr>
                    <th style={{ color: 'var(--icon-lavender)' }}>Amount</th>
                    <th style={{ color: 'var(--icon-lavender)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map(l => (
                    <tr key={l._id}>
                      <td style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>${l.amount}</td>
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

  const renderApplyLoan = () => (
    <div style={{ animation: 'slideUp 0.3s ease-out', maxWidth: '600px', margin: '0 auto' }}>
      <NeoCard>
        <h2 style={{ color: 'var(--primary)', marginBottom: '2rem', textAlign: 'center' }}>Apply for a Loan</h2>
        <form onSubmit={handleApplyLoan} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <NeoInput 
            type="number" 
            placeholder="Loan Amount ($)" 
            value={loanData.amount} 
            onChange={e => setLoanData({...loanData, amount: e.target.value})} 
            Icon={DollarSign}
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

  const renderSettings = () => (
    <div style={{ animation: 'slideUp 0.3s ease-out', maxWidth: '600px', margin: '0 auto' }}>
      <NeoCard>
        <h2 style={{ color: 'var(--primary)', marginBottom: '2rem', textAlign: 'center' }}>Account Settings</h2>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Change Password</h3>
          <NeoInput 
            type="password" 
            placeholder="Current Password" 
            value={passwordData.currentPassword} 
            onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} 
            required 
          />
          <NeoInput 
            type="password" 
            placeholder="New Password" 
            value={passwordData.newPassword} 
            onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} 
            required 
          />
          <NeoButton variant="pink" type="submit">Update Password</NeoButton>
          {passwordMessage && <p style={{ marginTop: '1rem', color: 'var(--clay-pink)', textAlign: 'center' }}>{passwordMessage}</p>}
        </form>
      </NeoCard>
    </div>
  );

  return (
    <div className="app-container dashboard-layout">
      {/* Fluffy Sidebar Navigation */}
      <div className="sidebar">
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--text-light)'}}>
           <div style={{ width: '50px', height: '50px', backgroundColor: 'var(--clay-base)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--clay-outer)' }}>
             <User size={28} color="var(--primary)" />
           </div>
           <div>
             <h3 style={{ margin: 0, color: 'var(--text-color)' }}>{user.username}</h3>
             <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Student Portal</span>
           </div>
        </div>
        
        <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <LayoutDashboard size={20} /> <span className="nav-text">Dashboard</span>
        </div>
        <div className={`nav-item ${activeTab === 'loan' ? 'active' : ''}`} onClick={() => setActiveTab('loan')}>
          <DollarSign size={20} /> <span className="nav-text">Financial Aid</span>
        </div>
        <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <Settings size={20} /> <span className="nav-text">Settings</span>
        </div>

        <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
          <NeoButton variant="secondary" onClick={handleLogout} style={{ width: '100%', backgroundColor: 'rgba(128,128,128,0.2)', color: 'var(--text-color)', border: 'none' }}>
            <LogOut size={18} /> Logout
          </NeoButton>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-content">
        <div className="dashboard-header" style={{ 
          backgroundColor: 'var(--clay-base)', 
          padding: '1rem 2rem', 
          borderRadius: '50px', 
          boxShadow: 'var(--clay-outer)' 
        }}>
          <h2 style={{ margin: 0, color: 'var(--text-color)' }}>
            {activeTab === 'dashboard' && 'Student Dashboard'}
            {activeTab === 'loan' && 'Financial Aid'}
            {activeTab === 'settings' && 'Account Settings'}
          </h2>
          <div className="header-actions">
            <div className="search-box">
              <NeoInput type="text" placeholder="Search activities..." />
            </div>
            <ThemeToggle />
          </div>
        </div>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'loan' && renderApplyLoan()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default UserDashboard;

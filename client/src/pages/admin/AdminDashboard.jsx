import React, { useState, useEffect } from 'react';
import NeoCard from '../../components/UI/NeoCard';
import NeoButton from '../../components/UI/NeoButton';
import NeoInput from '../../components/UI/NeoInput';
import NeoModal from '../../components/UI/NeoModal';
import ThemeToggle from '../../components/UI/ThemeToggle';
import { Users, FileText, Activity, DollarSign, LayoutDashboard, Settings, Plus, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Global Data State
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [fees, setFees] = useState([]);
  const [loans, setLoans] = useState([]);

  // Modal States
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [isFeeModalOpen, setFeeModalOpen] = useState(false);

  // Form States
  const [bulkData, setBulkData] = useState({ prefix: '', startRange: '', endRange: '', suffix: '', initialPassword: '' });
  const [bulkMessage, setBulkMessage] = useState('');
  
  const [groupData, setGroupData] = useState({ name: '', description: '' });
  const [groupMessage, setGroupMessage] = useState('');

  const [feeData, setFeeData] = useState({ title: '', amount: '', groupId: '' });
  const [feeMessage, setFeeMessage] = useState('');

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [usersRes, groupsRes, feesRes, loansRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/users', { headers }),
        fetch('http://localhost:5000/api/admin/groups', { headers }),
        fetch('http://localhost:5000/api/admin/fees', { headers }),
        fetch('http://localhost:5000/api/admin/loans', { headers })
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (groupsRes.ok) setGroups(await groupsRes.json());
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

  // Handlers
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/bulk-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(bulkData)
      });
      const data = await res.json();
      setBulkMessage(data.message || (res.ok ? 'Success' : 'Failed'));
      if (res.ok) {
        fetchData();
        setTimeout(() => setUserModalOpen(false), 1500);
      }
    } catch (err) { setBulkMessage('Server error'); }
  };

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(groupData)
      });
      const data = await res.json();
      setGroupMessage(res.ok ? 'Group created successfully!' : (data.message || 'Failed to create group'));
      if (res.ok) {
        fetchData();
        setTimeout(() => setGroupModalOpen(false), 1500);
      }
    } catch (err) { setGroupMessage('Server error'); }
  };

  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/fees/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(feeData)
      });
      const data = await res.json();
      setFeeMessage(res.ok ? 'Fee assigned successfully!' : (data.message || 'Failed to assign fee'));
      if (res.ok) {
        fetchData();
        setTimeout(() => setFeeModalOpen(false), 1500);
      }
    } catch (err) { setFeeMessage('Server error'); }
  };

  const updateLoanStatus = async (loanId, status) => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/loans/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ loanId, status })
      });
      if (res.ok) fetchData();
    } catch (err) { console.error('Failed to update loan', err); }
  };

  // Render Helpers
  const renderDashboard = () => {
    const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
    const pendingLoans = loans.filter(l => l.status === 'pending');
    const totalLoanVolume = loans.reduce((sum, l) => sum + l.amount, 0);

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
                <DollarSign size={20} />
              </div>
              <h4 style={{ margin: 0 }}>Total Fees</h4>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>${totalFees.toFixed(2)}</p>
          </NeoCard>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <NeoCard style={{ flex: '2', minWidth: '400px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Recent Applications</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.slice(0, 5).map(l => (
                    <tr key={l._id}>
                      <td>{l.user?.name}</td>
                      <td style={{ fontWeight: 'bold' }}>${l.amount}</td>
                      <td>
                        <span style={{ 
                          padding: '0.3rem 0.6rem', borderRadius: '10px', fontSize: '0.8rem',
                          backgroundColor: l.status === 'pending' ? 'var(--clay-peach-light)' : l.status === 'approved' ? 'var(--clay-mint-light)' : 'var(--clay-pink-light)',
                          color: l.status === 'pending' ? '#9a3412' : l.status === 'approved' ? '#115e59' : '#831843'
                        }}>
                          {l.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {l.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <NeoButton variant="mint" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => updateLoanStatus(l._id, 'approved')}>Approve</NeoButton>
                            <NeoButton variant="pink" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => updateLoanStatus(l._id, 'rejected')}>Reject</NeoButton>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {loans.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>No recent requests</td></tr>}
                </tbody>
              </table>
            </div>
          </NeoCard>

          <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <NeoCard style={{ backgroundColor: 'var(--clay-lavender-light)'}}>
              <h4 style={{ color: 'var(--icon-lavender)' }}>Pending Loans</h4>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--icon-lavender)' }}>{pendingLoans.length}</p>
            </NeoCard>
            <NeoCard style={{ backgroundColor: 'var(--clay-mint-light)' }}>
              <h4 style={{ color: 'var(--icon-mint)' }}>Requested Vol</h4>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--icon-mint)' }}>${totalLoanVolume.toFixed(2)}</p>
            </NeoCard>
          </div>
        </div>
      </div>
    );
  };

  const renderUserManagement = () => (
    <div style={{ animation: 'slideUp 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)' }}>User Management</h2>
        <NeoButton variant="mint" onClick={() => setUserModalOpen(true)}>
          <Plus size={20} /> Bulk Create
        </NeoButton>
      </div>
      
      <NeoCard>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.username}</td>
                  <td>{u.name}</td>
                  <td>
                    <span style={{ 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '12px', 
                      backgroundColor: u.role === 'admin' ? 'var(--clay-pink-light)' : 'var(--clay-mint-light)',
                      color: u.role === 'admin' ? '#831843' : '#115e59',
                      fontSize: '0.8rem'
                    }}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center' }}>No users found</td></tr>}
            </tbody>
          </table>
        </div>
      </NeoCard>
    </div>
  );

  const renderGroupManagement = () => (
    <div style={{ animation: 'slideUp 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)' }}>Group Management</h2>
        <NeoButton variant="pink" onClick={() => setGroupModalOpen(true)}>
          <Plus size={20} /> Create Group
        </NeoButton>
      </div>
      
      <NeoCard>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Group Name</th>
                <th>Description</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(g => (
                <tr key={g._id}>
                  <td>{g.name}</td>
                  <td>{g.description || '-'}</td>
                  <td>{new Date(g.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {groups.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center' }}>No groups found</td></tr>}
            </tbody>
          </table>
        </div>
      </NeoCard>
    </div>
  );

  const renderFeeManagement = () => (
    <div style={{ animation: 'slideUp 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)' }}>Fee Management</h2>
        <NeoButton variant="peach" onClick={() => setFeeModalOpen(true)}>
          <Plus size={20} /> Assign Fee
        </NeoButton>
      </div>

      <NeoCard>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Fee Title</th>
                <th>Amount</th>
                <th>Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {fees.map(f => (
                <tr key={f._id}>
                  <td>{f.title}</td>
                  <td style={{ color: 'var(--clay-peach)', fontSize: '1.2rem', fontWeight: 'bold' }}>${f.amount}</td>
                  <td>
                    <span style={{ 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '12px', 
                      backgroundColor: 'var(--bg-color)',
                      boxShadow: 'var(--clay-outer)',
                      fontSize: '0.8rem'
                    }}>
                      {f.assignedToGroup ? `Group: ${f.assignedToGroup.name}` : 'Individual'}
                    </span>
                  </td>
                </tr>
              ))}
              {fees.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center' }}>No fees found</td></tr>}
            </tbody>
          </table>
        </div>
      </NeoCard>
    </div>
  );

  return (
    <div className="app-container dashboard-layout">
      
      {/* Fluffy Sidebar Navigation */}
      <div className="sidebar">
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--text-light)'}}>
           <div style={{ width: '50px', height: '50px', backgroundColor: 'var(--clay-base)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--clay-outer)' }}>
             <Settings size={28} color="var(--primary)" />
           </div>
           <div>
             <h3 style={{ margin: 0, color: 'var(--text-color)' }}>Admin</h3>
             <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Portal</span>
           </div>
        </div>
        
        <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <LayoutDashboard size={20} /> <span className="nav-text">Dashboard</span>
        </div>
        <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          <Users size={20} /> <span className="nav-text">User Mgmt</span>
        </div>
        <div className={`nav-item ${activeTab === 'groups' ? 'active' : ''}`} onClick={() => setActiveTab('groups')}>
          <Activity size={20} /> <span className="nav-text">Group Mgmt</span>
        </div>
        <div className={`nav-item ${activeTab === 'fees' ? 'active' : ''}`} onClick={() => setActiveTab('fees')}>
          <DollarSign size={20} /> <span className="nav-text">Fee Mgmt</span>
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
            {activeTab === 'dashboard' && 'Dashboard Overview'}
            {activeTab === 'users' && 'Manage Users'}
            {activeTab === 'groups' && 'Manage Groups'}
            {activeTab === 'fees' && 'Manage Fees'}
          </h2>
          <div className="header-actions">
            <div className="search-box">
              <NeoInput type="text" placeholder="Search..." Icon={FileText} />
            </div>
            <ThemeToggle />
          </div>
        </div>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUserManagement()}
        {activeTab === 'groups' && renderGroupManagement()}
        {activeTab === 'fees' && renderFeeManagement()}
      </div>

      {/* Modals */}
      <NeoModal isOpen={isUserModalOpen} onClose={() => { setUserModalOpen(false); setBulkMessage(''); }} title="Bulk Create Users">
        <form onSubmit={handleBulkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <NeoInput type="text" placeholder="Prefix (e.g. 711524BAD)" value={bulkData.prefix} onChange={e => setBulkData({...bulkData, prefix: e.target.value})} required />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <NeoInput type="number" placeholder="Start (e.g. 1)" value={bulkData.startRange} onChange={e => setBulkData({...bulkData, startRange: e.target.value})} required />
            <NeoInput type="number" placeholder="End (e.g. 175)" value={bulkData.endRange} onChange={e => setBulkData({...bulkData, endRange: e.target.value})} required />
          </div>
          <NeoInput type="text" placeholder="Suffix (e.g. A) - Optional" value={bulkData.suffix} onChange={e => setBulkData({...bulkData, suffix: e.target.value})} />
          <NeoInput type="text" placeholder="Initial Password" value={bulkData.initialPassword} onChange={e => setBulkData({...bulkData, initialPassword: e.target.value})} required />
          <NeoButton variant="mint" type="submit" style={{ width: '100%', marginTop: '1rem' }}>Generate Users</NeoButton>
          {bulkMessage && <p style={{ marginTop: '1rem', color: 'var(--clay-mint)', textAlign: 'center' }}>{bulkMessage}</p>}
        </form>
      </NeoModal>

      <NeoModal isOpen={isGroupModalOpen} onClose={() => { setGroupModalOpen(false); setGroupMessage(''); }} title="Create Group">
        <form onSubmit={handleGroupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <NeoInput type="text" placeholder="Group Name (e.g. Batch A)" value={groupData.name} onChange={e => setGroupData({...groupData, name: e.target.value})} required />
          <NeoInput type="text" placeholder="Description" value={groupData.description} onChange={e => setGroupData({...groupData, description: e.target.value})} />
          <NeoButton variant="pink" type="submit" style={{ width: '100%', marginTop: '1rem' }}>Create Group</NeoButton>
          {groupMessage && <p style={{ marginTop: '1rem', color: 'var(--clay-pink)', textAlign: 'center' }}>{groupMessage}</p>}
        </form>
      </NeoModal>

      <NeoModal isOpen={isFeeModalOpen} onClose={() => { setFeeModalOpen(false); setFeeMessage(''); }} title="Assign Fee">
        <form onSubmit={handleFeeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <NeoInput type="text" placeholder="Fee Title (e.g. Fall Tuition)" value={feeData.title} onChange={e => setFeeData({...feeData, title: e.target.value})} required />
          <NeoInput type="number" placeholder="Amount ($)" value={feeData.amount} onChange={e => setFeeData({...feeData, amount: e.target.value})} required />
          
          <div style={{ position: 'relative' }}>
            <select 
              style={{
                width: '100%',
                backgroundColor: 'var(--clay-base)',
                border: 'none',
                borderRadius: '50px',
                padding: '1rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: '700',
                color: 'var(--text-color)',
                boxShadow: 'var(--clay-outer)',
                outline: 'none',
                cursor: 'pointer'
              }}
              value={feeData.groupId}
              onChange={e => setFeeData({...feeData, groupId: e.target.value})}
              required
            >
              <option value="">Select Group...</option>
              {groups.map(g => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>

          <NeoButton variant="peach" type="submit" style={{ width: '100%', marginTop: '1rem' }}>Assign Fee</NeoButton>
          {feeMessage && <p style={{ marginTop: '1rem', color: 'var(--clay-peach)', textAlign: 'center' }}>{feeMessage}</p>}
        </form>
      </NeoModal>
      
    </div>
  );
};

export default AdminDashboard;

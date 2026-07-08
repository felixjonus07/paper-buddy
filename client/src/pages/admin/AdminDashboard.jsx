import React, { useState, useEffect } from 'react';
import NeoCard from '../../components/UI/NeoCard';
import NeoButton from '../../components/UI/NeoButton';
import NeoInput from '../../components/UI/NeoInput';
import NeoModal from '../../components/UI/NeoModal';
import NeoSelect from '../../components/UI/NeoSelect';
import ThemeToggle from '../../components/UI/ThemeToggle';
import GlowChart from '../../components/UI/GlowChart';
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
  const [feeTypes, setFeeTypes] = useState([]);
  const [scholarships, setScholarships] = useState([]);

  // Modal States
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [isFeeModalOpen, setFeeModalOpen] = useState(false);
  const [isEditUserModalOpen, setEditUserModalOpen] = useState(false);

  // Form States
  const [bulkData, setBulkData] = useState({ prefix: '', startRange: '', endRange: '', suffix: '', initialPassword: '' });
  const [bulkMessage, setBulkMessage] = useState('');
  
  const [groupData, setGroupData] = useState({ name: '', description: '', studentIds: [] });
  const [groupMessage, setGroupMessage] = useState('');

  const [feeData, setFeeData] = useState({ title: '', amount: '', feeType: '', groupId: '' });
  const [feeMessage, setFeeMessage] = useState('');

  const [isAssignStudentModalOpen, setAssignStudentModalOpen] = useState(false);
  const [isAssignSubgroupModalOpen, setAssignSubgroupModalOpen] = useState(false);
  const [isGlowChartModalOpen, setGlowChartModalOpen] = useState(false);
  
  const [selectedUserForGroup, setSelectedUserForGroup] = useState(null);
  const [selectedGroupForSub, setSelectedGroupForSub] = useState(null);
  const [selectedGroupForChart, setSelectedGroupForChart] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  
  const [assignStudentData, setAssignStudentData] = useState({ groupId: '' });
  const [assignSubgroupData, setAssignSubgroupData] = useState({ parentId: '' });
  
  const [editUserData, setEditUserData] = useState({ scholarship: 'NONE', academicScore: 0, _id: null });

  const [newFeeType, setNewFeeType] = useState({ name: '', description: '' });
  const [newScholarship, setNewScholarship] = useState({ name: '', description: '', discountPercentage: '', minAcademicScore: '', applicableFeeTypes: [] });
  const [masterMessage, setMasterMessage] = useState('');

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [usersRes, groupsRes, feesRes, loansRes, catsRes, schRes] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/groups', { headers }),
        fetch('/api/admin/fees', { headers }),
        fetch('/api/admin/loans', { headers }),
        fetch('/api/admin/fee-types', { headers }),
        fetch('/api/admin/scholarships', { headers })
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (groupsRes.ok) setGroups(await groupsRes.json());
      if (feesRes.ok) setFees(await feesRes.json());
      if (loansRes.ok) setLoans(await loansRes.json());
      if (catsRes.ok) setFeeTypes(await catsRes.json());
      if (schRes.ok) setScholarships(await schRes.json());
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
      const res = await fetch('/api/admin/bulk-users', {
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
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(groupData)
      });
      const data = await res.json();
      setGroupMessage(res.ok ? 'Group created successfully!' : (data.message || 'Failed to create group'));
      if (res.ok) {
        fetchData();
        setGroupData({ name: '', description: '', studentIds: [] });
        setTimeout(() => setGroupModalOpen(false), 1500);
      }
    } catch (err) { setGroupMessage('Server error'); }
  };

  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/fees/group', {
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
      const res = await fetch('/api/admin/loans/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ loanId, status })
      });
      if (res.ok) fetchData();
    } catch (err) { console.error('Failed to update loan', err); }
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users/assign-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: selectedUserForGroup?._id, groupId: assignStudentData.groupId })
      });
      if (res.ok) {
        fetchData();
        setAssignStudentModalOpen(false);
      }
    } catch (err) { console.error(err); }
  };

  const handleAssignSubgroup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/groups/assign-subgroup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ childId: selectedGroupForSub?._id, parentId: assignSubgroupData.parentId })
      });
      if (res.ok) {
        fetchData();
        setAssignSubgroupModalOpen(false);
      }
    } catch (err) { console.error(err); }
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/users/${editUserData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          scholarship: editUserData.scholarship,
          academicScore: Number(editUserData.academicScore)
        })
      });
      if (res.ok) {
        fetchData();
        setEditUserModalOpen(false);
      }
    } catch (err) { console.error(err); }
  };

  const handleCreateFeeType = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/fee-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newFeeType)
      });
      if (res.ok) {
        setNewFeeType({ name: '', description: '' });
        fetchData();
        setMasterMessage('Fee Type created successfully');
        setTimeout(() => setMasterMessage(''), 3000);
      } else {
        setMasterMessage('Failed to create Fee Type');
      }
    } catch (err) { setMasterMessage('Error creating Fee Type'); }
  };

  const handleCreateScholarship = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/scholarships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...newScholarship,
          discountPercentage: Number(newScholarship.discountPercentage),
          minAcademicScore: newScholarship.minAcademicScore ? Number(newScholarship.minAcademicScore) : 0
        })
      });
      if (res.ok) {
        setNewScholarship({ name: '', discountPercentage: '', minAcademicScore: '', applicableFeeTypes: [] });
        fetchData();
        setMasterMessage('Scholarship created successfully');
        setTimeout(() => setMasterMessage(''), 3000);
      } else {
        setMasterMessage('Failed to create Scholarship');
      }
    } catch (err) { setMasterMessage('Error creating Scholarship'); }
  };
  
  const handleDeleteFeeType = async (id) => {
    if(!window.confirm('Are you sure you want to delete this fee category?')) return;
    try {
      const res = await fetch(`/api/admin/fee-types/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) fetchData();
    } catch (err) {}
  };
  
  const handleDeleteScholarship = async (id) => {
    if(!window.confirm('Are you sure you want to delete this scholarship?')) return;
    try {
      const res = await fetch(`/api/admin/scholarships/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) fetchData();
    } catch (err) {}
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
            <div className="card-grid">
              {loans.slice(0, 5).map(l => (
                <NeoCard key={l._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{l.user?.name}</strong>
                    <span style={{ 
                      padding: '0.3rem 0.6rem', borderRadius: '10px', fontSize: '0.8rem',
                      backgroundColor: l.status === 'pending' ? 'var(--clay-peach-light)' : l.status === 'approved' ? 'var(--clay-mint-light)' : 'var(--clay-pink-light)',
                      color: l.status === 'pending' ? '#9a3412' : l.status === 'approved' ? '#115e59' : '#831843'
                    }}>
                      {l.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${l.amount}</div>
                  
                  {l.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                      <NeoButton variant="mint" style={{ flex: 1, padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => updateLoanStatus(l._id, 'approved')}>Approve</NeoButton>
                      <NeoButton variant="pink" style={{ flex: 1, padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => updateLoanStatus(l._id, 'rejected')}>Reject</NeoButton>
                    </div>
                  )}
                </NeoCard>
              ))}
              {loans.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-light)', width: '100%' }}>No recent requests</p>}
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
      
      <div className="card-grid">
        {users.map(u => (
          <NeoCard key={u._id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.2rem', cursor: 'pointer' }} onClick={() => setExpandedUser(expandedUser === u._id ? null : u._id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0 }}>{u.name}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>@{u.username}</span>
              </div>
              <span style={{ 
                padding: '0.3rem 0.6rem', 
                borderRadius: '12px', 
                backgroundColor: u.role === 'admin' ? 'var(--clay-pink-light)' : 'var(--clay-mint-light)',
                color: u.role === 'admin' ? '#831843' : '#115e59',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {u.role.toUpperCase()}
              </span>
            </div>

            {expandedUser === u._id && (
              <div style={{ backgroundColor: 'rgba(128,128,128,0.05)', padding: '0.8rem', borderRadius: '12px', marginTop: '0.5rem' }}>
                <strong style={{ fontSize: '0.85rem' }}>Enrolled Groups:</strong> 
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {u.groups && u.groups.length > 0 ? u.groups.map(g => (
                    <span key={g._id} style={{ padding: '0.3rem 0.6rem', borderRadius: '10px', backgroundColor: 'var(--clay-base)', boxShadow: 'var(--clay-outer)', fontSize: '0.8rem' }}>{g.name}</span>
                  )) : <span style={{ fontStyle: 'italic', color: 'var(--text-light)', fontSize: '0.8rem' }}>No groups assigned</span>}
                </div>
              </div>
            )}

            {u.role === 'user' && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem' }}>
                <NeoButton variant="peach" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); setEditUserData({ _id: u._id, scholarship: u.scholarship?._id || 'NONE', academicScore: u.academicScore || 0 }); setEditUserModalOpen(true); }}>Edit Profile</NeoButton>
                <NeoButton variant="mint" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); setSelectedUserForGroup(u); setAssignStudentModalOpen(true); }}>Assign Group</NeoButton>
              </div>
            )}
          </NeoCard>
        ))}
        {users.length === 0 && <p style={{ textAlign: 'center', width: '100%', color: 'var(--text-light)' }}>No users found</p>}
      </div>
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
      
      <div className="card-grid">
        {groups.map(g => (
          <NeoCard key={g._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1.2rem', cursor: 'pointer' }} onClick={() => navigate('/admin/groups/' + g._id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{g.name}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                {new Date(g.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            {g.parentGroups && g.parentGroups.length > 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--clay-peach)', display: 'inline-block', backgroundColor: 'var(--clay-peach-light)', padding: '0.2rem 0.5rem', borderRadius: '8px', alignSelf: 'flex-start' }}>
                Subgroup of: {g.parentGroups.map(p => p.name).join(', ')}
              </span>
            )}
            
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)', flex: 1 }}>{g.description || 'No description provided'}</p>
            
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(128,128,128,0.1)' }}>
              <NeoButton variant="pink" style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }} onClick={(e) => { e.stopPropagation(); setSelectedGroupForSub(g); setAssignSubgroupModalOpen(true); }}>
                Assign Parent Group
              </NeoButton>
            </div>
          </NeoCard>
        ))}
        {groups.length === 0 && <p style={{ textAlign: 'center', width: '100%', color: 'var(--text-light)' }}>No groups found</p>}
      </div>
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

      <div className="card-grid">
        {fees.map(f => (
          <NeoCard key={f._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1.2rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{f.title}</h3>
            <div style={{ color: 'var(--clay-peach)', fontSize: '1.8rem', fontWeight: 'bold' }}>${f.amount}</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ 
                padding: '0.4rem 0.8rem', 
                borderRadius: '12px', 
                backgroundColor: 'var(--bg-color)',
                boxShadow: 'var(--clay-outer)',
                fontSize: '0.85rem'
              }}>
                <strong>Type:</strong> {f.feeType?.name || 'N/A'}
              </span>
              <span style={{ 
                padding: '0.4rem 0.8rem', 
                borderRadius: '12px', 
                backgroundColor: 'var(--bg-color)',
                boxShadow: 'var(--clay-outer)',
                fontSize: '0.85rem'
              }}>
                <strong>Assigned To:</strong> {f.assignedToGroup ? f.assignedToGroup.name : 'Individual'}
              </span>
            </div>
          </NeoCard>
        ))}
        {fees.length === 0 && <p style={{ textAlign: 'center', width: '100%', color: 'var(--text-light)' }}>No fees found</p>}
      </div>
    </div>
  );

  const renderFeeTypesManagement = () => (
    <div style={{ animation: 'slideUp 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)' }}>Fee Types</h2>
      </div>

      {masterMessage && <p style={{ color: 'var(--clay-mint)', textAlign: 'center', marginBottom: '1rem' }}>{masterMessage}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <NeoCard>
          <form onSubmit={handleCreateFeeType} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <NeoInput type="text" placeholder="Fee Type Name (e.g. Tuition)" value={newFeeType.name} onChange={e => setNewFeeType({...newFeeType, name: e.target.value})} required />
            <NeoInput type="text" placeholder="Description" value={newFeeType.description} onChange={e => setNewFeeType({...newFeeType, description: e.target.value})} />
            <NeoButton variant="pink" type="submit">Create Fee Type</NeoButton>
          </form>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Existing Fee Types</h3>
          <div className="card-grid">
            {feeTypes.map(c => (
              <NeoCard key={c._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1rem', backgroundColor: 'var(--bg-color)', boxShadow: 'var(--clay-outer)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{c.name}</h4>
                  <NeoButton variant="peach" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handleDeleteFeeType(c._id)}>Delete</NeoButton>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)', flex: 1 }}>{c.description || 'No description provided'}</p>
              </NeoCard>
            ))}
            {feeTypes.length === 0 && <p style={{ textAlign: 'center', width: '100%', color: 'var(--text-light)' }}>No fee types defined</p>}
          </div>
        </NeoCard>
      </div>
    </div>
  );

  const renderScholarshipsManagement = () => (
    <div style={{ animation: 'slideUp 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)' }}>Scholarships</h2>
      </div>

      {masterMessage && <p style={{ color: 'var(--clay-mint)', textAlign: 'center', marginBottom: '1rem' }}>{masterMessage}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <NeoCard>
          <form onSubmit={handleCreateScholarship} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <NeoInput type="text" placeholder="Scholarship Name" value={newScholarship.name} onChange={e => setNewScholarship({...newScholarship, name: e.target.value})} required />
            <NeoInput type="text" placeholder="Description (Optional)" value={newScholarship.description || ''} onChange={e => setNewScholarship({...newScholarship, description: e.target.value})} />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <NeoInput type="number" placeholder="Discount %" value={newScholarship.discountPercentage} onChange={e => setNewScholarship({...newScholarship, discountPercentage: e.target.value})} required />
              <NeoInput type="number" placeholder="Min Score (Optional)" value={newScholarship.minAcademicScore} onChange={e => setNewScholarship({...newScholarship, minAcademicScore: e.target.value})} />
            </div>
            
            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.5rem', display: 'block' }}>Applicable Fee Types (Leave blank for all)</label>
              <div style={{
                maxHeight: '150px',
                overflowY: 'auto',
                backgroundColor: 'var(--clay-base)',
                borderRadius: '20px',
                padding: '1rem',
                boxShadow: 'var(--clay-outer)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem'
              }}>
                {feeTypes.map(c => (
                  <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => {
                    const current = newScholarship.applicableFeeTypes || [];
                    const next = current.includes(c._id) ? current.filter(id => id !== c._id) : [...current, c._id];
                    setNewScholarship({...newScholarship, applicableFeeTypes: next});
                  }}>
                    <input type="checkbox" checked={(newScholarship.applicableFeeTypes || []).includes(c._id)} readOnly style={{ accentColor: 'var(--primary)', transform: 'scale(1.2)' }} />
                    <span style={{ color: 'var(--text-color)' }}>{c.name}</span>
                  </div>
                ))}
                {feeTypes.length === 0 && <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>No fee types available.</span>}
              </div>
            </div>
            <NeoButton variant="mint" type="submit">Create Scholarship</NeoButton>
          </form>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Existing Scholarships</h3>
          <div className="card-grid">
            {scholarships.map(s => (
              <NeoCard key={s._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1rem', backgroundColor: 'var(--bg-color)', boxShadow: 'var(--clay-outer)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{s.name}</h4>
                  <div style={{ color: 'var(--clay-mint)', fontSize: '1.2rem', fontWeight: 'bold' }}>{s.discountPercentage}%</div>
                </div>
                {s.description && (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)', fontStyle: 'italic' }}>{s.description}</p>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                    <strong>Min Score:</strong> {s.minAcademicScore}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                    <strong>Applies to:</strong> {s.applicableFeeTypes && s.applicableFeeTypes.length > 0 ? s.applicableFeeTypes.map(c => c ? (feeTypes.find(fc => fc._id === (c._id || c))?.name || c.name || 'Unknown') : 'Unknown').join(', ') : 'All Fee Types'}
                  </span>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(128,128,128,0.1)' }}>
                  <NeoButton variant="peach" style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem' }} onClick={() => handleDeleteScholarship(s._id)}>Delete Scholarship</NeoButton>
                </div>
              </NeoCard>
            ))}
            {scholarships.length === 0 && <p style={{ textAlign: 'center', width: '100%', color: 'var(--text-light)' }}>No scholarships defined</p>}
          </div>
        </NeoCard>
      </div>
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
          <Activity size={20} /> <span className="nav-text">Student Groups</span>
        </div>
        <div className={`nav-item ${activeTab === 'fees' ? 'active' : ''}`} onClick={() => setActiveTab('fees')}>
          <DollarSign size={20} /> <span className="nav-text">Fee Mgmt</span>
        </div>
        <div className={`nav-item ${activeTab === 'fee-types' ? 'active' : ''}`} onClick={() => setActiveTab('fee-types')}>
          <Settings size={20} /> <span className="nav-text">Fee Types</span>
        </div>
        <div className={`nav-item ${activeTab === 'scholarships' ? 'active' : ''}`} onClick={() => setActiveTab('scholarships')}>
          <Settings size={20} /> <span className="nav-text">Scholarships</span>
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
            {activeTab === 'fee-types' && 'Manage Fee Types'}
            {activeTab === 'scholarships' && 'Manage Scholarships'}
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
        {activeTab === 'fee-types' && renderFeeTypesManagement()}
        {activeTab === 'scholarships' && renderScholarshipsManagement()}
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
          
          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.5rem', display: 'block' }}>Assign Students (Optional)</label>
            <div style={{
              maxHeight: '150px',
              overflowY: 'auto',
              backgroundColor: 'var(--clay-base)',
              borderRadius: '20px',
              padding: '1rem',
              boxShadow: 'var(--clay-outer)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem'
            }}>
              {users.filter(u => u.role === 'user').map(u => (
                <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => {
                  const current = groupData.studentIds || [];
                  const next = current.includes(u._id) ? current.filter(id => id !== u._id) : [...current, u._id];
                  setGroupData({...groupData, studentIds: next});
                }}>
                  <input type="checkbox" checked={(groupData.studentIds || []).includes(u._id)} readOnly style={{ accentColor: 'var(--primary)', transform: 'scale(1.2)' }} />
                  <span style={{ color: 'var(--text-color)' }}>{u.name} ({u.username})</span>
                </div>
              ))}
              {users.filter(u => u.role === 'user').length === 0 && <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>No students available.</span>}
            </div>
          </div>

          <NeoButton variant="pink" type="submit" style={{ width: '100%', marginTop: '1rem' }}>Create Group</NeoButton>
          {groupMessage && <p style={{ marginTop: '1rem', color: 'var(--clay-pink)', textAlign: 'center' }}>{groupMessage}</p>}
        </form>
      </NeoModal>

      <NeoModal isOpen={isFeeModalOpen} onClose={() => { setFeeModalOpen(false); setFeeMessage(''); }} title="Assign Fee">
        <form onSubmit={handleFeeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <NeoInput type="text" placeholder="Fee Title (e.g. Fall Tuition)" value={feeData.title} onChange={e => setFeeData({...feeData, title: e.target.value})} required />
          <NeoInput type="number" placeholder="Amount ($)" value={feeData.amount} onChange={e => setFeeData({...feeData, amount: e.target.value})} required />
          
          <div style={{ position: 'relative' }}>
            <NeoSelect 
              value={feeData.feeType}
              onChange={val => setFeeData({...feeData, feeType: val})}
              required={true}
              placeholder="Select Fee Type..."
              options={feeTypes.map(c => ({ value: c._id, label: c.name }))}
              style={{ marginBottom: '1rem' }}
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <NeoSelect 
              value={feeData.groupId}
              onChange={val => setFeeData({...feeData, groupId: val})}
              required={true}
              placeholder="Select Group..."
              options={groups.map(g => ({ value: g._id, label: g.name }))}
            />
          </div>

          <NeoButton variant="peach" type="submit" style={{ width: '100%', marginTop: '1rem' }}>Assign Fee</NeoButton>
          {feeMessage && <p style={{ marginTop: '1rem', color: 'var(--clay-peach)', textAlign: 'center' }}>{feeMessage}</p>}
        </form>
      </NeoModal>
      
      {/* Assign Student Modal */}
      <NeoModal isOpen={isAssignStudentModalOpen} onClose={() => setAssignStudentModalOpen(false)} title={`Assign ${selectedUserForGroup?.name} to Group`}>
        <form onSubmit={handleAssignStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <NeoSelect 
            value={assignStudentData.groupId}
            onChange={val => setAssignStudentData({ groupId: val })}
            required={true}
            placeholder="Select Group..."
            options={groups.map(g => ({ value: g._id, label: g.name }))}
          />
          <NeoButton variant="mint" type="submit" style={{ width: '100%', marginTop: '1rem' }}>Assign</NeoButton>
        </form>
      </NeoModal>

      {/* Assign Subgroup Modal */}
      <NeoModal isOpen={isAssignSubgroupModalOpen} onClose={() => setAssignSubgroupModalOpen(false)} title={`Set Parent for ${selectedGroupForSub?.name}`}>
        <form onSubmit={handleAssignSubgroup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <NeoSelect 
            value={assignSubgroupData.parentId}
            onChange={val => setAssignSubgroupData({ parentId: val })}
            required={true}
            placeholder="Select Parent Group..."
            options={groups.filter(g => g._id !== selectedGroupForSub?._id).map(g => ({ value: g._id, label: g.name }))}
          />
          <NeoButton variant="pink" type="submit" style={{ width: '100%', marginTop: '1rem' }}>Set Parent</NeoButton>
        </form>
      </NeoModal>

      {/* Edit User Modal */}
      <NeoModal isOpen={isEditUserModalOpen} onClose={() => setEditUserModalOpen(false)} title="Edit Student Profile">
        <form onSubmit={handleEditUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <NeoInput type="number" placeholder="Academic Score (0-100)" value={editUserData.academicScore} onChange={e => setEditUserData({...editUserData, academicScore: e.target.value})} required />
          <NeoSelect 
            value={editUserData.scholarship}
            onChange={val => setEditUserData({...editUserData, scholarship: val})}
            required={true}
            placeholder="No Scholarship"
            options={[
              { value: 'NONE', label: 'No Scholarship' },
              ...scholarships.map(s => ({ value: s._id, label: `${s.name} (${s.discountPercentage}% Off)` }))
            ]}
          />
          <NeoButton variant="mint" type="submit" style={{ width: '100%', marginTop: '1rem' }}>Save Changes</NeoButton>
        </form>
      </NeoModal>


    </div>
  );
};

export default AdminDashboard;

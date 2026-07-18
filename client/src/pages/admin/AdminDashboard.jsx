import React, { useState, useEffect } from 'react';
import NeoCard from '../../components/UI/NeoCard';
import NeoButton from '../../components/UI/NeoButton';
import NeoInput from '../../components/UI/NeoInput';
import NeoModal from '../../components/UI/NeoModal';
import NeoSelect from '../../components/UI/NeoSelect';
import ThemeToggle from '../../components/UI/ThemeToggle';
import GlowChart from '../../components/UI/GlowChart';
import { Users, FileText, Activity, IndianRupee, LayoutDashboard, Settings, Plus, LogOut, Layers, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Global Data State
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [fees, setFees] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [feeRequests, setFeeRequests] = useState([]);

  // Modal States
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [isFeeModalOpen, setFeeModalOpen] = useState(false);
  const [isAssignUserFeeModalOpen, setAssignUserFeeModalOpen] = useState(false);
  const [isEditUserModalOpen, setEditUserModalOpen] = useState(false);
  const [isEditGroupModalOpen, setEditGroupModalOpen] = useState(false);
  const [isCreateMentorModalOpen, setCreateMentorModalOpen] = useState(false);

  // Form States
  const [bulkData, setBulkData] = useState({ prefix: '', startRange: '', endRange: '', suffix: '', initialPassword: '' });
  const [bulkMessage, setBulkMessage] = useState('');
  
  const [groupData, setGroupData] = useState({ name: '', description: '', studentIds: [], isGlobal: false });
  const [groupMessage, setGroupMessage] = useState('');

  const [editGroupData, setEditGroupData] = useState({ _id: null, name: '', description: '', isGlobal: false });
  const [editGroupMessage, setEditGroupMessage] = useState('');

  const [mentorData, setMentorData] = useState({ groupId: null, name: '', username: '', password: '' });
  const [mentorMessage, setMentorMessage] = useState('');

  const [feeData, setFeeData] = useState({ title: '', amount: '', feeType: '', groupId: '' });
  const [feeMessage, setFeeMessage] = useState('');
  
  const [userFeeData, setUserFeeData] = useState({ title: '', amount: '', feeType: '', userId: '' });
  const [currentFeeRequest, setCurrentFeeRequest] = useState(null);

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
      
      const [usersRes, groupsRes, feesRes, catsRes, schRes, feeReqRes] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/groups', { headers }),
        fetch('/api/admin/fees', { headers }),
        fetch('/api/admin/fee-types', { headers }),
        fetch('/api/admin/scholarships', { headers }),
        fetch('/api/admin/fee-requests', { headers })
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (groupsRes.ok) setGroups(await groupsRes.json());
      if (feesRes.ok) setFees(await feesRes.json());
      if (catsRes.ok) setFeeTypes(await catsRes.json());
      if (schRes.ok) setScholarships(await schRes.json());
      if (feeReqRes.ok) setFeeRequests(await feeReqRes.json());
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
        setGroupData({ name: '', description: '', studentIds: [], isGlobal: false });
        setTimeout(() => setGroupModalOpen(false), 1500);
      }
    } catch (err) { setGroupMessage('Server error'); }
  };

  const handleEditGroupSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/groups/${editGroupData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: editGroupData.name,
          description: editGroupData.description,
          isGlobal: editGroupData.isGlobal
        })
      });
      const data = await res.json();
      setEditGroupMessage(res.ok ? 'Group updated successfully!' : (data.message || 'Failed to update group'));
      if (res.ok) {
        fetchData();
        setTimeout(() => {
          setEditGroupModalOpen(false);
          setEditGroupMessage('');
        }, 1500);
      }
    } catch (err) { setEditGroupMessage('Server error'); }
  };

  const handleCreateMentorSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/groups/${mentorData.groupId}/mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: mentorData.name,
          username: mentorData.username,
          password: mentorData.password
        })
      });
      const data = await res.json();
      setMentorMessage(res.ok ? 'Mentor created successfully!' : (data.message || 'Failed to create mentor'));
      if (res.ok) {
        setTimeout(() => {
          setCreateMentorModalOpen(false);
          setMentorMessage('');
          setMentorData({ groupId: null, name: '', username: '', password: '' });
        }, 1500);
      }
    } catch (err) { setMentorMessage('Server error'); }
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

  const handleAssignUserFeeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/fees/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(userFeeData)
      });
      if (res.ok) {
        setAssignUserFeeModalOpen(false);
        fetchData();
        alert('Fee assigned to student successfully!');
      } else {
        alert('Failed to assign fee');
      }
    } catch (err) {
      console.error(err);
      alert('Error assigning fee');
    }
  };

  const handleUpdateFeeRequestStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/fee-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchData();
        if (status === 'approved') {
          const request = feeRequests.find(r => r._id === id);
          if (request) {
            setUserFeeData({ title: request.requestedFeeTitle, amount: request.amount || '', feeType: request.feeType?._id || '', userId: request.studentId._id });
            setCurrentFeeRequest(request);
            setAssignUserFeeModalOpen(true);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
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
  const handleDeleteFee = async (id) => {
    if(!window.confirm('Are you sure you want to delete this fee? This will safely remove it for all students who have not paid it yet.')) return;
    try {
      const res = await fetch(`/api/admin/fees/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        fetchData();
        alert('Fee deleted successfully!');
      } else {
        const data = await res.json();
        alert(`Cannot delete fee: ${data.message}`);
      }
    } catch (err) {
      alert('Error deleting fee');
    }
  };

  // Render Helpers
  const renderDashboard = () => {
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
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.4)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.5)',
                color: u.role === 'admin' ? 'var(--primary-dark)' : 'var(--primary)',
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
              <span style={{ 
                fontSize: '0.8rem', color: 'var(--primary-dark)', display: 'inline-block', 
                backgroundColor: 'var(--clay-peach-light)', 
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.4)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.5)',
                padding: '0.2rem 0.5rem', borderRadius: '8px', alignSelf: 'flex-start', fontWeight: 'bold' 
              }}>
                Subgroup of: {g.parentGroups.map(p => p.name).join(', ')}
              </span>
            )}
            
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)', flex: 1 }}>{g.description || 'No description provided'}</p>
            
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(128,128,128,0.1)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <NeoButton variant="mint" style={{ flex: '1 1 45%', padding: '0.5rem', fontSize: '0.85rem' }} onClick={(e) => { 
                e.stopPropagation(); 
                setEditGroupData({ _id: g._id, name: g.name, description: g.description || '', isGlobal: g.isGlobal || false });
                setEditGroupModalOpen(true);
              }}>
                Edit
              </NeoButton>
              <NeoButton variant="pink" style={{ flex: '1 1 45%', padding: '0.5rem', fontSize: '0.85rem' }} onClick={(e) => { e.stopPropagation(); setSelectedGroupForSub(g); setAssignSubgroupModalOpen(true); }}>
                Parent Group
              </NeoButton>
              <NeoButton variant="secondary" style={{ flex: '1 1 100%', padding: '0.5rem', fontSize: '0.85rem' }} onClick={(e) => { 
                e.stopPropagation(); 
                setMentorData({ ...mentorData, groupId: g._id });
                setCreateMentorModalOpen(true);
              }}>
                <Users size={16} style={{ display: 'inline', marginRight: '5px' }} /> Create Mentor
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
            <div style={{ color: 'var(--clay-peach)', fontSize: '1.8rem', fontWeight: 'bold' }}>₹{f.amount}</div>
            
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

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(128,128,128,0.1)' }}>
              <NeoButton variant="peach" style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }} onClick={() => handleDeleteFee(f._id)}>Delete Fee</NeoButton>
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

  const renderFeeRequests = () => (
    <div style={{ animation: 'slideUp 0.3s ease-out' }}>
      <h2 style={{ margin: 0, color: 'var(--primary)', marginBottom: '2rem' }}>Student Fee Requests</h2>
      
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {feeRequests.map(r => (
          <NeoCard key={r._id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.2rem' }}>{r.requestedFeeTitle}</h3>
                <p style={{ margin: '0.2rem 0', color: 'var(--text-color)', fontWeight: 'bold' }}>Requested by: {r.studentId?.name} (@{r.studentId?.username})</p>
                <p style={{ margin: '0', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                  {r.studentId?.studentClass || 'N/A'} - {r.studentId?.section || 'N/A'} | Reg No: {r.studentId?.registerNumber || 'N/A'}
                </p>
              </div>
              <div>
                <span style={{ 
                  padding: '0.3rem 0.6rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 'bold',
                  backgroundColor: r.status === 'pending' ? 'var(--clay-peach-light)' : r.status === 'approved' ? 'var(--clay-mint-light)' : 'var(--clay-pink-light)',
                  color: r.status === 'pending' ? '#9a3412' : r.status === 'approved' ? '#115e59' : '#831843'
                }}>
                  {r.status.toUpperCase()}
                </span>
              </div>
            </div>
            {r.reason && (
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text-color)' }}>
                <strong>Reason:</strong> {r.reason}
              </div>
            )}
            <div style={{ display: 'flex', gap: '2rem', padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text-color)' }}>
              <div><strong>Suggested Amount:</strong> ₹{r.amount}</div>
              <div><strong>Suggested Type:</strong> {r.feeType?.name || 'Unknown'}</div>
            </div>
            
            {r.status === 'pending' && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <NeoButton variant="mint" onClick={() => handleUpdateFeeRequestStatus(r._id, 'approved')}>Approve & Assign Fee</NeoButton>
                <NeoButton variant="peach" onClick={() => handleUpdateFeeRequestStatus(r._id, 'rejected')}>Reject</NeoButton>
              </div>
            )}
          </NeoCard>
        ))}
        {feeRequests.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>No fee requests found.</p>}
      </div>
    </div>
  );

  return (
    <div className="app-container dashboard-layout">
      
      {/* Fluffy Sidebar Navigation */}
      <div className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--text-light)', position: 'relative'}}>
           <div style={{ width: '50px', height: '50px', background: 'var(--overlay-bg)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.4)' }}>
             <Settings size={28} color="var(--primary)" />
           </div>
           <div className="header-text">
             <h3 style={{ margin: 0, color: 'var(--text-color)' }}>Admin</h3>
             <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Portal</span>
           </div>
           {/* Sidebar Toggle Button */}
           <button 
             onClick={() => setSidebarOpen(!isSidebarOpen)}
             style={{
               position: 'absolute', right: '-12px', top: '24px',
               width: '24px', height: '24px', borderRadius: '50%',
               background: 'rgba(248,116,16,0.15)',
               backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
               border: '1px solid rgba(248,116,16,0.35)', color: 'var(--primary)',
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               cursor: 'pointer', zIndex: 10, boxShadow: '0 4px 12px rgba(248,116,16,0.15), inset 0 1px 0 rgba(255,255,255,0.4)',
               transform: isSidebarOpen ? 'none' : 'translateX(10px)'
             }}
           >
             {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
           </button>
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
          <IndianRupee size={20} /> <span className="nav-text">Fees</span>
        </div>
        <div className={`nav-item ${activeTab === 'fee-requests' ? 'active' : ''}`} onClick={() => setActiveTab('fee-requests')}>
          <FileText size={20} /> <span className="nav-text">Fee Requests</span>
        </div>
        <div className={`nav-item ${activeTab === 'masters' ? 'active' : ''}`} onClick={() => setActiveTab('masters')}>
          <Layers size={20} /> <span className="nav-text">Fee Group Management</span>
        </div>
        <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <GraduationCap size={20} /> <span className="nav-text">Scholarship Control</span>
        </div>

        <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
          <NeoButton variant="secondary" onClick={handleLogout} style={{ width: '100%', padding: isSidebarOpen ? '0.8rem' : '0.8rem 0' }}>
            <LogOut size={18} /> {isSidebarOpen && 'Logout'}
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
            {activeTab === 'dashboard' && 'Admin Dashboard Overview'}
            {activeTab === 'users' && 'Manage Users'}
            {activeTab === 'groups' && 'Manage Groups'}
            {activeTab === 'fees' && 'Manage Fees'}
            {activeTab === 'fee-requests' && 'Fee Requests'}
            {activeTab === 'masters' && 'Fee Group Management'}
            {activeTab === 'settings' && 'Scholarship Control'}
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
        {activeTab === 'fee-requests' && renderFeeRequests()}
        {activeTab === 'masters' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            {renderFeeTypesManagement()}
          </div>
        )}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            {renderScholarshipsManagement()}
          </div>
        )}
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
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem 0' }}>
            <input 
              type="checkbox" 
              id="isGlobalToggle"
              checked={groupData.isGlobal || false} 
              onChange={e => setGroupData({...groupData, isGlobal: e.target.checked})} 
              style={{ accentColor: 'var(--primary)', transform: 'scale(1.2)', cursor: 'pointer' }} 
            />
            <label htmlFor="isGlobalToggle" style={{ fontSize: '0.9rem', color: 'var(--text-color)', cursor: 'pointer' }}>
              <strong>Global Group</strong> (Aggregates all fees/payments for members regardless of group assignment)
            </label>
          </div>

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

      <NeoModal isOpen={isEditGroupModalOpen} onClose={() => { setEditGroupModalOpen(false); setEditGroupMessage(''); }} title="Edit Group">
        <form onSubmit={handleEditGroupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <NeoInput type="text" placeholder="Group Name" value={editGroupData.name} onChange={e => setEditGroupData({...editGroupData, name: e.target.value})} required />
          <NeoInput type="text" placeholder="Description" value={editGroupData.description} onChange={e => setEditGroupData({...editGroupData, description: e.target.value})} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem 0' }}>
            <input 
              type="checkbox" 
              id="editIsGlobalToggle"
              checked={editGroupData.isGlobal || false} 
              onChange={e => setEditGroupData({...editGroupData, isGlobal: e.target.checked})} 
              style={{ accentColor: 'var(--primary)', transform: 'scale(1.2)', cursor: 'pointer' }} 
            />
            <label htmlFor="editIsGlobalToggle" style={{ fontSize: '0.9rem', color: 'var(--text-color)', cursor: 'pointer' }}>
              <strong>Global Group</strong> (Aggregates all fees/payments for members regardless of group assignment)
            </label>
          </div>

          <NeoButton variant="mint" type="submit" style={{ width: '100%', marginTop: '1rem' }}>Save Changes</NeoButton>
          {editGroupMessage && <p style={{ marginTop: '1rem', color: 'var(--clay-mint)', textAlign: 'center' }}>{editGroupMessage}</p>}
        </form>
      </NeoModal>

      <NeoModal isOpen={isCreateMentorModalOpen} onClose={() => { setCreateMentorModalOpen(false); setMentorMessage(''); }} title="Create Group Mentor">
        <form onSubmit={handleCreateMentorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <NeoInput type="text" placeholder="Mentor Name (e.g. John Doe)" value={mentorData.name} onChange={e => setMentorData({...mentorData, name: e.target.value})} required />
          <NeoInput type="text" placeholder="Username" value={mentorData.username} onChange={e => setMentorData({...mentorData, username: e.target.value})} required />
          <NeoInput type="password" placeholder="Password" value={mentorData.password} onChange={e => setMentorData({...mentorData, password: e.target.value})} required />

          <NeoButton variant="mint" type="submit" style={{ width: '100%', marginTop: '1rem' }}>Create Mentor</NeoButton>
          {mentorMessage && <p style={{ marginTop: '1rem', color: 'var(--clay-mint)', textAlign: 'center' }}>{mentorMessage}</p>}
        </form>
      </NeoModal>

      <NeoModal isOpen={isFeeModalOpen} onClose={() => { setFeeModalOpen(false); setFeeMessage(''); }} title="Assign Fee">
        <form onSubmit={handleFeeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <NeoInput type="text" placeholder="Fee Title (e.g. Fall Tuition)" value={feeData.title} onChange={e => setFeeData({...feeData, title: e.target.value})} required />
          <NeoInput type="number" placeholder="Amount (₹)" value={feeData.amount} onChange={e => setFeeData({...feeData, amount: e.target.value})} required />
          
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

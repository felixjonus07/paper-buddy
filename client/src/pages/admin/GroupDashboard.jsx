import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NeoCard from '../../components/UI/NeoCard';
import NeoButton from '../../components/UI/NeoButton';
import NeoModal from '../../components/UI/NeoModal';
import NeoInput from '../../components/UI/NeoInput';
import NeoSelect from '../../components/UI/NeoSelect';
import GlowChart from '../../components/UI/GlowChart';
import GroupStats from '../../components/group/GroupStats';
import SubgroupList from '../../components/group/SubgroupList';
import StudentList from '../../components/group/StudentList';
import AddStudentModal from '../../components/group/AddStudentModal';
import AddFeeModal from '../../components/group/AddFeeModal';
import { Users, IndianRupee, Activity, ArrowLeft, UserPlus, Network, PlusCircle } from 'lucide-react';

const GroupDashboard = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add Students State
  const [isAddStudentsModalOpen, setIsAddStudentsModalOpen] = useState(false);
  const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);
  const [allSystemUsers, setAllSystemUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [isAddingStudents, setIsAddingStudents] = useState(false);

  // Add Fee State
  const [isAddFeeModalOpen, setIsAddFeeModalOpen] = useState(false);
  const [feeTypes, setFeeTypes] = useState([]);
  const [newFee, setNewFee] = useState({ title: '', amount: '', feeType: '' });
  const [isAddingFee, setIsAddingFee] = useState(false);
  const [selectedUserIdForFee, setSelectedUserIdForFee] = useState(null);

  // Toggle State
  const [showAllUsers, setShowAllUsers] = useState(true);

  // Fetch all users for the modal
  const fetchAllUsers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const basePath = user.role === 'mentor' ? '/api/mentor' : '/api/admin';
      const res = await fetch(`${basePath}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setAllSystemUsers(json.filter(u => u.role === 'user')); // Only list students
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const openAddStudentsModal = () => {
    setSearchTerm('');
    setSelectedStudentIds([]);
    setIsAddStudentsModalOpen(true);
    if (allSystemUsers.length === 0) fetchAllUsers();
  };

  const handleAddStudentsSubmit = async () => {
    if (selectedStudentIds.length === 0) return;
    setIsAddingStudents(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const basePath = user.role === 'mentor' ? '/api/mentor' : '/api/admin';
      const res = await fetch(`${basePath}/users/assign-group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userIds: selectedStudentIds, groupId })
      });
      if (!res.ok) throw new Error('Failed to add students');
      
      setIsAddStudentsModalOpen(false);
      // Reload dashboard data
      window.location.reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsAddingStudents(false);
    }
  };

  const fetchFeeTypes = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const basePath = user.role === 'mentor' ? '/api/mentor' : '/api/admin';
      const res = await fetch(`${basePath}/fee-types`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setFeeTypes(json);
      }
    } catch (err) {
      console.error('Failed to fetch fee types', err);
    }
  };

  const openAddFeeModal = (userId = null) => {
    setSelectedUserIdForFee(userId);
    setNewFee({ title: '', amount: '', feeType: '' });
    setIsAddFeeModalOpen(true);
    if (feeTypes.length === 0) fetchFeeTypes();
  };

  const handleAddFeeSubmit = async (e) => {
    e.preventDefault();
    if (!newFee.title || !newFee.amount || !newFee.feeType) {
      alert("Please fill all fields");
      return;
    }
    setIsAddingFee(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const basePath = user.role === 'mentor' ? '/api/mentor' : '/api/admin';
      const endpoint = selectedUserIdForFee ? `${basePath}/fees/user` : `${basePath}/fees/group`;
      const payload = selectedUserIdForFee 
        ? { ...newFee, userId: selectedUserIdForFee, groupId } 
        : { ...newFee, groupId };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to add fee');
      }
      setIsAddFeeModalOpen(false);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsAddingFee(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const endpoint = user.role === 'mentor' 
          ? `/api/mentor/groups/${groupId}/dashboard` 
          : `/api/admin/groups/${groupId}/dashboard`;

        const res = await fetch(endpoint, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error('Failed to fetch group dashboard');
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [groupId, token]);

  if (loading) return <div className="app-container"><p style={{textAlign: 'center', marginTop: '3rem'}}>Loading...</p></div>;
  if (error) return <div className="app-container"><p style={{textAlign: 'center', color: 'red', marginTop: '3rem'}}>{error}</p></div>;
  if (!data) return null;

  const { group, allGroups, users, studentLedgers, totalAssignedValue, amountCollected, amountPending } = data;

  const subgroups = allGroups.filter(g => {
    if (!g.parentGroups) return false;
    return g?.parentGroups?.some(p => {
      const pId = (p && typeof p === 'object') ? p._id : p;
      return pId === group?._id;
    });
  });

  return (
    <div className="app-container" style={{ animation: 'slideUp 0.3s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <NeoButton variant="secondary" onClick={() => {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          navigate(user.role === 'mentor' ? '/mentor/dashboard' : '/admin/dashboard');
        }} style={{ padding: '0.6rem', borderRadius: '50%' }}>
          <ArrowLeft size={20} />
        </NeoButton>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ margin: 0, color: 'var(--primary)' }}>{group?.name || 'Unknown'} Dashboard</h1>
            <span style={{ 
              padding: '0.3rem 0.8rem', 
              borderRadius: '20px', 
              fontSize: '0.75rem', 
              fontWeight: 'bold',
              backgroundColor: group?.isGlobal ? 'var(--clay-peach-light)' : 'var(--clay-mint-light)',
              color: group?.isGlobal ? 'var(--clay-peach)' : 'var(--clay-mint)',
              border: `1px solid ${group?.isGlobal ? 'rgba(255, 180, 162, 0.5)' : 'rgba(181, 228, 140, 0.5)'}`
            }}>
              {group?.isGlobal ? 'GLOBAL GROUP' : 'LOCAL GROUP'}
            </span>
          </div>
          {group?.description && <p style={{ margin: 0, marginTop: '0.3rem', color: 'var(--text-light)' }}>{group.description}</p>}
        </div>
        <NeoButton variant="mint" onClick={() => setIsHierarchyModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Network size={18} />
          View Hierarchy
        </NeoButton>
        <NeoButton variant="primary" onClick={() => openAddFeeModal(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={18} />
          Add Fee
        </NeoButton>
        <NeoButton variant="primary" onClick={openAddStudentsModal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={18} />
          Add Students
        </NeoButton>
      </div>

      {/* --- SIMPLE DESCRIPTION FOR NEW USERS --- */}
      <div style={{
        background: 'var(--clay-base)',
        borderRadius: '15px',
        padding: '1rem 1.5rem',
        marginBottom: '2rem',
        boxShadow: 'inset 5px 5px 10px rgba(0, 0, 0, 0.05), inset -5px -5px 10px rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        borderLeft: '4px solid var(--primary)'
      }}>
        <div style={{ color: 'var(--primary)', marginTop: '0.2rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
        </div>
        <div>
          <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--text-color)', fontSize: '1rem' }}>What is this page for?</h4>
          <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: '1.4' }}>
            This page shows all details for a specific group of students. Here you can easily assign a fee to the entire group at once, add new students to the group, or view the overall payment progress for the students in this group.
          </p>
        </div>
      </div>
      {/* --------------------------------------------- */}

      <GroupStats users={users} totalAssignedValue={totalAssignedValue} amountCollected={amountCollected} amountPending={amountPending} />
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <SubgroupList subgroups={subgroups} navigate={navigate} />
        <StudentList showAllUsers={showAllUsers} setShowAllUsers={setShowAllUsers} studentLedgers={studentLedgers} users={users} openAddFeeModal={openAddFeeModal} />
      </div>
      <AddStudentModal isAddStudentsModalOpen={isAddStudentsModalOpen} setIsAddStudentsModalOpen={setIsAddStudentsModalOpen} searchTerm={searchTerm} setSearchTerm={setSearchTerm} allSystemUsers={allSystemUsers} group={group} selectedStudentIds={selectedStudentIds} setSelectedStudentIds={setSelectedStudentIds} isAddingStudents={isAddingStudents} handleAddStudentsSubmit={handleAddStudentsSubmit} />
      <AddFeeModal isAddFeeModalOpen={isAddFeeModalOpen} setIsAddFeeModalOpen={setIsAddFeeModalOpen} selectedUserIdForFee={selectedUserIdForFee} newFee={newFee} setNewFee={setNewFee} feeTypes={feeTypes} isAddingFee={isAddingFee} handleAddFeeSubmit={handleAddFeeSubmit} />
      {/* Hierarchy Modal */}
      {isHierarchyModalOpen && (
        <NeoModal 
          isOpen={isHierarchyModalOpen} 
          onClose={() => setIsHierarchyModalOpen(false)} 
          title="Group Hierarchy"
          width="75%"
          maxWidth="1200px"
          height="80vh"
        >
          <div style={{ width: '100%', overflowX: 'auto', padding: '1rem 0' }}>
            <GlowChart groups={allGroups || []} rootGroupId={group?._id} />
          </div>
        </NeoModal>
      )}
    </div>
  );
};

export default GroupDashboard;

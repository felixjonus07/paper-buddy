import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NeoCard from '../../components/UI/NeoCard';
import NeoButton from '../../components/UI/NeoButton';
import NeoModal from '../../components/UI/NeoModal';
import GlowChart from '../../components/UI/GlowChart';
import { Users, DollarSign, Activity, ArrowLeft, UserPlus } from 'lucide-react';

const GroupDashboard = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add Students State
  const [isAddStudentsModalOpen, setIsAddStudentsModalOpen] = useState(false);
  const [allSystemUsers, setAllSystemUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [isAddingStudents, setIsAddingStudents] = useState(false);

  // Fetch all users for the modal
  const fetchAllUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
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
      const res = await fetch('/api/admin/users/assign-group', {
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`/api/admin/groups/${groupId}/dashboard`, {
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

  return (
    <div className="app-container" style={{ animation: 'slideUp 0.3s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <NeoButton variant="secondary" onClick={() => navigate('/admin/dashboard')} style={{ padding: '0.6rem', borderRadius: '50%' }}>
          <ArrowLeft size={20} />
        </NeoButton>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, color: 'var(--primary)' }}>{group.name} Dashboard</h1>
          {group.description && <p style={{ margin: 0 }}>{group.description}</p>}
        </div>
        <NeoButton variant="primary" onClick={openAddStudentsModal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={18} />
          Add Students
        </NeoButton>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <NeoCard>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--clay-mint-light)', borderRadius: '15px', color: 'var(--icon-mint)' }}>
              <Users size={20} />
            </div>
            <h4 style={{ margin: 0 }}>Enrolled Students</h4>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>{users.length}</p>
        </NeoCard>
        <NeoCard>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--clay-lavender-light)', borderRadius: '15px', color: 'var(--icon-lavender)' }}>
              <Activity size={20} />
            </div>
            <h4 style={{ margin: 0 }}>Total Assigned</h4>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>${totalAssignedValue.toFixed(2)}</p>
        </NeoCard>
        <NeoCard>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--clay-mint-light)', borderRadius: '15px', color: 'var(--icon-mint)' }}>
              <DollarSign size={20} />
            </div>
            <h4 style={{ margin: 0 }}>Amount Collected</h4>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>${amountCollected.toFixed(2)}</p>
        </NeoCard>
        <NeoCard>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--clay-pink-light)', borderRadius: '15px', color: 'var(--icon-pink)' }}>
              <DollarSign size={20} />
            </div>
            <h4 style={{ margin: 0 }}>Amount Pending</h4>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>${amountPending.toFixed(2)}</p>
        </NeoCard>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Flowchart Section */}
        <NeoCard style={{ flex: '1', minWidth: '400px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Group Hierarchy</h3>
          <div style={{ width: '100%', padding: '1rem 0' }}>
            <GlowChart groups={allGroups} rootGroupId={group._id} />
          </div>
        </NeoCard>

        {/* Students List Section */}
        <NeoCard style={{ flex: '2', minWidth: '500px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Enrolled Students Ledger</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Score / Tier</th>
                  <th>Base Total Fee</th>
                  <th>Scholarship Applied</th>
                  <th>Net Payable</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {studentLedgers.map(l => (
                  <tr key={l.student._id}>
                    <td>{l.student.name} <br/><span style={{fontSize: '0.8rem', color: 'var(--text-light)'}}>{l.student.username}</span></td>
                    <td>
                      <strong>{l.student.academicScore}</strong> / 
                      <span style={{ fontSize: '0.8rem', marginLeft: '5px', padding: '0.2rem 0.5rem', borderRadius: '10px', backgroundColor: l.student.scholarship ? 'var(--clay-mint-light)' : 'var(--clay-base)' }}>
                        {l.student.scholarship ? l.student.scholarship.name : 'NONE'}
                      </span>
                    </td>
                    <td>${l.baseTotal.toFixed(2)}</td>
                    <td style={{ color: 'var(--clay-mint)' }}>${l.discountTotal.toFixed(2)}</td>
                    <td style={{ fontWeight: 'bold' }}>${l.netPayable.toFixed(2)}</td>
                    <td>
                      <span style={{ padding: '0.3rem 0.6rem', borderRadius: '10px', fontSize: '0.8rem', backgroundColor: l.status === 'PENDING' ? 'var(--clay-peach-light)' : 'var(--clay-mint-light)' }}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {studentLedgers.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>No billing records for this group.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </NeoCard>
      </div>
      
      {/* Add Students Modal */}
      {isAddStudentsModalOpen && (
        <NeoModal isOpen={isAddStudentsModalOpen} onClose={() => setIsAddStudentsModalOpen(false)} title="Add Students to Group">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p>Select students to enroll in this group. Students already in the group are hidden.</p>
            
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={{
                padding: '0.8rem',
                borderRadius: '15px',
                border: 'none',
                backgroundColor: 'var(--clay-base)',
                boxShadow: 'inset 5px 5px 10px rgba(163, 177, 198, 0.4), inset -5px -5px 10px rgba(255, 255, 255, 0.8)',
                outline: 'none',
                width: '100%'
              }}
            />
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem' }}>
              {allSystemUsers
                .filter(u => !u.groups.some(g => g._id === group._id)) // Hide users already in group
                .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.username.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(u => (
                  <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', backgroundColor: 'var(--clay-base)', borderRadius: '15px', cursor: 'pointer' }} onClick={() => {
                    setSelectedStudentIds(prev => prev.includes(u._id) ? prev.filter(id => id !== u._id) : [...prev, u._id]);
                  }}>
                    <input type="checkbox" checked={selectedStudentIds.includes(u._id)} readOnly style={{ accentColor: 'var(--primary)' }} />
                    <div>
                      <strong>{u.name}</strong> <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>({u.username})</span>
                    </div>
                  </div>
              ))}
              {allSystemUsers.length > 0 && allSystemUsers.filter(u => !u.groups.some(g => g._id === group._id)).length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>All available students are already in this group.</p>
              )}
              {isAddingStudents && <p style={{ textAlign: 'center' }}>Loading users...</p>}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <NeoButton variant="secondary" onClick={() => setIsAddStudentsModalOpen(false)} style={{ flex: 1 }}>Cancel</NeoButton>
              <NeoButton variant="primary" onClick={handleAddStudentsSubmit} disabled={selectedStudentIds.length === 0} style={{ flex: 1 }}>Add Selected ({selectedStudentIds.length})</NeoButton>
            </div>
          </div>
        </NeoModal>
      )}
    </div>
  );
};

export default GroupDashboard;

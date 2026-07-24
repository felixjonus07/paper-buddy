import React, { useState, useEffect } from 'react';
import NeoCard from '../../components/UI/NeoCard';
import NeoButton from '../../components/UI/NeoButton';
import NeoInput from '../../components/UI/NeoInput';
import NeoModal from '../../components/UI/NeoModal';
import NeoSelect from '../../components/UI/NeoSelect';
import ThemeToggle from '../../components/UI/ThemeToggle';
import GlowChart from '../../components/UI/GlowChart';
import { Users, FileText, MessageCircle, Activity, IndianRupee, LayoutDashboard, Settings, Plus, LogOut, Layers, GraduationCap, ChevronLeft, ChevronRight, CreditCard, TrendingUp, UserCog } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import DashboardOverview from '../../components/admin/DashboardOverview';
import UserManagement from '../../components/admin/UserManagement';
import GroupManagement from '../../components/admin/GroupManagement';
import FeeManagement from '../../components/admin/FeeManagement';
import FeeRequests from '../../components/admin/FeeRequests';
import FeeTypesManagement from '../../components/admin/FeeTypesManagement';
import ScholarshipsManagement from '../../components/admin/ScholarshipsManagement';
import ReportsManagement from '../../components/admin/ReportsManagement';
import { useAlert } from '../../context/AlertContext';
import PaymentSettings from '../../components/admin/PaymentSettings';
import CashierManagement from '../../components/admin/CashierManagement';
import FinanceManagement from '../../components/admin/FinanceManagement';

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const setActiveTab = (tab) => setSearchParams({ tab }, { replace: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isReadOnly = user?.role === 'superadmin';
  const navigate = useNavigate();
  const { collegeId } = useParams();

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Students', icon: Users },
    { id: 'groups', label: 'Groups', icon: Layers },
    { id: 'finance', label: 'Finance', icon: IndianRupee },
    { id: 'fees', label: 'Fees Mgmt', icon: FileText },
  ];

  const managementNavItems = [
    { id: 'fee_types', label: 'Fee Types', icon: Settings },
    { id: 'fee_requests', label: 'Fee Requests', icon: Activity },
    { id: 'scholarships', label: 'Scholarships', icon: GraduationCap },
    { id: 'cashiers', label: 'Cashiers', icon: UserCog },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
    { id: 'payment_settings', label: 'Gateway Settings', icon: CreditCard }
  ];

  // Global Data State
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [fees, setFees] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [feeRequests, setFeeRequests] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState('CENTRALIZED');
  const [monthlyPayments, setMonthlyPayments] = useState([]);
  const { showAlert, showConfirm } = useAlert();

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
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCommonPassword, setUploadCommonPassword] = useState('');
  const [uploadGroupId, setUploadGroupId] = useState('');
  const [bulkMethod, setBulkMethod] = useState('upload'); // 'upload' or 'pattern'

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
      if (collegeId) {
        headers['x-college-id'] = collegeId;
      }

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

      const paymentRes = await fetch('/api/admin/college/payment-settings', { headers });
      if (paymentRes.ok) {
        const paymentData = await paymentRes.json();
        setPaymentStatus(paymentData.paymentType);
      }

      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();
      const monthlyRes = await fetch(`/api/admin/reports/payments?startDate=${firstDay}&endDate=${lastDay}`, { headers });
      if (monthlyRes.ok) {
        const monthlyData = await monthlyRes.json();
        setMonthlyPayments(monthlyData.payments || []);
      }
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

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...bulkData, groupId: uploadGroupId };
      const res = await fetch('/api/admin/bulk-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setBulkMessage(data.message || (res.ok ? 'Success' : 'Failed'));
      if (res.ok) {
        fetchData();

        if (data.users && data.users.length > 0) {
          const headers = ['Name', 'Username', 'Password', 'Role'];
          const rows = data.users.map(u => [u.name, u.username, bulkData.initialPassword, u.role]);
          const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement("a");
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", `Generated_Users_${new Date().getTime()}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        setTimeout(() => setUserModalOpen(false), 1500);
      }
    } catch (err) { setBulkMessage('Server error'); }
  };

  const handleDownloadSampleCSV = () => {
    const headers = ['Name', 'Regno(Username)', 'Password', 'Phone Number', 'Class', 'Section', 'Year', 'Personal Email', 'Academic Score'];
    const sampleData = ['John Doe', '2023CS01', '', '9876543210', 'B.Tech', 'A', '1st Year', 'john@example.com', '85'];

    const csvContent = [headers.join(','), sampleData.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_bulk_upload_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setBulkMessage('Please select a file first.');
      return;
    }

    setBulkMessage('Uploading...');
    const formData = new FormData();
    formData.append('file', uploadFile);
    if (uploadCommonPassword) formData.append('commonPassword', uploadCommonPassword);
    if (uploadGroupId) formData.append('groupId', uploadGroupId);

    try {
      const res = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      setBulkMessage(data.message || (res.ok ? 'Success' : 'Failed'));
      if (res.ok) {
        fetchData();
        setUploadFile(null);
        setTimeout(() => setUserModalOpen(false), 2000);
      }
    } catch (err) {
      setBulkMessage('Server error during upload');
    }
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
        showAlert('Fee assigned to student successfully!');
      } else {
        showAlert('Failed to assign fee');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error assigning fee');
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
    const confirmed = await showConfirm('Are you sure you want to delete this fee category?');
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/fee-types/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) fetchData();
    } catch (err) { }
  };

  const handleDeleteScholarship = async (id) => {
    const confirmed = await showConfirm('Are you sure you want to delete this scholarship?');
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/scholarships/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) fetchData();
    } catch (err) { }
  };
  const handleDeleteFee = async (id) => {
    const confirmed = await showConfirm('Are you sure you want to delete this fee? This will safely remove it for all students who have not paid it yet.');
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/fees/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        fetchData();
        showAlert('Fee deleted successfully!');
      } else {
        const data = await res.json();
        showAlert(`Cannot delete fee: ${data.message}`);
      }
    } catch (err) {
      showAlert('Error deleting fee');
    }
  };

  return (
    <div className="app-container dashboard-layout">

      {/* Fluffy Sidebar Navigation */}
      <div className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--text-light)', position: 'relative', minHeight: '60px' }}>
          <div className="header-text">
            <h3 style={{ margin: 0, color: 'var(--text-color)' }}>{isReadOnly ? 'Super Admin' : 'Admin'}</h3>
          </div>
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            style={{
              position: 'absolute', right: isSidebarOpen ? '2px' : '20px', top: isSidebarOpen ? '18px' : '10px',
              width: '24px', height: '24px', borderRadius: '50%',
              background: 'rgba(248,116,16,0.15)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(248,116,16,0.35)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 10, boxShadow: '0 4px 12px rgba(248,116,16,0.15), inset 0 1px 0 rgba(255,255,255,0.4)',
              transition: 'right 0.3s ease',
              transform: 'none'
            }}
          >
            {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        <div className="sidebar-menu" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {mainNavItems.map(item => (
            <div key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
              <item.icon size={20} /> <span className="nav-text">{item.label}</span>
            </div>
          ))}

          {managementNavItems.map(item => (
            <div key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
              <item.icon size={20} /> <span className="nav-text">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
          <NeoButton variant="secondary" onClick={handleLogout} style={{ width: '100%', padding: '0.8rem', display: 'flex', justifyContent: 'center' }}>
            <LogOut size={18} /> {isSidebarOpen && 'Logout'}
          </NeoButton>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-content">
        <div style={{ flexShrink: 0, padding: '0.5rem' }}>
          <div className="dashboard-header" style={{
            backgroundColor: 'var(--clay-base)',
            padding: '1rem 2rem',
            borderRadius: '50px',
            boxShadow: 'var(--clay-outer)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, color: 'var(--text-color)' }}>
                {[...mainNavItems, ...managementNavItems].find(n => n.id === activeTab)?.label || 'Dashboard'}
              </h2>
            </div>
            <div className="header-actions">
              {isReadOnly && (
                <NeoButton variant="secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => navigate('/')}>
                  Back to Home
                </NeoButton>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-scroll-area">


          {/* --- SIMPLE TAB DESCRIPTION FOR NEW ADMINS --- */}
          <div style={{
            background: 'var(--clay-base)',
            borderRadius: '15px',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            boxShadow: 'inset 5px 5px 10px rgba(0, 0, 0, 0.05), inset -5px -5px 10px rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            borderLeft: '4px solid var(--primary)'
          }}>
            <div style={{ color: 'var(--primary)', marginTop: '0.2rem' }}>
              <MessageCircle size={20} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--text-color)', fontSize: '1rem' }}>What is this page for?</h4>
              <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                {activeTab === 'dashboard' && 'This is your main dashboard. It gives you a quick overview of total fees collected, pending amounts, and basic stats about your college.'}
                {activeTab === 'users' && 'This page is for managing students. You can add new students, edit their details, or give them a scholarship.'}
                {activeTab === 'groups' && 'This page is for grouping students (like classes or batches). Grouping students makes it very easy to assign the same fee to many students at once.'}
                {activeTab === 'finance' && 'This page provides a financial overview. You can see total collected payments, view settlement history, and export ledgers.'}
                {activeTab === 'fees' && 'This page is for managing all the actual fees assigned to students or groups. You can see who was assigned what fee and if they paid it.'}
                {activeTab === 'fee_requests' && 'Here you can view and approve or reject special requests from students (like asking for a fee concession or extra time to pay).'}
                {activeTab === 'payment_settings' && 'Here you can set up how your college collects money. You can use Centralized (company bank) or Decentralized (your own bank account) payments.'}
                {activeTab === 'fee_types' && 'This page is for creating standard "Fee Types" (like Tuition Fee, Exam Fee). You must create a Fee Type here before you can assign a fee.'}
                {activeTab === 'scholarships' && 'This page is for creating standard "Scholarships". You can define rules like "50% off if the student has a high academic score".'}
                {activeTab === 'cashiers' && 'This page helps you track your Cashiers. You can see who is assigned, view their daily collected cash logs, and download reports.'}
                {activeTab === 'reports' && 'This page helps you generate detailed financial reports. You can select dates and see all successful payments made by students.'}
              </p>
            </div>
          </div>
          {/* --------------------------------------------- */}

          {activeTab === 'dashboard' && <DashboardOverview users={users} groups={groups} fees={fees} feeRequests={feeRequests} paymentStatus={paymentStatus} monthlyPayments={monthlyPayments} />}
          {activeTab === 'users' && (
            (users.filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.username?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && searchQuery) ?
              <p style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '2rem' }}>No results found</p> :
              <UserManagement users={users.filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.username?.toLowerCase().includes(searchQuery.toLowerCase()))} expandedUser={expandedUser} setExpandedUser={setExpandedUser} setUserModalOpen={setUserModalOpen} setEditUserData={setEditUserData} setEditUserModalOpen={setEditUserModalOpen} setSelectedUserForGroup={setSelectedUserForGroup} setAssignStudentModalOpen={setAssignStudentModalOpen} setAssignUserFeeModalOpen={setAssignUserFeeModalOpen} setUserFeeData={setUserFeeData} isReadOnly={isReadOnly} />
          )}
          {activeTab === 'groups' && (
            (groups.filter(g => g.name?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && searchQuery) ?
              <p style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '2rem' }}>No results found</p> :
              <GroupManagement groups={groups.filter(g => g.name?.toLowerCase().includes(searchQuery.toLowerCase()))} navigate={navigate} setGroupModalOpen={setGroupModalOpen} setEditGroupData={setEditGroupData} setEditGroupModalOpen={setEditGroupModalOpen} setSelectedGroupForSub={setSelectedGroupForSub} setAssignSubgroupModalOpen={setAssignSubgroupModalOpen} mentorData={mentorData} setMentorData={setMentorData} setCreateMentorModalOpen={setCreateMentorModalOpen} isReadOnly={isReadOnly} />
          )}
          {activeTab === 'finance' && <FinanceManagement />}
          {activeTab === 'fees' && (
            (fees.filter(f => f.title?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && searchQuery) ?
              <p style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '2rem' }}>No results found</p> :
              <FeeManagement fees={fees.filter(f => f.title?.toLowerCase().includes(searchQuery.toLowerCase()))} setFeeModalOpen={setFeeModalOpen} handleDeleteFee={handleDeleteFee} isReadOnly={isReadOnly} />
          )}
          {activeTab === 'fee_requests' && (
            (feeRequests.filter(r => r.requestedFeeTitle?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && searchQuery) ?
              <p style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '2rem' }}>No results found</p> :
              <FeeRequests feeRequests={feeRequests.filter(r => r.requestedFeeTitle?.toLowerCase().includes(searchQuery.toLowerCase()))} handleUpdateFeeRequestStatus={handleUpdateFeeRequestStatus} isReadOnly={isReadOnly} />
          )}
          {activeTab === 'payment_settings' && <PaymentSettings isReadOnly={isReadOnly} />}
          {activeTab === 'fee_types' && (
            (feeTypes.filter(f => f.name?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && searchQuery) ?
              <p style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '2rem' }}>No results found</p> :
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}><FeeTypesManagement masterMessage={masterMessage} handleCreateFeeType={handleCreateFeeType} newFeeType={newFeeType} setNewFeeType={setNewFeeType} feeTypes={feeTypes.filter(f => f.name?.toLowerCase().includes(searchQuery.toLowerCase()))} handleDeleteFeeType={handleDeleteFeeType} isReadOnly={isReadOnly} /></div>
          )}
          {activeTab === 'scholarships' && (
            (scholarships.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && searchQuery) ?
              <p style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '2rem' }}>No results found</p> :
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}><ScholarshipsManagement masterMessage={masterMessage} handleCreateScholarship={handleCreateScholarship} newScholarship={newScholarship} setNewScholarship={setNewScholarship} feeTypes={feeTypes} scholarships={scholarships.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()))} handleDeleteScholarship={handleDeleteScholarship} isReadOnly={isReadOnly} /></div>
          )}
          {activeTab === 'cashiers' && <CashierManagement isReadOnly={isReadOnly} collegeId={collegeId} />}
          {activeTab === 'reports' && <ReportsManagement />}
        </div>
      </div>

      {/* Modals */}
      <NeoModal isOpen={isUserModalOpen} onClose={() => { setUserModalOpen(false); setBulkMessage(''); }} title="Bulk Create Users">
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center', lineHeight: '1.4' }}>
          Create multiple student accounts at once either by uploading an Excel/CSV file or by generating a pattern.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <NeoButton
            variant={bulkMethod === 'upload' ? 'primary' : 'secondary'}
            onClick={() => setBulkMethod('upload')}
            style={{ flex: 1 }}
          >
            Upload Excel/CSV
          </NeoButton>
          <NeoButton
            variant={bulkMethod === 'pattern' ? 'primary' : 'secondary'}
            onClick={() => setBulkMethod('pattern')}
            style={{ flex: 1 }}
          >
            Generate Pattern
          </NeoButton>
        </div>

        {bulkMethod === 'upload' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <NeoButton variant="secondary" onClick={handleDownloadSampleCSV} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                Download Template
              </NeoButton>
            </div>
            <form onSubmit={handleFileUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>
                Your file must contain a column named <strong>Username</strong>. Optionally include: <strong>Name, Password, Phone Number, Class, Section, Year, Personal Email, Academic Score</strong>.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={e => setUploadFile(e.target.files[0])}
                  style={{ padding: '0.8rem', backgroundColor: 'var(--clay-base)', borderRadius: '15px' }}
                  required
                />
              </div>

              <NeoInput
                type="text"
                placeholder="Common Password (Optional)"
                value={uploadCommonPassword}
                onChange={e => setUploadCommonPassword(e.target.value)}
              />
              <p style={{ margin: '-0.5rem 0 0 0.5rem', fontSize: '0.8rem', color: 'var(--text-light)' }}>
                Applied to all users in the file if they don't have a password specified.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <NeoSelect
                    value={uploadGroupId}
                    onChange={val => setUploadGroupId(val)}
                    placeholder="Assign to Group (Optional)"
                    options={groups.map(g => ({ value: g._id, label: g.name }))}
                  />
                </div>
                <NeoButton variant="secondary" type="button" onClick={() => setGroupModalOpen(true)}>
                  + Create Group
                </NeoButton>
              </div>
              <NeoButton variant="primary" type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>Upload & Create</NeoButton>
              {bulkMessage && <p style={{ marginTop: '1rem', color: 'var(--clay-mint)', textAlign: 'center' }}>{bulkMessage}</p>}
            </form>
          </div>
        ) : (
          <form onSubmit={handleBulkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <NeoInput type="text" placeholder="Prefix (e.g. 711524BAD)" value={bulkData.prefix} onChange={e => setBulkData({ ...bulkData, prefix: e.target.value })} required />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <NeoInput type="number" placeholder="Start (e.g. 1)" value={bulkData.startRange} onChange={e => setBulkData({ ...bulkData, startRange: e.target.value })} required />
              <NeoInput type="number" placeholder="End (e.g. 175)" value={bulkData.endRange} onChange={e => setBulkData({ ...bulkData, endRange: e.target.value })} required />
            </div>
            <NeoInput type="text" placeholder="Suffix (e.g. A) - Optional" value={bulkData.suffix} onChange={e => setBulkData({ ...bulkData, suffix: e.target.value })} />
            <NeoInput type="text" placeholder="Initial Password" value={bulkData.initialPassword} onChange={e => setBulkData({ ...bulkData, initialPassword: e.target.value })} required />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <NeoSelect
                  value={uploadGroupId}
                  onChange={val => setUploadGroupId(val)}
                  placeholder="Assign to Group (Optional)"
                  options={groups.map(g => ({ value: g._id, label: g.name }))}
                />
              </div>
              <NeoButton variant="secondary" type="button" onClick={() => setGroupModalOpen(true)}>
                + Create Group
              </NeoButton>
            </div>

            <NeoButton variant="mint" type="submit" style={{ width: '100%', marginTop: '1rem' }}>Generate Pattern</NeoButton>
            {bulkMessage && <p style={{ marginTop: '1rem', color: 'var(--clay-mint)', textAlign: 'center' }}>{bulkMessage}</p>}
          </form>
        )}
      </NeoModal>

      <NeoModal isOpen={isGroupModalOpen} onClose={() => { setGroupModalOpen(false); setGroupMessage(''); }} title="Create Group">
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center', lineHeight: '1.4' }}>
          Create a new group (like a class or a batch). You can also assign students to it immediately. This makes it easy to assign fees to everyone in this group later.
        </p>
        <form onSubmit={handleGroupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <NeoInput type="text" placeholder="Group Name (e.g. Batch A)" value={groupData.name} onChange={e => setGroupData({ ...groupData, name: e.target.value })} required />
          <NeoInput type="text" placeholder="Description" value={groupData.description} onChange={e => setGroupData({ ...groupData, description: e.target.value })} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem 0' }}>
            <input
              type="checkbox"
              id="isGlobalToggle"
              checked={groupData.isGlobal || false}
              onChange={e => setGroupData({ ...groupData, isGlobal: e.target.checked })}
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
                  setGroupData({ ...groupData, studentIds: next });
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
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center', lineHeight: '1.4' }}>
          Change the name or description of this group.
        </p>
        <form onSubmit={handleEditGroupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <NeoInput type="text" placeholder="Group Name" value={editGroupData.name} onChange={e => setEditGroupData({ ...editGroupData, name: e.target.value })} required />
          <NeoInput type="text" placeholder="Description" value={editGroupData.description} onChange={e => setEditGroupData({ ...editGroupData, description: e.target.value })} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem 0' }}>
            <input
              type="checkbox"
              id="editIsGlobalToggle"
              checked={editGroupData.isGlobal || false}
              onChange={e => setEditGroupData({ ...editGroupData, isGlobal: e.target.checked })}
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
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center', lineHeight: '1.4' }}>
          Mentors (like class teachers) can manage their specific group and view reports for their students.
        </p>
        <form onSubmit={handleCreateMentorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <NeoInput type="text" placeholder="Mentor Name (e.g. John Doe)" value={mentorData.name} onChange={e => setMentorData({ ...mentorData, name: e.target.value })} required />
          <NeoInput type="text" placeholder="Username" value={mentorData.username} onChange={e => setMentorData({ ...mentorData, username: e.target.value })} required />
          <NeoInput type="password" placeholder="Password" value={mentorData.password} onChange={e => setMentorData({ ...mentorData, password: e.target.value })} required />

          <NeoButton variant="mint" type="submit" style={{ width: '100%', marginTop: '1rem' }}>Create Mentor</NeoButton>
          {mentorMessage && <p style={{ marginTop: '1rem', color: 'var(--clay-mint)', textAlign: 'center' }}>{mentorMessage}</p>}
        </form>
      </NeoModal>

      <NeoModal isOpen={isFeeModalOpen} onClose={() => { setFeeModalOpen(false); setFeeMessage(''); }} title="Assign Fee">
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center', lineHeight: '1.4' }}>
          Assign a specific fee to an entire group. You must select the Fee Type (like Tuition) and the target Group.
        </p>
        <form onSubmit={handleFeeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <NeoInput type="text" placeholder="Fee Title (e.g. Fall Tuition)" value={feeData.title} onChange={e => setFeeData({ ...feeData, title: e.target.value })} required />
          <NeoInput type="number" placeholder="Amount (₹)" value={feeData.amount} onChange={e => setFeeData({ ...feeData, amount: e.target.value })} required />

          <div style={{ position: 'relative' }}>
            <NeoSelect
              value={feeData.feeType}
              onChange={val => setFeeData({ ...feeData, feeType: val })}
              required={true}
              placeholder="Select Fee Type..."
              options={feeTypes.map(c => ({ value: c._id, label: c.name }))}
              style={{ marginBottom: '1rem' }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <NeoSelect
              value={feeData.groupId}
              onChange={val => setFeeData({ ...feeData, groupId: val })}
              required={true}
              placeholder="Select Group..."
              options={groups.map(g => ({ value: g._id, label: g.name }))}
            />
          </div>

          <NeoButton variant="peach" type="submit" style={{ width: '100%', marginTop: '1rem' }}>Assign Fee</NeoButton>
          {feeMessage && <p style={{ marginTop: '1rem', color: 'var(--clay-peach)', textAlign: 'center' }}>{feeMessage}</p>}
        </form>
      </NeoModal>

      {/* Assign User Fee Modal */}
      <NeoModal isOpen={isAssignUserFeeModalOpen} onClose={() => setAssignUserFeeModalOpen(false)} title="Assign Fee to Student">
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center', lineHeight: '1.4' }}>
          Assign a specific fee to this student directly.
        </p>
        <form onSubmit={handleAssignUserFeeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <NeoInput type="text" placeholder="Fee Title (e.g. Lab Fine)" value={userFeeData.title} onChange={e => setUserFeeData({ ...userFeeData, title: e.target.value })} required />
          <NeoInput type="number" placeholder="Amount" value={userFeeData.amount} onChange={e => setUserFeeData({ ...userFeeData, amount: e.target.value })} required />

          <div style={{ position: 'relative' }}>
            <NeoSelect
              value={userFeeData.feeType}
              onChange={val => setUserFeeData({ ...userFeeData, feeType: val })}
              required={true}
              placeholder="Select Fee Type..."
              options={feeTypes.map(c => ({ value: c._id, label: c.name }))}
            />
          </div>

          <NeoButton variant="mint" type="submit" style={{ width: '100%', marginTop: '1rem' }}>Assign Fee</NeoButton>
          {feeMessage && <p style={{ marginTop: '1rem', color: 'var(--clay-peach)', textAlign: 'center' }}>{feeMessage}</p>}
        </form>
      </NeoModal>

      {/* Assign Student Modal */}
      <NeoModal isOpen={isAssignStudentModalOpen} onClose={() => setAssignStudentModalOpen(false)} title={`Assign ${selectedUserForGroup?.name} to Group`}>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center', lineHeight: '1.4' }}>
          Select the group (like a class or batch) you want this student to be a part of.
        </p>
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
      {/* Assign Subgroup Modal */}
      <NeoModal isOpen={isAssignSubgroupModalOpen} onClose={() => setAssignSubgroupModalOpen(false)} title={`Set Parent for ${selectedGroupForSub?.name}`}>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center', lineHeight: '1.4' }}>
          Make this group a "child" of another group. For example, "Section A" can be a child of "Computer Science Department".
        </p>
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
      {/* Edit User Modal */}
      <NeoModal isOpen={isEditUserModalOpen} onClose={() => setEditUserModalOpen(false)} title="Edit Student Profile">
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center', lineHeight: '1.4' }}>
          Update the student's academic score and assign them a scholarship. If they meet the scholarship's score requirement, they get a discount on their fees!
        </p>
        <form onSubmit={handleEditUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <NeoInput type="number" placeholder="Academic Score (0-100)" value={editUserData.academicScore} onChange={e => setEditUserData({ ...editUserData, academicScore: e.target.value })} required />
          <NeoSelect
            value={editUserData.scholarship}
            onChange={val => setEditUserData({ ...editUserData, scholarship: val })}
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

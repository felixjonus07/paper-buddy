import React, { useState, useEffect } from 'react';
import NeoCard from '../../components/UI/NeoCard';
import NeoButton from '../../components/UI/NeoButton';
import NeoInput from '../../components/UI/NeoInput';
import NeoModal from '../../components/UI/NeoModal';
import NeoSelect from '../../components/UI/NeoSelect';
import ThemeToggle from '../../components/UI/ThemeToggle';
import { IndianRupee, FileText, User, Settings, LayoutDashboard, LogOut, Download, Edit, PlusCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import UserOverview from '../../components/user/UserOverview';
import UserProfile from '../../components/user/UserProfile';
import UserPayFees from '../../components/user/UserPayFees';
import UserFeeRequests from '../../components/user/UserFeeRequests';
import UserApplyLoan from '../../components/user/UserApplyLoan';
import UserPaidFees from '../../components/user/UserPaidFees';
import UserSettings from '../../components/user/UserSettings';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// PhonePe uses redirect-based checkout — no SDK script loading needed

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [fees, setFees] = useState([]);
  const [loans, setLoans] = useState([]);
  const [profile, setProfile] = useState(null);
  const [studentFees, setStudentFees] = useState([]);
  
  const [loanData, setLoanData] = useState({ amount: '', purpose: '' });
  const [loanMessage, setLoanMessage] = useState('');
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState({});
  
  const [feeRequests, setFeeRequests] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [requestFeeModalOpen, setRequestFeeModalOpen] = useState(false);
  const [feeRequestData, setFeeRequestData] = useState({ requestedFeeTitle: '', amount: '', feeType: '', reason: '' });

  const [paymentVerifying, setPaymentVerifying] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null); // null | 'success' | 'failed' | 'pending'

  const location = useLocation();

  // Handle PhonePe redirect return — runs on mount only
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const merchantTransactionId = params.get('merchantOrderId') || params.get('merchantTransactionId');
    const feeId = params.get('feeId');
    const isMissing = params.get('isMissing');

    if (!merchantTransactionId || !feeId) return;

    // Clear URL params immediately so refresh doesn't re-trigger
    navigate('/user/dashboard', { replace: true });

    const verifyPhonePePayment = async () => {
      setPaymentVerifying(true);
      setPaymentResult(null);
      try {
        const verifyRes = await fetch('/api/user/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ merchantTransactionId, feeId, isMissing })
        });
        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          setPaymentResult('success');
        } else if (verifyData.status === 'PENDING') {
          setPaymentResult('pending');
        } else {
          setPaymentResult('failed');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setPaymentResult('failed');
      } finally {
        setPaymentVerifying(false);
      }
    };

    verifyPhonePePayment();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh data whenever payment result changes to success
  useEffect(() => {
    if (paymentResult === 'success') {
      // fetchData will be defined by this point
      setTimeout(() => {
        const headers = { 'Authorization': `Bearer ${token}` };
        Promise.all([
          fetch('/api/user/fees', { headers }).then(r => r.ok ? r.json() : null),
          fetch('/api/user/student-fees', { headers }).then(r => r.ok ? r.json() : null),
        ]).then(([fees, studentFees]) => {
          if (fees) setFees(fees);
          if (studentFees) setStudentFees(studentFees);
        });
      }, 500);
    }
  }, [paymentResult]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [feesRes, loansRes, profileRes, studentFeesRes, requestsRes, feeTypesRes] = await Promise.all([
        fetch('/api/user/fees', { headers }),
        fetch('/api/user/loans', { headers }),
        fetch('/api/user/profile', { headers }),
        fetch('/api/user/student-fees', { headers }),
        fetch('/api/user/fee-requests', { headers }),
        fetch('/api/user/fee-types', { headers })
      ]);

      if (feesRes.ok) setFees(await feesRes.json());
      if (loansRes.ok) setLoans(await loansRes.json());
      if (profileRes.ok) setProfile(await profileRes.json());
      if (studentFeesRes.ok) setStudentFees(await studentFeesRes.json());
      if (requestsRes.ok) setFeeRequests(await requestsRes.json());
      if (feeTypesRes.ok) setFeeTypes(await feeTypesRes.json());
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
      const res = await fetch('/api/user/loans', {
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
      const res = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(passwordData)
      });
      const data = await res.json();
      setPasswordMessage(res.ok ? 'Password updated successfully!' : (data.message || 'Failed to update'));
      if (res.ok) setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) { setPasswordMessage('Server error'); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(profileFormData)
      });
      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
        setEditProfileModalOpen(false);
      } else {
        alert('Failed to update profile');
      }
    } catch (err) {
      alert('Error updating profile');
    }
  };

  const openProfileEdit = () => {
    setProfileFormData({
      phoneNumber: profile.phoneNumber || '',
      studentClass: profile.studentClass || '',
      section: profile.section || '',
      year: profile.year || '',
      personalEmail: profile.personalEmail || '',
      collegeEmail: profile.collegeEmail || '',
      registerNumber: profile.registerNumber || ''
    });
    setEditProfileModalOpen(true);
  };

  const handleRequestFeeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/fee-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(feeRequestData)
      });
      if (res.ok) {
        setFeeRequestData({ requestedFeeTitle: '', amount: '', feeType: '', reason: '' });
        setRequestFeeModalOpen(false);
        fetchData();
        alert('Fee request submitted successfully!');
      } else {
        alert('Failed to submit request');
      }
    } catch (err) {
      alert('Error submitting request');
    }
  };

  // Render Helpers
  const handlePayFee = async (id, isMissing) => {
    try {
      const res = await fetch(`/api/user/create-payment-order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ id, isMissing })
      });
      
      const orderData = await res.json();
      
      if(!res.ok){
        alert(`Failed to initiate payment: ${orderData.message || 'Unknown error'}`);
        return;
      }

      if (orderData.redirectUrl) {
        // Redirect user to PhonePe payment page
        window.location.href = orderData.redirectUrl;
      } else {
        alert('Failed to get payment redirect URL. Please try again.');
      }

    } catch (err) {
      console.error(err);
      alert(`Error occurred while processing payment: ${err.message}`);
    }
  };

  const handleDownloadReceipt = (f) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(20, 184, 166); // Mint color
    doc.text("Paper Buddy", 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text("Official Fee Receipt", 14, 30);
    
    // User Details
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Student Name: ${user.name}`, 14, 42);
    doc.text(`Username: @${user.username}`, 14, 48);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 14, 54);
    
    // Receipt Details
    const tableColumn = ["Description", "Details"];
    const tableRows = [
      ["Fee Title", f.feeId?.title || 'Unknown Fee'],
      ["Base Amount", `Rs ${f.baseAmount.toFixed(2)}`],
      ["Discount Applied", `Rs ${f.discountAmount.toFixed(2)}`],
      ["Amount Paid", `Rs ${f.finalAmount.toFixed(2)}`],
      ["Date of Payment", new Date(f.updatedAt).toLocaleDateString()]
    ];
    
    autoTable(doc, {
      startY: 65,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [20, 184, 166] },
      styles: { fontSize: 11, cellPadding: 6 },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [80, 80, 80], cellWidth: 80 },
        1: { textColor: [0, 0, 0] }
      },
      didParseCell: function (data) {
        if (data.row.index === 3 && data.column.index === 1) { // Amount Paid value
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [20, 184, 166];
        }
      }
    });

    // Footer
    const finalY = doc.lastAutoTable?.finalY || 130;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for your payment. This is a computer-generated receipt.", 14, finalY + 15);

    doc.save(`Receipt_${(f.feeId?.title || 'Fee').replace(/\s+/g, '_')}_${user.name.replace(/\s+/g, '_')}.pdf`);
  };
  return (
    <div className="app-container dashboard-layout">
      {/* PhonePe Payment Verifying Overlay */}
      {paymentVerifying && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem'
        }}>
          <div style={{
            width: 64, height: 64, border: '4px solid rgba(255,255,255,0.2)',
            borderTop: '4px solid #5f43e9', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#fff', margin: 0, fontSize: '1.4rem' }}>Verifying Payment...</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0.5rem 0 0' }}>Please wait, do not close this tab</p>
          </div>
        </div>
      )}

      {/* PhonePe Payment Result Banner */}
      {paymentResult && (
        <div style={{
          position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 9998, minWidth: 340, maxWidth: 480,
          background: paymentResult === 'success' ? 'linear-gradient(135deg, #1a8a4a, #22c55e)' :
                       paymentResult === 'pending'  ? 'linear-gradient(135deg, #b45309, #f59e0b)' :
                                                      'linear-gradient(135deg, #991b1b, #ef4444)',
          borderRadius: '16px', padding: '1.2rem 1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: '1rem',
          animation: 'slideDown 0.4s ease-out'
        }}>
          <span style={{ fontSize: '2rem' }}>
            {paymentResult === 'success' ? '✅' : paymentResult === 'pending' ? '⏳' : '❌'}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
              {paymentResult === 'success' ? 'Payment Successful!' :
               paymentResult === 'pending'  ? 'Payment Pending' :
                                              'Payment Failed'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              {paymentResult === 'success' ? 'Your fee has been marked as paid.' :
               paymentResult === 'pending'  ? 'Your payment is being processed. Please check back shortly.' :
                                              'Your payment could not be completed. Please try again.'}
            </div>
          </div>
          <button onClick={() => setPaymentResult(null)} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
            borderRadius: '50%', width: 28, height: 28, cursor: 'pointer',
            fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>×</button>
        </div>
      )}

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
        <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <User size={20} /> <span className="nav-text">My Profile</span>
        </div>
        <div className={`nav-item ${activeTab === 'pay-fees' ? 'active' : ''}`} onClick={() => setActiveTab('pay-fees')}>
          <IndianRupee size={20} /> <span className="nav-text">Pay Fees</span>
        </div>
        <div className={`nav-item ${activeTab === 'fee-requests' ? 'active' : ''}`} onClick={() => setActiveTab('fee-requests')}>
          <PlusCircle size={20} /> <span className="nav-text">Fee Requests</span>
        </div>
        <div className={`nav-item ${activeTab === 'loan' ? 'active' : ''}`} onClick={() => setActiveTab('loan')}>
          <FileText size={20} /> <span className="nav-text">Financial Aid</span>
        </div>
        <div className={`nav-item ${activeTab === 'paid-fees' ? 'active' : ''}`} onClick={() => setActiveTab('paid-fees')}>
          <FileText size={20} /> <span className="nav-text">Payment History</span>
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
            {activeTab === 'profile' && 'My Profile'}
            {activeTab === 'pay-fees' && 'Pay Fees'}
            {activeTab === 'fee-requests' && 'Fee Requests'}
            {activeTab === 'loan' && 'Financial Aid'}
            {activeTab === 'paid-fees' && 'Payment History'}
            {activeTab === 'settings' && 'Account Settings'}
          </h2>
          <div className="header-actions">
            <div className="search-box">
              <NeoInput type="text" placeholder="Search activities..." />
            </div>
            <ThemeToggle />
          </div>
        </div>

        {activeTab === 'dashboard' && <UserOverview user={user} studentFees={studentFees} loans={loans} profile={profile} />}
        {activeTab === 'profile' && <UserProfile profile={profile} openProfileEdit={openProfileEdit} />}
        {activeTab === 'pay-fees' && <UserPayFees studentFees={studentFees} fees={fees} handlePayFee={handlePayFee} />}
        {activeTab === 'fee-requests' && <UserFeeRequests feeRequests={feeRequests} feeTypes={feeTypes} setRequestFeeModalOpen={setRequestFeeModalOpen} />}
        {activeTab === 'loan' && <UserApplyLoan handleApplyLoan={handleApplyLoan} loanData={loanData} setLoanData={setLoanData} loanMessage={loanMessage} />}
        {activeTab === 'paid-fees' && <UserPaidFees studentFees={studentFees} handleDownloadReceipt={handleDownloadReceipt} />}
        {activeTab === 'settings' && <UserSettings handleChangePassword={handleChangePassword} passwordData={passwordData} setPasswordData={setPasswordData} passwordMessage={passwordMessage} />}
      </div>

      <NeoModal isOpen={editProfileModalOpen} onClose={() => setEditProfileModalOpen(false)} title="Edit Profile Details">
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <NeoInput type="text" placeholder="Register Number" value={profileFormData.registerNumber || ''} onChange={e => setProfileFormData({...profileFormData, registerNumber: e.target.value})} />
            <NeoInput type="text" placeholder="Phone Number" value={profileFormData.phoneNumber || ''} onChange={e => setProfileFormData({...profileFormData, phoneNumber: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <NeoInput type="text" placeholder="Personal Email" value={profileFormData.personalEmail || ''} onChange={e => setProfileFormData({...profileFormData, personalEmail: e.target.value})} />
            <NeoInput type="text" placeholder="College Email" value={profileFormData.collegeEmail || ''} onChange={e => setProfileFormData({...profileFormData, collegeEmail: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <NeoInput type="text" placeholder="Class" value={profileFormData.studentClass || ''} onChange={e => setProfileFormData({...profileFormData, studentClass: e.target.value})} />
            <NeoInput type="text" placeholder="Section" value={profileFormData.section || ''} onChange={e => setProfileFormData({...profileFormData, section: e.target.value})} />
            <NeoInput type="text" placeholder="Year" value={profileFormData.year || ''} onChange={e => setProfileFormData({...profileFormData, year: e.target.value})} />
          </div>

          <NeoButton variant="mint" type="submit">Save Details</NeoButton>
        </form>
      </NeoModal>

      <NeoModal isOpen={requestFeeModalOpen} onClose={() => setRequestFeeModalOpen(false)} title="Request Fee Add-on">
        <form onSubmit={handleRequestFeeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          <NeoInput 
            type="text" 
            placeholder="What fee are you missing? (e.g., Library Fine, Transport Fee)" 
            value={feeRequestData.requestedFeeTitle} 
            onChange={e => setFeeRequestData({...feeRequestData, requestedFeeTitle: e.target.value})} 
            required 
          />
          <NeoInput 
            type="number" 
            placeholder="Amount (₹)" 
            value={feeRequestData.amount} 
            onChange={e => setFeeRequestData({...feeRequestData, amount: e.target.value})} 
            required 
          />
          <NeoSelect 
            value={feeRequestData.feeType} 
            onChange={e => setFeeRequestData({...feeRequestData, feeType: e.target.value})} 
            required
          >
            <option value="" disabled>Select Fee Type</option>
            {feeTypes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </NeoSelect>
          <textarea 
            placeholder="Optional reason or context..." 
            value={feeRequestData.reason} 
            onChange={e => setFeeRequestData({...feeRequestData, reason: e.target.value})} 
            style={{
              padding: '1rem',
              borderRadius: '15px',
              border: 'none',
              backgroundColor: 'var(--bg-color)',
              boxShadow: 'inset 5px 5px 10px rgba(0,0,0,0.1), inset -5px -5px 10px rgba(255,255,255,0.5)',
              color: 'var(--text-color)',
              minHeight: '100px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <NeoButton variant="mint" type="submit">Submit Request</NeoButton>
        </form>
      </NeoModal>
    </div>
  );
};

export default UserDashboard;

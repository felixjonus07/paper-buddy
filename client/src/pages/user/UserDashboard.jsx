import React, { useState, useEffect } from 'react';
import NeoCard from '../../components/UI/NeoCard';
import NeoButton from '../../components/UI/NeoButton';
import NeoInput from '../../components/UI/NeoInput';
import NeoModal from '../../components/UI/NeoModal';
import NeoSelect from '../../components/UI/NeoSelect';
import ThemeToggle from '../../components/UI/ThemeToggle';
import { IndianRupee, FileText, User, Settings, LayoutDashboard, LogOut, Download, Edit, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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
      
      if (!res.ok) {
        alert(`Failed to initiate payment: ${orderData.message || 'Unknown error'}`);
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Failed to load Razorpay SDK. Are you online?');
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Paper Buddy',
        description: 'Fee Payment',
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`/api/user/verify-payment`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                id,
                isMissing
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              alert('Payment successful!');
              fetchData();
            } else {
              alert(`Payment verification failed: ${verifyData.message}`);
            }
          } catch (err) {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: '#14b8a6'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      alert('Error occurred while processing payment');
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
  const renderDashboard = () => {
    const pendingFees = studentFees.filter(f => f.status === 'PENDING');
    const totalFees = pendingFees.reduce((sum, f) => sum + f.finalAmount, 0);
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
                <IndianRupee size={20} />
              </div>
              <h4 style={{ margin: 0 }}>Outstanding Fees</h4>
            </div>
            <p style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-color)' }}>₹{totalFees.toFixed(2)}</p>
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
          
          {profile?.scholarship && (
            <NeoCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ padding: '10px', backgroundColor: 'var(--clay-lavender-light)', borderRadius: '15px', color: 'var(--icon-lavender)' }}>
                  <FileText size={20} />
                </div>
                <h4 style={{ margin: 0 }}>Active Scholarship</h4>
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-color)' }}>{profile.scholarship.name}</p>
              <p style={{ margin: 0, color: 'var(--clay-mint)', fontWeight: 'bold' }}>{profile.scholarship.discountPercentage}% Discount</p>
            </NeoCard>
          )}
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>


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
                      <td style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>₹{l.amount}</td>
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

  const renderPayFees = () => {
    const pendingStudentFees = studentFees.filter(f => f.status === 'PENDING');
    const missingFees = fees.filter(f => !studentFees.some(sf => sf.feeId?._id === f._id || sf.feeId === f._id));
    
    const allPending = [
      ...pendingStudentFees.map(sf => ({
        id: sf._id,
        title: sf.feeId?.title || 'Unknown Fee',
        amountDue: sf.finalAmount,
        isMissing: false
      })),
      ...missingFees.map(f => ({
        id: f._id,
        title: f.title,
        amountDue: f.amount,
        isMissing: true
      }))
    ];

    return (
      <div style={{ animation: 'slideUp 0.3s ease-out', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '2rem', textAlign: 'center' }}>Pay Outstanding Fees</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {allPending.map(f => (
            <NeoCard key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)' }}>{f.title}</h3>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>
                ₹{f.amountDue.toFixed(2)}
              </div>
              <NeoButton 
                variant="mint" 
                onClick={() => handlePayFee(f.id, f.isMissing)} 
                style={{ marginTop: 'auto', width: '100%', padding: '0.8rem' }}
              >
                Pay Now
              </NeoButton>
            </NeoCard>
          ))}
          {allPending.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-light)', width: '100%', gridColumn: '1 / -1' }}>No outstanding fees to pay!</p>
          )}
        </div>
      </div>
    );
  };

  const renderFeeRequests = () => {
    return (
      <div style={{ animation: 'slideUp 0.3s ease-out', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ color: 'var(--primary)', margin: 0 }}>My Fee Requests</h2>
          <NeoButton variant="mint" onClick={() => setRequestFeeModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={18} /> Request Fee Add-on
          </NeoButton>
        </div>

        <NeoCard>
          <div className="table-container">
            <table style={{ backgroundColor: 'transparent' }}>
              <thead>
                <tr>
                  <th style={{ color: 'var(--text-color)' }}>Fee Title</th>
                  <th style={{ color: 'var(--text-color)' }}>Amount</th>
                  <th style={{ color: 'var(--text-color)' }}>Type</th>
                  <th style={{ color: 'var(--text-color)' }}>Reason</th>
                  <th style={{ color: 'var(--text-color)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {feeRequests.map(r => (
                  <tr key={r._id}>
                    <td style={{ backgroundColor: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>{r.requestedFeeTitle}</td>
                    <td style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>₹{r.amount}</td>
                    <td style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>{feeTypes.find(t => t._id === r.feeType)?.name || 'Unknown'}</td>
                    <td style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>{r.reason || '-'}</td>
                    <td style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>
                      <span style={{ 
                        padding: '0.3rem 0.6rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold',
                        backgroundColor: r.status === 'pending' ? 'var(--clay-peach-light)' : r.status === 'approved' ? 'var(--clay-mint-light)' : 'var(--clay-pink-light)',
                        color: r.status === 'pending' ? '#9a3412' : r.status === 'approved' ? '#115e59' : '#831843'
                      }}>
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {feeRequests.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.4)' }}>No requests submitted</td></tr>}
              </tbody>
            </table>
          </div>
        </NeoCard>
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
  const renderProfile = () => {
    if (!profile) return <p style={{ textAlign: 'center' }}>Loading profile...</p>;

    return (
      <div style={{ animation: 'slideUp 0.3s ease-out', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <NeoCard style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 2rem' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--clay-peach)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--clay-outer)', marginBottom: '1rem' }}>
            <User size={50} color="white" />
          </div>
          <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '2rem' }}>{profile.name}</h2>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-light)' }}>@{profile.username}</span>
          
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '0.5rem 1.5rem', 
            borderRadius: '20px', 
            backgroundColor: profile.role === 'admin' ? 'var(--clay-pink-light)' : 'var(--clay-mint-light)',
            color: profile.role === 'admin' ? '#831843' : '#115e59',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            {profile.role}
          </div>
          
          <NeoButton variant="mint" style={{ marginTop: '1rem', padding: '0.4rem 1.2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={openProfileEdit}>
            <Edit size={16} /> Edit Details
          </NeoButton>
        </NeoCard>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <NeoCard>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '2px solid rgba(128,128,128,0.1)', paddingBottom: '0.5rem' }}>Personal Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>Register No:</span>
                <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>{profile.registerNumber || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>Phone Number:</span>
                <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>{profile.phoneNumber || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>Personal Email:</span>
                <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>{profile.personalEmail || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>College Email:</span>
                <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>{profile.collegeEmail || '-'}</span>
              </div>
            </div>
          </NeoCard>

          <NeoCard>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '2px solid rgba(128,128,128,0.1)', paddingBottom: '0.5rem' }}>Academic Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>Class / Year:</span>
                <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                  {profile.studentClass ? `${profile.studentClass}` : '-'} {profile.year ? `(${profile.year})` : ''}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>Section:</span>
                <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>{profile.section || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>Current Score:</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{profile.academicScore || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>Scholarship:</span>
                {profile.scholarship ? (
                   <span style={{ backgroundColor: 'var(--clay-mint-light)', color: '#115e59', padding: '0.3rem 0.6rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                     {profile.scholarship.name} ({profile.scholarship.discountPercentage}%)
                   </span>
                ) : (
                   <span style={{ fontStyle: 'italic', color: 'var(--text-light)' }}>None</span>
                )}
              </div>
            </div>
          </NeoCard>

          <NeoCard>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '2px solid rgba(128,128,128,0.1)', paddingBottom: '0.5rem' }}>Enrolled Groups</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
              {profile.groups && profile.groups.length > 0 ? profile.groups.map(g => (
                <span key={g._id} style={{ padding: '0.5rem 1rem', borderRadius: '15px', backgroundColor: 'var(--bg-color)', boxShadow: 'var(--clay-outer)', fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 'bold' }}>
                  {g.name}
                </span>
              )) : (
                <span style={{ fontStyle: 'italic', color: 'var(--text-light)' }}>Not enrolled in any groups</span>
              )}
            </div>
          </NeoCard>
        </div>
      </div>
    );
  };

  const renderPaidFees = () => {
    const paidFees = studentFees.filter(f => f.status === 'PAID');
    return (
      <div style={{ animation: 'slideUp 0.3s ease-out', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ color: 'var(--primary)', margin: 0, textAlign: 'left' }}>Payment History</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {paidFees.map(f => (
            <NeoCard key={f._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)' }}>{f.feeId?.title || 'Unknown Fee'}</h3>
              </div>
              
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>
                ₹{f.finalAmount.toFixed(2)}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Base Amount:</span>
                  <span>₹{f.baseAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Discount:</span>
                  <span style={{ color: 'var(--clay-mint)', fontWeight: 'bold' }}>-₹{f.discountAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(128,128,128,0.2)', fontSize: '0.85rem', color: 'var(--text-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Paid on {new Date(f.updatedAt).toLocaleDateString()}</span>
                <NeoButton variant="mint" onClick={() => handleDownloadReceipt(f)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Download size={14} /> Receipt
                </NeoButton>
              </div>
            </NeoCard>
          ))}
          {paidFees.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-light)', width: '100%', gridColumn: '1 / -1' }}>No paid fees found.</p>
          )}
        </div>
      </div>
    );
  };

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

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'pay-fees' && renderPayFees()}
        {activeTab === 'fee-requests' && renderFeeRequests()}
        {activeTab === 'loan' && renderApplyLoan()}
        {activeTab === 'paid-fees' && renderPaidFees()}
        {activeTab === 'settings' && renderSettings()}
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

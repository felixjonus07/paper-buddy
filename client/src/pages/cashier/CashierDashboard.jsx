import React, { useState, useEffect } from 'react';
import { Search, LogOut, CheckCircle, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NeoCard from '../../components/UI/NeoCard';
import NeoInput from '../../components/UI/NeoInput';
import NeoButton from '../../components/UI/NeoButton';
import ThemeToggle from '../../components/UI/ThemeToggle';
import StudentSearch from '../../components/cashier/StudentSearch';
import StudentLedger from '../../components/cashier/StudentLedger';

const CashierDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pendingFees, setPendingFees] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/cashier/students/search?query=${searchQuery}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStudents(data);
      setSelectedStudent(null);
      setPendingFees([]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchStudentFees = async (studentId) => {
    try {
      const res = await fetch(`/api/cashier/students/${studentId}/fees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPendingFees(data);
    } catch (err) {
      console.error(err);
    }
  };

  const selectStudent = (student) => {
    setSelectedStudent(student);
    fetchStudentFees(student._id);
  };

  const handleCashPayment = async (studentFeeId) => {
    if (!window.confirm("Confirm cash payment received for this fee?")) return;

    try {
      const res = await fetch('/api/cashier/fees/pay', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentId: selectedStudent._id, studentFeeId })
      });
      
      if (res.ok) {
        alert("Payment recorded successfully!");
        fetchStudentFees(selectedStudent._id); // refresh fees
      } else {
        const data = await res.json();
        alert(data.message || "Payment failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing payment");
    }
  };

  return (
    <div className="app-container dashboard-layout">
      {/* Cashier Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--text-light)'}}>
           <div style={{ width: '50px', height: '50px', background: 'var(--overlay-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.4)' }}>
             <IndianRupee size={28} color="var(--primary)" />
           </div>
           <div className="header-text">
             <h3 style={{ margin: 0, color: 'var(--text-color)' }}>{user?.name}</h3>
             <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Cashier Portal</span>
           </div>
        </div>
        
        <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
          <NeoButton variant="secondary" onClick={handleLogout} style={{ width: '100%' }}>
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
          <h2 style={{ margin: 0, color: 'var(--text-color)' }}>Record Cash Payments</h2>
          <div className="header-actions">
            <ThemeToggle />
          </div>
        </div>

        <div style={{ animation: 'slideUp 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <StudentSearch handleSearch={handleSearch} searchQuery={searchQuery} setSearchQuery={setSearchQuery} loading={loading} students={students} selectedStudent={selectedStudent} selectStudent={selectStudent} />
          <StudentLedger selectedStudent={selectedStudent} setSelectedStudent={setSelectedStudent} pendingFees={pendingFees} handleCashPayment={handleCashPayment} />

        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;

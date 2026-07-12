import React, { useState, useEffect } from 'react';
import { Search, LogOut, CheckCircle, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NeoCard from '../../components/UI/NeoCard';
import NeoInput from '../../components/UI/NeoInput';
import NeoButton from '../../components/UI/NeoButton';
import ThemeToggle from '../../components/UI/ThemeToggle';

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
          
          {/* Search Card */}
          <NeoCard>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Search Student</h3>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <NeoInput 
                  type="text" 
                  placeholder="Search by Name, Username, or Register Number..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  Icon={Search}
                />
              </div>
              <NeoButton variant="primary" type="submit" disabled={loading}>
                Search
              </NeoButton>
            </form>

            {/* Search Results */}
            {students.length > 0 && !selectedStudent && (
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <h4 style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>Search Results</h4>
                {students.map(student => (
                  <div 
                    key={student._id}
                    onClick={() => selectStudent(student)}
                    style={{ 
                      padding: '1rem', 
                      borderRadius: '16px', 
                      backgroundColor: 'var(--bg-secondary)', 
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                  >
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-color)' }}>{student.name}</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                        @{student.username} {student.registerNumber ? ` | Reg: ${student.registerNumber}` : ''}
                      </span>
                    </div>
                    <NeoButton variant="secondary" style={{ padding: '0.4rem 1rem' }}>Select</NeoButton>
                  </div>
                ))}
              </div>
            )}
            
            {students.length === 0 && searchQuery && !loading && (
              <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>No students found matching your search.</p>
            )}
          </NeoCard>

          {/* Student Fees Card */}
          {selectedStudent && (
            <NeoCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--primary)' }}>Student Ledger</h3>
                  <p style={{ margin: 0, marginTop: '0.2rem', color: 'var(--text-color)' }}>
                    <strong>{selectedStudent.name}</strong> (@{selectedStudent.username})
                  </p>
                </div>
                <NeoButton variant="secondary" onClick={() => setSelectedStudent(null)} style={{ padding: '0.4rem 1rem' }}>
                  Clear Selection
                </NeoButton>
              </div>

              {pendingFees.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--clay-mint-light)', borderRadius: '16px', border: '1px solid var(--clay-mint)' }}>
                  <CheckCircle size={40} color="var(--clay-mint)" style={{ marginBottom: '1rem' }} />
                  <h4 style={{ color: 'var(--text-color)', margin: 0 }}>All Clear!</h4>
                  <p style={{ color: 'var(--text-light)', margin: 0 }}>This student has no pending fees to pay.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingFees.map(fee => (
                    <div key={fee._id} style={{ 
                      padding: '1.2rem', 
                      borderRadius: '16px', 
                      backgroundColor: 'var(--bg-secondary)', 
                      border: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}>
                      <div>
                        <h4 style={{ margin: 0, color: 'var(--text-color)' }}>{fee.feeId?.title || 'Unknown Fee'}</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
                          Base Amount: ₹{fee.baseAmount}
                          {fee.discountAmount > 0 && ` | Discount: ₹${fee.discountAmount}`}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-light)' }}>Amount Payable</span>
                          <strong style={{ fontSize: '1.2rem', color: 'var(--clay-peach)' }}>₹{fee.finalAmount}</strong>
                        </div>
                        <NeoButton variant="primary" onClick={() => handleCashPayment(fee._id)}>
                          Record Cash Payment
                        </NeoButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </NeoCard>
          )}

        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;

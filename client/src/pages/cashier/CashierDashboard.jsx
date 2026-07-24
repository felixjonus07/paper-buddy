import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, LogOut, IndianRupee, Clock, Download, TrendingUp, PlusCircle, X, CheckCircle, AlertCircle, FileText, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NeoCard from '../../components/UI/NeoCard';
import NeoInput from '../../components/UI/NeoInput';
import NeoButton from '../../components/UI/NeoButton';
import NeoSelect from '../../components/UI/NeoSelect';
import ThemeToggle from '../../components/UI/ThemeToggle';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAlert } from '../../context/AlertContext';

const TABS = [
  { key: 'pay', label: 'Collect Fee', icon: IndianRupee },
  { key: 'log', label: "Today's Log", icon: Clock },
  { key: 'report', label: 'Reports', icon: TrendingUp },
  { key: 'receipt', label: 'Print Receipt', icon: FileText },
];

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

const REPORT_PRESETS = [
  { label: 'Today', getDates: () => { const d = new Date(); return [d, d]; } },
  { label: 'This Month', getDates: () => { const d = new Date(); return [new Date(d.getFullYear(), d.getMonth(), 1), new Date(d.getFullYear(), d.getMonth() + 1, 0)]; } },
  { label: 'Last Month', getDates: () => { const d = new Date(); return [new Date(d.getFullYear(), d.getMonth() - 1, 1), new Date(d.getFullYear(), d.getMonth(), 0)]; } },
  { label: 'Q1 (Apr–Jun)', getDates: () => { const y = new Date().getFullYear(); return [new Date(y, 3, 1), new Date(y, 5, 30)]; } },
  { label: 'Q2 (Jul–Sep)', getDates: () => { const y = new Date().getFullYear(); return [new Date(y, 6, 1), new Date(y, 8, 30)]; } },
  { label: 'Q3 (Oct–Dec)', getDates: () => { const y = new Date().getFullYear(); return [new Date(y, 9, 1), new Date(y, 11, 31)]; } },
  { label: 'Q4 (Jan–Mar)', getDates: () => { const y = new Date().getFullYear(); return [new Date(y, 0, 1), new Date(y, 2, 31)]; } },
  { label: 'H1 (Apr–Sep)', getDates: () => { const y = new Date().getFullYear(); return [new Date(y, 3, 1), new Date(y, 8, 30)]; } },
  { label: 'H2 (Oct–Mar)', getDates: () => { const y = new Date().getFullYear(); return [new Date(y, 9, 1), new Date(y + 1, 2, 31)]; } },
  { label: 'This Year', getDates: () => { const y = new Date().getFullYear(); return [new Date(y, 3, 1), new Date(y + 1, 2, 31)]; } },
];

const toISO = (d) => d.toISOString().split('T')[0];

const CashierDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'pay';
  const setActiveTab = (tab) => setSearchParams({ tab }, { replace: true });

  const navigate = useNavigate();
  const { showAlert, showConfirm } = useAlert();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const searchRef = useRef(null);

  // Search + payment
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pendingFees, setPendingFees] = useState([]);
  const [pastPayments, setPastPayments] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [payMsg, setPayMsg] = useState('');

  // Add fee modal
  const [showAddFee, setShowAddFee] = useState(false);
  const [addFeeData, setAddFeeData] = useState({ title: '', amount: '', feeType: '' });
  const [addFeeMsg, setAddFeeMsg] = useState('');
  const [feeTypes, setFeeTypes] = useState([]);

  // Fetch fee types on mount
  useEffect(() => {
    fetch('/api/cashier/fee-types', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : [])
      .then(data => setFeeTypes(data))
      .catch(() => { });
  }, [token]);

  // Today log
  const [todayLog, setTodayLog] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [logLoading, setLogLoading] = useState(false);

  // Report
  const [reportStart, setReportStart] = useState(toISO(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [reportEnd, setReportEnd] = useState(toISO(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)));
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // ----- Live search (debounced) -----
  const debounceTimer = useRef(null);
  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    setSelectedStudent(null);
    setSuggestions([]);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!q.trim()) return;
    debounceTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/cashier/students/search?query=${encodeURIComponent(q)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setSuggestions(data);
      } catch { /* ignore */ }
      setSearchLoading(false);
    }, 250);
  };

  const selectStudent = async (student) => {
    setSelectedStudent(student);
    setSuggestions([]);
    setSearchQuery(student.name);
    setPayMsg('');
    try {
      const [feesRes, paymentsRes] = await Promise.all([
        fetch(`/api/cashier/students/${student._id}/fees`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/cashier/students/${student._id}/payments`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const feesData = await feesRes.json();
      const paymentsData = await paymentsRes.json();
      setPendingFees(feesData);
      setPastPayments(paymentsData);
    } catch { /* ignore */ }
  };

  const handleDownloadReceipt = (feeInfo, studentInfo, paymentDate) => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(248, 116, 16); // Orange primary color
    doc.text("Paper Buddy", 14, 20);

    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text("Official Fee Receipt", 14, 30);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Student Name: ${studentInfo.name}`, 14, 42);
    doc.text(`Username: @${studentInfo.username}`, 14, 48);
    doc.text(`Date of Payment: ${new Date(paymentDate).toLocaleDateString()}`, 14, 54);

    const tableColumn = ["Description", "Details"];
    const tableRows = [
      ["Fee Title", feeInfo.title || 'Unknown Fee'],
      ["Base Amount", `Rs ${feeInfo.baseAmount.toFixed(2)}`],
      ["Discount Applied", `Rs ${feeInfo.discountAmount.toFixed(2)}`],
      ["Amount Paid", `Rs ${feeInfo.finalAmount.toFixed(2)}`],
      ["Payment Method", "CASH"]
    ];

    autoTable(doc, {
      startY: 65,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [248, 116, 16] },
      styles: { fontSize: 11, cellPadding: 6 },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [80, 80, 80], cellWidth: 80 },
        1: { textColor: [0, 0, 0] }
      },
      didParseCell: function (data) {
        if (data.row.index === 3 && data.column.index === 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [248, 116, 16];
        }
      }
    });

    const finalY = doc.lastAutoTable?.finalY || 130;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for your payment. This is a computer-generated receipt.", 14, finalY + 15);

    doc.save(`Receipt_${(feeInfo.title || 'Fee').replace(/\s+/g, '_')}_${studentInfo.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handleCashPayment = async (studentFeeId) => {
    const confirmed = await showConfirm('Confirm cash payment received for this fee?');
    if (!confirmed) return;
    setPayMsg('');
    try {
      const res = await fetch('/api/cashier/fees/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ studentId: selectedStudent._id, studentFeeId })
      });
      const data = await res.json();
      if (res.ok) {
        setPayMsg('✅ Payment recorded! Generating receipt...');

        // Find fee details to print receipt
        const feeToPay = pendingFees.find(f => f._id === studentFeeId);
        if (feeToPay) {
          handleDownloadReceipt(
            { title: feeToPay.feeId?.title, baseAmount: feeToPay.baseAmount, discountAmount: feeToPay.discountAmount, finalAmount: feeToPay.finalAmount },
            selectedStudent,
            data.payment.paidAt || new Date()
          );
        }

        // Refresh fees
        const feesRes = await fetch(`/api/cashier/students/${selectedStudent._id}/fees`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setPendingFees(await feesRes.json());
        // Refresh today log if on that tab
        fetchTodayLog();
      } else {
        setPayMsg(`❌ ${data.message || 'Payment failed'}`);
      }
    } catch { setPayMsg('❌ Server error'); }
  };

  // ----- Add Fee to student -----
  const handleAddFee = async (e) => {
    e.preventDefault();
    setAddFeeMsg('');
    try {
      const res = await fetch('/api/cashier/fees/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ studentId: selectedStudent._id, ...addFeeData })
      });
      const data = await res.json();
      if (res.ok) {
        setAddFeeMsg('✅ Fee added!');
        setAddFeeData({ title: '', amount: '', feeType: '' });
        // Refresh pending fees
        const feesRes = await fetch(`/api/cashier/students/${selectedStudent._id}/fees`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setPendingFees(await feesRes.json());
        setTimeout(() => { setShowAddFee(false); setAddFeeMsg(''); }, 1200);
      } else {
        setAddFeeMsg(`❌ ${data.message}`);
      }
    } catch { setAddFeeMsg('❌ Server error'); }
  };

  // ----- Today Log -----
  const fetchTodayLog = useCallback(async () => {
    setLogLoading(true);
    try {
      const res = await fetch('/api/cashier/log/today', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTodayLog(data.payments || []);
      setTodayTotal(data.totalToday || 0);
    } catch { /* ignore */ }
    setLogLoading(false);
  }, [token]);

  useEffect(() => { if (activeTab === 'log' || activeTab === 'receipt') fetchTodayLog(); }, [activeTab, fetchTodayLog]);

  // ----- Reports -----
  const fetchReport = async (start, end) => {
    const s = start || reportStart;
    const e = end || reportEnd;
    setReportLoading(true);
    try {
      const res = await fetch(`/api/cashier/report?startDate=${s}&endDate=${e}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setReportData({ ...data, startDate: s, endDate: e });
    } catch { /* ignore */ }
    setReportLoading(false);
  };

  const applyPreset = (preset) => {
    const [s, e] = preset.getDates();
    const sStr = toISO(s), eStr = toISO(e);
    setReportStart(sStr);
    setReportEnd(eStr);
    fetchReport(sStr, eStr);
  };

  const downloadCSV = () => {
    if (!reportData) return;
    const rows = [
      ['Date', 'Student', 'Username', 'Reg No', 'Fee', 'Amount', 'Method'],
      ...reportData.payments.map(p => [
        fmtDate(p.paidAt),
        p.user?.name || '',
        p.user?.username || '',
        p.user?.registerNumber || '',
        p.fee?.title || 'Unknown',
        p.amount,
        p.paymentMethod
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `CashierReport_${reportData.startDate}_to_${reportData.endDate}.csv`);
    link.click();
  };

  // ---- Styles ----
  const tabStyle = (k) => ({
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.7rem 1.4rem', borderRadius: '30px', cursor: 'pointer', border: 'none',
    fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
    background: activeTab === k ? 'var(--primary)' : 'transparent',
    color: activeTab === k ? '#fff' : 'var(--text-light)',
    boxShadow: activeTab === k ? '0 4px 12px rgba(var(--primary-rgb),0.3)' : 'none'
  });

  return (
    <div className="app-container dashboard-layout">
      {/* Fluffy Sidebar Navigation */}
      <div className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--text-light)', position: 'relative', minHeight: '60px' }}>
          <div className="header-text">
            <h3 style={{ margin: 0, color: 'var(--text-color)' }}>{user?.name || 'Campus Cashier'}</h3>
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
          {TABS.map(item => (
            <div key={item.key} className={`nav-item ${activeTab === item.key ? 'active' : ''}`} onClick={() => { setActiveTab(item.key); if (isMobile) setMobileSidebarOpen(false); }}>
              <item.icon size={20} /> <span className="nav-text">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-footer" style={{ marginTop: '2rem' }}>
          <NeoButton variant="secondary" onClick={handleLogout} style={{ width: '100%', padding: isSidebarOpen ? '0.8rem' : '0.8rem 0' }}>
            <LogOut size={18} /> {isSidebarOpen && 'Logout'}
          </NeoButton>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-content">
        {/* Mobile Dashboard Tabs */}
        {isMobile && (
          <div className="mobile-dashboard-tabs">
            {TABS.map(item => (
              <div 
                key={item.key} 
                className={`mobile-tab-item ${activeTab === item.key ? 'active' : ''}`} 
                onClick={() => setActiveTab(item.key)}
              >
                <item.icon size={16} /> {item.label}
              </div>
            ))}
          </div>
        )}
        <div style={{ flexShrink: 0, padding: '0.5rem' }}>
          <div className="dashboard-header" style={{
            backgroundColor: 'var(--clay-base)',
            padding: '1rem 2rem',
            borderRadius: '50px',
            boxShadow: 'var(--clay-outer)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, color: 'var(--text-color)' }}>
                {TABS.find(t => t.key === activeTab)?.label}
              </h2>
            </div>
          </div>
        </div>

        <div className="dashboard-scroll-area">
          <div style={{ animation: 'slideUp 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* ===== TAB: COLLECT FEE ===== */}
            {activeTab === 'pay' && (
              <>
                {/* Live Search */}
                <NeoCard style={{ overflow: 'visible' }}>
                  <h3 style={{ color: 'var(--primary)', marginBottom: '0.4rem' }}>Search Student</h3>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
                    Start typing a student's name, username, or register number - results appear instantly.
                  </p>
                  <div style={{ position: 'relative' }} ref={searchRef}>
                    <NeoInput
                      type="text"
                      placeholder="Start typing student name or Reg No..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      Icon={Search}
                    />
                    {/* Live dropdown suggestions */}
                    {suggestions.length > 0 && !selectedStudent && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                        background: 'var(--clay-base)', borderRadius: '16px', marginTop: '0.5rem',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid var(--border)',
                        overflow: 'hidden'
                      }}>
                        {suggestions.map(s => (
                          <div
                            key={s._id}
                            onClick={() => selectStudent(s)}
                            style={{
                              padding: '0.9rem 1.2rem', cursor: 'pointer',
                              borderBottom: '1px solid var(--border)',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <strong style={{ color: 'var(--text-color)' }}>{s.name}</strong>
                            <span style={{ marginLeft: '0.8rem', fontSize: '0.82rem', color: 'var(--text-light)' }}>
                              @{s.username}{s.registerNumber ? ` · Reg: ${s.registerNumber}` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchLoading && (
                      <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Searching...</p>
                    )}
                  </div>
                </NeoCard>

                {/* Student Ledger */}
                {selectedStudent && (
                  <NeoCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h3 style={{ margin: 0, color: 'var(--primary)' }}>Student Ledger</h3>
                        <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-color)' }}>
                          <strong>{selectedStudent.name}</strong>
                          <span style={{ marginLeft: '0.5rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>@{selectedStudent.username}</span>
                          {selectedStudent.registerNumber && (
                            <span style={{ marginLeft: '0.5rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>· Reg: {selectedStudent.registerNumber}</span>
                          )}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                        <NeoButton variant="primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => { setShowAddFee(true); setAddFeeMsg(''); }}>
                          <PlusCircle size={16} /> Add Fee
                        </NeoButton>
                        <NeoButton variant="secondary" onClick={() => { setSelectedStudent(null); setSearchQuery(''); setPendingFees([]); setPayMsg(''); }} style={{ padding: '0.4rem 1rem' }}>
                          <X size={16} /> Clear
                        </NeoButton>
                      </div>
                    </div>

                    {payMsg && (
                      <p style={{ marginBottom: '1rem', color: payMsg.startsWith('✅') ? 'var(--clay-mint)' : 'var(--clay-peach)', fontWeight: 600 }}>{payMsg}</p>
                    )}

                    {pendingFees.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(var(--clay-mint-rgb),0.1)', borderRadius: '16px', border: '1px solid var(--clay-mint)' }}>
                        <CheckCircle size={40} color="var(--clay-mint)" style={{ marginBottom: '0.8rem' }} />
                        <h4 style={{ color: 'var(--text-color)', margin: 0 }}>All Clear!</h4>
                        <p style={{ color: 'var(--text-light)', margin: 0 }}>This student has no pending fees.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {pendingFees.map(fee => (
                          <div key={fee._id} style={{
                            padding: '1.2rem', borderRadius: '16px', backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
                          }}>
                            <div>
                              <h4 style={{ margin: 0, color: 'var(--text-color)' }}>{fee.feeId?.title || 'Unknown Fee'}</h4>
                              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                                Base: {fmt(fee.baseAmount)}
                                {fee.discountAmount > 0 && <span style={{ color: 'var(--clay-mint)', marginLeft: '0.5rem' }}> · Discount: {fmt(fee.discountAmount)}</span>}
                              </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-light)' }}>Amount Payable</span>
                                <strong style={{ fontSize: '1.3rem', color: 'var(--primary)' }}>{fmt(fee.finalAmount)}</strong>
                              </div>
                              <NeoButton variant="primary" onClick={() => handleCashPayment(fee._id)}>
                                <IndianRupee size={16} /> Record Cash
                              </NeoButton>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Past Payments History */}
                    {pastPayments.length > 0 && (
                      <div style={{ marginTop: '2.5rem' }}>
                        <h4 style={{ color: 'var(--text-color)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CheckCircle size={18} color="var(--clay-mint)" /> Previously Paid Fees
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {pastPayments.map(p => (
                            <div key={p._id} style={{
                              padding: '1rem 1.2rem', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)',
                              border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between',
                              alignItems: 'center', flexWrap: 'wrap', gap: '1rem', opacity: 0.85
                            }}>
                              <div>
                                <h5 style={{ margin: 0, color: 'var(--text-color)', fontSize: '0.95rem' }}>{p.fee?.title || 'Unknown Fee'}</h5>
                                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-light)' }}>
                                  Paid on {fmtDate(p.paidAt)} via <strong style={{ color: p.paymentMethod === 'CASH' ? '#16a34a' : '#6366f1' }}>{p.paymentMethod}</strong>
                                </p>
                              </div>
                              <strong style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>{fmt(p.amount)}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </NeoCard>
                )}

                {/* Add Fee Modal */}
                {showAddFee && selectedStudent && (
                  <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <NeoCard style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
                      <button onClick={() => setShowAddFee(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}><X size={20} /></button>
                      <h3 style={{ color: 'var(--primary)', marginBottom: '0.3rem' }}>Add Fee to Student</h3>
                      <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                        Manually create and assign a one-off fee for <strong>{selectedStudent.name}</strong>.
                      </p>
                      <form onSubmit={handleAddFee} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <NeoInput type="text" placeholder="Fee Title (e.g. Lab Fee)" value={addFeeData.title} onChange={e => setAddFeeData({ ...addFeeData, title: e.target.value })} required />
                        <NeoInput type="number" placeholder="Amount (₹)" value={addFeeData.amount} onChange={e => setAddFeeData({ ...addFeeData, amount: e.target.value })} required />
                        <NeoSelect
                          value={addFeeData.feeType}
                          onChange={v => setAddFeeData({ ...addFeeData, feeType: v })}
                          placeholder="Select Fee Type..."
                          options={feeTypes.map(ft => ({ value: ft._id, label: ft.name }))}
                          required
                        />
                        <NeoButton variant="primary" type="submit" style={{ width: '100%' }}>Add Fee</NeoButton>
                        {addFeeMsg && <p style={{ textAlign: 'center', color: addFeeMsg.startsWith('✅') ? 'var(--clay-mint)' : 'var(--clay-peach)' }}>{addFeeMsg}</p>}
                      </form>
                    </NeoCard>
                  </div>
                )}

                {/* Recently Accessed / Serviced Students */}
                {!selectedStudent && todayLog.length > 0 && (
                  <NeoCard style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary)', fontSize: '1.1rem' }}>Recently Serviced Students</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                      {Array.from(new Map(todayLog.filter(p => p.user).map(p => [p.user._id, p.user])).values()).slice(0, 8).map(student => (
                        <div
                          key={student._id}
                          onClick={() => selectStudent(student)}
                          style={{
                            padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', flexDirection: 'column', gap: '0.3rem'
                          }}
                          onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(var(--primary-rgb), 0.1)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                          onMouseOut={e => { e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        >
                          <strong style={{ color: 'var(--text-color)' }}>{student.name}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>@{student.username}</span>
                        </div>
                      ))}
                    </div>
                  </NeoCard>
                )}
              </>
            )}

            {/* ===== TAB: TODAY'S LOG ===== */}
            {activeTab === 'log' && (
              <>
                {/* Summary card */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  <NeoCard style={{ backgroundColor: 'transparent', borderColor: 'var(--primary)' }}>
                    <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}><IndianRupee size={24} /></div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-color)' }}>Total Collected Today</h3>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{fmt(todayTotal)}</p>
                  </NeoCard>
                  <NeoCard style={{ backgroundColor: 'transparent', borderColor: 'var(--primary)' }}>
                    <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}><TrendingUp size={24} /></div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-color)' }}>Transactions Today</h3>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{todayLog.length}</p>
                  </NeoCard>
                </div>

                {/* Timeline */}
                <NeoCard>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, color: 'var(--primary)' }}>Cash Payment Timeline</h3>
                    <NeoButton variant="secondary" onClick={fetchTodayLog} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Refresh</NeoButton>
                  </div>

                  {logLoading ? (
                    <p style={{ color: 'var(--text-light)' }}>Loading...</p>
                  ) : todayLog.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                      <AlertCircle size={36} style={{ marginBottom: '0.8rem', opacity: 0.4 }} />
                      <p>No cash payments recorded today yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {todayLog.map((p, i) => (
                        <div key={p._id} style={{ display: 'flex', gap: '1.2rem', position: 'relative', paddingBottom: '1.5rem' }}>
                          {/* Timeline line */}
                          {i < todayLog.length - 1 && (
                            <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: 0, width: '2px', background: 'var(--border)' }} />
                          )}
                          {/* Dot */}
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                            background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1
                          }}>
                            <IndianRupee size={12} color="#fff" />
                          </div>
                          {/* Info */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.3rem' }}>
                              <div>
                                <strong style={{ color: 'var(--text-color)' }}>{p.user?.name || 'Unknown'}</strong>
                                <span style={{ marginLeft: '0.6rem', fontSize: '0.82rem', color: 'var(--text-light)' }}>
                                  @{p.user?.username}{p.user?.registerNumber ? ` · ${p.user.registerNumber}` : ''}
                                </span>
                                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-light)' }}>{p.fee?.title || 'Unknown Fee'}</p>
                              </div>
                              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                                <div>
                                  <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{fmt(p.amount)}</strong>
                                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-light)' }}>{fmtDate(p.paidAt)}</p>
                                </div>
                                <button
                                  onClick={() => handleDownloadReceipt(
                                    { title: p.fee?.title, baseAmount: p.amount, discountAmount: 0, finalAmount: p.amount },
                                    p.user,
                                    p.paidAt
                                  )}
                                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem', padding: 0 }}
                                >
                                  <FileText size={14} /> Print Receipt
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </NeoCard>
              </>
            )}

            {/* ===== TAB: REPORTS ===== */}
            {activeTab === 'report' && (
              <>
                <NeoCard>
                  <h3 style={{ color: 'var(--primary)', marginBottom: '0.4rem' }}>Generate Report</h3>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', margin: '0 0 1.2rem 0' }}>
                    Pick a quick preset or choose custom dates to see all collected payments for that period.
                  </p>

                  {/* Quick presets */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginRight: '0.5rem' }}>Shortcuts:</span>
                    {REPORT_PRESETS.map(p => (
                      <NeoButton
                        key={p.label}
                        variant="secondary"
                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                        onClick={() => applyPreset(p)}
                      >
                        {p.label}
                      </NeoButton>
                    ))}
                  </div>

                  {/* Custom range */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.4rem' }}>Start Date</label>
                      <input type="date" value={reportStart} onChange={e => setReportStart(e.target.value)} style={{ padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--clay-base)', color: 'var(--text-color)', width: '100%' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.4rem' }}>End Date</label>
                      <input type="date" value={reportEnd} onChange={e => setReportEnd(e.target.value)} style={{ padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--clay-base)', color: 'var(--text-color)', width: '100%' }} />
                    </div>
                    <NeoButton variant="primary" onClick={() => fetchReport()} disabled={reportLoading}>
                      {reportLoading ? 'Loading...' : 'Generate'}
                    </NeoButton>
                  </div>
                </NeoCard>

                {reportData && (
                  <>
                    {/* Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                      <NeoCard style={{ backgroundColor: 'transparent', borderColor: 'var(--primary)' }}>
                        <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}><IndianRupee size={24} /></div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-color)' }}>Total Revenue</h3>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{fmt(reportData.total)}</p>
                      </NeoCard>
                      <NeoCard style={{ backgroundColor: 'transparent', borderColor: 'var(--primary)' }}>
                        <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}><TrendingUp size={24} /></div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-color)' }}>Total Transactions</h3>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{reportData.count}</p>
                      </NeoCard>
                    </div>

                    <NeoCard>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h3 style={{ margin: 0, color: 'var(--primary)' }}>Transactions</h3>
                        <NeoButton variant="secondary" onClick={downloadCSV} style={{ padding: '0.5rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Download size={16} /> Download CSV
                        </NeoButton>
                      </div>

                      {reportData.payments.length === 0 ? (
                        <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '2rem' }}>No transactions in this period.</p>
                      ) : (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                              <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-light)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                {['Date', 'Student', 'Fee', 'Method', 'Amount'].map(h => (
                                  <th key={h} style={{ padding: '0.6rem 0.8rem', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.payments.map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}
                                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <td style={{ padding: '0.7rem 0.8rem', color: 'var(--text-light)', whiteSpace: 'nowrap' }}>{fmtDate(p.paidAt)}</td>
                                  <td style={{ padding: '0.7rem 0.8rem' }}>
                                    <strong style={{ display: 'block', color: 'var(--text-color)' }}>{p.user?.name}</strong>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>@{p.user?.username}</span>
                                  </td>
                                  <td style={{ padding: '0.7rem 0.8rem', color: 'var(--text-color)' }}>{p.fee?.title || 'Unknown'}</td>
                                  <td style={{ padding: '0.7rem 0.8rem' }}>
                                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.78rem', background: p.paymentMethod === 'CASH' ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)', color: p.paymentMethod === 'CASH' ? '#16a34a' : '#6366f1' }}>
                                      {p.paymentMethod}
                                    </span>
                                  </td>
                                  <td style={{ padding: '0.7rem 0.8rem', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                      {fmt(p.amount)}
                                      <button
                                        onClick={() => handleDownloadReceipt(
                                          { title: p.fee?.title, baseAmount: p.amount, discountAmount: 0, finalAmount: p.amount },
                                          p.user,
                                          p.paidAt
                                        )}
                                        title="Print Receipt"
                                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, display: 'flex' }}
                                      >
                                        <FileText size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </NeoCard>
                  </>
                )}
              </>
            )}

            {/* ===== TAB: PRINT RECEIPT ===== */}
            {activeTab === 'receipt' && (
              <>
                {/* Live Search (Reused) */}
                <NeoCard style={{ overflow: 'visible' }}>
                  <h3 style={{ color: 'var(--primary)', marginBottom: '0.4rem' }}>Find Student Receipt</h3>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
                    Search for a student to reprint their past transaction receipts.
                  </p>
                  <div style={{ position: 'relative' }} ref={searchRef}>
                    <NeoInput
                      type="text"
                      placeholder="Start typing student name or Reg No..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      Icon={Search}
                    />
                    {/* Live dropdown suggestions */}
                    {suggestions.length > 0 && !selectedStudent && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                        background: 'var(--clay-base)', borderRadius: '16px', marginTop: '0.5rem',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid var(--border)',
                        overflow: 'hidden'
                      }}>
                        {suggestions.map(s => (
                          <div
                            key={s._id}
                            onClick={() => selectStudent(s)}
                            style={{
                              padding: '0.9rem 1.2rem', cursor: 'pointer',
                              borderBottom: '1px solid var(--border)',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <strong style={{ color: 'var(--text-color)' }}>{s.name}</strong>
                            <span style={{ marginLeft: '0.8rem', fontSize: '0.82rem', color: 'var(--text-light)' }}>
                              @{s.username}{s.registerNumber ? ` · Reg: ${s.registerNumber}` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchLoading && (
                      <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Searching...</p>
                    )}
                  </div>
                </NeoCard>

                {/* Default Log when no student is selected */}
                {!selectedStudent && todayLog.length > 0 && (
                  <NeoCard style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary)' }}>Recent Transactions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {todayLog.slice(0, 10).map(p => (
                        <div key={p._id} style={{
                          padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
                        }}>
                          <div>
                            <strong style={{ display: 'block', color: 'var(--text-color)', fontSize: '0.95rem' }}>{p.user?.name}</strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{p.fee?.title} · {fmtDate(p.paidAt)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <strong style={{ color: 'var(--primary)' }}>{fmt(p.amount)}</strong>
                            <button
                              onClick={() => handleDownloadReceipt(
                                { title: p.fee?.title, baseAmount: p.amount, discountAmount: 0, finalAmount: p.amount },
                                p.user,
                                p.paidAt
                              )}
                              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                              onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(var(--primary-rgb), 0.1)'}
                              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                              title="Print Receipt"
                            >
                              <FileText size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </NeoCard>
                )}

                {/* Student specific history */}
                {selectedStudent && (
                  <NeoCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h3 style={{ margin: 0, color: 'var(--primary)' }}>Payment History</h3>
                        <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-color)' }}>
                          <strong>{selectedStudent.name}</strong>
                          <span style={{ marginLeft: '0.5rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>@{selectedStudent.username}</span>
                        </p>
                      </div>
                      <NeoButton variant="secondary" onClick={() => { setSelectedStudent(null); setSearchQuery(''); setPastPayments([]); }} style={{ padding: '0.4rem 1rem' }}>
                        <X size={16} /> Clear
                      </NeoButton>
                    </div>

                    {pastPayments.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <FileText size={36} color="var(--text-light)" style={{ marginBottom: '0.8rem', opacity: 0.5 }} />
                        <p style={{ color: 'var(--text-light)', margin: 0 }}>No past payments found for this student.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {pastPayments.map(p => (
                          <div key={p._id} style={{
                            padding: '1.2rem', borderRadius: '16px', backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
                          }}>
                            <div>
                              <h4 style={{ margin: 0, color: 'var(--text-color)' }}>{p.fee?.title || 'Unknown Fee'}</h4>
                              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                                Paid on: {fmtDate(p.paidAt)}
                              </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                              <div style={{ textAlign: 'right' }}>
                                <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{fmt(p.amount)}</strong>
                              </div>
                              <NeoButton variant="secondary" onClick={() => handleDownloadReceipt(
                                { title: p.fee?.title, baseAmount: p.amount, discountAmount: 0, finalAmount: p.amount },
                                p.user,
                                p.paidAt
                              )}>
                                <FileText size={16} /> Print
                              </NeoButton>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </NeoCard>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;

import React, { useState, useEffect } from 'react';
import NeoCard from '../UI/NeoCard';
import NeoButton from '../UI/NeoButton';
import NeoInput from '../UI/NeoInput';
import { Calendar, Download, TrendingUp, IndianRupee } from 'lucide-react';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

const getDefaultDates = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: firstDay.toISOString().split('T')[0],
    end: lastDay.toISOString().split('T')[0]
  };
};

const ReportsManagement = () => {
  const defaultDates = getDefaultDates();
  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = async (e, overrideStart, overrideEnd) => {
    if (e) e.preventDefault();
    const sDate = overrideStart || startDate;
    const eDate = overrideEnd || endDate;
    
    if (!sDate || !eDate) {
      alert('Please select both start and end dates.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      // If superadmin is viewing this, collegeId might be in the query, but we can just use current token and role
      const searchParams = new URLSearchParams(window.location.search);
      const queryStr = `?startDate=${sDate}&endDate=${eDate}${searchParams.has('collegeId') ? `&collegeId=${searchParams.get('collegeId')}` : ''}`;
      
      const res = await fetch(`/api/admin/reports/payments${queryStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      } else {
        const errData = await res.json();
        setError(errData.message || 'Failed to fetch reports.');
      }
    } catch (err) {
      setError('An error occurred while fetching reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadCSV = () => {
    if (!reports || !reports.payments.length) return;
    
    const headers = ['Date', 'Student Name', 'Register No', 'Fee Title', 'Amount', 'Method', 'Status'];
    const rows = reports.payments.map(p => [
      new Date(p.paidAt).toLocaleDateString(),
      `"${p.userDetails?.name || 'Unknown'}"`,
      p.userDetails?.registerNumber || 'N/A',
      `"${p.feeDetails?.title || 'Unknown'}"`,
      p.amount,
      p.paymentMethod,
      p.status
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `financial_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    if (!reports || !reports.payments.length) return;
    
    const doc = new jsPDF();
    doc.text(`Financial Report (${startDate} to ${endDate})`, 14, 15);
    
    const headers = [['Date', 'Student Name', 'Register No', 'Fee Title', 'Amount', 'Method', 'Status']];
    const rows = reports.payments.map(p => [
      new Date(p.paidAt).toLocaleDateString(),
      p.userDetails?.name || 'Unknown',
      p.userDetails?.registerNumber || 'N/A',
      p.feeDetails?.title || 'Unknown',
      p.amount.toString(),
      p.paymentMethod,
      p.status
    ]);

    doc.autoTable({
      startY: 20,
      head: headers,
      body: rows,
    });
    
    doc.save(`financial_report_${startDate}_to_${endDate}.pdf`);
  };

  const setShortcut = (shortcut) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    let startYear = now.getFullYear();
    if (currentMonth < 3) startYear -= 1; // FY starts April
    
    let start, end;
    switch(shortcut) {
      case 'FY': start = `${startYear}-04-01`; end = `${startYear+1}-03-31`; break;
      case 'H1': start = `${startYear}-04-01`; end = `${startYear}-09-30`; break;
      case 'H2': start = `${startYear}-10-01`; end = `${startYear+1}-03-31`; break;
      case 'Q1': start = `${startYear}-04-01`; end = `${startYear}-06-30`; break;
      case 'Q2': start = `${startYear}-07-01`; end = `${startYear}-09-30`; break;
      case 'Q3': start = `${startYear}-10-01`; end = `${startYear}-12-31`; break;
      case 'Q4': start = `${startYear+1}-01-01`; end = `${startYear+1}-03-31`; break;
      default: 
        const d = getDefaultDates();
        start = d.start; end = d.end;
    }
    setStartDate(start);
    setEndDate(end);
    fetchReports(null, start, end);
  };

  return (
    <div style={{ animation: 'slideUp 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={24} /> Financial Reports & Auditing
        </h2>
      </div>

      <NeoCard style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginRight: '0.5rem' }}>Shortcuts:</span>
          <NeoButton variant="secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setShortcut('currentMonth')}>Current Month</NeoButton>
          <NeoButton variant="secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setShortcut('FY')}>Current FY</NeoButton>
          <NeoButton variant="secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setShortcut('H1')}>H1 (Apr-Sep)</NeoButton>
          <NeoButton variant="secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setShortcut('H2')}>H2 (Oct-Mar)</NeoButton>
          <NeoButton variant="secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setShortcut('Q1')}>Q1</NeoButton>
          <NeoButton variant="secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setShortcut('Q2')}>Q2</NeoButton>
          <NeoButton variant="secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setShortcut('Q3')}>Q3</NeoButton>
          <NeoButton variant="secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setShortcut('Q4')}>Q4</NeoButton>
        </div>
        <form onSubmit={fetchReports} style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 'bold' }}>Start Date</label>
            <NeoInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required Icon={Calendar} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 'bold' }}>End Date</label>
            <NeoInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required Icon={Calendar} />
          </div>
          <div>
            <NeoButton variant="primary" type="submit" style={{ padding: '0.8rem 1.5rem' }} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Report'}
            </NeoButton>
          </div>
        </form>
        {error && <p style={{ color: 'var(--clay-pink)', marginTop: '1rem' }}>{error}</p>}
      </NeoCard>

      {reports && (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <NeoCard style={{ backgroundColor: 'var(--clay-mint-light)', borderColor: 'var(--clay-mint)' }}>
              <div style={{ color: 'var(--clay-mint)', marginBottom: '0.5rem' }}><IndianRupee size={24} /></div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-color)' }}>Total Revenue</h3>
              <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 'bold', color: 'var(--clay-mint)' }}>₹{reports.totalCollected.toLocaleString()}</p>
            </NeoCard>
            
            <NeoCard style={{ backgroundColor: 'var(--clay-peach-light)', borderColor: 'var(--clay-peach)' }}>
              <div style={{ color: 'var(--clay-peach)', marginBottom: '0.5rem' }}><TrendingUp size={24} /></div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-color)' }}>Total Transactions</h3>
              <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 'bold', color: 'var(--clay-peach)' }}>{reports.count}</p>
            </NeoCard>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-color)' }}>Transaction History</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <NeoButton variant="secondary" onClick={handleDownloadCSV} disabled={reports.payments.length === 0}>
                <Download size={18} style={{ marginRight: '0.5rem' }} /> Export CSV
              </NeoButton>
              <NeoButton variant="primary" onClick={handleDownloadPDF} disabled={reports.payments.length === 0}>
                <Download size={18} style={{ marginRight: '0.5rem' }} /> Export PDF
              </NeoButton>
            </div>
          </div>

          <NeoCard style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: 'var(--text-color)' }}>
                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Date</th>
                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Student</th>
                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Fee Detail</th>
                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Amount</th>
                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Method</th>
                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.payments.map((p) => (
                    <tr key={p._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '1rem', color: 'var(--text-color)' }}>{new Date(p.paidAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-color)' }}>
                        <strong>{p.userDetails?.name || 'N/A'}</strong><br/>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Reg: {p.userDetails?.registerNumber || 'N/A'}</span>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-color)' }}>{p.feeDetails?.title || 'Unknown Fee'}</td>
                      <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--clay-mint)' }}>₹{p.amount}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-light)' }}>{p.paymentMethod}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.3rem 0.6rem', 
                          borderRadius: '10px', 
                          fontSize: '0.85rem', 
                          fontWeight: 'bold',
                          backgroundColor: p.status === 'SUCCESS' ? 'var(--clay-mint-light)' : 'var(--clay-peach-light)',
                          color: p.status === 'SUCCESS' ? '#115e59' : '#9a3412'
                        }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {reports.payments.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                        No transactions found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </NeoCard>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;

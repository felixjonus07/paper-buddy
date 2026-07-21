import React, { useState, useEffect } from 'react';
import NeoCard from '../UI/NeoCard';
import NeoButton from '../UI/NeoButton';
import { User, Calendar, FileText, ChevronRight, Search, CheckCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const CashierManagement = ({ isReadOnly, collegeId }) => {
  const [cashiers, setCashiers] = useState([]);
  const [selectedCashier, setSelectedCashier] = useState(null);
  const [logs, setLogs] = useState([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch cashiers on mount
  useEffect(() => {
    const fetchCashiers = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        if (collegeId) headers['x-college-id'] = collegeId;

        const res = await fetch('/api/admin/cashiers', {
          headers
        });
        if (res.ok) {
          setCashiers(await res.json());
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCashiers();
  }, [token, collegeId]);

  // Fetch logs whenever selectedCashier or selectedDate changes
  useEffect(() => {
    if (!selectedCashier) return;

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        if (collegeId) headers['x-college-id'] = collegeId;

        const res = await fetch(`/api/admin/cashiers/${selectedCashier._id}/logs?date=${selectedDate}`, {
          headers
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs);
          setTotalCollected(data.totalCollected);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [selectedCashier, selectedDate, token, collegeId]);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const fmtDate = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleDownloadReport = () => {
    if (logs.length === 0) return;

    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(248, 116, 16);
    doc.text("Paper Buddy", 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text("Cashier Collection Report", 14, 30);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Cashier: ${selectedCashier.name} (@${selectedCashier.username})`, 14, 42);
    doc.text(`Date: ${selectedDate}`, 14, 48);
    doc.text(`Total Collected: ${fmt(totalCollected)}`, 14, 54);
    
    const tableColumn = ["Time", "Student Name", "Fee Title", "Amount"];
    const tableRows = logs.map(log => [
      fmtDate(log.paidAt),
      log.user?.name || 'Unknown User',
      log.fee?.title || 'Unknown Fee',
      `Rs ${log.amount}`
    ]);
    
    autoTable(doc, {
      startY: 65,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [248, 116, 16] },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { top: 60 }
    });
    
    doc.save(`Cashier_Report_${selectedCashier.username}_${selectedDate}.pdf`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Cashier Selection */}
      <NeoCard>
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} /> Select Cashier
        </h3>
        {cashiers.length === 0 ? (
          <p style={{ color: 'var(--text-light)' }}>No cashiers found for this college.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {cashiers.map(c => (
              <div 
                key={c._id}
                onClick={() => setSelectedCashier(c)}
                style={{
                  padding: '1.2rem',
                  borderRadius: '16px',
                  backgroundColor: selectedCashier?._id === c._id ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--bg-secondary)',
                  border: `1px solid ${selectedCashier?._id === c._id ? 'var(--primary)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong style={{ color: 'var(--text-color)', display: 'block', marginBottom: '0.3rem' }}>{c.name}</strong>
                  <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>@{c.username}</span>
                </div>
                <ChevronRight size={18} color={selectedCashier?._id === c._id ? 'var(--primary)' : 'var(--text-light)'} />
              </div>
            ))}
          </div>
        )}
      </NeoCard>

      {/* Cashier Logs & Report */}
      {selectedCashier && (
        <NeoCard style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>Collection Logs</h3>
              <p style={{ margin: 0, color: 'var(--text-color)' }}>
                Showing records for <strong>{selectedCashier.name}</strong>
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    padding: '0.6rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-color)',
                    cursor: 'pointer'
                  }}
                />
              </div>
              <NeoButton variant="primary" onClick={handleDownloadReport} disabled={logs.length === 0}>
                <FileText size={16} /> Download Report
              </NeoButton>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ flex: 1, backgroundColor: 'rgba(22, 163, 74, 0.1)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(22, 163, 74, 0.3)' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: '#16a34a', fontSize: '0.9rem', fontWeight: 'bold' }}>Total Collected</p>
              <h2 style={{ margin: 0, color: '#16a34a', fontSize: '2rem' }}>{fmt(totalCollected)}</h2>
            </div>
            <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 'bold' }}>Total Transactions</p>
              <h2 style={{ margin: 0, color: 'var(--text-color)', fontSize: '2rem' }}>{logs.length}</h2>
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem' }}>Loading logs...</p>
          ) : logs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <Search size={36} color="var(--text-light)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ margin: 0, color: 'var(--text-light)' }}>No transactions found on this date.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {logs.map(log => (
                <div key={log._id} style={{
                  padding: '1rem 1.2rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: 'var(--text-color)', display: 'block' }}>{log.user?.name || 'Unknown Student'}</strong>
                    <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>{log.fee?.title || 'Unknown Fee'}</span>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ color: 'var(--text-light)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} /> {fmtDate(log.paidAt)}
                    </span>
                  </div>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <strong style={{ color: 'var(--clay-mint)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <CheckCircle size={16} /> {fmt(log.amount)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </NeoCard>
      )}

    </div>
  );
};

export default CashierManagement;

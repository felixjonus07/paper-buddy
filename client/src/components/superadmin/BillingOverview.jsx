import React, { useState, useEffect } from 'react';
import { IndianRupee, Globe, Building2, TrendingUp, RefreshCw, Download, CreditCard, Banknote, Landmark } from 'lucide-react';
import NeoCard from '../UI/NeoCard';
import NeoButton from '../UI/NeoButton';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// Split bar showing platform / own gateway / cash
const SplitBar = ({ platformAmount, ownGatewayAmount, cashAmount }) => {
  const total = platformAmount + ownGatewayAmount + cashAmount;
  if (total === 0) return (
    <div style={{ height: 8, borderRadius: 8, background: 'var(--border)' }} />
  );
  const p = (v) => `${Math.round((v / total) * 100)}%`;
  return (
    <div style={{ height: 8, borderRadius: 8, overflow: 'hidden', display: 'flex', gap: 1 }}>
      {platformAmount > 0 && <div style={{ width: p(platformAmount), height: '100%', background: 'linear-gradient(90deg,#22c55e,#16a34a)', borderRadius: '8px 0 0 8px' }} />}
      {ownGatewayAmount > 0 && <div style={{ width: p(ownGatewayAmount), height: '100%', background: 'linear-gradient(90deg,#6366f1,#4f46e5)' }} />}
      {cashAmount > 0 && <div style={{ width: p(cashAmount), height: '100%', background: 'linear-gradient(90deg,#f59e0b,#d97706)', borderRadius: ownGatewayAmount === 0 && platformAmount === 0 ? 8 : '0 8px 8px 0' }} />}
    </div>
  );
};

const BillingOverview = ({ token }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState('totalCollected');
  const [sortDir, setSortDir] = useState(-1);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/superadmin/billing-overview?_t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setData(await res.json());
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || `Server error ${res.status}`);
      }
    } catch (e) {
      setError(`Network error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d * -1);
    else { setSortKey(key); setSortDir(-1); }
  };

  const sorted = data
    ? [...data.colleges].sort((a, b) => (a[sortKey] - b[sortKey]) * sortDir)
    : [];

  const downloadCSV = () => {
    if (!data) return;
    const headers = ['College', 'Code', 'Payment Type', 'Platform (Online)', 'College Own Gateway', 'Cash (Cashier)', 'Total', 'Transactions'];
    const rows = sorted.map(c => [
      `"${c.name}"`, c.code, c.paymentType,
      c.platformAmount, c.ownGatewayAmount, c.cashAmount, c.totalCollected, c.transactionCount
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'billing_overview.csv';
    a.click();
  };

  const SortTh = ({ label, k }) => (
    <th onClick={() => handleSort(k)} style={{
      padding: '0.9rem 1rem', borderBottom: '2px solid var(--border)',
      fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.06em', color: sortKey === k ? 'var(--primary)' : 'var(--text-secondary)',
      cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
    }}>
      {label} {sortKey === k ? (sortDir === -1 ? '↓' : '↑') : ''}
    </th>
  );

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <RefreshCw size={32} style={{ opacity: 0.4, animation: 'spin 1s linear infinite' }} />
      <p style={{ marginTop: '1rem' }}>Loading billing data…</p>
    </div>
  );

  if (error || !data) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <p style={{ color: '#ef4444', fontWeight: 700, marginBottom: '1rem' }}>⚠️ {error || 'Failed to load billing data.'}</p>
      <NeoButton variant="secondary" onClick={fetchData}>Try Again</NeoButton>
    </div>
  );

  return (
    <div>
      {/* Legend callout */}
      <div style={{
        background: 'rgba(248,116,16,0.06)', border: '1px solid rgba(248,116,16,0.2)',
        borderRadius: 16, padding: '1rem 1.5rem', marginBottom: '2rem',
        display: 'flex', flexWrap: 'wrap', gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.83rem' }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#22c55e', flexShrink: 0 }} />
          <strong style={{ color: '#16a34a' }}>Platform (Centralized):</strong>
          <span style={{ color: 'var(--text-secondary)' }}>Online fees from colleges using our gateway — money goes to EduFin platform account.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.83rem' }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#6366f1', flexShrink: 0 }} />
          <strong style={{ color: '#6366f1' }}>College Own Gateway (Decentralized):</strong>
          <span style={{ color: 'var(--text-secondary)' }}>Online fees from colleges using their own PhonePe — money goes to college's own account.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.83rem' }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#f59e0b', flexShrink: 0 }} />
          <strong style={{ color: '#d97706' }}>Cash (Cashier):</strong>
          <span style={{ color: 'var(--text-secondary)' }}>Cash collected directly by college cashiers — credited to college.</span>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <NeoCard style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(248,116,16,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
            <IndianRupee size={22} color="var(--primary)" />
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Total Collected</p>
          <h2 style={{ margin: '0.2rem 0 0', color: 'var(--primary)', fontSize: '1.8rem' }}>{fmt(data.summary.grandTotal)}</h2>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>All colleges combined</p>
        </NeoCard>

        <NeoCard style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
            <Globe size={22} color="#22c55e" />
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Platform Gateway</p>
          <h2 style={{ margin: '0.2rem 0 0', color: '#22c55e', fontSize: '1.8rem' }}>{fmt(data.summary.grandPlatform)}</h2>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Credited to EduFin</p>
        </NeoCard>

        <NeoCard style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
            <Landmark size={22} color="#6366f1" />
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>College Own Gateway</p>
          <h2 style={{ margin: '0.2rem 0 0', color: '#6366f1', fontSize: '1.8rem' }}>{fmt(data.summary.grandOwnGateway)}</h2>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Credited to college</p>
        </NeoCard>

        <NeoCard style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
            <Banknote size={22} color="#f59e0b" />
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Cash (Cashier)</p>
          <h2 style={{ margin: '0.2rem 0 0', color: '#f59e0b', fontSize: '1.8rem' }}>{fmt(data.summary.grandCash)}</h2>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Collected directly</p>
        </NeoCard>
      </div>

      {/* Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3 style={{ margin: 0, color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={20} color="var(--primary)" /> Per-College Breakdown
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <NeoButton variant="secondary" onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={14} /> Refresh
          </NeoButton>
          <NeoButton variant="primary" onClick={downloadCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Download size={14} /> Export CSV
          </NeoButton>
        </div>
      </div>

      <NeoCard style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.04)' }}>
                <th style={{ padding: '0.9rem 1rem', borderBottom: '2px solid var(--border)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>College</th>
                <th style={{ padding: '0.9rem 1rem', borderBottom: '2px solid var(--border)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>Mode</th>
                <SortTh label="🟢 Platform" k="platformAmount" />
                <SortTh label="🟣 Own Gateway" k="ownGatewayAmount" />
                <SortTh label="🟡 Cash" k="cashAmount" />
                <SortTh label="Total" k="totalCollected" />
                <SortTh label="Txns" k="transactionCount" />
                <th style={{ padding: '0.9rem 1rem', borderBottom: '2px solid var(--border)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', minWidth: 130 }}>Split</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(college => (
                <tr
                  key={college._id}
                  style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '1rem' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-color)' }}>{college.name}</p>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>@{college.code.toLowerCase()}</p>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                      padding: '0.25rem 0.7rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                      background: college.paymentType === 'CENTRALIZED' ? 'rgba(34,197,94,0.1)' : 'rgba(99,102,241,0.1)',
                      color: college.paymentType === 'CENTRALIZED' ? '#16a34a' : '#6366f1'
                    }}>
                      {college.paymentType === 'CENTRALIZED'
                        ? <><Globe size={11} /> Central</>
                        : <><Landmark size={11} /> Own GW</>}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#16a34a' }}>{fmt(college.platformAmount)}</p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{college.platformCount} txns</p>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#6366f1' }}>{fmt(college.ownGatewayAmount)}</p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{college.ownGatewayCount} txns</p>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#d97706' }}>{fmt(college.cashAmount)}</p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{college.cashCount} txns</p>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)' }}>{fmt(college.totalCollected)}</p>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-color)', fontWeight: 600 }}>{college.transactionCount}</td>
                  <td style={{ padding: '1rem', minWidth: 140 }}>
                    <SplitBar
                      platformAmount={college.platformAmount}
                      ownGatewayAmount={college.ownGatewayAmount}
                      cashAmount={college.cashAmount}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                      {college.totalCollected > 0 ? (
                        <>
                          {college.platformAmount > 0 && <span style={{ color: '#16a34a' }}>{Math.round((college.platformAmount / college.totalCollected) * 100)}%P</span>}
                          {college.ownGatewayAmount > 0 && <span style={{ color: '#6366f1' }}>{Math.round((college.ownGatewayAmount / college.totalCollected) * 100)}%G</span>}
                          {college.cashAmount > 0 && <span style={{ color: '#d97706' }}>{Math.round((college.cashAmount / college.totalCollected) * 100)}%C</span>}
                        </>
                      ) : <span>No txns</span>}
                    </div>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No payment data found.</td>
                </tr>
              )}
              {sorted.length > 0 && (
                <tr style={{ background: 'rgba(248,116,16,0.05)', borderTop: '2px solid var(--border)' }}>
                  <td colSpan={2} style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary)' }}>
                    GRAND TOTAL ({data.summary.totalColleges} Colleges)
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#16a34a' }}>{fmt(data.summary.grandPlatform)}</td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#6366f1' }}>{fmt(data.summary.grandOwnGateway)}</td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#d97706' }}>{fmt(data.summary.grandCash)}</td>
                  <td style={{ padding: '1rem', fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>{fmt(data.summary.grandTotal)}</td>
                  <td colSpan={2} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </NeoCard>
    </div>
  );
};

export default BillingOverview;

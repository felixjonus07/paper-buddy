import React, { useState, useEffect } from 'react';
import NeoCard from '../UI/NeoCard';
import NeoButton from '../UI/NeoButton';
import { IndianRupee, CheckCircle, Clock } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';

const FinanceManagement = () => {
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const { showAlert } = useAlert();

  const fetchLedger = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/finance/ledger', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch ledger');
      const data = await res.json();
      setLedger(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const confirmSettlement = async (id) => {
    try {
      setConfirmingId(id);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/finance/settlements/${id}/confirm`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to confirm settlement');
      
      // Refresh ledger
      await fetchLedger();
    } catch (err) {
      showAlert(err.message);
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-light)', padding: '2rem' }}>Loading finance data...</div>;
  if (error) return <div style={{ color: 'var(--danger)' }}>Error: {error}</div>;
  if (!ledger) return null;

  return (
    <div style={{ padding: '1rem 0' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text-color)' }}>Finance & Ledger</h2>

      <div className="stats-grid-small" style={{ marginBottom: '2rem' }}>
        <NeoCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', backgroundColor: 'var(--clay-base)', borderRadius: '16px', color: 'var(--primary)', boxShadow: 'inset 2px 2px 5px rgba(255, 255, 255, 0.5), inset -3px -3px 7px rgba(0, 0, 0, 0.05)' }}>
              <IndianRupee size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Total Online Collected (Platform)</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>₹{ledger.totalOnlineCollected.toLocaleString()}</h3>
            </div>
          </div>
        </NeoCard>

        <NeoCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', backgroundColor: 'var(--clay-base)', borderRadius: '16px', color: '#22c55e', boxShadow: 'inset 2px 2px 5px rgba(255, 255, 255, 0.5), inset -3px -3px 7px rgba(0, 0, 0, 0.05)' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Total Settled (Received)</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>₹{ledger.totalSettled.toLocaleString()}</h3>
            </div>
          </div>
        </NeoCard>

        <NeoCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', backgroundColor: 'var(--clay-base)', borderRadius: '16px', color: '#f59e0b', boxShadow: 'inset 2px 2px 5px rgba(255, 255, 255, 0.5), inset -3px -3px 7px rgba(0, 0, 0, 0.05)' }}>
              <Clock size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Balance Outstanding</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>₹{ledger.balanceOwed.toLocaleString()}</h3>
            </div>
          </div>
        </NeoCard>
      </div>

      <NeoCard>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-color)' }}>Settlement History</h3>
        
        {ledger.settlements.length === 0 ? (
          <p style={{ color: 'var(--text-light)', padding: '2rem 0', textAlign: 'center' }}>No settlements found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-light)' }}>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Date</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Amount</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Reference</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '1rem', fontWeight: 500, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {ledger.settlements.map(s => (
                  <tr key={s._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', color: 'var(--text-color)' }}>
                      {new Date(s.initiatedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-color)', fontWeight: 600 }}>
                      ₹{s.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-light)' }}>
                      {s.reference || '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        backgroundColor: s.status === 'COMPLETED' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                        color: s.status === 'COMPLETED' ? '#22c55e' : '#f59e0b'
                      }}>
                        {s.status === 'COMPLETED' ? 'Settled' : 'Pending Confirmation'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {s.status === 'PENDING_ADMIN_CONFIRMATION' && (
                        <NeoButton 
                          variant="primary" 
                          onClick={() => confirmSettlement(s._id)}
                          disabled={confirmingId === s._id}
                        >
                          {confirmingId === s._id ? 'Confirming...' : 'Confirm Receipt'}
                        </NeoButton>
                      )}
                      {s.status === 'COMPLETED' && (
                        <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                          Confirmed on {new Date(s.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </NeoCard>
    </div>
  );
};

export default FinanceManagement;

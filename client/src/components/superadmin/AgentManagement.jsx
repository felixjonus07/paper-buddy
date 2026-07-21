import React, { useState, useEffect } from 'react';
import { Bot, ToggleLeft, ToggleRight, RefreshCw, TrendingUp, MessageSquare, Shield, ShieldOff, Zap } from 'lucide-react';
import NeoCard from '../UI/NeoCard';
import NeoButton from '../UI/NeoButton';

const AgentManagement = ({ token }) => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/superadmin/colleges', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setColleges(await res.json());
    } catch {
      showNotif('Failed to load colleges', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [token]);

  const toggleAI = async (college) => {
    setToggling(college._id);
    try {
      const newAccess = !college.aiAccess;
      const res = await fetch(`/api/superadmin/colleges/${college._id}/ai-access`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ aiAccess: newAccess })
      });
      if (res.ok) {
        setColleges(prev => prev.map(c => c._id === college._id ? { ...c, aiAccess: newAccess } : c));
        showNotif(`AI access ${newAccess ? 'enabled' : 'disabled'} for ${college.name}`, newAccess ? 'success' : 'warning');
      } else {
        showNotif('Failed to update AI access', 'error');
      }
    } catch {
      showNotif('Network error', 'error');
    } finally {
      setToggling(null);
    }
  };

  const resetPrompts = async (college) => {
    if (!window.confirm(`Reset prompt count for ${college.name}?`)) return;
    setResetting(college._id);
    try {
      const res = await fetch(`/api/superadmin/colleges/${college._id}/reset-prompts`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setColleges(prev => prev.map(c => c._id === college._id ? { ...c, promptCount: 0 } : c));
        showNotif('Prompt count reset', 'success');
      }
    } catch {
      showNotif('Failed to reset', 'error');
    } finally {
      setResetting(null);
    }
  };

  const totalPrompts = colleges.reduce((sum, c) => sum + (c.promptCount || 0), 0);
  const totalTokens = colleges.reduce((sum, c) => sum + (c.tokenCount || 0), 0);
  const aiEnabledCount = colleges.filter(c => c.aiAccess !== false).length;

  return (
    <div>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .toggle-btn {
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          background: none;
          border: none;
          padding: 0;
          display: flex;
          align-items: center;
        }
        .toggle-btn:hover { transform: scale(1.15); }
        .toggle-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .college-row {
          display: grid;
          grid-template-columns: 1fr 80px 110px 120px 110px;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-radius: 16px;
          background: var(--clay-base);
          box-shadow: var(--clay-outer);
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .college-row:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        @media (max-width: 700px) {
          .college-row { grid-template-columns: 1fr 80px; }
          .college-row .hide-mobile { display: none; }
        }
      `}</style>

      {/* Toast */}
      {notification && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 99999,
          background: notification.type === 'success'
            ? 'linear-gradient(135deg,#22c55e,#16a34a)'
            : notification.type === 'warning'
            ? 'linear-gradient(135deg,#f59e0b,#d97706)'
            : 'linear-gradient(135deg,#ef4444,#dc2626)',
          color: 'white', padding: '0.85rem 1.5rem', borderRadius: '14px',
          fontWeight: 700, fontSize: '0.9rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          animation: 'toastSlideIn 0.3s ease-out',
          maxWidth: '320px'
        }}>
          {notification.msg}
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <NeoCard style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(248,116,16,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} color="var(--primary)" />
            </div>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total AI Prompts</p>
          <h2 style={{ margin: '0.25rem 0 0', color: 'var(--primary)', fontSize: '2.5rem' }}>{totalPrompts.toLocaleString()}</h2>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Across all tenants</p>
        </NeoCard>
        <NeoCard style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(234,179,8,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={24} color="#eab308" />
            </div>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Tokens Used</p>
          <h2 style={{ margin: '0.25rem 0 0', color: '#eab308', fontSize: '2.5rem' }}>{totalTokens.toLocaleString()}</h2>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>LLM token consumption</p>
        </NeoCard>
        <NeoCard style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={24} color="#22c55e" />
            </div>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>AI Enabled Colleges</p>
          <h2 style={{ margin: '0.25rem 0 0', color: '#22c55e', fontSize: '2.5rem' }}>{aiEnabledCount}</h2>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>of {colleges.length} total</p>
        </NeoCard>
        <NeoCard style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldOff size={24} color="#ef4444" />
            </div>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>AI Disabled Colleges</p>
          <h2 style={{ margin: '0.25rem 0 0', color: '#ef4444', fontSize: '2.5rem' }}>{colleges.length - aiEnabledCount}</h2>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Access blocked</p>
        </NeoCard>
      </div>

      {/* Table header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={20} color="var(--primary)" /> Per-College Usage
        </h3>
        <NeoButton variant="secondary" onClick={fetchColleges} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={15} /> Refresh
        </NeoButton>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>Loading college data…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Column labels */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 80px 110px 120px 120px 110px',
            gap: '1rem',
            padding: '0.5rem 1.5rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            <span>College</span>
            <span className="hide-mobile">Code</span>
            <span className="hide-mobile">Prompts</span>
            <span className="hide-mobile">Tokens Used</span>
            <span className="hide-mobile">AI Status</span>
            <span>Toggle AI</span>
          </div>

          {colleges.map(college => (
            <div key={college._id} className="college-row" style={{ gridTemplateColumns: '1fr 80px 110px 120px 120px 110px' }}>
              {/* Name */}
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-color)' }}>{college.name}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@{college.code.toLowerCase()}</p>
              </div>

              {/* Code */}
              <span className="hide-mobile" style={{ fontFamily: 'monospace', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {college.code}
              </span>

              {/* Prompt count */}
              <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: (college.promptCount || 0) > 1000 ? '#f59e0b' : 'var(--text-color)'
                }}>
                  {(college.promptCount || 0).toLocaleString()}
                </span>
              </div>

              {/* Token count */}
              <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={13} color="#eab308" style={{ flexShrink: 0 }} />
                <span style={{
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: (college.tokenCount || 0) > 50000 ? '#ef4444' : (college.tokenCount || 0) > 10000 ? '#f59e0b' : 'var(--text-color)'
                }}>
                  {(college.tokenCount || 0).toLocaleString()}
                </span>
                <button
                  onClick={() => resetPrompts(college)}
                  disabled={resetting === college._id || ((college.promptCount || 0) === 0 && (college.tokenCount || 0) === 0)}
                  title="Reset counts"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-secondary)', padding: '2px',
                    opacity: ((college.promptCount || 0) === 0 && (college.tokenCount || 0) === 0) ? 0.3 : 0.7,
                    transition: 'all 0.2s',
                  }}
                >
                  <RefreshCw size={13} />
                </button>
              </div>

              {/* Status badge */}
              <div className="hide-mobile">
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  background: college.aiAccess !== false
                    ? 'rgba(34,197,94,0.12)'
                    : 'rgba(239,68,68,0.12)',
                  color: college.aiAccess !== false ? '#22c55e' : '#ef4444'
                }}>
                  {college.aiAccess !== false
                    ? <><Shield size={12} /> Enabled</>
                    : <><ShieldOff size={12} /> Disabled</>}
                </span>
              </div>

              {/* Toggle button */}
              <button
                className="toggle-btn"
                onClick={() => toggleAI(college)}
                disabled={toggling === college._id}
                title={college.aiAccess !== false ? 'Click to disable AI' : 'Click to enable AI'}
              >
                {college.aiAccess !== false
                  ? <ToggleRight size={38} color="#22c55e" />
                  : <ToggleLeft size={38} color="#ef4444" />}
              </button>
            </div>
          ))}

          {colleges.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <Bot size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No colleges found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentManagement;

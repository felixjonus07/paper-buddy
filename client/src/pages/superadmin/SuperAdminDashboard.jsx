import React, { useState, useEffect } from 'react';
import NeoCard from '../../components/UI/NeoCard';
import NeoButton from '../../components/UI/NeoButton';
import NeoInput from '../../components/UI/NeoInput';
import ThemeToggle from '../../components/UI/ThemeToggle';
import { Building, Users, Activity, Settings, Database, Plus, CheckCircle, XCircle } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Create College State
  const [newCollege, setNewCollege] = useState({ name: '', code: '', address: '', subscriptionStatus: 'active' });
  const [newAdmin, setNewAdmin] = useState({ collegeId: '', name: '', username: '', password: '' });

  const token = localStorage.getItem('token');

  const fetchGlobalData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, collegesRes, logsRes] = await Promise.all([
        fetch('/api/superadmin/analytics', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/superadmin/colleges', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/superadmin/audit-logs', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (collegesRes.ok) setColleges(await collegesRes.json());
      if (logsRes.ok) setAuditLogs(await logsRes.json());
    } catch (err) {
      setError('Failed to fetch global data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, [token]);

  const handleCreateCollege = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/superadmin/colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newCollege)
      });
      if (res.ok) {
        alert('College Created Successfully');
        setNewCollege({ name: '', code: '', address: '', subscriptionStatus: 'active' });
        fetchGlobalData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to create college');
      }
    } catch (err) {
      alert('Error creating college');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/superadmin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newAdmin)
      });
      if (res.ok) {
        alert('Admin Created Successfully');
        setNewAdmin({ collegeId: '', name: '', username: '', password: '' });
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to create admin');
      }
    } catch (err) {
      alert('Error creating admin');
    }
  };

  const toggleSubscription = async (collegeId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/superadmin/colleges/${collegeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subscriptionStatus: newStatus })
      });
      if (res.ok) fetchGlobalData();
    } catch (err) {
      alert('Error updating subscription');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading SuperAdmin Data...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary)' }}>EduFin Nexus (Super Admin)</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ThemeToggle />
          <NeoButton onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}>Logout</NeoButton>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <NeoButton variant={activeTab === 'analytics' ? 'primary' : 'secondary'} onClick={() => setActiveTab('analytics')}>
          <Activity size={18} style={{ marginRight: '0.5rem' }} /> Global Analytics
        </NeoButton>
        <NeoButton variant={activeTab === 'colleges' ? 'primary' : 'secondary'} onClick={() => setActiveTab('colleges')}>
          <Building size={18} style={{ marginRight: '0.5rem' }} /> Manage Colleges
        </NeoButton>
        <NeoButton variant={activeTab === 'admins' ? 'primary' : 'secondary'} onClick={() => setActiveTab('admins')}>
          <Users size={18} style={{ marginRight: '0.5rem' }} /> Manage Admins
        </NeoButton>
        <NeoButton variant={activeTab === 'logs' ? 'primary' : 'secondary'} onClick={() => setActiveTab('logs')}>
          <Database size={18} style={{ marginRight: '0.5rem' }} /> Audit Logs
        </NeoButton>
      </div>

      {activeTab === 'analytics' && analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <NeoCard>
            <h3 style={{ color: 'var(--text-secondary)' }}>Total Colleges</h3>
            <h1 style={{ fontSize: '3rem', color: 'var(--primary)' }}>{analytics.totalColleges}</h1>
            <p style={{ color: 'var(--success)' }}>{analytics.activeSubscriptions} Active Subscriptions</p>
          </NeoCard>
          <NeoCard>
            <h3 style={{ color: 'var(--text-secondary)' }}>Total Students</h3>
            <h1 style={{ fontSize: '3rem', color: 'var(--primary)' }}>{analytics.totalStudents}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Across all tenants</p>
          </NeoCard>
          <NeoCard>
            <h3 style={{ color: 'var(--text-secondary)' }}>Total Processed Volume</h3>
            <h1 style={{ fontSize: '3rem', color: 'var(--primary)' }}>₹{analytics.totalRevenueProcessed.toLocaleString()}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Global Revenue Ledger</p>
          </NeoCard>
        </div>
      )}

      {activeTab === 'colleges' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <NeoCard>
            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus /> Add New College</h2>
            <form onSubmit={handleCreateCollege} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <NeoInput name="name" placeholder="College Name" value={newCollege.name} onChange={e => setNewCollege({...newCollege, name: e.target.value})} required />
              <NeoInput name="code" placeholder="Unique Code (e.g., MIT01)" value={newCollege.code} onChange={e => setNewCollege({...newCollege, code: e.target.value})} required />
              <NeoInput name="address" placeholder="Address" value={newCollege.address} onChange={e => setNewCollege({...newCollege, address: e.target.value})} required />
              <NeoButton type="submit">Create Tenant</NeoButton>
            </form>
          </NeoCard>

          <NeoCard>
            <h2 style={{ marginBottom: '1rem' }}>Active Tenants ({colleges.length})</h2>
            <div className="table-responsive">
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '1rem' }}>Code</th>
                    <th style={{ padding: '1rem' }}>Name</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem' }}>Joined</th>
                    <th style={{ padding: '1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {colleges.map(col => (
                    <tr key={col._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>{col.code}</td>
                      <td style={{ padding: '1rem' }}>{col.name}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '20px', 
                          fontSize: '0.85rem',
                          backgroundColor: col.subscriptionStatus === 'active' ? 'var(--success)' : 'var(--error)',
                          color: 'white'
                        }}>
                          {col.subscriptionStatus.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>{new Date(col.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <NeoButton 
                          variant="primary" 
                          size="small" 
                          onClick={() => navigate(`/superadmin/colleges/${col._id}`)}
                        >
                          View Dashboard
                        </NeoButton>
                        <NeoButton 
                          variant="secondary" 
                          size="small" 
                          onClick={() => toggleSubscription(col._id, col.subscriptionStatus)}
                        >
                          Toggle Status
                        </NeoButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </NeoCard>
        </div>
      )}

      {activeTab === 'admins' && (
        <NeoCard>
          <h2 style={{ marginBottom: '1rem' }}>Provision College Admin</h2>
          <form onSubmit={handleCreateAdmin} style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
            <select 
              className="neo-input"
              value={newAdmin.collegeId} 
              onChange={e => setNewAdmin({...newAdmin, collegeId: e.target.value})}
              required
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)' }}
            >
              <option value="">Select College</option>
              {colleges.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
            </select>
            <NeoInput name="name" placeholder="Admin Full Name" value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} required />
            <NeoInput name="username" placeholder="Admin Login ID" value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} required />
            <NeoInput type="password" name="password" placeholder="Temporary Password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} required />
            <NeoButton type="submit">Create Admin Account</NeoButton>
          </form>
        </NeoCard>
      )}

      {activeTab === 'logs' && (
        <NeoCard>
          <h2 style={{ marginBottom: '1rem' }}>System Audit Ledger</h2>
          <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Timestamp</th>
                  <th style={{ padding: '1rem' }}>Action</th>
                  <th style={{ padding: '1rem' }}>Details</th>
                  <th style={{ padding: '1rem' }}>Actor</th>
                  <th style={{ padding: '1rem' }}>Tenant Context</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>{log.action}</td>
                    <td style={{ padding: '1rem' }}>{log.details}</td>
                    <td style={{ padding: '1rem' }}>{log.performedBy?.name || 'System'}</td>
                    <td style={{ padding: '1rem' }}>
                      {log.collegeId ? (
                        <span style={{ padding: '0.2rem 0.5rem', backgroundColor: 'var(--surface-hover)', borderRadius: '4px', fontSize: '0.85rem' }}>
                          {log.collegeId.name}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Global</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NeoCard>
      )}

    </div>
  );
};

export default SuperAdminDashboard;

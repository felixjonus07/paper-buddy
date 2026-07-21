import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, AlertTriangle, CheckCircle, Lock } from 'lucide-react';

// Use relative path so Vite proxy handles it — no hardcoded localhost
const API_BASE = '/api';
const getToken = () => localStorage.getItem('token');

// ─── Reusable field styles ─────────────────────────────────────────────────────
const fieldStyle = {
  padding: '0.7rem 1rem',
  borderRadius: '12px',
  border: '1px solid rgba(128,128,128,0.15)',
  background: 'rgba(128,128,128,0.08)',
  color: 'var(--text-color)',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  outline: 'none',
  width: '100%',
  backdropFilter: 'blur(10px)'
};

const labelStyle = {
  display: 'flex', flexDirection: 'column', gap: '0.35rem'
};

const labelTextStyle = {
  fontSize: '0.75rem', fontWeight: 700,
  color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em'
};

// ─── Action Popup ──────────────────────────────────────────────────────────────
// A versatile popup that renders different forms depending on `intent`
const ActionPopup = ({ isOpen, onClose, intent, data, onConfirm, loading }) => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [fees, setFees] = useState([]);
  const [loans, setLoans] = useState([]);
  const [feeRequests, setFeeRequests] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);

  const [form, setForm] = useState({});

  // Pre-fill form with AI-extracted data
  useEffect(() => {
    if (isOpen && data) {
      setForm({ ...data });
    } else if (isOpen) {
      setForm({});
    }
  }, [isOpen, data, intent]);

  // Fetch needed metadata based on intent
  useEffect(() => {
    if (!isOpen) return;
    const token = getToken();
    const h = { 'Authorization': `Bearer ${token}` };

    const needs = {
      ADD_FEE_TO_GROUP: ['groups', 'feeTypes'],
      ADD_FEE_TO_USER: ['users', 'feeTypes'],
      CREATE_GROUP: [],
      ASSIGN_STUDENT_TO_GROUP: ['users', 'groups'],
      ASSIGN_SUBGROUP: ['groups'],
      CREATE_FEE_TYPE: [],
      CREATE_SCHOLARSHIP: ['feeTypes'],
      DELETE_FEE: ['fees'],
      APPROVE_LOAN: ['loans'],
      APPROVE_FEE_REQUEST: ['feeRequests'],
      UPDATE_USER_SCHOLARSHIP: ['users', 'scholarships']
    };

    const toFetch = needs[intent] || [];
    if (toFetch.length === 0) return;

    setFetchLoading(true);
    const requests = {
      groups: () => fetch(`${API_BASE}/admin/groups`, { headers: h }).then(r => r.ok ? r.json() : []),
      users: () => fetch(`${API_BASE}/admin/users`, { headers: h }).then(r => r.ok ? r.json() : []),
      feeTypes: () => fetch(`${API_BASE}/admin/fee-types`, { headers: h }).then(r => r.ok ? r.json() : []),
      scholarships: () => fetch(`${API_BASE}/admin/scholarships`, { headers: h }).then(r => r.ok ? r.json() : []),
      fees: () => fetch(`${API_BASE}/admin/fees`, { headers: h }).then(r => r.ok ? r.json() : []),
      loans: () => fetch(`${API_BASE}/admin/loans`, { headers: h }).then(r => r.ok ? r.json() : []),
      feeRequests: () => fetch(`${API_BASE}/admin/fee-requests`, { headers: h }).then(r => r.ok ? r.json() : [])
    };

    Promise.all(toFetch.map(k => requests[k]().then(d => [k, d])))
      .then(results => {
        let fetchedGroups = null;
        results.forEach(([k, d]) => {
          if (k === 'groups') { setGroups(d); fetchedGroups = d; }
          if (k === 'users') setUsers(d);
          if (k === 'feeTypes') setFeeTypes(d);
          if (k === 'scholarships') setScholarships(d);
          if (k === 'fees') setFees(d);
          if (k === 'loans') setLoans(d);
          if (k === 'feeRequests') setFeeRequests(d);
        });

        // For ASSIGN_SUBGROUP: auto-select child/parent IDs from AI-extracted names
        if (intent === 'ASSIGN_SUBGROUP' && fetchedGroups) {
          setForm(prev => {
            const updates = {};
            if (prev.childGroupName && !prev.childId) {
              const match = fetchedGroups.find(g =>
                g.name.toLowerCase().includes(prev.childGroupName.toLowerCase())
              );
              if (match) updates.childId = match._id;
            }
            if (prev.parentGroupName && !prev.parentId) {
              const match = fetchedGroups.find(g =>
                g.name.toLowerCase().includes(prev.parentGroupName.toLowerCase())
              );
              if (match) updates.parentId = match._id;
            }
            return { ...prev, ...updates };
          });
        }
      })
      .finally(() => setFetchLoading(false));
  }, [isOpen, intent]);

  if (!isOpen || !intent) return null;

  const setF = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // ── Per-intent form content ──
  const renderForm = () => {
    switch (intent) {
      case 'BULK_CREATE_USERS':
        return (
          <>
            <div style={{
              background: 'rgba(248,116,16,0.07)',
              border: '1px solid rgba(248,116,16,0.2)',
              borderRadius: '12px', padding: '0.75rem 1rem',
              fontSize: '0.82rem', color: 'var(--text-light)', lineHeight: 1.6, marginBottom: '0.25rem'
            }}>
              📋 Username pattern: <strong style={{color:'var(--text-color)'}}>{form.prefix || 'PREFIX'}{'{001}'}{form.suffix || ''}</strong> → <strong style={{color:'var(--text-color)'}}>{form.prefix || 'PREFIX'}{'{NNN}'}{form.suffix || ''}</strong>
            </div>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Prefix (letters/numbers before counter)</span>
              <input value={form.prefix || ''} onChange={e => setF('prefix', e.target.value)} placeholder="e.g. 711524BAD" style={fieldStyle} />
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <label style={{ ...labelStyle, flex: 1 }}>
                <span style={labelTextStyle}>Start Number</span>
                <input type="number" value={form.startRange || ''} onChange={e => setF('startRange', e.target.value)} placeholder="e.g. 1" style={fieldStyle} />
              </label>
              <label style={{ ...labelStyle, flex: 1 }}>
                <span style={labelTextStyle}>End Number</span>
                <input type="number" value={form.endRange || ''} onChange={e => setF('endRange', e.target.value)} placeholder="e.g. 10" style={fieldStyle} />
              </label>
            </div>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Suffix (optional, after counter)</span>
              <input value={form.suffix || ''} onChange={e => setF('suffix', e.target.value)} placeholder="e.g. 2025 (optional)" style={fieldStyle} />
            </label>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Initial Password</span>
              <input type="password" value={form.initialPassword || ''} onChange={e => setF('initialPassword', e.target.value)} placeholder="Password for all new users" style={fieldStyle} />
            </label>
            {form.startRange && form.endRange && (
              <div style={{
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: '10px', padding: '0.6rem 1rem',
                fontSize: '0.82rem', color: 'var(--text-light)'
              }}>
                ✅ Will create <strong style={{color:'#22c55e'}}>{Number(form.endRange) - Number(form.startRange) + 1} users</strong>
              </div>
            )}
          </>
        );

      case 'ADD_FEE_TO_GROUP':
      case 'ADD_FEE_TO_USER':
        return (
          <>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Fee Title</span>
              <input value={form.title || ''} onChange={e => setF('title', e.target.value)} placeholder="e.g. Tuition Fee" style={fieldStyle} />
            </label>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Amount (₹)</span>
              <input type="number" value={form.amount || ''} onChange={e => setF('amount', e.target.value)} placeholder="e.g. 5000" style={fieldStyle} />
            </label>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Fee Type</span>
              <select value={form.feeTypeId || ''} onChange={e => setF('feeTypeId', e.target.value)} style={fieldStyle}>
                <option value="">Select Fee Type...</option>
                {feeTypes.map(ft => <option key={ft._id} value={ft._id}>{ft.name}</option>)}
              </select>
            </label>
            {intent === 'ADD_FEE_TO_GROUP' ? (
              <label style={labelStyle}>
                <span style={labelTextStyle}>Target Group</span>
                <select value={form.groupId || ''} onChange={e => setF('groupId', e.target.value)} style={fieldStyle}>
                  <option value="">Choose a group...</option>
                  {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                </select>
              </label>
            ) : (
              <label style={labelStyle}>
                <span style={labelTextStyle}>Target Student</span>
                <select value={form.userId || ''} onChange={e => setF('userId', e.target.value)} style={fieldStyle}>
                  <option value="">Choose a student...</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.username})</option>)}
                </select>
              </label>
            )}
          </>
        );

      case 'CREATE_GROUP':
        return (
          <>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Group Name</span>
              <input value={form.name || ''} onChange={e => setF('name', e.target.value)} placeholder="e.g. CS-A 2025" style={fieldStyle} />
            </label>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Description (optional)</span>
              <input value={form.description || ''} onChange={e => setF('description', e.target.value)} placeholder="Optional description" style={fieldStyle} />
            </label>
          </>
        );

      case 'ASSIGN_STUDENT_TO_GROUP':
        return (
          <>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Student</span>
              <select value={form.userId || ''} onChange={e => setF('userId', e.target.value)} style={fieldStyle}>
                <option value="">Choose a student...</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.username})</option>)}
              </select>
            </label>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Group</span>
              <select value={form.groupId || ''} onChange={e => setF('groupId', e.target.value)} style={fieldStyle}>
                <option value="">Choose a group...</option>
                {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
              </select>
            </label>
          </>
        );

      case 'ASSIGN_SUBGROUP':
        return (
          <>
            <div style={{
              background: 'rgba(248,116,16,0.07)',
              border: '1px solid rgba(248,116,16,0.2)',
              borderRadius: '12px', padding: '0.75rem 1rem',
              fontSize: '0.82rem', color: 'var(--text-light)', lineHeight: 1.6
            }}>
              🔗 <strong style={{color:'var(--text-color)'}}>{form.childGroupName || 'Child Group'}</strong> will be placed under <strong style={{color:'var(--text-color)'}}>{form.parentGroupName || 'Parent Group'}</strong>
            </div>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Child Group (to be nested)</span>
              <select value={form.childId || ''} onChange={e => setF('childId', e.target.value)} style={fieldStyle}>
                <option value="">Choose child group...</option>
                {groups.map(g => (
                  <option key={g._id} value={g._id} selected={form.childGroupName && g.name.toLowerCase().includes(form.childGroupName.toLowerCase())}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Parent Group</span>
              <select value={form.parentId || ''} onChange={e => setF('parentId', e.target.value)} style={fieldStyle}>
                <option value="">Choose parent group...</option>
                {groups.map(g => (
                  <option key={g._id} value={g._id} selected={form.parentGroupName && g.name.toLowerCase().includes(form.parentGroupName.toLowerCase())}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>
          </>
        );

      case 'CREATE_FEE_TYPE':
        return (
          <>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Fee Type Name</span>
              <input value={form.name || ''} onChange={e => setF('name', e.target.value)} placeholder="e.g. Tuition" style={fieldStyle} />
            </label>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Description (optional)</span>
              <input value={form.description || ''} onChange={e => setF('description', e.target.value)} placeholder="Optional description" style={fieldStyle} />
            </label>
          </>
        );

      case 'CREATE_SCHOLARSHIP':
        return (
          <>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Scholarship Name</span>
              <input value={form.name || ''} onChange={e => setF('name', e.target.value)} placeholder="e.g. Merit Scholarship" style={fieldStyle} />
            </label>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Discount %</span>
              <input type="number" value={form.discountPercentage || ''} onChange={e => setF('discountPercentage', e.target.value)} placeholder="e.g. 20" style={fieldStyle} />
            </label>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Min Academic Score</span>
              <input type="number" value={form.minAcademicScore || ''} onChange={e => setF('minAcademicScore', e.target.value)} placeholder="e.g. 80" style={fieldStyle} />
            </label>
          </>
        );

      case 'DELETE_FEE':
        return (
          <label style={labelStyle}>
            <span style={labelTextStyle}>Select Fee to Delete</span>
            <select value={form.feeId || ''} onChange={e => setF('feeId', e.target.value)} style={fieldStyle}>
              <option value="">Choose a fee...</option>
              {fees.map(f => (
                <option key={f._id} value={f._id}>
                  {f.title} — ₹{f.amount}
                </option>
              ))}
            </select>
          </label>
        );

      case 'APPROVE_LOAN':
        return (
          <>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Select Loan</span>
              <select value={form.loanId || ''} onChange={e => setF('loanId', e.target.value)} style={fieldStyle}>
                <option value="">Choose a loan...</option>
                {loans.map(l => (
                  <option key={l._id} value={l._id}>
                    {l.user?.name || l.user?.username} — ₹{l.amount} ({l.status})
                  </option>
                ))}
              </select>
            </label>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Action</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['approved', 'rejected'].map(s => (
                  <button key={s} onClick={() => setF('status', s)} style={{
                    flex: 1, padding: '0.6rem', borderRadius: '12px', border: 'none',
                    cursor: 'pointer', fontWeight: 700,
                    background: form.status === s
                      ? s === 'approved' ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#ef4444,#dc2626)'
                      : 'rgba(128,128,128,0.1)',
                    color: form.status === s ? 'white' : 'var(--text-light)',
                    transition: 'all 0.2s ease'
                  }}>
                    {s === 'approved' ? '✅ Approve' : '❌ Reject'}
                  </button>
                ))}
              </div>
            </label>
          </>
        );

      case 'APPROVE_FEE_REQUEST':
        return (
          <>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Select Fee Request</span>
              <select value={form.requestId || ''} onChange={e => setF('requestId', e.target.value)} style={fieldStyle}>
                <option value="">Choose a request...</option>
                {feeRequests.map(r => (
                  <option key={r._id} value={r._id}>
                    {r.studentId?.name || r.studentId?.username} — {r.feeType?.name} ({r.status})
                  </option>
                ))}
              </select>
            </label>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Decision</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['approved', 'rejected'].map(s => (
                  <button key={s} onClick={() => setF('status', s)} style={{
                    flex: 1, padding: '0.6rem', borderRadius: '12px', border: 'none',
                    cursor: 'pointer', fontWeight: 700,
                    background: form.status === s
                      ? s === 'approved' ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#ef4444,#dc2626)'
                      : 'rgba(128,128,128,0.1)',
                    color: form.status === s ? 'white' : 'var(--text-light)',
                    transition: 'all 0.2s ease'
                  }}>
                    {s === 'approved' ? '✅ Approve' : '❌ Reject'}
                  </button>
                ))}
              </div>
            </label>
          </>
        );

      case 'UPDATE_USER_SCHOLARSHIP':
        return (
          <>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Student</span>
              <select value={form.userId || ''} onChange={e => setF('userId', e.target.value)} style={fieldStyle}>
                <option value="">Choose a student...</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.username})</option>)}
              </select>
            </label>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Scholarship</span>
              <select value={form.scholarshipId || ''} onChange={e => setF('scholarshipId', e.target.value)} style={fieldStyle}>
                <option value="">Choose a scholarship...</option>
                {scholarships.map(s => <option key={s._id} value={s._id}>{s.name} ({s.discountPercentage}%)</option>)}
              </select>
            </label>
          </>
        );

      default:
        return <p style={{ color: 'var(--text-light)', textAlign: 'center' }}>No action required.</p>;
    }
  };

  const intentTitles = {
    BULK_CREATE_USERS: '👤 Bulk Create Users',
    ADD_FEE_TO_GROUP: '➕ Add Fee to Group',
    ADD_FEE_TO_USER: '➕ Add Fee to Student',
    CREATE_GROUP: '👥 Create Group',
    ASSIGN_STUDENT_TO_GROUP: '📋 Assign Student to Group',
    ASSIGN_SUBGROUP: '🔗 Assign Subgroup / Set Parent',
    CREATE_FEE_TYPE: '🏷️ Create Fee Type',
    CREATE_SCHOLARSHIP: '🎓 Create Scholarship',
    DELETE_FEE: '🗑️ Delete Fee',
    APPROVE_LOAN: '🏦 Manage Loan',
    APPROVE_FEE_REQUEST: '📝 Manage Fee Request',
    UPDATE_USER_SCHOLARSHIP: '🎓 Assign Scholarship to Student'
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg-color)',
        border: '1px solid rgba(248,116,16,0.25)',
        borderRadius: '24px',
        padding: '2rem',
        width: '100%', maxWidth: '460px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
        animation: 'popupIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #f87410, #ea580c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <AlertTriangle size={20} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>
              {intentTitles[intent] || 'Confirm Action'}
            </h2>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-light)' }}>
              Review and confirm the details before submitting
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
            <X size={20} />
          </button>
        </div>

        {fetchLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem 0' }}>Loading data...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {renderForm()}

            {/* Declaration notice */}
            <div style={{
              background: 'rgba(248,116,16,0.08)',
              border: '1px solid rgba(248,116,16,0.2)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              fontSize: '0.82rem',
              color: 'var(--text-light)',
              lineHeight: '1.5'
            }}>
              ⚠️ By confirming, you authorize this action to be applied to the database.
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button onClick={onClose} style={{
                flex: 1, padding: '0.85rem', borderRadius: '14px', border: 'none',
                background: 'rgba(128,128,128,0.1)', cursor: 'pointer', fontWeight: 700,
                color: 'var(--text-light)', transition: 'all 0.2s ease'
              }}>
                Cancel
              </button>
              <button
                onClick={() => onConfirm(form)}
                disabled={loading}
                style={{
                  flex: 2, padding: '0.85rem', borderRadius: '14px', border: 'none',
                  background: 'linear-gradient(135deg, #f87410, #ea580c)',
                  color: 'white', fontWeight: 700, cursor: loading ? 'default' : 'pointer',
                  boxShadow: '0 4px 20px rgba(248,116,16,0.4)',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
              >
                <CheckCircle size={16} />
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Action Executor ───────────────────────────────────────────────────────────
// Maps each intent to its API call
const executeAction = async (intent, form) => {
  const token = getToken();
  const h = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  switch (intent) {
    case 'BULK_CREATE_USERS':
      return fetch(`${API_BASE}/admin/bulk-users`, {
        method: 'POST', headers: h,
        body: JSON.stringify({
          prefix: form.prefix,
          startRange: Number(form.startRange),
          endRange: Number(form.endRange),
          suffix: form.suffix || '',
          initialPassword: form.initialPassword
        })
      });

    case 'ADD_FEE_TO_GROUP':
      return fetch(`${API_BASE}/admin/fees/group`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ title: form.title, amount: Number(form.amount), feeType: form.feeTypeId, groupId: form.groupId })
      });

    case 'ADD_FEE_TO_USER':
      return fetch(`${API_BASE}/admin/fees/user`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ title: form.title, amount: Number(form.amount), feeType: form.feeTypeId, userId: form.userId })
      });

    case 'CREATE_GROUP':
      return fetch(`${API_BASE}/admin/groups`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ name: form.name, description: form.description })
      });

    case 'ASSIGN_STUDENT_TO_GROUP':
      return fetch(`${API_BASE}/admin/users/assign-group`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ userId: form.userId, groupId: form.groupId })
      });

    case 'ASSIGN_SUBGROUP':
      return fetch(`${API_BASE}/admin/groups/assign-subgroup`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ parentId: form.parentId, childId: form.childId })
      });

    case 'CREATE_FEE_TYPE':
      return fetch(`${API_BASE}/admin/fee-types`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ name: form.name, description: form.description })
      });

    case 'CREATE_SCHOLARSHIP':
      return fetch(`${API_BASE}/admin/scholarships`, {
        method: 'POST', headers: h,
        body: JSON.stringify({
          name: form.name,
          discountPercentage: Number(form.discountPercentage),
          minAcademicScore: Number(form.minAcademicScore)
        })
      });

    case 'DELETE_FEE':
      return fetch(`${API_BASE}/admin/fees/${form.feeId}`, {
        method: 'DELETE', headers: h
      });

    case 'APPROVE_LOAN':
      return fetch(`${API_BASE}/admin/loans/status`, {
        method: 'PUT', headers: h,
        body: JSON.stringify({ loanId: form.loanId, status: form.status })
      });

    case 'APPROVE_FEE_REQUEST':
      return fetch(`${API_BASE}/admin/fee-requests/${form.requestId}`, {
        method: 'PUT', headers: h,
        body: JSON.stringify({ status: form.status })
      });

    case 'UPDATE_USER_SCHOLARSHIP':
      return fetch(`${API_BASE}/admin/users/${form.userId}`, {
        method: 'PUT', headers: h,
        body: JSON.stringify({ scholarship: form.scholarshipId })
      });

    default:
      throw new Error('Unknown intent');
  }
};

// ─── Success messages per intent ───────────────────────────────────────────────
const successMessages = {
  BULK_CREATE_USERS: (f) => `✅ Bulk user creation done! Users **${f.prefix}${String(f.startRange).padStart(3,'0')}** to **${f.prefix}${String(f.endRange).padStart(3,'0')}** have been created.`,
  ADD_FEE_TO_GROUP: (f) => `✅ **${f.title}** fee of ₹${Number(f.amount).toLocaleString()} has been added to the group.`,
  ADD_FEE_TO_USER: (f) => `✅ **${f.title}** fee of ₹${Number(f.amount).toLocaleString()} has been assigned to the student.`,
  CREATE_GROUP: (f) => `✅ Group **"${f.name}"** has been created successfully.`,
  ASSIGN_STUDENT_TO_GROUP: () => `✅ Student has been assigned to the group successfully.`,
  ASSIGN_SUBGROUP: (f) => `✅ Group has been set as a subgroup. **${f.childGroupName || 'Child group'}** is now under **${f.parentGroupName || 'Parent group'}**.`,
  CREATE_FEE_TYPE: (f) => `✅ Fee type **"${f.name}"** has been created.`,
  CREATE_SCHOLARSHIP: (f) => `✅ Scholarship **"${f.name}"** with ${f.discountPercentage}% discount has been created.`,
  DELETE_FEE: () => `✅ The selected fee has been deleted successfully.`,
  APPROVE_LOAN: (f) => `✅ Loan has been **${f.status}** successfully.`,
  APPROVE_FEE_REQUEST: (f) => `✅ Fee request has been **${f.status}** successfully.`,
  UPDATE_USER_SCHOLARSHIP: () => `✅ Scholarship has been assigned to the student successfully.`
};

// ─── Main ChatBot Widget ───────────────────────────────────────────────────────
const ChatBot = () => {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Hi! I\'m EduFin AI. I can help you manage fees, groups, scholarships, loans, and more.\n\nTry saying:\n• "Add tuition fee of ₹5000 to a group"\n• "Create a new group"\n• "Approve a loan"\n• "Assign scholarship to student"' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [activeIntent, setActiveIntent] = useState(null);
  const [intentData, setIntentData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const contextMessages = newMessages.slice(-10).filter(m => m.role !== 'system');
      const res = await fetch(`${API_BASE}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ messages: contextMessages })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${data.message}` }]);
        return;
      }

      if (data.intent === 'PAYMENT_RESTRICTED') {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message,
          isRestricted: true
        }]);
      } else if (data.intent && data.intent !== 'CHAT') {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message, isAction: true }]);
        setActiveIntent(data.intent);
        setIntentData(data.data || {});
        setPopupOpen(true);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Could not connect to server. Please make sure the backend is running.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (form) => {
    setActionLoading(true);
    try {
      const res = await executeAction(activeIntent, form);
      const data = await res.json();

      if (res.ok) {
        setPopupOpen(false);
        const successMsg = successMessages[activeIntent]?.(form) || '✅ Action completed successfully.';
        setMessages(prev => [...prev, { role: 'assistant', content: successMsg }]);
        showNotification('Action completed successfully!', 'success');
      } else {
        showNotification(data.message || 'Action failed. Please try again.', 'error');
      }
    } catch {
      showNotification('Connection error. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes popupIn {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes chatSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bubblePop {
          from { opacity: 0; transform: translateY(8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 8px 25px rgba(248,116,16,0.5); }
          50% { box-shadow: 0 8px 35px rgba(248,116,16,0.8), 0 0 0 12px rgba(248,116,16,0.1); }
        }
        @keyframes typingDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .chatbot-input:focus { border-color: rgba(248,116,16,0.5) !important; }
        .send-btn:hover:not(:disabled) { transform: scale(1.08); }
        .send-btn:active:not(:disabled) { transform: scale(0.95); }
        .chat-msg { animation: bubblePop 0.25s ease-out forwards; }
      `}</style>

      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 99999,
          background: notification.type === 'success'
            ? 'linear-gradient(135deg, #22c55e, #16a34a)'
            : 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white', padding: '0.85rem 1.5rem', borderRadius: '14px',
          fontWeight: 700, fontSize: '0.9rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          animation: 'toastIn 0.3s ease-out',
          maxWidth: '300px'
        }}>
          {notification.msg}
        </div>
      )}

      {/* Action Popup */}
      <ActionPopup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        intent={activeIntent}
        data={intentData}
        onConfirm={handleConfirm}
        loading={actionLoading}
      />

      {/* Chat Window */}
      {open && (
        <div className="chatbot-sidebar" style={{
          position: 'sticky', top: '1.25rem',
          margin: '1.25rem 1.25rem 1.25rem 0',
          height: 'calc(100vh - 2.5rem)',
          width: '340px',
          background: 'rgba(12, 12, 24, 0.15)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '28px',
          boxShadow: '0 0 0 1px rgba(248,116,16,0.08), 0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'chatSlideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          flexShrink: 0
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(248,116,16,0.12), rgba(234,88,12,0.06))',
            borderBottom: '1px solid rgba(248,116,16,0.15)',
            display: 'flex', alignItems: 'center', gap: '0.75rem'
          }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #f87410, #ea580c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(248,116,16,0.4)', flexShrink: 0
            }}>
              <Bot size={20} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-color)' }}>EduFin AI</div>
              <div style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: 6, height: 6, background: '#22c55e', borderRadius: '50%', display: 'inline-block' }} />
                Online
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-light)', padding: '4px', borderRadius: '8px'
            }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.map((msg, i) => (
              <div key={i} className="chat-msg" style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end', gap: '0.5rem'
              }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                    background: msg.isRestricted
                      ? 'linear-gradient(135deg,#6366f1,#4f46e5)'
                      : 'linear-gradient(135deg, #f87410, #ea580c)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {msg.isRestricted ? <Lock size={13} color="white" /> : <Bot size={14} color="white" />}
                  </div>
                )}
                <div style={{
                  maxWidth: '78%',
                  padding: '0.6rem 0.9rem',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #f87410, #ea580c)'
                    : msg.isRestricted
                      ? 'rgba(99,102,241,0.1)'
                      : msg.isAction
                        ? 'rgba(248,116,16,0.1)'
                        : 'rgba(128,128,128,0.08)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-color)',
                  fontSize: '0.87rem',
                  lineHeight: '1.55',
                  fontWeight: 600,
                  border: msg.isRestricted
                    ? '1px solid rgba(99,102,241,0.25)'
                    : msg.isAction ? '1px solid rgba(248,116,16,0.2)' : 'none',
                  boxShadow: msg.role === 'user'
                    ? '0 4px 12px rgba(248,116,16,0.3)'
                    : '0 2px 6px rgba(0,0,0,0.06)',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                    background: 'rgba(128,128,128,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <User size={14} color="var(--text-light)" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f87410, #ea580c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Bot size={14} color="white" />
                </div>
                <div style={{
                  padding: '0.7rem 1rem', borderRadius: '18px 18px 18px 4px',
                  background: 'rgba(128,128,128,0.08)',
                  display: 'flex', gap: '4px', alignItems: 'center'
                }}>
                  {[0, 1, 2].map(d => (
                    <span key={d} style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#f87410', display: 'inline-block',
                      animation: `typingDot 1.2s ease-in-out ${d * 0.2}s infinite`
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '0.75rem 1rem',
            borderTop: '1px solid rgba(128,128,128,0.1)',
            display: 'flex', gap: '0.5rem', alignItems: 'center'
          }}>
            <input
              ref={inputRef}
              className="chatbot-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask me anything..."
              style={{
                flex: 1, padding: '0.7rem 1rem', borderRadius: '14px',
                border: '1px solid rgba(128,128,128,0.15)',
                background: 'rgba(128,128,128,0.06)',
                color: 'var(--text-color)', fontSize: '0.9rem', fontFamily: 'inherit',
                outline: 'none', transition: 'border-color 0.2s ease'
              }}
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                width: '42px', height: '42px', borderRadius: '14px', border: 'none',
                background: !input.trim() || loading
                  ? 'rgba(128,128,128,0.1)'
                  : 'linear-gradient(135deg, #f87410, #ea580c)',
                color: !input.trim() || loading ? 'var(--text-light)' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: !input.trim() || loading ? 'default' : 'pointer',
                boxShadow: !input.trim() || loading ? 'none' : '0 4px 12px rgba(248,116,16,0.4)',
                transition: 'all 0.2s ease', flexShrink: 0
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* FAB (Only visible when chatbot is closed) */}
      {!open && (
        <button
          className="chatbot-sidebar"
          onClick={() => setOpen(true)}
          title="Open EduFin AI"
          style={{
            position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9998,
            width: '56px', height: '56px', borderRadius: '18px', border: 'none',
            background: 'linear-gradient(135deg, #f87410, #ea580c)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            animation: 'pulse 2.5s ease-in-out infinite',
            boxShadow: '0 8px 32px rgba(248,116,16,0.4)',
            transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)'
          }}
        >
          <MessageCircle size={24} />
        </button>
      )}
    </>
  );
};

export default ChatBot;

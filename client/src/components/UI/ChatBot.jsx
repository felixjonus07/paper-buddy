import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, User, AlertTriangle, CheckCircle, Lock } from 'lucide-react';

// Use relative path so Vite proxy handles it - no hardcoded localhost
const API_BASE = '/api';
const getToken = () => localStorage.getItem('token');
const getUserRole = () => {
  const t = getToken();
  if (!t) return 'student';
  try { return JSON.parse(atob(t.split('.')[1])).role || 'student'; } catch { return 'student'; }
};

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
const ActionPopup = ({ isOpen, onClose, intent, data, onConfirm, loading, error, currentStep, totalSteps }) => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [fees, setFees] = useState([]);
  const [loans, setLoans] = useState([]);
  const [feeRequests, setFeeRequests] = useState([]);
  const [colleges, setColleges] = useState([]);
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
      UPDATE_USER_SCHOLARSHIP: ['users', 'scholarships'],
      CREATE_FEE_REQUEST: ['userFeeTypes'],
      DELETE_GROUP: ['groups']
    };

    const toFetch = needs[intent] || [];
    if (toFetch.length === 0 && intent !== 'TOGGLE_AI_ACCESS' && intent !== 'CREATE_COLLEGE_ADMIN' && intent !== 'EDIT_PROFILE') return;

    setFetchLoading(true);
    const requests = {
      groups: () => fetch(`${API_BASE}/admin/groups`, { headers: h }).then(r => r.ok ? r.json() : []),
      users: () => fetch(`${API_BASE}/admin/users`, { headers: h }).then(r => r.ok ? r.json() : []),
      feeTypes: () => fetch(`${API_BASE}/admin/fee-types`, { headers: h }).then(r => r.ok ? r.json() : []),
      scholarships: () => fetch(`${API_BASE}/admin/scholarships`, { headers: h }).then(r => r.ok ? r.json() : []),
      fees: () => fetch(`${API_BASE}/admin/fees`, { headers: h }).then(r => r.ok ? r.json() : []),
      loans: () => fetch(`${API_BASE}/admin/loans`, { headers: h }).then(r => r.ok ? r.json() : []),
      feeRequests: () => fetch(`${API_BASE}/admin/fee-requests`, { headers: h }).then(r => r.ok ? r.json() : []),
      userFeeTypes: () => fetch(`${API_BASE}/user/fee-types`, { headers: h }).then(r => r.ok ? r.json() : [])
    };

    Promise.all(toFetch.map(k => requests[k]().then(d => [k, d])))
      .then(async results => {
        let fetchedGroups = null;
        let fetchedUsers = null;
        results.forEach(([k, d]) => {
          if (k === 'groups') { setGroups(d); fetchedGroups = d; }
          if (k === 'users') { setUsers(d); fetchedUsers = d; }
          if (k === 'feeTypes') setFeeTypes(d);
          if (k === 'scholarships') { setScholarships(d); }
          if (k === 'fees') setFees(d);
          if (k === 'loans') setLoans(d);
          if (k === 'feeRequests') setFeeRequests(d);
          if (k === 'userFeeTypes') setFeeTypes(d);
        });

        if (intent === 'TOGGLE_AI_ACCESS' || intent === 'CREATE_COLLEGE_ADMIN') {
          const colRes = await fetch(`${API_BASE}/superadmin/colleges`, { headers: { Authorization: `Bearer ${getToken()}` } });
          if (colRes.ok) {
            const cols = await colRes.json();
            setColleges(cols);
            setForm(prev => {
              if (prev.collegeQuery && !prev.collegeId) {
                const match = cols.find(c =>
                  c.name.toLowerCase().includes(prev.collegeQuery.toLowerCase()) ||
                  c.code.toLowerCase().includes(prev.collegeQuery.toLowerCase())
                );
                if (match) return { ...prev, collegeId: match._id };
              }
              return prev;
            });
          }
        }

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
        
        // General auto-select for groupName -> groupId
        if (fetchedGroups) {
          setForm(prev => {
            if (prev.groupName && !prev.groupId) {
              const match = fetchedGroups.find(g =>
                g.name.toLowerCase().includes(prev.groupName.toLowerCase())
              );
              if (match) return { ...prev, groupId: match._id };
            }
            return prev;
          });
        }

        // General auto-select for studentName -> userId
        if (fetchedUsers) {
          setForm(prev => {
            if (prev.studentName && !prev.userId && fetchedUsers.length > 0) {
              const match = fetchedUsers.find(u =>
                u.name.toLowerCase().includes(prev.studentName.toLowerCase()) || 
                u.username.toLowerCase().includes(prev.studentName.toLowerCase())
              );
              if (match) return { ...prev, userId: match._id };
            }
            return prev;
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
              Username pattern: <strong style={{ color: 'var(--text-color)' }}>{form.prefix || 'PREFIX'}{'{001}'}{form.suffix || ''}</strong> → <strong style={{ color: 'var(--text-color)' }}>{form.prefix || 'PREFIX'}{'{NNN}'}{form.suffix || ''}</strong>
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
                ✅ Will create <strong style={{ color: '#22c55e' }}>{Number(form.endRange) - Number(form.startRange) + 1} users</strong>
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

      case 'DELETE_GROUP':
        return (
          <>
            <div style={{
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '12px', padding: '0.75rem 1rem',
              fontSize: '0.82rem', color: 'var(--text-light)', lineHeight: 1.6, marginBottom: '0.5rem'
            }}>
              ⚠️ <strong style={{ color: '#ef4444' }}>Warning:</strong> Deleting a group cannot be undone.
            </div>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Group to Delete</span>
              <select value={form.groupId || ''} onChange={e => setF('groupId', e.target.value)} style={fieldStyle}>
                <option value="">Choose a group...</option>
                {groups.map(g => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
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
              🔗 <strong style={{ color: 'var(--text-color)' }}>{form.childGroupName || 'Child Group'}</strong> will be placed under <strong style={{ color: 'var(--text-color)' }}>{form.parentGroupName || 'Parent Group'}</strong>
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
                  {f.title} - ₹{f.amount}
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
                    {l.user?.name || l.user?.username} - ₹{l.amount} ({l.status})
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
                    {r.studentId?.name || r.studentId?.username} - {r.feeType?.name} ({r.status})
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

      case 'TOGGLE_AI_ACCESS':
        return (
          <>
            <label style={labelStyle}>
              <span style={labelTextStyle}>College</span>
              <select value={form.collegeId || ''} onChange={e => setF('collegeId', e.target.value)} style={fieldStyle}>
                <option value="">Choose a college...</option>
                {colleges.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
              </select>
            </label>
            <label style={labelStyle}>
              <span style={labelTextStyle}>AI Access Action</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['enable', 'disable'].map(s => (
                  <button key={s} onClick={() => setF('action', s)} style={{
                    flex: 1, padding: '0.6rem', borderRadius: '12px', border: 'none',
                    cursor: 'pointer', fontWeight: 700,
                    background: form.action === s
                      ? s === 'enable' ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#ef4444,#dc2626)'
                      : 'rgba(128,128,128,0.1)',
                    color: form.action === s ? 'white' : 'var(--text-light)',
                    transition: 'all 0.2s ease'
                  }}>
                    {s === 'enable' ? '✅ Enable' : '❌ Disable'}
                  </button>
                ))}
              </div>
            </label>
          </>
        );

      case 'CREATE_COLLEGE_ADMIN':
        return (
          <>
            <div style={{
              background: 'rgba(248,116,16,0.07)',
              border: '1px solid rgba(248,116,16,0.2)',
              borderRadius: '8px', padding: '12px', marginBottom: '16px'
            }}>
              <h4 style={{ margin: '0 0 8px', color: '#fff', fontSize: '14px' }}>Create College Admin</h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                Create a new admin account for a college.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <select value={form.collegeId || ''} onChange={e => setF('collegeId', e.target.value)} style={fieldStyle}>
                <option value="">Choose a college...</option>
                {colleges.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
              </select>
              <input type="text" placeholder="Admin Full Name" value={form.name || ''} onChange={e => setF('name', e.target.value)} style={fieldStyle} />
              <input type="text" placeholder="Username" value={form.username || ''} onChange={e => setF('username', e.target.value)} style={fieldStyle} />
              <input type="password" placeholder="Password" value={form.password || ''} onChange={e => setF('password', e.target.value)} style={fieldStyle} />
            </div>
          </>
        );

      case 'CREATE_COLLEGE':
        return (
          <>
            <div style={{
              background: 'rgba(248,116,16,0.07)',
              border: '1px solid rgba(248,116,16,0.2)',
              borderRadius: '8px', padding: '12px', marginBottom: '16px'
            }}>
              <h4 style={{ margin: '0 0 8px', color: '#fff', fontSize: '14px' }}>Add New College</h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                Please review the new tenant details.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="College Name" value={form.name || ''} onChange={e => setF('name', e.target.value)} style={fieldStyle} />
              <input type="text" placeholder="Unique Code (e.g., MIT01)" value={form.code || ''} onChange={e => setF('code', e.target.value)} style={fieldStyle} />
              <input type="text" placeholder="Address" value={form.address || ''} onChange={e => setF('address', e.target.value)} style={fieldStyle} />
            </div>
          </>
        );

      case 'CREATE_FEE_REQUEST':
        return (
          <>
            <div style={{
              background: 'rgba(248,116,16,0.07)',
              border: '1px solid rgba(248,116,16,0.2)',
              borderRadius: '8px', padding: '12px', marginBottom: '16px'
            }}>
              <h4 style={{ margin: '0 0 8px', color: '#fff', fontSize: '14px' }}>Request Fee Waiver/Custom Fee</h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                Please review your fee request details.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Title (e.g. Medical Waiver)" value={form.requestedFeeTitle || ''} onChange={e => setF('requestedFeeTitle', e.target.value)} style={fieldStyle} />
              <input type="number" placeholder="Amount (₹)" value={form.amount || ''} onChange={e => setF('amount', e.target.value)} style={fieldStyle} />
              <textarea placeholder="Reason for request" value={form.reason || ''} onChange={e => setF('reason', e.target.value)} style={{ ...fieldStyle, minHeight: '80px', resize: 'vertical' }} />
              <select value={form.feeTypeId || ''} onChange={e => setF('feeTypeId', e.target.value)} style={fieldStyle}>
                <option value="">Select Category...</option>
                {feeTypes.map(ft => <option key={ft._id} value={ft._id}>{ft.name}</option>)}
              </select>
            </div>
          </>
        );

      case 'EDIT_PROFILE':
        return (
          <>
            <div style={{
              background: 'rgba(248,116,16,0.07)',
              border: '1px solid rgba(248,116,16,0.2)',
              borderRadius: '8px', padding: '12px', marginBottom: '16px'
            }}>
              <h4 style={{ margin: '0 0 8px', color: '#fff', fontSize: '14px' }}>Update Profile</h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                Update your contact information.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Phone Number" value={form.phoneNumber || ''} onChange={e => setF('phoneNumber', e.target.value)} style={fieldStyle} />
              <input type="email" placeholder="Personal Email" value={form.personalEmail || ''} onChange={e => setF('personalEmail', e.target.value)} style={fieldStyle} />
            </div>
          </>
        );

      default:
        return <p style={{ color: 'var(--text-light)', textAlign: 'center' }}>No action required.</p>;
    }
  };

  const intentTitles = {
    BULK_CREATE_USERS: 'Bulk Create Users',
    ADD_FEE_TO_GROUP: 'Add Fee to Group',
    ADD_FEE_TO_USER: 'Add Fee to Student',
    CREATE_GROUP: 'Create Group',
    ASSIGN_STUDENT_TO_GROUP: 'Assign Student to Group',
    ASSIGN_SUBGROUP: 'Assign Subgroup / Set Parent',
    CREATE_FEE_TYPE: 'Create Fee Type',
    CREATE_SCHOLARSHIP: 'Create Scholarship',
    DELETE_FEE: 'Delete Fee',
    APPROVE_LOAN: 'Approve/Reject Loan',
    APPROVE_FEE_REQUEST: 'Approve/Reject Fee Request',
    UPDATE_USER_SCHOLARSHIP: 'Assign Scholarship',
    TOGGLE_AI_ACCESS: 'Toggle AI Access',
    CREATE_COLLEGE_ADMIN: 'Create College Admin',
    CREATE_COLLEGE: 'Create New College',
    CREATE_FEE_REQUEST: 'Create Fee Request',
    EDIT_PROFILE: 'Edit Profile',
    DELETE_GROUP: 'Delete Group'
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--overlay-bg)',
      backdropFilter: 'blur(8px)',
      zIndex: 99990,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--clay-base)',
        backdropFilter: 'blur(30px) saturate(150%)',
        WebkitBackdropFilter: 'blur(30px) saturate(150%)',
        border: '1px solid rgba(248,116,16,0.25)',
        borderRadius: '24px',
        padding: '2rem',
        width: '100%', maxWidth: '460px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(248,116,16,0.25)',
        animation: 'popupIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #f87410, #ea580c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <MessageCircle size={20} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {intentTitles[intent] || 'Confirm Action'}
              {totalSteps > 1 && (
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(248,116,16,0.15)',
                  color: '#ea580c',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}>
                  Step {currentStep} of {totalSteps}
                </span>
              )}
            </h2>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-light)' }}>
              Review and confirm the details before submitting
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '12px', padding: '0.85rem 1rem',
            color: '#ef4444', fontSize: '0.85rem', fontWeight: 500,
            marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            {error}
          </div>
        )}

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
              By confirming, you authorize this action to be applied to the database.
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

    case 'DELETE_GROUP':
      if (!form.groupId) throw new Error('Please select a group.');
      return fetch(`${API_BASE}/admin/groups/${form.groupId}`, {
        method: 'DELETE', headers: h
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

    case 'TOGGLE_AI_ACCESS':
      if (!form.collegeId) throw new Error('Please select a college from the dropdown.');
      if (!form.action) throw new Error('Please select whether to enable or disable AI access.');
      return fetch(`${API_BASE}/superadmin/colleges/${form.collegeId}/ai-access`, {
        method: 'PUT', headers: h,
        body: JSON.stringify({ aiAccess: form.action === 'enable' })
      });

    case 'CREATE_COLLEGE_ADMIN':
      if (!form.collegeId) throw new Error('Please select a college.');
      if (!form.name || !form.username || !form.password) throw new Error('Please fill all fields.');
      return fetch(`${API_BASE}/superadmin/admins`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ collegeId: form.collegeId, name: form.name, username: form.username, password: form.password })
      });

    case 'CREATE_COLLEGE':
      if (!form.name || !form.code || !form.address) throw new Error('Please fill all fields.');
      return fetch(`${API_BASE}/superadmin/colleges`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ name: form.name, code: form.code, address: form.address, subscriptionStatus: 'active' })
      });

    case 'CREATE_FEE_REQUEST':
      if (!form.requestedFeeTitle || !form.amount || !form.feeTypeId || !form.reason) throw new Error('Please fill all fields.');
      return fetch(`${API_BASE}/user/fee-requests`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ requestedFeeTitle: form.requestedFeeTitle, amount: Number(form.amount), feeType: form.feeTypeId, reason: form.reason })
      });

    case 'EDIT_PROFILE':
      return fetch(`${API_BASE}/user/profile`, {
        method: 'PUT', headers: h,
        body: JSON.stringify({ phoneNumber: form.phoneNumber, personalEmail: form.personalEmail })
      });

    default:
      throw new Error('Unknown intent');
  }
};

// ─── Success messages per intent ───────────────────────────────────────────────
const successMessages = {
  BULK_CREATE_USERS: (f) => `✅ Bulk user creation done! Users **${f.prefix}${String(f.startRange).padStart(3, '0')}** to **${f.prefix}${String(f.endRange).padStart(3, '0')}** have been created.`,
  ADD_FEE_TO_GROUP: (f) => `✅ **${f.title}** fee of ₹${Number(f.amount).toLocaleString()} has been added to the group.`,
  ADD_FEE_TO_USER: (f) => `✅ **${f.title}** fee of ₹${Number(f.amount).toLocaleString()} has been assigned to the student.`,
  CREATE_GROUP: (f) => `✅ Group **"${f.name}"** has been created successfully.`,
  ASSIGN_STUDENT_TO_GROUP: () => `✅ Student has been assigned to the group successfully.`,
  ASSIGN_SUBGROUP: (f) => `✅ Group has been set as a subgroup. **${f.childGroupName || 'Child group'}** is now under **${f.parentGroupName || 'Parent group'}**.`,
  CREATE_FEE_TYPE: (f) => `✅ Fee type **"${f.name}"** has been created.`,
  CREATE_SCHOLARSHIP: (f) => `✅ Scholarship **"${f.name}"** with ${f.discountPercentage}% discount has been created.`,
  DELETE_FEE: () => `✅ The selected fee has been deleted successfully.`,
  DELETE_GROUP: (f) => `✅ The group has been deleted successfully.`,
  CREATE_COLLEGE: (f) => `✅ College **"${f.name}"** (${f.code}) has been created successfully.`,
  APPROVE_LOAN: (f) => `✅ Loan has been **${f.status}**.`,
  APPROVE_FEE_REQUEST: (f) => `✅ Fee request has been **${f.status}**.`,
  UPDATE_USER_SCHOLARSHIP: () => `✅ Scholarship has been assigned to the student successfully.`,
  TOGGLE_AI_ACCESS: (f) => `✅ AI Access has been **${f.action}d** for the college.`,
  CREATE_FEE_REQUEST: () => `✅ Your fee request has been submitted and is pending approval.`,
  EDIT_PROFILE: () => `✅ Your profile has been updated successfully.`
};

// ─── Main ChatBot Widget ───────────────────────────────────────────────────────
const ChatBot = () => {
  const [open, setOpen] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const location = useLocation();

  const initialMessage = getUserRole() === 'admin' || getUserRole() === 'superadmin'
    ? ' Hi Im buddy agent integrated to do anything inside the website\n\nTry saying:\n• "Add tuition fee of ₹5000 to a group"\n• "Create a new group"\n• "Approve a loan"\n• "Assign scholarship to student"'
    : ' Hi Im buddy agent integrated to do anything inside the website';

  const [messages, setMessages] = useState([
    { role: 'assistant', content: initialMessage }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [activeActions, setActiveActions] = useState([]);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [notification, setNotification] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCheckingStatus(false);
      return;
    }
    fetch(`${API_BASE}/chatbot/status`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        setIsVisible(d.enabled);
        setCheckingStatus(false);
      })
      .catch(() => setCheckingStatus(false));
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
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.message}` }]);
        return;
      }

      if (data.actions && data.actions.length > 0) {
        if (data.actions[0].intent === 'PAYMENT_RESTRICTED') {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: data.message,
            isRestricted: true
          }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: data.message, isAction: true }]);
          setActiveActions(data.actions);
          setCurrentActionIndex(0);
          setPopupOpen(true);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Could not connect to server. Please make sure the backend is running.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (form) => {
    setActionLoading(true);
    const currentAction = activeActions[currentActionIndex];
    if (!currentAction) return;

    try {
      const res = await executeAction(currentAction.intent, form);
      const resData = await res.json();

      if (res.ok) {
        setActionError(null);
        const successMsg = successMessages[currentAction.intent]?.(form) || '✅ Action completed successfully.';
        setMessages(prev => [...prev, { role: 'assistant', content: successMsg }]);
        showNotification('Action completed successfully!', 'success');
        
        // Immediate UI synchronization by triggering a window event
        window.dispatchEvent(new Event('dashboard-sync-required'));

        // Handle sequential sub-calls
        if (currentActionIndex + 1 < activeActions.length) {
          setCurrentActionIndex(prev => prev + 1);
        } else {
          setPopupOpen(false);
          setActiveActions([]);
          setCurrentActionIndex(0);
          setActionError(null);
        }
      } else {
        setActionError(resData.message || 'Action failed. Please try again.');
      }
    } catch (err) {
      setActionError(err.message || 'Connection error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!getToken() || location.pathname === '/login') return null;
  if (checkingStatus) return null;
  if (!isVisible && getUserRole() !== 'superadmin') return null;

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
        .chatbot-window {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          height: 600px;
          max-height: 80vh;
          width: 360px;
          background: var(--clay-base);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 28px;
          box-shadow: 0 0 0 1px rgba(248,116,16,0.08), 0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          flex-shrink: 0;
          z-index: 900;
          animation: chatSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @media (max-width: 768px) {
          .chatbot-window {
            position: fixed;
            top: auto;
            bottom: 5.5rem;
            left: 1rem;
            right: 1rem;
            margin: 0 auto;
            width: calc(100vw - 2rem);
            height: 70vh;
            max-height: 70vh;
            border-radius: 24px;
          }
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
        onClose={() => {
          setPopupOpen(false);
          setActiveActions([]);
          setCurrentActionIndex(0);
          setActionError(null);
        }}
        intent={activeActions[currentActionIndex]?.intent}
        data={activeActions[currentActionIndex]?.data}
        onConfirm={handleConfirm}
        loading={actionLoading}
        error={actionError}
        currentStep={currentActionIndex + 1}
        totalSteps={activeActions.length}
      />

      {/* Chat Window */}
      {open && (
        <div className="chatbot-window">
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
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-color)' }}>Buddy</div>
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

      {/* FAB Container (Only visible when chatbot is closed) */}
      {!open && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 900, display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>

          <button
            className="chatbot-fab"
            onClick={() => setOpen(true)}
            title="Open Buddy"
            style={{
              width: '56px', height: '56px', borderRadius: '18px', border: 'none',
              background: 'linear-gradient(135deg, #f87410, #ea580c)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              animation: 'pulse 2.5s ease-in-out infinite',
              boxShadow: '0 8px 32px rgba(248,116,16,0.4)',
              transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              transform: 'translateZ(0)',
              willChange: 'transform, box-shadow',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
              flexShrink: 0
            }}
          >
            <Bot size={24} />
          </button>
        </div>
      )}
    </>
  );
};

export default ChatBot;

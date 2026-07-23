import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NeoButton from '../../components/UI/NeoButton';
import { LogOut, LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react';
import MentorGroups from '../../components/mentor/MentorGroups';

const MentorDashboard = () => {
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch('/api/mentor/groups', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setGroups(data);
      } catch (err) {
        console.error('Failed to fetch groups', err);
      }
    };
    fetchGroups();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--text-light)', position: 'relative', minHeight: '60px' }}>
          <div className="header-text">
            <h3 style={{ margin: 0, color: 'var(--text-color)' }}>Group Admin</h3>
          </div>
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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

        <div className="nav-item active">
          <LayoutDashboard size={20} />
          <span className="nav-text">My Groups</span>
        </div>

        <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
          <NeoButton variant="secondary" onClick={handleLogout} style={{ width: '100%', padding: '0.8rem', display: 'flex', justifyContent: 'center' }}>
            <LogOut size={18} /> {isSidebarOpen && 'Logout'}
          </NeoButton>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-color)' }}>Mentor Portal</h1>
            <p style={{ margin: 0, color: 'var(--text-light)' }}>Manage your assigned groups and students.</p>
          </div>
        </div>

        <div className="dashboard-scroll-area">
          <h2 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>My Assigned Groups</h2>
          <MentorGroups groups={groups} navigate={navigate} />
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;

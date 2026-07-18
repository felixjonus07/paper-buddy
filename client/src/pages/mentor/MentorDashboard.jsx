import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NeoCard from '../../components/UI/NeoCard';
import NeoButton from '../../components/UI/NeoButton';
import ThemeToggle from '../../components/UI/ThemeToggle';
import { LogOut, LayoutDashboard } from 'lucide-react';

const MentorDashboard = () => {
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Sidebar */}
      <div style={{
        width: '260px',
        backgroundColor: 'var(--clay-base)',
        borderRight: '1px solid var(--clay-border)',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--clay-outer)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 10
      }}>
        <div style={{ marginBottom: '3rem', padding: '0 0.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
            EduFin <span style={{ fontSize: '1rem', color: 'var(--text-light)', WebkitTextFillColor: 'initial', display: 'block', fontWeight: 500 }}>Mentor Portal</span>
          </h2>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <NeoButton 
            variant="primary" 
            style={{ width: '100%', justifyContent: 'flex-start', padding: '1rem 1.2rem', backgroundColor: 'var(--primary)', color: 'white' }}
          >
            <LayoutDashboard size={20} /> My Groups
          </NeoButton>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <ThemeToggle />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'rgba(128,128,128,0.1)', borderRadius: '15px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.name}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-light)' }}>Mentor</p>
            </div>
            <LogOut size={20} style={{ color: 'var(--clay-pink)', cursor: 'pointer' }} onClick={handleLogout} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>My Assigned Groups</h2>
        
        <div className="card-grid">
          {groups.map(g => (
            <NeoCard 
              key={g._id} 
              style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1.2rem', cursor: 'pointer' }} 
              onClick={() => navigate('/mentor/groups/' + g._id)}
            >
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{g.name}</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)', flex: 1 }}>{g.description || 'No description provided'}</p>
              
              {g.isGlobal && (
                <span style={{ 
                  fontSize: '0.8rem', color: 'var(--primary-dark)', display: 'inline-block', 
                  backgroundColor: 'var(--clay-peach-light)', 
                  padding: '0.2rem 0.5rem', borderRadius: '8px', alignSelf: 'flex-start', fontWeight: 'bold' 
                }}>
                  GLOBAL GROUP
                </span>
              )}
            </NeoCard>
          ))}
          {groups.length === 0 && <p style={{ color: 'var(--text-light)' }}>No groups assigned.</p>}
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;

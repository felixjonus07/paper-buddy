import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, LayoutDashboard, LogIn, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const GlobalNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  let user = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (e) {}

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={16} /> },
  ];

  if (token) {
    let dashboardPath = '/user/dashboard';
    if (user?.role === 'admin') dashboardPath = '/admin/dashboard';
    else if (user?.role === 'cashier') dashboardPath = '/cashier/dashboard';
    navLinks.push({ name: 'Dashboard', path: dashboardPath, icon: <LayoutDashboard size={16} /> });
  }

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 50,
      background: 'var(--clay-base)', // transparent base for glass effect
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 2rem',
      boxSizing: 'border-box'
    }}>
      
      {/* Left Group: Logo + Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
        {/* Logo Section */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--text-color)', textDecoration: 'none' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px var(--primary-glow)'
          }}>
            {/* simple icon or leave blank for color block */}
            <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '3px' }}></div>
          </div>
          <span style={{ fontWeight: '800', letterSpacing: '-0.5px' }}>EduFin</span>
        </Link>

        {/* Links Section */}
      </div>

      {/* Actions Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.name} 
                to={link.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? '600' : '500',
                  textDecoration: 'none',
                  color: isActive ? 'var(--primary)' : 'var(--text-light)',
                  transition: 'color 0.2s ease',
                }}
              >
                {/* {link.icon} */} {/* Hiding icons to match the minimalist SaaS look */}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
        
        {token ? (
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: 'white',
              background: 'var(--primary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <span>Log Out</span>
          </button>
        ) : (
          <>
            <Link 
              to="/login"
              style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                color: 'var(--text-light)',
                textDecoration: 'none',
              }}
            >
              Log In
            </Link>
            <Link 
              to="/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.5rem 1.25rem',
                borderRadius: '2rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: 'white',
                background: '#000000', // Dark pill like the screenshot
                textDecoration: 'none',
                transition: 'opacity 0.2s'
              }}
            >
              Get Started
            </Link>
          </>
        )}  
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default GlobalNavbar;

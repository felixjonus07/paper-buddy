import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const GlobalNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
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
    { name: 'Home', path: '/' },
    { name: 'Admission', path: '/admission' },
    { name: 'Contact', path: '/contact' }
  ];

  let dashboardPath = '/';
  if (token && user) {
    dashboardPath = '/user/dashboard';
    if (user.role === 'admin') dashboardPath = '/admin/dashboard';
    else if (user.role === 'cashier') dashboardPath = '/cashier/dashboard';
  }

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 50,
      background: 'var(--clay-base)',
      backdropFilter: 'blur(24px) saturate(150%)',
      WebkitBackdropFilter: 'blur(24px) saturate(150%)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 4rem',
      boxSizing: 'border-box'
    }}>
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        {/* Logo Section */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-color)', textDecoration: 'none' }}>
          <GraduationCap size={28} color="var(--primary)" strokeWidth={2.5} />
          <span style={{ fontWeight: '700', fontSize: '1.4rem', letterSpacing: '0.5px' }}>Paper Buddy</span>
        </Link>
      </div>

      {/* Center Links Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2.5rem',
      }}>
        {navLinks.map((link) => {
          return (
            <Link 
              key={link.name} 
              to={link.path}
              style={{
                fontSize: '0.95rem',
                fontWeight: '500',
                textDecoration: 'none',
                color: 'var(--text-color)',
                opacity: 0.8,
                transition: 'color 0.2s ease, opacity 0.2s ease',
              }}
              onMouseEnter={(e) => { e.target.style.opacity = 1; e.target.style.color = 'var(--primary)'; }}
              onMouseLeave={(e) => { e.target.style.opacity = 0.8; e.target.style.color = 'var(--text-color)'; }}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Actions Section */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end', gap: '1.5rem' }}>
        {token && user ? (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                userSelect: 'none',
                background: 'var(--clay-base)',
                backdropFilter: 'blur(30px) saturate(150%)',
                WebkitBackdropFilter: 'blur(30px) saturate(150%)',
                border: '1px solid var(--border)',
                borderRadius: '50px',
                padding: '0.3rem 1rem 0.3rem 0.3rem'
              }}
            >
              {/* Avatar as a link to dashboard */}
              <div 
                onClick={() => navigate(dashboardPath)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  border: '2px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 2px 5px rgba(242,92,5,0.3)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="Go to Dashboard"
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>

              {/* Name toggling dropdown */}
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span style={{ fontWeight: '700', color: 'var(--text-color)', fontSize: '0.95rem' }}>
                  {user.name || 'User'}
                </span>
                <ChevronDown size={16} color="var(--text-color)" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.7 }} />
              </div>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: '100%',
                background: 'var(--clay-base-solid)',
                backdropFilter: 'blur(30px) saturate(150%)',
                WebkitBackdropFilter: 'blur(30px) saturate(150%)',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                border: '1px solid rgba(128, 128, 128, 0.2)',
                overflow: 'hidden',
                zIndex: 100,
                animation: 'dropdownFadeIn 0.2s ease-out'
              }}>
                <div style={{ padding: '0.5rem' }}>
                  <div 
                    onClick={() => { setIsDropdownOpen(false); navigate(dashboardPath); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem',
                      cursor: 'pointer', borderRadius: '8px', color: 'var(--text-color)', fontWeight: '600',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--clay-base)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </div>
                  <div 
                    onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem',
                      cursor: 'pointer', borderRadius: '8px', color: '#ef4444', fontWeight: '600',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--clay-base)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={18} />
                    Logout
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link 
            to="/login"
            style={{
              background: 'var(--text-color)',
              color: 'var(--bg-color)',
              textDecoration: 'none',
              borderRadius: '50px',
              padding: '0.6rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Login
          </Link>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default GlobalNavbar;

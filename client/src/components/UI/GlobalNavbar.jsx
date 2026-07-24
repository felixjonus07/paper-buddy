import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, ChevronDown, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const GlobalNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
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
    <nav className="global-navbar">
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        {/* Logo Section */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-color)', textDecoration: 'none' }}>
          <GraduationCap size={28} color="var(--primary)" strokeWidth={2.5} />
          <span style={{ fontWeight: '700', fontSize: '1.4rem', letterSpacing: '0.5px' }}>Paper Buddy</span>
        </Link>
      </div>



      {/* Center Links Section */}
      <div className={`navbar-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {navLinks.map((link) => {
          return (
            <Link 
              key={link.name} 
              to={link.path}
              style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                textDecoration: 'none',
                color: 'var(--text-color)',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => { e.target.style.color = 'var(--primary)'; }}
              onMouseLeave={(e) => { e.target.style.color = 'var(--text-color)'; }}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Mobile Side Drawer Overlay */}
      <div 
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'visible' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)} 
      />

      {/* Mobile Side Drawer Content */}
      <div className={`mobile-menu-drawer ${isMobileMenuOpen ? 'visible' : ''}`}>
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          
          {/* Mobile User Profile Section */}
          {token && user && (
            <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(128,128,128,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                  fontWeight: 'bold', fontSize: '1.4rem'
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-color)' }}>{user.name || 'User'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>{user.role}</div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {navLinks.map(link => (
              <Link 
                key={link.name} 
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-color)', textDecoration: 'none' }}
              >
                {link.name}
              </Link>
            ))}
            {!token && (
              <Link 
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)', textDecoration: 'none', marginTop: '0.5rem' }}
              >
                Login
              </Link>
            )}

            {/* Dashboard and Logout below links */}
            {token && user && (
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.5rem', borderTop: '1px solid rgba(128,128,128,0.2)', paddingTop: '1.5rem', gap: '0.5rem' }}>
                <div 
                  onClick={() => { setIsMobileMenuOpen(false); navigate(dashboardPath); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem 0', color: 'var(--text-color)', fontWeight: '600', cursor: 'pointer' }}
                >
                  <LayoutDashboard size={20} /> Dashboard
                </div>
                <div 
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem 0', color: '#ef4444', fontWeight: '600', cursor: 'pointer' }}
                >
                  <LogOut size={20} /> Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="navbar-actions">
        {token && user ? (
          <div ref={dropdownRef} className="desktop-avatar" style={{ position: 'relative' }}>
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
                  flexShrink: 0,
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
                className="navbar-user-name"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span className="navbar-username-text" style={{ fontWeight: '700', color: 'var(--text-color)', fontSize: '0.95rem' }}>
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
                minWidth: '180px',
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
            className="desktop-login-btn"
            style={{
              background: 'var(--primary)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.8rem',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Login
          </Link>
        )}
        <ThemeToggle />
        
        {/* Hamburger button moved next to Theme Toggle for mobile */}
        <button 
          className="hamburger-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default GlobalNavbar;

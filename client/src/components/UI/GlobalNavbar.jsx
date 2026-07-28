import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, ChevronDown, LogOut, LayoutDashboard, Menu, X, User, Settings, Users, Layers, IndianRupee, FileText, PlusCircle, UserCog, TrendingUp, CreditCard, Scan, Building, Database, Bot, Download, Clock } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const GlobalNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

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

  let dashboardPath = '/';
  if (token && user) {
    const u = user.username || 'me';
    dashboardPath = `/user/${u}/dashboard`;
    if (user.role === 'superadmin') dashboardPath = `/superadmin/${u}/dashboard`;
    else if (user.role === 'admin') dashboardPath = `/admin/${u}/dashboard`;
    else if (user.role === 'cashier') dashboardPath = `/cashier/${u}/dashboard`;
    else if (user.role === 'mentor') dashboardPath = `/mentor/${u}/dashboard`;
  }

  const navLinks = [
    { name: 'Home', path: '/' },
  ];

  let dashboardTabs = [];
  if (token && user) {
    navLinks.push({ name: 'Dashboard', path: dashboardPath });
    const u = user.username || 'me';
    
    if (user.role === 'superadmin') {
      dashboardTabs = [
        { name: 'Analytics', path: `/superadmin/${u}/dashboard?tab=analytics`, icon: <LayoutDashboard size={18} /> },
        { name: 'Colleges', path: `/superadmin/${u}/dashboard?tab=colleges`, icon: <Building size={18} /> },
        { name: 'Admins', path: `/superadmin/${u}/dashboard?tab=admins`, icon: <Users size={18} /> },
        { name: 'Audit Logs', path: `/superadmin/${u}/dashboard?tab=logs`, icon: <Database size={18} /> },
        { name: 'Agent Mgmt', path: `/superadmin/${u}/dashboard?tab=agent`, icon: <Bot size={18} /> },
        { name: 'Payments', path: `/superadmin/${u}/dashboard?tab=billing`, icon: <CreditCard size={18} /> },
      ];
    } else if (user.role === 'admin') {
      dashboardTabs = [
        { name: 'Students', path: `/admin/${u}/dashboard?tab=users`, icon: <Users size={18} /> },
        { name: 'Groups', path: `/admin/${u}/dashboard?tab=groups`, icon: <Layers size={18} /> },
        { name: 'Finance', path: `/admin/${u}/dashboard?tab=finance`, icon: <IndianRupee size={18} /> },
        { name: 'Fees Mgmt', path: `/admin/${u}/dashboard?tab=fees`, icon: <FileText size={18} /> },
        { name: 'Fee Types', path: `/admin/${u}/dashboard?tab=fee_types`, icon: <Settings size={18} /> },
        { name: 'Fee Requests', path: `/admin/${u}/dashboard?tab=fee_requests`, icon: <PlusCircle size={18} /> },
        { name: 'Scholarships', path: `/admin/${u}/dashboard?tab=scholarships`, icon: <GraduationCap size={18} /> },
        { name: 'Cashiers', path: `/admin/${u}/dashboard?tab=cashiers`, icon: <UserCog size={18} /> },
        { name: 'Reports', path: `/admin/${u}/dashboard?tab=reports`, icon: <TrendingUp size={18} /> },
        { name: 'Gateway Settings', path: `/admin/${u}/dashboard?tab=payment_settings`, icon: <CreditCard size={18} /> }
      ];
    } else if (user.role === 'cashier') {
      dashboardTabs = [
        { name: 'Dashboard', path: `/cashier/${u}/dashboard?tab=dashboard`, icon: <LayoutDashboard size={18} /> },
        { name: 'Scan & Pay', path: `/cashier/${u}/dashboard?tab=scan`, icon: <Scan size={18} /> },
        { name: 'Transactions', path: `/cashier/${u}/dashboard?tab=transactions`, icon: <FileText size={18} /> },
        { name: 'Reports', path: `/cashier/${u}/dashboard?tab=reports`, icon: <TrendingUp size={18} /> }
      ];
    } else if (user.role === 'mentor') {
      dashboardTabs = [
        { name: 'Dashboard', path: `/mentor/${u}/dashboard?tab=my_groups`, icon: <LayoutDashboard size={18} /> }
      ];
    } else { // user
      dashboardTabs = [
        { name: 'Dashboard', path: `/user/${u}/dashboard?tab=dashboard`, icon: <LayoutDashboard size={18} /> },
        { name: 'Pay Fees', path: `/user/${u}/dashboard?tab=pay-fees`, icon: <IndianRupee size={18} /> },
        { name: 'Fee Requests', path: `/user/${u}/dashboard?tab=fee-requests`, icon: <PlusCircle size={18} /> },
        { name: 'Payment History', path: `/user/${u}/dashboard?tab=paid-fees`, icon: <FileText size={18} /> },
      ];
    }
  }

  return (
    <nav className="global-navbar">
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        {/* Logo Section */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-color)', textDecoration: 'none' }}>
          <img src="/images/Logo.png" alt="Paper Buddy Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: '2px' }}>
            <span style={{ fontWeight: 'bolder', fontSize: '1.4rem', letterSpacing: '0.5px', color: 'var(--primary)', lineHeight: '1', whiteSpace: 'nowrap' }}>Paper Buddy</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-light)', marginTop: '2px', whiteSpace: 'nowrap' }}>by E.D.I.T.H</span>
          </div>
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



      {/* Actions Section */}
      <div className="navbar-actions">
        {isInstallable && (
          <button
            className="desktop-app-install-btn"
            onClick={handleInstallClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            <Download size={16} />
            <span className="desktop-install-text">Download App</span>
          </button>
        )}
        
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
                        onClick={() => { setIsDropdownOpen(false); navigate(dashboardPath + '?tab=profile'); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem',
                          cursor: 'pointer', borderRadius: '8px', color: 'var(--text-color)', fontWeight: '600',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--clay-base)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <User size={18} />
                        Profile
                      </div>
                      <div style={{ height: '1px', background: 'rgba(128,128,128,0.2)', margin: '0.5rem 0' }} />
                      <div 
                        onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem',
                          cursor: 'pointer', borderRadius: '8px', color: '#ef4444', fontWeight: '600',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
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

      {/* Mobile Side Drawer Overlay */}
      <div 
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'visible' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)} 
      />

      {/* Mobile Side Drawer Content */}
      <div className={`mobile-menu-drawer ${isMobileMenuOpen ? 'visible' : ''}`}>
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', zIndex: 1010 }}
        >
          <X size={24} />
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem', position: 'relative', zIndex: 1005 }}>
          
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
            {isInstallable && (
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleInstallClick(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', 
                  background: 'var(--primary)', color: 'white', border: 'none', 
                  borderRadius: '12px', padding: '0.65rem 1rem', fontSize: '1rem', 
                  fontWeight: '700', cursor: 'pointer', justifyContent: 'center',
                  marginBottom: '0.5rem'
                }}
              >
                <Download size={18} />
                Download App
              </button>
            )}
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-light)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Explore
            </div>
            {(() => {
              const isHomeActive = location.pathname === '/';
              return (
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  fontSize: '1rem', fontWeight: isHomeActive ? '700' : '500', 
                  color: isHomeActive ? 'var(--primary)' : 'var(--text-color)', 
                  textDecoration: 'none', padding: '0.65rem 1rem', borderRadius: '12px',
                  background: isHomeActive ? 'var(--clay-primary-bg)' : 'transparent',
                  transition: 'all 0.2s ease'
                }}>
                  <LayoutDashboard size={18} />
                  Home
                </Link>
              );
            })()}

            {/* Dashboard Tabs for logged-in user */}
            {token && user && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '1rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-light)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Dashboard
                </div>
                {(dashboardTabs || []).map(tab => {
                  const isActive = location.pathname + location.search === tab.path;
                  return (
                    <Link 
                      key={tab.name} 
                      to={tab.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        fontSize: '1rem', fontWeight: isActive ? '700' : '500', 
                        color: isActive ? 'var(--primary)' : 'var(--text-color)', 
                        textDecoration: 'none',
                        padding: '0.65rem 1rem',
                        borderRadius: '12px',
                        background: isActive ? 'var(--clay-primary-bg)' : 'transparent',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {tab.icon}
                      {tab.name}
                    </Link>
                  );
                })}
              </div>
            )}
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
                      onClick={() => { setIsMobileMenuOpen(false); navigate(dashboardPath + '?tab=profile'); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem 0', color: 'var(--text-color)', fontWeight: '600', cursor: 'pointer' }}
                    >
                      <User size={20} /> Profile
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
    </nav>
  );
};

export default GlobalNavbar;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import NeoCard from '../components/UI/NeoCard';
import NeoInput from '../components/UI/NeoInput';
import NeoButton from '../components/UI/NeoButton';
import ThemeToggle from '../components/UI/ThemeToggle';
import { useAlert } from '../context/AlertContext';

const Login = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        const u = user.username || 'me';
        if (user.role === 'superadmin') navigate(`/superadmin/${u}/dashboard`);
        else if (user.role === 'admin') navigate(`/admin/${u}/dashboard`);
        else if (user.role === 'cashier') navigate(`/cashier/${u}/dashboard`);
        else if (user.role === 'mentor') navigate(`/mentor/${u}/dashboard`);
        else navigate(`/user/${u}/dashboard`);
      } catch (e) {}
    }
  }, [navigate]);

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', name: '', newPassword: '' });
  const [error, setError] = useState(null);
  const [needsReset, setNeedsReset] = useState(false);
  const [resetToken, setResetToken] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const executeLogin = async (payload, isLoginMode) => {
    const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server returned ${response.status}: ${text.substring(0, 50)}...`);
      }
      if (response.ok) {
        if (data.mustChangePassword) {
           setNeedsReset(true);
           setResetToken(data.token);
           return;
        }

        // Store token (in a real app, use Context/Redux)
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        
        // Redirect based on role
        const u = data.username || 'me';
        if (data.role === 'superadmin') {
          navigate(`/superadmin/${u}/dashboard`);
        } else if (data.role === 'admin') {
          navigate(`/admin/${u}/dashboard`);
        } else if (data.role === 'cashier') {
          navigate(`/cashier/${u}/dashboard`);
        } else if (data.role === 'mentor') {
          navigate(`/mentor/${u}/dashboard`);
        } else {
          navigate(`/user/${u}/dashboard`);
        }
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || 'Failed to connect to server. Ensure backend is running.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (needsReset) {
      // Handle Reset Password Flow
      try {
        const response = await fetch(`/api/auth/reset-password`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resetToken}`
          },
          body: JSON.stringify({ newPassword: formData.newPassword })
        });
        const data = await response.json();
        if (response.ok) {
           showAlert('Password reset successful! Please log in again.');
           setNeedsReset(false);
           setFormData({ ...formData, password: '', newPassword: '' });
           setResetToken(null);
        } else {
           setError(data.message);
        }
      } catch (err) {
        setError('Failed to connect to server.');
      }
      return;
    }

    if (!isLogin) {
      const nameRegex = /^[A-Za-z\s]+$/;
      const usernameRegex = /^[A-Za-z0-9_]+$/;
      
      if (!nameRegex.test(formData.name)) {
        return setError('Full name can only contain letters and spaces.');
      }
      if (!usernameRegex.test(formData.username)) {
        return setError('Username can only contain letters, numbers, and underscores.');
      }
    }

    const payload = isLogin ? { username: formData.username, password: formData.password } : formData;
    await executeLogin(payload, isLogin);
  };

  const handleAutoLogin = (u, p) => {
    setFormData({ ...formData, username: u, password: p });
    setError(null);
    executeLogin({ username: u, password: p }, true);
  };

  const demoBtnStyle = {
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem',
    borderRadius: '20px',
    border: '1px solid var(--primary)',
    background: 'var(--clay-base)',
    color: 'var(--primary)',
    cursor: 'pointer',
    zIndex: 2,
    position: 'relative'
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '90vh', position: 'relative', padding: '2rem', flex: '1 0 auto' }}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'stretch', width: '100%', maxWidth: '1200px', margin: 'auto' }}>
        
        {/* Login Form Card */}
        <NeoCard style={{ flex: '1 1 400px', maxWidth: '400px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>
          Welcome Back
        </h2>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {needsReset ? (
            <>
              <p style={{marginBottom: '1rem'}}>For security, you must reset your password.</p>
              <NeoInput 
                type="password" 
                name="newPassword" 
                placeholder="New Password (min 6 chars)" 
                icon={Lock}
                value={formData.newPassword}
                onChange={handleChange}
                required 
              />
              <NeoButton type="submit" style={{ width: '100%', marginTop: '1rem' }}>
                Reset Password
              </NeoButton>
            </>
          ) : (
            <>
              {!isLogin && (
                <NeoInput 
                  type="text" 
                  name="name" 
                  placeholder="Full Name" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              )}
              
              <NeoInput 
                type="text" 
                name="username" 
                placeholder="Username" 
                icon={User}
                value={formData.username}
                onChange={handleChange}
                required 
              />
              
              <NeoInput 
                type="password" 
                name="password" 
                placeholder="Password" 
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                required 
              />
              
              <NeoButton type="submit" style={{ width: '100%', marginTop: '1rem' }}>
                {isLogin ? 'Sign In' : 'Sign Up'}
              </NeoButton>
            </>
          )}
        </form>
        </NeoCard>
        
        {/* Quick Logins Card */}
        {isLogin && !needsReset && (
          <NeoCard style={{ flex: '1 1 500px', maxWidth: '600px' }}>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              
              {/* Left Column: Clickable Buttons */}
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                  Or click a button below to auto-login:
                </p>
                <NeoButton type="button" onClick={() => handleAutoLogin('superadmin', 'superadmin123')} style={{ width: '100%' }}>Super Admin (Paper Buddy)</NeoButton>
                <NeoButton type="button" onClick={() => handleAutoLogin('admin', 'admin123')} style={{ width: '100%' }}>Admin (Institution)</NeoButton>
                <NeoButton type="button" onClick={() => handleAutoLogin('cashier', 'cashier123')} style={{ width: '100%' }}>Cashier</NeoButton>
                <NeoButton type="button" onClick={() => handleAutoLogin('aids', 'aids123')} style={{ width: '100%' }}>Group Admin</NeoButton>
                <NeoButton type="button" onClick={() => handleAutoLogin('student', 'student123')} style={{ width: '100%' }}>Student</NeoButton>
              </div>

              {/* Right Column: Flowchart */}
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: window.innerWidth > 600 ? '1px solid rgba(128,128,128,0.2)' : 'none', paddingLeft: window.innerWidth > 600 ? '1.5rem' : '0' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-color)', fontSize: '1.1rem' }}>RBA Architecture</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <div style={{ ...demoBtnStyle, cursor: 'default' }}>Super Admin (Paper Buddy)</div>
                  <div style={{ borderLeft: '2px solid var(--primary)', height: '20px' }}></div>
                  <div style={{ ...demoBtnStyle, cursor: 'default' }}>Admin (Institution)</div>
                  <div style={{ borderLeft: '2px solid var(--primary)', height: '20px' }}></div>
                  
                  <div style={{ width: '60%', borderTop: '2px solid var(--primary)', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ borderLeft: '2px solid var(--primary)', height: '20px' }}></div>
                    <div style={{ borderRight: '2px solid var(--primary)', height: '20px' }}></div>
                  </div>
                  
                  <div style={{ width: '100%', display: 'flex' }}>
                    <div style={{ width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                      <div style={{ ...demoBtnStyle, cursor: 'default' }}>Cashier</div>
                    </div>
                    <div style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ ...demoBtnStyle, cursor: 'default' }}>Group Admin</div>
                      <div style={{ borderLeft: '2px solid var(--primary)', height: '20px' }}></div>
                      <div style={{ ...demoBtnStyle, cursor: 'default' }}>Student</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </NeoCard>
        )}
      </div>
    </div>
  );
};

export default Login;

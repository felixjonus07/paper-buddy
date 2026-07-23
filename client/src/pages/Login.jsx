import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import NeoCard from '../components/UI/NeoCard';
import NeoInput from '../components/UI/NeoInput';
import NeoButton from '../components/UI/NeoButton';
import ThemeToggle from '../components/UI/ThemeToggle';
import { useAlert } from '../context/AlertContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', name: '', newPassword: '' });
  const [error, setError] = useState(null);
  const [needsReset, setNeedsReset] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

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
        if (data.role === 'superadmin') {
          navigate('/superadmin/dashboard');
        } else if (data.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (data.role === 'cashier') {
          navigate('/cashier/dashboard');
        } else if (data.role === 'mentor') {
          navigate('/mentor/dashboard');
        } else {
          navigate('/user/dashboard');
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
    <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', position: 'relative' }}>
      <NeoCard style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
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
        
        {isLogin && !needsReset && (
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.03)', borderRadius: '10px' }}>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 'bold' }}>Quick Demo Logins</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: '0.5rem' }}>
              <button onClick={() => handleAutoLogin('superadmin', 'superadmin123')} style={demoBtnStyle}>Super Admin</button>
              <div style={{ borderLeft: '2px solid var(--primary)', height: '15px' }}></div>
              <button onClick={() => handleAutoLogin('admin', 'admin123')} style={demoBtnStyle}>Admin</button>
              <div style={{ borderLeft: '2px solid var(--primary)', height: '15px' }}></div>
              
              <div style={{ width: '50%', borderTop: '2px solid var(--primary)', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ borderLeft: '2px solid var(--primary)', height: '15px' }}></div>
                <div style={{ borderRight: '2px solid var(--primary)', height: '15px' }}></div>
              </div>
              
              <div style={{ width: '100%', display: 'flex' }}>
                <div style={{ width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                  <button onClick={() => handleAutoLogin('cashier', 'cashier123')} style={demoBtnStyle}>Cashier</button>
                </div>
                <div style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <button onClick={() => handleAutoLogin('aidsa', 'aidsa123')} style={demoBtnStyle}>Group Admin</button>
                  <div style={{ borderLeft: '2px solid var(--primary)', height: '15px' }}></div>
                  <button onClick={() => handleAutoLogin('student', 'student123')} style={demoBtnStyle}>Student</button>
                </div>
              </div>
            </div>

          </div>
        )}
      </NeoCard>
    </div>
  );
};

export default Login;

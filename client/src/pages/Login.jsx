import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import NeoCard from '../components/UI/NeoCard';
import NeoInput from '../components/UI/NeoInput';
import NeoButton from '../components/UI/NeoButton';
import ThemeToggle from '../components/UI/ThemeToggle';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', name: '', newPassword: '' });
  const [error, setError] = useState(null);
  const [needsReset, setNeedsReset] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
           alert('Password reset successful! Please log in again.');
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

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { username: formData.username, password: formData.password } : formData;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

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
        if (data.role === 'admin') {
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
      setError('Failed to connect to server. Ensure backend is running.');
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
        <ThemeToggle />
      </div>
      <NeoCard style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
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

        {!needsReset && (
          <div style={{ marginTop: '2rem' }}>
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span 
                style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </span>
            </p>
          </div>
        )}
      </NeoCard>
    </div>
  );
};

export default Login;

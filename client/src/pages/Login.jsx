import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import NeoCard from '../components/UI/NeoCard';
import NeoInput from '../components/UI/NeoInput';
import NeoButton from '../components/UI/NeoButton';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email: formData.email, password: formData.password } : formData;

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        // Store token (in a real app, use Context/Redux)
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        
        // Redirect based on role
        if (data.role === 'admin') {
          navigate('/admin/dashboard');
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
    <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh' }}>
      <NeoCard style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
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
            type="email" 
            name="email" 
            placeholder="Email Address" 
            icon={Mail}
            value={formData.email}
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
        </form>

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
      </NeoCard>
    </div>
  );
};

export default Login;

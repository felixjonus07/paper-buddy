import React from 'react';
import { useNavigate } from 'react-router-dom';
import NeoCard from '../components/UI/NeoCard';
import NeoButton from '../components/UI/NeoButton';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 72px)', backgroundColor: 'var(--bg-color)', padding: '2rem' }}>
      <NeoCard style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', color: 'var(--primary)', margin: '0 0 1rem 0' }}>404</h1>
        <h2 style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
          Oops! The page you are looking for does not exist or has been moved.
        </p>
        <NeoButton variant="primary" onClick={() => navigate('/')}>
          Back to Home
        </NeoButton>
      </NeoCard>
    </div>
  );
};

export default NotFound;

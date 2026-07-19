import React from 'react';
import NeoCard from '../UI/NeoCard';
import NeoButton from '../UI/NeoButton';
import NeoInput from '../UI/NeoInput';

const UserSettings = ({ handleChangePassword, passwordData, setPasswordData, passwordMessage }) => {
  return (
    <div style={{ animation: 'slideUp 0.3s ease-out', maxWidth: '600px', margin: '0 auto' }}>
      <NeoCard>
        <h2 style={{ color: 'var(--primary)', marginBottom: '2rem', textAlign: 'center' }}>Account Settings</h2>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Change Password</h3>
          <NeoInput 
            type="password" 
            placeholder="Current Password" 
            value={passwordData.currentPassword} 
            onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} 
            required 
          />
          <NeoInput 
            type="password" 
            placeholder="New Password" 
            value={passwordData.newPassword} 
            onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} 
            required 
          />
          <NeoButton variant="pink" type="submit">Update Password</NeoButton>
          {passwordMessage && <p style={{ marginTop: '1rem', color: 'var(--clay-pink)', textAlign: 'center' }}>{passwordMessage}</p>}
        </form>
      </NeoCard>
    </div>
  );
};

export default UserSettings;

import React, { useState, useEffect } from 'react';
import UserProfile from './UserProfile';
import UserSettings from './UserSettings';
import NeoModal from '../UI/NeoModal';
import NeoInput from '../UI/NeoInput';
import NeoButton from '../UI/NeoButton';

const ProfileAndSettingsView = () => {
  const [profile, setProfile] = useState(null);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setProfile(await res.json());
      } catch (err) {}
    };
    fetchProfile();
  }, [token]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(passwordData)
      });
      const data = await res.json();
      setPasswordMessage(res.ok ? 'Password updated successfully!' : (data.message || 'Failed to update'));
      if (res.ok) setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) { setPasswordMessage('Server error'); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(profileFormData)
      });
      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
        setEditProfileModalOpen(false);
      } else {
        alert('Failed to update profile');
      }
    } catch (err) {
      alert('Error updating profile');
    }
  };

  const openProfileEdit = () => {
    setProfileFormData({
      phoneNumber: profile?.phoneNumber || '',
      studentClass: profile?.studentClass || '',
      section: profile?.section || '',
      year: profile?.year || '',
      personalEmail: profile?.personalEmail || '',
      collegeEmail: profile?.collegeEmail || '',
      registerNumber: profile?.registerNumber || ''
    });
    setEditProfileModalOpen(true);
  };

  if (!profile) return <p style={{ textAlign: 'center' }}>Loading profile...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <UserProfile profile={profile} openProfileEdit={openProfileEdit} />
      <div style={{ padding: '0 0.5rem' }}>
        <UserSettings 
          handleChangePassword={handleChangePassword} 
          passwordData={passwordData} 
          setPasswordData={setPasswordData} 
          passwordMessage={passwordMessage} 
        />
      </div>

      <NeoModal isOpen={editProfileModalOpen} onClose={() => setEditProfileModalOpen(false)} title="Edit Profile Details">
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {profile.role === 'student' && <NeoInput type="text" placeholder="Register Number" value={profileFormData.registerNumber || ''} onChange={e => setProfileFormData({ ...profileFormData, registerNumber: e.target.value })} />}
            <NeoInput type="text" placeholder="Phone Number" value={profileFormData.phoneNumber || ''} onChange={e => setProfileFormData({ ...profileFormData, phoneNumber: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <NeoInput type="text" placeholder="Personal Email" value={profileFormData.personalEmail || ''} onChange={e => setProfileFormData({ ...profileFormData, personalEmail: e.target.value })} />
            <NeoInput type="text" placeholder="College Email" value={profileFormData.collegeEmail || ''} onChange={e => setProfileFormData({ ...profileFormData, collegeEmail: e.target.value })} />
          </div>

          {profile.role === 'student' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <NeoInput type="text" placeholder="Class" value={profileFormData.studentClass || ''} onChange={e => setProfileFormData({ ...profileFormData, studentClass: e.target.value })} />
              <NeoInput type="text" placeholder="Section" value={profileFormData.section || ''} onChange={e => setProfileFormData({ ...profileFormData, section: e.target.value })} />
              <NeoInput type="text" placeholder="Year" value={profileFormData.year || ''} onChange={e => setProfileFormData({ ...profileFormData, year: e.target.value })} />
            </div>
          )}

          <NeoButton variant="mint" type="submit">Save Details</NeoButton>
        </form>
      </NeoModal>
    </div>
  );
};

export default ProfileAndSettingsView;

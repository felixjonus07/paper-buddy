import React from 'react';
import NeoCard from '../UI/NeoCard';
import NeoButton from '../UI/NeoButton';
import { User, Edit } from 'lucide-react';

const UserProfile = ({ profile, openProfileEdit }) => {
  if (!profile) return <p style={{ textAlign: 'center' }}>Loading profile...</p>;

  return (
    <div style={{ animation: 'slideUp 0.3s ease-out', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <NeoCard style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 2rem' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--clay-peach)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--clay-outer)', marginBottom: '1rem' }}>
          <User size={50} color="white" />
        </div>
        <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '2rem' }}>{profile.name} <span style={{  marginBottom: '1.5rem', padding: '0.2rem 0.5rem', borderRadius: '20px', backgroundColor: profile.role === 'admin' ? 'var(--clay-pink-light)' : 'var(--clay-mint-light)',color: profile.role === 'admin' ? '#831843' : 'var(--primary)', fontSize: '15px',textTransform: 'uppercase'}}>{profile.role}</span></h2>
        <span style={{ fontSize: '1.2rem', color: 'var(--text-light)' }}>@{profile.username}</span>
        <NeoButton variant="mint" style={{ marginTop: '1rem', padding: '0.4rem 1.2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={openProfileEdit}>
          <Edit size={16} /> Edit Details
        </NeoButton>
      </NeoCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <NeoCard>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '2px solid rgba(128,128,128,0.1)', paddingBottom: '0.5rem' }}>Personal Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>Register No:</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>{profile.registerNumber || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>Phone Number:</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>{profile.phoneNumber || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>Personal Email:</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>{profile.personalEmail || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>College Email:</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>{profile.collegeEmail || '-'}</span>
            </div>
          </div>
        </NeoCard>

        <NeoCard>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '2px solid rgba(128,128,128,0.1)', paddingBottom: '0.5rem' }}>Academic Profile</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>Class / Year:</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                {profile.studentClass ? `${profile.studentClass}` : '-'} {profile.year ? `(${profile.year})` : ''}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>Section:</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-color)' }}>{profile.section || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>Current Score:</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{profile.academicScore || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>Scholarship:</span>
              {profile.scholarship ? (
                 <span style={{ backgroundColor: 'var(--clay-mint-light)', color: 'var(--primary)', padding: '0.3rem 0.6rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                   {profile.scholarship.name} ({profile.scholarship.discountPercentage}%)
                 </span>
              ) : (
                 <span style={{ fontStyle: 'italic', color: 'var(--text-light)' }}>None</span>
              )}
            </div>
          </div>
        </NeoCard>

        <NeoCard>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '2px solid rgba(128,128,128,0.1)', paddingBottom: '0.5rem' }}>Enrolled Groups</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
            {profile.groups && profile.groups.length > 0 ? profile.groups.map(g => (
              <span key={g._id} style={{ padding: '0.5rem 1rem', borderRadius: '15px', backgroundColor: 'var(--bg-color)', boxShadow: 'var(--clay-outer)', fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: 'bold' }}>
                {g.name}
              </span>
            )) : (
              <span style={{ fontStyle: 'italic', color: 'var(--text-light)' }}>Not enrolled in any groups</span>
            )}
          </div>
        </NeoCard>
      </div>
    </div>
  );
};

export default UserProfile;

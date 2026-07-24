import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NeoCard from '../../components/UI/NeoCard';
import NeoButton from '../../components/UI/NeoButton';
import ThemeToggle from '../../components/UI/ThemeToggle';
import { ArrowLeft, Users, Shield, TrendingUp } from 'lucide-react';

const CollegeDetail = () => {
  const { collegeId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollegeData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/superadmin/colleges/${collegeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          setData(await res.json());
        } else {
          setError('Failed to fetch college details');
        }
      } catch (err) {
        setError('Server error while fetching college data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollegeData();
  }, [collegeId]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading College Details...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--error)' }}>{error}</div>;
  if (!data || !data.college) return null;

  const { college, admins, totalStudents } = data;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <NeoButton variant="secondary" onClick={() => navigate('/superadmin/dashboard')}>
            <ArrowLeft size={18} /> Back
          </NeoButton>
          <h1 style={{ color: 'var(--primary)', margin: 0 }}>{college.name} ({college.code})</h1>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <NeoCard>
          <h3 style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={18} /> Total Admins</h3>
          <h1 style={{ fontSize: '3rem', color: 'var(--primary)' }}>{admins.length}</h1>
        </NeoCard>
        <NeoCard>
          <h3 style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} /> Total Students</h3>
          <h1 style={{ fontSize: '3rem', color: 'var(--primary)' }}>{totalStudents}</h1>
        </NeoCard>
        <NeoCard>
          <h3 style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp size={18} /> Subscription</h3>
          <h1 style={{ fontSize: '2rem', color: college.subscriptionStatus === 'active' ? 'var(--success)' : 'var(--error)' }}>
            {college.subscriptionStatus.toUpperCase()}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Joined: {new Date(college.createdAt).toLocaleDateString()}</p>
        </NeoCard>
      </div>

      <NeoCard>
        <h2 style={{ marginBottom: '1rem' }}>Provisioned Admins</h2>
        {admins.length > 0 ? (
          <div className="table-responsive">
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>Username</th>
                  <th style={{ padding: '1rem' }}>Created At</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{admin.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{admin.username}</td>
                    <td style={{ padding: '1rem' }}>{new Date(admin.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>No admins provisioned for this college yet.</p>
        )}
      </NeoCard>
    </div>
  );
};

export default CollegeDetail;

import React from 'react';
import NeoCard from '../UI/NeoCard';
import NeoButton from '../UI/NeoButton';
import NeoInput from '../UI/NeoInput';

const ScholarshipsManagement = ({ 
  masterMessage, 
  handleCreateScholarship, 
  newScholarship, 
  setNewScholarship, 
  feeTypes, 
  scholarships, 
  handleDeleteScholarship 
}) => {
  return (
    <div style={{ animation: 'slideUp 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)' }}>Scholarships</h2>
      </div>

      {masterMessage && <p style={{ color: 'var(--clay-mint)', textAlign: 'center', marginBottom: '1rem' }}>{masterMessage}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <NeoCard>
          <form onSubmit={handleCreateScholarship} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <NeoInput type="text" placeholder="Scholarship Name" value={newScholarship.name} onChange={e => setNewScholarship({...newScholarship, name: e.target.value})} required />
            <NeoInput type="text" placeholder="Description (Optional)" value={newScholarship.description || ''} onChange={e => setNewScholarship({...newScholarship, description: e.target.value})} />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <NeoInput type="number" placeholder="Discount %" value={newScholarship.discountPercentage} onChange={e => setNewScholarship({...newScholarship, discountPercentage: e.target.value})} required />
              <NeoInput type="number" placeholder="Min Score (Optional)" value={newScholarship.minAcademicScore} onChange={e => setNewScholarship({...newScholarship, minAcademicScore: e.target.value})} />
            </div>
            
            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.5rem', display: 'block' }}>Applicable Fee Types (Leave blank for all)</label>
              <div style={{
                maxHeight: '150px',
                overflowY: 'auto',
                backgroundColor: 'var(--clay-base)',
                borderRadius: '20px',
                padding: '1rem',
                boxShadow: 'var(--clay-outer)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem'
              }}>
                {feeTypes.map(c => (
                  <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => {
                    const current = newScholarship.applicableFeeTypes || [];
                    const next = current.includes(c._id) ? current.filter(id => id !== c._id) : [...current, c._id];
                    setNewScholarship({...newScholarship, applicableFeeTypes: next});
                  }}>
                    <input type="checkbox" checked={(newScholarship.applicableFeeTypes || []).includes(c._id)} readOnly style={{ accentColor: 'var(--primary)', transform: 'scale(1.2)' }} />
                    <span style={{ color: 'var(--text-color)' }}>{c.name}</span>
                  </div>
                ))}
                {feeTypes.length === 0 && <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>No fee types available.</span>}
              </div>
            </div>
            <NeoButton variant="mint" type="submit">Create Scholarship</NeoButton>
          </form>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Existing Scholarships</h3>
          <div className="card-grid">
            {scholarships.map(s => (
              <NeoCard key={s._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1rem', backgroundColor: 'var(--bg-color)', boxShadow: 'var(--clay-outer)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{s.name}</h4>
                  <div style={{ color: 'var(--clay-mint)', fontSize: '1.2rem', fontWeight: 'bold' }}>{s.discountPercentage}%</div>
                </div>
                {s.description && (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)', fontStyle: 'italic' }}>{s.description}</p>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                    <strong>Min Score:</strong> {s.minAcademicScore}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                    <strong>Applies to:</strong> {s.applicableFeeTypes && s.applicableFeeTypes.length > 0 ? s.applicableFeeTypes.map(c => c ? (feeTypes.find(fc => fc._id === (c._id || c))?.name || c.name || 'Unknown') : 'Unknown').join(', ') : 'All Fee Types'}
                  </span>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(128,128,128,0.1)' }}>
                  <NeoButton variant="peach" style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem' }} onClick={() => handleDeleteScholarship(s._id)}>Delete Scholarship</NeoButton>
                </div>
              </NeoCard>
            ))}
            {scholarships.length === 0 && <p style={{ textAlign: 'center', width: '100%', color: 'var(--text-light)' }}>No scholarships defined</p>}
          </div>
        </NeoCard>
      </div>
    </div>
  );
};

export default ScholarshipsManagement;

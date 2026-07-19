import React from 'react';
import NeoCard from '../UI/NeoCard';
import NeoInput from '../UI/NeoInput';
import NeoButton from '../UI/NeoButton';
import { Search } from 'lucide-react';

const StudentSearch = ({ handleSearch, searchQuery, setSearchQuery, loading, students, selectedStudent, selectStudent }) => {
  return (
    <NeoCard>
      <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Search Student</h3>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <NeoInput 
            type="text" 
            placeholder="Search by Name, Username, or Register Number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            Icon={Search}
          />
        </div>
        <NeoButton variant="primary" type="submit" disabled={loading}>
          Search
        </NeoButton>
      </form>

      {/* Search Results */}
      {students.length > 0 && !selectedStudent && (
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h4 style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>Search Results</h4>
          {students.map(student => (
            <div 
              key={student._id}
              onClick={() => selectStudent(student)}
              style={{ 
                padding: '1rem', 
                borderRadius: '16px', 
                backgroundColor: 'var(--bg-secondary)', 
                border: '1px solid var(--border)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              <div>
                <strong style={{ display: 'block', color: 'var(--text-color)' }}>{student.name}</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  @{student.username} {student.registerNumber ? ` | Reg: ${student.registerNumber}` : ''}
                </span>
              </div>
              <NeoButton variant="secondary" style={{ padding: '0.4rem 1rem' }}>Select</NeoButton>
            </div>
          ))}
        </div>
      )}
      
      {students.length === 0 && searchQuery && !loading && (
        <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>No students found matching your search.</p>
      )}
    </NeoCard>
  );
};

export default StudentSearch;

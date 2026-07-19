import React from 'react';
import NeoCard from '../UI/NeoCard';
import NeoButton from '../UI/NeoButton';

const StudentList = ({ showAllUsers, setShowAllUsers, studentLedgers, users, openAddFeeModal }) => {
  return (
    <NeoCard style={{ flex: '2', minWidth: '500px', overflow: 'hidden' }}>
      {/* Tab Control */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          backgroundColor: 'var(--clay-base)', 
          borderRadius: '20px', 
          padding: '0.4rem', 
          boxShadow: 'inset 5px 5px 10px rgba(163, 177, 198, 0.4), inset -5px -5px 10px rgba(255, 255, 255, 0.8)', 
          width: 'fit-content' 
        }}>
          <div 
            onClick={() => setShowAllUsers(false)}
            style={{
              padding: '0.6rem 2rem',
              borderRadius: '15px',
              cursor: 'pointer',
              backgroundColor: !showAllUsers ? 'var(--primary)' : 'transparent',
              color: !showAllUsers ? 'white' : 'var(--text-color)',
              transition: 'all 0.3s ease',
              fontWeight: !showAllUsers ? 'bold' : 'normal',
              boxShadow: !showAllUsers ? '5px 5px 10px rgba(163, 177, 198, 0.4)' : 'none'
            }}
          >
            Enrolled Students
          </div>
          <div 
            onClick={() => setShowAllUsers(true)}
            style={{
              padding: '0.6rem 2rem',
              borderRadius: '15px',
              cursor: 'pointer',
              backgroundColor: showAllUsers ? 'var(--primary)' : 'transparent',
              color: showAllUsers ? 'white' : 'var(--text-color)',
              transition: 'all 0.3s ease',
              fontWeight: showAllUsers ? 'bold' : 'normal',
              boxShadow: showAllUsers ? '5px 5px 10px rgba(163, 177, 198, 0.4)' : 'none'
            }}
          >
            View All Students
          </div>
        </div>
      </div>

      {/* Sliding Container */}
      <div style={{ overflow: 'hidden', width: '100%', padding: '0.5rem' }}>
        <div style={{ 
          display: 'flex', 
          width: '200%', 
          transform: showAllUsers ? 'translateX(-50%)' : 'translateX(0)', 
          transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)' 
        }}>
          
          {/* Enrolled Students Tab */}
          <div style={{ width: '50%', flexShrink: 0, paddingRight: '1rem', boxSizing: 'border-box' }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Score / Tier</th>
                    <th>Base Total Fee</th>
                    <th>Scholarship Applied</th>
                    <th>Net Payable</th>
                    <th>Amount Paid</th>
                    <th>Pending</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentLedgers?.map(l => (
                    <tr key={l?.student?._id || Math.random()}>
                      <td>{l?.student?.name || 'Unknown'} <br/><span style={{fontSize: '0.8rem', color: 'var(--text-light)'}}>{l?.student?.username || ''}</span></td>
                      <td>
                        <strong>{l?.student?.academicScore || 'N/A'}</strong> / 
                        <span style={{ fontSize: '0.8rem', marginLeft: '5px', padding: '0.2rem 0.5rem', borderRadius: '10px', backgroundColor: l?.student?.scholarship ? 'var(--clay-mint-light)' : 'var(--clay-base)' }}>
                          {l?.student?.scholarship ? l.student.scholarship.name : 'NONE'}
                        </span>
                      </td>
                      <td>₹{l?.baseTotal?.toFixed(2) || '0.00'}</td>
                      <td style={{ color: 'var(--clay-mint)' }}>₹{l?.discountTotal?.toFixed(2) || '0.00'}</td>
                      <td style={{ fontWeight: 'bold' }}>₹{l?.netPayable?.toFixed(2) || '0.00'}</td>
                      <td style={{ color: 'var(--clay-mint)', fontWeight: '600' }}>₹{l?.amountPaid?.toFixed(2) || '0.00'}</td>
                      <td style={{ color: 'var(--clay-peach)', fontWeight: 'bold' }}>₹{l?.amountPending?.toFixed(2) || '0.00'}</td>
                      <td>
                        <span style={{ padding: '0.3rem 0.6rem', borderRadius: '10px', fontSize: '0.8rem', backgroundColor: l?.status === 'PENDING' ? 'var(--clay-peach-light)' : l?.status === 'PARTIAL' ? 'var(--clay-blue-light)' : 'var(--clay-mint-light)' }}>
                          {l?.status || 'UNKNOWN'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!studentLedgers || studentLedgers.length === 0) && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center' }}>No billing records for this group.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* All Users Tab */}
          <div style={{ width: '50%', flexShrink: 0, paddingLeft: '1rem', boxSizing: 'border-box' }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users && users.length > 0 ? (
                    users.map(u => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.username}</td>
                        <td>{u.role}</td>
                        <td>
                          <NeoButton variant="mint" onClick={() => openAddFeeModal(u._id)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                            Add Fee
                          </NeoButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center' }}>No students assigned to this group yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </NeoCard>
  );
};

export default StudentList;

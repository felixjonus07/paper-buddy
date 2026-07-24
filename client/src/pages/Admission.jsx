import React from 'react';

const Admission = () => {
  return (
    <div className="app-container" style={{ 
      minHeight: 'calc(100vh - 72px)', 
      padding: '4rem 4rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <h1 style={{ 
        fontSize: '3.5rem', 
        fontWeight: '900',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        marginBottom: '1rem',
        color: 'var(--text-color)'
      }}>
        Join Our <span style={{ color: 'var(--primary)' }}>University</span>
      </h1>
      <p style={{ 
        fontSize: '1.2rem', 
        color: 'var(--text-light)', 
        maxWidth: '700px', 
        textAlign: 'center',
        lineHeight: '1.6',
        marginBottom: '4rem'
      }}>
        Take the first step towards a brighter future at our vibrant Tamil Nadu campus. Our admission process is simple, transparent, and designed to help you start your educational journey seamlessly.
      </p>

      <div style={{ display: 'flex', gap: '3rem', width: '100%', maxWidth: '1100px', flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Left Side: Image and info */}
        <div style={{ flex: 1, minWidth: '350px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{
            width: '100%',
            height: '350px',
            backgroundImage: 'url(/images/tn_students_1_1784727552837.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '1rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }} />
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-color)' }}>Admissions Open for 2026-2027</h3>
            <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>
              We are now accepting applications for all undergraduate and postgraduate programs. Join a diverse community of scholars in the cultural and educational hub of Tamil Nadu.
            </p>
          </div>
        </div>

        {/* Right Side: Admission Form */}
        <div className="glass-card" style={{
          flex: 1,
          padding: '3rem',
          minWidth: '350px',
        }}>
          <h2 style={{ marginBottom: '2rem', fontSize: '1.8rem' }}>Admission Inquiry</h2>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: 'var(--text-color)' }}>First Name</label>
                <input type="text" placeholder="John" style={{ padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-strong)', outline: 'none' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: 'var(--text-color)' }}>Last Name</label>
                <input type="text" placeholder="Doe" style={{ padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-strong)', outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-color)' }}>Email Address</label>
              <input type="email" placeholder="john@example.com" style={{ padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-strong)', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-color)' }}>Program of Interest</label>
              <select style={{ padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-strong)', outline: 'none', backgroundColor: 'transparent', color: 'var(--text-color)' }}>
                <option style={{color: 'black'}}>Computer Science & Engineering</option>
                <option style={{color: 'black'}}>Business Administration</option>
                <option style={{color: 'black'}}>Mechanical Engineering</option>
                <option style={{color: 'black'}}>Arts & Humanities</option>
              </select>
            </div>
            <button type="button" className="glass-btn" style={{ marginTop: '1rem' }}>
              Submit Inquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Admission;

import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <div className="public-page" style={{ padding: '6rem clamp(1rem, 5vw, 2rem) 4rem', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

      {/* ════════ HEADER ════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '900', letterSpacing: '-1px', margin: 0 }}>
            CONTACT US
          </h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', maxWidth: '500px', lineHeight: '1.6', margin: 0, paddingTop: '0.5rem' }}>
            If you have any questions, please feel free to get in touch with us via phone, text, email, the form below, or even on social media!
          </p>
        </div>
      </div>

      {/* ════════ MAIN CONTENT GRID ════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '2rem' }}>

        {/* Contact Info Card */}
        <div style={{
          background: 'var(--clay-base)',
          borderRadius: '12px',
          padding: '2.5rem',
          border: '1px solid var(--border-light)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', letterSpacing: '0.5px' }}>
            CONTACT INFORMATION
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <Phone size={24} color="#ce1126" style={{ marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Phone</div>
                <div style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>+91 9025059194</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <MapPin size={24} color="#ce1126" style={{ marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Address</div>
                <div style={{ color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: '1.4' }}>Coimbatore,<br />Tamil Nadu</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', gridColumn: '1 / -1' }}>
              <Mail size={24} color="#ce1126" style={{ marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Email</div>
                <div style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>felixjonus07@gmail.com</div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Hours Card */}
        <div style={{
          background: 'var(--clay-base)',
          borderRadius: '12px',
          padding: '2.5rem',
          border: '1px solid var(--border-light)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          flex: 1
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', letterSpacing: '0.5px' }}>
            BUSINESS HOURS
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Monday - Friday</div>
              <div style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>9:00 am - 8:00 pm</div>
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Saturday</div>
              <div style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>9:00 am - 6:00 pm</div>
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Sunday</div>
              <div style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>9:00 am - 5:00 pm</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;

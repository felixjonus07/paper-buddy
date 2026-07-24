import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
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
        Get In <span style={{ color: 'var(--primary)' }}>Touch</span>
      </h1>
      <p style={{ 
        fontSize: '1.2rem', 
        color: 'var(--text-light)', 
        maxWidth: '700px', 
        textAlign: 'center',
        lineHeight: '1.6',
        marginBottom: '4rem'
      }}>
        Have questions? We're here to help. Reach out to our support team and we'll get back to you as soon as possible.
      </p>

      <div style={{ display: 'flex', gap: '3rem', width: '100%', maxWidth: '1000px', flexWrap: 'wrap' }}>
        
        {/* Contact Info Cards */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '300px' }}>
          <div className="glass-card" style={{ 
            padding: '2rem', 
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1.5rem'
          }}>
            <div style={{ backgroundColor: 'rgba(248,116,16,0.1)', padding: '1rem', borderRadius: '50%' }}>
              <MapPin size={24} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Visit Us</h3>
              <p style={{ color: 'var(--text-light)', lineHeight: '1.5' }}>123 University Ave<br/>Innovation District<br/>Tech City, TC 10101</p>
            </div>
          </div>

          <div className="glass-card" style={{ 
            padding: '2rem', 
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1.5rem'
          }}>
            <div style={{ backgroundColor: 'rgba(248,116,16,0.1)', padding: '1rem', borderRadius: '50%' }}>
              <Phone size={24} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Call Us</h3>
              <p style={{ color: 'var(--text-light)', lineHeight: '1.5' }}>+1 (555) 123-4567<br/>Mon-Fri, 9am - 5pm</p>
            </div>
          </div>

          <div className="glass-card" style={{ 
            padding: '2rem', 
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1.5rem'
          }}>
            <div style={{ backgroundColor: 'rgba(248,116,16,0.1)', padding: '1rem', borderRadius: '50%' }}>
              <Mail size={24} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Email Us</h3>
              <p style={{ color: 'var(--text-light)', lineHeight: '1.5' }}>admissions@university.edu<br/>support@university.edu</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass-card" style={{
          flex: 1.5,
          padding: '3rem',
          minWidth: '350px'
        }}>
          <h2 style={{ marginBottom: '2rem', fontSize: '1.8rem' }}>Send a Message</h2>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: 'var(--text-color)' }}>Name</label>
                <input type="text" placeholder="Your Name" style={{ padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-strong)', outline: 'none' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: 'var(--text-color)' }}>Email</label>
                <input type="email" placeholder="Your Email" style={{ padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-strong)', outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-color)' }}>Subject</label>
              <input type="text" placeholder="How can we help you?" style={{ padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-strong)', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-color)' }}>Message</label>
              <textarea rows={5} placeholder="Write your message here..." style={{ padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-strong)', outline: 'none', resize: 'vertical' }}></textarea>
            </div>
            <button type="button" className="glass-btn" style={{ marginTop: '1rem' }}>
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;

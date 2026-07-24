import React from 'react';
import { Mail, Phone, MapPin, Send, ArrowRight } from 'lucide-react';

const Contact = () => {
  return (
    <div className="public-page">
      {/* ════════ HERO BANNER ════════ */}
      <div style={{
        position: 'relative',
        height: '350px',
        backgroundImage: 'url(/images/data.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(11,14,20,0.85), rgba(242,92,5,0.25))',
        }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: '#fff', padding: '0 2rem' }}>
          <p style={{ fontWeight: '700', fontSize: '0.9rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem', opacity: 0.9 }} className="anim-fade-up">
            Get in touch
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: '900', marginBottom: '1rem', letterSpacing: '1px' }} className="anim-fade-up anim-delay-1">
            Contact <span style={{ color: 'var(--text-color)' }}>Us</span>
          </h1>
          <p style={{ fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: '1.7', opacity: 0.9 }} className="anim-fade-up anim-delay-2">
            Have questions about admissions, fees, or campus life? We're here to help you navigate your journey.
          </p>
        </div>
      </div>

      <div className="section contact-section-flex">
        
        {/* ════════ CONTACT INFO ════════ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '280px' }}>
          {[
            { icon: MapPin, title: 'Visit Us', desc: '123 University Ave\nInnovation District\nTech City, TC 10101', color: '#0ea5e9' },
            { icon: Phone, title: 'Call Us', desc: '+1 (555) 123-4567\nMon-Fri, 9am - 5pm', color: 'var(--primary)' },
            { icon: Mail, title: 'Email Us', desc: 'admissions@university.edu\nsupport@university.edu', color: '#8b5cf6' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className={`glass-card anim-fade-up anim-delay-${i + 1}`} style={{ 
                padding: '2rem', 
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1.5rem'
              }}>
                <div style={{ 
                  background: `${item.color}15`, 
                  padding: '1.2rem', 
                  borderRadius: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={28} color={item.color} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: '700' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-light)', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ════════ CONTACT FORM ════════ */}
        <div className="glass-card anim-fade-left" style={{
          flex: 1.5,
          padding: '3rem',
          minWidth: '280px'
        }}>
          <h2 style={{ marginBottom: '0.5rem', fontSize: '2rem', fontWeight: '800' }}>Send a Message</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Fill out the form below and we'll get back to you shortly.</p>
          
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-row">
              <div className="form-col">
                <label style={{ fontWeight: '600', color: 'var(--text-color)', fontSize: '0.9rem' }}>Name</label>
                <input type="text" placeholder="Your Name" style={{ 
                  padding: '0.85rem 1rem', borderRadius: '12px', 
                  border: '1px solid var(--border-strong)', outline: 'none',
                  background: 'rgba(128,128,128,0.05)', color: 'var(--text-color)',
                  fontSize: '0.95rem'
                }} />
              </div>
              <div className="form-col">
                <label style={{ fontWeight: '600', color: 'var(--text-color)', fontSize: '0.9rem' }}>Email</label>
                <input type="email" placeholder="Your Email" style={{ 
                  padding: '0.85rem 1rem', borderRadius: '12px', 
                  border: '1px solid var(--border-strong)', outline: 'none',
                  background: 'rgba(128,128,128,0.05)', color: 'var(--text-color)',
                  fontSize: '0.95rem'
                }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-color)', fontSize: '0.9rem' }}>Subject</label>
              <input type="text" placeholder="How can we help you?" style={{ 
                padding: '0.85rem 1rem', borderRadius: '12px', 
                border: '1px solid var(--border-strong)', outline: 'none',
                background: 'rgba(128,128,128,0.05)', color: 'var(--text-color)',
                fontSize: '0.95rem'
              }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--text-color)', fontSize: '0.9rem' }}>Message</label>
              <textarea rows={5} placeholder="Write your message here..." style={{ 
                padding: '0.85rem 1rem', borderRadius: '12px', 
                border: '1px solid var(--border-strong)', outline: 'none', resize: 'vertical',
                background: 'rgba(128,128,128,0.05)', color: 'var(--text-color)',
                fontSize: '0.95rem'
              }}></textarea>
            </div>
            <button type="button" className="glass-btn" style={{ marginTop: '1rem', justifyContent: 'center' }}>
              <Send size={18} /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;

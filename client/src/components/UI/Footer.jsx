import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="site-footer footer-wrapper" style={{ background: '#0f172a' }}>
      <div className="footer-inner" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div className="footer-top-row">
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: '700' }}>Contact Us</h3>
            <div className="footer-contact-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} /> info@paperbuddy.in
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} /> Bangalore, India
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} /> +91 80 1234 5678
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {/* Placeholder for social icons */}
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
            </div>
            <button style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
              Apply for Course
            </button>
          </div>
        </div>

        <div className="footer-grid">
          <div>
            <h4 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: '700' }}>About PaperBuddy</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>History and Mission</Link>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Values and Goals</Link>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Careers</Link>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Location</Link>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Contact Us</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: '700' }}>Academics</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Undergraduate Programs</Link>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Postgraduate Programs</Link>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Academic Calendar</Link>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Colleges</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: '700' }}>Admissions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Requirements</Link>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Procedures</Link>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Tuition and fees</Link>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Scholarships</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: '700' }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Campus Map</Link>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>News & Events</Link>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Alumni Portal</Link>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Library</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom-row">
          <p style={{ margin: 0 }}>
            © 2024 PaperBuddy University India. All Rights Reserved.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Use</span>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;

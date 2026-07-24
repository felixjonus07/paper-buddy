import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Upload, Search, CheckCircle, Calendar, Clock, MapPin } from 'lucide-react';

const Admission = () => {
  const timeline = [
    { step: 1, title: 'Online Application', desc: 'Fill out our simple online application form with your details.', icon: FileText },
    { step: 2, title: 'Document Upload', desc: 'Upload your transcripts, certificates, and required documents.', icon: Upload },
    { step: 3, title: 'Application Review', desc: 'Our admissions team reviews your application carefully.', icon: Search },
    { step: 4, title: 'Acceptance', desc: 'Receive your offer letter and confirm your enrollment!', icon: CheckCircle },
  ];

  const programs = [
    { name: 'Computer Science & Engineering', duration: '4 Years', degree: 'B.Tech', seats: 120, img: '/images/cs.png' },
    { name: 'Business Administration', duration: '3 Years', degree: 'BBA', seats: 90, img: '/images/business.png' },
    { name: 'Mechanical Engineering', duration: '4 Years', degree: 'B.Tech', seats: 80, img: '/images/mech.png' },
    { name: 'Data Science & AI', duration: '2 Years', degree: 'M.Sc', seats: 60, img: '/images/data.png' },
    { name: 'Arts & Humanities', duration: '3 Years', degree: 'BA', seats: 100, img: '/images/arts.png' },
    { name: 'Civil Engineering', duration: '4 Years', degree: 'B.Tech', seats: 80, img: '/images/civil.png' },
  ];

  const keyDates = [
    { event: 'Application Opens', date: 'January 15, 2027', icon: Calendar },
    { event: 'Early Decision Deadline', date: 'March 31, 2027', icon: Clock },
    { event: 'Regular Deadline', date: 'June 15, 2027', icon: Calendar },
    { event: 'Classes Begin', date: 'August 1, 2027', icon: MapPin },
  ];

  return (
    <div className="public-page">

      {/* ════════ HERO BANNER ════════ */}
      <div style={{
        position: 'relative',
        height: '420px',
        backgroundImage: 'url(/images/civil.png)',
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
            Admissions 2027
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: '900', marginBottom: '1rem', letterSpacing: '1px' }} className="anim-fade-up anim-delay-1">
            Join Our <span style={{ color: 'var(--primary-light)' }}>University</span>
          </h1>
          <p style={{ fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: '1.7', opacity: 0.9 }} className="anim-fade-up anim-delay-2">
            Take the first step towards a brighter future. Our admission process is simple, transparent, and designed to help you start your journey seamlessly.
          </p>
          <Link to="#inquiry" className="glass-btn anim-fade-up anim-delay-3">
            Apply Now <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* ════════ ADMISSION TIMELINE ════════ */}
      <div className="section">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="section-title" style={{ textAlign: 'center' }}>Admission Process</h2>
          <p className="section-subtitle center">Our streamlined process gets you from application to acceptance in just 4 simple steps.</p>
        </div>

        <div className="timeline">
          {timeline.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className={`timeline-step anim-fade-up anim-delay-${i + 1}`}>
                <div className="timeline-dot">
                  <Icon size={28} />
                </div>
                <div className="timeline-title">{item.title}</div>
                <div className="timeline-desc">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ════════ PROGRAMS GRID ════════ */}
      <div className="section-alt">
        <div className="section-inner">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Programs Available</h2>
            <p className="section-subtitle center">Choose from our wide range of undergraduate and postgraduate programs.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {programs.map((prog, i) => (
              <div key={i} className={`program-card anim-fade-up anim-delay-${(i % 5) + 1}`}>
                <img src={prog.img} alt={prog.name} />
                <div className="program-card-overlay">
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', background: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>{prog.degree}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: '600', background: 'rgba(255,255,255,0.15)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>{prog.duration}</span>
                  </div>
                  <h3>{prog.name}</h3>
                  <p>{prog.seats} Seats Available</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════ ADMISSION INQUIRY FORM ════════ */}
      <div className="section-alt" id="inquiry">
        <div className="section-inner">
          <div style={{ display: 'flex', gap: '4rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '320px' }} className="anim-fade-left">
              <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                Get Started
              </p>
              <h2 className="section-title" style={{ fontSize: '2.4rem' }}>
                Admission Inquiry
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-light)', lineHeight: '1.7', marginBottom: '2rem', maxWidth: '480px' }}>
                Fill out this form and our admissions team will get in touch with you within 24 hours. We're here to help you every step of the way.
              </p>
              <div style={{
                width: '100%',
                height: '300px',
                backgroundImage: 'url(/images/business.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
              }} />
            </div>

            <div className="glass-card anim-fade-right" style={{ flex: 1, padding: '3rem', minWidth: '350px' }}>
              <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: '700' }}>Submit Your Inquiry</h3>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: '600', color: 'var(--text-color)', fontSize: '0.9rem' }}>First Name</label>
                    <input type="text" placeholder="John" style={{
                      padding: '0.85rem 1rem', borderRadius: '12px',
                      border: '1px solid var(--border-strong)', outline: 'none',
                      background: 'rgba(128,128,128,0.05)', color: 'var(--text-color)',
                      fontSize: '0.95rem', transition: 'border-color 0.2s',
                    }} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: '600', color: 'var(--text-color)', fontSize: '0.9rem' }}>Last Name</label>
                    <input type="text" placeholder="Doe" style={{
                      padding: '0.85rem 1rem', borderRadius: '12px',
                      border: '1px solid var(--border-strong)', outline: 'none',
                      background: 'rgba(128,128,128,0.05)', color: 'var(--text-color)',
                      fontSize: '0.95rem',
                    }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '600', color: 'var(--text-color)', fontSize: '0.9rem' }}>Email Address</label>
                  <input type="email" placeholder="john@example.com" style={{
                    padding: '0.85rem 1rem', borderRadius: '12px',
                    border: '1px solid var(--border-strong)', outline: 'none',
                    background: 'rgba(128,128,128,0.05)', color: 'var(--text-color)',
                    fontSize: '0.95rem',
                  }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '600', color: 'var(--text-color)', fontSize: '0.9rem' }}>Program of Interest</label>
                  <select style={{
                    padding: '0.85rem 1rem', borderRadius: '12px',
                    border: '1px solid var(--border-strong)', outline: 'none',
                    backgroundColor: 'rgba(128,128,128,0.05)', color: 'var(--text-color)',
                    fontSize: '0.95rem',
                  }}>
                    <option style={{ color: '#000' }}>Computer Science & Engineering</option>
                    <option style={{ color: '#000' }}>Business Administration</option>
                    <option style={{ color: '#000' }}>Mechanical Engineering</option>
                    <option style={{ color: '#000' }}>Data Science & AI</option>
                    <option style={{ color: '#000' }}>Arts & Humanities</option>
                  </select>
                </div>
                <button type="button" className="glass-btn" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                  Submit Inquiry <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Admission;

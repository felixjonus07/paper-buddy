import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Play, FileText, Globe, MapPin, GraduationCap, Users } from 'lucide-react';

const Home = () => {
  const [activeUpdate, setActiveUpdate] = useState(1);
  const [activeRole, setActiveRole] = useState('High school Graduate');

  return (
    <div className="public-page" style={{ paddingTop: 0 }}>
      {/* ════════ HERO ════════ */}
      <div className="iiud-hero">
        <div className="iiud-hero-content">
          <div className="iiud-hero-left anim-fade-right">
            <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px' }}>
              Creating a better future for
            </p>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', lineHeight: '1.1', color: 'var(--text-color)', marginBottom: '1rem' }}>
              PaperBuddy<br/>University<br/>India.
            </h1>
            
            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
              <MapPin size={16} /> <span>Coimbatore, India</span>
            </div>
          </div>
          <div className="iiud-hero-right anim-fade-left">
            {/* Background image set in CSS (india_hero_campus) */}
          </div>
        </div>

      </div>

      {/* ════════ UPDATES ════════ */}
      <div className="iiud-updates">
        <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 2.2rem)', display: 'flex', alignItems: 'center', gap: '1rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          <span style={{ color: 'white' }}>• Stay touch with updates •</span>
        </h2>
        
        <div className="iiud-updates-container">
          <div className="iiud-updates-list">
            {[
              { id: 1, title: 'National AI Conference hosted at Campus 2024' },
              { id: 2, title: 'Regional Tech Symposium Registration Open' },
              { id: 3, title: 'New Entrepreneurship Incubation Cell Launched' }
            ].map((item) => (
              <div 
                key={item.id} 
                className={`iiud-update-item ${activeUpdate === item.id ? 'active' : ''}`}
                onClick={() => setActiveUpdate(item.id)}
              >
                <div className="update-icon" style={{ 
                  width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0,
                  background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <FileText size={20} />
                </div>
                <div style={{ flex: 1, fontWeight: '600' }}>{item.title}</div>
                {activeUpdate === item.id && <ChevronRight size={20} color="var(--primary)" />}
              </div>
            ))}
            <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}>
              View all updates <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
            </div>
          </div>
          
          <div className="iiud-updates-preview">
            <div style={{ position: 'relative', width: '100%', height: '300px' }}>
              <img src="/images/india_students_1784866265313.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Update" />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Play fill="white" color="white" size={24} />
              </div>
            </div>
            <div style={{ padding: '2rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>Campus News</div>
              <h3 style={{color: '#ffffff', fontSize: '1.2rem', margin: 0, fontWeight: '700' }}>PaperBuddy Partners with Leading Tech Firms to Co-organize National AI Conference</h3>
            </div>
          </div>
        </div>
      </div>

      {/* ════════ ADMISSIONS ════════ */}
      <div className="iiud-admissions">
        <div className="iiud-admissions-pattern"></div>
        <div className="iiud-admissions-content">
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '800', marginBottom: '1rem' }}>Admission</h2>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', opacity: 0.8, marginBottom: '2rem', flexWrap: 'wrap' }}>
            <span>Requirements</span> • <span>Procedures</span> • <span>Tuition & fees</span> • <span>Scholarships</span>
          </div>
          
          <div className="iiud-admissions-grid">
            <div className="iiud-admissions-card">
              <span style={{ fontWeight: '600' }}>Undergraduate</span>
            </div>
            <div className="iiud-admissions-card">
              <span style={{ fontWeight: '600' }}>Postgraduate (Master Degree)</span>
            </div>
            <div className="iiud-admissions-card">
              <span style={{ fontWeight: '600' }}>International students</span>
            </div>
            <div className="iiud-admissions-card">
              <span style={{ fontWeight: '600' }}>Scholarships and Aids</span>
            </div>
            <div className="iiud-admissions-card">
              <span style={{ fontWeight: '600' }}>Online Admission Portal</span>
            </div>
            <div className="iiud-admissions-card">
              <span style={{ fontWeight: '600' }}>Payment of Application fees</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════ FIND YOUR WAY ════════ */}
      <div className="section" style={{ background: 'white' }}>
        <h2 className="section-title" style={{ margin: '0 0 2rem', paddingLeft: '1rem' }}>Find your way</h2>
        
        <div className="home-portrait-grid">
          <div className="iiud-portrait-card">
            <div className="iiud-portrait-image" style={{ backgroundImage: 'url(/images/india_highschool_grad_1784867296522.png)' }}></div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>High school Graduate</h4>
          </div>
          <div className="iiud-portrait-card">
            <div className="iiud-portrait-image" style={{ backgroundImage: 'url(/images/india_sponsor_1784867308000.png)' }}></div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>Sponsor</h4>
          </div>
          <div className="iiud-portrait-card">
            <div className="iiud-portrait-image" style={{ backgroundImage: 'url(/images/india_institution_1784867318650.png)' }}></div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>Institution</h4>
          </div>
          <div className="iiud-portrait-card">
            <div className="iiud-portrait-image" style={{ backgroundImage: 'url(/images/india_affiliate_1784867329262.png)' }}></div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>Affiliate</h4>
          </div>
        </div>
      </div>

      {/* ════════ COURSES ════════ */}
      <div className="section-alt">
        <h2 className="section-title" style={{ margin: '0 0 2rem', paddingLeft: '1rem' }}>Search for a course</h2>
        

        <div className="home-courses-grid">
          {[
            { tag: 'Medical', title: 'Pharmacy and Nursing preparation', img: '/images/data.png' },
            { tag: 'Engineering', title: 'Bachelor in structural & Civil Engineering', img: '/images/civil.png' },
            { tag: 'Science', title: 'Computer Science and Engineering', img: '/images/cs.png' },
            { tag: 'Language', title: 'Regional Languages and Arts', img: '/images/arts.png' }
          ].map((course, i) => (
            <div key={i} className="iiud-course-card">
              <div className="iiud-course-image" style={{ backgroundImage: `url(${course.img})` }}></div>
              <div style={{ padding: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
                  <div style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%' }}></div> {course.tag}
                </span>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', lineHeight: '1.4' }}>{course.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════ RESEARCH & PUBLICATION ════════ */}
      <div className="section" style={{ background: 'white' }}>
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '3rem' }}>Research and Publication</h2>
        
        <div className="home-research-flex">
          <div className="home-research-main" style={{ background: '#fef3c7', borderRadius: '20px', overflow: 'hidden' }}>
            <img src="/images/india_students_1784866265313.png" style={{ width: '100%', height: '250px', objectFit: 'cover' }} alt="Research" />
            <div style={{ padding: '2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>Article</span>
              <h3 style={{ margin: '0.5rem 0', fontSize: 'clamp(1rem, 2vw, 1.4rem)', fontWeight: '800' }}>The paper on "Tech Innovations" published by Top Journals</h3>
            </div>
          </div>
          
          <div className="home-research-side">
            <div style={{ display: 'flex', gap: '1.5rem', background: '#f8f9fa', borderRadius: '20px', padding: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <img src="/images/media__1784726996698.png" style={{ width: '120px', height: '120px', borderRadius: '12px', objectFit: 'cover' }} alt="Publication" />
              <div style={{ flex: 1, minWidth: '150px' }}>
                <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: '700' }}>Publication</span>
                <h4 style={{ margin: '0.5rem 0 0', fontSize: '1.2rem', fontWeight: '700' }}>New research "On Time Data" by financial analytics</h4>
              </div>
            </div>
            <div style={{ background: '#11141a', color: 'white', borderRadius: '20px', padding: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flex: 1, flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ color: '#ffffff', fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', fontWeight: '700', margin: 0, maxWidth: '250px' }}>Explore more Research and publication</h3>
              <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                View all <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ════════ MORE ABOUT ════════ */}
      <div className="iiud-about">
        <div className="iiud-about-card anim-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '1rem' }}>
            <Globe size={18} /> About PaperBuddy
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '900', margin: '0 0 1rem' }}>More about University</h2>
          <p style={{ color: 'var(--text-light)', lineHeight: '1.7', marginBottom: '2rem' }}>
            We are dedicated to preparing students for a rapidly changing world by equipping them with critical thinking skills, a global perspective, and a respect for core values of honesty, loyalty, perseverance, and compassion.
          </p>
          
          <ul className="iiud-about-list">
            <li>Our History <ChevronRight size={20} color="var(--border-strong)" /></li>
            <li>Values & Goals <ChevronRight size={20} color="var(--border-strong)" /></li>
            <li className="active">Career at PaperBuddy <ChevronRight size={20} /></li>
            <li>Our Campus <ChevronRight size={20} color="var(--border-strong)" /></li>
            <li>Contact Us <ChevronRight size={20} color="var(--border-strong)" /></li>
          </ul>
        </div>
      </div>

      {/* ════════ INTRODUCING GRADUATES ════════ */}
      <div className="section" style={{ background: 'white', textAlign: 'center', paddingBottom: '8rem', overflow: 'hidden' }}>
        <div className="iiud-graduates-grid" style={{ maxWidth: '1200px', margin: '0 auto -6rem', padding: '0 2rem' }}>
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
             <div key={i} className="iiud-graduate-pic" style={{ backgroundImage: `url(/images/${i % 3 === 0 ? 'india_graduates_1784866276372.png' : i % 2 === 0 ? 'india_students_1784866265313.png' : 'media__1784726117891.png'})` }}></div>
          ))}
        </div>
        
        <div style={{ background: 'white', padding: '3rem', position: 'relative', zIndex: 10, display: 'inline-block', borderRadius: '24px', boxShadow: '0 -20px 60px rgba(255,255,255,0.95)' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800', margin: '0 0 0.5rem' }}>Introducing the Graduates</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>We are proud of our successful alumni who have achieved greatly after beginning their journey with us in India.</p>
          <button style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '14px 32px', borderRadius: '8px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
            View the Graduation Ceremony <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default Home;

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, BookOpen, Award, GraduationCap, Building, Beaker, Palette, Calculator, Globe, ChevronRight } from 'lucide-react';

/* ── animated counter hook ── */
const useCounter = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return [count, ref];
};

const Home = () => {
  const [students, studentsRef] = useCounter(10000);
  const [faculty, facultyRef] = useCounter(420);
  const [programs, programsRef] = useCounter(56);
  const [placement, placementRef] = useCounter(95);

  const departments = [
    { icon: Calculator, name: 'Computer Science', desc: 'AI, ML & Full-Stack Development', color: '#0ea5e9' },
    { icon: Building, name: 'Business Admin', desc: 'MBA & Entrepreneurship', color: '#f59e0b' },
    { icon: Beaker, name: 'Engineering', desc: 'Mechanical, Civil & Electrical', color: '#10b981' },
    { icon: Palette, name: 'Arts & Design', desc: 'Visual Arts & Communication', color: '#ec4899' },
    { icon: Globe, name: 'Sciences', desc: 'Physics, Chemistry & Biology', color: '#8b5cf6' },
    { icon: BookOpen, name: 'Humanities', desc: 'Literature, History & Philosophy', color: '#ef4444' },
  ];

  const news = [
    'Applications open for Fall 2027 intake',
    'New AI Research Lab inaugurated on campus',
    'PaperBuddy wins Best EduTech Platform award',
    'International student exchange with MIT announced',
    'Annual Tech Fest Registrations now open',
  ];

  return (
    <div className="public-page">

      {/* ════════ HERO ════════ */}
      <div className="section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3rem', paddingTop: '4rem', paddingBottom: '2rem' }}>
        <div style={{ flex: 1 }} className="anim-fade-left">
          <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.95rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Welcome to PaperBuddy
          </p>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: '900',
            lineHeight: '1.1',
            letterSpacing: '1px',
            fontFamily: "'Montserrat', sans-serif",
            marginBottom: '1.5rem',
          }}>
            <span style={{ color: 'var(--text-color)' }}>Discover</span><br/>
            <span style={{ color: 'var(--text-color)' }}>Knowledge,</span><br/>
            <span style={{ color: 'var(--text-color)' }}>Shape The </span>
            <span style={{ color: 'var(--primary)' }}>Future.</span>
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-light)',
            maxWidth: '500px',
            lineHeight: '1.7',
            marginBottom: '2.5rem',
            fontWeight: '500'
          }}>
            Experience world-class education at our premier Tamil Nadu campus. Smart fee management, seamless payments, and AI-powered financial insights — all in one platform.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Link to="/admission" className="glass-btn">
              Apply Now <ArrowRight size={18} />
            </Link>
            <Link to="/contact" className="glass-btn-outline">
              Explore Programs
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {[1, 2, 3].map((item, i) => (
              <div key={i} style={{
                width: '70px', height: '80px',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                background: `linear-gradient(135deg, var(--primary) ${i * 20}%, #8b5cf6)`,
                marginLeft: i > 0 ? '-15px' : 0,
                border: '3px solid var(--bg-color)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }} />
            ))}
            <span style={{ marginLeft: '0.8rem', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-light)' }}>10K+ Students</span>
          </div>
        </div>

        {/* Hero Image Block */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }} className="anim-fade-right">
          <div style={{
            width: '100%',
            maxWidth: '560px',
            aspectRatio: '1',
            backgroundImage: 'url(/images/cs.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '30% 70% 40% 60% / 55% 30% 70% 45%',
            boxShadow: '0 30px 60px rgba(0,0,0,0.12), 0 0 0 8px rgba(242,92,5,0.08)',
          }} />
        </div>
      </div>

      {/* ════════ STATS BAR ════════ */}
      <div className="section-alt">
        <div className="section-inner" style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          <div className="stat-card anim-fade-up anim-delay-1" ref={studentsRef}>
            <div className="stat-number">{students.toLocaleString()}+</div>
            <div className="stat-label">Students Enrolled</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-strong)', margin: '1rem 0' }} />
          <div className="stat-card anim-fade-up anim-delay-2" ref={facultyRef}>
            <div className="stat-number">{faculty}+</div>
            <div className="stat-label">Expert Faculty</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-strong)', margin: '1rem 0' }} />
          <div className="stat-card anim-fade-up anim-delay-3" ref={programsRef}>
            <div className="stat-number">{programs}+</div>
            <div className="stat-label">Programs Offered</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-strong)', margin: '1rem 0' }} />
          <div className="stat-card anim-fade-up anim-delay-4" ref={placementRef}>
            <div className="stat-number">{placement}%</div>
            <div className="stat-label">Placement Rate</div>
          </div>
        </div>
      </div>

      {/* ════════ NEWS TICKER ════════ */}
      <div className="section" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>✦ Stay in touch with updates</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-strong)' }} />
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {news.map((item, i) => (
            <div key={i} className="glass-card" style={{
              padding: '1.2rem 1.8rem',
              minWidth: '280px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexShrink: 0,
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-color)' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ════════ ADMISSION PREVIEW ════════ */}
      <div className="section-alt">
        <div className="section-inner">
          <div style={{ display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '320px' }} className="anim-fade-left">
              <div style={{
                width: '100%',
                height: '400px',
                backgroundImage: 'url(/images/arts.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
              }} />
            </div>
            <div style={{ flex: 1, minWidth: '320px' }} className="anim-fade-right">
              <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                Admissions Open
              </p>
              <h2 className="section-title" style={{ fontSize: '2.4rem' }}>
                Begin Your Journey With Us
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-light)', lineHeight: '1.7', marginBottom: '2rem', maxWidth: '480px' }}>
                Our streamlined admission process is designed to be simple, fast, and transparent. Apply online, upload your documents, and track your application status in real-time.
              </p>
              <Link to="/admission" className="glass-btn">
                Start Application <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ════════ FIND YOUR WAY / DEPARTMENTS ════════ */}
      <div className="section">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 className="section-title" style={{ textAlign: 'center' }}>Find Your Way</h2>
          <p className="section-subtitle center">Explore our diverse range of departments and programs to find the perfect fit for your academic journey.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {departments.map((dept, i) => {
            const Icon = dept.icon;
            return (
              <div key={i} className={`glass-card anim-fade-up anim-delay-${i % 5 + 1}`} style={{
                padding: '2rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1.5rem',
                cursor: 'pointer',
              }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: `${dept.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={26} color={dept.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', fontWeight: '700' }}>{dept.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: '1.5' }}>{dept.desc}</p>
                </div>
                <ChevronRight size={20} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '4px' }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ════════ COURSES GRID ════════ */}
      <div className="section-alt">
        <div className="section-inner">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Popular Courses</h2>
            <p className="section-subtitle center">Explore our most sought-after programs designed to shape the leaders of tomorrow.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              { title: 'Computer Science & AI', tag: 'B.Tech / M.Tech', img: '/images/cs.png' },
              { title: 'Business Administration', tag: 'BBA / MBA', img: '/images/business.png' },
              { title: 'Civil Engineering', tag: 'B.Tech', img: '/images/civil.png' },
              { title: 'Data Science', tag: 'M.Sc / PG Diploma', img: '/images/data.png' },
            ].map((course, i) => (
              <div key={i} className={`program-card anim-fade-up anim-delay-${i + 1}`}>
                <img src={course.img} alt={course.title} />
                <div className="program-card-overlay">
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', background: 'var(--primary)', padding: '0.25rem 0.6rem', borderRadius: '6px', marginBottom: '0.5rem', display: 'inline-block' }}>{course.tag}</span>
                  <h3>{course.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════ ABOUT / MORE INFO ════════ */}
      <div className="section">
        <div style={{ display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '320px' }} className="anim-fade-left">
            <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
              About Us
            </p>
            <h2 className="section-title" style={{ fontSize: '2.4rem' }}>
              More About PaperBuddy
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-light)', lineHeight: '1.8', marginBottom: '1.5rem', maxWidth: '520px' }}>
              PaperBuddy is a next-generation fee management platform designed for educational institutions across Tamil Nadu and beyond. We combine cutting-edge technology with intuitive design to make fee collection, financial reporting, and scholarship management effortless.
            </p>
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)' }}>50+</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Colleges Trust Us</div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)' }}>₹2Cr+</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Fees Processed</div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)' }}>99.9%</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Uptime</div>
              </div>
            </div>
            <Link to="/contact" className="glass-btn-outline">
              Learn More <ArrowRight size={18} />
            </Link>
          </div>
          <div style={{ flex: 1, minWidth: '320px' }} className="anim-fade-right">
            <div style={{
              width: '100%',
              height: '420px',
              backgroundImage: 'url(/images/mech.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
            }} />
          </div>
        </div>
      </div>

      {/* ════════ WHY CHOOSE US ════════ */}
      <div className="section-alt">
        <div className="section-inner">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 className="section-title" style={{ textAlign: 'center' }}>
              Why Choose Our <span style={{ color: 'var(--primary)' }}>Campus</span>?
            </h2>
            <p className="section-subtitle center">Our institution blends tradition with innovation, creating an ecosystem where academic excellence thrives.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {[
              { icon: Building, title: 'State-of-the-Art Facilities', desc: 'Modern campus blending traditional Tamil architectural aesthetics with cutting-edge technology, smart classrooms, and advanced research labs.', color: '#0ea5e9' },
              { icon: Award, title: 'Expert Faculty', desc: 'Learn from industry leaders and distinguished professors dedicated to fostering innovation, critical thinking, and academic excellence.', color: 'var(--primary)' },
              { icon: Users, title: 'Vibrant Student Life', desc: 'Join diverse cultural clubs, technical symposiums, and sports activities on a beautifully landscaped green campus in Tamil Nadu.', color: '#8b5cf6' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className={`glass-card anim-fade-up anim-delay-${i + 1}`} style={{ padding: '2.5rem' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: `${item.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.5rem',
                  }}>
                    <Icon size={26} color={item.color} />
                  </div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', fontWeight: '700' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-light)', lineHeight: '1.7', margin: 0 }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ════════ CTA ════════ */}
      <div className="section" style={{ textAlign: 'center', paddingBottom: '5rem' }}>
        <h2 className="section-title" style={{ textAlign: 'center' }}>
          Ready to Begin Your <span style={{ color: 'var(--primary)' }}>Academic Journey</span>?
        </h2>
        <p className="section-subtitle center">
          Join thousands of students who have already discovered their potential with us. Take the first step today.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/admission" className="glass-btn">
            Apply Now <ArrowRight size={18} />
          </Link>
          <Link to="/contact" className="glass-btn-outline">
            Talk to Us
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Home;

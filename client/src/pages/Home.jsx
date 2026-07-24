import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="app-container" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: 'calc(100vh - 72px)', 
      padding: '2rem 4rem',
      gap: '4rem'
    }}>
      
      {/* Hero Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
        {/* Left Content */}
        <div style={{ flex: 1, paddingRight: '2rem' }}>
          <h1 style={{ 
            fontSize: '4.5rem', 
            fontWeight: '900',
            lineHeight: '1.2',
            letterSpacing: '2px',
            fontFamily: "'Montserrat', sans-serif",
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <span style={{ color: 'var(--primary)' }}>DISCOVER</span>
            <span style={{ color: 'var(--text-color)' }}>KNOWLEDGE</span>
            <span style={{ color: 'var(--text-color)' }}>SHAPE THE</span>
            <span style={{ color: '#2b90ff' }}>FUTURE</span>
          </h1>

          <p style={{ 
            fontSize: '1.1rem', 
            color: 'var(--text-light)', 
            maxWidth: '500px', 
            lineHeight: '1.6',
            marginBottom: '2.5rem',
            fontWeight: '500'
          }}>
            Experience world-class education at our premier Tamil Nadu campus. We believe in the transformative power of education and its impact on society.
          </p>

          <Link 
            to="/admission" 
            className="glass-btn"
            style={{ marginBottom: '3rem' }}
          >
            Admission &rarr;
          </Link>

          {/* Hexagon Images */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{
              width: '80px', height: '90px',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              backgroundImage: 'url(/images/tn_students_1_1784727552837.png)',
              backgroundSize: 'cover', backgroundPosition: 'center',
              border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }} />
            <div style={{
              width: '80px', height: '90px',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              backgroundImage: 'url(/images/tn_library_1784727639230.png)',
              backgroundSize: 'cover', backgroundPosition: 'center',
              border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginLeft: '-20px'
            }} />
            <div style={{
              width: '80px', height: '90px',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              backgroundImage: 'url(/images/tn_college_campus_1784727527500.png)',
              backgroundSize: 'cover', backgroundPosition: 'center',
              border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginLeft: '-20px'
            }} />
          </div>
        </div>

        {/* Right Content - Abstract Image Shape */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
          <div style={{
            width: '600px',
            height: '600px',
            backgroundImage: 'url(/images/tn_college_campus_1784727527500.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '25% 75% 33% 67% / 60% 26% 74% 40%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }} />
        </div>
      </div>

      {/* Features Section */}
      <div style={{ marginTop: '2rem', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', color: 'var(--text-color)' }}>
          Why Choose Our <span style={{ color: 'var(--primary)' }}>Tamil Nadu Campus</span>?
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2b90ff' }}>State-of-the-Art Facilities</h3>
            <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>
              Our modern campus perfectly blends traditional Tamil architectural aesthetics with cutting-edge technology, smart classrooms, and advanced research labs.
            </p>
          </div>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>Expert Faculty</h3>
            <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>
              Learn from industry leaders and distinguished professors dedicated to fostering innovation, critical thinking, and academic excellence.
            </p>
          </div>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#8b5cf6' }}>Vibrant Student Life</h3>
            <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>
              Join diverse cultural clubs, technical symposiums, and sports activities on a beautifully landscaped green campus in the heart of Tamil Nadu.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;


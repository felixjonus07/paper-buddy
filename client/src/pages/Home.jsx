import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Clock, Calendar, Users, GraduationCap, IndianRupee } from 'lucide-react';
import Typewriter from 'typewriter-effect';

/* ── Avatar Stack ─────────────────────────── */
const AvatarStack = () => (
  <div style={{ display: 'flex', flexShrink: 0 }}>
    {['#e07b3a', '#b85c1a'].map((bg, i) => (
      <div key={i} style={{
        width: 24, height: 24, borderRadius: '50%',
        background: bg, border: '2px solid white',
        marginLeft: i === 0 ? 0 : -8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, color: 'white', fontWeight: 700,
        zIndex: 2 - i,
      }}>
        {String.fromCharCode(65 + i)}
      </div>
    ))}
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="lp-root">
      <section className="lp-hero">

        <div className="lp-col lp-col-left">
          <div className="lp-float lp-float-1">
            <div className="lp-sticky-note">
              <div className="lp-pin" />
              <p className="lp-sticky-text">
                Smart financing<br />
                solutions for a<br />
                brighter academic<br />
                tomorrow.
              </p>
            </div>
          </div>

          {/* checkbox card */}
          <div className="lp-float lp-float-2">
            <div className="lp-checkbox-card">
              <div className="lp-checkbox-icon">
                <Check size={24} strokeWidth={3} color="white" />
              </div>
            </div>
          </div>

          {/* tasks card */}
          <div className="lp-float lp-float-3">
            <div className="lp-tasks-card lp-card">
              <div className="lp-tasks-title">Today's tasks</div>

              <div className="lp-task-row">
                <div className="lp-task-num">1</div>
                <div className="lp-task-body">
                  <div className="lp-task-name">Verify scholarship applications</div>
                  <div className="lp-task-meta">
                    <span className="lp-task-date">Sep 10</span>
                    <div className="lp-prog-track"><div className="lp-prog-fill" style={{ width: '60%' }} /></div>
                    <span className="lp-task-pct">60%</span>
                  </div>
                </div>
                <AvatarStack />
              </div>

              <div className="lp-task-row">
                <div className="lp-task-num">2</div>
                <div className="lp-task-body">
                  <div className="lp-task-name">Fee collection summary</div>
                  <div className="lp-task-meta">
                    <span className="lp-task-date">Sep 18</span>
                    <div className="lp-prog-track"><div className="lp-prog-fill" style={{ width: '100%' }} /></div>
                    <span className="lp-task-pct">112%</span>
                  </div>
                </div>
                <AvatarStack />
              </div>
            </div>
          </div>

        </div>

        {/* ─── CENTER COLUMN ─── */}
        <div className="lp-col lp-col-center" style={{ minWidth: 0, width: '100%' }}>
          <div className="lp-logo-pill">
            <img src="/images/Logo.png" alt="PaperBuddy" className="lp-logo-img" />
          </div>
          <div style={{ width: '100%', height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h1 className="lp-headline" style={{ width: '100%', margin: 0 }}>
            <Typewriter
              options={{
                autoStart: true,
                loop: true,
                delay: 60,
                deleteSpeed: 30
              }}
              onInit={(typewriter) => {
                typewriter
                  .typeString('Funding futures,<br /><span class="lp-headline-orange">simplifying learning.</span>')
                  .pauseFor(2500)
                  .deleteAll()
                  .typeString('Smart financing,<br /><span class="lp-headline-orange">task tracking.</span>')
                  .pauseFor(2500)
                  .deleteAll()
                  .typeString('Seamless management<br /><span class="lp-headline-orange">for educational institutions.</span>')
                  .pauseFor(2500)
                  .start();
              }}
            />
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className="lp-cta" onClick={() => navigate('/login')}>
              {localStorage.getItem('token') ? 'Dashboard' : 'Get Started'}
            </button>
            <a 
              href="https://github.com/felixjonus07/paper-buddy" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="lp-cta" 
              style={{ background: '#24292e', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', boxShadow: '0 8px 24px rgba(36, 41, 46, 0.4)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>

        {/* ─── RIGHT COLUMN ─── */}
        <div className="lp-col lp-col-right">

          {/* clock */}
          <div className="lp-float lp-float-4">
            <div className="lp-clock-bubble">
              <Clock size={28} color="#f25c05" strokeWidth={1.8} />
            </div>
          </div>

          {/* pending fees */}
          <div className="lp-float lp-float-5">
            <div className="lp-fees-card lp-card">
              <div className="lp-fees-header">
                <span className="lp-fees-title">Pending Fees</span>
                <span className="lp-fees-badge">Due Payments</span>
              </div>
              <div className="lp-fees-label">Total Due</div>
              <div className="lp-fees-amount">₹ 45,600</div>
              <div className="lp-fees-divider" />
              <div className="lp-fees-due-row">
                <div>
                  <div className="lp-fees-label">Due Date</div>
                  <div className="lp-fees-date">15 Sep 2025</div>
                </div>
                <Calendar size={16} color="#f25c05" />
              </div>
            </div>
          </div>

          {/* integrations */}
          <div className="lp-float lp-float-6">
            <div className="lp-int-card lp-card">
              <div className="lp-int-title">100+ Integrations</div>
              <div className="lp-int-icons">
                <div className="lp-int-icon"><Users size={26} color="#f25c05" /></div>
                <div className="lp-int-icon lp-int-icon-raised"><GraduationCap size={26} color="#f25c05" /></div>
                <div className="lp-int-icon"><IndianRupee size={26} color="#f25c05" /></div>
              </div>
            </div>
          </div>

        </div>

      </section>
    </div>
  );
};

export default Home;

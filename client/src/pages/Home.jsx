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

        {/* ─── LEFT COLUMN ─── */}
        <div className="lp-col lp-col-left">

          {/* sticky note */}
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
          <button className="lp-cta" onClick={() => navigate('/login')}>
            Get free demo
          </button>
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

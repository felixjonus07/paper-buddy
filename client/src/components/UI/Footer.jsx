import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <h2>
              <GraduationCap size={28} color="var(--primary)" strokeWidth={2.5} />
              PaperBuddy
            </h2>
            <p>
              Empowering educational institutions with smart fee management, seamless payments, and intelligent financial oversight.
            </p>
          </div>

          <div className="footer-links">
            <div>
              <h4>Navigate</h4>
              <Link to="/">Home</Link>
              <Link to="/admission">Admission</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/login">Login</Link>
            </div>
            <div>
              <h4>Resources</h4>
              <Link to="/admission">Apply Now</Link>
              <Link to="/contact">Support</Link>
              <Link to="/">Programs</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            <span>PaperBuddy</span> — Powered by <span>Team E.D.I.T.H</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

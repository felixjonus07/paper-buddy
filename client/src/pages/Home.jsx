import React from 'react';
import { Link } from 'react-router-dom';
import NeoCard from '../components/UI/NeoCard';
import NeoButton from '../components/UI/NeoButton';
import { GraduationCap, Wallet, BookOpen } from 'lucide-react';

const Home = () => {
  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '90vh' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}>
          <GraduationCap size={48} style={{ verticalAlign: 'middle', marginRight: '1rem' }} />
          EduFin
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Empowering your college journey with smart financial solutions. Manage tuition, apply for grants, and build your financial literacy.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '4rem' }}>
        <NeoCard style={{ width: '300px', textAlign: 'center' }}>
          <Wallet size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3>Financial Tracking</h3>
          <p>Easily track your college expenses, tuition fees, and living costs in one place.</p>
        </NeoCard>

        <NeoCard style={{ width: '300px', textAlign: 'center' }}>
          <GraduationCap size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3>Grants & Loans</h3>
          <p>Apply for student-friendly micro-loans and discover scholarships matched for you.</p>
        </NeoCard>

        <NeoCard style={{ width: '300px', textAlign: 'center' }}>
          <BookOpen size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3>Financial Literacy</h3>
          <p>Access exclusive modules to learn about budgeting, saving, and smart investing.</p>
        </NeoCard>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/login">
          <NeoButton variant="primary">Get Started</NeoButton>
        </Link>
        <NeoButton variant="secondary">Learn More</NeoButton>
      </div>

    </div>
  );
};

export default Home;

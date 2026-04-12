import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import Button from '../common/Button';

const LandingHero = () => {
  return (
    <section className="hero-section container">
      <div className="hero-container glass animate-fade-in">
        <div className="hero-content">
          <div className="badge-wrapper">
            <span className="premium-badge">
              <Star size={14} fill="currentColor" /> India's Trusted Healthcare Network
            </span>
          </div>
          <h1 className="hero-title">
            Book Medical<br />
            <span className="text-gradient">Appointments Smartly</span>
          </h1>
          <p className="hero-description">
            Connect with India's leading medical experts and flagship hospitals through our
            seamless, verified booking ecosystem. Trusted by 1,200+ patients.
          </p>
          <div className="hero-btns">
            <Link to="/register">
              <Button size="lg" className="btn-glow">
                Get Started Free <ArrowRight size={20} />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">Browse Specialists</Button>
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="/hero-healthcare.png"
            alt="Smart Healthcare Appointment Booking"
            className="hero-img"
          />
        </div>
      </div>
    </section>
  );
};

export default LandingHero;

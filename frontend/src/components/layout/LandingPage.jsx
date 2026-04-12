import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LandingHero from './LandingHero';
import TrustStatsBar from './TrustStatsBar';
import FeatureGrid from './FeatureGrid';
import BookingJourney from './BookingJourney';
import HealthPassport from './HealthPassport';
import NationalNetwork from './NationalNetwork';
import Button from '../common/Button';
import api from '../../api';

const LandingPage = () => {
  const [stats, setStats] = useState({
    hospitals: 36,
    experts: 450,
    specialties: 24,
    appointments: 1250
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats');
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <LandingHero />

      {/* Stats Section */}
      {!loading && <TrustStatsBar stats={stats} />}

      {/* Features Section */}
      <FeatureGrid />

      {/* Booking Journey Section */}
      <BookingJourney />

      {/* Health Passport Section */}
      <HealthPassport />

      {/* National Network Showcase */}
      <NationalNetwork />

      {/* Final Call to Action */}
      <section className="cta-final section container animate-fade-in text-center">
        <div className="ui-card p-lg glass">
          <h2 className="section-title-large">Ready to prioritize your health?</h2>
          <p className="section-subtitle">Join thousands of patients who trust SmartBook for their medical needs across India.</p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="btn-glow">Create Your Free Account</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

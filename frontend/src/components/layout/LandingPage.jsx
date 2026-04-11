import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  ShieldCheck, 
  Users, 
  Hospital, 
  ArrowRight, 
  CheckCircle, 
  Stethoscope, 
  Star,
  Activity,
  Award,
  Globe
} from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import api from '../../api';

const LandingPage = () => {
  const [stats, setStats] = useState({
    hospitals: 36,
    experts: 450,
    specialties: 24,
    appointments: 1250
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats');
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, []);

  const features = [
    { 
      icon: ShieldCheck, 
      title: "Verified Experts", 
      desc: "Every provider undergoes a multi-step verification process to ensure your safety.",
      color: "#10b981" 
    },
    { 
      icon: Activity, 
      title: "Real-time Tracking", 
      desc: "Get instant SMS and in-app alerts as soon as your booking status changes.",
      color: "#3b82f6" 
    },
    { 
      icon: Award, 
      title: "National Coverage", 
      desc: "Flagship hospital partnerships across every Indian State and Union Territory.",
      color: "#f59e0b" 
    }
  ];

  const flagshipLocations = [
    "New Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Lucknow"
  ];

  return (
    <div className="landing-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container glass">
          <div className="hero-content">
            <div className="badge-wrapper animate-bounce-in">
              <span className="premium-badge">
                <Star size={14} fill="currentColor" /> National Healthcare Network
              </span>
            </div>
            <h1>Book Your Medical <br /> <span className="text-gradient">Appointments Smartly</span></h1>
            <p className="hero-description">
              Connect with India's leading medical experts and flagship hospitals through our 
              seamless, verified booking ecosystem.
            </p>
            <div className="hero-btns">
              <Link to="/register">
                <Button size="lg" className="btn-glow">
                  Get Started Now <ArrowRight size={20} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">Browse Specialists</Button>
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card glass card-1">
              <CheckCircle color="#10b981" />
              <span>Verified Doctor</span>
            </div>
            <div className="floating-card glass card-2">
              <Calendar color="#3b82f6" />
              <span>Instant Confirmation</span>
            </div>
            <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600" alt="Healthcare" className="hero-img" />
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="stats-section container">
        <div className="stats-grid-landing">
          <div className="stat-item-premium">
            <h3>{stats.hospitals}+</h3>
            <p><Hospital size={16} /> Flagship Hospitals</p>
          </div>
          <div className="stat-item-premium">
            <h3>{stats.experts}+</h3>
            <p><Users size={16} /> Medical Experts</p>
          </div>
          <div className="stat-item-premium">
            <h3>{stats.specialties}+</h3>
            <p><Stethoscope size={16} /> Specializations</p>
          </div>
          <div className="stat-item-premium">
            <h3>{stats.appointments}+</h3>
            <p><Award size={16} /> Successful Visits</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section container">
        <div className="section-header-center">
          <h2 className="section-title-large">Why Choose SmartBook?</h2>
          <p>We prioritize your health by bridging the gap between you and world-class care.</p>
        </div>
        <div className="features-grid-premium">
          {features.map((f, i) => (
            <div key={i} className="feature-card-premium glass">
              <div className="feature-icon-box" style={{ background: `${f.color}15`, color: f.color }}>
                <f.icon size={28} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* National Network Showcase */}
      <section className="network-section">
        <div className="container glass network-container">
          <div className="network-info">
            <Globe size={48} className="network-icon" />
            <h2>Bharat Healthcare Network</h2>
            <p>Our presence spans across all 36 States and Union Territories, connecting rural and urban centers to flagship medical facilities.</p>
            <div className="location-chips">
              {flagshipLocations.map(loc => (
                <span key={loc} className="loc-chip">{loc}</span>
              ))}
              <span className="loc-chip more">+28 more States</span>
            </div>
          </div>
          <div className="network-cta">
             <Link to="/register">
               <Button variant="outline" className="w-full">Join the Network</Button>
             </Link>
          </div>
        </div>
      </section>

      {/* Simple "How it Works" Footer */}
      <section className="cta-final text-center">
        <h2>Ready to prioritize your health?</h2>
        <p>Join thousands of patients who trust SmartBook for their medical needs.</p>
        <Link to="/register" className="mt-6">
          <Button size="lg">Create Your Free Account</Button>
        </Link>
      </section>
    </div>
  );
};

export default LandingPage;

import React from 'react';
import { ShieldCheck, Activity, Award, HeartPulse, Search, CalendarCheck } from 'lucide-react';
import '../ui/ui.css';

const FeatureGrid = () => {
  const features = [
    { 
      icon: ShieldCheck, 
      title: "Verified Experts", 
      desc: "Every provider undergoes a multi-step verification process to ensure your safety and trust.",
      color: "#4f46e5" 
    },
    { 
      icon: Activity, 
      title: "Real-time Tracking", 
      desc: "Get instant SMS and in-app alerts as soon as your booking status changes in our ecosystem.",
      color: "#0ea5e9" 
    },
    { 
      icon: Award, 
      title: "National Coverage", 
      desc: "Flagship hospital partnerships across every Indian State and Union Territory.",
      color: "#f59e0b" 
    },
    { 
      icon: HeartPulse, 
      title: "Health First", 
      desc: "Comprehensive health monitoring and history tracking integrated into your profile.",
      color: "#ef4444" 
    },
    { 
      icon: Search, 
      title: "Easy Discovery", 
      desc: "Find the right specialist near you using our advanced AI-powered search filters.",
      color: "#8b5cf6" 
    },
    { 
      icon: CalendarCheck, 
      title: "Flexible Scheduling", 
      desc: "Easily reschedule or cancel appointments with our user-friendly interface.",
      color: "#10b981" 
    }
  ];

  return (
    <section className="features-section section container">
      <div className="section-header-center animate-fade-in">
        <h2 className="section-title-large">Better Healthcare, <span className="text-gradient">Simply Delivered</span></h2>
        <p className="section-subtitle">We bridge the gap between world-class medical facilities and patients across India with technology-first solutions.</p>
      </div>
      <div className="grid-3">
        {features.map((f, i) => (
          <div key={i} className="feature-card-premium ui-card p-md animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="feature-icon-box" style={{ background: `${f.color}08`, color: f.color }}>
              <f.icon size={26} strokeWidth={2.5} />
            </div>
            <h3>{f.title}</h3>
            <p className="text-muted">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureGrid;

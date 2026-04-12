import React from 'react';
import { Hospital, Users, Stethoscope, CheckCircle, Calendar, Activity } from 'lucide-react';
import Card from '../common/Card';

const TrustStatsBar = ({ stats }) => {
  const items = [
    {
      type: 'trust',
      icon: <CheckCircle size={24} className="text-success" />,
      label: 'Verified Doctor',
      description: 'Medical Experts'
    },
    {
      type: 'trust',
      icon: <Calendar size={24} className="text-primary" />,
      label: 'Instant Booking',
      description: 'Direct Confirmation'
    },
    {
      type: 'stat',
      value: `${stats.hospitals}+`,
      label: 'Flagship Hospitals',
      icon: <Hospital size={20} />
    },
    {
      type: 'stat',
      value: `${stats.experts}+`,
      label: 'Medical Experts',
      icon: <Users size={20} />
    },
    {
      type: 'stat',
      value: `${stats.specialties}+`,
      label: 'Specializations',
      icon: <Stethoscope size={20} />
    }
  ];

  return (
    <div className="trust-stats-section container">
      <div className="trust-bar-header-outer">
         <Activity size={18} className="text-primary" />
         <span>Smart Healthcare Appointment Booking</span>
      </div>
      <div className="stats-cards-grid">
        {items.map((item, index) => (
          <div key={index} className="stat-card-premium glass-card animate-fade-in shadow-hover" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="stat-card-inner">
              <div className={`stat-icon-box ${item.type === 'trust' ? 'bg-light' : ''}`}>
                {item.icon}
              </div>
              <div className="stat-card-content">
                {item.type === 'stat' ? (
                  <>
                    <span className="stat-card-number">{item.value}</span>
                    <span className="stat-card-label">{item.label}</span>
                  </>
                ) : (
                  <>
                    <span className="stat-card-title">{item.label}</span>
                    <span className="stat-card-desc">{item.description}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustStatsBar;

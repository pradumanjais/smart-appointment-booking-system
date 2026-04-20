import React from 'react';
import { Hospital, Users, Stethoscope, CheckCircle, Calendar, Activity } from 'lucide-react';
import Card from '../common/Card';

const TrustStatsBar = ({ stats }) => {
  const items = [
    {
      type: 'trust',
      icon: <CheckCircle size={22} />,
      label: 'Verified Doctor',
      description: 'Medical Experts',
      accentClass: 'bg-success-light'
    },
    {
      type: 'trust',
      icon: <Calendar size={22} />,
      label: 'Instant Booking',
      description: 'Direct Confirmation',
      accentClass: 'bg-primary-light'
    },
    {
      type: 'stat',
      value: `${stats.hospitals}+`,
      label: 'Flagship Hospitals',
      icon: <Hospital size={20} />,
      accentClass: 'bg-primary-light'
    },
    {
      type: 'stat',
      value: `${stats.experts}+`,
      label: 'Medical Experts',
      icon: <Users size={20} />,
      accentClass: 'bg-primary-light'
    },
    {
      type: 'stat',
      value: `${stats.specialties}+`,
      label: 'Specializations',
      icon: <Stethoscope size={20} />,
      accentClass: 'bg-primary-light'
    }
  ];

  return (
    <div className="trust-stats-section container">
      <div className="trust-bar-header-outer">
         <Activity size={16} className="text-primary" />
         <span>Smart Healthcare Appointment Booking</span>
      </div>
      <div className="stats-cards-grid">
        {items.map((item, index) => (
          <div key={index} className="stat-card-premium animate-fade-in shadow-hover" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="stat-card-inner">
              <div className={`stat-icon-box ${item.accentClass}`}>
                {item.icon}
              </div>
              <div className="stat-card-content">
                {item.type === 'stat' ? (
                  <>
                    <h3 className="stat-card-number">{item.value}</h3>
                    <span className="stat-card-label">{item.label}</span>
                  </>
                ) : (
                  <>
                    <h3 className="stat-card-title">{item.label}</h3>
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

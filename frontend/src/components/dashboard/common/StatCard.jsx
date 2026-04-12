import React from 'react';
import './dashboard-components.css';

const StatCard = ({ label, value, icon: Icon, variant = 'indigo' }) => {
  const variants = {
    indigo: { iconBg: 'rgba(79, 70, 229, 0.1)', iconColor: '#4f46e5' },
    emerald: { iconBg: 'rgba(16, 185, 129, 0.1)', iconColor: '#10b981' },
    amber: { iconBg: 'rgba(245, 158, 11, 0.1)', iconColor: '#f59e0b' },
    rose: { iconBg: 'rgba(244, 63, 94, 0.1)', iconColor: '#f43f5e' }
  };

  const style = variants[variant] || variants.indigo;

  return (
    <div className="stat-card-base">
      <div className="stat-card-icon" style={{ backgroundColor: style.iconBg, color: style.iconColor }}>
        <Icon size={24} />
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
};

export default StatCard;

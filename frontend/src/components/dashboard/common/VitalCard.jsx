import React from 'react';

const VitalCard = ({ label, value, icon: Icon, color = 'blue' }) => {
  const colorMap = {
    blue: { bg: '#eff6ff', text: '#2563eb' },
    green: { bg: '#f0fdf4', text: '#16a34a' },
    orange: { bg: '#fff7ed', text: '#ea580c' },
    purple: { bg: '#f5f3ff', text: '#7c3aed' },
    red: { bg: '#fff1f2', text: '#e11d48' }
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <div className="vital-card-premium" style={{ 
      backdropFilter: 'blur(10px)', 
      background: 'rgba(255, 255, 255, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: 'var(--elevation-shadow)'
    }}>
      <div className="vital-icon-box" style={{ background: theme.bg, color: theme.text }}>
        <Icon size={16} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{label}</label>
        <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px' }}>{value}</span>
      </div>
    </div>
  );
};

export default VitalCard;

import React from 'react';

const ProfileInfoPack = ({ title, icon: Icon, children, color = 'var(--primary)', columns }) => {
  return (
    <div className="glass-stat" style={{ 
      padding: '32px', 
      borderRadius: '35px', 
      background: 'rgba(255,255,255,0.7)', 
      border: '1px solid rgba(255,255,255,0.5)',
      boxShadow: 'var(--premium-shadow)'
    }}>
      <div className="pack-header-premium">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ color: color }}>
            <Icon size={22} strokeWidth={2.5} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#1e293b' }}>{title}</h3>
        </div>
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: columns ? `repeat(${columns}, 1fr)` : 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '16px' 
      }}>
        {children}
      </div>
    </div>
  );
};

export default ProfileInfoPack;

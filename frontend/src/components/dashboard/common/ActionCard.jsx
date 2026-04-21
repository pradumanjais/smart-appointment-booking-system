import React from 'react';
import { ChevronRight } from 'lucide-react';
import './dashboard-components.css';

const ActionCard = ({ title, description, icon: Icon, onClick, variant = 'indigo', centered = false }) => {
  const variants = {
    indigo: { 
      iconBg: 'rgba(79, 70, 229, 0.12)', 
      iconColor: '#4f46e5', 
      cardBg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(238, 242, 255, 0.4) 100%)',
      titleColor: '#1e1b4b',
      descColor: '#4338ca',
      borderColor: 'rgba(79, 70, 229, 0.1)'
    },
    emerald: { 
      iconBg: 'rgba(16, 185, 129, 0.12)', 
      iconColor: '#10b981',
      cardBg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(236, 253, 245, 0.4) 100%)',
      titleColor: '#064e3b',
      descColor: '#047857',
      borderColor: 'rgba(16, 185, 129, 0.1)'
    },
    amber: { 
      iconBg: 'rgba(245, 158, 11, 0.12)', 
      iconColor: '#f59e0b',
      cardBg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 251, 235, 0.4) 100%)',
      titleColor: '#78350f',
      descColor: '#b45309',
      borderColor: 'rgba(245, 158, 11, 0.1)'
    },
    rose: { 
      iconBg: 'rgba(244, 63, 94, 0.12)', 
      iconColor: '#f43f5e',
      cardBg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 241, 242, 0.4) 100%)',
      titleColor: '#881337',
      descColor: '#be123c',
      borderColor: 'rgba(244, 63, 94, 0.1)'
    },
    violet: { 
      iconBg: 'rgba(139, 92, 246, 0.15)', 
      iconColor: '#8b5cf6', 
      cardBg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(245, 243, 255, 0.5) 100%)',
      titleColor: '#2e1065',
      descColor: '#5b21b6',
      borderColor: 'rgba(139, 92, 246, 0.25)'
    }
  };

  const style = variants[variant] || variants.indigo;

  return (
    <div 
      className="action-card-base stat-card-base" 
      onClick={onClick} 
      style={{ 
        cursor: 'pointer',
        background: style.cardBg,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${style.borderColor}`,
        boxShadow: variant === 'violet' ? '0 8px 32px rgba(139, 92, 246, 0.08)' : '0 4px 12px rgba(0, 0, 0, 0.03)',
        flexDirection: centered ? 'column' : 'row',
        alignItems: centered ? 'center' : 'center',
        textAlign: centered ? 'center' : 'left',
        gap: centered ? '8px' : '16px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle background glow for glassy look */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: `radial-gradient(circle at 70% 30%, ${style.iconColor}08 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />

      <div className="stat-card-icon" style={{ backgroundColor: style.iconBg, color: style.iconColor, marginBottom: centered ? '8px' : 0, borderRadius: '14px' }}>
        <Icon size={centered ? 32 : 24} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: centered ? 'center' : 'flex-start', position: 'relative', zIndex: 1 }}>
        <h4 className="action-card-title" style={{ margin: '8px 0 4px 0', fontSize: '1.2rem', fontWeight: 900, color: style.titleColor }}>{title}</h4>
        <p className="action-card-desc" style={{ fontSize: '0.85rem', color: style.descColor, fontWeight: 500, lineHeight: '1.5', margin: 0, whiteSpace: 'pre-line' }}>{description}</p>
      </div>
      {!centered && (
        <div className="action-card-arrow" style={{ marginTop: '12px', opacity: 0.7 }}>
          <ChevronRight size={18} color={style.iconColor} />
        </div>
      )}
    </div>
  );
};

export default ActionCard;

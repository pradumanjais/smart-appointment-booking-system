import React from 'react';
import { Star, MapPin, Video, Clock, ChevronRight, ShieldCheck, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();
  const {
    _id,
    userId,
    specialization,
    experience,
    rating,
    consultationFees,
    consultationModes,
    clinicName,
    location,
    isVerified = true
  } = doctor;

  return (
    <div style={{
      background: 'white',
      borderRadius: '24px',
      padding: '24px',
      border: '1px solid #f1f5f9',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      position: 'relative',
      cursor: 'pointer',
      textDecoration: 'none',
      color: 'inherit',
      overflow: 'visible' /* Let the badge pop out if needed */
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-6px)';
      e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(99, 102, 241, 0.15)';
      e.currentTarget.style.borderColor = '#c7d2fe';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05)';
      e.currentTarget.style.borderColor = '#f1f5f9';
    }}
    >
      {/* Top Section */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ position: 'relative' }}>
          <img 
            src={userId?.avatar || 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'} 
            alt={userId?.name} 
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '20px', 
              objectFit: 'cover',
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }} 
          />
          {isVerified && (
            <div title="Verified Professional" style={{
              position: 'absolute',
              bottom: '-6px',
              right: '-6px',
              background: '#10b981',
              color: 'white',
              borderRadius: '50%',
              padding: '6px',
              border: '3px solid white',
              display: 'flex',
              boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)'
            }}>
              <ShieldCheck size={14} strokeWidth={3} />
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ overflow: 'hidden' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Dr. {userId?.name}
              </h3>
              <p style={{ color: '#4f46e5', fontWeight: 800, fontSize: '0.85rem', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {specialization}
              </p>
            </div>
            
            {/* Rating Badge */}
            <div style={{ 
              background: '#fef9c3', 
              padding: '4px 8px', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              flexShrink: 0
            }}>
              <Star size={14} fill="#eab308" color="#eab308" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#a16207' }}>
                {rating > 0 ? rating.toFixed(1) : 'New'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              <Award size={14} color="#94a3b8" />
              <span>{experience || '0'} Yrs Exp.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              <MapPin size={14} color="#94a3b8" />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>
                {location || clinicName || 'Unavailable'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Fees Breakdown */}
      <div style={{ 
        background: 'linear-gradient(to right, #f8fafc, #f1f5f9)', 
        borderRadius: '16px', 
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: consultationFees?.inPerson != null && consultationFees?.online != null ? '1fr 1fr 1fr' : '1fr 1fr',
        gap: '12px',
        alignItems: 'center',
        border: '1px solid #e2e8f0'
      }}>
        {consultationFees?.inPerson != null && (
          <div>
            <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={10} /> In-Person
            </p>
            <p style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 900, margin: 0 }}>
              ₹{consultationFees.inPerson}
            </p>
          </div>
        )}
        {consultationFees?.online != null && (
          <div>
            <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Video size={10} /> Online
            </p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, margin: 0, fontStyle: 'italic' }}>
              Coming Soon
            </p>
          </div>
        )}
        {(!consultationFees || (consultationFees.inPerson == null && consultationFees.online == null)) && (
          <div>
            <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Fee</p>
            <p style={{ fontSize: '1.15rem', color: '#94a3b8', fontWeight: 900, margin: 0 }}>Not listed</p>
          </div>
        )}
        <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Status</p>
            <p style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
              Available
            </p>
        </div>
      </div>

      {/* Footer: Capabilities & Action */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
            {consultationModes?.includes('Video') && (
                <div title="Video Consultation" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: '#e0e7ff', color: '#4f46e5' }}>
                    <Video size={16} strokeWidth={2.5} />
                </div>
            )}
            {consultationModes?.includes('In-person') && (
                <div title="Clinic Visit" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: '#dcfce7', color: '#166534' }}>
                    <MapPin size={16} strokeWidth={2.5} />
                </div>
            )}
        </div>
        
        <button 
          onClick={() => navigate('/dashboard', { state: { bookDoctor: doctor } })}
          style={{ 
            background: '#6366f1',
            color: 'white',
            padding: '10px 24px',
            borderRadius: '14px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#4f46e5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#6366f1'; }}
        >
          Book <ChevronRight size={16} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;

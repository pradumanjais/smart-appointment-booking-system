import React from 'react';
import { Star, MapPin, Video, Clock, ChevronRight, ShieldCheck, Award } from 'lucide-react';
import Button from '../common/Button';

const DoctorCard = ({ doctor }) => {
  const {
    userId,
    specialization,
    experience,
    rating,
    consultationFees,
    consultationModes,
    clinicName,
    location,
    isVerified = true // Default for UI demo
  } = doctor;

  return (
    <div className="doctor-card animate-fade-in" style={{
      background: 'white',
      borderRadius: '24px',
      padding: '24px',
      border: '1px solid #f1f5f9',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Section: Photo & Identity */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div className="doctor-avatar-wrapper" style={{ position: 'relative' }}>
          <img 
            src={userId?.avatar || 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'} 
            alt={userId?.name} 
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '20px', 
              objectFit: 'cover',
              background: '#f8fafc'
            }} 
          />
          {isVerified && (
            <div style={{
              position: 'absolute',
              bottom: '-5px',
              right: '-5px',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '50%',
              padding: '4px',
              border: '3px solid white',
              display: 'flex'
            }}>
              <ShieldCheck size={14} />
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                Dr. {userId?.name}
              </h3>
              <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
                {specialization}
              </p>
            </div>
            <div style={{ 
              background: '#fffbeb', 
              padding: '4px 10px', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              border: '1px solid #fef3c7'
            }}>
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#92400e' }}>{rating || '4.8'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
              <Award size={14} />
              <span>{experience || '8'}+ Years Exp.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
              <MapPin size={14} />
              <span>{location || 'Mumbai, MH'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Practice Details */}
      <div style={{ 
        background: '#f8fafc', 
        borderRadius: '16px', 
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Next Available</p>
            <p style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>Today, 04:30 PM</p>
        </div>
        <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Consultation Fee</p>
            <p style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 800 }}>
              ₹{consultationFees?.online || consultationFees?.inPerson || '500'}
            </p>
        </div>
      </div>

      {/* Footer: Capabilities & Action */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
            {consultationModes?.includes('Video') && (
                <div title="Video Consult Available" style={{ padding: '8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                    <Video size={18} />
                </div>
            )}
            {consultationModes?.includes('In-person') && (
                <div title="Clinic Visit Available" style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <MapPin size={18} />
                </div>
            )}
            <div title="Morning & Evening Slots" style={{ padding: '8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <Clock size={18} />
            </div>
        </div>
        
        <Button variant="primary" style={{ paddingHorizontal: '20px' }}>
          Book Now <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default DoctorCard;

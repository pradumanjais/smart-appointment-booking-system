import React from 'react';
import { MapPin, Calendar, Clock, User, Hospital, Phone, ShieldCheck } from 'lucide-react';

const AppointmentCard = ({ appointment, cardRef }) => {
  if (!appointment) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const doctorName = appointment.providerId?.userId?.name || 'Medical Specialist';
  const hospitalName = appointment.hospitalId?.name || 'Bharat Health Facility';
  const hospitalAddress = appointment.hospitalId?.address || appointment.hospitalState || 'India';

  return (
    <div 
      ref={cardRef} 
      className="appointment-ticket"
      style={{
        width: '450px',
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        fontFamily: "'Inter', sans-serif",
        color: '#1a1a1a',
        position: 'absolute',
        left: '-9999px', // Keep it off-screen but renderable
        top: '0'
      }}
    >
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0062ff 0%, #00d2ff 100%)', 
        padding: '30px', 
        color: 'white',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <ShieldCheck size={40} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0', letterSpacing: '-0.5px' }}>APPOINTMENT LETTER</h2>
        <p style={{ opacity: 0.9, fontSize: '14px', marginTop: '4px' }}>Smart Appointment Booking System</p>
        
        {/* Decorative Circles */}
        <div style={{ position: 'absolute', width: '20px', height: '20px', borderRadius: '50%', background: '#f8f9fa', bottom: '-10px', left: '-10px' }}></div>
        <div style={{ position: 'absolute', width: '20px', height: '20px', borderRadius: '50%', background: '#f8f9fa', bottom: '-10px', right: '-10px' }}></div>
      </div>

      {/* Main Info */}
      <div style={{ padding: '30px', background: '#f8f9fa' }}>
        <div style={{ borderBottom: '2px dashed #e1e4e8', paddingBottom: '20px', marginBottom: '20px' }}>
          <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#666', fontWeight: '700', letterSpacing: '1px' }}>Facility / Hospital</label>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '6px' }}>
            <Hospital size={18} style={{ color: '#0062ff', marginRight: '10px' }} />
            <span style={{ fontSize: '18px', fontWeight: '700' }}>{hospitalName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px', opacity: 0.7, fontSize: '13px' }}>
            <MapPin size={14} style={{ marginRight: '6px' }} />
            <span>{hospitalAddress}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#666', fontWeight: '700', letterSpacing: '1px' }}>Specialist</label>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '6px' }}>
              <User size={16} style={{ color: '#0062ff', marginRight: '8px' }} />
              <span style={{ fontWeight: '600' }}>Dr. {doctorName}</span>
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginLeft: '24px' }}>{appointment.department}</p>
          </div>
          <div>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#666', fontWeight: '700', letterSpacing: '1px' }}>Patient</label>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '6px' }}>
              <User size={16} style={{ color: '#0062ff', marginRight: '8px' }} />
              <span style={{ fontWeight: '600' }}>{appointment.userId?.name}</span>
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginLeft: '24px' }}>{appointment.appointmentType} Case</p>
          </div>
        </div>
      </div>

      {/* Time & Date (Boarding Pass style) */}
      <div style={{ 
        padding: '20px 30px', 
        background: '#fff', 
        borderTop: '2px dashed #e1e4e8', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#666', fontWeight: '700', letterSpacing: '1px' }}>Date</label>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
            <Calendar size={16} style={{ color: '#0062ff', marginRight: '8px' }} />
            <span style={{ fontWeight: '700', fontSize: '15px' }}>{new Date(appointment.date).toLocaleDateString()}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#666', fontWeight: '700', letterSpacing: '1px' }}>Time Slot</label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '4px' }}>
            <Clock size={16} style={{ color: '#0062ff', marginRight: '8px' }} />
            <span style={{ fontWeight: '700', fontSize: '15px' }}>{appointment.startTime} - {appointment.endTime}</span>
          </div>
        </div>
      </div>

      {/* Footer / QR Mock */}
      <div style={{ 
        padding: '20px 30px', 
        background: '#1a1a1a', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '10px', opacity: 0.7 }}>
          <p>LETTER ID: #{appointment._id?.toString().toUpperCase().slice(-8)}</p>
          <p style={{ marginTop: '2px' }}>Please arrive 15 mins early.</p>
        </div>
        <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '4px', padding: '4px' }}>
          {/* Mock QR Code squares */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', width: '100%', height: '100%' }}>
            {[...Array(9)].map((_, i) => (
              <div key={i} style={{ background: Math.random() > 0.5 ? '#000' : '#fff' }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;

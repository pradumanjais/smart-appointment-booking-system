import React from 'react';
import { Activity } from 'lucide-react';

/**
 * Modern Health Pass Component (Visit Pass)
 * Used both for the live Success screen and for generating downloaded tickets.
 * This component adopts the premium glassmorphism aesthetic.
 */
const AppointmentCard = ({ appointment, cardRef, hideFooter = false, footerAction = null }) => {
  if (!appointment) return null;

  // Handle both flat and nested data structures (for wizard vs backend data)
  const doctorName = appointment.providerId?.userId?.name || appointment.doctorName || 'Medical Expert';
  const hospitalName = appointment.hospitalId?.name || appointment.hospitalName || 'Bharat Health Facility';
  const hospitalAddress = appointment.hospitalId?.address || appointment.hospitalState || 'India';
  const patientName = appointment.userId?.name || 'Patient';
  const scheduleDate = new Date(appointment.date).toLocaleDateString();
  const timeSlot = `${appointment.startTime} - ${appointment.endTime}`;

  return (
    <div 
      className="health-pass-card" 
      ref={cardRef}
      style={{
        width: '380px', // Standardized width for capture
        margin: '0',
        transform: 'none', // Disable floating animation for consistent capture
        animation: 'none'
      }}
    >
      <div className="pass-header">
        <div className="pass-live-indicator">
          <span className="live-dot"></span>
          {appointment.status === 'confirmed' ? 'Confirmed / Active' : (appointment.status || 'Active')}
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Visit Pass</h3>
      </div>

      <div className="pass-body">
        <div className="pass-grid">
          <div className="pass-item">
            <label>Expert</label>
            <span>Dr. {doctorName}</span>
          </div>
          <div className="pass-item">
            <label>Mode</label>
            <span>{appointment.appointmentMode || 'Physical'}</span>
          </div>
          <div className="pass-item">
            <label>Facility</label>
            <span style={{ fontSize: '0.8rem' }}>{hospitalName}</span>
          </div>
          <div className="pass-item">
            <label>Schedule</label>
            <span>{scheduleDate}</span>
          </div>
          <div className="pass-item">
            <label>Patient</label>
            <span>{patientName}</span>
          </div>
          <div className="pass-item">
            <label>Department</label>
            <span>{appointment.department}</span>
          </div>
          <div className="pass-item" style={{ gridColumn: 'span 2', marginTop: '12px' }}>
            <label>Reserved Slots</label>
            <span style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>{timeSlot}</span>
          </div>
        </div>
      </div>

      {!hideFooter && (
        <div className="pass-footer" style={{ borderTop: '1px dashed rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.02)', padding: '20px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="qr-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px' }}>
                <Activity size={24} color="var(--primary)" style={{ opacity: 0.3 }} />
              </div>
              <div style={{ marginLeft: '12px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                <p style={{ margin: 0, fontWeight: 700 }}>VERIFIED IDENTITY</p>
                <p style={{ margin: 0 }}>ID: #{appointment._id?.toString().slice(-6).toUpperCase() || 'NEW'}</p>
              </div>
            </div>
            {footerAction}
          </div>
        </div>
      )}
    </div>
  );
};


export default AppointmentCard;


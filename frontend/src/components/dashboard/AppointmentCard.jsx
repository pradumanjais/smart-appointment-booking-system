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
  const patient = appointment.userId || {};
  const patientName = patient.name || 'Patient';
  const patientAge = patient.age || 'N/A';
  const patientFather = patient.fathersName || 'N/A';

  // Facility / Location Logic
  const hospital = appointment.hospitalId || {};
  const facilityName = hospital.name || appointment.clinicName || 'Universal Health Center';
  const fullAddress = hospital.address || appointment.clinicAddress || 'Address not available';
  const state = hospital.state || appointment.hospitalState || '';
  const pinCode = hospital.pinCode || appointment.clinicPinCode || '';
  
  const scheduleDate = new Date(appointment.date).toLocaleDateString();
  const timeSlot = `${appointment.startTime} - ${appointment.endTime}`;

  return (
      <div 
      className="health-pass-card" 
      ref={cardRef}
      style={{
        width: '400px', // Restored width as requested
        margin: '0',
        transform: 'none',
        animation: 'none'
      }}
    >
      <div className="pass-header" style={{ padding: '20px 24px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Visit Pass</h3>
        <div className="pass-live-indicator" style={{ margin: 0, padding: '5px 14px', fontSize: '0.7rem' }}>
          <span className="live-dot"></span>
          {appointment.status === 'confirmed' ? 'Confirmed' : (appointment.status || 'Active')}
        </div>
      </div>

      <div className="pass-body" style={{ padding: '12px 24px' }}>
        <div className="clean-compact-grid">
          {/* Patient Info Group */}
          <div className="pass-item" style={{ gridColumn: 'span 2' }}>
            <label>Patient Name</label>
            <span style={{ fontSize: '1.1rem' }}>{patientName}</span>
          </div>
          <div className="pass-item">
            <label>Age / Gender</label>
            <span>{patientAge}Y / {patient.gender || '-'}</span>
          </div>
          <div className="pass-item">
            <label>Father's Name</label>
            <span>{patientFather}</span>
          </div>

          {/* Expert Info Group */}
          <div className="pass-item" style={{ gridColumn: 'span 2', marginTop: '4px' }}>
            <label>Medical Expert</label>
            <span style={{ fontSize: '1.05rem', color: '#0f172a' }}>Dr. {doctorName}</span>
          </div>
          <div className="pass-item">
            <label>Department</label>
            <span>{appointment.department}</span>
          </div>
          <div className="pass-item">
            <label>Consultation Mode</label>
            <span>{appointment.appointmentMode || 'In-Person'}</span>
          </div>

          {/* Schedule Group */}
          <div className="pass-item">
            <label>Visit Date</label>
            <span>{scheduleDate}</span>
          </div>
          <div className="pass-item">
            <label>Time Slot</label>
            <span style={{ color: 'var(--primary)', fontWeight: 900 }}>{timeSlot}</span>
          </div>
          
          <div className="pass-item" style={{ gridColumn: 'span 2', marginTop: '4px', background: '#f8fafc', padding: '10px', borderRadius: '12px' }}>
            <label>Facility Location</label>
            <span style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>{facilityName}</span>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{fullAddress}</p>
          </div>
        </div>
      </div>

      {!hideFooter && (
        <div className="pass-footer" style={{ padding: '16px 24px', background: 'transparent', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
               <Activity size={18} color="var(--primary)" style={{ opacity: 0.6 }} />
              <div style={{ marginLeft: '12px' }}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: '0.6rem', color: '#94a3b8' }}>VERIFIED VISIT PASS</p>
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>ID: #{appointment._id?.toString().slice(-6).toUpperCase() || 'NEW'}</p>
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


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
        width: '400px', // Slightly wider for full address display
        margin: '0',
        transform: 'none',
        animation: 'none'
      }}
    >
      <div className="pass-header">
        <div className="pass-right-notch"></div>
        <div className="pass-live-indicator">
          <span className="live-dot"></span>
          {appointment.status === 'confirmed' ? 'Confirmed / Active' : (appointment.status || 'Active')}
        </div>
        <h3>Visit Pass</h3>
      </div>

      <div className="pass-body" style={{ padding: '24px 32px' }}>
        {/* Section 1: Patient Information */}
        <div className="pass-section-block">
          <label className="section-divider">Patient Information</label>
          <div className="pass-grid" style={{ gap: '16px' }}>
            <div className="pass-item">
              <label>Name</label>
              <span>{patientName}</span>
            </div>
            <div className="pass-item">
              <label>Age</label>
              <span>{patientAge} Yrs</span>
            </div>
            <div className="pass-item" style={{ gridColumn: 'span 2' }}>
              <label>Father's Name</label>
              <span>{patientFather}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Doctor Information */}
        <div className="pass-section-block" style={{ marginTop: '24px' }}>
          <label className="section-divider">Expert Information</label>
          <div className="pass-grid" style={{ gap: '16px' }}>
            <div className="pass-item">
              <label>Expert</label>
              <span>Dr. {doctorName}</span>
            </div>
            <div className="pass-item">
              <label>Department</label>
              <span>{appointment.department}</span>
            </div>
            <div className="pass-item">
              <label>Mode</label>
              <span>{appointment.appointmentMode}</span>
            </div>
             <div className="pass-item">
              <label>Schedule</label>
              <span>{scheduleDate}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Visit Location */}
        <div className="pass-section-block" style={{ marginTop: '24px' }}>
          <label className="section-divider">Visit Location</label>
          <div className="pass-item">
            <label>Facility</label>
            <span style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{facilityName}</span>
          </div>
          <div className="pass-item" style={{ marginTop: '8px' }}>
            <label>Full Address</label>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block' }}>
              {fullAddress}, {state} - {pinCode}
            </span>
          </div>
        </div>

        <div className="pass-item reserved-slots" style={{ marginTop: '24px', textAlign: 'center', background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
          <label>Reserved slots</label>
          <span style={{ display: 'block', fontSize: '1.5rem', marginTop: '4px' }}>{timeSlot}</span>
        </div>
      </div>

      {!hideFooter && (
        <div className="pass-footer" style={{ padding: '24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="qr-placeholder" style={{ width: '56px', height: '56px' }}>
                <Activity size={28} color="var(--primary)" style={{ opacity: 0.8 }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: '0.7rem', color: '#64748b' }}>VERIFIED IDENTITY</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', fontWeight: 700 }}>ID: #{appointment._id?.toString().slice(-6).toUpperCase() || 'NEW'}</p>
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


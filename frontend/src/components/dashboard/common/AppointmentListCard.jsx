import React from 'react';
import { Calendar, Clock, MapPin, User, Activity, Phone, Download, CheckCircle, XCircle, MoreVertical, Shield, RefreshCw } from 'lucide-react';
import StatusBadge from './StatusBadge';
import './dashboard-components.css';

const AppointmentListCard = ({ 
  appointment, 
  role, 
  onAction, 
  onDownload,
  onFollowUp,
  onViewProfile
}) => {
  if (!appointment) return null;

  const isProvider = role === 'provider';
  const person = isProvider ? appointment.userId : appointment.providerId?.userId;
  const personName = person?.name || (isProvider ? 'Patient' : 'Medical Expert');
  const avatar = person?.avatar || 'https://cdn-icons-png.flaticon.com/512/147/147144.png';
  
  const hospital = appointment.hospitalId?.name || 'Bharat Health Facility';
  const location = appointment.hospitalId?.address || appointment.hospitalState || 'India';

  // Logic to determine if appointment has passed
  const isPassed = (() => {
    if (!appointment.date || !appointment.endTime) return false;
    // Normalize date to local date string YYYY-MM-DD
    const apptDateStr = new Date(appointment.date).toISOString().split('T')[0];
    const [hour, minute] = appointment.endTime.split(':').map(Number);
    const apptEndTime = new Date(`${apptDateStr}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
    return apptEndTime < new Date();
  })();

  const effectiveStatus = (appointment.status === 'confirmed' && isPassed) ? 'not-visited' : appointment.status;

  return (
    <div className={`appointment-list-card ${appointment.status}`}>
      <div className="appt-main-info">
        <div className="appt-avatar-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <img src={avatar} alt={personName} className="appt-avatar" />
          <div className="appt-role-icon">
            {isProvider ? <Activity size={14} /> : <User size={14} />}
          </div>
          {onViewProfile && (
            <button 
              className="view-profile-avatar-btn"
              onClick={() => {
                const targetId = isProvider ? (appointment.userId?._id || appointment.userId) : (appointment.providerId?._id || appointment.providerId);
                onViewProfile(targetId);
              }}
            >
              View Profile
            </button>
          )}
        </div>

        <div className="appt-details-brief">
          <div className="appt-name-row">
            <h3>{isProvider ? '' : 'Dr. '}{personName}</h3>
            <span className={`appt-type-tag type-${appointment.appointmentType?.toLowerCase().replace(' ', '-')}`}>
              {appointment.appointmentType}
            </span>
          </div>
          
          <div className="appt-meta-grid">
            <div className="meta-item">
              <Calendar size={16} />
              <span>{new Date(appointment.date).toLocaleDateString()}</span>
            </div>
            <div className="meta-item">
              <Clock size={16} />
              <span>{appointment.startTime} - {appointment.endTime}</span>
            </div>
          </div>

          <div className="appt-patient-extra">
            <div className="extra-badge">
              <Shield size={14} />
              <span>{appointment.department}</span>
            </div>
            {person?.age && (
              <div className="extra-badge">
                <span>Age: {person.age}</span>
              </div>
            )}
            {person?.bloodGroup && (
              <div className="extra-badge blood-tag">
                <span>{person.bloodGroup}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="appt-actions-area">
        <StatusBadge status={effectiveStatus === 'not-visited' ? 'Not Visited' : effectiveStatus} />
        
        <div className="btn-group-sm">
          {isProvider && appointment.status === 'confirmed' && !isPassed && (
            <button 
              className="btn btn-sm btn-primary" 
              onClick={() => onAction(appointment._id, 'completed')}
              style={{ padding: '8px 20px', borderRadius: '12px' }}
            >
              Mark Complete
            </button>
          )}

          {!isProvider && appointment.status === 'confirmed' && !isPassed && (
            <button 
              className="btn btn-sm btn-outline-primary" 
              onClick={() => onDownload(appointment)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px' }}
            >
              <Download size={16} /> Download
            </button>
          )}

          {!isProvider && appointment.status === 'completed' && onFollowUp && (
            <button 
              className="btn btn-sm btn-emerald" 
              onClick={() => onFollowUp(appointment)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px' }}
            >
              <RefreshCw size={16} /> Follow-up
            </button>
          )}
          
          {(appointment.status === 'pending' || appointment.status === 'confirmed') && !isProvider && !isPassed && (
             <button 
              className="btn btn-sm btn-outline-danger" 
              onClick={() => onAction(appointment._id, 'cancelled')}
              style={{ padding: '8px 16px', borderRadius: '12px' }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentListCard;

import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, CheckCircle, XCircle, MapPin, Phone, Star, Briefcase, Activity, Mail } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import InputField from '../common/InputField';
import api from '../../api';
import './dashboard.css';

const ProviderDashboard = () => {
  const [currentTab, setCurrentTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    hospitalState: '', hospitalId: '', specialization: '', experience: 0, pricePerHour: 0, bio: '', location: '', availability: []
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Appointments
      try {
        const { data } = await api.get('/bookings/provider-appointments');
        setAppointments(data);
      } catch (err) {
        console.error('Error fetching appointments:', err);
      }

      // Fetch Profile Data
      try {
        const { data } = await api.get('/providers/profile');
        setProviderData(data);
      } catch (err) {
        if (err.response?.status === 404) {
          console.warn('Provider professional profile not configured yet. Loading base user data...');
          try {
            const userRes = await api.get('/auth/me');
            // Mock a valid providerData object so the UI doesn't crash or go blank
            setProviderData({
              userId: userRes.data,
              hospitalId: null,
              specialization: 'Not configured',
              availability: []
            });
          } catch (fallbackErr) {
            console.error('Error fetching fallback user data:', fallbackErr);
          }
        } else {
          console.error('Error fetching profile:', err);
        }
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      // Update local state
      setAppointments(appointments.map(app =>
        app._id === id ? { ...app, status } : app
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleEditClick = async () => {
    if (hospitals.length === 0) {
      try {
        const { data } = await api.get('/hospitals');
        setHospitals(data);
      } catch (err) {
        console.error('Failed to load hospitals');
      }
    }
    setEditFormData({
      hospitalState: providerData?.hospitalId?.state || '',
      hospitalId: providerData?.hospitalId?._id || '',
      specialization: providerData?.specialization || '',
      experience: providerData?.experience || 0,
      pricePerHour: providerData?.pricePerHour || 0,
      bio: providerData?.bio || '',
      location: providerData?.location || '',
      availability: providerData?.availability ? [...providerData.availability] : []
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.post('/providers/profile', editFormData);
      const { data } = await api.get('/providers/profile');
      setProviderData(data);
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = (day) => {
    let newAvail = [...editFormData.availability];
    const exists = newAvail.find(a => a.day === day);
    if (exists) {
      newAvail = newAvail.filter(a => a.day !== day);
    } else {
      newAvail.push({ day, slots: [{ startTime: '09:00', endTime: '17:00' }] });
    }
    setEditFormData({ ...editFormData, availability: newAvail });
  };

  const updateSlotTime = (day, type, value) => {
    const newAvail = editFormData.availability.map(a => {
      if (a.day === day) {
        const slots = [...a.slots];
        slots[0][type] = value;
        return { ...a, slots };
      }
      return a;
    });
    setEditFormData({ ...editFormData, availability: newAvail });
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRecentActivity = () => {
    return appointments
      .filter(a => a.status !== 'pending')
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);
  };

  const calculateCompletionRate = () => {
    if (appointments.length === 0) return 0;
    const completed = appointments.filter(a => a.status === 'completed').length;
    return Math.round((completed / appointments.length) * 100);
  };

  return (
    <div className="dashboard-view animate-fade-in">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ marginBottom: '4px' }}>{getTimeGreeting()}, Dr. {providerData?.userId?.name?.split(' ')[0] || 'Expert'}</h1>
          <p>You have {appointments.filter(a => a.status === 'pending').length} pending requests to review today.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
           <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>
             <Calendar size={14} /> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
           </p>
        </div>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <button
          className={`tab-btn ${currentTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setCurrentTab('appointments')}
          style={{ background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: 600, padding: '8px 16px', cursor: 'pointer', borderBottom: currentTab === 'appointments' ? '2px solid var(--primary)' : 'none', color: currentTab === 'appointments' ? 'var(--primary)' : 'var(--text-muted)' }}
        >
          My Schedule
        </button>
        <button
          className={`tab-btn ${currentTab === 'profile' ? 'active' : ''}`}
          onClick={() => setCurrentTab('profile')}
          style={{ background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: 600, padding: '8px 16px', cursor: 'pointer', borderBottom: currentTab === 'profile' ? '2px solid var(--primary)' : 'none', color: currentTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)' }}
        >
          My Profile
        </button>
      </div>

      {currentTab === 'appointments' && (
        <div className="dashboard-split mt-6">
          {/* MAIN COLUMN */}
          <div className="main-content">
            <div className="stats-grid mb-8">
              <div className="glass-stat stat-primary">
                <div className="stat-value">{appointments.filter(a => new Date(a.date).toLocaleDateString() === new Date().toLocaleDateString()).length}</div>
                <div className="stat-label">Today's Load</div>
              </div>
              <div className="glass-stat stat-warning">
                <div className="stat-value">{appointments.filter(a => a.status === 'pending').length}</div>
                <div className="stat-label">Pending Review</div>
              </div>
              <div className="glass-stat stat-success">
                <div className="stat-value">{calculateCompletionRate()}%</div>
                <div className="stat-label">Completion Rate</div>
              </div>
              <div className="glass-stat stat-primary">
                <div className="stat-value">4.9</div>
                <div className="stat-label">Avg. Rating</div>
              </div>
            </div>

            <div className="appointments-section">
              <div className="panel-header">
                <h2>Upcoming Appointments</h2>
                <span className="badge">{appointments.filter(a => a.status === 'confirmed').length} Active</span>
              </div>
            <div className="appointments-list">
              {loading ? (
                <p>Loading appointments...</p>
              ) : appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <Card key={appointment._id} className="appointment-card" hoverEffect={false} style={{ borderLeft: `4px solid var(--status-${appointment.status})` }}>
                    <div className="appointment-user">
                      <div className="item-icon">
                        <User size={20} />
                      </div>
                      <div>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {appointment.userId?.name}
                          <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#f0f0f0', borderRadius: '4px', textTransform: 'uppercase' }}>
                             {appointment.appointmentType}
                          </span>
                        </h3>
                        <p className="detail-item"><Clock size={14} /> {appointment.startTime} - {appointment.endTime}</p>
                        <p className="detail-item"><Calendar size={14} /> {new Date(appointment.date).toLocaleDateString()}</p>
                        <p className="detail-item" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                           <Activity size={12} /> {appointment.userId?.bloodGroup || 'O+'} | {appointment.userId?.age || 'N/A'} yrs
                        </p>
                      </div>
                    </div>
                    <div className="appointment-status">
                      <span className={`status-badge status-${appointment.status}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="appointment-actions">
                      {appointment.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                      {appointment.status === 'confirmed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          style={{ borderColor: '#10b981', color: '#10b981' }}
                          onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                        >
                          <CheckCircle size={16} /> Mark Completed
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '48px', background: '#f8f9fa', borderRadius: '16px', border: '2px dashed var(--border)' }}>
                   <Calendar size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                   <p style={{ color: 'var(--text-muted)' }}>No appointments scheduled for today.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDE PANEL */}
        <div className="side-panel">
          <Card className="glass-stat" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="var(--primary)" /> Recent Activity
            </h3>
            <div className="activity-feed">
              {getRecentActivity().length > 0 ? getRecentActivity().map(act => (
                <div key={act._id} className="activity-item">
                  <div className="item-icon" style={{ background: act.status === 'confirmed' ? '#dcfce7' : act.status === 'cancelled' ? '#fee2e2' : '#f0f0f0' }}>
                    {act.status === 'confirmed' ? <CheckCircle size={14} color="#166534" /> : act.status === 'cancelled' ? <XCircle size={14} color="#991b1b" /> : <Activity size={14} />}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, margin: 0 }}>{act.status.charAt(0).toUpperCase() + act.status.slice(1)}</p>
                    <p style={{ margin: 0, opacity: 0.7 }}>Appointment with {act.userId?.name}</p>
                  </div>
                </div>
              )) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No recent status changes.</p>}
            </div>
          </Card>
          
          <Card className="glass-stat" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={18} color="#fbbf24" /> Quick Tips
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Keep your availability updated to receive more booking requests from patients.
            </p>
            <Button variant="outline" size="sm" style={{ marginTop: '12px', width: '100%' }} onClick={() => setCurrentTab('profile')}>
              Update Profile
            </Button>
          </Card>
        </div>
      </div>
    )}

      {currentTab === 'profile' && providerData && (
        <div className="profile-section animate-fade-in">
          <Card className="profile-card glass" hoverEffect={false}>
            <div className="profile-header-meta" style={{ 
              background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)', 
              margin: '-40px -40px 32px -40px', 
              padding: '40px',
              borderRadius: '24px 24px 0 0',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative elements */}
              <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
              
              <div className="profile-avatar-wrapper" style={{ border: '4px solid rgba(255,255,255,0.3)', borderRadius: '50%', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                <img src={providerData.userId?.avatar || 'https://cdn-icons-png.flaticon.com/512/147/147144.png'} alt="Doctor" className="profile-avatar-large" />
              </div>
              <div className="profile-title" style={{ zIndex: 1 }}>
                <h2 style={{ color: 'white', fontSize: '2.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{providerData.userId?.name}</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                  <span className="role-badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.3)' }}>LICENSED PROVIDER</span>
                  {providerData.experience && <span style={{ fontSize: '0.8rem', fontWeight: 600, padding: '4px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: '20px' }}>{providerData.experience} Years Exp.</span>}
                </div>
                <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
                  <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={18} /> {providerData.hospitalId?.name || 'Unassigned Hospital'}
                  </span>
                  <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Briefcase size={18} /> {providerData.specialization || 'General Practice'}
                  </span>
                </div>
              </div>
              {!isEditing && (
                <Button 
                  variant="primary" 
                  className="ml-auto" 
                  style={{ background: 'white', color: 'var(--primary)', border: 'none', fontWeight: 700 }}
                  onClick={handleEditClick}
                >
                  Edit Professional Profile
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="edit-profile-form" style={{ marginTop: '24px' }}>
                <div className="input-field-wrapper">
                  <label className="input-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600 }}>1. Select State</label>
                  <select
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    value={editFormData.hospitalState}
                    onChange={(e) => setEditFormData({ ...editFormData, hospitalState: e.target.value, hospitalId: '', specialization: '' })}
                  >
                    <option value="">Choose State / UT</option>
                    {[...new Set(hospitals.map(h => h.state))].sort().map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="input-field-wrapper mt-4">
                  <label className="input-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600 }}>2. Select Hospital</label>
                  <select
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    value={editFormData.hospitalId}
                    disabled={!editFormData.hospitalState}
                    onChange={(e) => setEditFormData({ ...editFormData, hospitalId: e.target.value, specialization: '' })}
                  >
                    <option value="">Choose Hospital</option>
                    {hospitals.filter(h => h.state === editFormData.hospitalState).map(h => (
                      <option key={h._id} value={h._id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div className="input-field-wrapper mt-4">
                  <label className="input-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontWeight: 600 }}>3. Specialization / Department</label>
                  <select
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    value={editFormData.specialization}
                    disabled={!editFormData.hospitalId}
                    onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                  >
                    <option value="">Select Specialty</option>
                    {hospitals.find(h => h._id === editFormData.hospitalId)?.departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
                  <InputField label="Years Experience" type="number" value={editFormData.experience} onChange={(e) => setEditFormData({ ...editFormData, experience: e.target.value })} />
                  <InputField label="Consultation Fee ($)" type="number" value={editFormData.pricePerHour} onChange={(e) => setEditFormData({ ...editFormData, pricePerHour: e.target.value })} />
                </div>

                <div style={{ marginTop: '24px' }}>
                  <InputField label="Bio / Quick Notes" placeholder="Short description..." value={editFormData.bio} onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })} />
                </div>

                <div className="availability-planner mt-4">
                  <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '16px', border: 'none' }}>Set Regular Business Hours</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                      const isSelected = editFormData.availability.find(a => a.day === day);
                      return (
                        <div key={day} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '16px', 
                          padding: '16px', 
                          borderRadius: '12px', 
                          background: isSelected ? 'rgba(var(--primary-rgb), 0.04)' : '#fff', 
                          border: isSelected ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                          transition: 'all 0.2s ease'
                        }}>
                          <label style={{ width: '140px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text)' }}>
                            <input type="checkbox" checked={!!isSelected} onChange={() => toggleAvailability(day)} style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
                            {day}
                          </label>
                          {isSelected ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, animation: 'fadeIn 0.3s ease' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Starts</span>
                                <input type="time" value={isSelected.slots[0].startTime} onChange={(e) => updateSlotTime(day, 'startTime', e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem' }} />
                              </div>
                              <span style={{ color: 'var(--text-muted)', marginTop: '16px' }}>to</span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Ends</span>
                                <input type="time" value={isSelected.slots[0].endTime} onChange={(e) => updateSlotTime(day, 'endTime', e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem' }} />
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Away / Offline</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel Changes</Button>
                  <Button onClick={handleSaveProfile} loading={saving}>Save Profile</Button>
                </div>
              </div>
            ) : (
              <div className="profile-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '32px' }}>
                <div className="profile-info-group">
                  <label><Mail size={16} /> Primary Email</label>
                  <p style={{ background: 'white', border: '1px solid var(--border)', fontSize: '1rem' }}>{providerData.userId?.email}</p>
                </div>

                <div className="profile-info-group">
                  <label><Phone size={16} /> Contact Number</label>
                  <p style={{ background: 'white', border: '1px solid var(--border)', fontSize: '1rem' }}>{providerData.userId?.phone || 'Not configured'}</p>
                </div>

                {providerData.bio && (
                  <div className="profile-info-group" style={{ gridColumn: '1 / -1' }}>
                    <label><Activity size={16} /> Professional Bio</label>
                    <p style={{ background: '#fcfcfc', border: '1.5px dashed var(--border)', fontSize: '0.95rem', fontStyle: 'italic', lineHeight: '1.6' }}>
                      "{providerData.bio}"
                    </p>
                  </div>
                )}

                <div className="profile-info-group" style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                  <label style={{ marginBottom: '16px' }}><Clock size={18} /> Public Availability</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                    {providerData.availability && providerData.availability.length > 0 ? (
                      providerData.availability.map((dayObj, idx) => (
                        <div key={idx} style={{ 
                          padding: '16px', 
                          background: 'white', 
                          borderRadius: '16px', 
                          border: '1px solid var(--border)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <h4 style={{ margin: 0, color: 'var(--text)', fontSize: '0.95rem' }}>{dayObj.day}</h4>
                          <span style={{ 
                            padding: '6px 12px', 
                            background: 'rgba(var(--primary-rgb), 0.1)', 
                            color: 'var(--primary)', 
                            borderRadius: '20px', 
                            fontSize: '0.8rem', 
                            fontWeight: 'bold' 
                          }}>
                            {dayObj.slots[0].startTime} - {dayObj.slots[0].endTime}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px', background: '#f8f9fa', borderRadius: '16px' }}>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>No regular hours configured. Patients cannot book appointments yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;

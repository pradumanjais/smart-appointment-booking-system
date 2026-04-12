import React, { useState, useEffect } from 'react';
import api from '../../api';
import './dashboard.css';
import DashboardShell from './layout/DashboardShell';
import Card from '../common/Card';
import Button from '../common/Button';
import InputField from '../common/InputField';
import Skeleton from '../common/Skeleton';
import StatCard from './common/StatCard';
import AppointmentListCard from './common/AppointmentListCard';
import { useToast } from '../../context/ToastContext';
import { Calendar, User, Clock, CheckCircle, XCircle, MapPin, Phone, Star, Briefcase, Activity, Mail, TrendingUp, ShieldCheck, Camera, Edit3, Award, DollarSign } from 'lucide-react';

const ProviderDashboard = () => {
  const { showToast } = useToast();
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
      showToast(`Appointment ${status} successfully`, 'success');
      setAppointments(appointments.map(app =>
        app._id === id ? { ...app, status } : app
      ));
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
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
    <DashboardShell
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      user={providerData?.userId}
      role="provider"
    >

      {currentTab === 'appointments' && (
        <div className="dashboard-split mt-6">
          {/* MAIN COLUMN */}
          <div className="main-content">
            <div className="stats-container">
              <StatCard 
                label="Today's Appointments" 
                value={appointments.filter(a => new Date(a.date).toLocaleDateString() === new Date().toLocaleDateString()).length}
                icon={Calendar}
                variant="indigo"
              />
              <StatCard 
                label="Pending Requests" 
                value={appointments.filter(a => a.status === 'pending').length}
                icon={Activity}
                variant="amber"
              />
              <StatCard 
                label="Completion Rate" 
                value={`${calculateCompletionRate()}%`}
                icon={TrendingUp}
                variant="emerald"
              />
              <StatCard 
                label="Expert Rating" 
                value="4.9"
                icon={Star}
                variant="rose"
              />
            </div>

            <div className="appointments-section">
              <div className="panel-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                   <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.5px' }}>Daily Schedule</h2>
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Manage your medical operations for today</p>
                </div>
                <div className="meta-info">
                  <span className="badge-pill bg-primary-light text-primary" style={{ padding: '8px 16px', borderRadius: '12px' }}>
                    {appointments.filter(a => a.status === 'confirmed').length} Active Appointments
                  </span>
                </div>
              </div>

              <div className="timeline-list">
                {loading ? (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                     {[1, 2, 3].map(i => (
                       <Skeleton key={i} variant="rect" height={120} />
                     ))}
                   </div>
                ) : appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <AppointmentListCard 
                      key={appointment._id} 
                      appointment={appointment} 
                      role="provider"
                      onAction={handleStatusUpdate}
                    />
                  ))
                ) : (
                  <div className="tc py-12 glass-stat" style={{ borderRadius: '24px' }}>
                     <Calendar size={64} className="text-muted mb-4" style={{ opacity: 0.2 }} />
                     <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Clear Schedule</h3>
                     <p className="text-muted">You have no appointments scheduled for today.</p>
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
        <div className="modern-profile-shell animate-slide-up">
          {/* LEFT COLUMN: Expert Identity Sidebar */}
          <div className="profile-sidebar-card">
            <div className="expert-badge-shimmer">
              <Award size={14} /> Verified Specialist
            </div>
            
            <div className="profile-avatar-giant-box">
              <img 
                src={editFormData.avatar || 'https://cdn-icons-png.flaticon.com/512/1053/1053244.png'} 
                alt="Expert" 
                className="profile-avatar-giant" 
              />
              {isEditing && (
                <label className="avatar-edit-glare">
                  <Camera size={20} />
                  <input type="file" accept="image/*" style={{ display: 'none' }} />
                </label>
              )}
            </div>

            <h2>Dr. {providerData.userId?.name}</h2>
            <p className="user-email">{providerData.userId?.email}</p>

            <div className="expert-rating-banner">
              <Star size={16} fill="currentColor" /> Expert Rating: 4.9 (High-Trust)
            </div>

            <div className="profile-summary-vitals">
              <div className="specialist-vital-pill">
                <label>Experience</label>
                <span>{providerData.experience}+ Yrs</span>
              </div>
              <div className="specialist-vital-pill">
                <label>Consult Fee</label>
                <span>${providerData.pricePerHour}</span>
              </div>
            </div>

            {!isEditing ? (
              <Button 
                variant="primary" 
                className="w-full mt-8" 
                onClick={() => setIsEditing(true)}
                style={{ borderRadius: '16px', padding: '14px' }}
              >
                <Edit3 size={18} className="mr-2" /> Refine Identity
              </Button>
            ) : (
              <p className="mt-8 text-xs font-bold text-muted uppercase tracking-widest">Editing Mode Active</p>
            )}
          </div>

          {/* RIGHT COLUMN: Professional Content Area */}
          <div className="profile-main-content">
            {/* HERITAGE PACK */}
            <div className="info-pack-card animate-slide-up animate-delay-1">
              <div className="pack-header">
                <Briefcase size={22} />
                <h3>Expertise & Heritage</h3>
              </div>
              
              {isEditing ? (
                 <div className="pack-grid">
                    <div className="modern-field-group">
                      <label><Briefcase size={16} /> Specialty Area</label>
                      <select 
                        className="input-field" 
                        style={{ height: '52px', borderRadius: '16px' }}
                        value={editFormData.specialization} 
                        onChange={(e) => setEditFormData({...editFormData, specialization: e.target.value})}
                      >
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="General Medicine">General Medicine</option>
                      </select>
                    </div>
                    <div className="modern-field-group">
                      <label><TrendingUp size={16} /> Years Experience</label>
                      <InputField type="number" value={editFormData.experience} onChange={(e) => setEditFormData({...editFormData, experience: e.target.value})} />
                    </div>
                    <div className="modern-field-group" style={{ gridColumn: 'span 2' }}>
                      <label><Activity size={16} /> Professional Bio</label>
                      <InputField value={editFormData.bio} onChange={(e) => setEditFormData({...editFormData, bio: e.target.value})} placeholder="Describe your medical journey..." />
                    </div>
                 </div>
              ) : (
                <div className="doctor-legacy-bio">
                  {providerData.bio || 'Dedicated to providing precision healthcare with over a decade of clinical experience in specialized medicine.'}
                </div>
              )}
            </div>

            {/* OPERATIONAL PLANNING PACK */}
            <div className="info-pack-card animate-slide-up animate-delay-2">
              <div className="pack-header">
                <Clock size={22} />
                <h3>Operational Planner</h3>
              </div>
              
              <div className="availability-planner-container">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                   const dayObj = (isEditing ? editFormData.availability : providerData.availability)?.find(a => a.day === day);
                   return (
                     <div key={day} className={`planner-day-card ${dayObj ? 'active' : ''}`}>
                        <div className="planner-status-row">
                          <h4>{day}</h4>
                          {isEditing ? (
                            <input 
                              type="checkbox" 
                              checked={!!dayObj} 
                              onChange={() => toggleAvailability(day)} 
                              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                            />
                          ) : (
                            <div className={`status-badge-unified ${dayObj ? 'sb-confirmed' : 'sb-completed'}`}>
                              {dayObj ? 'Online' : 'Off'}
                            </div>
                          )}
                        </div>

                        {dayObj ? (
                          <div className="slot-time-input-group">
                            <input 
                               type="time" 
                               disabled={!isEditing}
                               value={dayObj.slots[0].startTime} 
                               onChange={(e) => updateSlotTime(day, 'startTime', e.target.value)} 
                            />
                            <span className="text-muted" style={{ fontSize: '0.65rem', fontWeight: 800 }}>TO</span>
                            <input 
                               type="time" 
                               disabled={!isEditing}
                               value={dayObj.slots[0].endTime} 
                               onChange={(e) => updateSlotTime(day, 'endTime', e.target.value)} 
                            />
                          </div>
                        ) : (
                          <div style={{ padding: '12px', textAlign: 'center', opacity: 0.5 }}>
                            <p className="text-xs font-bold italic">Unscheduled</p>
                          </div>
                        )}
                     </div>
                   )
                })}
              </div>

              {isEditing && (
                 <div className="profile-footer-actions">
                    <Button variant="secondary" onClick={() => setIsEditing(false)} style={{ borderRadius: '12px' }}>Discard Edits</Button>
                    <Button onClick={handleSaveProfile} loading={saving} style={{ borderRadius: '12px', padding: '10px 24px' }}>Publish Identity</Button>
                 </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default ProviderDashboard;

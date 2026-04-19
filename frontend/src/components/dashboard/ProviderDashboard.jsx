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
import DailyScheduleCalendar from './common/DailyScheduleCalendar';
import { useToast } from '../../context/ToastContext';
import { Calendar, User, Clock, CheckCircle, XCircle, MapPin, Phone, Star, Briefcase, Activity, Mail, TrendingUp, ShieldCheck, Camera, Edit3, Award, DollarSign, List, Grid } from 'lucide-react';

const ProviderDashboard = ({ handleLogout }) => {
  const { showToast } = useToast();
  const [currentTab, setCurrentTab] = useState('appointments');
  const [viewMode, setViewMode] = useState('list');
  const [appointments, setAppointments] = useState([]);
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    hospitalState: '', hospitalId: '', specialization: '', experience: 0, pricePerHour: 0, slotsPerHour: 1, bio: '', location: '', availability: []
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Appointments
      try {
        const { data } = await api.get('/bookings/provider-appointments');
        const sortedAppts = data.sort((a, b) => {
          const dateComparison = new Date(b.date) - new Date(a.date);
          if (dateComparison !== 0) return dateComparison;
          return b.startTime.localeCompare(a.startTime);
        });
        setAppointments(sortedAppts);
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
              slotsPerHour: 1,
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
      slotsPerHour: providerData?.slotsPerHour || 1,
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
      handleLogout={handleLogout}
    >

      {currentTab === 'appointments' && (
        <div className="dashboard-overview animate-fade-in" style={{ marginTop: '24px' }}>
          {/* Enhanced Header */}
          <div className="overview-header" style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-1px' }}>
              Welcome back, <span className="text-gradient">Dr. {providerData?.userId?.name?.split(' ')[0]}</span>!
            </h1>
            <p className="text-muted" style={{ fontSize: '1.2rem', fontWeight: 500 }}>Global operations and daily schedule control center.</p>
          </div>

          <div className="dashboard-split">
            {/* MAIN COLUMN */}
            <div className="main-content">
              <div className="stats-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <StatCard 
                  label="Daily Schedule" 
                  value={appointments.filter(a => new Date(a.date).toLocaleDateString() === new Date().toLocaleDateString()).length}
                  icon={Calendar}
                  variant="indigo"
                />
                <StatCard 
                  label="Success Rate" 
                  value={`${calculateCompletionRate()}%`}
                  icon={TrendingUp}
                  variant="emerald"
                />
                <StatCard 
                  label="Patient Score" 
                  value="4.9 / 5.0"
                  icon={Star}
                  variant="rose"
                />
              </div>

            <div className="appointments-section glass-stat" style={{ padding: '32px', borderRadius: '28px', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
              <div className="panel-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                   <h2 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.5px', color: '#0f172a' }}>Daily Schedule</h2>
                   <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600 }}>Real-time medical activity monitoring</p>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div className="view-switcher-premium">
                    <button 
                      className={`switch-btn-p ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                    >
                      <List size={16} />
                    </button>
                    <button 
                      className={`switch-btn-p ${viewMode === 'calendar' ? 'active' : ''}`}
                      onClick={() => setViewMode('calendar')}
                    >
                      <Grid size={16} />
                    </button>
                  </div>
                  <div className="meta-info hide-mobile">
                    <span className="badge-premium" style={{ border: '1.5px solid var(--primary-light)', color: 'var(--primary)', padding: '8px 16px', borderRadius: '14px', fontSize: '0.8rem', fontWeight: 800 }}>
                      {appointments.filter(a => a.status === 'confirmed').length} Active Visits
                    </span>
                  </div>
                </div>
              </div>

              {viewMode === 'calendar' ? (
                <DailyScheduleCalendar 
                  appointments={appointments} 
                  providerData={providerData} 
                />
              ) : (
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
                      <p className="text-muted">You have no appointments scheduled.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        {/* SIDE PANEL */}
        <div className="side-panel">
          <div className="glass-stat sidebar-card-premium" style={{ padding: '24px', borderRadius: '24px', marginBottom: '24px', background: 'white', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '12px' }}>
                <Activity size={20} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, letterSpacing: '-0.3px' }}>Recent Activity</h3>
            </div>
            
            <div className="activity-feed">
              {getRecentActivity().length > 0 ? getRecentActivity().map(act => (
                <div key={act._id} className="activity-item-premium" style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                  <div className="item-icon-circle" style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', background: act.status === 'confirmed' ? '#ecfdf5' : act.status === 'cancelled' ? '#fef2f2' : '#f8fafc' }}>
                    {act.status === 'confirmed' ? <CheckCircle size={14} color="#10b981" /> : act.status === 'cancelled' ? <XCircle size={14} color="#ef4444" /> : <Activity size={14} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, margin: 0, fontSize: '0.9rem', color: '#0f172a' }}>{act.status.charAt(0).toUpperCase() + act.status.slice(1)}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{act.userId?.name.split(' ')[0]} • {new Date(act.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
              )) : <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No recent activity found.</p>}
            </div>
          </div>
          
          <div className="glass-stat sidebar-card-premium" style={{ padding: '24px', borderRadius: '24px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Star size={20} color="#fbbf24" fill="#fbbf24" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>Expert Tips</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '24px' }}>
              Your profile completion is key to ranking higher in patient search results. 
            </p>
            <button 
              className="btn btn-emerald w-full" 
              style={{ padding: '12px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 800 }}
              onClick={() => setCurrentTab('profile')}
            >
              Master Identity
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

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
              <div className="specialist-vital-pill" style={{ background: 'var(--primary-light)', borderColor: 'var(--primary)' }}>
                <label style={{ color: 'var(--primary)' }}>Hourly Capacity</label>
                <span style={{ color: 'var(--primary)' }}>{providerData.slotsPerHour || 1} Slots</span>
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

              {/* Throughput Capacity Configuration */}
              <div className="capacity-config-row mb-8 p-4 glass-stat" style={{ borderRadius: '20px', border: '1px solid var(--primary-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>Throughput Capacity</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.7 }}>How many appointments can be booked per hour?</p>
                  </div>
                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select 
                        className="input-field" 
                        style={{ width: '80px', height: '40px', borderRadius: '10px', textAlign: 'center' }}
                        value={editFormData.slotsPerHour}
                        onChange={(e) => setEditFormData({...editFormData, slotsPerHour: parseInt(e.target.value)})}
                      >
                        {[1,2,3,4,5,6,8,10,12,15].map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>slots</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="status-badge-unified sb-confirmed" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                        {providerData.slotsPerHour || 1} Appointments / Hr
                      </div>
                      <button 
                        onClick={handleEditClick}
                        className="btn-pill"
                        style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 800, borderRadius: '8px', cursor: 'pointer' }}
                      >
                        Adjust
                      </button>
                    </div>
                  )}
                </div>
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

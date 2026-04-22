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
import { Calendar, User, Clock, CheckCircle, XCircle, MapPin, Phone, Star, Briefcase, Activity, Mail, TrendingUp, ShieldCheck, Camera, Edit3, Edit, Award, DollarSign, List, Grid, ChevronLeft, ChevronRight, Zap, Moon } from 'lucide-react';
import ProviderSetupWizard from './ProviderSetupWizard';
import VitalCard from './common/VitalCard';
import { calculateAge } from '../../utils/dateUtils';

const ProviderDashboard = ({ handleLogout }) => {
  const { showToast } = useToast();
  const [currentTab, setCurrentTab] = useState('appointments');
  const [viewMode, setViewMode] = useState('list');
  const [appointments, setAppointments] = useState([]);
  const [providerData, setProviderData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [wizardStartStep, setWizardStartStep] = useState(1);
  const [wizardIsSingleStep, setWizardIsSingleStep] = useState(false);
  const [wizardOnlyField, setWizardOnlyField] = useState(null);
  
  // Inline Availability Editing
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [editAvailabilityData, setEditAvailabilityData] = useState({
    slotDuration: 15,
    throughputCapacity: 1,
    availability: []
  });
  
  const openWizard = (step = 1, single = false, field = null) => {
    // If we are in the availability tab, use inline editing instead of wizard
    if (currentTab === 'availability' && step === 5) {
      startEditingAvailability();
      return;
    }
    setWizardStartStep(step);
    setWizardIsSingleStep(single);
    setWizardOnlyField(field);
    setShowSetupWizard(true);
  };

  const startEditingAvailability = () => {
    setEditAvailabilityData({
      slotDuration: providerData?.slotDuration || 15,
      throughputCapacity: providerData?.throughputCapacity || providerData?.maxPatientsPerSlot || 1,
      availability: providerData?.availability || []
    });
    setIsEditingAvailability(true);
  };

  const handleInlineAvailabilityChange = (day, field, value) => {
    setEditAvailabilityData(prev => ({
      ...prev,
      availability: prev.availability.map(a => 
        a.day === day 
          ? { ...a, slots: [{ ...a.slots[0], [field]: value }] }
          : a
      )
    }));
  };

  const toggleInlineDay = (day) => {
    setEditAvailabilityData(prev => {
      const exists = prev.availability.find(a => a.day === day);
      if (exists) {
        return { ...prev, availability: prev.availability.filter(a => a.day !== day) };
      } else {
        return { 
          ...prev, 
          availability: [...prev.availability, { day, slots: [{ startTime: '09:00', endTime: '17:00' }] }] 
        };
      }
    });
  };

  const handleThroughputCapacityChange = (e) => {
    setEditAvailabilityData(prev => ({ ...prev, throughputCapacity: e.target.value }));
  };

  const handleSaveAvailability = async () => {
    setLoading(true);
    try {
      // Construct a clean payload to avoid 500 errors from populated objects or extra fields
      const payload = {
        fathersName: providerData.fathersName,
        mothersName: providerData.mothersName,
        registrationNumber: providerData.registrationNumber,
        medicalCouncil: providerData.medicalCouncil,
        specialization: providerData.specialization,
        degrees: providerData.degrees,
        medicalCollege: providerData.medicalCollege,
        yearOfDegreeAchieved: providerData.yearOfDegreeAchieved,
        experience: providerData.experience,
        bio: providerData.bio,
        location: providerData.location,
        clinicName: providerData.clinicName,
        clinicAddress: providerData.clinicAddress,
        awards: providerData.awards,
        consultationFees: providerData.consultationFees,
        consultationModes: providerData.consultationModes,
        hospitalId: providerData.hospitalId?._id || providerData.hospitalId,
        slotDuration: Number(editAvailabilityData.slotDuration),
        throughputCapacity: Number(editAvailabilityData.throughputCapacity),
        availability: editAvailabilityData.availability,
        visibility: providerData.visibility || 'public'
      };

      await api.post('/providers/profile', payload);
      
      showToast('Availability updated successfully', 'success');
      // Refresh provider data
      const { data } = await api.get('/providers/profile');
      setProviderData(data);
      setIsEditingAvailability(false);
    } catch (err) {
      console.error('Update failed:', err);
      showToast('Failed to update availability. Please check your data.', 'error');
    } finally {
      setLoading(false);
    }
  };

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

      // Fetch Profile Data & User identity
      try {
        const [providerRes, userRes] = await Promise.all([
          api.get('/providers/profile'),
          api.get('/auth/me')
        ]);
        
        setProviderData(providerRes.data);
        setUserData(userRes.data);

        // If profile is very basic, show wizard
        if (!providerRes.data.registrationNumber || !providerRes.data.clinicName) {
           setShowSetupWizard(true);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setShowSetupWizard(true);
          try {
            const userRes = await api.get('/auth/me');
            setUserData(userRes.data);
            setProviderData({
              userId: userRes.data,
              hospitalId: null,
              specialization: '',
              experience: 0,
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
      pricePerHour: providerData?.consultationFees?.inPerson || 0,
      slotsPerHour: providerData.throughputCapacity || providerData.maxPatientsPerSlot || 1,
      bio: providerData?.bio || '',
      location: providerData?.location || '',
      availability: providerData?.availability ? [...providerData.availability] : []
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async (updatedData) => {
      setProviderData(updatedData);
      if (updatedData.userId) {
        setUserData(updatedData.userId);
      }
      setShowSetupWizard(false);
      setWizardStartStep(1); // Reset for next time
  };

  const handleProfileLegacySave = async () => {
    setSaving(true);
    try {
      await api.post('/providers/profile', editFormData);
      const { data } = await api.get('/providers/profile');
      setProviderData(data);
      setIsEditing(false);
      showToast('Profile updated!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save', 'error');
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

  const calculateCompletionRate = () => {
    if (appointments.length === 0) return 0;
    const completed = appointments.filter(a => a.status === 'completed').length;
    return Math.round((completed / appointments.length) * 100);
  };

  const getRecentActivity = () => {
    return appointments
      .filter(a => a.status !== 'pending')
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);
  };

  // UI helpers
  const isProfileIncomplete = !providerData?.registrationNumber || !providerData?.specialization;

  return (
    <DashboardShell
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      user={providerData?.userId}
      role="provider"
      handleLogout={handleLogout}
    >

      {/* Profile Completeness Banner */}
      {isProfileIncomplete && !showSetupWizard && currentTab === 'appointments' && (
        <div className="onboarding-banner glass-stat animate-slide-up" style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          color: 'white',
          padding: '24px 32px',
          borderRadius: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
               <ShieldCheck color="#10b981" size={24} />
               <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>Finalize Your Profile</h3>
            </div>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '0.95rem' }}>Complete your medical verification and smart scheduling to start accepting patients.</p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setShowSetupWizard(true)}
            style={{ padding: '12px 28px', borderRadius: '14px', background: '#3b82f6' }}
          >
            Start Verification Wizard
          </Button>
        </div>
      )}

      {showSetupWizard ? (
        <div className="setup-wizard-container py-8">
            <button 
                onClick={() => setShowSetupWizard(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 700, marginBottom: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <ChevronLeft size={20} /> Back to dashboard
            </button>
            <ProviderSetupWizard 
                key={userData?._id ? `wizard-${userData._id}-${!!userData.dob}` : 'wizard-new'}
                user={userData} 
                existingProfile={providerData} 
                onComplete={handleSaveProfile} 
                startStep={wizardStartStep}
                isSingleStep={wizardIsSingleStep}
                onlyField={wizardOnlyField}
            />
        </div>
      ) : (
        <>
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
                      title="List View"
                    >
                      <List size={18} />
                    </button>
                    <button 
                      className={`switch-btn-p ${viewMode === 'calendar' ? 'active' : ''}`}
                      onClick={() => setViewMode('calendar')}
                      title="Calendar View"
                    >
                      <Calendar size={18} />
                    </button>
                  </div>
                  <div className="meta-info hide-mobile">
                    <span className="badge-premium" style={{ border: '1.5px solid var(--primary-light)', color: 'var(--primary)', padding: '8px 16px', borderRadius: '14px', fontSize: '0.8rem', fontWeight: 800 }}>
                      {appointments.filter(a => {
                        if (a.status !== 'confirmed') return false;
                        const apptDate = new Date(a.date).toISOString().split('T')[0];
                        const apptEndTime = new Date(`${apptDate}T${a.endTime}`);
                        return apptEndTime > new Date();
                      }).length} Active Visits
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
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

      {currentTab === 'profile' && providerData && (
        <div className="modern-profile-shell animate-slide-up" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '32px', alignItems: 'start' }}>
          {/* LEFT COLUMN: Premium Expert Hero Sidebar */}
          <div className="profile-hero-glass" style={{ padding: '24px', textAlign: 'center', position: 'sticky', top: 'calc(var(--header-height) + 24px)', zIndex: 10, overflow: 'hidden' }}>
            <div className="avatar-glow-container" style={{ marginBottom: '12px' }}>
              <div className="avatar-glow-ring"></div>
              <img 
                src={providerData.userId?.avatar || 'https://cdn-icons-png.flaticon.com/512/1053/1053244.png'} 
                alt="Expert" 
                className="profile-avatar-giant" 
                style={{ width: '90px', height: '90px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div className={`status-badge-unified ${providerData.isVerified ? 'sb-confirmed' : 'sb-pending'}`} style={{ marginBottom: '10px', padding: '5px 12px', fontSize: '0.65rem' }}>
                {providerData.isVerified ? 'VERIFIED SPECIALIST' : 'VERIFICATION PENDING'}
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '8px 0 2px', letterSpacing: '-0.5px' }}>
                Dr. {providerData.userId?.name}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, opacity: 0.8, margin: 0 }}>{providerData.userId?.email}</p>
            </div>

            <div className="rating-shimmer" style={{ marginBottom: '16px', padding: '6px 14px', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill={i <= Math.floor(providerData.rating || 4.9) ? "#f59e0b" : "none"} color="#f59e0b" />)}
              </div>
              <span style={{ fontWeight: 800, marginLeft: '6px' }}>{providerData.rating || 4.9} EXPERT SCORE</span>
            </div>

            <div className="profile-summary-vitals" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
              <VitalCard label="Expertise" value={providerData.specialization || '—'} icon={Activity} color="blue" />
              <VitalCard label="Experience" value={`${providerData.experience || 0}+ Yrs`} icon={Award} color="green" />
              <VitalCard label="Fee" value={`₹${providerData.consultationFees?.inPerson || 0}`} icon={DollarSign} color="orange" />
              <VitalCard label="Capacity" value={`${providerData.throughputCapacity || 1}/Slot`} icon={Clock} color="purple" />
            </div>

            <Button 
              variant="primary" 
              className="w-full" 
              onClick={() => openWizard(1)}
              style={{ borderRadius: '14px', padding: '12px', fontWeight: 800, fontSize: '0.9rem' }}
            >
              <Edit3 size={16} style={{ marginRight: '6px' }} /> Update Profile
            </Button>
          </div>

          {/* RIGHT COLUMN: Enhanced Data Packs */}
          <div className="profile-main-content" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* PROFESSIONAL BIO - PRIMARY HIGHLIGHT */}
            <div className="glass-stat" style={{ padding: '24px', borderRadius: '24px', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: 'white', padding: '8px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                  <Star size={18} color="#f59e0b" fill="#f59e0b" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>Professional Bio</h3>
              </div>
              
              <div className="data-item-premium" style={{ alignItems: 'start', background: 'white', border: '1.5px solid #f1f5f9', padding: '16px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: '#475569', fontWeight: 500, fontStyle: providerData.bio ? 'normal' : 'italic' }}>
                    {providerData.bio || 'Your professional biography provides patients with meaningful context about your practice.'}
                  </p>
                </div>
              </div>
            </div>

            {/* PERSONAL IDENTITY */}
            <div className="glass-stat" style={{ padding: '24px', borderRadius: '24px', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: 'white', padding: '8px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                  <User size={18} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>Personal Identity</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div className="data-item-premium" style={{ padding: '10px 14px' }}>
                  <div className="data-icon-wrapper"><User size={18} /></div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Full Legal Name</label>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{providerData.userId?.name || '—'}</span>
                  </div>
                </div>
                <div className="data-item-premium">
                  <div className="data-icon-wrapper"><User size={18} /></div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Father's Name</label>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{providerData.fathersName || '—'}</span>
                  </div>
                </div>
                <div className="data-item-premium">
                  <div className="data-icon-wrapper"><User size={18} /></div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Mother's Name</label>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{providerData.mothersName || '—'}</span>
                  </div>
                </div>
                <div className="data-item-premium">
                  <div className="data-icon-wrapper"><Clock size={18} /></div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Age</label>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{calculateAge(providerData.userId?.dob) || providerData.userId?.age || '—'} Years</span>
                  </div>
                </div>
                <div className="data-item-premium">
                  <div className="data-icon-wrapper"><Mail size={18} /></div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Email Address</label>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{providerData.userId?.email || '—'}</span>
                  </div>
                </div>
                <div className="data-item-premium">
                  <div className="data-icon-wrapper"><Phone size={18} /></div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Mobile Number</label>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{providerData.userId?.phone || '—'}</span>
                  </div>
                </div>
                <div className="data-item-premium" style={{ gridColumn: 'span 2' }}>
                  <div className="data-icon-wrapper"><MapPin size={18} /></div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Residential Address</label>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                      {providerData.address ? `${providerData.address}, ` : ''}{providerData.state || '—'}{providerData.pinCode ? ` - ${providerData.pinCode}` : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* WORKING LOCATION */}
            <div className="glass-stat" style={{ padding: '24px', borderRadius: '24px', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: 'white', padding: '8px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                  <MapPin size={18} color="#10b981" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>Working Location</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="data-item-premium" style={{ background: 'linear-gradient(90deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1.5px solid #bae6fd', padding: '12px 16px' }}>
                   <div className="data-icon-wrapper" style={{ background: 'white' }}><Activity size={18} /></div>
                   <div style={{ flex: 1 }}>
                     <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: '#0369a1', textTransform: 'uppercase' }}>Clinical Institution</label>
                     <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0c4a6e' }}>{providerData.clinicName || 'Universal Health Center'}</span>
                   </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <div className="data-item-premium">
                    <div className="data-icon-wrapper"><MapPin size={18} /></div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Clinic Address</label>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                        {providerData.clinicAddress || '—'}{providerData.clinicState ? `, ${providerData.clinicState}` : ''}{providerData.clinicPinCode ? ` - ${providerData.clinicPinCode}` : ''}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* MEDICAL CREDENTIALS */}
            <div className="glass-stat" style={{ padding: '24px', borderRadius: '24px', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: 'white', padding: '8px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                  <ShieldCheck size={18} color="#7c3aed" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>Medical Credentials</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <div className="data-item-premium">
                  <div className="data-icon-wrapper"><ShieldCheck size={18} /></div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Registration Number</label>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{providerData.registrationNumber || '—'}</span>
                  </div>
                </div>
                <div className="data-item-premium">
                  <div className="data-icon-wrapper"><Activity size={18} /></div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Medical Council</label>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{providerData.medicalCouncil || '—'}</span>
                  </div>
                </div>
                <div className="data-item-premium">
                  <div className="data-icon-wrapper"><Award size={18} /></div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Professional Degrees</label>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{providerData.degrees?.length > 0 ? providerData.degrees.join(', ') : '—'}</span>
                  </div>
                </div>
                <div className="data-item-premium">
                  <div className="data-icon-wrapper"><Briefcase size={18} /></div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Affiliated Institution</label>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{providerData.medicalCollege || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentTab === 'availability' && providerData && (
        <div className="modern-profile-shell animate-slide-up" style={{ display: 'block' }}>
           <div className="info-pack-card" style={{ padding: '24px' }}>
              <div className="pack-header" style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock size={28} color="var(--primary)" />
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Schedule & Availability</h2>
                </div>
                {!isEditingAvailability && (
                  <button 
                    onClick={() => startEditingAvailability()}
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Edit size={16} /> Edit Schedule
                  </button>
                )}
              </div>
              
              {/* Compact Capacity Section */}
              <div className="capacity-bar-compact">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'var(--primary-light)', padding: '8px', borderRadius: '10px' }}>
                    <Zap size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>Throughput Capacity</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Patients allowed per scheduled time slot.</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {isEditingAvailability ? (
                    <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '8px 16px', borderRadius: '14px', border: '1.5px solid var(--primary)', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.1)' }}>
                      <input 
                        type="number" 
                        min="1"
                        value={editAvailabilityData.throughputCapacity} 
                        onChange={handleThroughputCapacityChange}
                        style={{ width: '60px', border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)', textAlign: 'center' }}
                      />
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase' }}>Slots</span>
                    </div>
                  ) : (
                    <div style={{ background: 'var(--primary)', padding: '10px 24px', borderRadius: '14px', color: 'white', fontWeight: 900, fontSize: '1.1rem', boxShadow: '0 8px 16px rgba(var(--primary-rgb), 0.2)' }}>
                      {providerData.throughputCapacity || 1} <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: '4px' }}>PER SLOT</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Seamless Availability List */}
              <div className="availability-list-seamless">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                   const dayObj = isEditingAvailability 
                     ? editAvailabilityData.availability.find(a => a.day === day)
                     : providerData.availability?.find(a => a.day === day);
                   
                   return (
                     <div key={day} className={`availability-row-seamless ${dayObj ? 'active' : ''}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <span className="day-label-premium">{day}</span>
                          
                          {isEditingAvailability ? (
                            <button 
                              type="button" 
                              onClick={() => toggleInlineDay(day)}
                              className={`status-toggle-seamless ${dayObj ? 'status-toggle-on' : 'status-toggle-off'}`}
                            >
                              {dayObj ? 'ONLINE' : 'OFFLINE'}
                            </button>
                          ) : (
                            <div className={`status-badge-unified ${dayObj ? 'sb-confirmed' : 'sb-completed'}`} style={{ padding: '6px 14px', fontSize: '0.7rem' }}>
                              {dayObj ? 'ACTIVE' : 'OFF'}
                            </div>
                          )}
                        </div>
                        
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {dayObj ? (
                            <div className="time-range-seamless">
                              {isEditingAvailability ? (
                                <>
                                  <input 
                                    type="time" 
                                    value={dayObj.slots[0]?.startTime || '09:00'} 
                                    onChange={(e) => handleInlineAvailabilityChange(day, 'startTime', e.target.value)}
                                    className="time-input-premium"
                                  />
                                  <TrendingUp size={14} style={{ color: '#cbd5e1', transform: 'rotate(90deg)' }} />
                                  <input 
                                    type="time" 
                                    value={dayObj.slots[0]?.endTime || '17:00'} 
                                    onChange={(e) => handleInlineAvailabilityChange(day, 'endTime', e.target.value)}
                                    className="time-input-premium"
                                  />
                                </>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 800, color: '#1e293b', fontSize: '0.95rem' }}>
                                  <span>{dayObj.slots[0]?.startTime || '09:00'}</span>
                                  <TrendingUp size={14} style={{ color: '#cbd5e1', transform: 'rotate(90deg)' }} />
                                  <span>{dayObj.slots[0]?.endTime || '17:00'}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px' }}>NOT SCHEDULED</span>
                          )}
                        </div>
                     </div>
                   )
                })}
              </div>

              {/* Action Buttons */}
              {isEditingAvailability && (
                <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
                  <Button 
                    variant="primary" 
                    onClick={handleSaveAvailability} 
                    loading={loading}
                    style={{ flex: 1, borderRadius: '16px', padding: '16px', fontSize: '1rem', fontWeight: 800 }}
                  >
                    Save Changes
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsEditingAvailability(false)} 
                    disabled={loading}
                    style={{ flex: 1, borderRadius: '16px', padding: '16px', fontSize: '1rem', fontWeight: 800 }}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {!isEditingAvailability && (
                <div style={{ marginTop: '48px', padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                   <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
                     <strong>Stability Tip:</strong> Keeping consistent availability helps patients book appointments more reliably. Changes to your schedule will take effect immediately for future bookings.
                   </p>
                </div>
              )}
           </div>
        </div>
      )}
        </>
      )}
    </DashboardShell>
  );
};

export default ProviderDashboard;

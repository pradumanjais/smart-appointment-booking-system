import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Calendar, Clock, User, CheckCircle, Video, MessageSquare, ChevronRight, ChevronLeft, PlusSquare, Hospital, Phone, Activity, ShieldCheck, Mail, Camera, Edit3, Shield, Download, Droplet } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import InputField from '../common/InputField';
import Skeleton from '../common/Skeleton';
import api from '../../api';
import './dashboard.css';
import './ProfileRedesign.css';
import html2canvas from 'html2canvas';
import AppointmentCard from './AppointmentCard';
import DashboardShell from './layout/DashboardShell';
import AppointmentListCard from './common/AppointmentListCard';
import StatCard from './common/StatCard';
import { useToast } from '../../context/ToastContext';
import ProfileWizard from './ProfileWizard';
import ActionCard from './common/ActionCard';
import VitalCard from './common/VitalCard';
import ProfileInfoPack from './common/ProfileInfoPack';
import ProfileDataItem from './common/ProfileDataItem';
import { calculateAge } from '../../utils/dateUtils';

const UserDashboard = ({ handleLogout }) => {
  const { showToast } = useToast();
  const [currentTab, setCurrentTab] = useState('overview');
  const [myAppointments, setMyAppointments] = useState([]);
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileTab, setProfileTab] = useState('personal');
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    age: '',
    bloodGroup: '',
    avatar: '',
    state: '',
    address: '',
    city: '',
    pinCode: '',
    fathersName: '',
    mothersName: '',
    dob: '',
    gender: '',
    allergies: '',
    conditions: '',
    medications: '',
    pastSurgeries: '',
    emergencyName: '',
    emergencyPhone: '',
    username: '',
    languagePreference: 'English',
    notificationPreferences: { sms: true, email: true, app: true },
    privacySettings: { dataShared: false, profileVisible: true }
  });
  
  // Booking Wizard State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const cardRef = React.useRef(null);
  const passRef = React.useRef(null);
  const isFollowUpDeepLink = React.useRef(false);
  const [downloading, setDownloading] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [capacityMap, setCapacityMap] = useState({});
  const [loadingCapacity, setLoadingCapacity] = useState(false);
  const [previousVisits, setPreviousVisits] = useState([]);
  
  const [bookingData, setBookingData] = useState({
    hospitalId: '',
    hospitalState: '',
    appointmentMode: 'Physical',
    appointmentType: 'New',
    clinicName: '',
    department: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    phone: '',
    success: false
  });

  // Reset booking wizard whenever user navigates to the browse tab
  useEffect(() => {
    if (currentTab === 'browse') {
      // Skip reset if this is a follow-up deep-link from the schedule
      if (isFollowUpDeepLink.current) {
        isFollowUpDeepLink.current = false;
        return;
      }
      setStep(1);
      setSelectedProvider(null);
      setSelectedHospital(null);
      setCapacityMap({});
      setBookingData({
        hospitalId: '',
        hospitalState: '',
        appointmentMode: 'Physical',
        appointmentType: 'New',
        clinicName: '',
        department: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        phone: '',
        success: false
      });
    }
  }, [currentTab]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, hospRes, userRes] = await Promise.all([
          api.get('/bookings/my-appointments'),
          api.get('/hospitals/locations'),
          api.get('/auth/me')
        ]);
        const appointments = apptRes.data.sort((a, b) => {
          const dateComparison = new Date(b.date) - new Date(a.date);
          if (dateComparison !== 0) return dateComparison;
          return b.startTime.localeCompare(a.startTime);
        });
        setMyAppointments(appointments);
        
        // Process unique previous visits
        if (Array.isArray(appointments)) {
          const unique = [];
          const seen = new Set();
          appointments.forEach(appt => {
            const provider = appt.providerId;
            if (!provider) return;
            const providerId = provider._id || provider;
            
            // Smarter Location Key: Prioritize Hospital ID, fallback to Clinic Name
            const locName = appt.hospitalId?.name || appt.clinicName || 'Unknown';
            const locId = appt.hospitalId?._id || appt.hospitalId || locName;
            
            const key = providerId;
            if (!seen.has(key)) {
              seen.add(key);
              unique.push({
                provider,
                hospital: appt.hospitalId,
                clinicName: appt.clinicName || appt.hospitalId?.name,
                department: appt.department
              });
            }
          });
          setPreviousVisits(unique);
        }
        setHospitals(hospRes.data);
        setUserData(userRes.data);
        setProfileForm({
          name: userRes.data.name,
          phone: userRes.data.phone || '',
          age: userRes.data.age || '',
          bloodGroup: userRes.data.bloodGroup || '',
          avatar: userRes.data.avatar || '',
          state: userRes.data.state || '',
          city: userRes.data.city || '',
          pinCode: userRes.data.pinCode || '',
          address: userRes.data.address || '',
          fathersName: userRes.data.fathersName || '',
          mothersName: userRes.data.mothersName || '',
          dob: userRes.data.dob?.split('T')[0] || '',
          gender: userRes.data.gender || '',
          allergies: userRes.data.allergies?.join(', ') || '',
          conditions: userRes.data.conditions?.join(', ') || '',
          medications: userRes.data.medications?.join(', ') || '',
          pastSurgeries: userRes.data.pastSurgeries?.join(', ') || '',
          emergencyName: userRes.data.emergencyContact?.name || '',
          emergencyPhone: userRes.data.emergencyContact?.phone || '',
          username: userRes.data.username || '',
          languagePreference: userRes.data.languagePreference || 'English',
          notificationPreferences: userRes.data.notificationPreferences || { sms: true, email: true, app: true },
          privacySettings: userRes.data.privacySettings || { dataShared: false, profileVisible: true }
        });
        if (userRes.data.phone) {
          setBookingData(prev => ({ ...prev, phone: userRes.data.phone }));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  // Auto-calculate age when DOB changes
  useEffect(() => {
    if (profileForm.dob) {
      const calculatedAge = calculateAge(profileForm.dob);
      if (calculatedAge !== profileForm.age) {
        setProfileForm(prev => ({ ...prev, age: calculatedAge }));
      }
    }
  }, [profileForm.dob]);

  const refreshAppointments = async () => {
    try {
      const { data } = await api.get('/bookings/my-appointments');
      const sortedData = data.sort((a, b) => {
        const dateComparison = new Date(b.date) - new Date(a.date);
        if (dateComparison !== 0) return dateComparison;
        return b.startTime.localeCompare(a.startTime);
      });
      setMyAppointments(sortedData);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch providers for Step 5
  useEffect(() => {
    if (step === 5) {
      const fetchFilteredProviders = async () => {
        setLoading(true);
        try {
          const { data } = await api.get('/providers', {
            params: {
              hospitalId: bookingData.hospitalId,
              specialization: bookingData.department
            }
          });
          setAvailableProviders(data);
        } catch (err) {
          console.error('Error fetching providers');
        } finally {
          setLoading(false);
        }
      };
      fetchFilteredProviders();
    }
  }, [step, bookingData.hospitalId, bookingData.department]);

  // Fetch real-time live capacity mapping from backend node
  useEffect(() => {

    if (step === 4 && bookingData.date && (bookingData.hospitalId || bookingData.clinicName) && bookingData.department) {
      const fetchCapacity = async () => {
        setLoadingCapacity(true);
        setCapacityMap({}); 
        try {
          const loc = bookingData.hospitalId || bookingData.clinicName;
          if (!loc) {
            setLoadingCapacity(false);
            return;
          }

          const { data } = await api.get('/bookings/capacity', {
            params: {
              date: bookingData.date,
              hospitalId: loc,
              department: bookingData.department,
              providerId: selectedProvider?._id || selectedProvider
            }
          });
          if (data.capacityMap) {
            setCapacityMap(data.capacityMap);
          }
        } catch (err) {
          console.error('Failed to fetch real-time capacity', err);
          showToast('Specialist schedule is currently syncing or unavailable. Please try a different date.', 'error');
        } finally {
          setLoadingCapacity(false);
        }
      };
      
      fetchCapacity();
    }
  }, [step, bookingData.date, bookingData.hospitalId, bookingData.clinicName, bookingData.department, selectedProvider]);

  const handleNext = () => {
    // Clear slots when progressing context (Steps 1-3)
    // But do NOT clear when moving FROM Step 4 to 5/6
    if (step < 4) {
      setBookingData(prev => ({ ...prev, startTime: '', endTime: '' }));
    }

    if (step === 2 && bookingData.appointmentType === 'Follow-up' && bookingData.department) {
      setStep(4);
    } else if (step === 4 && bookingData.appointmentType === 'Follow-up' && selectedProvider) {
      setStep(6); // Skip Step 5 (Provider Selection) since we already have the doctor
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 4 && bookingData.appointmentType === 'Follow-up' && bookingData.department) {
      setStep(2);
    } else if (step === 6 && bookingData.appointmentType === 'Follow-up' && selectedProvider) {
      setStep(4); // Go back to Date/Slot selection, skipping doctor list
    } else {
      setStep(step - 1);
    }
  };

  const handleBook = async () => {
    setLoading(true);
    try {
      const res = await api.post('/bookings/book', {
        providerId: selectedProvider._id,
        ...bookingData,
        phone: bookingData.phone || userData?.phone
      });
      setBookingData(prev => ({ ...prev, ...res.data, success: true }));
      setStep(6);
      refreshAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
      setCurrentTab('overview');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestFollowUp = (input) => {
    // Normalize input (Handles both raw Appointment objects and Specialist Summary objects)
    const providerObj = input.provider || input.providerId;
    const hospSource = input.hospitalId || input.hospital;
    const clinicSource = input.clinicName;
    const deptSource = input.department;

    // 1. Recover Hospital ID (Priority: History record -> Provider profile)
    const rawHospId = hospSource?._id || hospSource || providerObj?.hospitalId;
    const hospId = rawHospId?._id || rawHospId; 
    
    // 2. Recover Clinic Name (Priority: History record -> Provider profile)
    const clinicName = clinicSource || providerObj?.clinicName || '';
    
    // 3. Find full hospital object
    const fullHospital = hospitals.find(h => h._id === hospId) || hospSource || providerObj?.hospitalId;

    setBookingData({
      ...bookingData,
      hospitalId: hospId,
      hospitalState: fullHospital?.state || input.hospitalState || providerObj?.clinicState || '',
      clinicName: clinicName,
      appointmentType: 'Follow-up',
      department: deptSource || providerObj?.specialization || '',
      phone: userData?.phone || input.phone || '',
      startTime: '', // Ensure old slots are cleared
      endTime: ''
    });
    
    setSelectedHospital(fullHospital);
    setSelectedProvider(providerObj);
    isFollowUpDeepLink.current = true;
    
    setCurrentTab('browse');
    setStep(4); 
    showToast(`Select date and time`, 'info');
  };

  const handleApptAction = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      showToast(`Appointment ${status} successfully`, 'success');
      refreshAppointments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleDownloadTicket = async (appt) => {
    setTicketData(appt);
    setDownloading(true);
    showToast('Generating ticket...', 'info');
    try {
      await new Promise(r => setTimeout(r, 400));
      if (!cardRef.current) return;
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `appointment-ticket-${appt._id?.toString().slice(-6)}.png`;
      link.click();
      showToast('Ticket downloaded!', 'success');
    } catch (err) {
      console.error('Download failed:', err);
      showToast('Could not generate ticket', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        ...profileForm,
        allergies: profileForm.allergies.split(',').map(s => s.trim()).filter(s => s),
        conditions: profileForm.conditions.split(',').map(s => s.trim()).filter(s => s),
        medications: profileForm.medications.split(',').map(s => s.trim()).filter(s => s),
        pastSurgeries: profileForm.pastSurgeries.split(',').map(s => s.trim()).filter(s => s),
        emergencyContact: {
          name: profileForm.emergencyName,
          phone: profileForm.emergencyPhone
        }
      };
      const { data } = await api.put('/auth/profile', submitData);
      setUserData(data);
      // Re-sync profileForm from saved data
      setProfileForm({
        name: data.name || '',
        phone: data.phone || '',
        age: data.age || '',
        bloodGroup: data.bloodGroup || '',
        avatar: data.avatar || '',
        state: data.state || '',
        city: data.city || '',
        pinCode: data.pinCode || '',
        address: data.address || '',
        fathersName: data.fathersName || '',
        mothersName: data.mothersName || '',
        dob: data.dob?.split('T')[0] || '',
        gender: data.gender || '',
        allergies: data.allergies?.join(', ') || '',
        conditions: data.conditions?.join(', ') || '',
        medications: data.medications?.join(', ') || '',
        pastSurgeries: data.pastSurgeries?.join(', ') || '',
        emergencyName: data.emergencyContact?.name || '',
        emergencyPhone: data.emergencyContact?.phone || '',
        username: data.username || '',
        languagePreference: data.languagePreference || 'English',
        notificationPreferences: data.notificationPreferences || { sms: true, email: true, app: true },
        privacySettings: data.privacySettings || { dataShared: false, profileVisible: true }
      });
      setEditMode(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setSelectedProvider(null);
    setSelectedHospital(null);
    setBookingData({
      ...bookingData,
      hospitalId: '',
      hospitalState: '',
      department: '',
      startTime: '',
      endTime: '',
      phone: userData?.phone || '',
      success: false
    });
    setCurrentTab('appointments');
  };

  const isProfileIncomplete = !userData?.phone || !userData?.dob || !userData?.gender || !userData?.address;
  const [showProfileWizard, setShowProfileWizard] = useState(false);
  
  const calculateCompleteness = () => {
    if (!userData) return 0;
    const fields = ['phone', 'gender', 'dob', 'address', 'bloodGroup', 'city', 'pinCode', 'govtId', 'emergencyContact.name', 'insurance.provider'];
    let filled = 0;
    fields.forEach(f => {
      if (f.includes('.')) {
        const [pa, ch] = f.split('.');
        if (userData[pa]?.[ch]) filled++;
      } else if (userData[f]) {
        filled++;
      }
    });
    // Base name/email are always there
    return Math.round(((filled + 2) / (fields.length + 2)) * 100);
  };

  const completeness = calculateCompleteness();

  const getRecentlyVisitedDepts = () => {
    if (!bookingData.hospitalId) return [];
    const seen = new Set();
    const suggestions = [];
    
    myAppointments.forEach(a => {
      const hospId = a.hospitalId?._id || a.hospitalId;
      if (hospId === bookingData.hospitalId && a.status === 'completed' && !seen.has(a.department)) {
        seen.add(a.department);
        suggestions.push({
          name: a.department,
          doctorName: a.providerId?.userId?.name || 'Expert',
          provider: a.providerId
        });
      }
    });
    return suggestions;
  };

  const recentlyVisited = getRecentlyVisitedDepts();

  const states = [...new Set(hospitals.map(h => h.state))].sort();

  const stepsList = [
    { num: 1, label: 'Select State/Hospital', icon: PlusSquare },
    { num: 2, label: 'Select Appointment Type', icon: CheckCircle },
    { num: 3, label: 'Select Department', icon: PlusSquare },
    { num: 4, label: 'Select Date of Appointment', icon: Calendar },
    { num: 5, label: 'Select Your Expert', icon: User },
    { num: 6, label: 'Get Confirmation SMS', icon: MessageSquare },
  ];

  return (
    <DashboardShell 
      currentTab={currentTab} 
      setCurrentTab={setCurrentTab} 
      user={userData} 
      role="user"
      handleLogout={handleLogout}
    >

      {currentTab === 'overview' && (
        <div className="dashboard-overview animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Welcome Header */}
          <div className="overview-header" style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-1px' }}>
              Welcome back, <span className="text-gradient">{userData?.name?.split(' ')[0]}</span>!
            </h1>
            <p className="text-muted" style={{ fontSize: '1.2rem', fontWeight: 500 }}>Your personalized health identity and schedule insights.</p>
          </div>

          {/* Profile Completeness Banner */}
          {isProfileIncomplete && !showProfileWizard && (
            <div className="profile-completeness-banner animate-fade-in" style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              padding: '24px 32px',
              borderRadius: '28px',
              color: 'white',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 20px 40px -12px rgba(79, 70, 229, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', right: '-20px', top: '-10px', opacity: 0.1, transform: 'rotate(15deg)' }}>
                <Activity size={180} />
              </div>
              <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <ShieldCheck size={24} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Profile Security</span>
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '4px' }}>Level Up Your Medical Identity</h3>
                <p style={{ opacity: 0.9, fontSize: '1rem', maxWidth: '500px', fontWeight: 500 }}>
                  Your profile is {completeness}% complete. Add your health records and emergency contacts for a safer healthcare experience.
                </p>
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button 
                    onClick={() => {
                        setShowProfileWizard(true);
                        setCurrentTab('profile'); // Switch to profile tab view
                    }}
                    style={{ background: 'white', color: '#4f46e5', padding: '10px 24px', borderRadius: '14px', border: 'none', fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s ease' }}
                  >
                    Complete Now
                  </button>
                  <div style={{ width: '150px', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}>
                    <div style={{ width: `${completeness}%`, height: '100%', background: 'white', borderRadius: '10px' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stat Grid */}
          <div className="stats-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            <StatCard 
              label="Booked Appointments" 
              value={myAppointments.filter(a => a.status === 'confirmed').length}
              icon={Calendar}
              variant="indigo"
            />
            <StatCard 
              label="Completed Visits" 
              value={myAppointments.filter(a => a.status === 'completed').length}
              icon={CheckCircle}
              variant="emerald"
            />
            <StatCard 
              label="Total Health Records" 
              value={myAppointments.length}
              icon={ShieldCheck}
              variant="amber"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', alignItems: 'center' }}>
            {/* Action Hub */}
            <div className="action-hub glass-stat" style={{ padding: '24px 32px', borderRadius: '28px', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '24px', letterSpacing: '-0.5px' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <ActionCard 
                  title="Book Visit" 
                  description="Schedule a new consultation with medical experts."
                  icon={PlusSquare}
                  variant="indigo"
                  onClick={() => setCurrentTab('browse')}
                />
                <ActionCard 
                  title="Your Profile" 
                  description="Manage your verified medical identity files."
                  icon={User}
                  variant="emerald"
                  onClick={() => setCurrentTab('profile')}
                />
              </div>
            </div>

            {/* Upcoming Highlight */}
            <div className="upcoming-highlight glass-stat" style={{ padding: '24px 28px', borderRadius: '28px', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '24px', letterSpacing: '-0.5px' }}>Next Up</h3>
              {(() => {
                const upcoming = [...myAppointments]
                  .filter(a => a.status === 'confirmed')
                  .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
                
                if (upcoming) {
                  return (
                    <div style={{ position: 'relative' }}>
                      {/* Decorative background glow */}
                      <div style={{
                        position: 'absolute',
                        top: '-15%',
                        right: '-15%',
                        width: '130%',
                        height: '130%',
                        background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.08) 0%, transparent 65%)',
                        borderRadius: '50%',
                        zIndex: 0,
                        pointerEvents: 'none'
                      }} />
                      
                      <ActionCard 
                        title={`${upcoming.startTime} - ${upcoming.endTime}`} 
                        description={`Dr. ${upcoming.providerId?.userId?.name || 'Expert'} • ${upcoming.department}\n${upcoming.clinicName || upcoming.hospitalId?.name || 'Clinic'}\n${new Date(upcoming.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                        icon={Clock}
                        variant="violet"
                        centered={true}
                        onClick={() => setCurrentTab('appointments')}
                      />
                    </div>
                  );
                } else {
                  return (
                    <div style={{ textAlign: 'center', padding: '16px 0', opacity: 0.6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#10b981' }}>
                        <ShieldCheck size={28} />
                        <p style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>Clear Schedule</p>
                      </div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 500, marginTop: '8px' }}>No pending medical visits.</p>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}

      {currentTab === 'browse' && (
        <div className="inline-wizard-layout">
          {/* LEFT PANEL: Steps Information */}
          <div className="wizard-sidebar glass">
            <h2>Need an appointment?</h2>
            <p className="wizard-subtitle">Follow the simple steps below and get your appointment fixed online!</p>
            
            <div className="wizard-steps-list">
              {stepsList.map(s => {
                const Icon = s.icon;
                const isCompleted = step > s.num;
                const isActive = step === s.num;
                return (
                  <div key={s.num} className={`wizard-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                    <Icon size={20} className="step-icon" />
                    <span>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL: Interactive content */}
          <div className="wizard-content glass">
            
            {/* Step 1: Select State/Hospital */}
            {step === 1 && (
              <div className="step-view animate-fade-in">
                <h3 className="section-title">Select State & Hospital</h3>
                <div className="state-selection">
                  <label className="input-label">Select State / Union Territory</label>
                  <select 
                    className="input-field mt-2 mb-4"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    value={bookingData.hospitalState}
                    onChange={(e) => setBookingData({...bookingData, hospitalState: e.target.value, hospitalId: ''})}
                  >
                    <option value="">Choose State</option>
                    {states.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {bookingData.hospitalState && (
                  <div className="hospital-selection animate-fade-in">
                    <label className="input-label">Hospital</label>
                    <div className="hospital-grid mt-2">
                      {hospitals.filter(h => h.state === bookingData.hospitalState).map(h => (
                        <button 
                          key={h._id} 
                          className={`hospital-btn ${bookingData.hospitalId === h._id ? 'active' : ''} ${h.type === 'clinic' ? 'type-clinic' : ''}`}
                          onClick={() => {
                            setSelectedHospital(h);
                            setBookingData({...bookingData, hospitalId: h._id, department: ''});
                          }}
                        >
                          {h.type === 'clinic' ? <Activity size={16} /> : <Hospital size={16} />} 
                          <span style={{ marginLeft: '8px' }}>{h.name}</span>
                          {h.type === 'clinic' && <span className="clinic-badge">Clinic</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Type */}
            {step === 2 && (
              <div className="step-view animate-fade-in">
                <h3 className="section-title">Select Appointment Type</h3>
                <div className="toggle-group mt-4">
                  <button 
                    className={`toggle-btn ${bookingData.appointmentType === 'New' ? 'active' : ''}`}
                    onClick={() => setBookingData({...bookingData, appointmentType: 'New'})}
                  >
                    <PlusSquare size={24} />
                    <span>New Case</span>
                  </button>
                  <button 
                    className={`toggle-btn ${bookingData.appointmentType === 'Follow-up' ? 'active' : ''}`}
                    onClick={() => setBookingData({...bookingData, appointmentType: 'Follow-up'})}
                  >
                    <CheckCircle size={24} />
                    <span>Follow-up</span>
                  </button>
                </div>

                {bookingData.appointmentType === 'Follow-up' && (
                  <div className="previous-visits-container mt-6 animate-fade-in" style={{ 
                    padding: '24px', 
                    background: 'rgba(var(--primary-rgb), 0.03)', 
                    borderRadius: '24px',
                    border: '1.5px dashed rgba(var(--primary-rgb), 0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <Activity className="text-primary" size={20} />
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>Direct Select: Previous Specialists</h4>
                    </div>

                    {previousVisits.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                        {previousVisits.map((visit, idx) => (
                          <div 
                            key={idx}
                            className="visit-history-card"
                            onClick={() => handleRequestFollowUp(visit)}
                          >
                            <img 
                              src={visit.provider?.userId?.avatar || 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'} 
                              alt="Doc" 
                            />
                            <div style={{ flex: 1 }}>
                              <p className="doctor-name">Dr. {visit.provider?.userId?.name || 'Expert'}</p>
                              <p className="visit-meta">
                                {visit.hospital?.name || visit.clinicName || 'Clinic'} • {visit.department}
                              </p>
                            </div>
                            <ChevronRight size={18} className="text-muted" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '24px', opacity: 0.6 }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>No previous visit history found.</p>
                        <p style={{ margin: 0, fontSize: '0.8rem' }}>Please complete a "New Case" booking first.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Department */}
            {step === 3 && (
              <div className="step-view animate-fade-in">
                <h3 className="section-title">Select Department</h3>
                
                {bookingData.appointmentType === 'Follow-up' && (
                  <>
                    <div className="modern-context-badge mb-4">
                      <Hospital size={14} />
                      <span>Consulting at: <strong>{selectedHospital?.name}</strong></span>
                    </div>

                    {recentlyVisited.length > 0 && (
                      <div className="recently-visited-section mb-6">
                        <label className="input-label mb-2 block" style={{ fontSize: '0.8rem', opacity: 0.7 }}>Recently Visited Specialty</label>
                        <div className="suggestion-chips">
                          {recentlyVisited.map(item => (
                            <button 
                              key={item.name}
                              className={`suggestion-chip ${bookingData.department === item.name ? 'active' : ''}`}
                              onClick={() => {
                                setBookingData({...bookingData, department: item.name});
                                setSelectedProvider(item.provider);
                              }}
                            >
                               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Activity size={14} /> {item.name}
                                </span>
                                <span style={{ fontSize: '0.65rem', opacity: 0.7, marginLeft: '20px' }}>
                                  Dr. {item.doctorName}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="input-field-wrapper mt-4">
                  <label className="input-label">Available Specialty / Department</label>
                  <select 
                    className="input-field mt-2"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    value={bookingData.department}
                    onChange={(e) => setBookingData({...bookingData, department: e.target.value})}
                  >
                    <option value="">Choose a Specialty</option>
                    {selectedHospital?.departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 4: Date & Slot */}
            {step === 4 && (
              <div className="step-view animate-fade-in">
                <h3 className="section-title">Pick Date & Time</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', marginTop: '8px', alignItems: 'start' }}>
                  {/* Column 1: Date Picker */}
                  <div className="date-picker-col">
                    <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>Select Date</label>
                    <InputField 
                      type="date" 
                      value={bookingData.date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    />
                  </div>

                  <div className="time-slots-col">
                    <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>Select Time Slot</label>
                    <div className="slots-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px' }}>
                      {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map((time, i) => {
                        // Integrate live backend capacity map
                        const liveData = capacityMap[time];
                        const isDataLoaded = Object.keys(capacityMap).length > 0;
                        const capacityState = loadingCapacity ? 'loading' : (liveData ? liveData.state : (isDataLoaded ? 'unavailable' : 'loading'));
                        const capacityPercent = liveData ? liveData.percent : 0;
                        
                        let baseColor = '#10b981'; // Emerald Green
                        let bgColor = '#ecfdf5'; // Light Green
                        let label = 'Available';
                        
                        if (capacityState === 'loading') {
                          baseColor = '#94a3b8'; // Slate Gray
                          bgColor = '#f8fafc';
                          label = 'Syncing...';
                        } else if (capacityState === 'unavailable') {
                          baseColor = '#94a3b8'; // Slate Gray
                          bgColor = '#f1f5f9'; // Light Grey Background
                          label = 'Unavailable';
                        } else if (capacityState === 'partial') {
                          baseColor = '#f59e0b'; // Amber Yellow
                          bgColor = '#fffbeb'; // Light Amber
                          label = 'Almost Full';
                        } else if (capacityState === 'full') {
                          baseColor = '#ef4444'; // Reddish Full
                          bgColor = '#fef2f2'; // Light Red
                          label = 'Full';
                        }

                        const isSelected = bookingData.startTime === time;

                        return (
                          <button 
                            key={i} 
                            disabled={capacityState === 'full' || capacityState === 'loading' || capacityState === 'unavailable'}
                            className={`slot-item premium-slot ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              if(capacityState !== 'full') {
                                setBookingData({...bookingData, startTime: time, endTime: `${parseInt(time) + 1}:00`});
                              }
                            }}
                            style={{
                              position: 'relative',
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '16px 12px',
                              border: isSelected ? `2px solid ${baseColor}` : `1px solid ${baseColor}40`,
                              borderRadius: '16px',
                              background: isSelected ? baseColor : bgColor,
                              color: isSelected ? 'white' : 'var(--text)',
                              cursor: capacityState === 'full' ? 'not-allowed' : 'pointer',
                              opacity: capacityState === 'full' ? 0.6 : 1,
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: isSelected ? `0 8px 16px ${baseColor}40` : '0 2px 8px rgba(0,0,0,0.02)'
                            }}
                          >
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>{time}</span>
                            
                            {label && (
                              <div style={{ 
                                fontSize: '0.65rem', 
                                fontWeight: 800, 
                                textTransform: 'uppercase', 
                                color: isSelected ? 'white' : baseColor,
                                background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                letterSpacing: '0.5px'
                              }}>
                                {label}
                              </div>
                            )}
                            
                            {/* Capacity Progress Bar at the bottom */}
                            {!isSelected && (capacityState !== 'loading') && (
                              <div style={{ position: 'absolute', bottom: 0, left: 0, height: '4px', width: '100%', background: 'rgba(0,0,0,0.04)' }}>
                                <div style={{ 
                                  height: '100%', 
                                  background: baseColor, 
                                  width: `${capacityState === 'available' && capacityPercent === 0 ? 20 : capacityPercent}%`,
                                  transition: 'width 0.5s ease'
                                }} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Select Doctor */}
            {step === 5 && (
              <div className="step-view animate-fade-in">
                <h3 className="section-title">Select Your Expert</h3>
                {loading ? (
                  <div className="doctor-select-grid mt-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="doctor-mini-card">
                        <Skeleton variant="circle" width={48} height={48} />
                        <div className="doctor-mini-info" style={{ flex: 1 }}>
                          <Skeleton variant="text" width="60%" />
                          <Skeleton variant="text" width="40%" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : availableProviders.length > 0 ? (
                  <div className="doctor-select-grid mt-4">
                    {availableProviders.map((p) => (
                      <div 
                        key={p._id} 
                        className={`doctor-mini-card ${selectedProvider?._id === p._id ? 'selected' : ''}`}
                        onClick={() => setSelectedProvider(p)}
                      >
                        <img src={p.userId?.avatar || 'https://cdn-icons-png.flaticon.com/512/147/147144.png'} alt="Dr." />
                        <div className="doctor-mini-info">
                          <strong>{p.userId?.name}</strong>
                          <span className="specialization-text">{p.specialization}</span>
                          <div className="doctor-location">
                            <MapPin size={12} />
                            <span>{p.hospitalId?.name || p.clinicName || 'Universal Health Center'}</span>
                          </div>
                          <div className="mini-rating"><Star size={12} fill="#ffcc00" color="#ffcc00" /> {p.rating}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-muted">No doctors found in this department.</p>
                )}
              </div>
            )}

            {/* Step 6: Confirmation SMS (Ultra Modern Pass) */}
            {step === 6 && (
              <div className="step-view text-center animate-fade-in modern-success-content">
                <div className="health-pass-container">
                  <AppointmentCard 
                    appointment={{
                      ...bookingData,
                      doctorName: selectedProvider?.userId?.name,
                      hospitalName: selectedHospital?.name,
                      hospitalAddress: selectedHospital?.address,
                      userId: userData,
                      status: bookingData.success ? 'confirmed' : 'System Processing'
                    }} 
                    cardRef={passRef}
                    footerAction={
                      bookingData.success && (
                        <button 
                          className="btn btn-primary download-pass-btn"
                          disabled={downloading}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!passRef.current) return;
                            setDownloading(true);
                            showToast('Generating appointment letter...', 'info');
                            try {
                              const btn = e.currentTarget;
                              const originalDisplay = btn.style.display;
                              btn.style.display = 'none';
                              await new Promise(r => setTimeout(r, 200));
                              const canvas = await html2canvas(passRef.current, {
                                scale: 2,
                                backgroundColor: '#ffffff',
                                logging: false,
                                useCORS: true
                              });
                              btn.style.display = originalDisplay;
                              const image = canvas.toDataURL('image/png');
                              const link = document.createElement('a');
                              link.href = image;
                              link.download = `appointment-letter-${bookingData.date}.png`;
                              link.click();
                              showToast('Appointment letter downloaded!', 'success');
                            } catch (err) {
                              console.error('Download failed:', err);
                              showToast('Could not generate letter', 'error');
                            } finally {
                              setDownloading(false);
                            }
                          }}
                          style={{
                            width: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '8px 20px',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                          }}
                        >
                          <Download size={16} /> {downloading ? 'Generating...' : 'Download'}
                        </button>
                      )
                    }
                  />

                  {bookingData.success ? (
                    <div className="success-message-area">
                      <h2 className="gradient-text-success">Successful!</h2>
                      <p className="text-muted">Your identity has been verified. A confirmation SMS is on its way.</p>
                      
                      <div className="modern-sms-box">
                         <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                           <span style={{ color: 'var(--primary)', fontWeight: 800 }}>SmartBook Alert:</span> Your visit to {selectedHospital?.name} is secured. Show this pass at the counter.
                         </p>
                      </div>
                    </div>
                  ) : (
                    <div className="pre-confirm-area">
                      <p className="text-muted">Confirming booking for: <strong>{userData?.phone || 'registered number'}</strong></p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            {step < 6 && (
              <div className="wizard-footer mt-auto">
                <Button 
                  variant="secondary" 
                  onClick={handleBack}
                  disabled={step === 1}
                  style={{ opacity: step === 1 ? 0 : 1 }}
                >
                  <ChevronLeft size={20} /> Back
                </Button>
                
                {step < 5 ? (
                  <Button 
                    onClick={handleNext} 
                    disabled={
                      (step === 1 && !bookingData.hospitalId) ||
                      (step === 3 && !bookingData.department) ||
                      (step === 4 && !bookingData.startTime) ||
                      (step === 5 && !selectedProvider)
                    }
                  >
                    Next <ChevronRight size={20} />
                  </Button>
                ) : (
                  <Button onClick={handleBook} disabled={!selectedProvider}>
                    Confirm Booking
                  </Button>
                )}
              </div>
            )}
            
            {/* Show Confirm button only when phone is entered in Step 6 */}
            {step === 6 && selectedProvider && !bookingData.success && (
              <div className="wizard-footer mt-auto">
                <Button onClick={handleBook} loading={loading} className="w-full" disabled={!bookingData.phone && !userData?.phone}>
                  Finish & Get SMS
                </Button>
              </div>
            )}

          </div>
        </div>
      )}

      {currentTab === 'appointments' && (
        <div className="appointments-view animate-fade-in">
          <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>My Appointments</h2>
              <p className="text-muted">Manage your upcoming and past medical visits</p>
            </div>
            <button className="btn btn-primary" onClick={() => setCurrentTab('browse')}>+ Book New</button>
          </div>

          <div className="appointments-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {myAppointments.length > 0 ? (
              (() => {
                const seenProviders = new Set();
                const latestCompletedIds = [];
                myAppointments.forEach(appt => {
                  const pid = appt.providerId?._id || appt.providerId;
                  if (appt.status === 'completed' && pid && !seenProviders.has(pid)) {
                    latestCompletedIds.push(appt._id);
                    seenProviders.add(pid);
                  }
                });

                return myAppointments.map(appt => (
                  <AppointmentListCard 
                    key={appt._id} 
                    appointment={appt} 
                    role="user"
                    onAction={handleApptAction}
                    onDownload={handleDownloadTicket}
                    onFollowUp={latestCompletedIds.includes(appt._id) ? handleRequestFollowUp : null}
                  />
                ));
              })()
            ) : (
              <div className="tc py-12 glass-stat">
                <Calendar size={48} className="text-muted mb-4" style={{ opacity: 0.5 }} />
                <h3>No appointments found</h3>
                <p className="text-muted">You haven't booked any appointments yet.</p>
                <button className="btn btn-primary mt-6" onClick={() => setCurrentTab('browse')}>Start Booking</button>
              </div>
            )}
          </div>
        </div>
      )}

      {currentTab === 'profile' && userData && (
        <div className="profile-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {showProfileWizard ? (
            <div className="profile-wizard-viewport">
              <button 
                onClick={() => setShowProfileWizard(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 700, marginBottom: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <ChevronLeft size={20} /> Return to standard profile
              </button>
              <ProfileWizard 
                user={userData} 
                onComplete={(updatedUser) => {
                  setUserData(updatedUser);
                  setShowProfileWizard(false);
                }} 
              />
            </div>
          ) : (
            <div className="modern-profile-shell" style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 380px) 1fr', gap: '32px', alignItems: 'start' }}>
              
              {/* LEFT COLUMN: Patient Hero Sidebar */}
              <div className="profile-hero-glass" style={{ padding: '24px', textAlign: 'center', position: 'sticky', top: 'calc(var(--header-height) + 24px)', zIndex: 10, overflow: 'hidden' }}>
                <div className="avatar-glow-container" style={{ marginBottom: '12px' }}>
                  <div className="avatar-glow-ring"></div>
                  <img 
                    src={profileForm.avatar || userData.avatar || 'https://cdn-icons-png.flaticon.com/512/147/147144.png'} 
                    alt={userData.name} 
                    className="profile-avatar-giant" 
                    style={{ width: '90px', height: '90px' }}
                  />
                  {editMode && (
                    <label className="avatar-edit-glare">
                      <Camera size={16} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                             const reader = new FileReader();
                             reader.onloadend = () => setProfileForm({...profileForm, avatar: reader.result});
                             reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div className="expert-badge-shimmer" style={{ padding: '5px 12px', fontSize: '0.65rem' }}>
                    <ShieldCheck size={12} /> VERIFIED PATIENT
                  </div>
                  <h2 className="text-gradient-name" style={{ fontSize: '1.5rem', fontWeight: 900, margin: '8px 0 2px', letterSpacing: '-0.5px' }}>
                    {profileForm.name}
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, opacity: 0.8, margin: 0 }}>{userData.email}</p>
                  <div className="patient-id-badge" style={{ marginTop: '10px', padding: '5px 14px', fontSize: '0.8rem' }}>
                    ID: {userData.patientId || 'PENDING'}
                  </div>
                </div>

                <div className="profile-summary-vitals" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  <VitalCard label="Blood Group" value={profileForm.bloodGroup || '—'} icon={Droplet} color="red" />
                  <VitalCard label="Age" value={profileForm.age || '—'} icon={Calendar} color="blue" />
                  <VitalCard label="Gender" value={profileForm.gender || '—'} icon={User} color="purple" />
                  <VitalCard label="Language" value={profileForm.languagePreference || 'English'} icon={MessageSquare} color="green" />
                </div>

                {!editMode ? (
                  <Button variant="primary" className="w-full" onClick={() => setEditMode(true)} style={{ borderRadius: '14px', padding: '10px', fontWeight: 800, fontSize: '0.9rem' }}>
                    <Edit3 size={16} style={{ marginRight: '6px' }} /> Update Profile
                  </Button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="secondary" className="w-full" onClick={() => setEditMode(false)} style={{ borderRadius: '14px', padding: '10px', fontSize: '0.85rem' }}>Cancel</Button>
                    <Button variant="primary" className="w-full" onClick={handleUpdateProfile} loading={loading} style={{ borderRadius: '14px', padding: '10px', fontSize: '0.85rem' }}>Save</Button>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Data Packs */}
              <div className="profile-main-content" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* PERSONAL IDENTITY */}
                <ProfileInfoPack title="Personal Identity" icon={User} color="var(--primary)" columns={2}>
                  <ProfileDataItem 
                    label="Full Name" value={profileForm.name} editMode={editMode} 
                    onChange={e => setProfileForm({...profileForm, name: e.target.value})} icon={User} 
                  />
                  <ProfileDataItem 
                    label="Father's Name" value={profileForm.fathersName} editMode={editMode} 
                    onChange={e => setProfileForm({...profileForm, fathersName: e.target.value})} icon={User} 
                  />
                  <ProfileDataItem 
                    label="Mother's Name" value={profileForm.mothersName} editMode={editMode} 
                    onChange={e => setProfileForm({...profileForm, mothersName: e.target.value})} icon={User} 
                  />
                  <ProfileDataItem 
                    label="Date of Birth" value={profileForm.dob} type="date" editMode={editMode} 
                    onChange={e => setProfileForm({...profileForm, dob: e.target.value})} icon={Calendar} 
                  />
                  <ProfileDataItem 
                    label="Gender" value={profileForm.gender} type="select" options={['Male', 'Female', 'Other']} editMode={editMode} 
                    onChange={e => setProfileForm({...profileForm, gender: e.target.value})} icon={User} 
                  />
                  <ProfileDataItem 
                    label="Username" value={profileForm.username} editMode={editMode} 
                    onChange={e => setProfileForm({...profileForm, username: e.target.value})} icon={Shield} 
                  />
                </ProfileInfoPack>

                {/* CONTACT & RESIDENCY */}
                <ProfileInfoPack title="Contact & Residency" icon={Phone} color="#10b981" columns={2}>
                  <ProfileDataItem 
                    label="Mobile Number" value={profileForm.phone} editMode={editMode} 
                    onChange={e => setProfileForm({...profileForm, phone: e.target.value})} icon={Phone} 
                  />
                  <ProfileDataItem 
                    label="Email Address" value={userData.email} editMode={false} icon={Mail} 
                  />
                  
                  {!editMode ? (
                    <ProfileDataItem 
                      label="Residential Address" 
                      value={`${profileForm.address}${profileForm.city ? `, ${profileForm.city}` : ''}${profileForm.state ? `, ${profileForm.state}` : ''}${profileForm.pinCode ? ` - ${profileForm.pinCode}` : ''}`} 
                      editMode={false} 
                      icon={MapPin} 
                      colSpan={2} 
                    />
                  ) : (
                    <>
                      <ProfileDataItem 
                        label="Full Address" value={profileForm.address} editMode={editMode} 
                        onChange={e => setProfileForm({...profileForm, address: e.target.value})} icon={MapPin} colSpan={2} 
                      />
                      <ProfileDataItem 
                        label="City" value={profileForm.city} editMode={editMode} 
                        onChange={e => setProfileForm({...profileForm, city: e.target.value})} icon={MapPin} 
                      />
                      <ProfileDataItem 
                        label="State" value={profileForm.state} editMode={editMode} 
                        onChange={e => setProfileForm({...profileForm, state: e.target.value})} icon={MapPin} 
                      />
                      <ProfileDataItem 
                        label="PIN Code" value={profileForm.pinCode} editMode={editMode} 
                        onChange={e => setProfileForm({...profileForm, pinCode: e.target.value})} icon={MapPin} 
                      />
                    </>
                  )}
                </ProfileInfoPack>

                {/* MEDICAL BACKGROUND */}
                <ProfileInfoPack title="Medical Background" icon={Activity} color="#ef4444" columns={2}>
                  <ProfileDataItem 
                    label="Blood Group" value={profileForm.bloodGroup} type="select" options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} 
                    editMode={editMode} onChange={e => setProfileForm({...profileForm, bloodGroup: e.target.value})} icon={Droplet} 
                  />
                  <ProfileDataItem 
                    label="Known Allergies" value={profileForm.allergies} placeholder="e.g. Peanuts, Penicillin" 
                    editMode={editMode} onChange={e => setProfileForm({...profileForm, allergies: e.target.value})} icon={Activity} 
                  />
                  <ProfileDataItem 
                    label="Chronic Conditions" value={profileForm.conditions} placeholder="e.g. Diabetes, Hypertension" 
                    editMode={editMode} onChange={e => setProfileForm({...profileForm, conditions: e.target.value})} icon={Activity} 
                  />
                  <ProfileDataItem 
                    label="Current Medications" value={profileForm.medications} placeholder="List medications" type="textarea" 
                    editMode={editMode} onChange={e => setProfileForm({...profileForm, medications: e.target.value})} icon={Activity} 
                  />
                  <ProfileDataItem 
                    label="Past Medical History" value={profileForm.pastSurgeries} placeholder="Surgical history" type="textarea" 
                    editMode={editMode} onChange={e => setProfileForm({...profileForm, pastSurgeries: e.target.value})} icon={Activity} 
                  />
                </ProfileInfoPack>

                {/* EMERGENCY CONTACT & ACCOUNT */}
                <ProfileInfoPack title="Emergency & Account" icon={Shield} color="#7c3aed" columns={2}>
                  <ProfileDataItem 
                    label="Emergency Name" value={profileForm.emergencyName} editMode={editMode} 
                    onChange={e => setProfileForm({...profileForm, emergencyName: e.target.value})} icon={User} 
                  />
                  <ProfileDataItem 
                    label="Emergency Phone" value={profileForm.emergencyPhone} editMode={editMode} 
                    onChange={e => setProfileForm({...profileForm, emergencyPhone: e.target.value})} icon={Phone} 
                  />
                  <ProfileDataItem 
                    label="Preferred Language" value={profileForm.languagePreference} type="select" options={['English', 'Hindi', 'Spanish', 'French']} 
                    editMode={editMode} onChange={e => setProfileForm({...profileForm, languagePreference: e.target.value})} icon={MessageSquare} 
                  />
                </ProfileInfoPack>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Global Hidden Ticket for Export */}
      <div style={{ position: 'absolute', left: '-9999px', top: '0', pointerEvents: 'none', zIndex: -1 }}>
         {ticketData && <AppointmentCard appointment={ticketData} cardRef={cardRef} />}
      </div>
    </DashboardShell>
  );
};

export default UserDashboard;

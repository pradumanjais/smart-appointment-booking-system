import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Calendar, Clock, User, CheckCircle, Video, MessageSquare, ChevronRight, ChevronLeft, PlusSquare, Hospital, Phone, Activity, ShieldCheck, Mail, Camera, Edit3, Shield, Download } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import InputField from '../common/InputField';
import Skeleton from '../common/Skeleton';
import api from '../../api';
import './dashboard.css';
import html2canvas from 'html2canvas';
import AppointmentCard from './AppointmentCard';
import DashboardShell from './layout/DashboardShell';
import AppointmentListCard from './common/AppointmentListCard';
import StatCard from './common/StatCard';
import { useToast } from '../../context/ToastContext';

const UserDashboard = ({ handleLogout }) => {
  const { showToast } = useToast();
  const [currentTab, setCurrentTab] = useState('overview');
  const [myAppointments, setMyAppointments] = useState([]);
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    age: '',
    bloodGroup: '',
    avatar: '',
    state: '',
    address: ''
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
  const [downloading, setDownloading] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [capacityMap, setCapacityMap] = useState({});
  const [loadingCapacity, setLoadingCapacity] = useState(false);
  
  const [bookingData, setBookingData] = useState({
    hospitalId: '',
    hospitalState: '',
    appointmentMode: 'Physical',
    appointmentType: 'New',
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
      setStep(1);
      setSelectedProvider(null);
      setSelectedHospital(null);
      setCapacityMap({});
      setBookingData({
        hospitalId: '',
        hospitalState: '',
        appointmentMode: 'Physical',
        appointmentType: 'New',
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
          api.get('/hospitals'),
          api.get('/auth/me')
        ]);
        const appointments = apptRes.data.sort((a, b) => {
          const dateComparison = new Date(b.date) - new Date(a.date);
          if (dateComparison !== 0) return dateComparison;
          return b.startTime.localeCompare(a.startTime);
        });
        setMyAppointments(appointments);
        setHospitals(hospRes.data);
        setUserData(userRes.data);
        setProfileForm({
          name: userRes.data.name,
          phone: userRes.data.phone || '',
          age: userRes.data.age || '',
          bloodGroup: userRes.data.bloodGroup || '',
          avatar: userRes.data.avatar || '',
          state: userRes.data.state || '',
          address: userRes.data.address || ''
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
    if (step === 4 && bookingData.date && bookingData.hospitalId && bookingData.department) {
      const fetchCapacity = async () => {
        setLoadingCapacity(true);
        try {
          const { data } = await api.get('/bookings/capacity', {
            params: {
              date: bookingData.date,
              hospitalId: bookingData.hospitalId,
              department: bookingData.department
            }
          });
          if (data.capacityMap) {
            setCapacityMap(data.capacityMap);
          }
        } catch (err) {
          console.error('Failed to fetch real-time capacity', err);
        } finally {
          setLoadingCapacity(false);
        }
      };
      
      fetchCapacity();
    }
  }, [step, bookingData.date, bookingData.hospitalId, bookingData.department]);

  const handleNext = () => {
    if (step === 2 && bookingData.appointmentType === 'Follow-up' && bookingData.department) {
      setStep(4);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 4 && bookingData.appointmentType === 'Follow-up' && bookingData.department) {
      setStep(2);
    } else {
      setStep(step - 1);
    }
  };

  const handleBook = async () => {
    setLoading(true);
    try {
      await api.post('/bookings/book', {
        providerId: selectedProvider._id,
        ...bookingData,
        phone: bookingData.phone || userData?.phone
      });
      setBookingData(prev => ({ ...prev, success: true }));
      setStep(6);
      refreshAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestFollowUp = (appt) => {
    const hospId = appt.hospitalId?._id || appt.hospitalId;
    const fullHospital = hospitals.find(h => h._id === hospId) || appt.hospitalId;

    setBookingData({
      ...bookingData,
      hospitalId: hospId,
      hospitalState: fullHospital?.state || appt.hospitalState,
      appointmentType: 'Follow-up',
      department: appt.department,
      phone: userData?.phone || appt.phone || ''
    });
    setSelectedHospital(fullHospital);
    setSelectedProvider(appt.providerId);
    setCurrentTab('browse');
    setStep(3); // Start at Department Selection
    showToast(`Follow-up context loaded for ${appt.department}`, 'info');
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
      const { data } = await api.put('/auth/profile', profileForm);
      setUserData(data);
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
          <div className="overview-header" style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-1px' }}>
              Welcome back, <span className="text-gradient">{userData?.name?.split(' ')[0]}</span>!
            </h1>
            <p className="text-muted" style={{ fontSize: '1.2rem', fontWeight: 500 }}>Your personalized health identity and schedule insights.</p>
          </div>

          {/* Stat Grid */}
          <div className="stats-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            <StatCard 
              label="Successful Bookings" 
              value={myAppointments.filter(a => a.status === 'confirmed').length}
              icon={Calendar}
              variant="indigo"
            />
            <StatCard 
              label="Total Health Records" 
              value={myAppointments.length}
              icon={ShieldCheck}
              variant="amber"
            />
            <StatCard 
              label="Completed Visits" 
              value={myAppointments.filter(a => a.status === 'completed').length}
              icon={CheckCircle}
              variant="emerald"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
            {/* Action Hub */}
            <div className="action-hub glass-stat" style={{ padding: '32px', borderRadius: '28px', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '24px', letterSpacing: '-0.5px' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div 
                  className="action-card-modern" 
                  onClick={() => setCurrentTab('browse')}
                  style={{ padding: '24px', background: 'white', border: '1.5px solid #f1f5f9', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                >
                  <PlusSquare size={36} color="var(--primary)" style={{ marginBottom: '16px' }} />
                  <h4 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px', fontSize: '1.1rem' }}>Book Visit</h4>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>Schedule a new consultation with medical experts.</p>
                </div>
                <div 
                  className="action-card-modern" 
                  onClick={() => setCurrentTab('profile')}
                  style={{ padding: '24px', background: 'white', border: '1.5px solid #f1f5f9', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                >
                  <User size={36} color="#10b981" style={{ marginBottom: '16px' }} />
                  <h4 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px', fontSize: '1.1rem' }}>Health Passport</h4>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>Manage your verified medical identity files.</p>
                </div>
              </div>
            </div>

            {/* Upcoming Highlight */}
            <div className="upcoming-highlight glass-stat" style={{ padding: '32px', borderRadius: '28px', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '24px', letterSpacing: '-0.5px' }}>Next Up</h3>
              {(() => {
                const upcoming = [...myAppointments]
                  .filter(a => a.status === 'confirmed')
                  .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
                
                if (upcoming) {
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)', color: 'white', padding: '20px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 12px 24px -8px rgba(79, 70, 229, 0.4)' }}>
                        <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, marginBottom: '6px', opacity: 0.9 }}>
                          Reserved Slot
                        </span>
                        <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 900 }}>{upcoming.startTime}</span>
                        <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginTop: '4px', opacity: 0.8 }}>
                          {new Date(upcoming.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div style={{ padding: '4px 0' }}>
                        <p style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px', fontSize: '1.15rem' }}>Dr. {upcoming.providerId?.userId?.name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                          <Shield size={14} />
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{upcoming.department}</span>
                        </div>
                      </div>
                      <button 
                        className="btn btn-primary w-full" 
                        onClick={() => setCurrentTab('appointments')}
                        style={{ padding: '14px', borderRadius: '16px', fontSize: '0.95rem', fontWeight: 700 }}
                      >
                        Check-in Status
                      </button>
                    </div>
                  );
                } else {
                  return (
                    <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.6 }}>
                      <ShieldCheck size={56} style={{ margin: '0 auto 20px auto', color: '#10b981' }} />
                      <p style={{ fontWeight: 900, fontSize: '1.2rem', marginBottom: '8px', color: '#0f172a' }}>Clear Schedule</p>
                      <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>You have no pending medical visits.</p>
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
                          className={`hospital-btn ${bookingData.hospitalId === h._id ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedHospital(h);
                            setBookingData({...bookingData, hospitalId: h._id, department: ''});
                          }}
                        >
                          <Hospital size={16} /> {h.name}
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

                {bookingData.appointmentType === 'Follow-up' && recentlyVisited.length > 0 && (
                  <div className="recently-visited-section mt-8 animate-fade-in">
                    <label className="input-label mb-3 block" style={{ fontSize: '0.9rem' }}>Select a Visited Department to skip next step:</label>
                    <div className="suggestion-chips">
                      {recentlyVisited.map(item => (
                        <button 
                          key={item.name}
                          className={`suggestion-chip large ${bookingData.department === item.name ? 'active' : ''}`}
                          onClick={() => {
                            setBookingData({...bookingData, department: item.name});
                            setSelectedProvider(item.provider);
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Activity size={16} /> {item.name}
                            </span>
                            <span style={{ fontSize: '0.75rem', opacity: 0.8, marginLeft: '24px' }}>
                              Dr. {item.doctorName}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
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
                          <span>{p.specialization}</span>
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
                const seenDepts = new Set();
                const latestCompletedIds = [];
                myAppointments.forEach(appt => {
                  if (appt.status === 'completed' && !seenDepts.has(appt.department)) {
                    latestCompletedIds.push(appt._id);
                    seenDepts.add(appt.department);
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
        <div className="modern-profile-shell animate-slide-up">
          {/* LEFT COLUMN: Identity Sidebar */}
          <div className="profile-sidebar-card">
            <div className="profile-avatar-giant-box">
              <img 
                src={profileForm.avatar || userData.avatar || 'https://cdn-icons-png.flaticon.com/512/147/147144.png'} 
                alt={userData.name} 
                className="profile-avatar-giant" 
              />
              {editMode && (
                <label className="avatar-edit-glare">
                  <Camera size={20} />
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
            
            <h2>{userData.name}</h2>
            <p className="user-email">{userData.email}</p>

            <div className="profile-progress-widget">
              <div className="progress-label-row">
                <span>Identity Completion</span>
                <span>{Math.round((Object.values({
                  phone: userData.phone,
                  age: userData.age,
                  bloodGroup: userData.bloodGroup,
                  state: userData.state,
                  address: userData.address
                }).filter(Boolean).length / 5) * 100)}%</span>
              </div>
              <div className="progress-bar-rail">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${(Object.values({
                    phone: userData.phone,
                    age: userData.age,
                    bloodGroup: userData.bloodGroup,
                    state: userData.state,
                    address: userData.address
                  }).filter(Boolean).length / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="profile-summary-vitals">
              <div className="mini-vital-box">
                <label>Vitals</label>
                <span className="blood-group-tag">{userData.bloodGroup || 'N/A'}</span>
              </div>
              <div className="mini-vital-box">
                <label>Age</label>
                <span>{userData.age || '--'} Yrs</span>
              </div>
            </div>

            {!editMode ? (
              <Button 
                variant="primary" 
                className="w-full mt-8" 
                onClick={() => setEditMode(true)}
                style={{ borderRadius: '16px', padding: '14px' }}
              >
                <Edit3 size={18} className="mr-2" /> Edit Profile
              </Button>
            ) : (
              <p className="mt-8 text-xs font-bold text-muted uppercase tracking-widest">Editing Mode Active</p>
            )}
          </div>

          {/* RIGHT COLUMN: Information Content */}
          <form onSubmit={handleUpdateProfile} className="profile-main-content">
            {/* MEDICAL PACK */}
            <div className="info-pack-card animate-slide-up animate-delay-1">
              <div className="pack-header">
                <Activity size={22} />
                <h3>Medical Identity</h3>
              </div>
              
              <div className="pack-grid">
                <div className="modern-field-group">
                  <label><Calendar size={16} /> Biological Age</label>
                  {editMode ? (
                    <InputField 
                      type="number" 
                      value={profileForm.age} 
                      onChange={(e) => setProfileForm({...profileForm, age: e.target.value})} 
                      placeholder="e.g. 28"
                    />
                  ) : (
                    <div className="modern-value-display">{userData.age ? `${userData.age} Years Old` : 'Not Set'}</div>
                  )}
                </div>

                <div className="modern-field-group">
                  <label><Shield size={16} /> Blood Type</label>
                  {editMode ? (
                    <select 
                      className="input-field" 
                      style={{ height: '52px', borderRadius: '16px' }}
                      value={profileForm.bloodGroup} 
                      onChange={(e) => setProfileForm({...profileForm, bloodGroup: e.target.value})}
                    >
                      <option value="">Select Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="modern-value-display">
                      {userData.bloodGroup ? (
                        <span className="blood-type-ribbon">{userData.bloodGroup} Positive</span>
                      ) : (
                        'Not Specified'
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CONTACT PACK */}
            <div className="info-pack-card animate-slide-up animate-delay-2">
              <div className="pack-header">
                <Phone size={22} />
                <h3>Communication</h3>
              </div>
              
              <div className="pack-grid">
                <div className="modern-field-group">
                  <label><Phone size={16} /> Primary Phone</label>
                  {editMode ? (
                    <InputField 
                      value={profileForm.phone} 
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} 
                      placeholder="+91 XXXXX XXXXX"
                    />
                  ) : (
                    <div className="modern-value-display">{userData.phone || 'No phone linked'}</div>
                  )}
                </div>

                <div className="modern-field-group">
                  <label><Mail size={16} /> Recovery email</label>
                  <div className="modern-value-display" style={{ opacity: 0.6 }}>{userData.email}</div>
                </div>
              </div>
            </div>

            {/* ADDRESS PACK */}
            <div className="info-pack-card animate-slide-up animate-delay-3">
              <div className="pack-header">
                <MapPin size={22} />
                <h3>Residency</h3>
              </div>
              
              <div className="pack-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="modern-field-group">
                  <label>State & Region</label>
                  {editMode ? (
                    <select
                      className="input-field"
                      style={{ height: '52px', borderRadius: '16px' }}
                      value={profileForm.state}
                      onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                    >
                      <option value="">Select Region</option>
                      {[
                        "Andhra Pradesh", "Assam", "Bihar", "Gujarat", "Haryana", "Karnataka", 
                        "Kerala", "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan", 
                        "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal", "Delhi"
                      ].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <div className="modern-value-display">{userData.state || 'Region not set'}</div>
                  )}
                </div>

                <div className="modern-field-group">
                  <label>Street Address</label>
                  {editMode ? (
                    <InputField 
                      value={profileForm.address} 
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} 
                      placeholder="Detailed address..."
                    />
                  ) : (
                    <div className="modern-value-display">{userData.address || 'Address not registered'}</div>
                  )}
                </div>
              </div>

              {editMode && (
                <div className="profile-footer-actions">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => {
                      setEditMode(false);
                      setProfileForm({
                        name: userData.name,
                        phone: userData.phone || '',
                        age: userData.age || '',
                        bloodGroup: userData.bloodGroup || '',
                        avatar: userData.avatar || '',
                        state: userData.state || '',
                        address: userData.address || ''
                      });
                    }}
                    style={{ borderRadius: '12px' }}
                  >
                    Discard Changes
                  </Button>
                  <Button 
                    type="submit" 
                    loading={loading} 
                    variant="primary"
                    style={{ borderRadius: '12px', padding: '10px 24px' }}
                  >
                    Save Identity
                  </Button>
                </div>
              )}
            </div>
          </form>
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

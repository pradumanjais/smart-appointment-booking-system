import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Calendar, Clock, User, CheckCircle, Video, MessageSquare, ChevronRight, ChevronLeft, PlusSquare, Hospital, Phone, Activity, ShieldCheck, Mail, Camera, Edit3, Shield } from 'lucide-react';
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
import { useToast } from '../../context/ToastContext';

const UserDashboard = () => {
  const { showToast } = useToast();
  const [currentTab, setCurrentTab] = useState('browse');
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
  const [downloading, setDownloading] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  
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

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, hospRes, userRes] = await Promise.all([
          api.get('/bookings/my-appointments'),
          api.get('/hospitals'),
          api.get('/auth/me')
        ]);
        setMyAppointments(apptRes.data);
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
      setMyAppointments(data);
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

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

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
    >

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
              </div>
            )}

            {/* Step 3: Department */}
            {step === 3 && (
              <div className="step-view animate-fade-in">
                <h3 className="section-title">Select Department</h3>
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
                      onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    />
                  </div>

                  {/* Column 2: Time Slots */}
                  <div className="time-slots-col">
                    <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>Select Time Slot</label>
                    <div className="slots-grid">
                      {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map((time, i) => (
                        <button 
                          key={i} 
                          className={`slot-item ${bookingData.startTime === time ? 'selected' : ''}`}
                          onClick={() => setBookingData({...bookingData, startTime: time, endTime: `${parseInt(time) + 1}:00`})}
                        >
                          {time}
                        </button>
                      ))}
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
                  <div className="health-pass-card">
                    <div className="pass-header">
                      <div className="pass-live-indicator">
                        <span className="live-dot"></span>
                        {bookingData.success ? 'Confirmed / Active' : 'System Processing'}
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Visit Pass</h3>
                    </div>

                    <div className="pass-body">
                      <div className="pass-grid">
                        <div className="pass-item">
                          <label>Expert</label>
                          <span>Dr. {selectedProvider?.userId?.name}</span>
                        </div>
                        <div className="pass-item">
                          <label>Mode</label>
                          <span>{bookingData.appointmentMode}</span>
                        </div>
                        <div className="pass-item">
                          <label>Facility</label>
                          <span style={{ fontSize: '0.8rem' }}>{selectedHospital?.name}</span>
                        </div>
                        <div className="pass-item">
                          <label>Schedule</label>
                          <span>{new Date(bookingData.date).toLocaleDateString()}</span>
                        </div>
                        <div className="pass-item" style={{ gridColumn: 'span 2', marginTop: '12px' }}>
                          <label>Reserved Slots</label>
                          <span style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>{bookingData.startTime} - {bookingData.endTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pass-footer">
                      <div className="qr-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Activity size={40} color="var(--primary)" style={{ opacity: 0.3 }} />
                      </div>
                    </div>
                  </div>

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
              myAppointments.map(appt => (
                <AppointmentListCard 
                  key={appt._id} 
                  appointment={appt} 
                  role="user"
                  onAction={handleApptAction}
                  onDownload={handleDownloadTicket}
                />
              ))
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

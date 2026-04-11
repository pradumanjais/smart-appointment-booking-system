import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Calendar, Clock, User, CheckCircle, Video, MessageSquare, ChevronRight, ChevronLeft, PlusSquare, Hospital, Phone } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import InputField from '../common/InputField';
import api from '../../api';
import './dashboard.css';
import html2canvas from 'html2canvas';
import AppointmentCard from './AppointmentCard';

const UserDashboard = () => {
  const [currentTab, setCurrentTab] = useState('browse'); // 'browse', 'appointments', or 'profile'
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

  const handleDownloadTicket = async (appt) => {
    setTicketData(appt);
    setDownloading(true);
    try {
      // Small timeout to ensure the hidden component re-renders with new data
      await new Promise(r => setTimeout(r, 300));
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
      link.download = `appointment-letter-${appt._id?.toString().slice(-6)}.png`;
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
      alert('Could not generate ticket image. Please try again.');
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
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
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
    <div className="dashboard-view animate-fade-in">
      <div className="tabs" style={{ display: 'flex', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <button 
          className={`tab-btn ${currentTab === 'browse' ? 'active' : ''}`}
          onClick={() => setCurrentTab('browse')}
          style={{ background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: 600, padding: '8px 16px', cursor: 'pointer', borderBottom: currentTab === 'browse' ? '2px solid var(--primary)' : 'none', color: currentTab === 'browse' ? 'var(--primary)' : 'var(--text-muted)' }}
        >
          Book Appointment
        </button>
        <button 
          className={`tab-btn ${currentTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setCurrentTab('appointments')}
          style={{ background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: 600, padding: '8px 16px', cursor: 'pointer', borderBottom: currentTab === 'appointments' ? '2px solid var(--primary)' : 'none', color: currentTab === 'appointments' ? 'var(--primary)' : 'var(--text-muted)' }}
        >
          My Appointments
        </button>
        <button 
          className={`tab-btn ${currentTab === 'profile' ? 'active' : ''}`}
          onClick={() => setCurrentTab('profile')}
          style={{ background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: 600, padding: '8px 16px', cursor: 'pointer', borderBottom: currentTab === 'profile' ? '2px solid var(--primary)' : 'none', color: currentTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)' }}
        >
          My Profile
        </button>
      </div>

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
                  <p className="mt-4">Loading doctors...</p>
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

            {/* Step 6: Confirmation SMS */}
            {step === 6 && (
              <div className="step-view text-center animate-fade-in">
                <MessageSquare size={48} className="primary-icon mb-4" />
                <h3 className="section-title">Final Confirmation</h3>
                <div className="mt-4 p-6 glass border-primary rounded-16">
                  <p className="text-muted">An appointment confirmation will be sent to:</p>
                  <h2 style={{ fontSize: '1.8rem', margin: '12px 0', color: 'var(--primary)' }}>
                    {bookingData.phone || userData?.phone || 'Phone number not set'}
                  </h2>
                  <p className="helper-text">You can update your number in the Profile tab if it's incorrect.</p>
                </div>
                {!bookingData.success && selectedProvider && (
                  <div className="mt-6">
                    <p className="text-muted mb-4">Click below to finalize your booking with {selectedProvider?.userId?.name || 'your selected expert'}.</p>
                  </div>
                )}
                {bookingData.success && (
                  <div className="success-state animate-bounce-in mt-4">
                    <CheckCircle size={64} className="success-icon mb-4" style={{ color: 'var(--success)' }} />
                    <h2 style={{ color: 'var(--success)', margin: '16px 0' }}>Booking Successful!</h2>
                    <p className="text-muted mb-6">Your appointment is confirmed. A mock SMS has been sent to {bookingData.phone}.</p>
                    
                    <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                      <Button onClick={resetWizard} className="w-full" variant="secondary">View My Appointments</Button>
                      {bookingData.success && (myAppointments[0]?.status === 'confirmed' || myAppointments[0]?.status === 'completed') && (
                        <Button 
                          onClick={() => handleDownloadTicket(myAppointments[0])} 
                          className="w-full"
                          loading={downloading}
                        >
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                )}
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
        <div className="appointments-list" style={{ display: 'grid', gap: '16px' }}>
          <div className="section-header">
             <h2>My Appointments</h2>
             <p className="text-muted">Manage your upcoming and past medical visits.</p>
          </div>
          {myAppointments.length > 0 ? (
            myAppointments.map((appointment) => (
              <Card key={appointment._id} className="appointment-card" hoverEffect={false}>
                <div className="appointment-user">
                  <User size={20} className="primary-icon" />
                  <div>
                    <h3>{appointment.providerId?.userId?.name || 'Doctor'}</h3>
                    <p className="detail-item"><Clock size={14} /> {appointment.startTime} - {appointment.endTime}</p>
                    <p className="detail-item"><Calendar size={14} /> {new Date(appointment.date).toLocaleDateString()}</p>
                    {appointment.hospitalId && (
                      <p className="detail-item" style={{ marginTop: '4px', fontSize: '0.85rem' }}>
                        <MapPin size={12} /> {appointment.hospitalState} - {appointment.department}
                      </p>
                    )}
                  </div>
                </div>
                <div className="appointment-status">
                  <span className={`status-badge status-${appointment.status}`}>
                    {appointment.status}
                  </span>
                </div>
                {(appointment.status === 'confirmed' || appointment.status === 'completed') && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDownloadTicket(appointment)}
                    style={{ marginTop: '12px' }}
                  >
                    Download
                  </Button>
                )}
              </Card>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '16px' }}>
              <Calendar size={48} className="primary-icon" style={{ opacity: 0.5, marginBottom: '16px' }} />
              <h3>No Appointments Yet</h3>
              <p style={{ color: 'var(--text-muted)' }}>You haven't booked any appointments.</p>
              <Button style={{ marginTop: '16px' }} onClick={() => setCurrentTab('browse')}>Start Booking</Button>
            </div>
          )}
        </div>
      )}

      {currentTab === 'profile' && userData && (
        <div className="profile-section animate-fade-in">
          <Card className="profile-card glass" hoverEffect={false}>
            <div className="profile-header-meta">
              <div className="profile-avatar-wrapper">
                <img src={profileForm.avatar || userData.avatar || 'https://cdn-icons-png.flaticon.com/512/147/147144.png'} alt={userData.name} className="profile-avatar-large" />
                {editMode && (
                  <div className="avatar-edit-overlay">
                    <label className="avatar-upload-btn">
                      Change Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            // Check file size (limit to ~2MB to prevent MongoDB document size issues)
                            if (file.size > 2 * 1024 * 1024) {
                              alert('Image must be less than 2MB');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfileForm({...profileForm, avatar: reader.result});
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
              <div className="profile-title">
                <h2>{userData.name}</h2>
                <p className="role-badge">{userData.role.toUpperCase()}</p>
              </div>
              {!editMode && (
                <Button variant="outline" className="ml-auto" onClick={() => setEditMode(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

            <form onSubmit={handleUpdateProfile} className="profile-details-grid mt-6">
              <div className="profile-info-group">
                <label><User size={16} /> Full Name</label>
                {editMode ? (
                  <InputField value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} />
                ) : (
                  <p>{userData.name}</p>
                )}
              </div>

              <div className="profile-info-group">
                <label>Email Address</label>
                <p>{userData.email}</p>
                <span className="helper-text">Email cannot be changed</span>
              </div>

              <div className="profile-info-group">
                <label><Phone size={16} /> Phone Number</label>
                {editMode ? (
                  <InputField value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} />
                ) : (
                  <p>{userData.phone || 'Not set'}</p>
                )}
              </div>

              <div className="profile-info-group">
                <label><Calendar size={16} /> Age</label>
                {editMode ? (
                  <InputField type="number" value={profileForm.age} onChange={(e) => setProfileForm({...profileForm, age: e.target.value})} />
                ) : (
                  <p>{userData.age || 'Not set'}</p>
                )}
              </div>

              <div className="profile-info-group">
                <label><Star size={16} /> Blood Group</label>
                {editMode ? (
                  <select 
                    className="input-field" 
                    value={profileForm.bloodGroup} 
                    onChange={(e) => setProfileForm({...profileForm, bloodGroup: e.target.value})}
                  >
                    <option value="">Select...</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                ) : (
                  <p className="blood-group-tag">{userData.bloodGroup || 'Not set'}</p>
                )}
              </div>

              <div className="profile-info-group">
                <label><MapPin size={16} /> Home State</label>
                {editMode ? (
                  <select
                    className="input-field"
                    value={profileForm.state}
                    onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                    style={{ paddingLeft: '12px' }}
                  >
                    <option value="">Select State</option>
                    {[
                      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
                      "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
                      "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
                      "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", 
                      "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
                      "Uttarakhand", "West Bengal",
                      "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
                      "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
                    ].sort().map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : <p>{userData.state || 'Not set'}</p>}
              </div>

              <div className="profile-info-group full-width" style={{ gridColumn: '1 / -1' }}>
                <label><MapPin size={16} /> Full Address</label>
                {editMode ? (
                  <InputField 
                    value={profileForm.address} 
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} 
                    placeholder="Street, Building, Area..."
                  />
                ) : <p>{userData.address || 'Not set'}</p>}
              </div>

              {editMode && (
                <div className="profile-actions-footer mt-6">
                  <Button type="button" variant="secondary" onClick={() => {
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
                  }}>Cancel</Button>
                  <Button type="submit" loading={loading}>Save Changes</Button>
                </div>
              )}
            </form>
          </Card>
        </div>
      )}
      {/* Global Hidden Ticket for Export */}
      <div style={{ position: 'absolute', left: '-9999px', top: '0', pointerEvents: 'none', zIndex: -1 }}>
         {ticketData && <AppointmentCard appointment={ticketData} cardRef={cardRef} />}
      </div>
    </div>
  );
};

export default UserDashboard;

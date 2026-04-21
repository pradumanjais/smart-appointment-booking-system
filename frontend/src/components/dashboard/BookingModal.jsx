import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Hospital, CheckCircle, Video, User, MessageSquare, MapPin, ChevronRight, ChevronLeft, Star } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import InputField from '../common/InputField';
import api from '../../api';

const BookingModal = ({ provider: initialProvider, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(initialProvider || null);
  const [previousVisits, setPreviousVisits] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  
  // Form State
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
  });

  const [selectedHospital, setSelectedHospital] = useState(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const { data } = await api.get('/hospitals');
        setHospitals(data);
      } catch (err) {
        console.error('Error fetching hospitals');
      }
    };
    fetchHospitals();
  }, []);

  // Fetch previous visits when Follow-up is selected
  useEffect(() => {
    let isMounted = true;
    if (bookingData.appointmentType === 'Follow-up') {
      const fetchHistory = async () => {
        setLoadingVisits(true);
        try {
          const { data } = await api.get('/bookings/my-appointments');
          if (!isMounted) return;
          
          // Process to get unique doctor-clinic combinations
          const uniqueVisits = [];
          const seen = new Set();
          
          if (Array.isArray(data)) {
            data.forEach(appt => {
              const provider = appt.providerId;
              if (!provider) return;

              const providerId = provider._id || provider;
              const hospitalId = appt.hospitalId?._id || appt.hospitalId;
              const clinicName = appt.clinicName || appt.hospitalId?.name;
              
              const key = `${providerId}-${hospitalId || clinicName}`;
              
              if (providerId && (hospitalId || clinicName) && !seen.has(key)) {
                seen.add(key);
                uniqueVisits.push({
                  provider: provider,
                  hospital: appt.hospitalId,
                  clinicName: appt.clinicName,
                  department: appt.department,
                  lastDate: appt.date
                });
              }
            });
          }
          
          setPreviousVisits(uniqueVisits);
        } catch (err) {
          console.error('Error fetching appointment history:', err);
        } finally {
          if (isMounted) setLoadingVisits(false);
        }
      };
      fetchHistory();
    }
    return () => { isMounted = false; };
  }, [bookingData.appointmentType]);

  // Fetch providers when hospital and department are selected
  useEffect(() => {
    if (step === 5 && !initialProvider) {
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
  }, [step, bookingData.hospitalId, bookingData.department, initialProvider]);

  const handleNext = () => {
    // If provider was passed as prop, skip Step 5 (Doctor selection)
    if (step === 4 && initialProvider) {
      setStep(6);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 6 && initialProvider) {
      setStep(4);
    } else {
      setStep(step - 1);
    }
  };

  const handleBook = async () => {
    setLoading(true);
    try {
      await api.post('/bookings/book', {
        providerId: selectedProvider._id,
        ...bookingData
      });
      setStep(7);
      if (onSuccess) onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const states = [...new Set(hospitals.map(h => h.state))];

  return (
    <div className="modal-overlay glass">
      <Card className="modal-content booking-wizard animate-fade-in" hoverEffect={false}>
        <div className="modal-header">
          <div className="wizard-progress">
            <span className="step-indicator">Step {step} of 7</span>
            <h3>{step === 7 ? 'Success' : selectedProvider ? `Book with ${selectedProvider.userId?.name}` : 'Book Appointment'}</h3>
          </div>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>

        <div className="step-container">
          {/* Step 1: Select State/Hospital */}
          {step === 1 && (
            <div className="step-view">
              <label className="input-label">Select Hospital State</label>
              <select 
                className="input-field mb-4"
                value={bookingData.hospitalState}
                onChange={(e) => setBookingData({...bookingData, hospitalState: e.target.value})}
              >
                <option value="">Choose State...</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <label className="input-label">Select Hospital</label>
              <select 
                className="input-field"
                disabled={!bookingData.hospitalState}
                value={bookingData.hospitalId}
                onChange={(e) => {
                  const h = hospitals.find(h => h._id === e.target.value);
                  setSelectedHospital(h);
                  setBookingData({...bookingData, hospitalId: e.target.value, department: ''});
                }}
              >
                <option value="">Choose Hospital...</option>
                {hospitals.filter(h => h.state === bookingData.hospitalState).map(h => (
                  <option key={h._id} value={h._id}>{h.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Step 2: Mode */}
          {step === 2 && (
            <div className="step-view">
              <p className="step-instruction">Select Mode of Appointment</p>
              <div className="toggle-group" style={{ gridTemplateColumns: '1fr' }}>
                <button 
                  className={`toggle-btn active`}
                  onClick={() => setBookingData({...bookingData, appointmentMode: 'Physical'})}
                >
                  <MapPin size={20} /> Physical Visit
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Type */}
          {step === 3 && (
            <div className="step-view">
              <p className="step-instruction">Select Appointment Type</p>
              <div className="toggle-group">
                <button 
                  className={`toggle-btn ${bookingData.appointmentType === 'New' ? 'active' : ''}`}
                  onClick={() => setBookingData({...bookingData, appointmentType: 'New'})}
                >
                  New Case
                </button>
                <button 
                  className={`toggle-btn ${bookingData.appointmentType === 'Follow-up' ? 'active' : ''}`}
                  onClick={() => setBookingData({...bookingData, appointmentType: 'Follow-up'})}
                >
                  Follow-up
                </button>
              </div>

              {bookingData.appointmentType === 'Follow-up' && (
                <div className="previous-visits-section animate-fade-in" style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={16} className="text-primary" /> Quick Select Previous Visits
                  </h4>
                  
                  {loadingVisits ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                      <div className="loading-spinner-small" style={{ marginBottom: '8px' }}></div>
                      Fetching your medical history...
                    </div>
                  ) : previousVisits.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                      {previousVisits.map((visit, index) => (
                        <div 
                          key={index}
                          className="previous-visit-card"
                          onClick={() => {
                            setSelectedProvider(visit.provider);
                            setSelectedHospital(visit.hospital);
                            setBookingData({
                              ...bookingData,
                              hospitalId: visit.hospital?._id || visit.hospital || (visit.clinicName ? `clinic:${visit.clinicName}` : ''),
                              hospitalState: visit.hospital?.state || visit.provider?.state || '',
                              department: visit.department,
                              appointmentType: 'Follow-up'
                            });
                            setStep(6);
                          }}
                          style={{ 
                            background: 'white', 
                            padding: '14px', 
                            borderRadius: '16px', 
                            border: '1.5px solid #f1f5f9',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <img 
                            src={visit.provider?.userId?.avatar || 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'} 
                            alt="Doctor" 
                            style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#f1f5f9' }}
                          />
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>Dr. {visit.provider?.userId?.name || 'Expert'}</p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                              {visit.hospital?.name || visit.clinicName || 'Clinic'} • {visit.department}
                            </p>
                          </div>
                          <ChevronRight size={18} color="#94a3b8" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, background: 'white', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                      No visit history found. Please select "New Case" or search for a doctor manually.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Department */}
          {step === 4 && (
            <div className="step-view">
              <label className="input-label">Select Department</label>
              <select 
                className="input-field"
                value={bookingData.department}
                onChange={(e) => setBookingData({...bookingData, department: e.target.value})}
              >
                <option value="">Choose Department...</option>
                {selectedHospital?.departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}

          {/* Step 5: Select Doctor (Dynamic) */}
          {step === 5 && (
            <div className="step-view">
              <p className="step-instruction">Select Your Expert</p>
              {loading ? (
                <p>Loading doctors...</p>
              ) : availableProviders.length > 0 ? (
                <div className="doctor-select-grid">
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
                <p>No doctors found in this department.</p>
              )}
            </div>
          )}

          {/* Step 6: Date & Slot */}
          {step === 6 && (
            <div className="step-view">
              <p className="step-instruction">Pick Date & Time</p>
              <InputField 
                type="date" 
                label="Appointment Date" 
                value={bookingData.date}
                onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
              />
              <div className="slots-grid mt-4">
                {selectedProvider?.availability[0]?.slots.map((slot, i) => (
                  <button 
                    key={i} 
                    className={`slot-item ${bookingData.startTime === slot.startTime ? 'selected' : ''}`}
                    onClick={() => setBookingData({...bookingData, startTime: slot.startTime, endTime: slot.endTime})}
                  >
                    {slot.startTime}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Confirmation & SMS Simulation */}
          {step === 7 && (
            <div className="step-view text-center animate-bounce-in">
              <div className="sms-simulation">
                <MessageSquare size={64} className="success-icon mb-4" />
                <div className="sms-bubble">
                  <p>Confirmation: Your appointment with <strong>{selectedProvider?.userId?.name}</strong> at <strong>{selectedHospital?.name || 'the clinic'}</strong> is confirmed for <strong>{bookingData.date}</strong> at <strong>{bookingData.startTime}</strong>.</p>
                </div>
              </div>
              <h2 className="success-text mt-4">Booking Successful!</h2>
              <p>A confirmation SMS has been sent.</p>
              <Button className="w-full mt-6" onClick={onClose}>Finish</Button>
            </div>
          )}
        </div>

        {step < 7 && (
          <div className="modal-actions wizard-footer">
            {step > 1 && <Button variant="secondary" onClick={handleBack}><ChevronLeft size={20} /> Back</Button>}
            {step < 6 ? (
              <Button 
                onClick={handleNext} 
                className="ml-auto" 
                disabled={
                  (step === 1 && !bookingData.hospitalId) ||
                  (step === 4 && !bookingData.department) ||
                  (step === 5 && !selectedProvider)
                }
              >
                Next <ChevronRight size={20} />
              </Button>
            ) : (
              <Button onClick={handleBook} loading={loading} className="ml-auto" disabled={!bookingData.startTime}>
                Confirm Booking
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default BookingModal;

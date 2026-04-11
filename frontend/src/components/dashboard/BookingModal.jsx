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

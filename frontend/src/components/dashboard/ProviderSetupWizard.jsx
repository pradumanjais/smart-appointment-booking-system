import React, { useState, useEffect } from 'react';
import { 
  User, ShieldCheck, Briefcase, Award, 
  MapPin, Clock, DollarSign, Activity, 
  ChevronRight, ChevronLeft, CheckCircle2,
  Phone, Mail, Globe, Lock, Shield, XCircle
} from 'lucide-react';
import InputField from '../common/InputField';
import Button from '../common/Button';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

const ProviderSetupWizard = ({ user, existingProfile, onComplete, startStep = 1, isSingleStep = false, onlyField = null }) => {
  const [step, setStep] = useState(startStep);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ].sort();

  const [formData, setFormData] = useState({
    // Step 1: Personal & Practice
    name: user?.name || existingProfile?.userId?.name || '',
    fathersName: existingProfile?.fathersName || '',
    mothersName: existingProfile?.mothersName || '',
    phone: user?.phone || existingProfile?.userId?.phone || '',
    email: user?.email || existingProfile?.userId?.email || '',
    address: user?.address || '', // Residential
    state: user?.state || existingProfile?.location || '',
    pinCode: user?.pinCode || '',
    clinicName: existingProfile?.clinicName || '',
    clinicAddress: existingProfile?.clinicAddress || '',
    clinicState: existingProfile?.clinicState || '',
    clinicPinCode: existingProfile?.clinicPinCode || '',
    
    // Step 2: Medical Credentials
    registrationNumber: existingProfile?.registrationNumber || '',
    medicalCouncil: existingProfile?.medicalCouncil || '',
    specialization: existingProfile?.specialization || '',
    degrees: existingProfile?.degrees?.join(', ') || '',
    medicalCollege: existingProfile?.medicalCollege || '',
    yearOfDegreeAchieved: existingProfile?.yearOfDegreeAchieved || '',
    
    // Step 3: Experience
    bio: existingProfile?.bio || '',
    experience: existingProfile?.experience || '',
    awards: existingProfile?.awards?.join(', ') || '',

    // Step 5: Availability
    slotDuration: existingProfile?.slotDuration || 15,
    throughputCapacity: existingProfile?.throughputCapacity || existingProfile?.maxPatientsPerSlot || 1,
    availability: existingProfile?.availability || [
      { day: 'Monday', slots: [{ startTime: '09:00', endTime: '17:00' }] },
      { day: 'Tuesday', slots: [{ startTime: '09:00', endTime: '17:00' }] },
      { day: 'Wednesday', slots: [{ startTime: '09:00', endTime: '17:00' }] },
      { day: 'Thursday', slots: [{ startTime: '09:00', endTime: '17:00' }] },
      { day: 'Friday', slots: [{ startTime: '09:00', endTime: '17:00' }] },
    ]
  });

  const handleAvailabilityChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.map(a => 
        a.day === day 
          ? { ...a, slots: [{ ...a.slots[0], [field]: value }] }
          : a
      )
    }));
  };

  const toggleDay = (day) => {
    setFormData(prev => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = () => {
    if (step === 1) {
      return formData.name && formData.fathersName && formData.mothersName && 
             formData.phone && formData.email && formData.address && 
             formData.state && formData.pinCode;
    }
    if (step === 2) {
      return formData.clinicName && formData.clinicAddress && formData.clinicState && formData.clinicPinCode;
    }
    if (step === 3) {
      return formData.registrationNumber && formData.medicalCouncil && 
             formData.specialization && formData.degrees && 
             formData.medicalCollege && formData.yearOfDegreeAchieved;
    }
    if (step === 4) {
      return formData.bio && formData.experience;
    }
    if (step === 5) {
      return formData.slotDuration && formData.availability.length > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1);
    else showToast('Please fill all mandatory fields (marked with *)', 'warning');
  };

  const handleBack = () => setStep(s => s - 1);

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        fathersName: formData.fathersName,
        mothersName: formData.mothersName,
        registrationNumber: formData.registrationNumber,
        medicalCouncil: formData.medicalCouncil,
        specialization: formData.specialization,
        degrees: formData.degrees.split(',').map(s => s.trim()).filter(Boolean),
        medicalCollege: formData.medicalCollege,
        yearOfDegreeAchieved: Number(formData.yearOfDegreeAchieved),
        experience: Number(formData.experience),
        bio: formData.bio,
        location: formData.state,
        clinicName: formData.clinicName,
        clinicAddress: formData.clinicAddress,
        clinicState: formData.clinicState,
        clinicPinCode: formData.clinicPinCode,
        awards: formData.awards.split(',').map(s => s.trim()).filter(Boolean),
        slotDuration: Number(formData.slotDuration),
        throughputCapacity: Number(formData.throughputCapacity),
        availability: formData.availability,
        visibility: 'public'
      };

      // 1. Create/Update Provider profile (Stores practice AND personal identity)
      const { data } = await api.post('/providers/profile', {
        ...payload,
        fathersName: formData.fathersName,
        mothersName: formData.mothersName,
        address: formData.address, // Residential
        state: formData.state,     // Residential
        pinCode: formData.pinCode,  // Residential
        throughputCapacity: Number(formData.throughputCapacity)
      });
      
      // 2. Update User core details only (keeping account info in User schema)
      await api.put('/auth/profile', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email
      });
      
      showToast('Practice profile is now live!', 'success');
      onComplete(data);
    } catch (err) {
      console.error('Profile update error:', err.response?.data);
      const data = err.response?.data;
      let errorMsg = 'Update failed';
      if (data?.errors && data.errors.length > 0) {
        errorMsg = data.errors.map(e => e.msg).join(', ');
      } else if (data?.message) {
        errorMsg = data.message;
      }
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (!validateStep()) {
      showToast('Please fill all mandatory fields (marked with *)', 'warning');
      return;
    }

    if (step < 5) {
      setStep(s => s + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const specializations = [
    'General Medicine', 'General Physician', 'Cardiology', 'Neurology', 
    'Dermatology', 'Pediatrics', 'Orthopedics', 'Psychiatry',
    'Gynecology', 'ENT Specialist', 'Ophthalmology', 'Gastroenterology',
    'Urology', 'Oncology', 'Endocrinology', 'Pulmonology',
    'Nephrology', 'Rheumatology', 'Homeopathy', 'Ayurveda',
    'Dentistry', 'Dietician', 'Nutritionist', 'Physiotherapy',
    'Radiology', 'Pathology'
  ].sort();

  return (
    <div className="provider-setup-wizard glass-stat animate-fade-in" style={{
      background: 'white',
      padding: '40px',
      borderRadius: '32px',
      maxWidth: '800px',
      margin: '0 auto',
      boxShadow: '0 40px 100px -20px rgba(0,0,0,0.1)'
    }}>
      <div className="wizard-stepper-header" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>
              {onlyField === 'slotDuration' ? 'Edit Visit Duration' : (isSingleStep ? 'Update Schedule & Capacity' : 'Expert Onboarding')}
            </h2>
            {!isSingleStep && (
              <span className="badge-premium" style={{ background: 'var(--primary-light)', padding: '6px 16px', borderRadius: '12px', fontSize: '0.8rem' }}>
                Phase {step} of 5
              </span>
            )}
        </div>
        {!isSingleStep && (
          <div className="wizard-progress-bar" style={{ height: '6px', background: '#f1f5f9', borderRadius: '10px' }}>
            <div style={{ width: `${(step/5)*100}%`, height: '100%', background: 'linear-gradient(to right, var(--primary), #4f46e5)', borderRadius: '10px', transition: 'all 0.5s ease' }}></div>
          </div>
        )}
      </div>

      <form onSubmit={onFormSubmit}>
        
        {/* STEP 1: PERSONAL */}
        {step === 1 && (
          <div className="wizard-step animate-fade-in">
            <div className="step-title-area" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User size={20} color="var(--primary)" /> Personal Identity
                </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
                <InputField label="Father's Name" name="fathersName" value={formData.fathersName} onChange={handleChange} required />
                <InputField label="Mother's Name" name="mothersName" value={formData.mothersName} onChange={handleChange} required />
                <InputField label="Mobile Number" name="phone" value={formData.phone} onChange={handleChange} required />
                
                <div style={{ gridColumn: 'span 2' }}>
                  <InputField label="Residential Address" name="address" value={formData.address} onChange={handleChange} required />
                </div>

                <div className="modern-field-group">
                    <label className="input-label">State <span style={{ color: '#ef4444' }}>*</span></label>
                    <select name="state" className="input-field" value={formData.state} onChange={handleChange} required>
                        <option value="">Select State</option>
                        {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                
                <InputField label="PIN Code" name="pinCode" placeholder="6-digit PIN" value={formData.pinCode} onChange={handleChange} required />
            </div>
          </div>
        )}

        {/* STEP 2: WORKING LOCATION */}
        {step === 2 && (
          <div className="wizard-step animate-fade-in">
            <div className="step-title-area" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={20} color="var(--primary)" /> Working Location
                </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                    <InputField label="Hospital or Clinic Name" name="clinicName" placeholder="e.g. City Life Hospital" value={formData.clinicName} onChange={handleChange} required />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                    <InputField label="Full Address (Where patients will visit)" name="clinicAddress" value={formData.clinicAddress} onChange={handleChange} required />
                </div>
                <div className="modern-field-group">
                    <label className="input-label">State <span style={{ color: '#ef4444' }}>*</span></label>
                    <select name="clinicState" className="input-field" value={formData.clinicState} onChange={handleChange} required>
                        <option value="">Select State</option>
                        {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <InputField label="PIN Code" name="clinicPinCode" placeholder="6-digit PIN" value={formData.clinicPinCode} onChange={handleChange} required />
            </div>
          </div>
        )}

        {/* STEP 3: MEDICAL */}
        {step === 3 && (
          <div className="wizard-step animate-fade-in">
            <div className="step-title-area" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={20} color="#10b981" /> Medical Credentials
                </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <InputField label="Medical Registration No." name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} required />
                <InputField label="Medical Council Name" name="medicalCouncil" placeholder="e.g. Karnataka Medical Council" value={formData.medicalCouncil} onChange={handleChange} required />
                
                <div className="modern-field-group">
                    <label className="input-label">Core Specialization <span style={{ color: '#ef4444' }}>*</span></label>
                    <select name="specialization" className="input-field" value={formData.specialization} onChange={handleChange} required>
                        <option value="">Select Specialty</option>
                        {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <InputField label="Professional Degree" name="degrees" placeholder="e.g. MBBS, MD" value={formData.degrees} onChange={handleChange} required />
                <InputField label="College Name" name="medicalCollege" value={formData.medicalCollege} onChange={handleChange} required />
                <InputField label="Year of Degree Achieved" name="yearOfDegreeAchieved" type="number" placeholder="e.g. 2015" value={formData.yearOfDegreeAchieved} onChange={handleChange} required />
            </div>
          </div>
        )}

        {/* STEP 5: AVAILABILITY */}
        {step === 5 && (
          <div className="wizard-step animate-fade-in">
            <div className="step-title-area" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={20} color="var(--primary)" /> Schedule & Session Settings
                </h3>
            </div>
            
            <div className="capacity-bar-compact" style={{ marginBottom: '24px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'var(--primary-light)', padding: '8px', borderRadius: '10px' }}>
                    <Zap size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Throughput Capacity</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Patients allowed per time slot.</p>
                  </div>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="number" 
                    name="throughputCapacity" 
                    min="1"
                    value={formData.throughputCapacity} 
                    onChange={handleChange}
                    style={{ width: '60px', padding: '8px', borderRadius: '10px', border: '1.5px solid var(--primary)', textAlign: 'center', fontWeight: 900, color: 'var(--primary)' }}
                  />
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>SLOTS</span>
               </div>
            </div>

            {onlyField !== 'slotDuration' && (
              <div className="availability-list-seamless">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                  const dayObj = formData.availability.find(a => a.day === day);
                  return (
                    <div key={day} className={`availability-row-seamless ${dayObj ? 'active' : ''}`} style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span className="day-label-premium" style={{ width: '100px', fontSize: '0.9rem' }}>{day}</span>
                        <button 
                          type="button" 
                          onClick={() => toggleDay(day)}
                          className={`status-toggle-seamless ${dayObj ? 'status-toggle-on' : 'status-toggle-off'}`}
                        >
                          {dayObj ? 'ONLINE' : 'OFF'}
                        </button>
                      </div>

                      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {dayObj ? (
                          <div className="time-range-seamless" style={{ padding: '4px 12px' }}>
                            <input 
                              type="time" 
                              value={dayObj.slots[0]?.startTime || '09:00'} 
                              onChange={(e) => handleAvailabilityChange(day, 'startTime', e.target.value)}
                              className="time-input-premium"
                            />
                            <TrendingUp size={12} style={{ color: '#cbd5e1', transform: 'rotate(90deg)' }} />
                            <input 
                              type="time" 
                              value={dayObj.slots[0]?.endTime || '17:00'} 
                              onChange={(e) => handleAvailabilityChange(day, 'endTime', e.target.value)}
                              className="time-input-premium"
                            />
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>NOT SCHEDULED</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            <div style={{ marginTop: '24px', padding: '20px', background: '#f8fafc', borderRadius: '16px' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeigt: '1.5' }}>
                <strong>Note:</strong> By saving, you confirm that all information provided is accurate and you consent to our expert verification process.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: EXPERIENCE */}
        {step === 4 && (
          <div className="wizard-step animate-fade-in">
            <div className="step-title-area" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Award size={20} color="#f59e0b" /> Expert Experience
                </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <InputField label="Years of Experience" name="experience" type="number" value={formData.experience} onChange={handleChange} required />
                <InputField label="Awards & Achievements" name="awards" placeholder="Award 1, Award 2" value={formData.awards} onChange={handleChange} />
                
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Professional Bio <span style={{ color: '#ef4444' }}>*</span></label>
                  <textarea 
                      name="bio" 
                      className="input-field" 
                      rows="4" 
                      style={{ height: 'auto', padding: '12px' }}
                      value={formData.bio}
                      onChange={handleChange}
                      required
                      placeholder="Describe your clinical expertise..."
                  />
                </div>
            </div>
            
            <div style={{ marginTop: '24px', padding: '20px', background: '#f8fafc', borderRadius: '16px' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeigt: '1.5' }}>
                <strong>Note:</strong> By saving, you confirm that all information provided is accurate and you consent to our expert verification process.
              </p>
            </div>
          </div>
        )}

        <div className="wizard-navigation" style={{ marginTop: '32px', display: 'flex', gap: '15px' }}>
          {step > 1 && !isSingleStep && (
            <Button type="button" variant="secondary" onClick={handleBack} style={{ flex: 1, borderRadius: '14px' }} disabled={loading}>
              <ChevronLeft size={18} /> Back
            </Button>
          )}
          {step < 5 ? (
            <Button type="submit" variant="primary" style={{ flex: 1, borderRadius: '14px' }}>
              Continue <ChevronRight size={18} />
            </Button>
          ) : (
            <Button type="submit" variant="primary" loading={loading} style={{ flex: 2, borderRadius: '14px' }}>
              Save Changes <CheckCircle2 size={18} />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProviderSetupWizard;

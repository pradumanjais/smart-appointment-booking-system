import React, { useState } from 'react';
import { 
  User, Mail, Phone, Calendar, MapPin, 
  Droplet, Activity, Ambulance, ShieldCheck, 
  CheckCircle2, ArrowRight, ArrowLeft 
} from 'lucide-react';
import InputField from '../common/InputField';
import Button from '../common/Button';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

const ProfileWizard = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    gender: user?.gender || '',
    dob: user?.dob?.split('T')[0] || '',
    state: user?.state || '',
    address: user?.address || '',
    bloodGroup: user?.bloodGroup || '',
    allergies: user?.allergies?.join(', ') || '',
    conditions: user?.conditions?.join(', ') || '',
    medications: user?.medications?.join(', ') || '',
    emergencyName: user?.emergencyContact?.name || '',
    emergencyRelation: user?.emergencyContact?.relation || '',
    emergencyPhone: user?.emergencyContact?.phone || '',
    insuranceProvider: user?.insurance?.provider || '',
    insurancePolicy: user?.insurance?.policyNumber || '',
    fathersName: user?.fathersName || '',
    mothersName: user?.mothersName || '',
    languagePreference: user?.languagePreference || 'English',
    notificationSms: user?.notificationPreferences?.sms ?? true,
    notificationEmail: user?.notificationPreferences?.email ?? true,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) {
      nextStep();
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        allergies: formData.allergies.split(',').map(s => s.trim()).filter(s => s),
        conditions: formData.conditions.split(',').map(s => s.trim()).filter(s => s),
        medications: formData.medications.split(',').map(s => s.trim()).filter(s => s),
        emergencyContact: {
          name: formData.emergencyName,
          relation: formData.emergencyRelation,
          phone: formData.emergencyPhone
        },
        insurance: {
          provider: formData.insuranceProvider,
          policyNumber: formData.insurancePolicy
        },
        notificationPreferences: {
          sms: formData.notificationSms,
          email: formData.notificationEmail,
          app: true
        }
      };

      const { data } = await api.put('/auth/profile', submitData);
      showToast('Medical identity synced successfully!', 'success');
      onComplete(data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const indianStates = [
    "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", 
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
  ].sort();

  return (
    <div className="profile-wizard-card animate-fade-in" style={{
      background: 'white',
      padding: '40px',
      borderRadius: '32px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
      maxWidth: '800px',
      margin: '20px auto',
      border: '1px solid #f1f5f9'
    }}>
      <div className="wizard-header" style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>Complete Your Health Identity</h2>
        <p className="text-muted">Step {step} of 3: {step === 1 ? 'Contact & Demographics' : step === 2 ? 'Medical Background' : 'Emergency & Safety'}</p>
        
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ 
              width: '40px', 
              height: '6px', 
              borderRadius: '10px', 
              background: step >= i ? 'var(--primary)' : '#e2e8f0',
              transition: 'all 0.3s ease'
            }} />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="wizard-step animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <InputField label="Primary Phone" name="phone" type="tel" icon={Phone} value={formData.phone} onChange={handleChange} required />
              <div className="input-field-wrapper">
                <label className="input-label">Gender</label>
                <div className="input-container" style={{ display: 'flex', alignItems: 'center' }}>
                    <User size={18} className="input-icon" />
                    <select name="gender" className="input-field" value={formData.gender} onChange={handleChange} required>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
              </div>
              <InputField label="Date of Birth" name="dob" type="date" icon={Calendar} value={formData.dob} onChange={handleChange} required />
              <div className="input-field-wrapper">
                <label className="input-label">State / Union Territory</label>
                <div className="input-container" style={{ display: 'flex', alignItems: 'center' }}>
                    <MapPin size={18} className="input-icon" />
                    <select name="state" className="input-field" value={formData.state} onChange={handleChange} required>
                        <option value="">Choose State</option>
                        {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
              <InputField label="Father's Name" name="fathersName" type="text" icon={User} value={formData.fathersName} onChange={handleChange} placeholder="Full name" />
              <InputField label="Mother's Name" name="mothersName" type="text" icon={User} value={formData.mothersName} onChange={handleChange} placeholder="Full name" />
            </div>
            <InputField label="Street Address" name="address" type="text" placeholder="Detailed address..." icon={MapPin} value={formData.address} onChange={handleChange} required />
            
            <div className="wizard-actions" style={{ marginTop: '32px' }}>
              <Button type="submit" className="w-full">Next Step <ArrowRight size={18} /></Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="input-field-wrapper">
                <label className="input-label">Blood Group</label>
                <div className="input-container" style={{ display: 'flex', alignItems: 'center' }}>
                    <Droplet size={18} className="input-icon" />
                    <select name="bloodGroup" className="input-field" value={formData.bloodGroup} onChange={handleChange}>
                        <option value="">Select (Optional)</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                </div>
              </div>
              <InputField label="Allergies" name="allergies" type="text" placeholder="Pollen, Peanuts, etc." icon={Activity} value={formData.allergies} onChange={handleChange} />
            </div>
            <InputField label="Existing Medical Conditions" name="conditions" type="text" placeholder="Diabetes, Hypertension, etc." icon={Activity} value={formData.conditions} onChange={handleChange} />
            <InputField label="Current Medications" name="medications" type="text" placeholder="Metformin, etc." icon={Activity} value={formData.medications} onChange={handleChange} />
            
            <div className="wizard-actions" style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
              <Button type="button" variant="secondary" onClick={prevStep} className="flex-1">Back</Button>
              <Button type="submit" className="flex-1">Next Step <ArrowRight size={18} /></Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-step animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <InputField label="Emergency Contact Name" name="emergencyName" type="text" icon={User} value={formData.emergencyName} onChange={handleChange} />
              <InputField label="Relationship" name="emergencyRelation" type="text" icon={User} value={formData.emergencyRelation} onChange={handleChange} />
            </div>
            <InputField label="Emergency Phone" name="emergencyPhone" type="tel" icon={Phone} value={formData.emergencyPhone} onChange={handleChange} />

            <div style={{ margin: '24px 0', borderTop: '1px dashed #e2e8f0', paddingTop: '24px' }}>
                <h4 style={{ marginBottom: '16px', fontWeight: 800 }}>Account Preferences</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div className="input-field-wrapper">
                        <label className="input-label">Preferred Language</label>
                        <select name="languagePreference" className="input-field" value={formData.languagePreference} onChange={handleChange}>
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Spanish">Spanish</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Notifications</label>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input type="checkbox" name="notificationSms" checked={formData.notificationSms} onChange={e => setFormData({...formData, notificationSms: e.target.checked})} /> SMS
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input type="checkbox" name="notificationEmail" checked={formData.notificationEmail} onChange={e => setFormData({...formData, notificationEmail: e.target.checked})} /> Email
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="wizard-actions" style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
              <Button type="button" variant="secondary" onClick={prevStep} className="flex-1">Back</Button>
              <Button type="submit" loading={loading} className="flex-1">Finalize & Save <CheckCircle2 size={18} /></Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileWizard;

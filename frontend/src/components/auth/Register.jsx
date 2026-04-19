import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Phone, Eye, EyeOff, Calendar, Droplet, MapPin, PlusSquare } from 'lucide-react';
import AuthLayout from './AuthLayout';
import InputField from '../common/InputField';
import Button from '../common/Button';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    bloodGroup: '',
    state: '',
    address: '',
    role: 'user',
  });

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", 
    "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
    "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ].sort();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      showToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join SmartBook to find the best experts for your needs."
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <InputField
          label="Full Name"
          name="name"
          type="text"
          placeholder="John Doe"
          icon={User}
          value={formData.name}
          onChange={handleChange}
          required
        />
        <InputField
          label="Email Address"
          name="email"
          type="email"
          placeholder="name@example.com"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          required
        />

        <div className="form-row">
          <InputField
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="123-456-7890"
            icon={Phone}
            value={formData.phone}
            onChange={handleChange}
          />
        <div className="identity-selector-group">
          <label className="input-label">Select Your Identity</label>
          <div className="role-selection-grid">
            <div 
              className={`role-tile ${formData.role === 'user' ? 'selected' : ''}`}
              onClick={() => setFormData({...formData, role: 'user'})}
            >
              <div className="role-tile-icon"><User size={24} /></div>
              <div className="role-tile-text">
                <strong>Patient</strong>
                <span>Find & book care</span>
              </div>
            </div>
            <div 
              className={`role-tile ${formData.role === 'provider' ? 'selected' : ''}`}
              onClick={() => setFormData({...formData, role: 'provider'})}
            >
              <div className="role-tile-icon"><PlusSquare size={24} /></div>
              <div className="role-tile-text">
                <strong>Provider</strong>
                <span>Manage practice</span>
              </div>
            </div>
          </div>
        </div>
        </div>
        <div className="form-row">
          <div className="input-wrapper">
             <label className="input-label">Select State / UT</label>
             <div className="input-container">
               <select
                 name="state"
                 className="input-field"
                 value={formData.state}
                 onChange={handleChange}
                 required
               >
                 <option value="">Choose your region</option>
                 {indianStates.map(s => (
                   <option key={s} value={s}>{s}</option>
                 ))}
               </select>
             </div>
          </div>
        </div>
        <div className="form-row">
          <InputField
            label="Full Address"
            name="address"
            type="text"
            placeholder="House No, Street, Landmark"
            icon={MapPin}
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        {formData.role === 'user' && (
          <div className="form-row">
            <InputField
              label="Age (Optional)"
              name="age"
              type="number"
              placeholder="e.g. 30"
              icon={Calendar}
              value={formData.age}
              onChange={handleChange}
            />
            <div className="input-wrapper">
              <label className="input-label">Blood Group</label>
              <div className="input-container">
                <select
                  name="bloodGroup"
                  className="input-field"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                >
                  <option value="">Select (Optional)</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <InputField
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          icon={Lock}
          value={formData.password}
          onChange={handleChange}
          required
          rightElement={
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />

        <Button type="submit" loading={loading} className="w-full">
          <UserPlus size={20} /> Create Account
        </Button>

        <div className="auth-footer">
          Already have an account?
          <Link to="/login" className="auth-link">Sign In</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Lock, UserPlus, Phone, Eye, EyeOff, Calendar, 
  Droplet, MapPin, PlusSquare, ArrowRight, ArrowLeft, 
  Ambulance, ShieldCheck, CheckCircle2, ChevronRight,
  Stethoscope, Activity
} from 'lucide-react';
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
    confirmPassword: '',
    role: 'user',
    consent: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.consent) {
      showToast('Please agree to the terms and data consent.', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      showToast('Welcome to SmartBook!', 'success');
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
      subtitle="Select your role and provide credentials to join our community."
      isWide={true}
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-form-step">
          {/* Identity Selection - Consolidated & Sleek */}
          <div className="identity-selector-group" style={{ marginBottom: '16px' }}>
            <label className="input-label mb-2" style={{ textAlign: 'center', display: 'block', fontSize: '0.8rem', opacity: 0.7 }}>Account Role</label>
            <div className="role-selection-grid compact" style={{ gap: '12px' }}>
              <div 
                className={`role-tile-mini ${formData.role === 'user' ? 'selected' : ''}`}
                onClick={() => setFormData({...formData, role: 'user'})}
              >
                <div className="role-tile-icon">
                  <User size={18} />
                </div>
                <strong>Patient</strong>
              </div>
              <div 
                className={`role-tile-mini ${formData.role === 'provider' ? 'selected' : ''}`}
                onClick={() => setFormData({...formData, role: 'provider'})}
              >
                <div className="role-tile-icon">
                  <Stethoscope size={18} />
                </div>
                <strong>Provider</strong>
              </div>
            </div>
          </div>

          <div className="form-group-title" style={{ marginTop: '8px' }}><Lock size={16} /> Credentials</div>
          
          <InputField
            label="Full Name (as per ID)"
            name="name"
            type="text"
            placeholder="Arjun Mehra"
            icon={User}
            value={formData.name}
            onChange={handleChange}
            required
          />
          
          <InputField
            label="Email Address"
            name="email"
            type="email"
            placeholder="arjun@example.com"
            icon={Mail}
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="form-row">
            <InputField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              required
            />
            <InputField
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              rightElement={
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          </div>
          
          <div style={{ marginTop: '20px', padding: '12px 16px', background: 'var(--primary-light)', borderRadius: '12px', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
              <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} style={{ width: '16px', height: '16px' }} required />
              I agree to the Terms & Data Privacy Policy
            </label>
          </div>

          <div className="auth-nav-btns" style={{ marginTop: '0' }}>
            <Button type="submit" loading={loading} className="w-full">
              Join SmartBook <ArrowRight size={18} />
            </Button>
          </div>

          <div className="auth-footer" style={{ marginTop: '24px' }}>
            Already have an account?
            <Link to="/login" className="auth-link">Sign In</Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;

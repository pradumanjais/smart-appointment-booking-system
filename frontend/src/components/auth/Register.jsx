import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Phone } from 'lucide-react';
import AuthLayout from './AuthLayout';
import InputField from '../common/InputField';
import Button from '../common/Button';
import api from '../../api';

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/register', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
          <div className="input-wrapper">
            <label className="input-label">I am a...</label>
            <div className="input-container">
              <select
                name="role"
                className="input-field"
                value={formData.role}
                onChange={handleChange}
                style={{ paddingLeft: '0' }}
              >
                <option value="user">Patient / Customer</option>
                <option value="provider">Service Provider</option>
              </select>
            </div>
          </div>
        </div>

        <InputField
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          value={formData.password}
          onChange={handleChange}
          required
        />
        
        {error && <div className="error-text" style={{ textAlign: 'center', marginBottom: '16px' }}>{error}</div>}

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

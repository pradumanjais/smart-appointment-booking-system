import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import AuthLayout from './AuthLayout';
import InputField from '../common/InputField';
import Button from '../common/Button';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      showToast('Welcome back!', 'success');
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
      title="Welcome Back" 
      subtitle="Log in to your account to manage your appointments."
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <InputField
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <InputField
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          rightElement={
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />

        <Button type="submit" loading={loading} className="w-full">
          <LogIn size={20} /> Sign In
        </Button>

        <div className="auth-footer">
          Don't have an account? 
          <Link to="/register" className="auth-link">Create one</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;

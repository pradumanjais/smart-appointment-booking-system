import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import AuthLayout from './AuthLayout';
import InputField from '../common/InputField';
import Button from '../common/Button';
import api from '../../api';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', { email, password });
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
          type="password"
          placeholder="••••••••"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        {error && <div className="error-text" style={{ textAlign: 'center', marginBottom: '16px' }}>{error}</div>}

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

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Calendar, LogOut, LayoutDashboard, User } from 'lucide-react';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import UserDashboard from './components/dashboard/UserDashboard';
import ProviderDashboard from './components/dashboard/ProviderDashboard';
import Button from './components/common/Button';
import './App.css';

// Navbar Component
const Navbar = ({ user, handleLogout }) => {
  return (
    <nav className="glass sticky-top">
      <div className="container nav-content">
        <Link to="/" className="logo">
          <Calendar className="primary-icon" />
          <span>SmartBook</span>
        </Link>
        
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                <LayoutDashboard size={20} /> Dashboard
              </Link>
              <div className="user-profile">
                <img 
                  src={user.avatar || 'https://cdn-icons-png.flaticon.com/512/147/147144.png'} 
                  alt="Avatar" 
                  className="nav-avatar" 
                />
                <span className="user-name">{user.name}</span>
              </div>
              <Button onClick={handleLogout} variant="secondary" size="sm" className="btn-logout-small">
                <LogOut size={16} />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// Landing Page
const Landing = () => (
  <div className="landing-hero animate-fade-in">
    <h1>Book Your Appointments <span className="highlight">Smartly</span></h1>
    <p>The leading platform for connecting you with verified healthcare and consulting experts.</p>
    <div className="hero-actions">
      <Link to="/register" className="btn btn-primary btn-lg">Get Started Now</Link>
      <Link to="/login" className="btn btn-secondary btn-lg">Browse Experts</Link>
    </div>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} handleLogout={handleLogout} />
        
        <main className="container content">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route 
              path="/login" 
              element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register setUser={setUser} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/dashboard" 
              element={
                user ? (
                  user.role === 'provider' ? <ProviderDashboard /> : <UserDashboard />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
          </Routes>
        </main>
        
        <footer>
          <div className="container footer-content">
            <p>&copy; 2026 Smart Appointment Booking System. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import UserDashboard from './components/dashboard/UserDashboard';
import ProviderDashboard from './components/dashboard/ProviderDashboard';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/layout/Navbar';
import LandingPage from './components/layout/LandingPage';
import './App.css';
import './components/ui/ui.css';

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
    <ToastProvider>
      <Router>
        <div className="app-container">
          <Navbar user={user} handleLogout={handleLogout} />
          
          <main className="content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
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
          
          <footer className="footer shadow-lg">
            <div className="container footer-content">
              <p>&copy; 2026 Smart Appointment Booking System. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;

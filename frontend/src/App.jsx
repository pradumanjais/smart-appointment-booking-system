import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import UserDashboard from './components/dashboard/UserDashboard';
import ProviderDashboard from './components/dashboard/ProviderDashboard';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/layout/Navbar';
import LandingPage from './components/layout/LandingPage';
import Footer from './components/layout/Footer';
import './App.css';
import './components/ui/ui.css';

// Helper component to handle layout logic
const PageLayout = ({ user, handleLogout, children }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="app-container">
      {!isDashboard && <Navbar user={user} handleLogout={handleLogout} />}
      <main className={!isDashboard ? 'content' : 'dashboard-main-content'}>
        {children}
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
};

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
        <PageLayout user={user} handleLogout={handleLogout}>
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
                  user.role === 'provider' ? 
                    <ProviderDashboard handleLogout={handleLogout} /> : 
                    <UserDashboard handleLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
          </Routes>
        </PageLayout>
      </Router>
    </ToastProvider>
  );
}

export default App;

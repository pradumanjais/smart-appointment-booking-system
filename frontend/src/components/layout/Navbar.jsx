import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  LogOut, 
  LayoutDashboard, 
  User, 
  Bell, 
  ChevronDown, 
  Settings,
  Shield,
  Circle
} from 'lucide-react';
import Button from '../common/Button';

const Navbar = ({ user, handleLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome to SmartBook! Complete your profile to get started.", time: "Just now", unread: true },
    { id: 2, text: "New flagship hospital added in Mumbai.", time: "2 hours ago", unread: false }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Close menus on click outside
  useEffect(() => {
    const closeMenus = () => {
      setShowNotifications(false);
      setShowUserMenu(false);
    };
    document.addEventListener('click', closeMenus);
    return () => document.removeEventListener('click', closeMenus);
  }, []);

  return (
    <nav className="glass sticky-top main-navbar">
      <div className="container nav-content">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <Calendar size={22} />
          </div>
          <span className="logo-text">Smart<span className="text-primary">Book</span></span>
        </Link>
        
        <div className="nav-links">
          {user ? (
            <>
              {/* Navigation Links */}
              <Link to="/dashboard" className="nav-link-premium">
                <LayoutDashboard size={18} /> 
                <span>Dashboard</span>
              </Link>

              {/* Notification Bell */}
              <div className="nav-item-wrapper" onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowUserMenu(false); }}>
                <button className="icon-btn-premium">
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </button>
                
                {showNotifications && (
                  <div className="nav-dropdown glass animate-slide-up">
                    <div className="dropdown-header">
                      <h3>Notifications</h3>
                      {unreadCount > 0 && <span className="unread-tag">{unreadCount} New</span>}
                    </div>
                    <div className="dropdown-body">
                      {notifications.length > 0 ? notifications.map(n => (
                        <div key={n.id} className={`notification-item ${n.unread ? 'unread' : ''}`}>
                          <div className="notif-icon">
                            <Circle size={8} fill={n.unread ? "var(--primary)" : "transparent"} stroke={n.unread ? "var(--primary)" : "#cbd5e1"} />
                          </div>
                          <div className="notif-content">
                            <p>{n.text}</p>
                            <span>{n.time}</span>
                          </div>
                        </div>
                      )) : (
                        <p className="empty-message">No new notifications</p>
                      )}
                    </div>
                    <div className="dropdown-footer">
                      <button>Mark all as read</button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="nav-item-wrapper" onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); setShowNotifications(false); }}>
                <div className="user-profile-nav glass">
                  <img 
                    src={user.avatar || 'https://cdn-icons-png.flaticon.com/512/147/147144.png'} 
                    alt="Avatar" 
                    className="nav-avatar-premium" 
                  />
                  <span className="nav-user-name">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={14} className={`chevron ${showUserMenu ? 'rotate' : ''}`} />
                </div>

                {showUserMenu && (
                  <div className="nav-dropdown user-dropdown glass animate-slide-up">
                    <div className="user-dropdown-info">
                       <p className="user-full-name">{user.name}</p>
                       <p className="user-role-tag">{user.role.toUpperCase()}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/dashboard" className="dropdown-link">
                      <User size={16} /> My Profile
                    </Link>
                    <Link to="/dashboard" className="dropdown-link">
                      <Settings size={16} /> Settings
                    </Link>
                    {user.role === 'provider' && (
                      <Link to="/dashboard" className="dropdown-link">
                        <Shield size={16} /> Verification Status
                      </Link>
                    )}
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-link logout-link">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link-premium">Login</Link>
              <Link to="/register">
                <Button variant="primary" size="sm" className="btn-glow">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

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
  Circle,
  Menu,
  X,
  Search
} from 'lucide-react';
import Button from '../common/Button';
import '../ui/ui.css';

const Navbar = ({ user, handleLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [notifications] = useState([
    { id: 1, text: "Welcome to SmartBook! Complete your profile.", time: "Just now", unread: true },
    { id: 2, text: "New flagship hospital added in Mumbai.", time: "2 hours ago", unread: false }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const closeMenus = () => {
      setShowNotifications(false);
      setShowUserMenu(false);
    };
    
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', closeMenus);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', closeMenus);
    };
  }, []);

  return (
    <nav className={`main-navbar ${isScrolled ? 'scrolled glass' : ''}`}>
      <div className="container nav-content">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <Calendar size={22} color="white" />
          </div>
          <span className="logo-text">Smart<span className="text-primary">Book</span></span>
        </Link>
        
        {/* Desktop Links */}
        <div className="nav-links desktop-only">
          <Link to="/doctors" className="nav-link-premium">
            <Search size={18} /> 
            <span>Find Doctors</span>
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link-premium">
                <LayoutDashboard size={18} /> 
                <span>Dashboard</span>
              </Link>

              {/* Notifications */}
              <div className="nav-item-wrapper" onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowUserMenu(false); }}>
                <button className="icon-btn-premium">
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="notification-indicator">{unreadCount}</span>}
                </button>
                
                {showNotifications && (
                  <div className="nav-dropdown glass animate-fade-in shadow-lg">
                    <div className="dropdown-header">
                      <h3>Notifications</h3>
                      {unreadCount > 0 && <span className="unread-count-pill">{unreadCount} New</span>}
                    </div>
                    <div className="dropdown-body">
                      {notifications.map(n => (
                        <div key={n.id} className={`notification-item ${n.unread ? 'unread' : ''}`}>
                          <div className="notif-dot-wrapper">
                            <Circle size={8} fill={n.unread ? "var(--primary)" : "transparent"} stroke={n.unread ? "var(--primary)" : "var(--border)"} />
                          </div>
                          <div className="notif-content">
                            <p>{n.text}</p>
                            <span>{n.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="nav-item-wrapper" onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); setShowNotifications(false); }}>
                <div className="user-nav-pill glass">
                  <img 
                    src={user.avatar || 'https://cdn-icons-png.flaticon.com/512/147/147144.png'} 
                    alt="Avatar" 
                    className="nav-avatar" 
                  />
                  <span className="nav-user-name">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={14} className={`chevron ${showUserMenu ? 'rotate' : ''}`} />
                </div>

                {showUserMenu && (
                  <div className="nav-dropdown user-dropdown glass animate-fade-in shadow-lg">
                    <div className="user-dropdown-header">
                       <p className="user-name">{user.name}</p>
                       <p className="user-role">{user.role}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/dashboard" className="dropdown-link">
                      <User size={16} /> Profile
                    </Link>
                    <Link to="/dashboard" className="dropdown-link">
                      <Settings size={16} /> Settings
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-link logout-btn">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link-premium">Login</Link>
              <Link to="/register">
                <Button variant="primary" size="sm" className="btn-glow">Get Started</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

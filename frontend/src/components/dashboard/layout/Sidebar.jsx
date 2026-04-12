import React, { useState } from 'react';
import { Calendar, User, PlusSquare, LogOut, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ currentTab, setCurrentTab, user, role }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const userMenu = [
    { id: 'browse', label: 'Book Experts', icon: PlusSquare },
    { id: 'appointments', label: 'My Schedule', icon: Calendar },
    { id: 'profile', label: 'Health Passport', icon: User },
  ];

  const providerMenu = [
    { id: 'appointments', label: 'Daily Schedule', icon: Calendar },
    { id: 'profile', label: 'Expert Identity', icon: User },
  ];

  const menu = role === 'provider' ? providerMenu : userMenu;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <aside className={`sidebar-wrapper ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-glass">
        <div className="sidebar-brand">
          <Activity size={24} className="brand-logo" />
          {!isCollapsed && <span className="brand-name">MedContext</span>}
          <button 
            className="collapse-toggle" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menu.map(item => (
            <div 
              key={item.id} 
              className={`nav-item ${currentTab === item.id ? 'active' : ''} tooltip`}
              data-tooltip={isCollapsed ? item.label : ''}
              onClick={() => setCurrentTab(item.id)}
            >
              <item.icon size={22} className="nav-icon" />
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
              {currentTab === item.id && <div className="active-glow-bar" />}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-mini">
             <div className="avatar-mini-wrapper">
                <img src={user?.avatar || 'https://cdn-icons-png.flaticon.com/512/147/147144.png'} alt="Profile" />
                <div className="online-indicator"></div>
             </div>
            {!isCollapsed && (
              <div className="user-profile-mini-info animate-fade-in">
                <span className="profile-name">{user?.name?.split(' ')[0] || 'User'}</span>
                <span className={`role-id-pill ${role === 'provider' ? 'role-expert' : 'role-patient'}`}>
                  {role === 'provider' ? 'Expert' : 'Patient'}
                </span>
              </div>
            )}
          </div>
          
          <div className="logout-zone">
            <div 
              className="nav-item logout-item tooltip" 
              data-tooltip={isCollapsed ? 'Secure Logout' : ''}
              onClick={handleLogout}
            >
              <LogOut size={22} className="nav-icon" />
              {!isCollapsed && <span className="nav-label">Secure Logout</span>}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

import Sidebar from './Sidebar';
import { Calendar, Search, Bell, ShieldCheck, Settings } from 'lucide-react';
import './dashboard-layout.css';

const DashboardShell = ({ children, currentTab, setCurrentTab, user, role, handleLogout }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="dashboard-shell animate-fade-in">
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        user={user} 
        role={role} 
        handleLogout={handleLogout}
      />
      
      <main className="main-content-wrapper">
        <header className="dashboard-top-header">
           <div className="header-left">
              <div className="header-greeting">
                <span className="role-badge-header">
                  {role === 'provider' ? 'Medical Expert Account' : 'Patient Care Portal'}
                </span>
                <h1>{getGreeting()}, {user?.name?.split(' ')[0] || 'User'}</h1>
              </div>
           </div>

           <div className="header-right">
              <div className="header-search-box">
                <Search size={18} />
                <input type="text" placeholder="Search appointments, experts..." />
              </div>

              <div className="header-actions">
                <div className="action-ic-wrapper tooltip tooltip-bottom" data-tooltip="Notifications">
                  <Bell size={20} />
                  <span className="notification-dot"></span>
                </div>
                <div className="action-ic-wrapper status-online tooltip tooltip-bottom" data-tooltip="Status: Connected">
                   <ShieldCheck size={20} />
                </div>
              </div>
           </div>
        </header>

        <section className="dashboard-content-area transition-layer">
          <div key={currentTab} className="tab-pane-transition">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardShell;

import { Activity } from 'lucide-react';
import Card from '../common/Card';
import './auth.css';

const AuthLayout = ({ children, title, subtitle, isWide = false }) => {
  return (
    <div className="auth-container animate-fade-in">
      <Card className={`auth-card ${isWide ? 'auth-card-wide' : ''}`} hoverEffect={false}>
        <div className="auth-header">
          <div className="auth-brand-logo">
            <Activity size={24} />
          </div>
          <h2 className="auth-title">{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
        </div>
        {children}
      </Card>
    </div>
  );
};

export default AuthLayout;

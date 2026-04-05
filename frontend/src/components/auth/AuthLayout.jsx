import React from 'react';
import Card from '../common/Card';
import './auth.css';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-container animate-fade-in">
      <Card className="auth-card" hoverEffect={false}>
        <div className="auth-header">
          <h2 className="auth-title">{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
        </div>
        {children}
      </Card>
    </div>
  );
};

export default AuthLayout;

import React from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import './ui.css';

const Toast = ({ message, type = 'info', onClose }) => {
  const icons = {
    success: <CheckCircle className="toast-icon" size={20} />,
    error: <AlertCircle className="toast-icon" size={20} />,
    warning: <AlertCircle className="toast-icon" size={20} />,
    info: <Info className="toast-icon" size={20} />,
  };

  return (
    <div className={`toast toast-${type} animate-slide-in-right`}>
      <div className="toast-content">
        {icons[type]}
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;

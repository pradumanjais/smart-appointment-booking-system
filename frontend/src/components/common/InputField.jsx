import React from 'react';
import './common.css';

const InputField = ({ 
  label, 
  icon: Icon, 
  rightElement,
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className={`input-container ${error ? 'input-error' : ''}`}>
        {Icon && <Icon className="input-icon" size={20} />}
        <input className="input-field" {...props} />
        {rightElement && <div className="input-right-element">{rightElement}</div>}
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default InputField;

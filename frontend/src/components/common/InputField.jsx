import React from 'react';
import './common.css';

const InputField = ({ 
  label, 
  icon: Icon, 
  error, 
  rightElement,
  className = '', 
  ...props 
}) => {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label className="input-label">
          {label} {props.required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
        </label>
      )}
      <div className={`input-container ${error ? 'input-error' : ''}`}>
        {Icon && <Icon size={20} className="input-icon" />}
        <input 
          className="input-field"
          {...props}
        />
        {rightElement && (
          <div className="input-right-element">
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default InputField;

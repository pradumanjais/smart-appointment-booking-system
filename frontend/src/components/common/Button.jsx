import React from 'react';
import './common.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  className = '', 
  icon: Icon,
  ...props 
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const loadingClass = loading ? 'btn-loading' : '';
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${sizeClass} ${loadingClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="spinner"></span>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 16 : 20} className="btn-icon" />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;

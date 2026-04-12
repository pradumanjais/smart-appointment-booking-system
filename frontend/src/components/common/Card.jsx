import React from 'react';

const Card = ({ children, padding = 'md', className = '', ...props }) => {
  const paddingClass = `p-${padding}`;
  
  return (
    <div className={`ui-card ${paddingClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;

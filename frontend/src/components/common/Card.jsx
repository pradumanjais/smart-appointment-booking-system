import React from 'react';

const Card = ({ children, padding = 'md', className = '', hoverEffect, ...props }) => {
  const paddingClass = `p-${padding}`;
  const hoverClass = hoverEffect === false ? '' : 'hover-lift';
  
  return (
    <div className={`ui-card ${paddingClass} ${hoverClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;

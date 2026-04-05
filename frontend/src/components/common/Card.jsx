import React from 'react';
import './common.css';

const Card = ({ children, className = '', hoverEffect = true }) => {
  return (
    <div className={`card glass ${hoverEffect ? 'card-hover' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;

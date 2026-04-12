import React from 'react';
import './Skeleton.css';

const Skeleton = ({ variant = 'text', width, height, className = '' }) => {
  const style = {
    width: width,
    height: height
  };

  return (
    <div 
      className={`skeleton-base skeleton-${variant} ${className}`} 
      style={style}
    ></div>
  );
};

export default Skeleton;

import React from 'react';
import './dashboard-components.css';

const StatusBadge = ({ status }) => {
  const getStatusClass = (s) => {
    switch (s?.toLowerCase()) {
      case 'pending': return 'sb-pending';
      case 'confirmed': return 'sb-confirmed';
      case 'completed': return 'sb-completed';
      case 'cancelled': return 'sb-cancelled';
      default: return 'sb-pending';
    }
  };

  return (
    <span className={`status-badge-unified ${getStatusClass(status)}`}>
      {status || 'Pending'}
    </span>
  );
};

export default StatusBadge;

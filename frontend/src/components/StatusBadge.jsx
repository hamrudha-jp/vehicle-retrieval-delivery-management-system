import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = status ? status.toString().toLowerCase() : 'unknown';
  const badgeClass = `badge badge-${normalized}`;
  
  return (
    <span className={badgeClass}>
      ● {status ? status.replace('_', ' ') : 'N/A'}
    </span>
  );
};

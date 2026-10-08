import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();
  let badgeClass = 'badge-waiting';
  let label = status;

  switch (normalized) {
    case 'WAITING':
      badgeClass = 'badge-waiting';
      label = 'Waiting';
      break;
    case 'CALLED':
      badgeClass = 'badge-called';
      label = 'Called to Counter';
      break;
    case 'AT_COUNTER':
      badgeClass = 'badge-called';
      label = 'At Counter';
      break;
    case 'IN_SERVICE':
      badgeClass = 'badge-service';
      label = 'In Service';
      break;
    case 'PAUSED':
      badgeClass = 'badge-skipped';
      label = 'Service Paused';
      break;
    case 'COMPLETED':
      badgeClass = 'badge-completed';
      label = 'Completed';
      break;
    case 'SKIPPED':
      badgeClass = 'badge-skipped';
      label = 'Skipped';
      break;
    case 'NO_SHOW':
      badgeClass = 'badge-noshow';
      label = 'No Show';
      break;
    case 'CANCELLED':
      badgeClass = 'badge-cancelled';
      label = 'Cancelled';
      break;
    case 'SCHEDULED':
    case 'CONFIRMED':
      badgeClass = 'badge-waiting';
      label = 'Confirmed';
      break;
    case 'SENIOR_CITIZEN':
      badgeClass = 'badge-priority';
      label = 'Senior Citizen';
      break;
    case 'ACCESSIBILITY':
      badgeClass = 'badge-priority';
      label = 'Accessibility';
      break;
    case 'EMERGENCY':
      badgeClass = 'badge-noshow';
      label = 'Emergency';
      break;
    case 'SPECIAL_APPOINTMENT':
      badgeClass = 'badge-priority';
      label = 'Appointment';
      break;
    default:
      badgeClass = 'badge-waiting';
      label = status;
  }

  return <span className={`badge ${badgeClass}`}>{label}</span>;
};

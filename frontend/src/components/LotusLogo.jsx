import React from 'react';

export const QueueLogo = ({ size = 36, color = "currentColor", className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background smooth rounded badge */}
      <rect width="100" height="100" rx="28" fill={color} fillOpacity="0.14" />
      
      {/* Outer stylized queue track / Q curve */}
      <path
        d="M 50 18 A 32 32 0 1 1 24 64"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Queue token dots (turns in queue) */}
      <circle cx="28" cy="28" r="4.5" fill={color} opacity="0.6" />
      <circle cx="20" cy="46" r="4.5" fill={color} opacity="0.85" />

      {/* Prominent Checkmark in center representing served turn */}
      <path
        d="M 38 52 L 48 62 L 74 34"
        stroke={color}
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export const LotusLogo = QueueLogo;


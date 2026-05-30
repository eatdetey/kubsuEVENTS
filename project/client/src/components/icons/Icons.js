import React from 'react';

// Inline SVG icons — kept here to avoid a dependency on an icon font/library.
// Each accepts `size` and `className`; the rest is forwarded.
const make = (path) => ({ size = 16, className, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...rest}
  >
    {path}
  </svg>
);

export const CalendarIcon = make(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </>
);

export const MapPinIcon = make(
  <>
    <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" />
    <circle cx="12" cy="9" r="2.5" />
  </>
);

export const UsersIcon = make(
  <>
    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="10" cy="7" r="4" />
    <path d="M21 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </>
);

export const HeartIcon = ({ filled = false, size = 18, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const TicketIcon = make(
  <>
    <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7H10v10H4.5A1.5 1.5 0 0 1 3 15.5v-7z" />
    <path d="M10 7h9.5A1.5 1.5 0 0 1 21 8.5v7a1.5 1.5 0 0 1-1.5 1.5H10z" />
    <path d="M10 7v10" strokeDasharray="2 2" />
  </>
);

export const NewspaperIcon = make(
  <>
    <path d="M4 6h13v14H5a1 1 0 0 1-1-1V6z" />
    <path d="M17 8h3v11a1 1 0 0 1-1 1h-2" />
    <path d="M7 10h7M7 13h7M7 16h5" />
  </>
);

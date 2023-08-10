import React from 'react';
import './DeboucedInput.scss';

const CloseIcon: React.FC = () => (
  <svg
    className="search-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    height="17"
    width="17"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default CloseIcon;

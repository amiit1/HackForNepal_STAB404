import React from 'react';

interface DirectoryIconProps extends React.SVGProps<SVGSVGElement> {}

const DirectoryIcon: React.FC<DirectoryIconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5V4.5A2.5 2.5 0 0 1 6.5 2z" />
    <line x1="12" y1="6" x2="16" y2="6" />
    <line x1="12" y1="10" x2="16" y2="10" />
    <line x1="12" y1="14" x2="16" y2="14" />
    <line x1="8" y1="6" x2="8.01" y2="6" />
    <line x1="8" y1="10" x2="8.01" y2="10" />
    <line x1="8" y1="14" x2="8.01" y2="14" />
  </svg>
);

export default DirectoryIcon;

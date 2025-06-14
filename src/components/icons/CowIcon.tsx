import React from 'react';

interface CowIconProps extends React.SVGProps<SVGSVGElement> {}

const CowIcon: React.FC<CowIconProps> = (props) => (
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
    <path d="M18.5 6.5C18.5 9.81371 15.8137 12.5 12.5 12.5C9.18629 12.5 6.5 9.81371 6.5 6.5C6.5 3.18629 9.18629 0.5 12.5 0.5C15.8137 0.5 18.5 3.18629 18.5 6.5Z" />
    <path d="M19 12C19 15.3137 16.3137 18 13 18C9.68629 18 7 15.3137 7 12" />
    <path d="M12 18V22" />
    <path d="M9 22H15" />
    <path d="M8 9H6" />
    <path d="M18 9H16" />
    <path d="M12.5 0.5C11.5 0.5 11 1 11 2C11 3 11.5 3.5 12.5 3.5C13.5 3.5 14 3 14 2C14 1 13.5 0.5 12.5 0.5Z" fill="currentColor"/>
    <path d="M16 5C16 5.55228 15.5523 6 15 6C14.4477 6 14 5.55228 14 5C14 4.44772 14.4477 4 15 4C15.5523 4 16 4.44772 16 5Z" fill="currentColor" />
     <path d="M10 5C10 5.55228 9.55228 6 9 6C8.44772 6 8 5.55228 8 5C8 4.44772 8.44772 4 9 4C9.55228 4 10 4.44772 10 5Z" fill="currentColor" />
  </svg>
);

export default CowIcon;

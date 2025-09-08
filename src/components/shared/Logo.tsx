import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
  variant?: 'default' | 'white' | 'dark';
}

const sizeClasses = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
};

export default function Logo({ 
  className = '', 
  size = 'md', 
  showText = true, 
  textClassName = '',
  variant = 'default'
}: LogoProps) {
  const logoClasses = `${sizeClasses[size]} ${className}`;
  
  const getTextColor = () => {
    switch (variant) {
      case 'white':
        return 'text-white';
      case 'dark':
        return 'text-gray-900 dark:text-gray-100';
      default:
        return 'text-gray-900 dark:text-gray-100';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <img 
        src="/Logo.png" 
        alt="Company Logo" 
        className={`${logoClasses} object-contain`}
      />
      {showText && (
        <span className={`font-bold ${getTextColor()} ${textClassName}`}>
          EZ Kiosk Ads
        </span>
      )}
    </div>
  );
}

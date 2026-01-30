'use client';

import { ReactNode } from 'react';

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  icon?: ReactNode;
}

export default function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  size = 'lg',
  variant = 'primary',
  className = '',
  icon,
}: PrimaryButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
    xl: 'px-10 py-5 text-xl rounded-2xl',
  };

  const variantClasses = {
    primary: `
      bg-purple-500
      hover:bg-purple-600
      active:bg-purple-700
      text-white font-bold shadow-sm
      hover:shadow-lg active:shadow-sm
      disabled:bg-gray-300
      disabled:cursor-not-allowed disabled:shadow-none
    `,
    secondary: `
      bg-white border-2 border-purple-500
      hover:bg-purple-50 active:bg-purple-100
      text-purple-600 font-bold shadow-md
      hover:shadow-lg active:shadow-sm
      disabled:border-gray-300 disabled:text-gray-400
      disabled:cursor-not-allowed disabled:shadow-none
    `,
    outline: `
      bg-transparent border-2 border-gray-300
      hover:border-purple-500 hover:bg-purple-50
      active:bg-purple-100
      text-gray-700 hover:text-purple-600 font-semibold
      disabled:border-gray-200 disabled:text-gray-400
      disabled:cursor-not-allowed
    `,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        transition-all duration-200
        inline-flex items-center justify-center gap-2
        transform hover:scale-[1.02] active:scale-[0.98]
        disabled:transform-none
        focus:outline-none focus:ring-4 focus:ring-purple-200
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}

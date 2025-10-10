import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
  as?: typeof Link;
  to?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  as: Component = 'button',
  to,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-center';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 border-2 border-blue-600',
    secondary: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 border-2 border-green-600',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 bg-white',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500 bg-transparent border-2 border-transparent',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  // Eğer className içinde renk class'ları varsa, variant'ın default renklerini kullanma
  const variantClasses = className.includes('bg-') || className.includes('text-') || className.includes('border-')
    ? ''
    : variants[variant];

  const combinedProps = {
    className: `${baseClasses} ${variantClasses} ${sizes[size]} ${className}`,
    disabled: disabled || isLoading,
    ...(to ? { to } : {}),
    ...props
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
    >
      <Component {...combinedProps}>
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Yükleniyor...
        </>
      ) : children}
      </Component>
    </motion.div>
  );
};
import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false 
}) => {
  return (
    <motion.div
      initial={hover ? { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : undefined}
      whileHover={hover ? { 
        y: -4, 
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)' 
      } : undefined}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}
    >
      {children}
    </motion.div>
  );
};
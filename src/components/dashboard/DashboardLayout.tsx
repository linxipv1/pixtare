import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCredits } from '../../hooks/useCredits';
import { Button } from '../ui/Button';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title,
  subtitle 
}) => {
  const { user, signOut } = useAuth();
  const { wallet } = useCredits();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/app" className="flex items-center space-x-3">
              <img src="/pixtrate-logo-v2.png" alt="Pixtrate" className="h-8" />
              <div className="border-l border-gray-300 pl-3">
                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {wallet && (
                <div className="flex items-center space-x-2 bg-orange-50 px-3 py-1 rounded-full">
                  <Sparkles className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">{wallet.balance} kredi</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{user?.email?.split('@')[0]}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
          </div>
        )}

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
};
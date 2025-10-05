import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { PricingPage } from './pages/PricingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { GenerateImagePage } from './pages/dashboard/GenerateImagePage';
import { GenerateVideoPage } from './pages/dashboard/GenerateVideoPage';
import HistoryPage from './pages/dashboard/HistoryPage';
import { ProfilePage } from './pages/dashboard/ProfilePage';
import { SubscriptionPage } from './pages/dashboard/SubscriptionPage';
import { BillingPage } from './pages/dashboard/BillingPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminCredits } from './pages/admin/AdminCredits';
import AdminWebhooks from './pages/admin/AdminWebhooks';
import { AdminMessages } from './pages/admin/AdminMessages';
import { AdminContent } from './pages/admin/AdminContent';
import AdminPortfolio from './pages/admin/AdminPortfolio';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import { AdminSettings } from './pages/admin/AdminSettings';

// Admin Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin, loading } = useAdmin();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// App Layout Component
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <AdminProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={
                  <AppLayout>
                    <HomePage />
                  </AppLayout>
                } />
                
                <Route path="/pricing" element={
                  <AppLayout>
                    <PricingPage />
                  </AppLayout>
                } />
                
                <Route path="/auth" element={<AuthPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/*" element={
                  <AdminRoute>
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="credits" element={<AdminCredits />} />
                      <Route path="webhooks" element={<AdminWebhooks />} />
                      <Route path="messages" element={<AdminMessages />} />
                      <Route path="content" element={<AdminContent />} />
                      <Route path="portfolio" element={<AdminPortfolio />} />
                      <Route path="testimonials" element={<AdminTestimonials />} />
                      <Route path="settings" element={<AdminSettings />} />
                    </Routes>
                  </AdminRoute>
                } />
                
                {/* Protected App Routes */}
                <Route path="/app/*" element={
                  <ProtectedRoute>
                    <Routes>
                      <Route index element={<DashboardHome />} />
                      <Route path="generate-image" element={<GenerateImagePage />} />
                      <Route path="generate-video" element={<GenerateVideoPage />} />
                      <Route path="history" element={<HistoryPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="subscription" element={<SubscriptionPage />} />
                      <Route path="billing" element={<BillingPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Routes>
                  </ProtectedRoute>
                } />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#fff',
                    color: '#374151',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </AdminProvider>
    </HelmetProvider>
  );
}

export default App;
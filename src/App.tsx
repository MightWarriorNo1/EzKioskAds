import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/shared/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import HostLanding from './pages/HostLanding';
import KiosksPage from './pages/KiosksPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ContactPage from './pages/ContactPage';
import AuthCallback from './pages/AuthCallback';
import ClientPortal from './pages/ClientPortal';
import HostPortal from './pages/HostPortal';
import AdminPortal from './pages/AdminPortal';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen bg-[rgb(var(--surface))] dark:bg-gray-900">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/hosting" element={<HostLanding />} />
                <Route path="/kiosks" element={<KiosksPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/confirm-email" element={<AuthCallback />} />
                <Route 
                  path="/client/*" 
                  element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <ClientPortal />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/host/*" 
                  element={
                    <ProtectedRoute allowedRoles={['host']}>
                      <HostPortal />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPortal />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
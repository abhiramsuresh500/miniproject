import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import MainApp from '@/pages/MainApp';
import { Toaster } from '@/components/ui/toaster';

function AppContent() {
  const { user, loading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {showSignup ? (
          <SignupPage onNavigateToLogin={() => setShowSignup(false)} />
        ) : (
          <LoginPage onNavigateToSignup={() => setShowSignup(true)} />
        )}
        <Toaster />
      </>
    );
  }

  return <MainApp />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
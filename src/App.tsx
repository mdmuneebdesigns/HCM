import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FirstRunSetup } from './components/FirstRunSetup';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { HrDashboard } from './components/hr/HrDashboard';
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { AiChatPanel } from './components/ai/AiChatPanel';
import { Loader2 } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, isLoading, isSetupComplete, mustChangePasswordPrompt } = useAuth();
  const [setupNotice, setSetupNotice] = useState<{ email: string; message: string } | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100 space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <span className="text-sm font-medium text-slate-400">Loading HCM Lite...</span>
      </div>
    );
  }

  // 1. First-Run Setup: If no company/user exists in database
  if (!isSetupComplete) {
    return (
      <FirstRunSetup
        onSetupSuccess={(adminEmail) => {
          setSetupNotice({
            email: adminEmail,
            message: 'Setup complete! Please sign in with your administrator account.',
          });
        }}
      />
    );
  }

  // 2. Authentication: If not logged in, show Login screen
  if (!user) {
    return (
      <LoginPage
        initialEmail={setupNotice?.email || ''}
        setupSuccessMessage={setupNotice?.message || null}
      />
    );
  }

  // 3. Authenticated Dashboard with Role Scoping
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === 'admin' && <AdminDashboard />}
        {user.role === 'hr' && <HrDashboard />}
        {user.role === 'employee' && <EmployeeDashboard />}
      </main>

      {/* Mandatory first-sign-in or flagged password change modal */}
      {mustChangePasswordPrompt && (
        <ChangePasswordModal
          isOpen={true}
          isFirstSignIn={true}
        />
      )}

      {/* Floating AI Assistant Chat Panel */}
      <AiChatPanel />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

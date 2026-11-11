import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types/index.ts';
import { api } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { LoginView } from './components/auth/LoginView.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { FacultyDashboard } from './components/faculty/FacultyDashboard.tsx';
import { StudentDashboard } from './components/student/StudentDashboard.tsx';
import { ReportCardModal } from './components/common/ReportCardModal.tsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reportModalRollNo, setReportModalRollNo] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Initialize Auth state
  useEffect(() => {
    async function initAuth() {
      try {
        const storedUser = api.getStoredUser();
        const token = api.getToken();

        if (token && storedUser) {
          try {
            const user = await api.getCurrentUser();
            setCurrentUser(user);
          } catch {
            // Token might be expired, log in as default demo admin
            const res = await api.quickLogin('admin');
            setCurrentUser(res.user);
          }
        } else {
          // Auto log in as Admin for instant interactive preview
          const res = await api.quickLogin('admin');
          setCurrentUser(res.user);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsInitialLoading(false);
      }
    }

    initAuth();
  }, []);

  const handleQuickLogin = async (role: UserRole) => {
    try {
      const res = await api.quickLogin(role);
      setCurrentUser(res.user);
      setActiveTab('dashboard');
    } catch (err: any) {
      alert(err.message || 'Quick login failed');
    }
  };

  const handleLogout = () => {
    api.clearAuth();
    setCurrentUser(null);
  };

  const handleResetDatabase = async () => {
    try {
      const msg = await api.resetSeedData();
      alert(msg);
      // Refresh user session
      if (currentUser) {
        await handleQuickLogin(currentUser.role);
      }
    } catch (err: any) {
      alert('Failed to reset database: ' + err.message);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="font-bold text-slate-800 text-sm mt-3 mb-1">StudentTrack PBL System</h5>
          <p className="text-xs text-slate-500">Connecting to Express & MongoDB...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onQuickLogin={handleQuickLogin}
        onLogout={handleLogout}
        onResetDatabase={handleResetDatabase}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenReportCard={(roll) => setReportModalRollNo(roll)}
      />

      <div className="flex-1 d-flex">
        {/* Left Sidebar Navigation */}
        <Sidebar
          currentRole={currentUser.role}
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenReportCard={() => {
            if (currentUser.studentRollNo) {
              setReportModalRollNo(currentUser.studentRollNo);
            }
          }}
          studentRollNo={currentUser.studentRollNo}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 p-md-5 overflow-x-hidden lg:ms-64 transition-all">
          <div className="container-fluid max-w-7xl mx-auto p-0">
            {currentUser.role === 'admin' && (
              <AdminDashboard
                activeTab={activeTab}
                onOpenReportCard={(roll) => setReportModalRollNo(roll)}
              />
            )}

            {currentUser.role === 'faculty' && (
              <FacultyDashboard
                activeTab={activeTab}
                onOpenReportCard={(roll) => setReportModalRollNo(roll)}
              />
            )}

            {currentUser.role === 'student' && (
              <StudentDashboard
                activeTab={activeTab}
                onOpenReportCard={(roll) => setReportModalRollNo(roll)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Official Academic Report Card Modal */}
      {reportModalRollNo && (
        <ReportCardModal
          rollNo={reportModalRollNo}
          onClose={() => setReportModalRollNo(null)}
        />
      )}
    </div>
  );
}

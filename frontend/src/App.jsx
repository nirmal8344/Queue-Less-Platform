import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Sidebar } from './components/Sidebar';

// Auth Pages
import { CustomerLogin } from './pages/auth/CustomerLogin';
import { CustomerRegister } from './pages/auth/CustomerRegister';
import { StaffLogin } from './pages/auth/StaffLogin';
import { AdminLogin } from './pages/auth/AdminLogin';

// Customer Pages
import { CustomerHome } from './pages/customer/CustomerHome';
import { BookAppointment } from './pages/customer/BookAppointment';
import { MyQueue } from './pages/customer/MyQueue';
import { MyAppointments } from './pages/customer/MyAppointments';
import { CustomerHistory } from './pages/customer/CustomerHistory';
import { CustomerProfile } from './pages/customer/CustomerProfile';

// Staff Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffCurrentQueue } from './pages/staff/StaffCurrentQueue';
import { StaffQueueHistory } from './pages/staff/StaffQueueHistory';
import { StaffProfile } from './pages/staff/StaffProfile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminBranches } from './pages/admin/AdminBranches';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminCounters } from './pages/admin/AdminCounters';
import { AdminStaff } from './pages/admin/AdminStaff';
import { AdminAppointments } from './pages/admin/AdminAppointments';
import { AdminQueueMonitor } from './pages/admin/AdminQueueMonitor';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminSettings } from './pages/admin/AdminSettings';

// Public TV Waiting Area Display Page
import { QueueDisplay } from './pages/display/QueueDisplay';

const AUTH_VIEWS = ['login', 'customer-login', 'register', 'customer-register', 'staff-login', 'admin-login'];

const AppContent = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState(() => {
    if (!user) return 'customer-login';
    if (user.role === 'STAFF') return 'staff-dashboard';
    if (user.role === 'ADMIN') return 'admin-dashboard';
    return 'customer-home';
  });

  // Automatically redirect unauthenticated users to Login First
  React.useEffect(() => {
    if (!user && !AUTH_VIEWS.includes(currentView) && currentView !== 'queue-display') {
      setCurrentView('customer-login');
    } else if (user && AUTH_VIEWS.includes(currentView)) {
      if (user.role === 'STAFF') setCurrentView('staff-dashboard');
      else if (user.role === 'ADMIN') setCurrentView('admin-dashboard');
      else setCurrentView('customer-home');
    }
  }, [user]);

  // Preselected booking parameters
  const [preselectedBranchId, setPreselectedBranchId] = useState(null);
  const [preselectedServiceId, setPreselectedServiceId] = useState(null);

  const handleSelectServiceForBooking = (branchId, serviceId) => {
    setPreselectedBranchId(branchId);
    setPreselectedServiceId(serviceId);
  };

  // Fullscreen TV Display — no sidebar/layout
  if (currentView === 'queue-display') {
    return <QueueDisplay setCurrentView={setCurrentView} />;
  }

  const isAuthView = AUTH_VIEWS.includes(currentView);

  // Auth pages render without sidebar
  if (isAuthView) {
    return (
      <div className="app-auth-layout">
        {(currentView === 'login' || currentView === 'customer-login') && <CustomerLogin setCurrentView={setCurrentView} />}
        {(currentView === 'register' || currentView === 'customer-register') && <CustomerRegister setCurrentView={setCurrentView} />}
        {currentView === 'staff-login' && <StaffLogin setCurrentView={setCurrentView} />}
        {currentView === 'admin-login' && <AdminLogin setCurrentView={setCurrentView} />}
      </div>
    );
  }

  // Main app layout with sidebar
  return (
    <div className="app-layout">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      <div className="main-area">
        <main className="main-content">
          {/* Customer Views */}
          {currentView === 'customer-home' && (
            <CustomerHome
              setCurrentView={setCurrentView}
              onSelectServiceForBooking={handleSelectServiceForBooking}
            />
          )}
          {currentView === 'book-appointment' && (
            <BookAppointment
              setCurrentView={setCurrentView}
              preselectedBranchId={preselectedBranchId}
              preselectedServiceId={preselectedServiceId}
            />
          )}
          {currentView === 'my-queue' && <MyQueue setCurrentView={setCurrentView} />}
          {currentView === 'my-appointments' && <MyAppointments setCurrentView={setCurrentView} />}
          {currentView === 'customer-history' && <CustomerHistory />}
          {currentView === 'customer-profile' && <CustomerProfile />}

          {/* Staff Views */}
          {currentView === 'staff-dashboard' && <StaffDashboard setCurrentView={setCurrentView} />}
          {currentView === 'staff-queue' && <StaffCurrentQueue />}
          {currentView === 'staff-history' && <StaffQueueHistory />}
          {currentView === 'staff-profile' && <StaffProfile />}

          {/* Admin Views */}
          {currentView === 'admin-dashboard' && <AdminDashboard setCurrentView={setCurrentView} />}
          {currentView === 'admin-branches' && <AdminBranches />}
          {currentView === 'admin-services' && <AdminServices />}
          {currentView === 'admin-counters' && <AdminCounters />}
          {currentView === 'admin-staff' && <AdminStaff />}
          {currentView === 'admin-appointments' && <AdminAppointments />}
          {currentView === 'admin-queue' && <AdminQueueMonitor />}
          {currentView === 'admin-analytics' && <AdminAnalytics />}
          {currentView === 'admin-settings' && <AdminSettings />}
        </main>

        {/* Footer */}
        <footer style={{
          backgroundColor: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          padding: '14px 24px',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          QueueLess – Digital Queue & Appointment Management Platform
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

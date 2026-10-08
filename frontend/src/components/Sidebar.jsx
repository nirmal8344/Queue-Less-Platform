import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { QueueLogo } from './LotusLogo';
import {
  Home,
  Calendar,
  Clock,
  ClipboardList,
  History,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Layers,
  Users,
  Building2,
  Settings,
  BarChart3,
  Tv,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Monitor,
  ShieldCheck
} from 'lucide-react';

export const Sidebar = ({ currentView, setCurrentView }) => {
  const { user, logout, activeToken } = useAuth();
  const { unreadCount } = useNotifications();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile drawer on navigation
  const navigate = (view) => {
    setCurrentView(view);
    if (isMobile) setMobileOpen(false);
  };

  // Determine which nav items to show based on role
  const getNavItems = () => {
    if (!user) {
      return [
        { id: 'customer-home', label: 'Home & Services', icon: Home },
        { id: 'book-appointment', label: 'Book Appointment', icon: Calendar },
      ];
    }

    if (user.role === 'CUSTOMER') {
      return [
        { id: 'customer-home', label: 'Home & Services', icon: Home },
        { id: 'book-appointment', label: 'Book Appointment', icon: Calendar },
        { id: 'my-queue', label: 'My Queue', icon: Clock, badge: activeToken ? activeToken.tokenNumber : null },
        { id: 'my-appointments', label: 'My Appointments', icon: ClipboardList },
        { id: 'customer-history', label: 'History', icon: History },
      ];
    }

    if (user.role === 'STAFF') {
      return [
        { id: 'staff-dashboard', label: 'Service Desk', icon: LayoutDashboard },
        { id: 'staff-queue', label: 'Full Queue', icon: Layers },
        { id: 'staff-history', label: 'Daily Logs', icon: History },
      ];
    }

    if (user.role === 'ADMIN') {
      return [
        { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'admin-branches', label: 'Branches', icon: Building2 },
        { id: 'admin-services', label: 'Services', icon: ClipboardList },
        { id: 'admin-counters', label: 'Counters', icon: Monitor },
        { id: 'admin-staff', label: 'Staff', icon: Users },
        { id: 'admin-appointments', label: 'Appointments', icon: Calendar },
        { id: 'admin-queue', label: 'Queue Live', icon: Layers },
        { id: 'admin-analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'admin-settings', label: 'Settings', icon: Settings },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  const sidebarContent = (
    <>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div
          className="sidebar-brand"
          onClick={() => navigate(
            user?.role === 'ADMIN' ? 'admin-dashboard' :
            user?.role === 'STAFF' ? 'staff-dashboard' : 'customer-home'
          )}
        >
          <QueueLogo size={collapsed && !isMobile ? 28 : 32} color="var(--primary)" />
          {(!collapsed || isMobile) && (
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">QueueLess</span>
              {user && (
                <span className="sidebar-role-badge">{user.role}</span>
              )}
            </div>
          )}
        </div>
        {!isMobile && (
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
        {isMobile && (
          <button className="sidebar-close" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Active Token Pill (Customer only) */}
      {user?.role === 'CUSTOMER' && activeToken && (!collapsed || isMobile) && (
        <div
          className="sidebar-token-pill"
          onClick={() => navigate('my-queue')}
        >
          <span className="token-pulse" />
          <span className="token-text">Token: {activeToken.tokenNumber}</span>
          <span className="token-status">
            {activeToken.status === 'CALLED' ? 'CALLED!' : `Ahead: ${activeToken.peopleAhead}`}
          </span>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-section">
          {(!collapsed || isMobile) && (
            <span className="sidebar-section-label">Navigation</span>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.id)}
                title={collapsed && !isMobile ? item.label : undefined}
              >
                <Icon size={19} className="sidebar-nav-icon" />
                {(!collapsed || isMobile) && (
                  <span className="sidebar-nav-label">{item.label}</span>
                )}
                {item.badge && (!collapsed || isMobile) && (
                  <span className="sidebar-nav-badge">{item.badge}</span>
                )}
                {item.badge && collapsed && !isMobile && (
                  <span className="sidebar-nav-dot" />
                )}
              </button>
            );
          })}
        </div>

        {/* Utility section */}
        <div className="sidebar-nav-section">
          {(!collapsed || isMobile) && (
            <span className="sidebar-section-label">Utility</span>
          )}
          <button
            className={`sidebar-nav-item ${currentView === 'queue-display' ? 'active' : ''}`}
            onClick={() => navigate('queue-display')}
            title={collapsed && !isMobile ? 'Live TV Display' : undefined}
          >
            <Tv size={19} className="sidebar-nav-icon" />
            {(!collapsed || isMobile) && (
              <span className="sidebar-nav-label">Live TV Display</span>
            )}
          </button>
        </div>
      </nav>

      {/* Bottom Section: Profile & Auth */}
      <div className="sidebar-footer">
        {user ? (
          <>
            {/* Profile */}
            <button
              className={`sidebar-nav-item ${
                currentView === 'customer-profile' || currentView === 'staff-profile' || currentView === 'admin-settings'
                  ? 'active' : ''
              }`}
              onClick={() => navigate(
                user.role === 'CUSTOMER' ? 'customer-profile' :
                user.role === 'STAFF' ? 'staff-profile' : 'admin-settings'
              )}
              title={collapsed && !isMobile ? 'My Profile' : undefined}
            >
              <UserIcon size={19} className="sidebar-nav-icon" />
              {(!collapsed || isMobile) && (
                <div className="sidebar-user-info">
                  <span className="sidebar-user-name">{user.name}</span>
                  <span className="sidebar-user-email">{user.email}</span>
                </div>
              )}
            </button>

            {/* Logout */}
            <button
              className="sidebar-nav-item sidebar-logout"
              onClick={() => {
                logout();
                navigate('customer-home');
              }}
              title={collapsed && !isMobile ? 'Sign Out' : undefined}
            >
              <LogOut size={19} className="sidebar-nav-icon" />
              {(!collapsed || isMobile) && (
                <span className="sidebar-nav-label">Sign Out</span>
              )}
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              className="sidebar-nav-item sidebar-signin"
              onClick={() => navigate('customer-login')}
              title={collapsed && !isMobile ? 'Customer Sign In' : undefined}
            >
              <UserIcon size={19} className="sidebar-nav-icon" />
              {(!collapsed || isMobile) && (
                <span className="sidebar-nav-label">Customer Sign In</span>
              )}
            </button>
            <button
              className="sidebar-nav-item"
              onClick={() => navigate('staff-login')}
              title={collapsed && !isMobile ? 'Staff Portal' : undefined}
              style={{ fontSize: '0.82rem' }}
            >
              <Users size={18} className="sidebar-nav-icon" />
              {(!collapsed || isMobile) && (
                <span className="sidebar-nav-label">Staff Portal</span>
              )}
            </button>
            <button
              className="sidebar-nav-item"
              onClick={() => navigate('admin-login')}
              title={collapsed && !isMobile ? 'Admin Console' : undefined}
              style={{ fontSize: '0.82rem' }}
            >
              <ShieldCheck size={18} className="sidebar-nav-icon" />
              {(!collapsed || isMobile) && (
                <span className="sidebar-nav-label">Admin Console</span>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger trigger */}
      {isMobile && (
        <div className="mobile-topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="mobile-topbar-brand" onClick={() => navigate(
            user?.role === 'ADMIN' ? 'admin-dashboard' :
            user?.role === 'STAFF' ? 'staff-dashboard' : 'customer-home'
          )}>
            <QueueLogo size={26} color="var(--primary)" />
            <span className="sidebar-brand-name" style={{ fontSize: '1.1rem' }}>QueueLess</span>
          </div>
          <div style={{ width: '38px' }} />
        </div>
      )}

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''} ${mobileOpen ? 'open' : ''}`}>
        {sidebarContent}
      </aside>
    </>
  );
};

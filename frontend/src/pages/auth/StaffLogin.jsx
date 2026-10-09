import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { QueueLogo } from '../../components/LotusLogo';
import { AuthVisualPanel } from '../../components/AuthVisualPanel';
import { Mail, Lock, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export const StaffLogin = ({ setCurrentView }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password, 'STAFF');
      setCurrentView('staff-dashboard');
    } catch (err) {
      setError(err.message || 'Invalid staff credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container">
      <div className="auth-split-card">
        {/* Left Visual Panel */}
        <AuthVisualPanel subtitle="Manage your queue with ease." />

        {/* Right Form Panel */}
        <div className="auth-form-panel">
          <div className="auth-form-header">
            <div className="auth-brand-badge">
              <QueueLogo size={36} color="var(--primary)" />
              <span className="auth-brand-title">QueueLess</span>
            </div>
            <h2 className="auth-page-title">Staff Login</h2>
          </div>

          {/* Role Portal Selector Bar */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--primary-subtle)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '18px',
            border: '1px solid var(--border)'
          }}>
            <button
              type="button"
              onClick={() => setCurrentView('customer-login')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 500,
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)'
              }}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('staff-login')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 700,
                backgroundColor: 'var(--surface)',
                color: 'var(--primary-dark)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              Staff
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('admin-login')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 500,
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)'
              }}
            >
              Admin
            </button>
          </div>

          {error && (
            <div className="auth-error-box">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }} autoComplete="on">
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Staff Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="staffEmail"
                  id="staff-email"
                  autoComplete="email"
                  required
                  className="form-input"
                  placeholder="staff@queueless.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  name="staffPassword"
                  id="staff-password"
                  autoComplete="current-password"
                  required
                  className="form-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block btn-lg"
            >
              {loading ? 'Signing in...' : 'Staff Sign In'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-info-banner">
            <UserCheck size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span>Staff accounts are created and managed by system administrators. Contact your administrator if you need access.</span>
          </div>

          <div className="auth-footer-text" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <span onClick={() => setCurrentView('customer-login')} className="auth-link">
              ← Customer Login
            </span>
            <span onClick={() => setCurrentView('admin-login')} className="auth-link">
              Admin Login →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

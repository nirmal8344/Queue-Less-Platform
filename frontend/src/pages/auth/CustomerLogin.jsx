import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { QueueLogo } from '../../components/LotusLogo';
import { AuthVisualPanel } from '../../components/AuthVisualPanel';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export const CustomerLogin = ({ setCurrentView }) => {
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
      const res = await login(email, password, 'CUSTOMER');
      setCurrentView('customer-home');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
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
            <h2 className="auth-page-title">Customer Login</h2>
          </div>

          {error && (
            <div className="auth-error-box">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }} autoComplete="on">
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  id="login-email"
                  autoComplete="email"
                  required
                  className="form-input"
                  placeholder="name@example.com"
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
                  name="password"
                  id="login-password"
                  autoComplete="current-password"
                  required
                  className="form-input"
                  placeholder="Enter your password"
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
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-footer-text" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
            <span>
              Don't have an account?{' '}
              <span
                onClick={() => setCurrentView('customer-register')}
                className="auth-link"
              >
                Sign up
              </span>
            </span>
            <span>
              <span onClick={() => setCurrentView('staff-login')} className="auth-link">
                Staff Login
              </span>
              {' | '}
              <span onClick={() => setCurrentView('admin-login')} className="auth-link">
                Admin Login
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

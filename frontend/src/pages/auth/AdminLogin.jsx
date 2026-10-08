import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { QueueLogo } from '../../components/LotusLogo';
import { AuthVisualPanel } from '../../components/AuthVisualPanel';
import { Mail, Lock, AlertCircle, ArrowRight, Shield } from 'lucide-react';

export const AdminLogin = ({ setCurrentView }) => {
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
      const res = await login(email, password, 'ADMIN');
      setCurrentView('admin-dashboard');
    } catch (err) {
      setError(err.message || 'Invalid admin credentials');
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
            <h2 className="auth-page-title">Admin Login</h2>
          </div>

          {error && (
            <div className="auth-error-box">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }} autoComplete="on">
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Admin Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="adminEmail"
                  id="admin-email"
                  autoComplete="email"
                  required
                  className="form-input"
                  placeholder="admin@queueless.com"
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
                  name="adminPassword"
                  id="admin-password"
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
              {loading ? 'Signing in...' : 'Admin Sign In'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-info-banner">
            <Shield size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span>Protected administrative console. Unauthorized access is strictly prohibited.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

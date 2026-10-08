import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useNotifications } from '../../context/NotificationContext';
import { Users, UserPlus, Shield, Building2, Mail, Phone, RefreshCw, Plus, X, Lock, CheckCircle2 } from 'lucide-react';

export const AdminStaff = () => {
  const { addToast } = useNotifications();
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uList, bList, cList] = await Promise.all([
        api.getAllUsersAdmin(),
        api.getAllBranchesAdmin(),
        api.getAllCountersAdmin()
      ]);
      setUsers(uList);
      setBranches(bList);
      setCounters(cList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await api.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'STAFF'
      });
      addToast('Staff account created successfully!', 'success');
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', password: '' });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to create staff account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Staff & User Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Manage staff operational assignments, branch allocations, and system roles.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
            <UserPlus size={16} /> Create Staff Account
          </button>
          <button onClick={fetchData} className="btn btn-outline btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="ql-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--primary-subtle)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Name</th>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Email</th>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Phone</th>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Role</th>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Assigned Desk</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map(u => {
                const b = branches.find(b => b.id === u.assignedBranchId);
                const c = counters.find(c => c.id === u.assignedCounterId);
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {u.name}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                      {u.phone || 'N/A'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: u.role === 'ADMIN' ? '#FEF3C7' : u.role === 'STAFF' ? 'var(--primary-light)' : '#EFF6FF',
                        color: u.role === 'ADMIN' ? '#92400E' : u.role === 'STAFF' ? 'var(--primary-dark)' : '#1E40AF',
                        padding: '3px 8px',
                        borderRadius: '4px'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-main)' }}>
                      {u.role === 'STAFF' ? (
                        <span>{b ? b.name : 'Unassigned Branch'} {c ? `(Window #${c.counterNumber})` : ''}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Creating Staff */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="ql-card" style={{ width: '100%', maxWidth: '480px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Create New Staff Account
              </h3>
              <button onClick={() => setShowModal(false)} className="btn btn-outline btn-sm">
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="auth-error-box" style={{ marginBottom: '16px' }}>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Sarah Connor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Staff Email *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="staff.name@queueless.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Number (Optional)</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Temporary Password *</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Ticket, AlertCircle, X, Sparkles, User, Phone, CheckCircle2 } from 'lucide-react';

export const WalkInModal = ({ isOpen, onClose, defaultBranchId, defaultServiceId, onSuccess }) => {
  const { user, refreshActiveToken } = useAuth();
  const { addToast } = useNotifications();

  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [branchId, setBranchId] = useState(defaultBranchId || '');
  const [serviceId, setServiceId] = useState(defaultServiceId || '');
  const [priorityCategory, setPriorityCategory] = useState('GENERAL');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedToken, setGeneratedToken] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setGeneratedToken(null);
      api.getBranches().then(data => {
        setBranches(data);
        if (!branchId && data.length > 0) setBranchId(data[0].id);
      }).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (branchId) {
      api.getServices(branchId).then(data => {
        setServices(data);
        if (data.length > 0) {
          if (!defaultServiceId || !data.find(s => s.id === Number(defaultServiceId))) {
            setServiceId(data[0].id);
          } else {
            setServiceId(defaultServiceId);
          }
        }
      }).catch(() => {});
    }
  }, [branchId, defaultServiceId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        branchId: Number(branchId),
        serviceId: Number(serviceId),
        priorityCategory,
        customerName: user ? user.name : guestName || 'Walk-in Customer',
        customerPhone: user ? user.phone : guestPhone,
        notes
      };

      let token;
      if (user) {
        token = await api.createWalkInTokenCustomer(payload);
        await refreshActiveToken();
      } else {
        token = await api.createWalkInTokenGuest(payload);
      }

      setGeneratedToken(token);
      addToast('Token Issued', `Your token ${token.tokenNumber} has been generated!`, 'TOKEN_GENERATED');
      if (onSuccess) onSuccess(token);
    } catch (err) {
      setError(err.message || 'Failed to generate token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-dark)'
            }}>
              <Ticket size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {generatedToken ? 'Token Generated!' : 'Get Walk-In Token'}
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                {generatedToken ? 'Keep this token number handy' : 'Join the queue right now'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', fontSize: '1.4rem' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            backgroundColor: 'var(--status-danger-bg)',
            color: 'var(--status-danger)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {generatedToken ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              display: 'inline-block',
              backgroundColor: 'var(--primary-light)',
              border: '2px dashed var(--primary)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px 36px',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-dark)', textTransform: 'uppercase' }}>
                Your Token Number
              </span>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.04em', margin: '8px 0' }}>
                {generatedToken.tokenNumber}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {generatedToken.serviceName} • {generatedToken.branchName}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ backgroundColor: 'var(--primary-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>People ahead of you</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{generatedToken.peopleAhead} people</strong>
              </div>
              <div style={{ backgroundColor: 'var(--primary-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Estimated wait time</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>~{generatedToken.estimatedWaitMinutes} mins</strong>
              </div>
            </div>

            <button onClick={onClose} className="btn btn-primary btn-block btn-lg">
              <CheckCircle2 size={18} /> Done & View Queue
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Select Branch</label>
              <select
                className="form-select"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                required
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Service</label>
              <select
                className="form-select"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                required
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} (~{s.estimatedDurationMinutes} mins)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority Handling Category</label>
              <select
                className="form-select"
                value={priorityCategory}
                onChange={(e) => setPriorityCategory(e.target.value)}
              >
                <option value="GENERAL">General Customer</option>
                <option value="SENIOR_CITIZEN">Senior Citizen (60+)</option>
                <option value="ACCESSIBILITY">Accessibility / Differently Abled</option>
                <option value="EMERGENCY">Emergency / Expedited</option>
              </select>
            </div>

            {!user && (
              <>
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Enter full name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number (optional)</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +1 555-0199"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Notes or Special Requirements (optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. wheelchair assistance needed"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2 }}>
                {loading ? 'Generating Token...' : 'Generate Token Now'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

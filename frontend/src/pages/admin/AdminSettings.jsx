import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useNotifications } from '../../context/NotificationContext';
import { Settings, Building2, Save, Bell, Shield, CheckCircle2 } from 'lucide-react';

export const AdminSettings = () => {
  const { addToast } = useNotifications();
  const [orgData, setOrgData] = useState({
    name: '',
    description: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [settings, setSettings] = useState({
    CANCELLATION_MINUTES_BEFORE: '60',
    AUTO_CALL_BUFFER: '3',
    MAX_DAILY_TOKENS_PER_USER: '5'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [org, sList] = await Promise.all([
        api.getOrganization(),
        api.getSettings()
      ]);
      if (org) {
        setOrgData({
          name: org.name || '',
          description: org.description || '',
          contactEmail: org.contactEmail || '',
          contactPhone: org.contactPhone || ''
        });
      }
      if (sList && sList.length > 0) {
        const sMap = {};
        sList.forEach(s => {
          sMap[s.settingKey] = s.settingValue;
        });
        setSettings(prev => ({ ...prev, ...sMap }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveOrganization = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateOrganization(orgData);
      addToast('Organization Saved', 'Organization details updated.', 'success');
    } catch (err) {
      addToast('Error', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOperationalSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        api.updateSetting('CANCELLATION_MINUTES_BEFORE', settings.CANCELLATION_MINUTES_BEFORE, 'Cancellation notice minutes before booking'),
        api.updateSetting('AUTO_CALL_BUFFER', settings.AUTO_CALL_BUFFER, 'Number of customers ahead to alert'),
        api.updateSetting('MAX_DAILY_TOKENS_PER_USER', settings.MAX_DAILY_TOKENS_PER_USER, 'Daily token cap per user')
      ]);
      addToast('Settings Saved', 'Operational parameters updated.', 'success');
    } catch (err) {
      addToast('Error', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Operational Configuration & Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Configure organization profile, appointment cancellation limits, and queue alert thresholds.
        </p>
      </div>

      {/* Organization Profile Card */}
      <div className="ql-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <Building2 size={20} color="var(--primary)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Organization Information
          </h2>
        </div>

        <form onSubmit={handleSaveOrganization}>
          <div className="form-group">
            <label className="form-label">Organization Name</label>
            <input
              type="text"
              required
              className="form-input"
              value={orgData.name}
              onChange={e => setOrgData({ ...orgData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mission / Description</label>
            <textarea
              className="form-textarea"
              rows="2"
              value={orgData.description}
              onChange={e => setOrgData({ ...orgData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input
                type="email"
                className="form-input"
                value={orgData.contactEmail}
                onChange={e => setOrgData({ ...orgData, contactEmail: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                className="form-input"
                value={orgData.contactPhone}
                onChange={e => setOrgData({ ...orgData, contactPhone: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: '8px' }}>
            <Save size={16} /> Save Organization Info
          </button>
        </form>
      </div>

      {/* Operational Rules & Buffer Settings */}
      <div className="ql-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <Settings size={20} color="var(--primary)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Queue & Cancellation Rules
          </h2>
        </div>

        <form onSubmit={handleSaveOperationalSettings}>
          <div className="form-group">
            <label className="form-label">Cancellation Notice Window (minutes)</label>
            <input
              type="number"
              min="0"
              max="1440"
              className="form-input"
              value={settings.CANCELLATION_MINUTES_BEFORE}
              onChange={e => setSettings({ ...settings, CANCELLATION_MINUTES_BEFORE: e.target.value })}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Minutes before appointment start time after which cancellation is locked.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Auto-Call Turn Approaching Alert Buffer</label>
            <input
              type="number"
              min="1"
              max="10"
              className="form-input"
              value={settings.AUTO_CALL_BUFFER}
              onChange={e => setSettings({ ...settings, AUTO_CALL_BUFFER: e.target.value })}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              When a customer is this number of people ahead in line, an approaching alert toast & chime is triggered.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Max Daily Active Tokens per User</label>
            <input
              type="number"
              min="1"
              max="20"
              className="form-input"
              value={settings.MAX_DAILY_TOKENS_PER_USER}
              onChange={e => setSettings({ ...settings, MAX_DAILY_TOKENS_PER_USER: e.target.value })}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Prevents spam token generation from single users.
            </span>
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: '8px' }}>
            <Save size={16} /> Save Operational Rules
          </button>
        </form>
      </div>

    </div>
  );
};

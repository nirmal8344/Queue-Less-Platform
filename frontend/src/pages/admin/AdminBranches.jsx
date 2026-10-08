import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useNotifications } from '../../context/NotificationContext';
import { Building2, Plus, Edit2, Trash2, Calendar, Clock, MapPin, X, CheckCircle2 } from 'lucide-react';

export const AdminBranches = () => {
  const { addToast } = useNotifications();
  const [branches, setBranches] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  // Branch Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    openingTime: '09:00:00',
    closingTime: '17:00:00',
    workingDays: 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY',
    active: true
  });

  // Holiday Modal
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayDesc, setHolidayDesc] = useState('');
  const [holidayBranchId, setHolidayBranchId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bList, hList] = await Promise.all([
        api.getAllBranchesAdmin(),
        api.getSettings() // or holidays
      ]);
      setBranches(bList);
      // fetch public holidays
      const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';
      const hData = await fetch(`${apiBase}/public/holidays`).then(r => r.json()).catch(() => ({}));
      setHolidays(hData.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setFormData({
      name: '',
      code: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      openingTime: '09:00:00',
      closingTime: '17:00:00',
      workingDays: 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY',
      active: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code,
      address: branch.address,
      city: branch.city,
      phone: branch.phone,
      email: branch.email,
      openingTime: branch.openingTime,
      closingTime: branch.closingTime,
      workingDays: branch.workingDays,
      active: branch.active
    });
    setModalOpen(true);
  };

  const handleSubmitBranch = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await api.updateBranch(editingBranch.id, formData);
        addToast('Branch Updated', 'Branch details saved successfully.', 'success');
      } else {
        await api.createBranch({ ...formData, organizationId: 1 });
        addToast('Branch Created', 'New branch has been added.', 'success');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this branch?')) return;
    try {
      await api.deleteBranch(id);
      addToast('Branch Deactivated', 'Branch has been marked inactive.', 'info');
      fetchData();
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      await api.addHoliday({
        branchId: holidayBranchId ? Number(holidayBranchId) : null,
        holidayDate,
        description: holidayDesc
      });
      addToast('Holiday Added', 'Branch schedule updated.', 'success');
      setHolidayModalOpen(false);
      setHolidayDesc('');
      setHolidayDate('');
      fetchData();
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      await api.deleteHoliday(id);
      addToast('Holiday Deleted', 'Holiday removed from calendar.', 'info');
      fetchData();
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Branch & Location Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Configure organization physical branches, operational hours, working days, and holiday calendars.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setHolidayModalOpen(true)} className="btn btn-outline btn-sm">
            <Calendar size={14} /> Add Holiday
          </button>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <Plus size={16} /> Add Branch
          </button>
        </div>
      </div>

      {/* Branch Cards */}
      <div className="grid-2">
        {branches.map((b) => (
          <div key={b.id} className="ql-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{b.name}</h3>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '2px 8px', borderRadius: '4px' }}>
                      {b.code}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📍 {b.address}, {b.city}</span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleOpenEdit(b)} className="btn btn-outline btn-sm" style={{ padding: '6px' }}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDeleteBranch(b.id)} className="btn btn-danger btn-sm" style={{ padding: '6px' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--primary-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                marginTop: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '0.825rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Opening Hours</span>
                  <strong>{b.openingTime} - {b.closingTime}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Contact Phone</span>
                  <strong>{b.phone || 'N/A'}</strong>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Working Days</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{b.workingDays}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: b.active ? 'var(--status-completed)' : 'var(--status-danger)',
                backgroundColor: b.active ? 'var(--status-completed-bg)' : 'var(--status-danger-bg)',
                padding: '3px 8px',
                borderRadius: '9999px'
              }}>
                {b.active ? 'Active & Open' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Holidays Table */}
      <div className="ql-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Configured Holidays & Closures
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tokens and appointments cannot be booked on holidays</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--primary-subtle)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 18px', fontWeight: 700 }}>Date</th>
              <th style={{ padding: '12px 18px', fontWeight: 700 }}>Description</th>
              <th style={{ padding: '12px 18px', fontWeight: 700 }}>Applicable Branch</th>
              <th style={{ padding: '12px 18px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {holidays.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No holidays configured.
                </td>
              </tr>
            ) : (
              holidays.map(h => (
                <tr key={h.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {h.holidayDate}
                  </td>
                  <td style={{ padding: '12px 18px', color: 'var(--text-main)' }}>
                    {h.description}
                  </td>
                  <td style={{ padding: '12px 18px', color: 'var(--text-secondary)' }}>
                    {h.branchId ? `Branch #${h.branchId}` : 'All Branches (Universal)'}
                  </td>
                  <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                    <button onClick={() => handleDeleteHoliday(h.id)} className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Branch Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>
              {editingBranch ? 'Edit Branch' : 'Add New Branch'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Configure branch parameters and operating hours.
            </p>

            <form onSubmit={handleSubmitBranch}>
              <div className="form-group">
                <label className="form-label">Branch Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Metro Central Branch"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Branch Code</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. MC-01"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Metro City"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Physical Address</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="100 Civic Boulevard"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Opening Time</label>
                  <input
                    type="time"
                    required
                    step="1"
                    className="form-input"
                    value={formData.openingTime}
                    onChange={e => setFormData({ ...formData, openingTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Closing Time</label>
                  <input
                    type="time"
                    required
                    step="1"
                    className="form-input"
                    value={formData.closingTime}
                    onChange={e => setFormData({ ...formData, closingTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Working Days (comma separated)</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.workingDays}
                  onChange={e => setFormData({ ...formData, workingDays: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  {editingBranch ? 'Save Changes' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Holiday Modal */}
      {holidayModalOpen && (
        <div className="modal-overlay" onClick={() => setHolidayModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>Add Holiday Closure</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Prevent appointment bookings and tokens on holiday dates.
            </p>

            <form onSubmit={handleAddHoliday}>
              <div className="form-group">
                <label className="form-label">Holiday Date</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={holidayDate}
                  onChange={e => setHolidayDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. National Day / Maintenance"
                  value={holidayDesc}
                  onChange={e => setHolidayDesc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Branch Scope</label>
                <select
                  className="form-select"
                  value={holidayBranchId}
                  onChange={e => setHolidayBranchId(e.target.value)}
                >
                  <option value="">All Branches (Universal Closure)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setHolidayModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  Save Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

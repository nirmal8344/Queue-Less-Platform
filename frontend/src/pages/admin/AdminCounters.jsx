import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useNotifications } from '../../context/NotificationContext';
import { Plus, Edit2, Trash2, UserPlus, Check, X } from 'lucide-react';

export const AdminCounters = () => {
  const { addToast } = useNotifications();
  const [counters, setCounters] = useState([]);
  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCounter, setEditingCounter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    counterNumber: 1,
    locationInfo: '',
    branchId: '',
    status: 'OPEN',
    supportedServiceIds: []
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cList, bList, sList, uList] = await Promise.all([
        api.getAllCountersAdmin(selectedBranchId || null),
        api.getAllBranchesAdmin(),
        api.getAllServicesAdmin(selectedBranchId || null),
        api.getAllStaffAdmin()
      ]);
      setCounters(cList);
      setBranches(bList);
      setServices(sList);
      setStaffList(uList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBranchId]);

  const handleOpenAdd = () => {
    setEditingCounter(null);
    setFormData({
      name: '',
      counterNumber: counters.length + 1,
      locationInfo: '',
      branchId: branches.length > 0 ? branches[0].id : '',
      status: 'OPEN',
      supportedServiceIds: services.map(s => s.id)
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCounter(c);
    setFormData({
      name: c.name,
      counterNumber: c.counterNumber,
      locationInfo: c.locationInfo || '',
      branchId: c.branchId,
      status: c.status,
      supportedServiceIds: c.supportedServiceIds || []
    });
    setModalOpen(true);
  };

  const handleToggleService = (sId) => {
    setFormData(prev => {
      const exists = prev.supportedServiceIds.includes(sId);
      if (exists) {
        return { ...prev, supportedServiceIds: prev.supportedServiceIds.filter(id => id !== sId) };
      } else {
        return { ...prev, supportedServiceIds: [...prev.supportedServiceIds, sId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        branchId: Number(formData.branchId),
        counterNumber: Number(formData.counterNumber)
      };

      if (editingCounter) {
        await api.updateCounter(editingCounter.id, payload);
        addToast('Counter Updated', 'Counter configuration saved.', 'success');
      } else {
        await api.createCounter(payload);
        addToast('Counter Created', 'New service window configured.', 'success');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleAssignStaff = async (counterId, staffId) => {
    try {
      await api.assignStaffToCounter(counterId, staffId ? Number(staffId) : null);
      addToast('Staff Assigned', 'Counter operator updated.', 'success');
      fetchData();
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this counter window?')) return;
    try {
      await api.deleteCounter(id);
      addToast('Counter Deleted', 'Counter removed from branch.', 'info');
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
            Physical Counter Windows
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Configure multi-counter desks, assign service queues, and allocate staff operators.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            className="form-select"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            style={{ width: 'auto', padding: '8px 14px' }}
          >
            <option value="">All Branches</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <Plus size={16} /> Add Counter Desk
          </button>
        </div>
      </div>

      {/* Counter Cards */}
      <div className="grid-3">
        {counters.map((c) => (
          <div key={c.id} className="ql-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{c.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {c.branchName} • {c.locationInfo || 'Window desk'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => handleOpenEdit(c)} className="btn btn-outline btn-sm" style={{ padding: '6px' }}>
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="btn btn-danger btn-sm" style={{ padding: '6px' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Supported Services Pills */}
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Supported Services:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {c.supportedServiceNames?.length > 0 ? (
                    c.supportedServiceNames.map((sName, idx) => (
                      <span key={idx} style={{ fontSize: '0.75rem', backgroundColor: 'var(--primary-subtle)', color: 'var(--primary-dark)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                        {sName}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All branch services</span>
                  )}
                </div>
              </div>

              {/* Staff Assignment Selector */}
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Staff Member</label>
                <select
                  className="form-select"
                  value={c.assignedStaffId || ''}
                  onChange={(e) => handleAssignStaff(c.id, e.target.value)}
                  style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                >
                  <option value="">-- No Staff Assigned --</option>
                  {staffList.map(st => (
                    <option key={st.id} value={st.id}>{st.name} ({st.email})</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--primary-subtle)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8rem',
              marginTop: '12px'
            }}>
              <span>Status: <strong>{c.status}</strong></span>
              {c.currentTokenNumber && (
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  Serving: #{c.currentTokenNumber}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>
              {editingCounter ? 'Edit Counter' : 'Add Counter'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Configure window number and supported service capabilities.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Counter Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Counter 1 (Express Desk)"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Counter Number</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="form-input"
                    value={formData.counterNumber}
                    onChange={e => setFormData({ ...formData, counterNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Branch</label>
                  <select
                    className="form-select"
                    value={formData.branchId}
                    onChange={e => setFormData({ ...formData, branchId: e.target.value })}
                    required
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location / Room Details</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ground Floor, Window A"
                  value={formData.locationInfo}
                  onChange={e => setFormData({ ...formData, locationInfo: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Supported Services for this Counter</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                  {services.map(s => {
                    const checked = formData.supportedServiceIds.includes(s.id);
                    return (
                      <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleService(s.id)}
                        />
                        <span>{s.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  {editingCounter ? 'Save Changes' : 'Create Counter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

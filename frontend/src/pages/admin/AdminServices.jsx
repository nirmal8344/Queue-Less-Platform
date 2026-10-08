import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useNotifications } from '../../context/NotificationContext';
import { Plus, Edit2, Trash2, Power, Clock, Layers, CheckCircle2, X } from 'lucide-react';

export const AdminServices = () => {
  const { addToast } = useNotifications();
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    estimatedDurationMinutes: 15,
    maxDailyTokens: 100,
    branchId: '',
    active: true,
    allowPriority: true
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const [sList, bList] = await Promise.all([
        api.getAllServicesAdmin(selectedBranchId || null),
        api.getAllBranchesAdmin()
      ]);
      setServices(sList);
      setBranches(bList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [selectedBranchId]);

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      estimatedDurationMinutes: 15,
      maxDailyTokens: 100,
      branchId: branches.length > 0 ? branches[0].id : '',
      active: true,
      allowPriority: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setEditingService(s);
    setFormData({
      name: s.name,
      code: s.code || '',
      description: s.description || '',
      estimatedDurationMinutes: s.estimatedDurationMinutes,
      maxDailyTokens: s.maxDailyTokens,
      branchId: s.branchId || '',
      active: s.active,
      allowPriority: s.allowPriority
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        branchId: formData.branchId ? Number(formData.branchId) : null,
        estimatedDurationMinutes: Number(formData.estimatedDurationMinutes),
        maxDailyTokens: Number(formData.maxDailyTokens)
      };

      if (editingService) {
        await api.updateService(editingService.id, payload);
        addToast('Service Updated', 'Service settings saved.', 'success');
      } else {
        await api.createService(payload);
        addToast('Service Created', 'New service added to catalog.', 'success');
      }
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.toggleServiceStatus(id);
      addToast('Status Toggled', 'Service availability updated.', 'info');
      fetchServices();
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
            Service Catalog & Workflows
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Configure services, estimated turnaround times, daily token caps, and priority categories.
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
            <Plus size={16} /> Add Service
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid-3">
        {services.map((s) => (
          <div key={s.id} className="ql-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: s.active ? 1 : 0.65 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem'
                  }}>
                    {s.code || 'SRV'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>{s.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.branchName || 'Universal'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => handleOpenEdit(s)} className="btn btn-outline btn-sm" style={{ padding: '6px' }}>
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleToggleActive(s.id)} className={`btn btn-sm ${s.active ? 'btn-outline' : 'btn-primary'}`} style={{ padding: '6px' }} title={s.active ? 'Deactivate' : 'Activate'}>
                    <Power size={13} />
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '16px' }}>
                {s.description || 'General counter service'}
              </p>
            </div>

            <div style={{
              backgroundColor: 'var(--primary-subtle)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8rem'
            }}>
              <span>⏱ Est: <strong>~{s.estimatedDurationMinutes} mins</strong></span>
              <span style={{
                fontWeight: 700,
                color: s.active ? 'var(--status-completed)' : 'var(--status-danger)'
              }}>
                {s.active ? '● Active' : '✕ Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Define service turnaround time, branch mapping, and priority flags.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Service Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Document Verification & Issuance"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Code Prefix</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. DOC"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Duration (mins)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="180"
                    className="form-input"
                    value={formData.estimatedDurationMinutes}
                    onChange={e => setFormData({ ...formData, estimatedDurationMinutes: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Branch Association</label>
                <select
                  className="form-select"
                  value={formData.branchId}
                  onChange={e => setFormData({ ...formData, branchId: e.target.value })}
                >
                  <option value="">Universal (All Branches)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Service Description</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  {editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { StatusBadge } from '../../components/StatusBadge';
import { playAnnouncementChime } from '../../utils/audioChime';
import { Layers, Search, Filter, PhoneCall, RefreshCw, CheckCircle2, RotateCcw } from 'lucide-react';

export const StaffCurrentQueue = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [branchId, setBranchId] = useState(user?.assignedBranchId || 1);
  const [branches, setBranches] = useState([]);
  const [counters, setCounters] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [queueTokens, setQueueTokens] = useState([]);
  
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCounterId, setSelectedCounterId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const [bList, qList, cList, sList] = await Promise.all([
        api.getBranches().catch(() => []),
        api.getStaffQueue(branchId).catch(() => []),
        api.getCounters(branchId).catch(() => []),
        api.getAllStaffAdmin().catch(() => [])
      ]);
      setBranches(bList || []);
      setQueueTokens(qList || []);
      setCounters(cList || []);
      setStaffList(sList || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.assignedBranchId && user.assignedBranchId !== branchId) {
      setBranchId(user.assignedBranchId);
    }
  }, [user]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [branchId]);

  const handleCallToken = async (tokenId) => {
    try {
      const counterId = user?.assignedCounterId || 1;
      await api.callSpecificToken(tokenId, counterId);
      playAnnouncementChime();
      addToast('Customer Called', 'Token assigned to counter.', 'TOKEN_CALLED');
      fetchQueue();
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleRecallToken = async (tokenId) => {
    try {
      await api.recallToken(tokenId);
      playAnnouncementChime();
      addToast('Token Recalled', 'Announcement broadcast.', 'TOKEN_CALLED');
      fetchQueue();
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  const filteredTokens = queueTokens.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesCounter = !selectedCounterId || (t.counterId && String(t.counterId) === String(selectedCounterId));
    const matchesStaff = !selectedStaffId || (t.staffId && String(t.staffId) === String(selectedStaffId));
    const matchesSearch = !searchTerm ||
      t.tokenNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.counterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.staffName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCounter && matchesStaff && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Full Queue Monitor
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Real-time branch queue table with priority categories and customer tokens.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            className="form-select"
            value={branchId}
            onChange={(e) => setBranchId(Number(e.target.value))}
            style={{ width: 'auto', padding: '8px 14px' }}
          >
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <button onClick={fetchQueue} className="btn btn-outline btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: 'var(--surface)',
        padding: '14px 18px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['ALL', 'WAITING', 'CALLED', 'IN_SERVICE', 'PAUSED', 'SKIPPED', 'COMPLETED', 'NO_SHOW'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                {status === 'IN_SERVICE' ? 'IN SERVICE' : status === 'NO_SHOW' ? 'NO SHOW' : status}
              </button>
            ))}
          </div>

          <div className="input-with-icon" style={{ maxWidth: '280px', flex: 1 }}>
            <Search size={16} className="input-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search token, staff, counter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px 12px 8px 38px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Filter by Counter</label>
            <select
              className="form-select"
              value={selectedCounterId}
              onChange={(e) => setSelectedCounterId(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '0.85rem' }}
            >
              <option value="">All Counters</option>
              {counters.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Filter by Staff</label>
            <select
              className="form-select"
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '0.85rem' }}
            >
              <option value="">All Staff Members</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="ql-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive" style={{ border: 'none', margin: 0, borderRadius: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--primary-subtle)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Token</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Customer</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Service</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Priority</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Counter</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTokens.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No tokens matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredTokens.map((tok) => (
                <tr key={tok.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--primary)', fontSize: '1.05rem' }}>
                    {tok.tokenNumber}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{tok.customerName || 'Walk-in'}</div>
                    {tok.customerPhone && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tok.customerPhone}</div>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-main)' }}>
                    {tok.serviceName}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {tok.priorityCategory !== 'GENERAL' ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'var(--status-priority-bg)', color: 'var(--status-priority)', padding: '3px 8px', borderRadius: '4px' }}>
                        {tok.priorityDisplayName}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>General</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {tok.counterName || '-'}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <StatusBadge status={tok.status} />
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    {tok.status === 'WAITING' && (
                      <button
                        onClick={() => handleCallToken(tok.id)}
                        className="btn btn-primary btn-sm"
                      >
                        <PhoneCall size={14} /> Call
                      </button>
                    )}
                    {tok.status === 'SKIPPED' && (
                      <button
                        onClick={() => handleRecallToken(tok.id)}
                        className="btn btn-outline btn-sm"
                      >
                        <RotateCcw size={14} /> Recall
                      </button>
                    )}
                    {tok.status === 'CALLED' && (
                      <button
                        onClick={() => handleRecallToken(tok.id)}
                        className="btn btn-outline btn-sm"
                      >
                        <PhoneCall size={14} /> Announce
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

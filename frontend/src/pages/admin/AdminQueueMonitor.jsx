import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { StatusBadge } from '../../components/StatusBadge';
import { useNotifications } from '../../context/NotificationContext';
import { Layers, Activity, History, Search, RefreshCw, Eye, X } from 'lucide-react';

export const AdminQueueMonitor = () => {
  const { addToast } = useNotifications();
  const [tokens, setTokens] = useState([]);
  const [branches, setBranches] = useState([]);
  const [counters, setCounters] = useState([]);
  const [staffList, setStaffList] = useState([]);
  
  const [selectedBranchId, setSelectedBranchId] = useState(1);
  const [selectedCounterId, setSelectedCounterId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedTokenLogs, setSelectedTokenLogs] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQueueData = async () => {
    try {
      const [bList, qList, logs, cList, sList] = await Promise.all([
        api.getAllBranchesAdmin(),
        api.getAllQueueAdmin(selectedBranchId),
        api.getAllAuditLogsAdmin(),
        api.getAllCountersAdmin(selectedBranchId),
        api.getAllStaffAdmin()
      ]);
      setBranches(bList);
      setTokens(qList);
      setAuditLogs(logs);
      setCounters(cList);
      setStaffList(sList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 5000);
    return () => clearInterval(interval);
  }, [selectedBranchId]);

  const handleInspectAudit = async (tokenId) => {
    try {
      const logs = await api.getTokenAuditLogs(tokenId);
      setSelectedTokenLogs({ tokenId, logs });
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  const filteredTokens = tokens.filter((tok) => {
    const matchesCounter = !selectedCounterId || (tok.counterId && String(tok.counterId) === String(selectedCounterId));
    const matchesStaff = !selectedStaffId || (tok.staffId && String(tok.staffId) === String(selectedStaffId));
    const matchesSearch = !searchTerm ||
      tok.tokenNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tok.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tok.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tok.counterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tok.staffName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCounter && matchesStaff && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Live Queue & Audit Trails
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Track token state transitions, queue priority rules, and compliance audit logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            className="form-select"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(Number(e.target.value))}
            style={{ width: 'auto', padding: '8px 14px' }}
          >
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <button onClick={fetchQueueData} className="btn btn-outline btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        backgroundColor: 'var(--surface)',
        padding: '14px 18px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)'
      }}>
        <div>
          <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Counter Desk</label>
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
          <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Staff Member</label>
          <select
            className="form-select"
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.85rem' }}
          >
            <option value="">All Staff</option>
            {staffList.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Search Tokens / Names</label>
          <div className="input-with-icon">
            <Search size={15} className="input-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search token, staff, counter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '6px 10px 6px 36px', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="ql-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Active & Waiting Queue Tokens ({filteredTokens.length})
          </h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--primary-subtle)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Token</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Customer</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Service</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Priority</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Counter & Staff</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Current Status</th>
              <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>Audit Logs</th>
            </tr>
          </thead>
          <tbody>
            {filteredTokens.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No active tokens in this branch queue matching criteria.
                </td>
              </tr>
            ) : (
              filteredTokens.map(tok => (
                <tr key={tok.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--primary)' }}>
                    {tok.tokenNumber}
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 600 }}>
                    {tok.customerName || 'Walk-in'}
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-main)' }}>
                    {tok.serviceName}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {tok.priorityCategory !== 'GENERAL' ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'var(--status-priority-bg)', color: 'var(--status-priority)', padding: '2px 8px', borderRadius: '4px' }}>
                        {tok.priorityDisplayName}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>General</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-main)' }}>
                    {tok.counterName ? `${tok.counterName}${tok.staffName ? ` (${tok.staffName})` : ''}` : '-'}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <StatusBadge status={tok.status} />
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleInspectAudit(tok.id)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    >
                      <Eye size={13} /> View Audit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Global State Transition Audit Feed */}
      <div className="ql-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>
          Real-Time Audit Event Log
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
          {auditLogs.slice(0, 15).map(log => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                backgroundColor: 'var(--primary-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.825rem'
              }}
            >
              <div>
                <strong style={{ color: 'var(--primary-dark)' }}>Token {log.tokenId}</strong>:
                <span style={{ margin: '0 6px', color: 'var(--text-muted)' }}>
                  {log.previousStatus ? log.previousStatus : 'ISSUED'} → <strong>{log.newStatus}</strong>
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>• {log.remarks}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {log.changedByName} ({log.changedByRole}) • {new Date(log.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Single Token Audit Modal */}
      {selectedTokenLogs && (
        <div className="modal-overlay" onClick={() => setSelectedTokenLogs(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Audit History for Token {selectedTokenLogs.tokenId}</h3>
              <button onClick={() => setSelectedTokenLogs(null)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedTokenLogs.logs.map(l => (
                <div key={l.id} style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '12px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    {l.previousStatus || 'NEW'} → {l.newStatus}
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{l.remarks}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Action by: {l.changedByName} ({l.changedByRole}) at {new Date(l.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

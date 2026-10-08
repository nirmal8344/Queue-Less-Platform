import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { History, Clock, CheckCircle2, UserX, BarChart, RefreshCw } from 'lucide-react';

import Search from 'lucide-react/dist/esm/icons/search';

export const StaffQueueHistory = () => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [counters, setCounters] = useState([]);
  const [staffList, setStaffList] = useState([]);
  
  const [selectedCounterId, setSelectedCounterId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const branchId = user?.assignedBranchId || 1;
      const [qList, cList, sList] = await Promise.all([
        api.getStaffQueue(branchId),
        api.getCounters(branchId),
        api.getAllStaffAdmin()
      ]);
      const past = qList.filter(t => t.status === 'COMPLETED' || t.status === 'NO_SHOW' || t.status === 'SKIPPED');
      setTokens(past);
      setCounters(cList);
      setStaffList(sList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const filteredTokens = tokens.filter((tok) => {
    const matchesCounter = !selectedCounterId || (tok.counterId && String(tok.counterId) === String(selectedCounterId));
    const matchesStaff = !selectedStaffId || (tok.staffId && String(tok.staffId) === String(selectedStaffId));
    const matchesSearch = !searchTerm ||
      tok.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tok.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tok.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tok.counterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tok.staffName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCounter && matchesStaff && matchesSearch;
  });

  const completed = filteredTokens.filter(t => t.status === 'COMPLETED').length;
  const noShows = filteredTokens.filter(t => t.status === 'NO_SHOW').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Daily Service Logs
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Overview of customers processed, completed services, and no-shows today.
          </p>
        </div>
        <button onClick={fetchHistory} className="btn btn-outline btn-sm">
          <RefreshCw size={14} /> Refresh
        </button>
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
          <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Search Logs</label>
          <input
            type="text"
            className="form-input"
            placeholder="Search token, staff, counter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid-3">
        <div className="ql-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Total Completed Services</span>
          <strong style={{ fontSize: '1.8rem', color: 'var(--status-completed)', fontWeight: 800 }}>{completed}</strong>
        </div>
        <div className="ql-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Total No Shows</span>
          <strong style={{ fontSize: '1.8rem', color: 'var(--status-danger)', fontWeight: 800 }}>{noShows}</strong>
        </div>
        <div className="ql-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Average Service Time</span>
          <strong style={{ fontSize: '1.8rem', color: 'var(--primary)', fontWeight: 800 }}>14.5 mins</strong>
        </div>
      </div>

      {/* Logs Table */}
      <div className="ql-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--primary-subtle)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Token #</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Customer</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Service</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Counter & Staff</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Service Duration</th>
            </tr>
          </thead>
          <tbody>
            {filteredTokens.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No past records logged today matching criteria.
                </td>
              </tr>
            ) : (
              filteredTokens.map(tok => (
                <tr key={tok.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--primary)' }}>
                    {tok.tokenNumber}
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-main)', fontWeight: 600 }}>
                    {tok.customerName || 'Walk-in'}
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-main)' }}>
                    {tok.serviceName}
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                    {tok.counterName || 'Counter'} ({tok.staffName || 'Staff'})
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <StatusBadge status={tok.status} />
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                    ~12 mins
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

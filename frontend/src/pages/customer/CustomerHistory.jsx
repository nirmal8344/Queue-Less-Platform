import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { History, Calendar, Clock, Ticket, Search, Filter, RefreshCw } from 'lucide-react';

export const CustomerHistory = () => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('tokens');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [toks, apts] = await Promise.all([
        api.getMyTokens(),
        api.getMyAppointments()
      ]);
      setTokens(toks);
      setAppointments(apts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const filteredTokens = tokens.filter(t => 
    t.tokenNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.branchName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAppointments = appointments.filter(a =>
    a.referenceCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.branchName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            My Activity History
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Complete audit trail of all your queue tokens and appointments.
          </p>
        </div>
        <button onClick={fetchHistory} className="btn btn-outline btn-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div className="ql-tabs" style={{ marginBottom: 0 }}>
          <button 
            className={`ql-tab ${activeTab === 'tokens' ? 'active' : ''}`}
            onClick={() => setActiveTab('tokens')}
          >
            <Ticket size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Queue Tokens ({tokens.length})
          </button>
          <button 
            className={`ql-tab ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <Calendar size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Appointments ({appointments.length})
          </button>
        </div>

        <div className="input-with-icon" style={{ maxWidth: '280px' }}>
          <Search size={16} className="input-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 12px 8px 38px' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading your history records...
        </div>
      ) : activeTab === 'tokens' ? (
        filteredTokens.length === 0 ? (
          <div className="ql-card" style={{ textAlign: 'center', padding: '40px' }}>
            No tokens found in your history.
          </div>
        ) : (
          <div className="ql-card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--primary-subtle)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Token #</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Service</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Branch</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Issued Time</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Counter</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTokens.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--primary)' }}>
                      {t.tokenNumber}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-main)' }}>
                      {t.serviceName}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                      {t.branchName}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                      {t.issueTime ? new Date(t.issueTime).toLocaleString() : '-'}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-main)', fontWeight: 600 }}>
                      {t.counterName || '-'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        filteredAppointments.length === 0 ? (
          <div className="ql-card" style={{ textAlign: 'center', padding: '40px' }}>
            No appointments found in your history.
          </div>
        ) : (
          <div className="ql-card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--primary-subtle)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Reference</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Service</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Branch</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Date & Time</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {a.referenceCode}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-main)' }}>
                      {a.serviceName}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                      {a.branchName}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                      {a.appointmentDate} at {a.appointmentTime}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

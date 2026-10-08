import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useNotifications } from '../../context/NotificationContext';
import { BarChart3, Download, RefreshCw, Calendar, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';

export const AdminAnalytics = () => {
  const { addToast } = useNotifications();
  const [analytics, setAnalytics] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [aData, bList] = await Promise.all([
        api.getAnalyticsSummary(selectedBranchId || null),
        api.getAllBranchesAdmin()
      ]);
      setAnalytics(aData);
      setBranches(bList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedBranchId]);

  const handleExportCSV = () => {
    if (!analytics) return;
    const headers = 'Metric,Value\n';
    const rows = [
      `Total Customers Today,${analytics.totalCustomersToday}`,
      `Appointments Today,${analytics.appointmentsToday}`,
      `Walk-ins Today,${analytics.walkInsToday}`,
      `Waiting Count,${analytics.waitingCount}`,
      `Completed Services,${analytics.completedCount}`,
      `No-Show Count,${analytics.noShowCount}`,
      `No-Show Percentage,${analytics.noShowPercentage}%`,
      `Average Wait Time (mins),${analytics.averageWaitTimeMinutes}`,
      `Average Service Time (mins),${analytics.averageServiceTimeMinutes}`,
    ].join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `queueless_analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Report Exported', 'Analytics report downloaded as CSV.', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Analytics & Operations Reports
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Comprehensive performance metrics, historical throughput, and CSV data exports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            className="form-select"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            style={{ width: 'auto', padding: '8px 14px' }}
          >
            <option value="">All Organization Branches</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <button onClick={handleExportCSV} className="btn btn-primary btn-sm">
            <Download size={15} /> Export CSV Report
          </button>
        </div>
      </div>

      {/* Metrics Summary Table */}
      <div className="ql-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Key Performance Indicators Breakdown
          </h3>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--primary-subtle)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Operational Dimension</th>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Current Value</th>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Benchmark Target</th>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <td style={{ padding: '14px 20px', fontWeight: 600 }}>Average Waiting Time</td>
              <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--primary)' }}>
                {analytics?.averageWaitTimeMinutes || 0} minutes
              </td>
              <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>&lt; 15.0 mins</td>
              <td style={{ padding: '14px 20px', color: 'var(--status-completed)', fontWeight: 700 }}>Optimal</td>
            </tr>

            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <td style={{ padding: '14px 20px', fontWeight: 600 }}>Average Service Time</td>
              <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--primary-dark)' }}>
                {analytics?.averageServiceTimeMinutes || 0} minutes
              </td>
              <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>&lt; 20.0 mins</td>
              <td style={{ padding: '14px 20px', color: 'var(--status-completed)', fontWeight: 700 }}>Optimal</td>
            </tr>

            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <td style={{ padding: '14px 20px', fontWeight: 600 }}>No-Show Percentage</td>
              <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--status-danger)' }}>
                {analytics?.noShowPercentage || 0}%
              </td>
              <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>&lt; 5.0%</td>
              <td style={{ padding: '14px 20px', color: (analytics?.noShowPercentage || 0) > 5 ? 'var(--status-danger)' : 'var(--status-completed)', fontWeight: 700 }}>
                {(analytics?.noShowPercentage || 0) > 5 ? 'Needs Attention' : 'Healthy'}
              </td>
            </tr>

            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <td style={{ padding: '14px 20px', fontWeight: 600 }}>Total Handled Today</td>
              <td style={{ padding: '14px 20px', fontWeight: 700 }}>
                {analytics?.totalCustomersToday || 0} customers
              </td>
              <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>100+ daily capacity</td>
              <td style={{ padding: '14px 20px', color: 'var(--primary)', fontWeight: 700 }}>On Track</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};

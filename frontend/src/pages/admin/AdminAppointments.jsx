import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { StatusBadge } from '../../components/StatusBadge';
import { useNotifications } from '../../context/NotificationContext';
import { Calendar, Search, Filter, RefreshCw, XCircle, RotateCcw } from 'lucide-react';

export const AdminAppointments = () => {
  const { addToast } = useNotifications();
  const [appointments, setAppointments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [counters, setCounters] = useState([]);
  const [staffList, setStaffList] = useState([]);
  
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedCounterId, setSelectedCounterId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const [aptList, bList, sList, cList, stList] = await Promise.all([
        api.getAllAppointmentsAdmin(selectedBranchId || null, selectedDate || null),
        api.getAllBranchesAdmin(),
        api.getAllServicesAdmin(),
        api.getAllCountersAdmin(selectedBranchId || null),
        api.getAllStaffAdmin()
      ]);
      setAppointments(aptList);
      setBranches(bList);
      setServices(sList);
      setCounters(cList);
      setStaffList(stList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedBranchId, selectedDate]);

  const handleAdminCancel = async (aptId) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.cancelAppointment(aptId, 'Cancelled by administrator');
      addToast('Cancelled', 'Appointment cancelled successfully.', 'info');
      fetchAppointments();
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    const matchesService = !selectedServiceId || a.serviceId === Number(selectedServiceId);
    const matchesStatus = selectedStatus === 'ALL' || a.status === selectedStatus;
    const matchesCounter = !selectedCounterId || (a.counterId && String(a.counterId) === String(selectedCounterId));
    const matchesStaff = !selectedStaffId || (a.staffId && String(a.staffId) === String(selectedStaffId));
    const matchesSearch = 
      a.referenceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.serviceName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesService && matchesStatus && matchesCounter && matchesStaff && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Appointments Oversight
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Search, filter, and audit scheduled appointments across all organization facilities.
          </p>
        </div>

        <button onClick={fetchAppointments} className="btn btn-outline btn-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        padding: '16px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px'
      }}>
        <div>
          <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Branch</label>
          <select
            className="form-select"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.85rem' }}
          >
            <option value="">All Branches</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Service</label>
          <select
            className="form-select"
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.85rem' }}
          >
            <option value="">All Services</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

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
            {staffList.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</label>
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.85rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="WAITING">Waiting / Checked In</option>
            <option value="IN_SERVICE">In Service</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>
        </div>

        <div>
          <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date</label>
          <input
            type="date"
            className="form-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Search</label>
          <input
            type="text"
            className="form-input"
            placeholder="Search code/name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="ql-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--primary-subtle)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Reference</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Customer</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Service</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Branch</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Date & Slot</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No appointments found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredAppointments.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {a.referenceCode}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600 }}>{a.customerName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.customerPhone || a.customerEmail}</div>
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-main)' }}>
                    {a.serviceName}
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                    {a.branchName}
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-main)' }}>
                    {a.appointmentDate} at {a.appointmentTime}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <StatusBadge status={a.status} />
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    {a.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleAdminCancel(a.id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 8px' }}
                      >
                        Cancel
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
  );
};

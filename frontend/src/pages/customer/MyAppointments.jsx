import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CalendarDays, 
  RotateCcw, 
  XCircle, 
  CheckCircle2, 
  AlertCircle, 
  Ticket,
  Plus,
  RefreshCw
} from 'lucide-react';

export const MyAppointments = ({ setCurrentView }) => {
  const { user, refreshActiveToken } = useAuth();
  const { addToast } = useNotifications();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reschedule modal
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [rescheduling, setRescheduling] = useState(false);

  // Cancel modal
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await api.getMyAppointments();
      setAppointments(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  // Load slots when reschedule date changes
  useEffect(() => {
    if (rescheduleModal && newDate) {
      api.getAvailableSlots(rescheduleModal.branchId, rescheduleModal.serviceId, newDate)
        .then((slots) => {
          setAvailableSlots(slots);
          if (slots.length > 0) setNewTime(slots[0]);
        })
        .catch(() => setAvailableSlots([]));
    }
  }, [rescheduleModal, newDate]);

  const handleCheckIn = async (appointment) => {
    try {
      const token = await api.checkInAppointment(appointment.id);
      await refreshActiveToken();
      addToast('Checked In!', `Token ${token.tokenNumber} has been generated.`, 'TOKEN_GENERATED');
      fetchAppointments();
      setCurrentView('my-queue');
    } catch (err) {
      addToast('Check-In Failed', err.message, 'error');
    }
  };

  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!newDate || !newTime) return;
    setRescheduling(true);
    try {
      await api.rescheduleAppointment(rescheduleModal.id, {
        newDate,
        newTime,
        reason: 'Customer requested reschedule'
      });
      addToast('Rescheduled', 'Your appointment was successfully rescheduled.', 'APPOINTMENT_RESCHEDULED');
      setRescheduleModal(null);
      fetchAppointments();
    } catch (err) {
      addToast('Error', err.message, 'error');
    } finally {
      setRescheduling(false);
    }
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    setCancelling(true);
    try {
      await api.cancelAppointment(cancelModal.id, cancelReason);
      addToast('Cancelled', 'Your appointment has been cancelled.', 'APPOINTMENT_CANCELLED');
      setCancelModal(null);
      fetchAppointments();
    } catch (err) {
      addToast('Error', err.message, 'error');
    } finally {
      setCancelling(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            My Scheduled Appointments
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Manage upcoming bookings, reschedule, or check-in when you arrive at the branch.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchAppointments} className="btn btn-outline btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setCurrentView('book-appointment')} className="btn btn-primary btn-sm">
            <Plus size={16} /> Book New Appointment
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading your appointments...
        </div>
      ) : appointments.length === 0 ? (
        <div className="ql-card" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '500px', margin: '20px auto' }}>
          <CalendarDays size={48} color="var(--primary)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>No Appointments Found</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            You haven't scheduled any appointments yet. Book a slot to save waiting time.
          </p>
          <button onClick={() => setCurrentView('book-appointment')} className="btn btn-primary">
            Book an Appointment Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {appointments.map((apt) => {
            const isToday = apt.appointmentDate === todayStr;
            const canCheckIn = (apt.status === 'CONFIRMED' || apt.status === 'SCHEDULED');
            const canModify = (apt.status === 'CONFIRMED' || apt.status === 'SCHEDULED');

            return (
              <div 
                key={apt.id} 
                className="ql-card ql-card-hover"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  borderLeft: isToday ? '4px solid var(--primary)' : '1px solid var(--border)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>
                      {apt.referenceCode}
                    </strong>
                    <StatusBadge status={apt.status} />
                    {isToday && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '2px 8px', borderRadius: '4px' }}>
                        TODAY
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-dark)' }}>
                    {apt.serviceName} (~{apt.estimatedDurationMinutes} mins)
                  </div>

                  <div style={{ display: 'flex', gap: '18px', marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> {apt.appointmentDate} at {apt.appointmentTime}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {apt.branchName}
                    </span>
                  </div>

                  {apt.notes && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Note: {apt.notes}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {canCheckIn && (
                    <button
                      onClick={() => handleCheckIn(apt)}
                      className="btn btn-primary btn-sm"
                    >
                      <Ticket size={14} /> Check In / Get Token
                    </button>
                  )}
                  {canModify && (
                    <>
                      <button
                        onClick={() => {
                          setRescheduleModal(apt);
                          setNewDate(apt.appointmentDate);
                        }}
                        className="btn btn-outline btn-sm"
                      >
                        <RotateCcw size={14} /> Reschedule
                      </button>
                      <button
                        onClick={() => {
                          setCancelModal(apt);
                          setCancelReason('');
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--status-danger)' }}
                      >
                        <XCircle size={14} /> Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="modal-overlay" onClick={() => setRescheduleModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px' }}>Reschedule Appointment</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Reference: {rescheduleModal.referenceCode} ({rescheduleModal.serviceName})
            </p>

            <form onSubmit={handleConfirmReschedule}>
              <div className="form-group">
                <label className="form-label">Select New Date</label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  className="form-input"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Select New Available Slot</label>
                {availableSlots.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '10px 0' }}>
                    No slots available on this date.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {availableSlots.map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setNewTime(slot)}
                        style={{
                          padding: '8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '2px solid',
                          borderColor: newTime === slot ? 'var(--primary)' : 'var(--border)',
                          backgroundColor: newTime === slot ? 'var(--primary)' : 'var(--surface)',
                          color: newTime === slot ? '#fff' : 'var(--text-main)',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button type="button" onClick={() => setRescheduleModal(null)} className="btn btn-outline" style={{ flex: 1 }}>
                  Close
                </button>
                <button type="submit" disabled={rescheduling || !newTime} className="btn btn-primary" style={{ flex: 2 }}>
                  {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="modal-overlay" onClick={() => setCancelModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--status-danger)', marginBottom: '4px' }}>
              Cancel Appointment
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Are you sure you want to cancel appointment {cancelModal.referenceCode}?
            </p>

            <form onSubmit={handleConfirmCancel}>
              <div className="form-group">
                <label className="form-label">Reason for cancellation (optional)</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="e.g. Schedule conflict or changed plans"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setCancelModal(null)} className="btn btn-outline" style={{ flex: 1 }}>
                  Keep Appointment
                </button>
                <button type="submit" disabled={cancelling} className="btn btn-danger" style={{ flex: 1 }}>
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

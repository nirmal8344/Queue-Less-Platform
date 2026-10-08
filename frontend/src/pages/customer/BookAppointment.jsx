import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Building2, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle,
  FileText,
  User,
  Phone,
  Mail,
  Ticket
} from 'lucide-react';

export const BookAppointment = ({ setCurrentView, preselectedBranchId, preselectedServiceId }) => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Stepper state (1: Branch & Service, 2: Date & Slot, 3: Details & Confirmation, 4: Success)
  const [step, setStep] = useState(1);

  const [branchId, setBranchId] = useState(preselectedBranchId || '');
  const [serviceId, setServiceId] = useState(preselectedServiceId || '');
  
  // Default to tomorrow or today's date formatted yyyy-MM-dd
  const getInitialDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getInitialDate());
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  // Guest / User info fields
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');

  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Load branches
  useEffect(() => {
    api.getBranches().then((data) => {
      setBranches(data);
      if (!branchId && data.length > 0) {
        setBranchId(data[0].id);
      }
    }).catch(console.error);
  }, []);

  // Load services when branch changes
  useEffect(() => {
    if (branchId) {
      api.getServices(branchId).then((data) => {
        setServices(data);
        if (data.length > 0) {
          if (!preselectedServiceId || !data.find(s => s.id === Number(preselectedServiceId))) {
            setServiceId(data[0].id);
          } else {
            setServiceId(preselectedServiceId);
          }
        }
      }).catch(console.error);
    }
  }, [branchId, preselectedServiceId]);

  // Load available time slots when branch, service, or date changes
  useEffect(() => {
    if (branchId && serviceId && selectedDate) {
      setSlotsLoading(true);
      setSelectedTime('');
      api.getAvailableSlots(branchId, serviceId, selectedDate)
        .then((slots) => {
          setAvailableSlots(slots);
          if (slots.length > 0) {
            setSelectedTime(slots[0]);
          }
        })
        .catch(() => setAvailableSlots([]))
        .finally(() => setSlotsLoading(false));
    }
  }, [branchId, serviceId, selectedDate]);

  const selectedBranch = branches.find((b) => b.id === Number(branchId));
  const selectedService = services.find((s) => s.id === Number(serviceId));

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedTime) {
      setError('Please select an available time slot.');
      return;
    }

    if (!user) {
      // Prompt user to login or redirect
      setCurrentView('login');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        branchId: Number(branchId),
        serviceId: Number(serviceId),
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        notes,
        customerName: user ? user.name : customerName,
        customerEmail: user ? user.email : customerEmail,
        customerPhone: user ? user.phone : customerPhone
      };

      const booking = await api.bookAppointment(payload);
      setConfirmedBooking(booking);
      setStep(4);
      addToast('Appointment Booked!', `Reference: ${booking.referenceCode}`, 'APPOINTMENT_CONFIRMED');
    } catch (err) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => new Date().toISOString().split('T')[0];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Back Button */}
      <button 
        onClick={() => setCurrentView('customer-home')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      {/* Progress Steps Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--surface)',
        padding: '20px 28px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)'
      }}>
        {[
          { num: 1, title: 'Branch & Service' },
          { num: 2, title: 'Date & Time' },
          { num: 3, title: 'Confirmation' },
        ].map((s) => (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: step >= s.num ? 'var(--primary)' : 'var(--border)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              {step > s.num ? '✓' : s.num}
            </div>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: step === s.num ? 700 : 500,
              color: step >= s.num ? 'var(--text-main)' : 'var(--text-muted)'
            }}>
              {s.title}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          backgroundColor: 'var(--status-danger-bg)',
          color: 'var(--status-danger)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Branch & Service Selection */}
      {step === 1 && (
        <div className="ql-card">
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
            Select Organization Branch & Service
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Choose where you would like to be served and what service you require.
          </p>

          <div className="form-group">
            <label className="form-label">Select Branch</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {branches.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setBranchId(b.id)}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid',
                    borderColor: Number(branchId) === b.id ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: Number(branchId) === b.id ? 'var(--primary-subtle)' : 'var(--surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-main)', display: 'block' }}>{b.name}</strong>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>📍 {b.address}, {b.city}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      Hours: {b.openingTime} - {b.closingTime}
                    </span>
                  </div>
                  {Number(branchId) === b.id && <CheckCircle2 color="var(--primary)" size={22} />}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '24px' }}>
            <label className="form-label">Select Service</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {services.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setServiceId(s.id)}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid',
                    borderColor: Number(serviceId) === s.id ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: Number(serviceId) === s.id ? 'var(--primary-subtle)' : 'var(--surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{s.name}</strong>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '2px 8px', borderRadius: '9999px' }}>
                        ~{s.estimatedDurationMinutes} mins
                      </span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {s.description || 'Standard appointment slot'}
                    </p>
                  </div>
                  {Number(serviceId) === s.id && <CheckCircle2 color="var(--primary)" size={22} />}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button
              onClick={() => {
                if (!branchId || !serviceId) {
                  setError('Please select both a branch and a service.');
                  return;
                }
                setError('');
                setStep(2);
              }}
              className="btn btn-primary btn-lg"
            >
              Continue to Date & Time <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Date & Available Slot Selection */}
      {step === 2 && (
        <div className="ql-card">
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
            Choose Date & Time Slot
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {selectedService?.name} at {selectedBranch?.name}
          </p>

          <div className="form-group">
            <label className="form-label">Appointment Date</label>
            <input
              type="date"
              className="form-input"
              min={getMinDate()}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
          </div>

          <div className="form-group" style={{ marginTop: '24px' }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Available Time Slots</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {slotsLoading ? 'Checking availability...' : `${availableSlots.length} slots available`}
              </span>
            </label>

            {slotsLoading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading real-time open slots...
              </div>
            ) : availableSlots.length === 0 ? (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                backgroundColor: 'var(--primary-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)'
              }}>
                No open slots available for this date. Please try selecting another date or service.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '10px',
                marginTop: '10px'
              }}>
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    style={{
                      padding: '12px 8px',
                      borderRadius: 'var(--radius-md)',
                      border: '2px solid',
                      borderColor: selectedTime === slot ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: selectedTime === slot ? 'var(--primary)' : 'var(--surface)',
                      color: selectedTime === slot ? '#fff' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textAlign: 'center'
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
            <button onClick={() => setStep(1)} className="btn btn-outline btn-lg">
              <ArrowLeft size={18} /> Back
            </button>
            <button
              onClick={() => {
                if (!selectedTime) {
                  setError('Please select a time slot.');
                  return;
                }
                setError('');
                setStep(3);
              }}
              disabled={!selectedTime}
              className="btn btn-primary btn-lg"
            >
              Continue to Confirmation <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Details & Confirmation */}
      {step === 3 && (
        <div className="ql-card">
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
            Review & Confirm Appointment
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Please review the details below before submitting your reservation.
          </p>

          {/* Summary Box */}
          <div style={{
            backgroundColor: 'var(--primary-subtle)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Branch:</span>
              <strong style={{ color: 'var(--text-main)' }}>{selectedBranch?.name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Service:</span>
              <strong style={{ color: 'var(--text-main)' }}>{selectedService?.name} (~{selectedService?.estimatedDurationMinutes} mins)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Date & Time:</span>
              <strong style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>{selectedDate} at {selectedTime}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Location:</span>
              <span style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{selectedBranch?.address}</span>
            </div>
          </div>

          <form onSubmit={handleBookingSubmit}>
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={user ? user.name : customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                readOnly={!!user}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number for Reminders</label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. +1 (555) 019-2834"
                value={user?.phone || customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Special Notes or Requirements (optional)</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Add any specific inquiries or accessibility requests..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {!user && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'var(--status-called-bg)',
                borderRadius: 'var(--radius-md)',
                color: '#92400E',
                fontSize: '0.85rem',
                marginBottom: '20px'
              }}>
                💡 You are booking as a guest. <span onClick={() => setCurrentView('login')} style={{ fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}>Sign in</span> to view and manage appointments directly in your account dashboard.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button type="button" onClick={() => setStep(2)} className="btn btn-outline btn-lg">
                <ArrowLeft size={18} /> Back
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg">
                {loading ? 'Confirming...' : 'Confirm Appointment'} <CheckCircle2 size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 4: Success Screen */}
      {step === 4 && confirmedBooking && (
        <div className="ql-card" style={{ textAlign: 'center', padding: '40px 32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--status-completed-bg)',
            color: 'var(--status-completed)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            Appointment Confirmed!
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Your appointment has been successfully scheduled.
          </p>

          {/* Reference Card */}
          <div style={{
            display: 'inline-block',
            backgroundColor: 'var(--primary-subtle)',
            border: '2px dashed var(--primary)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 36px',
            marginBottom: '28px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Appointment Reference Code
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.04em', margin: '6px 0' }}>
              {confirmedBooking.referenceCode}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>
              {confirmedBooking.appointmentDate} at {confirmedBooking.appointmentTime}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {confirmedBooking.serviceName} • {confirmedBooking.branchName}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
            <button 
              onClick={() => setCurrentView('my-appointments')}
              className="btn btn-primary btn-lg"
            >
              View My Appointments
            </button>
            <button 
              onClick={() => setCurrentView('customer-home')}
              className="btn btn-outline btn-lg"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

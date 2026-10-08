import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { WalkInModal } from './WalkInModal';
import { 
  Calendar, 
  Clock, 
  Ticket, 
  Building2, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

export const CustomerHome = ({ setCurrentView, onSelectServiceForBooking }) => {
  const { user, activeToken } = useAuth();
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Walk-in modal state
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [walkInServiceId, setWalkInServiceId] = useState(null);

  useEffect(() => {
    api.getBranches().then((data) => {
      setBranches(data);
      if (data.length > 0) {
        setSelectedBranchId(data[0].id);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      setLoading(true);
      api.getServices(selectedBranchId).then((data) => {
        setServices(data);
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [selectedBranchId]);

  const handleBookService = (service) => {
    if (onSelectServiceForBooking) {
      onSelectServiceForBooking(selectedBranchId, service.id);
    }
    setCurrentView('book-appointment');
  };

  const handleOpenWalkIn = (serviceId) => {
    setWalkInServiceId(serviceId);
    setIsWalkInOpen(true);
  };

  const currentBranch = branches.find((b) => b.id === Number(selectedBranchId));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Active Live Token Banner if present */}
      {activeToken && (
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '2px solid var(--primary)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'linear-gradient(135deg, #FFFFFF 0%, var(--primary-light) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 800
            }}>
              {activeToken.tokenNumber.split('-')[0]}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                  Token #{activeToken.tokenNumber}
                </span>
                <StatusBadge status={activeToken.status} />
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {activeToken.serviceName} • {activeToken.branchName}
                {activeToken.counterName && ` • Proceed to ${activeToken.counterName}`}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>People Ahead</span>
              <strong style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>{activeToken.peopleAhead}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Est. Wait Time</span>
              <strong style={{ fontSize: '1.3rem', color: 'var(--primary)' }}>~{activeToken.estimatedWaitMinutes} mins</strong>
            </div>
            <button 
              onClick={() => setCurrentView('my-queue')}
              className="btn btn-primary btn-md"
              style={{ borderRadius: 'var(--radius-lg)' }}
            >
              Live Tracker <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div style={{
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        padding: '36px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '14px' }}>
            <Sparkles size={14} /> Smart Digital Queue & Appointments
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '12px' }}>
            Zero Waiting in Lines.<br />Manage Your Turn with Ease.
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Book scheduled appointments in advance or generate an instant walk-in token. Track your real-time counter position from anywhere on your mobile or desktop.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setCurrentView('book-appointment')}
              className="btn btn-primary btn-lg"
            >
              <Calendar size={18} /> Schedule Appointment
            </button>
            <button 
              onClick={() => handleOpenWalkIn(null)}
              className="btn btn-secondary btn-lg"
            >
              <Ticket size={18} /> Get Walk-In Token
            </button>
          </div>
        </div>

        {/* Branch Selector Card */}
        <div style={{
          backgroundColor: 'var(--primary-subtle)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: '24px',
          minWidth: '300px',
          maxWidth: '360px',
          flex: 1
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Building2 size={18} color="var(--primary)" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Select Organization Branch</h4>
          </div>
          <select
            className="form-select"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            style={{ marginBottom: '14px' }}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
            ))}
          </select>

          {currentBranch && (
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>📍 {currentBranch.address}, {currentBranch.city}</div>
              <div>🕒 Hours: {currentBranch.openingTime} - {currentBranch.closingTime}</div>
              <div>📞 {currentBranch.phone}</div>
              <div style={{ marginTop: '8px', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> Open for Tokens & Appointments
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary Workflow Roadmap Banner (from PDF requirements) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '8px',
        backgroundColor: 'var(--surface)',
        padding: '16px 20px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        textAlign: 'center'
      }}>
        {[
          { step: '1', title: 'Service Selection' },
          { step: '2', title: 'Appointment / Token' },
          { step: '3', title: 'Virtual Queue' },
          { step: '4', title: 'Counter Assigned' },
          { step: '5', title: 'Active Service' },
          { step: '6', title: 'Completion' },
        ].map((s, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
                {s.step}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{s.title}</span>
            </div>
            {idx < 5 && <span style={{ color: 'var(--border)', fontSize: '1rem' }}>→</span>}
          </div>
        ))}
      </div>

      {/* Services Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Available Services at {currentBranch ? currentBranch.name : 'Branch'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Select a service to book an appointment or take an immediate queue token.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading services...</div>
        ) : (
          <div className="grid-3">
            {services.map((service) => (
              <div key={service.id} className="ql-card ql-card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-dark)',
                      fontWeight: 800,
                      fontSize: '0.9rem'
                    }}>
                      {service.code || 'SRV'}
                    </div>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--primary-dark)',
                      backgroundColor: 'var(--primary-subtle)',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Clock size={12} /> ~{service.estimatedDurationMinutes} mins
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    {service.name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '20px' }}>
                    {service.description || 'Standard counter service for customer inquiries, document processing, and assistance.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                  <button 
                    onClick={() => handleBookService(service)}
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Calendar size={14} /> Book Ahead
                  </button>
                  <button 
                    onClick={() => handleOpenWalkIn(service.id)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Ticket size={14} /> Walk-in Token
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Walk-in token popup modal */}
      <WalkInModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        defaultBranchId={selectedBranchId}
        defaultServiceId={walkInServiceId}
        onSuccess={() => {
          setIsWalkInOpen(false);
          setCurrentView('my-queue');
        }}
      />

    </div>
  );
};

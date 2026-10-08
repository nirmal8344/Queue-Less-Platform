import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  Clock, 
  Users, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  XCircle, 
  RefreshCw,
  Sparkles,
  Volume2
} from 'lucide-react';

export const MyQueue = ({ setCurrentView }) => {
  const { user, activeToken, refreshActiveToken } = useAuth();
  const { addToast } = useNotifications();

  const [tokenData, setTokenData] = useState(activeToken);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [liveTokens, setLiveTokens] = useState([]);

  const fetchQueueData = async () => {
    if (!user) return;
    try {
      const tok = await api.getActiveToken();
      setTokenData(tok);
      await refreshActiveToken();
      if (tok && tok.branchId) {
        const queueList = await api.getLiveQueue(tok.branchId);
        setLiveTokens(queueList);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 6000);
    return () => clearInterval(interval);
  }, [user]);

  const handleCancelToken = async () => {
    if (!tokenData) return;
    if (!window.confirm('Are you sure you want to cancel your queue token?')) return;

    setCancelling(true);
    try {
      await api.cancelToken(tokenData.id, 'Cancelled by user');
      addToast('Token Cancelled', 'Your token has been removed from the queue.', 'info');
      setTokenData(null);
      await refreshActiveToken();
    } catch (err) {
      addToast('Error', err.message, 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (!user) {
    return (
      <div className="ql-card" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '500px', margin: '40px auto' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Sign in to View Your Queue</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Please log in to track your active tokens, appointments, and position in real-time.
        </p>
        <button onClick={() => setCurrentView('login')} className="btn btn-primary btn-lg">
          Sign In Now
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s infinite linear', marginBottom: '8px' }} />
        <div>Connecting to live queue...</div>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="ql-card" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '560px', margin: '30px auto' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary-dark)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <Clock size={32} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
          No Active Queue Token
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
          You do not have an active waiting token right now. You can get an instant walk-in token or schedule an appointment.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button onClick={() => setCurrentView('customer-home')} className="btn btn-primary">
            Explore Services & Walk-in
          </button>
          <button onClick={() => setCurrentView('book-appointment')} className="btn btn-outline">
            Book Appointment
          </button>
        </div>
      </div>
    );
  }

  const isCalledOrServing = tokenData.status === 'CALLED' || tokenData.status === 'AT_COUNTER' || tokenData.status === 'IN_SERVICE';

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header & Status Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Live Queue Monitor
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Real-time updates enabled • Automatically refreshing
          </p>
        </div>
        <button onClick={fetchQueueData} className="btn btn-outline btn-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Main Token Highlight Card */}
      <div className="ql-card" style={{
        backgroundColor: 'var(--surface)',
        border: isCalledOrServing ? '3px solid #F59E0B' : '2px solid var(--primary)',
        boxShadow: 'var(--shadow-lg)',
        padding: '36px 28px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {isCalledOrServing && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: '#F59E0B',
            color: '#fff',
            padding: '6px 12px',
            fontSize: '0.85rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <Volume2 size={16} /> Attention: Your Token Has Been Called!
          </div>
        )}

        <div style={{ marginTop: isCalledOrServing ? '18px' : '0' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Your Token Number
          </span>

          <div style={{
            fontSize: '4.5rem',
            fontWeight: 900,
            color: isCalledOrServing ? '#D97706' : 'var(--primary)',
            letterSpacing: '0.02em',
            margin: '4px 0 8px',
            lineHeight: 1
          }}>
            {tokenData.tokenNumber}
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <StatusBadge status={tokenData.status} />
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              • {tokenData.priorityDisplayName || 'General'}
            </span>
          </div>

          <div style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 600 }}>
            {tokenData.serviceName}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            📍 {tokenData.branchName}
          </div>

          {/* Assigned Counter announcement box */}
          {tokenData.counterName && (
            <div style={{
              margin: '24px auto',
              padding: '16px 24px',
              backgroundColor: 'var(--status-called-bg)',
              border: '2px solid #F59E0B',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '440px',
              animation: 'pulseBadge 2s infinite'
            }}>
              <span style={{ fontSize: '0.8rem', color: '#B45309', fontWeight: 700, textTransform: 'uppercase' }}>
                Assigned Service Window
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#92400E' }}>
                {tokenData.counterName}
              </div>
              {tokenData.staffName && (
                <div style={{ fontSize: '0.85rem', color: '#B45309', marginTop: '2px' }}>
                  Attending Staff: <strong>{tokenData.staffName}</strong>
                </div>
              )}
            </div>
          )}

          {/* Real-time stats grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            margin: '28px 0',
            textAlign: 'left'
          }}>
            <div style={{
              backgroundColor: 'var(--primary-subtle)',
              padding: '18px 20px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>
                <Users size={16} /> People Ahead in Queue
              </div>
              <strong style={{ fontSize: '1.8rem', color: 'var(--text-main)', fontWeight: 800 }}>
                {tokenData.status === 'WAITING' ? tokenData.peopleAhead : 0}
              </strong>
              <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                {tokenData.status === 'WAITING' ? (tokenData.peopleAhead === 0 ? "You're next in line!" : 'customers before your turn') : 'Currently being attended'}
              </span>
            </div>

            <div style={{
              backgroundColor: 'var(--primary-subtle)',
              padding: '18px 20px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>
                <Clock size={16} /> Estimated Wait Time
              </div>
              <strong style={{ fontSize: '1.8rem', color: 'var(--primary)', fontWeight: 800 }}>
                {tokenData.status === 'WAITING' ? `~${tokenData.estimatedWaitMinutes}m` : '0m'}
              </strong>
              <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                calculated based on counter speeds
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={handleCancelToken}
              disabled={cancelling || tokenData.status === 'COMPLETED'}
              className="btn btn-danger"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <XCircle size={16} /> Cancel My Token
            </button>
            <button
              onClick={() => setCurrentView('queue-display')}
              className="btn btn-outline"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              Open TV Waiting Screen
            </button>
          </div>
        </div>
      </div>

      {/* Live Waiting Stream */}
      <div className="ql-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>
          Branch Live Queue Stream ({tokenData.branchName})
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {liveTokens.slice(0, 6).map((tok) => {
            const isMe = tok.id === tokenData.id;
            return (
              <div
                key={tok.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isMe ? 'var(--primary-light)' : 'var(--primary-subtle)',
                  border: isMe ? '2px solid var(--primary)' : '1px solid var(--border-light)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <strong style={{ fontSize: '1.1rem', color: isMe ? 'var(--primary-dark)' : 'var(--text-main)' }}>
                    #{tok.tokenNumber} {isMe && '(YOU)'}
                  </strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {tok.serviceName}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {tok.counterName && (
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#B45309' }}>
                      👉 {tok.counterName}
                    </span>
                  )}
                  <StatusBadge status={tok.status} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

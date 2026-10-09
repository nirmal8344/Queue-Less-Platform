import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { StatusBadge } from '../../components/StatusBadge';
import { playAnnouncementChime } from '../../utils/audioChime';
import { 
  Play, 
  Pause,
  CheckCircle, 
  RotateCcw, 
  SkipForward, 
  UserX, 
  PhoneCall, 
  Clock, 
  Users, 
  Building2, 
  Power, 
  AlertCircle,
  Sparkles,
  RefreshCw,
  FileText
} from 'lucide-react';

export const StaffDashboard = ({ setCurrentView }) => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(user?.assignedBranchId || 1);
  const [counters, setCounters] = useState([]);
  const [selectedCounterId, setSelectedCounterId] = useState(user?.assignedCounterId || 1);
  
  const [currentServingToken, setCurrentServingToken] = useState(null);
  const [waitingTokens, setWaitingTokens] = useState([]);
  const [counterStatus, setCounterStatus] = useState('OPEN');
  
  const [serviceTimerSeconds, setServiceTimerSeconds] = useState(0);
  const [serviceNotes, setServiceNotes] = useState('');
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStaffData = async () => {
    if (!selectedBranchId) return;
    try {
      const [bList, cList, qList] = await Promise.all([
        api.getBranches(),
        api.getCounters(selectedBranchId),
        api.getStaffQueue(selectedBranchId)
      ]);
      setBranches(bList);
      setCounters(cList);

      const myCounter = cList.find(c => c.id === Number(selectedCounterId)) || cList[0];
      if (myCounter) {
        setCounterStatus(myCounter.status);
      }

      // Find token currently serving at this counter
      const activeServing = qList.find(t => 
        (t.status === 'CALLED' || t.status === 'AT_COUNTER' || t.status === 'IN_SERVICE') &&
        t.counterId === Number(selectedCounterId)
      );
      setCurrentServingToken(activeServing || null);

      // Waiting tokens
      const waiting = qList.filter(t => t.status === 'WAITING');
      setWaitingTokens(waiting);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
    const interval = setInterval(fetchStaffData, 5000);
    return () => clearInterval(interval);
  }, [selectedBranchId, selectedCounterId]);

  // Service timer for currently active customer
  useEffect(() => {
    let interval = null;
    if (currentServingToken && currentServingToken.status === 'IN_SERVICE') {
      interval = setInterval(() => {
        setServiceTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      setServiceTimerSeconds(0);
    }
    return () => clearInterval(interval);
  }, [currentServingToken]);

  const handleCallNext = async () => {
    setActionLoading(true);
    try {
      const token = await api.callNextToken(selectedBranchId, selectedCounterId);
      playAnnouncementChime();
      addToast('Next Customer Called', `Token ${token.tokenNumber} assigned to your counter.`, 'TOKEN_CALLED');
      fetchStaffData();
    } catch (err) {
      addToast('Cannot Call', err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecall = async () => {
    if (!currentServingToken) return;
    setActionLoading(true);
    try {
      await api.recallToken(currentServingToken.id);
      playAnnouncementChime();
      addToast('Token Recalled', `Announcement repeated for ${currentServingToken.tokenNumber}`, 'TOKEN_CALLED');
      fetchStaffData();
    } catch (err) {
      addToast('Error', err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartService = async () => {
    if (!currentServingToken) return;
    setActionLoading(true);
    try {
      await api.startService(currentServingToken.id);
      addToast('Service Started', `Serving ${currentServingToken.tokenNumber}`, 'info');
      fetchStaffData();
    } catch (err) {
      addToast('Error', err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteService = async () => {
    if (!currentServingToken) return;
    setActionLoading(true);
    try {
      await api.completeService(currentServingToken.id, serviceNotes);
      addToast('Service Completed', `Token ${currentServingToken.tokenNumber} finished successfully.`, 'success');
      setServiceNotes('');
      setNotesModalOpen(false);
      fetchStaffData();
    } catch (err) {
      addToast('Error', err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePauseService = async () => {
    if (!currentServingToken) return;
    setActionLoading(true);
    try {
      await api.pauseService(currentServingToken.id, 'Temporarily paused by staff');
      addToast('Service Paused', `Service for token ${currentServingToken.tokenNumber} is paused.`, 'info');
      fetchStaffData();
    } catch (err) {
      addToast('Error', err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeService = async () => {
    if (!currentServingToken) return;
    setActionLoading(true);
    try {
      await api.resumeService(currentServingToken.id);
      addToast('Service Resumed', `Service for token ${currentServingToken.tokenNumber} has been resumed.`, 'info');
      fetchStaffData();
    } catch (err) {
      addToast('Error', err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkipToken = async () => {
    if (!currentServingToken) return;
    if (!window.confirm(`Skip token ${currentServingToken.tokenNumber}?`)) return;
    setActionLoading(true);
    try {
      await api.skipToken(currentServingToken.id, 'Skipped by staff desk');
      addToast('Token Skipped', `Token ${currentServingToken.tokenNumber} moved to skipped list.`, 'info');
      fetchStaffData();
    } catch (err) {
      addToast('Error', err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkNoShow = async () => {
    if (!currentServingToken) return;
    if (!window.confirm(`Mark token ${currentServingToken.tokenNumber} as NO SHOW?`)) return;
    setActionLoading(true);
    try {
      await api.markNoShow(currentServingToken.id, 'Customer did not show up at counter');
      addToast('Marked No Show', `Token ${currentServingToken.tokenNumber} marked as No Show.`, 'error');
      fetchStaffData();
    } catch (err) {
      addToast('Error', err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCounterStatus = async (newStatus) => {
    try {
      await api.updateCounterStatus(selectedCounterId, newStatus);
      setCounterStatus(newStatus);
      addToast('Counter Updated', `Counter status is now ${newStatus}`, 'info');
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Desk Control Bar */}
      <div style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Branch</span>
            <select
              className="form-select"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(Number(e.target.value))}
              style={{ padding: '6px 12px', fontSize: '0.875rem' }}
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Counter Desk</span>
            <select
              className="form-select"
              value={selectedCounterId}
              onChange={(e) => setSelectedCounterId(Number(e.target.value))}
              style={{ padding: '6px 12px', fontSize: '0.875rem' }}
            >
              {counters.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Counter Status Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '4px' }}>Status:</span>
          <button
            onClick={() => handleToggleCounterStatus('OPEN')}
            className={`btn btn-sm ${counterStatus === 'OPEN' ? 'btn-success' : 'btn-outline'}`}
          >
            ● Open
          </button>
          <button
            onClick={() => handleToggleCounterStatus('PAUSED')}
            className={`btn btn-sm ${counterStatus === 'PAUSED' ? 'btn-secondary' : 'btn-outline'}`}
          >
            ⏸ Paused
          </button>
          <button
            onClick={() => handleToggleCounterStatus('CLOSED')}
            className={`btn btn-sm ${counterStatus === 'CLOSED' ? 'btn-danger' : 'btn-outline'}`}
          >
            ✕ Closed
          </button>
        </div>
      </div>

      {/* Main Grid: Active Counter Desk & Next in Line Queue */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px' }}>
        
        {/* Left Column: Active Customer Desk */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="ql-card" style={{
            border: currentServingToken ? '2px solid var(--primary)' : '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Active Counter Desk
                </h2>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Operating as: {user?.name}
                </span>
              </div>

              {currentServingToken && (
                <div style={{
                  backgroundColor: currentServingToken.status === 'IN_SERVICE' ? 'var(--status-service-bg)' : 'var(--status-called-bg)',
                  border: '1px solid',
                  borderColor: currentServingToken.status === 'IN_SERVICE' ? '#BFDBFE' : '#FDE68A',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: currentServingToken.status === 'IN_SERVICE' ? '#1D4ED8' : '#B45309'
                }}>
                  <Clock size={16} />
                  <span>{currentServingToken.status === 'IN_SERVICE' ? `Serving: ${formatTimer(serviceTimerSeconds)}` : 'Customer Called'}</span>
                </div>
              )}
            </div>

            {currentServingToken ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Currently Serving Token
                </span>

                <div style={{
                  fontSize: '4.2rem',
                  fontWeight: 900,
                  color: 'var(--primary)',
                  letterSpacing: '0.02em',
                  margin: '4px 0 10px',
                  lineHeight: 1
                }}>
                  {currentServingToken.tokenNumber}
                </div>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <StatusBadge status={currentServingToken.status} />
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    • {currentServingToken.priorityDisplayName || 'General'}
                  </span>
                </div>

                {/* Customer Details Box */}
                <div style={{
                  backgroundColor: 'var(--primary-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  padding: '18px 24px',
                  margin: '18px auto 28px',
                  textAlign: 'left',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Customer Name</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{currentServingToken.customerName || 'Walk-in Guest'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Required Service</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--primary-dark)' }}>{currentServingToken.serviceName}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Contact Phone</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{currentServingToken.customerPhone || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Notes / Request</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{currentServingToken.notes || 'None'}</span>
                  </div>
                </div>

                {/* Staff Action Buttons (State machine) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                  {currentServingToken.status === 'CALLED' || currentServingToken.status === 'WAITING' || currentServingToken.status === 'AT_COUNTER' ? (
                    <button
                      onClick={handleStartService}
                      disabled={actionLoading}
                      className="btn btn-primary"
                      style={{ gridColumn: 'span 2' }}
                    >
                      <Play size={16} /> Start Service
                    </button>
                  ) : currentServingToken.status === 'PAUSED' ? (
                    <>
                      <button
                        onClick={handleResumeService}
                        disabled={actionLoading}
                        className="btn btn-primary"
                      >
                        <Play size={16} /> Resume
                      </button>
                      <button
                        onClick={handleCompleteService}
                        disabled={actionLoading}
                        className="btn btn-success"
                      >
                        <CheckCircle size={16} /> Complete
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleCompleteService}
                        disabled={actionLoading}
                        className="btn btn-success"
                      >
                        <CheckCircle size={16} /> Complete
                      </button>
                      <button
                        onClick={handlePauseService}
                        disabled={actionLoading}
                        className="btn btn-outline"
                        style={{ borderColor: '#F59E0B', color: '#D97706' }}
                      >
                        <Pause size={16} /> Pause
                      </button>
                    </>
                  )}

                  <button
                    onClick={handleRecall}
                    disabled={actionLoading}
                    className="btn btn-outline"
                    title="Repeat audio chime announcement"
                  >
                    <PhoneCall size={15} /> Recall
                  </button>

                  <button
                    onClick={handleSkipToken}
                    disabled={actionLoading}
                    className="btn btn-outline"
                  >
                    <SkipForward size={15} /> Skip
                  </button>

                  <button
                    onClick={handleMarkNoShow}
                    disabled={actionLoading}
                    className="btn btn-danger"
                    style={{ padding: '6px 10px' }}
                    title="Mark customer as No-Show"
                  >
                    <UserX size={15} /> No-Show
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-subtle)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  marginBottom: '14px'
                }}>
                  <PhoneCall size={28} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Ready to Serve Next Customer
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  {waitingTokens.length} customers are currently waiting in line for this branch.
                </p>

                <button
                  onClick={handleCallNext}
                  disabled={actionLoading || waitingTokens.length === 0}
                  className="btn btn-primary btn-lg"
                  style={{ borderRadius: 'var(--radius-xl)', padding: '16px 36px', fontSize: '1.1rem' }}
                >
                  <PhoneCall size={20} /> Call Next Customer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Waiting Customers Queue List */}
        <div className="ql-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Waiting Line ({waitingTokens.length})
              </h3>
            </div>
            <button 
              onClick={() => setCurrentView('staff-queue')}
              style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 700 }}
            >
              View Full Queue →
            </button>
          </div>

          {waitingTokens.length === 0 ? (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-muted)',
              fontSize: '0.9rem'
            }}>
              Queue is clear. No waiting customers.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '520px' }}>
              {waitingTokens.map((tok, idx) => (
                <div
                  key={tok.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: idx === 0 ? 'var(--primary-light)' : 'var(--primary-subtle)',
                    border: idx === 0 ? '2px solid var(--primary)' : '1px solid var(--border-light)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                        {tok.tokenNumber}
                      </strong>
                      {idx === 0 && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-dark)', backgroundColor: 'var(--primary)', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                          NEXT
                        </span>
                      )}
                      {tok.priorityCategory !== 'GENERAL' && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: 'var(--status-priority-bg)', color: 'var(--status-priority)', padding: '2px 6px', borderRadius: '4px' }}>
                          {tok.priorityDisplayName}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {tok.serviceName} • {tok.customerName || 'Walk-in'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      Wait: ~{tok.estimatedWaitMinutes}m
                    </span>
                    <button
                      onClick={async () => {
                        try {
                          await api.callSpecificToken(tok.id, selectedCounterId);
                          playAnnouncementChime();
                          addToast('Called', `Token ${tok.tokenNumber} called to counter.`, 'TOKEN_CALLED');
                          fetchStaffData();
                        } catch (err) {
                          addToast('Error', err.message, 'error');
                        }
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ marginTop: '4px', fontSize: '0.75rem', padding: '3px 8px' }}
                    >
                      Call This
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

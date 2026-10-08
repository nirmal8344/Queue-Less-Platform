import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { QueueLogo } from '../../components/LotusLogo';
import { playAnnouncementChime } from '../../utils/audioChime';
import { 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Clock, 
  Users, 
  CheckCircle2, 
  ArrowLeft,
  Sparkles,
  ChevronRight,
  Monitor
} from 'lucide-react';

export const QueueDisplay = ({ setCurrentView }) => {
  const [branchId, setBranchId] = useState(1);
  const [branches, setBranches] = useState([]);
  const [displayData, setDisplayData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastCalledToken, setLastCalledToken] = useState(null);

  useEffect(() => {
    api.getBranches().then((data) => {
      setBranches(data);
      if (data.length > 0) setBranchId(data[0].id);
    }).catch(console.error);

    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const fetchDisplay = async () => {
    if (!branchId) return;
    try {
      const data = await api.getQueueDisplay(branchId);
      setDisplayData(data);

      if (data.currentlyServing && data.currentlyServing.length > 0) {
        const topServing = data.currentlyServing[0];
        if (topServing.tokenNumber !== lastCalledToken) {
          setLastCalledToken(topServing.tokenNumber);
          if (soundEnabled && lastCalledToken !== null) {
            playAnnouncementChime();
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDisplay();
    const interval = setInterval(fetchDisplay, 4000);
    return () => clearInterval(interval);
  }, [branchId, soundEnabled, lastCalledToken]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="queue-display-container">
      {/* Top Header Bar */}
      <header className="qd-header">
        <div className="qd-header-brand">
          <button 
            onClick={() => setCurrentView('customer-home')}
            className="btn btn-outline btn-sm qd-exit-btn"
          >
            <ArrowLeft size={16} /> Exit Display
          </button>
          
          <div className="qd-brand-info">
            <QueueLogo size={36} color="var(--primary)" />
            <div>
              <h1 className="qd-title">QueueLess</h1>
              <p className="qd-subtitle">
                {displayData?.branchName || 'Live Waiting Lounge Display'}
              </p>
            </div>
          </div>
        </div>

        <div className="qd-header-controls">
          {branches.length > 0 && (
            <select
              value={branchId}
              onChange={(e) => setBranchId(Number(e.target.value))}
              className="qd-select"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playAnnouncementChime();
            }}
            className={`qd-icon-btn ${soundEnabled ? 'active' : ''}`}
            title={soundEnabled ? 'Chime Sound Enabled' : 'Chime Muted'}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="qd-icon-btn"
            title="Toggle Fullscreen"
          >
            <Maximize2 size={20} />
          </button>

          <div className="qd-clock">
            <div className="qd-time">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="qd-date">
              {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="qd-main-grid">
        {/* Left Section: Currently Serving */}
        <section className="qd-serving-card">
          <div className="qd-section-header">
            <div className="qd-section-title-wrap">
              <span className="qd-live-dot" />
              <h2 className="qd-section-title">Now Serving</h2>
            </div>
            <span className="qd-live-badge">
              <Monitor size={14} /> Live Display
            </span>
          </div>

          {(!displayData?.currentlyServing || displayData.currentlyServing.length === 0) ? (
            <div className="qd-empty-state">
              <div className="qd-empty-icon">
                <Clock size={40} />
              </div>
              <p className="qd-empty-text">All counters are currently open.</p>
              <p className="qd-empty-subtext">The next customer token will be called shortly.</p>
            </div>
          ) : (
            <div className={`qd-serving-grid ${displayData.currentlyServing.length > 1 ? 'multi' : 'single'}`}>
              {displayData.currentlyServing.map((item, idx) => (
                <div key={idx} className="qd-serving-item">
                  <div className="qd-token-number">{item.tokenNumber}</div>
                  <div className="qd-counter-pill">{item.counterName}</div>
                  <div className="qd-service-name">{item.serviceName}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Section: Next Tokens & Recently Completed */}
        <div className="qd-side-column">
          {/* Next in Line */}
          <section className="qd-next-card">
            <div className="qd-section-header">
              <h3 className="qd-side-title">
                <Users size={18} /> Next in Line ({displayData?.waitingTokens?.length || 0})
              </h3>
              <span className="qd-hint-text">Please wait in lounge</span>
            </div>

            <div className="qd-next-grid">
              {(!displayData?.waitingTokens || displayData.waitingTokens.length === 0) ? (
                <div className="qd-empty-substate">
                  No upcoming tokens in queue.
                </div>
              ) : (
                displayData.waitingTokens.slice(0, 6).map((w, i) => (
                  <div key={i} className="qd-next-item">
                    <div>
                      <div className="qd-next-token">{w.tokenNumber}</div>
                      <div className="qd-next-service">{w.serviceName}</div>
                    </div>
                    <div className="qd-next-right">
                      <span className="qd-next-wait">~{w.estimatedWaitMinutes}m</span>
                      {w.priority && w.priority !== 'General' && (
                        <span className="qd-next-priority">{w.priority}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Recently Completed */}
          <section className="qd-completed-card">
            <div className="qd-section-header">
              <h3 className="qd-side-title">
                <CheckCircle2 size={18} color="var(--primary)" /> Recently Completed
              </h3>
            </div>

            <div className="qd-completed-list">
              {(!displayData?.recentCompleted || displayData.recentCompleted.length === 0) ? (
                <div className="qd-empty-substate">
                  No completed tokens yet today.
                </div>
              ) : (
                displayData.recentCompleted.slice(0, 5).map((c, idx) => (
                  <div key={idx} className="qd-completed-item">
                    <span className="qd-completed-token">{c.tokenNumber}</span>
                    <span className="qd-completed-counter">{c.counterName}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer Marquee Banner */}
      <footer className="qd-footer">
        <div className="qd-footer-content">
          <Sparkles size={16} color="var(--primary)" />
          <span>Please proceed to your assigned counter when your token is announced. Keep your token confirmation ready.</span>
        </div>
        <div className="qd-footer-brand">
          QueueLess Digital Platform
        </div>
      </footer>
    </div>
  );
};

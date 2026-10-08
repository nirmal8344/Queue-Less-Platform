import React from 'react';
import { QueueLogo } from './LotusLogo';

export const AuthVisualPanel = ({ text, title }) => {
  return (
    <div className="auth-visual-panel">
      <div className="auth-visual-content">
        <div className="auth-visual-brand-row">
          <QueueLogo size={38} color="#86EFAC" />
          <span className="auth-visual-brand-title">QueueLess</span>
        </div>
        <h1 className="auth-visual-headline">
          {title || 'Digital Queue & Appointment Platform'}
        </h1>
        <p className="auth-visual-text">
          {text || 'Manage your queue with ease.'}
        </p>
      </div>
    </div>
  );
};

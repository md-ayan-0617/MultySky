import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-badge">404 ERROR</div>
        <h1 className="not-found-title">Page or Session Not Found</h1>
        <p className="not-found-desc">
          The requested page, gallery category, or active MultiScreen session could not be located.
          It may have expired or the link might be incorrect.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="btn-modern-primary">
            Back to Home
          </Link>
          <Link to="/gallery" className="btn-modern-secondary">
            Browse Gallery
          </Link>
          <Link to="/create-session" className="btn-modern-secondary">
            Create Session
          </Link>
        </div>
      </div>
    </div>
  );
}

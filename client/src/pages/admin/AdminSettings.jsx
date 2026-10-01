import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getAdminStats } from '../../services/galleryApi';

export default function AdminSettings() {
  const { adminUser, logout } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (!stats) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `multiscreen-gallery-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Admin & System Settings</h1>
          <p className="admin-page-subtitle">Security settings, system status, and gallery configuration.</p>
        </div>
      </div>

      <div className="admin-settings-grid">
        {/* Security & Authentication Box */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>🔐 Security & Session</h3>
          </div>
          <div className="admin-card-body">
            <div className="admin-settings-item">
              <span className="admin-settings-label">Session Status</span>
              <span className="admin-badge-status published">Active & Authenticated</span>
            </div>

            <div className="admin-settings-item">
              <span className="admin-settings-label">Role</span>
              <span className="admin-settings-val">Super Administrator</span>
            </div>

            <div className="admin-settings-item">
              <span className="admin-settings-label">Token Expiry</span>
              <span className="admin-settings-val">24 Hours (Rolling)</span>
            </div>

            <div className="admin-settings-item">
              <span className="admin-settings-label">Password Storage</span>
              <span className="admin-settings-val" style={{ color: '#22c55e' }}>Server Environment Variable (Protected)</span>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button onClick={logout} className="admin-btn admin-btn-danger">
                Terminate Admin Session (Logout)
              </button>
            </div>
          </div>
        </div>

        {/* Backend & Deployment Architecture */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>🌐 Environment & Deployment</h3>
          </div>
          <div className="admin-card-body">
            <div className="admin-settings-item">
              <span className="admin-settings-label">Frontend Platform</span>
              <span className="admin-settings-val">Vercel (SPA with HTML5 History rewrites)</span>
            </div>

            <div className="admin-settings-item">
              <span className="admin-settings-label">Backend API Server</span>
              <span className="admin-settings-val">Render Node.js API</span>
            </div>

            <div className="admin-settings-item">
              <span className="admin-settings-label">Live Sync Engine</span>
              <span className="admin-settings-val">Socket.IO WebSockets</span>
            </div>

            <div className="admin-settings-item">
              <span className="admin-settings-label">Gallery Database</span>
              <span className="admin-settings-val">File/Object Persistent Repository</span>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button onClick={handleExportJSON} className="admin-btn admin-btn-secondary">
                Export System Summary JSON
              </button>
            </div>
          </div>
        </div>

        {/* Storage Summary */}
        <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
          <div className="admin-card-header">
            <h3>📊 Media Storage & Stats Summary</h3>
          </div>
          <div className="admin-card-body">
            {loading ? (
              <p>Loading stats...</p>
            ) : (
              <div className="admin-stats-summary-row">
                <div className="admin-mini-stat">
                  <span className="label">Total Images</span>
                  <span className="value">{stats?.totalImages || 0}</span>
                </div>
                <div className="admin-mini-stat">
                  <span className="label">Published</span>
                  <span className="value" style={{ color: '#22c55e' }}>{stats?.publishedImages || 0}</span>
                </div>
                <div className="admin-mini-stat">
                  <span className="label">Unpublished</span>
                  <span className="value" style={{ color: '#eab308' }}>{stats?.unpublishedImages || 0}</span>
                </div>
                <div className="admin-mini-stat">
                  <span className="label">Categories</span>
                  <span className="value" style={{ color: '#3b82f6' }}>{stats?.totalCategories || 0}</span>
                </div>
                <div className="admin-mini-stat">
                  <span className="label">Direct Uploads</span>
                  <span className="value">{stats?.uploadedImages || 0}</span>
                </div>
                <div className="admin-mini-stat">
                  <span className="label">External URLs</span>
                  <span className="value">{stats?.externalImages || 0}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

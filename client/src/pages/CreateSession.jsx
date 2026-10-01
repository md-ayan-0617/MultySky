import React, { useState } from 'react';
import { Layers, ArrowLeft, ArrowRight, Sparkles, Check, Lock, ShieldCheck, Grid } from 'lucide-react';
import { createSession } from '../services/api';
import LayoutSelector from '../components/LayoutSelector';
import { calculateOptimalGrid } from '../utils/layoutUtils';

export default function CreateSession({ onNavigate, onCreated }) {
  const [selectedLayout, setSelectedLayout] = useState({ id: '2x2', rows: 2, cols: 2, total: 4 });
  const [pin, setPin] = useState('');
  const [enablePin, setEnablePin] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const res = await createSession({
        layoutId: selectedLayout.id || `${selectedLayout.rows}x${selectedLayout.cols}`,
        pin: enablePin && pin ? pin.trim() : null,
        requireApproval
      });

      if (res?.success && res.session) {
        if (onCreated) {
          onCreated(res.session);
        } else {
          onNavigate('master', { sessionId: res.session.id });
        }
      } else {
        setError(res?.message || 'Could not create session');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error creating session. Please ensure backend is accessible.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="create-session-container">
      <button
        onClick={() => onNavigate('home')}
        className="btn-secondary back-nav-btn"
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      <div className="clay-card create-session-card">
        <div className="create-session-header">
          <div className="create-badge">
            <Sparkles size={16} /> Session Setup & Grid Configuration
          </div>
          <h2 className="create-title">
            Create MultiScreen Session
          </h2>
          <p className="create-subtitle">
            Configure 1 to 100 smartphones in an intelligent multi-screen video wall.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--accent-rose)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {/* Layout Selector (Standard + More Grids 10-100 + Custom) */}
        <div style={{ marginBottom: '24px' }}>
          <LayoutSelector
            currentLayout={selectedLayout}
            onSelectLayout={(layout) => setSelectedLayout(layout)}
          />
        </div>

        {/* Session Security Options (Requirement 14) */}
        <div style={{
          background: 'var(--nm-surface-light)',
          border: 'var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Session Security & Device Control
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {/* PIN Protection */}
            <div style={{
              background: 'var(--nm-surface)',
              border: 'var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: enablePin ? '10px' : '0' }}>
                <input
                  type="checkbox"
                  checked={enablePin}
                  onChange={e => setEnablePin(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-heading)' }}>
                  <Lock size={15} color="var(--accent-amber)" /> Optional Join PIN
                </div>
              </label>

              {enablePin && (
                <input
                  type="text"
                  maxLength="6"
                  placeholder="e.g. 1234"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="input-control"
                  style={{ marginTop: '6px', fontSize: '0.9rem' }}
                />
              )}
            </div>

            {/* Device Approval Queue */}
            <div style={{
              background: 'var(--nm-surface)',
              border: 'var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={e => setRequireApproval(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-heading)' }}>
                    <ShieldCheck size={16} color="var(--accent-emerald)" /> Host Device Approval
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Require Master approval before display devices appear on wall
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="create-action-wrap">
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="btn-primary create-launch-btn"
          >
            {isCreating ? 'Launching Session...' : `Launch Session (${selectedLayout.rows}×${selectedLayout.cols})`}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

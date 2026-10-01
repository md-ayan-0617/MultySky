import React from 'react';
import { Smartphone, QrCode, Power, Maximize2, Moon, Sun, Radio, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';

export default function SessionControlPanel({
  sessionId,
  connectedCount = 0,
  totalSlots = 4,
  pendingCount = 0,
  isMasterInGrid = false,
  blackout = false,
  onOpenDisplayMode,
  onJoinGrid,
  onPairPhones,
  onToggleBlackout,
  onEndSession,
  onApproveAllPending
}) {
  return (
    <div className="session-control-panel">
      {/* ── Top Bar: Brand, Session ID & Status Badge ─────────────────── */}
      <div className="session-control-top">
        <div className="session-brand-group">
          <div className="session-logo-badge">
            <Smartphone size={18} strokeWidth={2.5} />
          </div>
          <div className="session-title-block">
            <span className="session-brand-name">MultiScreen</span>
            <div className="session-code-pill">
              <span className="code-label">SESSION</span>
              <span className="code-value">{sessionId}</span>
            </div>
          </div>
        </div>

        <div className="session-status-group">
          <span className={`session-status-badge ${connectedCount > 0 ? 'online' : 'waiting'}`}>
            <Radio size={12} className={connectedCount > 0 ? 'pulse-icon' : ''} />
            <span>Connected {connectedCount} / {totalSlots}</span>
          </span>
          {pendingCount > 0 && (
            <button onClick={onApproveAllPending} className="session-pending-badge" title="Click to approve pending phones">
              <ShieldAlert size={12} />
              <span>{pendingCount} Pending</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Action Rows Hierarchy ────────────────────────────────────── */}
      <div className="session-actions-grid">
        {/* Primary Action */}
        <div className="session-primary-action">
          <button
            onClick={onOpenDisplayMode}
            className="session-btn session-btn-primary"
            aria-label="Enter Display Mode"
          >
            <Maximize2 size={16} />
            <span>Enter Display Mode</span>
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="session-secondary-actions">
          <button
            onClick={onJoinGrid}
            className={`session-btn ${isMasterInGrid ? 'session-btn-active' : 'session-btn-secondary'}`}
            title="Use this master phone as one of the physical screens in the wall"
          >
            <Smartphone size={15} />
            <span>{isMasterInGrid ? 'In Grid (Slot P01)' : 'Join Grid'}</span>
          </button>

          <button
            onClick={onPairPhones}
            className="session-btn session-btn-secondary"
            title="Open QR Pairing modal for other phones"
          >
            <QrCode size={15} />
            <span>Pair Phones</span>
          </button>
        </div>

        {/* Utility & Destructive Actions */}
        <div className="session-utility-actions">
          <button
            onClick={onToggleBlackout}
            className={`session-btn session-btn-utility ${blackout ? 'blackout-active' : ''}`}
            title="Temporarily blackout all display screens"
          >
            <Moon size={14} />
            <span>{blackout ? 'Exit Blackout' : 'Blackout'}</span>
          </button>

          <button
            onClick={onEndSession}
            className="session-btn session-btn-danger"
            title="End this session and disconnect all devices"
          >
            <Power size={14} />
            <span>End</span>
          </button>
        </div>
      </div>
    </div>
  );
}

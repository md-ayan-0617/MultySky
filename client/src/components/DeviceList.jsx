import React from 'react';
import { Smartphone, CheckCircle2, Clock, AlertCircle, RefreshCw, X, ArrowRightLeft } from 'lucide-react';

export default function DeviceList({
  devices = [],
  layout,
  onUpdatePosition,
  onRemoveDevice,
  onOpenQR
}) {
  const totalSlots = layout?.total || 4;
  const connectedCount = devices.filter(d => d.status !== 'disconnected').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return (
          <span className="badge badge-ready">
            <span className="status-dot dot-ready" /> Ready
          </span>
        );
      case 'connected':
        return (
          <span className="badge badge-connected">
            <span className="status-dot dot-connected" /> Connected
          </span>
        );
      case 'connecting':
        return (
          <span className="badge badge-connecting">
            <span className="status-dot dot-connecting" /> Connecting
          </span>
        );
      case 'disconnected':
      default:
        return (
          <span className="badge badge-disconnected">
            <span className="status-dot dot-disconnected" /> Disconnected
          </span>
        );
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="nm-icon-box" style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            color: 'var(--accent-cyan)',
            display: 'flex'
          }}>
            <Smartphone size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)' }}>Connected Display Devices</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {connectedCount} of {totalSlots} screen slots paired
            </p>
          </div>
        </div>

        <button onClick={onOpenQR} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
          + Add Phone via QR
        </button>
      </div>

      {/* Device List or Empty State */}
      {devices.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '36px 20px',
          border: 'var(--border-card)',
          borderStyle: 'dashed',
          borderRadius: '14px',
          background: 'var(--nm-surface-dark)',
          boxShadow: 'var(--nm-inset-sm)'
        }}>
          <Smartphone size={40} color="var(--text-dim)" style={{ marginBottom: '12px', opacity: 0.7 }} />
          <h4 style={{ color: 'var(--text-label)', marginBottom: '6px' }}>No Display Phones Connected Yet</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '340px', margin: '0 auto 16px' }}>
            Open the QR code modal and scan with your smartphones to connect them as display screens.
          </p>
          <button onClick={onOpenQR} className="btn-primary" style={{ fontSize: '0.85rem' }}>
            Show Pairing QR Code
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {devices.map((device, idx) => {
            const posIndex = device.position?.index ?? idx;
            return (
              <div
                key={device.id}
                style={{
                  background: 'var(--nm-surface)',
                  border: 'var(--border-card)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'all 0.2s',
                  boxShadow: 'var(--nm-raised-sm)'
                }}
              >
                {/* Left side: slot index & name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1rem',
                    boxShadow: '0 2px 8px var(--btn-primary-glow)'
                  }}>
                    {posIndex + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {device.name || `Phone ${idx + 1}`}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>({device.deviceCode})</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 500, marginTop: '2px' }}>
                      Position: {device.position?.label || `Slot ${posIndex + 1}`}
                    </div>
                  </div>
                </div>

                {/* Right side: Status and Slot Position selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {getStatusBadge(device.status)}

                  {/* Slot selector dropdown */}
                  <select
                    value={posIndex}
                    onChange={(e) => onUpdatePosition(device.id, parseInt(e.target.value))}
                    style={{
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    {Array.from({ length: totalSlots }).map((_, slotNum) => (
                      <option key={slotNum} value={slotNum}>
                        Slot {slotNum + 1}
                      </option>
                    ))}
                  </select>

                  {/* Remove button */}
                  <button
                    onClick={() => onRemoveDevice(device.id)}
                    title="Disconnect device"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '6px',
                      display: 'flex'
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

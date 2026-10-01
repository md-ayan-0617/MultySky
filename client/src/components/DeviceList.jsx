import React, { useState, useMemo } from 'react';
import { Smartphone, CheckCircle2, Clock, AlertCircle, X, Search, Filter, Radio, ChevronLeft, ChevronRight, Eye, ShieldCheck, Check } from 'lucide-react';

export default function DeviceList({
  devices = [],
  layout,
  onUpdatePosition,
  onRemoveDevice,
  onOpenQR,
  onIdentifyDevice,
  onApproveDevice,
  onRejectDevice,
  identifiedDeviceId,
  selectedDeviceId,
  onSelectDevice
}) {
  const totalSlots = Math.min(100, Math.max(1, layout?.total || 4));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const connectedCount = devices.filter(d => d.status === 'ready').length;
  const pendingCount = devices.filter(d => d.status === 'pending').length;

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return devices.filter(dev => {
      // Status filter
      if (statusFilter === 'connected' && dev.status !== 'ready') return false;
      if (statusFilter === 'pending' && dev.status !== 'pending') return false;
      if (statusFilter === 'disconnected' && dev.status !== 'disconnected') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (dev.name || '').toLowerCase().includes(q);
        const codeMatch = (dev.deviceCode || '').toLowerCase().includes(q);
        const slotMatch = `slot ${((dev.position?.index ?? 0) + 1)}`.includes(q);
        const pMatch = `p${((dev.position?.index ?? 0) + 1)}`.includes(q);
        if (!nameMatch && !codeMatch && !slotMatch && !pMatch) return false;
      }
      return true;
    });
  }, [devices, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredDevices.length / pageSize) || 1;
  const paginatedDevices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDevices.slice(start, start + pageSize);
  }, [filteredDevices, currentPage, pageSize]);

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="nm-icon-box" style={{ width: '38px', height: '38px', color: 'var(--accent-cyan)', background: 'var(--nm-surface-light)' }}>
            <Smartphone size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)' }}>Connected Devices</h3>
              <span className="badge badge-ready">
                CONNECTED: {connectedCount} / {totalSlots}
              </span>
              {pendingCount > 0 && (
                <span className="badge badge-pending">
                  {pendingCount} Pending Approval
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Manage phone assignments, identify physical screens, and approve connections
            </p>
          </div>
        </div>

        <button onClick={onOpenQR} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
          + Add Phone (QR)
        </button>
      </div>

      {/* Search & Status Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search e.g. Phone 37, P05, Slot 12..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="input-control"
            style={{ paddingLeft: '34px', fontSize: '0.85rem' }}
          />
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--nm-surface-dark)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
          {[
            { id: 'all', label: `All (${devices.length})` },
            { id: 'connected', label: `Connected (${connectedCount})` },
            ...(pendingCount > 0 ? [{ id: 'pending', label: `Pending (${pendingCount})` }] : []),
            { id: 'disconnected', label: 'Disconnected' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                setStatusFilter(f.id);
                setCurrentPage(1);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: statusFilter === f.id ? 'var(--btn-primary-bg)' : 'transparent',
                color: statusFilter === f.id ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Device List or Empty State */}
      {filteredDevices.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '36px 20px',
          border: '1px dashed rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--nm-surface-dark)'
        }}>
          <Smartphone size={36} color="var(--text-dim)" style={{ marginBottom: '10px', opacity: 0.6 }} />
          <h4 style={{ color: 'var(--text-label)', marginBottom: '4px' }}>
            {searchQuery ? 'No devices matching search' : 'No Display Devices Connected'}
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', maxWidth: '360px', margin: '0 auto 16px' }}>
            {searchQuery ? 'Try clearing your search query or status filter.' : 'Scan the QR code with any smartphone to link it to this multi-screen wall.'}
          </p>
          {!searchQuery && (
            <button onClick={onOpenQR} className="btn-primary" style={{ fontSize: '0.85rem' }}>
              Show Pairing QR Code
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {paginatedDevices.map((device, idx) => {
            const posIndex = device.position?.index ?? idx;
            const isIdentified = identifiedDeviceId === device.id;
            const isSelected = selectedDeviceId === device.id;

            return (
              <div
                key={device.id}
                onClick={() => onSelectDevice?.(device)}
                style={{
                  background: isIdentified
                    ? 'rgba(6, 182, 212, 0.12)'
                    : (isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--nm-surface-light)'),
                  border: isIdentified
                    ? '1.5px solid var(--accent-cyan)'
                    : (isSelected ? '1.5px solid var(--accent-primary)' : 'var(--border-subtle)'),
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Left side: Slot Badge, Code & Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--btn-primary-bg)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem'
                  }}>
                    {posIndex + 1}
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                      {device.name || `Phone ${posIndex + 1}`}
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                        ({device.deviceCode || `P${String(posIndex + 1).padStart(2, '0')}`})
                      </span>
                      {device.isMaster && (
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          background: 'var(--clay-lavender)',
                          color: '#271E47',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          letterSpacing: '0.04em'
                        }}>
                          MASTER DISPLAY
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--clay-coral)', fontWeight: 600 }}>
                      {device.position?.label || `Slot ${posIndex + 1}`}
                    </div>
                  </div>
                </div>

                {/* Right side: Identify, Approval & Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Status Tag */}
                  {device.status === 'ready' && (
                    <span className="badge badge-ready" style={{ fontSize: '0.7rem' }}>
                      <span className="status-dot dot-ready" /> Connected
                    </span>
                  )}
                  {device.status === 'pending' && (
                    <span className="badge badge-pending" style={{ fontSize: '0.7rem' }}>
                      <span className="status-dot dot-pending" /> Pending
                    </span>
                  )}
                  {device.status === 'disconnected' && (
                    <span className="badge badge-disconnected" style={{ fontSize: '0.7rem' }}>
                      <span className="status-dot dot-disconnected" /> Disconnected
                    </span>
                  )}

                  {/* IDENTIFY BUTTON (Requirement 5) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onIdentifyDevice?.(device.id);
                    }}
                    title="Flash screen and show phone number on this physical phone"
                    className="btn-secondary"
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: isIdentified ? 'var(--accent-cyan)' : undefined,
                      color: isIdentified ? '#000' : 'var(--text-main)'
                    }}
                  >
                    IDENTIFY
                  </button>

                  {/* Approve / Reject buttons if pending (Requirement 14) */}
                  {device.status === 'pending' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onApproveDevice?.(device.id);
                        }}
                        className="btn-primary"
                        style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                      >
                        <Check size={12} /> Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRejectDevice?.(device.id);
                        }}
                        className="btn-danger"
                        style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {/* Slot selector dropdown */}
                  <select
                    value={posIndex}
                    onChange={(e) => onUpdatePosition?.(device.id, parseInt(e.target.value))}
                    style={{
                      borderRadius: '6px',
                      padding: '5px 8px',
                      fontSize: '0.75rem',
                      background: 'var(--input-bg)',
                      border: 'var(--border-input)',
                      color: 'var(--input-text)',
                      cursor: 'pointer'
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveDevice?.(device.id);
                    }}
                    title="Remove device"
                    style={{
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: 'var(--border-subtle)',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredDevices.length)} of {filteredDevices.length} devices
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

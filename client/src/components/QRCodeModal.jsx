import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, X, Smartphone, Wifi, ExternalLink } from 'lucide-react';

export default function QRCodeModal({ sessionId, isOpen, onClose, connectedCount = 0, serverInfo }) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [useLanIp, setUseLanIp] = useState(true);

  // Determine join URL
  const currentHost = window.location.host;
  const lanIp = serverInfo?.lanIps?.[0] || serverInfo?.preferredIp;
  const clientPort = window.location.port || '5173';
  
  // If we have LAN IP, provide it so mobile phones on Wi-Fi can open it easily!
  const hostToUse = (useLanIp && lanIp && lanIp !== 'localhost' && lanIp !== '127.0.0.1')
    ? `${lanIp}:${clientPort}`
    : currentHost;

  const joinUrl = `${window.location.protocol}//${hostToUse}/?join=${sessionId}`;

  useEffect(() => {
    if (sessionId && isOpen) {
      QRCode.toDataURL(joinUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
      .then(url => setQrDataUrl(url))
      .catch(console.error);
    }
  }, [sessionId, joinUrl, isOpen]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '28px',
        position: 'relative',
        boxShadow: 'var(--nm-raised-lg), 0 0 30px var(--btn-primary-glow)',
        border: '1px solid var(--btn-primary-border)',
        animation: 'float 6s ease-in-out infinite'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="nm-btn-circle"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--nm-surface-dark)',
            boxShadow: 'var(--nm-inset-sm)',
            border: '1px solid var(--btn-primary-border)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            color: 'var(--accent-primary)',
            marginBottom: '10px'
          }}>
            <Smartphone size={16} /> Connect Display Phones
          </div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--text-heading)' }}>Pair Display Device</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Scan with your phone's camera to join this multi-screen session.
          </p>
        </div>

        {/* QR Code Container */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '16px',
          width: '240px',
          height: '240px',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '6px 6px 16px var(--nm-dark-shadow), -6px -6px 16px var(--nm-light-shadow)',
          border: '4px solid var(--accent-primary)'
        }}>
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Join QR Code" style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
          ) : (
            <div style={{ color: 'var(--text-dim)' }}>Generating QR...</div>
          )}
        </div>

        {/* Session Code Highlight */}
        <div style={{
          background: 'var(--nm-surface-dark)',
          boxShadow: 'var(--nm-inset-sm)',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          border: 'var(--border-card)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Session ID Code
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--accent-cyan)' }}>
              {sessionId}
            </div>
          </div>
          <button
            onClick={copyToClipboard}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            {copied ? <><Check size={16} color="var(--accent-emerald)" /> Copied!</> : <><Copy size={16} /> Copy Link</>}
          </button>
        </div>

        {/* Network IP Switcher */}
        {serverInfo?.lanIps?.length > 0 && (
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            background: 'var(--nm-surface-dark)',
            boxShadow: 'var(--nm-inset-sm)',
            border: 'var(--border-card)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wifi size={16} color="var(--accent-cyan)" />
              <span>Wi-Fi LAN IP: <strong>{lanIp}</strong></span>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>
              <input
                type="checkbox"
                checked={useLanIp}
                onChange={e => setUseLanIp(e.target.checked)}
              />
              Use for QR
            </label>
          </div>
        )}

        {/* Quick Open in New Tab for Local Testing */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href={joinUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ flex: 1, textDecoration: 'none', fontSize: '0.85rem', textAlign: 'center' }}
          >
            <ExternalLink size={16} /> Open Test Phone Tab
          </a>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ flex: 1, fontSize: '0.85rem' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

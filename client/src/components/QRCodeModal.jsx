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
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        animation: 'float 6s ease-in-out infinite'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            color: 'var(--text-muted)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
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
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            color: '#a5b4fc',
            marginBottom: '10px'
          }}>
            <Smartphone size={16} /> Connect Display Phones
          </div>
          <h2 style={{ fontSize: '1.6rem', color: '#fff' }}>Pair Display Device</h2>
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
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          border: '4px solid rgba(99, 102, 241, 0.4)'
        }}>
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Join QR Code" style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
          ) : (
            <div style={{ color: '#64748b' }}>Generating QR...</div>
          )}
        </div>

        {/* Session Code Highlight */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Session ID Code
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '2px', color: '#38bdf8' }}>
              {sessionId}
            </div>
          </div>
          <button
            onClick={copyToClipboard}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            {copied ? <><Check size={16} color="#34d399" /> Copied!</> : <><Copy size={16} /> Copy Link</>}
          </button>
        </div>

        {/* Network IP Switcher */}
        {serverInfo?.lanIps?.length > 0 && (
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wifi size={16} color="#06b6d4" />
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

import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  ArrowLeft,
  ArrowRight,
  QrCode,
  Camera,
  KeyRound,
  Check,
  Upload,
  AlertCircle,
  Lock,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { joinSession } from '../services/api';

export default function JoinSession({ onNavigate, initialCode = '', onJoined }) {
  // Join tabs: 'scan' | 'code'
  const [activeTab, setActiveTab] = useState(initialCode ? 'code' : 'scan');
  const [sessionCode, setSessionCode] = useState(initialCode);
  const [pin, setPin] = useState('');
  const [needPin, setNeedPin] = useState(false);
  const [deviceName, setDeviceName] = useState(() => {
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (typeof navigator !== 'undefined' && /iPhone/i.test(navigator.userAgent)) return 'iPhone Display';
    if (typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)) return 'Android Display';
    return isMobile ? 'Mobile Display' : 'Screen Device';
  });
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(null);

  // Camera QR Scanner states: 'prompt' | 'starting' | 'active' | 'denied' | 'unavailable'
  const [cameraState, setCameraState] = useState('prompt');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [scanMessage, setScanMessage] = useState('Point camera at the QR code on the Master screen');

  useEffect(() => {
    if (initialCode) {
      setSessionCode(initialCode.toUpperCase());
      setActiveTab('code');
    }
  }, [initialCode]);

  // Extract session code helper
  const extractCode = (str) => {
    if (!str) return '';
    const match = str.match(/MS-[A-Z0-9]{6}/i);
    if (match) return match[0].toUpperCase();
    const clean = str.trim().toUpperCase();
    if (/^[A-Z0-9]{6}$/.test(clean)) {
      return `MS-${clean}`;
    }
    return clean;
  };

  // Perform join action with a given code (Auto Reconnect & Re-use Device ID)
  const executeJoin = async (targetCode) => {
    const finalCode = extractCode(targetCode);
    if (!finalCode) {
      setError('Please provide a valid session code (e.g. MS-ABC123)');
      return;
    }

    setIsJoining(true);
    setError(null);

    // Preserve deviceId across reloads / network drops to prevent duplicate devices
    let deviceId;
    try {
      deviceId = sessionStorage.getItem('ms-device-id');
      if (!deviceId) {
        deviceId = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        sessionStorage.setItem('ms-device-id', deviceId);
      }
      sessionStorage.setItem('ms-session-id', finalCode);
      sessionStorage.setItem('ms-device-name', deviceName.trim());
    } catch {
      deviceId = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    }

    try {
      const res = await joinSession({
        sessionId: finalCode,
        deviceId,
        deviceName: deviceName.trim(),
        userAgent: navigator.userAgent,
        pin: pin ? pin.trim() : undefined
      });

      if (res?.success) {
        stopCamera();
        if (onJoined) {
          onJoined(res.session, res.device);
        } else {
          onNavigate('display', {
            sessionId: res.session.id,
            deviceId: res.device.id,
            deviceName: res.device.name
          });
        }
      } else {
        if (res?.error === 'INVALID_PIN') {
          setNeedPin(true);
          setError('Session requires a PIN code. Please enter the PIN provided by the host.');
        } else {
          setError(res?.message || 'Failed to join session. Please check the code.');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to session. Ensure the host screen is active.');
    } finally {
      setIsJoining(false);
    }
  };

  // Start Camera with permission and device capability checks
  const handleEnableCamera = async () => {
    setError(null);
    setCameraState('starting');

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraState('unavailable');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraState('active');

      // Start BarcodeDetector if available
      if ('BarcodeDetector' in window) {
        try {
          const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const scanInterval = setInterval(async () => {
            if (!videoRef.current || videoRef.current.readyState < 2) return;
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const detected = extractCode(barcodes[0].rawValue);
                if (detected) {
                  clearInterval(scanInterval);
                  setScanMessage(`Found code: ${detected}! Connecting...`);
                  executeJoin(detected);
                }
              }
            } catch (e) {
              // Frame scan error, ignore and continue
            }
          }, 400);

          return () => clearInterval(scanInterval);
        } catch (e) {
          console.warn('BarcodeDetector error:', e);
        }
      }
    } catch (err) {
      console.warn('Camera access denied or failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraState('denied');
      } else {
        setCameraState('unavailable');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraState('prompt');
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Handle uploaded image file
  const handleQrFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if ('BarcodeDetector' in window) {
      try {
        const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
          const barcodes = await barcodeDetector.detect(img);
          if (barcodes.length > 0) {
            const detected = extractCode(barcodes[0].rawValue);
            if (detected) {
              executeJoin(detected);
              return;
            }
          }
          setError('Could not detect QR code in uploaded image.');
        };
      } catch (err) {
        setError('Error reading QR image.');
      }
    } else {
      setError('Barcode detector not supported on this browser. Please enter the session code manually below.');
      setActiveTab('code');
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '24px auto', padding: '0 20px 60px' }}>
      <button
        onClick={() => {
          stopCamera();
          onNavigate('home');
        }}
        className="btn-secondary"
        style={{
          marginBottom: '20px',
          padding: '8px 16px',
          fontSize: '0.88rem',
          borderRadius: 'var(--radius-sm)'
        }}
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      <div
        className="clay-card"
        style={{
          padding: '36px 26px',
          background: 'var(--clay-surface)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '18px',
              background: 'var(--clay-coral)',
              boxShadow: 'var(--clay-shadow-coral)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 16px'
            }}
          >
            <Smartphone size={28} strokeWidth={2.4} />
          </div>

          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-heading)', marginBottom: '6px' }}>
            Join Display Wall
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Connect this smartphone into the synchronized visual screen
          </p>
        </div>

        {/* Tab Controls (Scan QR vs Enter Code) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            background: 'var(--clay-surface-warm)',
            padding: '6px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px'
          }}
        >
          <button
            onClick={() => {
              setActiveTab('scan');
              setError(null);
            }}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.92rem',
              fontWeight: 800,
              background: activeTab === 'scan' ? 'var(--clay-coral)' : 'transparent',
              color: activeTab === 'scan' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'scan' ? 'var(--clay-shadow-coral)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Camera size={16} /> Scan QR
          </button>

          <button
            onClick={() => {
              stopCamera();
              setActiveTab('code');
              setError(null);
            }}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.92rem',
              fontWeight: 800,
              background: activeTab === 'code' ? 'var(--clay-coral)' : 'transparent',
              color: activeTab === 'code' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'code' ? 'var(--clay-shadow-coral)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <KeyRound size={16} /> Enter Code
          </button>
        </div>

        {/* Friendly Error Notice */}
        {error && (
          <div
            style={{
              background: '#FFF0ED',
              border: '2px solid #FFC9C1',
              color: '#E55341',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <AlertCircle size={20} />
            <div style={{ flex: 1, fontWeight: 600 }}>{error}</div>
          </div>
        )}

        {/* Device Nickname Input */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>
            Device Nickname
          </label>
          <input
            type="text"
            placeholder="e.g. My iPhone / Left Screen"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            className="input-control"
          />
        </div>

        {/* Optional PIN Code */}
        {(needPin || activeTab === 'code') && (
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>
              <Lock size={15} color="var(--clay-coral)" /> Session PIN {needPin ? '(Required)' : '(If Protected)'}
            </label>
            <input
              type="text"
              maxLength="6"
              placeholder="e.g. 1234"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="input-control"
              style={{ letterSpacing: '2px', fontFamily: 'var(--font-mono)' }}
            />
          </div>
        )}

        {/* ── TAB 1: SCAN QR CODE (Requirement 8 Camera Fix) ─────────────── */}
        {activeTab === 'scan' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Camera Viewport Container */}
            <div
              style={{
                width: '100%',
                maxWidth: '340px',
                height: '260px',
                background: 'var(--clay-surface-warm)',
                borderRadius: 'var(--radius-lg)',
                position: 'relative',
                overflow: 'hidden',
                border: '2px solid rgba(48, 45, 61, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {cameraState === 'active' ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Viewfinder Target Reticle */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '180px',
                      height: '180px',
                      border: '3px solid var(--clay-coral)',
                      borderRadius: '20px',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  />
                </>
              ) : cameraState === 'starting' ? (
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  <RefreshCw size={36} color="var(--clay-coral)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                    Starting camera...
                  </div>
                </div>
              ) : cameraState === 'denied' ? (
                /* Permission Denied UI (Requirement 8) */
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  <AlertCircle size={44} color="#E55341" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#E55341', marginBottom: '8px' }}>
                    Camera permission was denied.
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Please allow camera access in browser settings, or enter the session code manually.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button onClick={handleEnableCamera} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      TRY AGAIN
                    </button>
                    <button onClick={() => setActiveTab('code')} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      ENTER SESSION CODE MANUALLY
                    </button>
                  </div>
                </div>
              ) : cameraState === 'unavailable' ? (
                /* Camera Unavailable UI (Requirement 8) */
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  <Camera size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '8px' }}>
                    Camera unavailable
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    No camera device was detected on this browser.
                  </p>
                  <button onClick={() => setActiveTab('code')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    ENTER SESSION CODE MANUALLY
                  </button>
                </div>
              ) : (
                /* Initial Prompt State (Requirement 8) */
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  <Camera size={44} color="var(--clay-coral)" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '8px' }}>
                    Allow camera access to scan the session QR.
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Scan the QR shown on the master screen to connect instantly.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      onClick={handleEnableCamera}
                      className="btn-primary"
                      style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                    >
                      <Camera size={16} /> ENABLE CAMERA
                    </button>
                    <button
                      onClick={() => setActiveTab('code')}
                      className="btn-secondary"
                      style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                    >
                      ENTER SESSION CODE MANUALLY
                    </button>
                  </div>
                </div>
              )}
            </div>

            {cameraState === 'active' && (
              <p style={{ fontSize: '0.88rem', color: 'var(--clay-coral)', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>
                {scanMessage}
              </p>
            )}

            {/* Optional screenshot upload fallback */}
            <label
              className="btn-secondary"
              style={{
                padding: '10px 18px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}
            >
              <Upload size={16} /> Upload QR Screenshot
              <input type="file" accept="image/*" onChange={handleQrFileUpload} style={{ display: 'none' }} />
            </label>
          </div>
        )}

        {/* ── TAB 2: ENTER CODE MANUALLY ─────────────────────────────────── */}
        {activeTab === 'code' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeJoin(sessionCode);
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>
                Session Code
              </label>
              <input
                type="text"
                placeholder="e.g. MS-ABC123"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                className="input-control"
                style={{
                  fontSize: '1.2rem',
                  letterSpacing: '2px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  textAlign: 'center',
                  textTransform: 'uppercase'
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isJoining || !sessionCode.trim()}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '16px 24px',
                fontSize: '1.05rem',
                opacity: isJoining ? 0.7 : 1
              }}
            >
              {isJoining ? 'Connecting your phone...' : 'CONNECT TO SESSION'}
            </button>
          </form>
        )}
      </div>

      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

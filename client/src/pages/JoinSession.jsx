import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, ArrowLeft, ArrowRight, QrCode, Link as LinkIcon, Camera, KeyRound, Sparkles, Check, Upload, AlertCircle } from 'lucide-react';
import { joinSession } from '../services/api';

export default function JoinSession({ onNavigate, initialCode = '', onJoined }) {
  // Join tabs: 'scan' | 'link' | 'code'
  const [activeTab, setActiveTab] = useState('scan');
  const [sessionCode, setSessionCode] = useState(initialCode);
  const [joiningLink, setJoiningLink] = useState('');
  const [deviceName, setDeviceName] = useState(() => {
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (typeof navigator !== 'undefined' && /iPhone/i.test(navigator.userAgent)) return 'iPhone Display';
    if (typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)) return 'Android Display';
    return isMobile ? 'Mobile Display' : 'Screen Device';
  });
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(null);

  // Camera QR Scanner states
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanMessage, setScanMessage] = useState('Point camera at the QR code on the Master screen');

  useEffect(() => {
    if (initialCode) {
      setSessionCode(initialCode.toUpperCase());
      setActiveTab('code');
    }
  }, [initialCode]);

  // Helper to extract session code from text/link
  const extractCode = (str) => {
    if (!str) return '';
    const match = str.match(/MS-[A-Z0-9]{6}/i);
    if (match) return match[0].toUpperCase();
    const clean = str.trim().toUpperCase();
    return clean;
  };

  // Perform join action with a given code
  const executeJoin = async (targetCode) => {
    const finalCode = extractCode(targetCode);
    if (!finalCode) {
      setError('Please provide a valid session code (e.g. MS-ABC123)');
      return;
    }

    setIsJoining(true);
    setError(null);

    const deviceId = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      const res = await joinSession({
        sessionId: finalCode,
        deviceId,
        deviceName: deviceName.trim(),
        userAgent: navigator.userAgent
      });

      if (res?.success) {
        // Stop camera stream if active
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
        setError(res?.message || 'Failed to join session. Please check the code.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to session. Ensure the master device is active.');
    } finally {
      setIsJoining(false);
    }
  };

  // Camera Management
  const startCamera = async () => {
    try {
      setError(null);
      if (!navigator?.mediaDevices?.getUserMedia) {
        setHasCamera(false);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setHasCamera(true);

      // Start barcode detection if BarcodeDetector API is supported
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const scanInterval = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const rawValue = barcodes[0].rawValue;
              const detected = extractCode(rawValue);
              if (detected) {
                clearInterval(scanInterval);
                setScanMessage(`Found code: ${detected}! Joining...`);
                executeJoin(detected);
              }
            }
          } catch (e) {
            // Frame detection error, ignore and continue
          }
        }, 500);

        return () => clearInterval(scanInterval);
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setHasCamera(false);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (activeTab === 'scan') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab]);

  // Handle file QR upload
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
      setError('Barcode detector is not supported in this browser. Please use manual code.');
    }
  };

  return (
    <div style={{ maxWidth: '540px', margin: '30px auto', padding: '0 20px' }}>
      <button
        onClick={() => {
          stopCamera();
          onNavigate('home');
        }}
        className="btn-secondary"
        style={{ marginBottom: '20px', padding: '8px 16px', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      <div className="glass-panel" style={{ padding: '32px 24px', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            color: '#22d3ee',
            marginBottom: '10px'
          }}>
            <Smartphone size={16} /> Connect Display Phone
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
            Join Multi-Phone Wall
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Choose how you want to connect your phone to the session
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fda4af',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '0.88rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Device Nickname (Shared across all tabs) */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
            Device Nickname
          </label>
          <input
            type="text"
            placeholder="e.g. My Phone"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
        </div>

        {/* ── TAB 1: SCAN QR CODE (PRD 5.2 Mockup) ────────────────── */}
        {activeTab === 'scan' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '100%',
              maxWidth: '320px',
              height: '240px',
              background: '#090a12',
              borderRadius: '18px',
              position: 'relative',
              overflow: 'hidden',
              border: '2px solid rgba(0, 229, 255, 0.4)',
              boxShadow: '0 0 25px rgba(0, 229, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                  <Camera size={44} color="#64748b" style={{ margin: '0 auto 10px' }} />
                  <p style={{ fontSize: '0.82rem', marginBottom: '12px' }}>
                    {hasCamera ? 'Starting camera...' : 'Camera unavailable or permission denied'}
                  </p>
                  <label className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <Upload size={14} /> Upload QR Screenshot
                    <input type="file" accept="image/*" onChange={handleQrFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              )}

              {/* Viewfinder Reticle Overlay (Matching PRD mockup) */}
              <div style={{
                position: 'absolute',
                width: '180px',
                height: '180px',
                border: '2px solid #00e5ff',
                borderRadius: '16px',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Scanning laser line animation */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '2px',
                  background: '#00e5ff',
                  boxShadow: '0 0 8px #00e5ff',
                  animation: 'scanLine 2s linear infinite'
                }} />
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#38bdf8', marginBottom: '18px', textAlign: 'center' }}>
              {scanMessage}
            </p>

            <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Don't have camera access? Switch to <strong>Enter Session ID</strong> or <strong>Join with Link</strong> below.
              </span>
            </div>
          </div>
        )}

        {/* ── TAB 2: JOIN WITH LINK (PRD 5.2 Mockup) ───────────────── */}
        {activeTab === 'link' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeJoin(joiningLink);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
                Paste Session Link
              </label>
              <input
                type="text"
                placeholder="e.g. https://multysky.onrender.com/?session=MS-7K9X48"
                value={joiningLink}
                onChange={(e) => setJoiningLink(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isJoining}
              className="btn-primary"
              style={{ padding: '14px', fontSize: '1rem', marginTop: '6px' }}
            >
              {isJoining ? 'Joining...' : <>Join Session with Link <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* ── TAB 3: ENTER SESSION ID (PRD 5.2 Mockup) ─────────────── */}
        {activeTab === 'code' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeJoin(sessionCode);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
                Session ID / Code
              </label>
              <input
                type="text"
                placeholder="e.g. MS-7K9X48"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                required
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  color: '#fff',
                  fontSize: '1.25rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  textAlign: 'center',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isJoining}
              className="btn-primary"
              style={{ padding: '14px', fontSize: '1rem', marginTop: '6px' }}
            >
              {isJoining ? 'Connecting to Wall...' : <>Join Session <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* ── 3 Bottom Switching Tabs (Matching PRD 5.2 Mockup) ─────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            style={{
              background: activeTab === 'scan' ? 'rgba(0, 229, 255, 0.18)' : 'rgba(255, 255, 255, 0.03)',
              border: activeTab === 'scan' ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '10px 6px',
              color: activeTab === 'scan' ? '#00e5ff' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
          >
            <QrCode size={16} />
            <span>Scan QR Code</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('link')}
            style={{
              background: activeTab === 'link' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              border: activeTab === 'link' ? '1px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '10px 6px',
              color: activeTab === 'link' ? '#a5b4fc' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
          >
            <LinkIcon size={16} />
            <span>Join with Link</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            style={{
              background: activeTab === 'code' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              border: activeTab === 'code' ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '10px 6px',
              color: activeTab === 'code' ? '#d8b4fe' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
          >
            <KeyRound size={16} />
            <span>Enter Session ID</span>
          </button>
        </div>
      </div>
    </div>
  );
}

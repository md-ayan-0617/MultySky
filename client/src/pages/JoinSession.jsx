import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, ArrowLeft, ArrowRight, QrCode, Link as LinkIcon, Camera, KeyRound, Sparkles, Check, Upload, AlertCircle, Lock } from 'lucide-react';
import { joinSession } from '../services/api';

export default function JoinSession({ onNavigate, initialCode = '', onJoined }) {
  // Join tabs: 'scan' | 'link' | 'code'
  const [activeTab, setActiveTab] = useState('scan');
  const [sessionCode, setSessionCode] = useState(initialCode);
  const [joiningLink, setJoiningLink] = useState('');
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
    if (/^[A-Z0-9]{6}$/.test(clean)) {
      return `MS-${clean}`;
    }
    return clean;
  };

  // Perform join action with a given code (Auto Reconnect & Re-use Device ID - Requirement 13)
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
      setError('Barcode detector is not supported in this browser. Please enter the session code manually.');
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '30px auto', padding: '0 20px' }}>
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
            background: 'var(--nm-surface-light)',
            border: 'var(--border-subtle)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            color: 'var(--accent-cyan)',
            marginBottom: '10px'
          }}>
            <Smartphone size={16} /> Pair Phone Screen
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '6px' }}>
            Join Multi-Phone Wall
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Connect your smartphone into the synchronized visual wall
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--accent-rose)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Device Nickname Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-label)', marginBottom: '6px', fontWeight: 600 }}>
            Device Nickname
          </label>
          <input
            type="text"
            placeholder="e.g. My iPhone / Screen 12"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            className="input-control"
          />
        </div>

        {/* Optional PIN Code (Requirement 14) */}
        {(needPin || activeTab === 'code') && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-label)', marginBottom: '6px', fontWeight: 600 }}>
              <Lock size={14} color="var(--accent-amber)" /> Session PIN {needPin ? '(Required)' : '(If Protected)'}
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

        {/* ── TAB 1: SCAN QR CODE ──────────────────────────────────── */}
        {activeTab === 'scan' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '100%',
              maxWidth: '320px',
              height: '240px',
              background: 'var(--nm-surface-dark)',
              borderRadius: 'var(--radius-lg)',
              position: 'relative',
              overflow: 'hidden',
              border: '2px solid var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: 'var(--shadow-md)'
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
                  <Camera size={44} color="var(--text-dim)" style={{ margin: '0 auto 10px' }} />
                  <p style={{ fontSize: '0.82rem', marginBottom: '12px' }}>
                    {hasCamera ? 'Starting camera...' : 'Camera unavailable or permission denied'}
                  </p>
                  <label className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <Upload size={14} /> Upload QR Screenshot
                    <input type="file" accept="image/*" onChange={handleQrFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              )}

              {/* Viewfinder Reticle Overlay */}
              <div style={{
                position: 'absolute',
                width: '180px',
                height: '180px',
                border: '2px solid var(--accent-cyan)',
                borderRadius: '16px',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '2px',
                  background: 'var(--accent-cyan)',
                  boxShadow: '0 0 8px var(--accent-cyan)'
                }} />
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginBottom: '18px', textAlign: 'center' }}>
              {scanMessage}
            </p>
          </div>
        )}

        {/* ── TAB 2: JOIN WITH LINK ────────────────────────────────── */}
        {activeTab === 'link' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeJoin(joiningLink);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-label)', marginBottom: '6px', fontWeight: 600 }}>
                Paste Session Link
              </label>
              <input
                type="text"
                placeholder="e.g. https://multy-sky.vercel.app/?join=MS-7K9X48"
                value={joiningLink}
                onChange={(e) => setJoiningLink(e.target.value)}
                required
                className="input-control"
              />
            </div>

            <button
              type="submit"
              disabled={isJoining}
              className="btn-primary"
              style={{ padding: '12px', fontSize: '0.95rem' }}
            >
              {isJoining ? 'Joining...' : <>Join Session with Link <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* ── TAB 3: ENTER SESSION ID ──────────────────────────────── */}
        {activeTab === 'code' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeJoin(sessionCode);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-label)', marginBottom: '6px', fontWeight: 600 }}>
                Session ID / Code
              </label>
              <input
                type="text"
                placeholder="e.g. MS-7K9X48"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                required
                className="input-control"
                style={{
                  fontSize: '1.3rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  textAlign: 'center'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isJoining}
              className="btn-primary"
              style={{ padding: '12px', fontSize: '0.95rem' }}
            >
              {isJoining ? 'Connecting to Wall...' : <>Join Session <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* ── 3 Bottom Switching Tabs ──────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: 'var(--border-subtle)'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={activeTab === 'scan' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 4px', fontSize: '0.78rem', flexDirection: 'column', gap: '4px' }}
          >
            <QrCode size={15} />
            <span>Scan QR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={activeTab === 'link' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 4px', fontSize: '0.78rem', flexDirection: 'column', gap: '4px' }}
          >
            <LinkIcon size={15} />
            <span>Join Link</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={activeTab === 'code' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 4px', fontSize: '0.78rem', flexDirection: 'column', gap: '4px' }}
          >
            <KeyRound size={15} />
            <span>Enter ID</span>
          </button>
        </div>
      </div>
    </div>
  );
}

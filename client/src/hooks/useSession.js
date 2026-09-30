import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket, broadcastLocal, subscribeLocal } from '../services/socket';
import { getSession } from '../services/api';

export function useSession({ sessionId, deviceId, role = 'display', deviceName = 'Screen' }) {
  const [session, setSession] = useState(null);
  const [device, setDevice] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [clockOffset, setClockOffset] = useState(0);

  const socketRef = useRef(null);

  // Sync clock drift with server
  const measureClockDrift = useCallback((socket) => {
    const t0 = Date.now();
    socket.emit('sync-ping', t0, ({ clientTimestamp, serverTimestamp }) => {
      const t3 = Date.now();
      const rtt = t3 - clientTimestamp;
      const offset = serverTimestamp - (clientTimestamp + rtt / 2);
      setClockOffset(offset);
    });
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const socket = getSocket();
    socketRef.current = socket;

    const joinRoom = () => {
      socket.emit('join-session', {
        sessionId,
        deviceId,
        role,
        deviceName,
        userAgent: navigator.userAgent
      }, (response) => {
        if (response?.success) {
          setSession(response.session);
          setDevice(response.device);
          setIsConnected(true);
          setError(null);
          measureClockDrift(socket);
        } else {
          setError(response?.message || 'Failed to join session');
        }
      });
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.on('connect', joinRoom);
    }

    // Socket Event Handlers
    const handleSessionUpdated = (updatedSession) => {
      setSession(prev => ({ ...prev, ...updatedSession }));
      if (deviceId) {
        const myDev = updatedSession.devices?.find(d => d.id === deviceId);
        if (myDev) setDevice(myDev);
      }
    };

    const handleLayoutChanged = ({ layout, devices }) => {
      setSession(prev => prev ? { ...prev, layout, devices } : prev);
      if (deviceId) {
        const myDev = devices?.find(d => d.id === deviceId);
        if (myDev) setDevice(myDev);
      }
    };

    const handlePositionChanged = ({ devices }) => {
      setSession(prev => prev ? { ...prev, devices } : prev);
      if (deviceId) {
        const myDev = devices?.find(d => d.id === deviceId);
        if (myDev) setDevice(myDev);
      }
    };

    const handleMediaChanged = ({ media, session: updatedSession }) => {
      setSession(prev => {
        const base = updatedSession || prev;
        return { ...base, media };
      });
    };

    const handleBezelChanged = ({ bezel }) => {
      setSession(prev => prev ? { ...prev, bezel } : prev);
    };

    const handleSessionEnded = () => {
      setSession(prev => prev ? { ...prev, status: 'ended' } : prev);
    };

    socket.on('session-updated', handleSessionUpdated);
    socket.on('layout-changed', handleLayoutChanged);
    socket.on('position-changed', handlePositionChanged);
    socket.on('media-changed', handleMediaChanged);
    socket.on('bezel-changed', handleBezelChanged);
    socket.on('session-ended', handleSessionEnded);

    // Initial fetch fallback
    getSession(sessionId).then(res => {
      if (res?.success && res.session) {
        setSession(res.session);
        if (deviceId) {
          const myDev = res.session.devices?.find(d => d.id === deviceId);
          if (myDev) setDevice(myDev);
        }
      }
    }).catch(console.warn);

    // Local BroadcastChannel redundancy
    const unsubLocal = subscribeLocal(({ type, data }) => {
      if (type === 'SESSION_UPDATE') {
        setSession(data);
      }
    });

    return () => {
      socket.off('connect', joinRoom);
      socket.off('session-updated', handleSessionUpdated);
      socket.off('layout-changed', handleLayoutChanged);
      socket.off('position-changed', handlePositionChanged);
      socket.off('media-changed', handleMediaChanged);
      socket.off('bezel-changed', handleBezelChanged);
      socket.off('session-ended', handleSessionEnded);
      unsubLocal();
    };
  }, [sessionId, deviceId, role, deviceName, measureClockDrift]);

  return {
    session,
    device,
    isConnected,
    error,
    clockOffset,
    socket: socketRef.current,
    refreshSession: async () => {
      const res = await getSession(sessionId);
      if (res?.success) setSession(res.session);
    }
  };
}

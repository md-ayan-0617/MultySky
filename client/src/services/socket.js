// socket.js - Real-time Socket.IO connection manager with fallback
import { io } from 'socket.io-client';

let socketInstance = null;
let broadcastChannel = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('multiscreen_channel');
  } catch (e) {
    console.warn('BroadcastChannel not supported');
  }
}

// Default production backend URL
const PROD_BACKEND_URL = 'https://multysky.onrender.com';

/**
 * Resolves the Socket.IO connection URL:
 * - If VITE_BACKEND_URL or VITE_API_URL is configured, uses that.
 * - In production (e.g. Vercel deployment), connects directly to https://multysky.onrender.com
 * - In development (localhost), connects via window.location.origin (proxied by Vite)
 */
export function getSocketUrl() {
  const envBackendUrl = (import.meta.env.VITE_BACKEND_URL || '').trim();
  const envApiUrl = (import.meta.env.VITE_API_URL || '').trim();

  // 1. Explicit env var override
  if (envBackendUrl) {
    return envBackendUrl.replace(/\/+$/, '');
  }
  if (envApiUrl) {
    const clean = envApiUrl.replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean.slice(0, -4) : clean;
  }

  // 2. Production (e.g. Vercel deployment) -> Render backend
  if (!import.meta.env.DEV) {
    return PROD_BACKEND_URL;
  }

  // 3. Localhost development: use Vite dev proxy
  if (typeof window !== 'undefined') {
    const { port, origin } = window.location;
    if (port === '3001') {
      return origin;
    }
    // In dev mode on port 5173 or LAN IP, Vite dev proxy forwards /socket.io
    return origin;
  }

  return 'http://localhost:3001';
}

export function getSocket() {
  if (!socketInstance) {
    const socketUrl = getSocketUrl();
    console.log('🔗 Connecting Socket.IO to:', socketUrl);

    socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Socket connected to server with ID:', socketInstance.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('⚠️ Socket disconnected:', reason);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('Socket connection error (using local fallback if applicable):', err.message);
    });
  }

  return socketInstance;
}

export function broadcastLocal(type, data) {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type, data, timestamp: Date.now() });
  }
}

export function subscribeLocal(callback) {
  if (!broadcastChannel) return () => {};
  const handler = (event) => callback(event.data);
  broadcastChannel.addEventListener('message', handler);
  return () => broadcastChannel.removeEventListener('message', handler);
}

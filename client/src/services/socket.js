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

export function getSocket() {
  if (!socketInstance) {
    // Determine backend URL dynamically based on environment
    let socketUrl = import.meta.env.VITE_BACKEND_URL;
    if (!socketUrl) {
      if (typeof window !== 'undefined') {
        const { hostname, port, protocol, origin } = window.location;
        const isPrivateIp = 
          hostname === 'localhost' || 
          hostname === '127.0.0.1' || 
          hostname.endsWith('.local') ||
          /^192\.168\./.test(hostname) || 
          /^10\./.test(hostname) ||
          /^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname);

        if (port === '3001') {
          socketUrl = origin;
        } else if (port === '5173' || isPrivateIp) {
          socketUrl = `http://${hostname}:3001`;
        } else {
          socketUrl = origin;
        }
      } else {
        socketUrl = 'http://localhost:3001';
      }
    }

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

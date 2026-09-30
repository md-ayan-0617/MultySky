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
    // When using Vite dev server with proxy or direct connection
    const socketUrl = window.location.origin;

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

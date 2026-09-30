import * as sessionService from '../services/sessionService.js';

export const registerSessionHandlers = (io, socket) => {
  // Join session room
  socket.on('join-session', ({ sessionId, deviceId, role = 'display', deviceName, userAgent }, callback) => {
    try {
      const session = sessionService.getSession(sessionId);
      if (!session) {
        if (callback) callback({ success: false, message: 'Session not found' });
        return;
      }

      socket.sessionId = sessionId;
      socket.deviceId = deviceId;
      socket.role = role;
      socket.join(`session:${sessionId}`);

      // Register device in session
      const { device } = sessionService.registerOrUpdateDevice(sessionId, {
        deviceId,
        deviceName,
        socketId: socket.id,
        role,
        userAgent
      });

      // Notify everyone in the room about device list update
      io.to(`session:${sessionId}`).emit('session-updated', session);
      io.to(`session:${sessionId}`).emit('device-joined', { device, session });

      if (callback) {
        callback({
          success: true,
          session,
          device,
          serverTime: Date.now()
        });
      }
    } catch (err) {
      console.error('Socket join-session error:', err);
      if (callback) callback({ success: false, message: err.message });
    }
  });

  // Layout change
  socket.on('change-layout', ({ sessionId, layoutId }, callback) => {
    const session = sessionService.updateSessionLayout(sessionId, layoutId);
    if (session) {
      io.to(`session:${sessionId}`).emit('layout-changed', {
        layout: session.layout,
        devices: session.devices,
        session
      });
      io.to(`session:${sessionId}`).emit('session-updated', session);
      if (callback) callback({ success: true, session });
    } else if (callback) {
      callback({ success: false, message: 'Session not found' });
    }
  });

  // Assign or move device position
  socket.on('change-device-position', ({ sessionId, deviceId, newIndex }, callback) => {
    const session = sessionService.updateDevicePosition(sessionId, deviceId, newIndex);
    if (session) {
      io.to(`session:${sessionId}`).emit('position-changed', {
        devices: session.devices,
        session
      });
      io.to(`session:${sessionId}`).emit('session-updated', session);
      if (callback) callback({ success: true, session });
    }
  });

  // Bezel adjustment update
  socket.on('update-bezel', ({ sessionId, bezel }, callback) => {
    const session = sessionService.getSession(sessionId);
    if (session) {
      session.bezel = { ...session.bezel, ...bezel };
      io.to(`session:${sessionId}`).emit('bezel-changed', { bezel: session.bezel });
      if (callback) callback({ success: true, bezel: session.bezel });
    }
  });

  // Clock sync (NTP style ping-pong)
  socket.on('sync-ping', (clientTimestamp, callback) => {
    if (callback) {
      callback({
        clientTimestamp,
        serverTimestamp: Date.now()
      });
    }
  });

  // End Session (FR-15)
  socket.on('end-session', ({ sessionId }, callback) => {
    const success = sessionService.endSession(sessionId);
    if (success) {
      io.to(`session:${sessionId}`).emit('session-ended', { sessionId });
      if (callback) callback({ success: true });
    } else if (callback) {
      callback({ success: false, message: 'Session not found' });
    }
  });

  // Master Fullscreen Request Broadcast (FR-11, FR-13)
  socket.on('broadcast-fullscreen', ({ sessionId }, callback) => {
    io.to(`session:${sessionId}`).emit('fullscreen-requested', {});
    if (callback) callback({ success: true });
  });

  // Device disconnect handling
  socket.on('disconnect', () => {
    if (socket.sessionId && socket.deviceId) {
      const session = sessionService.getSession(socket.sessionId);
      if (session) {
        const dev = session.devices.find(d => d.id === socket.deviceId);
        if (dev) {
          dev.status = 'disconnected';
          io.to(`session:${socket.sessionId}`).emit('device-status-change', {
            deviceId: socket.deviceId,
            status: 'disconnected',
            devices: session.devices
          });
          io.to(`session:${socket.sessionId}`).emit('session-updated', session);
        }
      }
    }
  });
};

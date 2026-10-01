import * as sessionService from '../services/sessionService.js';

export const registerSessionHandlers = (io, socket) => {
  // Join session room
  socket.on('join-session', ({ sessionId, deviceId, role = 'display', deviceName, userAgent, pin }, callback) => {
    try {
      const session = sessionService.getSession(sessionId);
      if (!session) {
        if (callback) callback({ success: false, message: 'Session not found' });
        return;
      }

      // Check PIN if required
      const regResult = sessionService.registerOrUpdateDevice(sessionId, {
        deviceId,
        deviceName,
        socketId: socket.id,
        role,
        userAgent,
        pin
      });

      if (regResult?.error) {
        if (callback) callback({ success: false, error: regResult.error, message: regResult.message });
        return;
      }

      const { device } = regResult;

      socket.sessionId = sessionId;
      socket.deviceId = deviceId;
      socket.role = role;
      socket.join(`session:${sessionId}`);

      // Notify everyone in the room about device list update & join media animation
      io.to(`session:${sessionId}`).emit('session-updated', session);
      io.to(`session:${sessionId}`).emit('device-joined', {
        device,
        session,
        joinMedia: session.joinMedia
      });

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

  // Device Identify (Requirement 5)
  const handleIdentify = ({ sessionId, deviceId }, callback) => {
    const sId = sessionId || socket.sessionId;
    const dId = deviceId || socket.deviceId;
    if (sId && dId) {
      io.to(`session:${sId}`).emit('device-identify', {
        deviceId: dId,
        timestamp: Date.now()
      });
      if (callback) callback({ success: true, deviceId: dId });
    }
  };
  socket.on('device-identify', handleIdentify);
  socket.on('device:identify', handleIdentify);

  // Device Approval / Rejection (Requirement 14)
  socket.on('device:approve', ({ sessionId, deviceId }, callback) => {
    const result = sessionService.approveDevice(sessionId, deviceId);
    if (result) {
      io.to(`session:${sessionId}`).emit('device-approved', { deviceId });
      io.to(`session:${sessionId}`).emit('session-updated', result.session);
      if (callback) callback({ success: true, session: result.session });
    } else if (callback) {
      callback({ success: false, message: 'Device not found' });
    }
  });

  socket.on('device:reject', ({ sessionId, deviceId }, callback) => {
    const result = sessionService.rejectDevice(sessionId, deviceId);
    if (result) {
      io.to(`session:${sessionId}`).emit('device-rejected', { deviceId });
      io.to(`session:${sessionId}`).emit('session-updated', result.session);
      if (callback) callback({ success: true, session: result.session });
    } else if (callback) {
      callback({ success: false, message: 'Device not found' });
    }
  });

  // Remove Device
  const handleRemoveDevice = ({ sessionId, deviceId }, callback) => {
    const success = sessionService.removeDevice(sessionId, deviceId);
    if (success) {
      const session = sessionService.getSession(sessionId);
      io.to(`session:${sessionId}`).emit('device-removed', { deviceId, exitMedia: session?.exitMedia });
      io.to(`session:${sessionId}`).emit('session-updated', session);
      if (callback) callback({ success: true, session });
    } else if (callback) {
      callback({ success: false, message: 'Device could not be removed' });
    }
  };
  socket.on('remove-device', handleRemoveDevice);
  socket.on('device:remove', handleRemoveDevice);

  // Layout change (supporting 1 to 100 devices)
  socket.on('change-layout', ({ sessionId, layoutId, layout }, callback) => {
    const session = sessionService.updateSessionLayout(sessionId, layout || layoutId);
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

  // Join & Exit Media Configuration (Requirement 6)
  const handleJoinExitMedia = ({ sessionId, joinMedia, exitMedia }, callback) => {
    const session = sessionService.updateJoinExitMedia(sessionId, { joinMedia, exitMedia });
    if (session) {
      io.to(`session:${sessionId}`).emit('session-updated', session);
      io.to(`session:${sessionId}`).emit('join-exit-media-updated', {
        joinMedia: session.joinMedia,
        exitMedia: session.exitMedia
      });
      if (callback) callback({ success: true, session });
    }
  };
  socket.on('update-join-exit-media', handleJoinExitMedia);
  socket.on('media:join-exit', handleJoinExitMedia);

  // Synchronized Timer (Requirement 9)
  const handleTimer = ({ sessionId, action, duration = 10 }, callback) => {
    const session = sessionService.updateTimer(sessionId, { action, duration });
    if (session) {
      io.to(`session:${sessionId}`).emit('timer-sync', {
        timer: session.timer,
        serverTimestamp: Date.now()
      });
      io.to(`session:${sessionId}`).emit('session-updated', session);
      if (callback) callback({ success: true, timer: session.timer });
    }
  };
  socket.on('timer:start', (data, cb) => handleTimer({ ...data, action: 'START' }, cb));
  socket.on('timer:pause', (data, cb) => handleTimer({ ...data, action: 'PAUSE' }, cb));
  socket.on('timer:reset', (data, cb) => handleTimer({ ...data, action: 'RESET' }, cb));
  socket.on('timer-control', handleTimer);

  // Blackout Display (Requirement 8)
  socket.on('display:blackout', ({ sessionId, blackout }, callback) => {
    const session = sessionService.setBlackout(sessionId, blackout);
    if (session) {
      io.to(`session:${sessionId}`).emit('blackout-toggled', { blackout: session.blackout });
      io.to(`session:${sessionId}`).emit('session-updated', session);
      if (callback) callback({ success: true, blackout: session.blackout });
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

  // End Session
  socket.on('end-session', ({ sessionId }, callback) => {
    const success = sessionService.endSession(sessionId);
    if (success) {
      io.to(`session:${sessionId}`).emit('session-ended', { sessionId });
      if (callback) callback({ success: true });
    } else if (callback) {
      callback({ success: false, message: 'Session not found' });
    }
  });

  // Master Fullscreen Request Broadcast
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
            devices: session.devices,
            exitMedia: session.exitMedia
          });
          io.to(`session:${socket.sessionId}`).emit('session-updated', session);
        }
      }
    }
  });
};

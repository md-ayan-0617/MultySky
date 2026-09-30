import * as sessionService from '../services/sessionService.js';

export const registerPlaybackHandlers = (io, socket) => {
  // Play command
  socket.on('playback-play', ({ sessionId, currentTime }, callback) => {
    const session = sessionService.getSession(sessionId);
    if (session) {
      session.playback.isPlaying = true;
      session.playback.currentTime = typeof currentTime === 'number' ? currentTime : session.playback.currentTime;
      session.playback.lastSyncTimestamp = Date.now();

      io.to(`session:${sessionId}`).emit('playback-command', {
        action: 'PLAY',
        currentTime: session.playback.currentTime,
        serverTimestamp: Date.now()
      });

      if (callback) callback({ success: true, playback: session.playback });
    }
  });

  // Pause command
  socket.on('playback-pause', ({ sessionId, currentTime }, callback) => {
    const session = sessionService.getSession(sessionId);
    if (session) {
      session.playback.isPlaying = false;
      session.playback.currentTime = typeof currentTime === 'number' ? currentTime : session.playback.currentTime;
      session.playback.lastSyncTimestamp = Date.now();

      io.to(`session:${sessionId}`).emit('playback-command', {
        action: 'PAUSE',
        currentTime: session.playback.currentTime,
        serverTimestamp: Date.now()
      });

      if (callback) callback({ success: true, playback: session.playback });
    }
  });

  // Seek command
  socket.on('playback-seek', ({ sessionId, currentTime }, callback) => {
    const session = sessionService.getSession(sessionId);
    if (session) {
      session.playback.currentTime = currentTime;
      session.playback.lastSyncTimestamp = Date.now();

      io.to(`session:${sessionId}`).emit('playback-command', {
        action: 'SEEK',
        currentTime,
        serverTimestamp: Date.now()
      });

      if (callback) callback({ success: true, playback: session.playback });
    }
  });

  // Restart command
  socket.on('playback-restart', ({ sessionId }, callback) => {
    const session = sessionService.getSession(sessionId);
    if (session) {
      session.playback.currentTime = 0;
      session.playback.isPlaying = true;
      session.playback.lastSyncTimestamp = Date.now();

      io.to(`session:${sessionId}`).emit('playback-command', {
        action: 'RESTART',
        currentTime: 0,
        serverTimestamp: Date.now()
      });

      if (callback) callback({ success: true, playback: session.playback });
    }
  });

  // Media changed
  socket.on('change-media', ({ sessionId, media }, callback) => {
    const session = sessionService.getSession(sessionId);
    if (session) {
      session.media = media;
      session.playback.currentTime = 0;
      session.playback.isPlaying = false;

      // Reset interactiveState based on media subType
      if (media?.subType === 'cyber') {
        session.interactiveState = {
          waveColor: '#00ffff',
          waveSpeed: 1.0,
          glitchActive: false,
          ripples: []
        };
      } else {
        session.interactiveState = {
          cakeCut: false,
          cutPosition: null,
          candlesBlown: false,
          confettiTriggered: 0
        };
      }

      io.to(`session:${sessionId}`).emit('media-changed', {
        media,
        session
      });
      io.to(`session:${sessionId}`).emit('session-updated', session);

      if (callback) callback({ success: true, media });
    }
  });

  // Interactive event (Cake + Cyber Wave Matrix events)
  socket.on('interactive-event', ({ sessionId, eventType, data }, callback) => {
    const session = sessionService.getSession(sessionId);
    if (session) {
      // ── Birthday Cake Events ──────────────────────────────────────────────
      if (eventType === 'CAKE_CUT') {
        session.interactiveState.cakeCut = true;
        session.interactiveState.cutPosition = data?.cutPosition || { x: 0.5, y: 0.5 };
      } else if (eventType === 'CANDLE_BLOW') {
        session.interactiveState.candlesBlown = true;
      } else if (eventType === 'RESET_CAKE') {
        session.interactiveState.cakeCut = false;
        session.interactiveState.candlesBlown = false;
      }

      // ── Cyber Wave Matrix Events ──────────────────────────────────────────
      else if (eventType === 'CYBER_RIPPLE') {
        // Append ripple to list (keep last 20 only)
        if (!session.interactiveState.ripples) session.interactiveState.ripples = [];
        session.interactiveState.ripples.push({
          globalX: data?.globalX ?? 0,
          globalY: data?.globalY ?? 0,
          t: data?.t ?? Date.now()
        });
        if (session.interactiveState.ripples.length > 20) {
          session.interactiveState.ripples = session.interactiveState.ripples.slice(-20);
        }
      } else if (eventType === 'CYBER_COLOR') {
        session.interactiveState.waveColor = data?.color ?? '#00ffff';
      } else if (eventType === 'CYBER_SPEED') {
        session.interactiveState.waveSpeed = Math.max(0.2, Math.min(4.0, data?.speed ?? 1.0));
      } else if (eventType === 'CYBER_GLITCH') {
        session.interactiveState.glitchActive = !!data?.active;
      } else if (eventType === 'CYBER_RESET') {
        session.interactiveState = {
          waveColor: data?.color || session.interactiveState.waveColor || '#00ffff',
          waveSpeed: 1.0,
          glitchActive: false,
          ripples: []
        };
      }

      // Broadcast immediately to all connected devices in room
      io.to(`session:${sessionId}`).emit('interactive-event', {
        eventType,
        data,
        interactiveState: session.interactiveState,
        serverTimestamp: Date.now()
      });

      if (callback) callback({ success: true, interactiveState: session.interactiveState });
    }
  });

  // End session
  socket.on('end-session', ({ sessionId }, callback) => {
    const session = sessionService.getSession(sessionId);
    if (session) {
      session.status = 'ended';
      io.to(`session:${sessionId}`).emit('session-ended', { sessionId });
      if (callback) callback({ success: true });
    }
  });
};

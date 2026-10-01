import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket, broadcastLocal, subscribeLocal } from '../services/socket';

export function usePlaybackSync({ sessionId, isMaster = false, clockOffset = 0, onInteractiveEvent }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [interactiveState, setInteractiveState] = useState({
    cakeCut: false,
    cutPosition: null,
    candlesBlown: false,
    waveColor: '#00ffff',
    waveSpeed: 1.0,
    glitchActive: false,
    ripples: []
  });

  const mediaRef = useRef(null); // Ref to video or audio element
  const socket = getSocket();

  // Master commands
  const play = useCallback((time) => {
    const t = typeof time === 'number' ? time : (mediaRef.current?.currentTime || 0);
    setIsPlaying(true);
    socket.emit('playback-play', { sessionId, currentTime: t });
    broadcastLocal('PLAYBACK_COMMAND', { action: 'PLAY', currentTime: t });
  }, [sessionId, socket]);

  const pause = useCallback((time) => {
    const t = typeof time === 'number' ? time : (mediaRef.current?.currentTime || 0);
    setIsPlaying(false);
    socket.emit('playback-pause', { sessionId, currentTime: t });
    broadcastLocal('PLAYBACK_COMMAND', { action: 'PAUSE', currentTime: t });
  }, [sessionId, socket]);

  const seek = useCallback((targetTime) => {
    setCurrentTime(targetTime);
    if (mediaRef.current) {
      mediaRef.current.currentTime = targetTime;
    }
    socket.emit('playback-seek', { sessionId, currentTime: targetTime });
    broadcastLocal('PLAYBACK_COMMAND', { action: 'SEEK', currentTime: targetTime });
  }, [sessionId, socket]);

  const restart = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(true);
    if (mediaRef.current) {
      mediaRef.current.currentTime = 0;
      mediaRef.current.play().catch(console.warn);
    }
    socket.emit('playback-restart', { sessionId });
    broadcastLocal('PLAYBACK_COMMAND', { action: 'RESTART', currentTime: 0 });
  }, [sessionId, socket]);

  const triggerInteractive = useCallback((eventType, data = {}) => {
    socket.emit('interactive-event', { sessionId, eventType, data });
    broadcastLocal('INTERACTIVE_EVENT', { eventType, data });

    setInteractiveState(prev => {
      const next = { ...prev };
      if (eventType === 'CAKE_CUT') {
        next.cakeCut = true;
        next.cutPosition = data?.cutPosition || { x: 0.5, y: 0.5 };
      } else if (eventType === 'CANDLE_BLOW') {
        next.candlesBlown = true;
      } else if (eventType === 'RESET_CAKE') {
        next.cakeCut = false;
        next.candlesBlown = false;
      } else if (eventType === 'CYBER_COLOR') {
        next.waveColor = data?.color || '#00ffff';
      } else if (eventType === 'CYBER_SPEED') {
        next.waveSpeed = data?.speed || 1.0;
      } else if (eventType === 'CYBER_GLITCH') {
        next.glitchActive = !!data?.active;
      } else if (eventType === 'CYBER_RESET') {
        next.waveColor = '#00ffff';
        next.waveSpeed = 1.0;
        next.glitchActive = false;
        next.ripples = [];
        next.customText = '';
      } else if (eventType === 'CUSTOM_TEXT') {
        next.customText = data?.text || '';
        next.textSize = data?.size || 32;
      } else if (eventType === 'CYBER_RIPPLE') {
        next.ripples = [...(next.ripples || []).slice(-15), { globalX: data?.globalX || 0, globalY: data?.globalY || 0, t: data?.t || Date.now() }];
      }
      return next;
    });
  }, [sessionId, socket]);

  useEffect(() => {
    if (!sessionId) return;

    const handlePlaybackCommand = ({ action, currentTime: targetTime, serverTimestamp }) => {
      // Calculate adjusted target time if playing
      let adjustedTime = targetTime;
      if (action === 'PLAY' && serverTimestamp) {
        const clientNow = Date.now() + clockOffset;
        const latencySec = Math.max(0, (clientNow - serverTimestamp) / 1000);
        adjustedTime += latencySec;
      }

      if (action === 'PLAY') {
        setIsPlaying(true);
        if (mediaRef.current) {
          if (Math.abs(mediaRef.current.currentTime - adjustedTime) > 0.3) {
            mediaRef.current.currentTime = adjustedTime;
          }
          mediaRef.current.play().catch(e => {
            console.log('Autoplay policy prevented playback until user tap:', e);
          });
        }
      } else if (action === 'PAUSE') {
        setIsPlaying(false);
        if (mediaRef.current) {
          mediaRef.current.pause();
          if (typeof targetTime === 'number') {
            mediaRef.current.currentTime = targetTime;
          }
        }
      } else if (action === 'SEEK') {
        setCurrentTime(targetTime);
        if (mediaRef.current) {
          mediaRef.current.currentTime = targetTime;
        }
      } else if (action === 'RESTART') {
        setCurrentTime(0);
        setIsPlaying(true);
        if (mediaRef.current) {
          mediaRef.current.currentTime = 0;
          mediaRef.current.play().catch(console.warn);
        }
      }
    };

    const handleInteractive = (payload) => {
      if (payload.interactiveState) {
        setInteractiveState(payload.interactiveState);
      }
      if (onInteractiveEvent) {
        onInteractiveEvent(payload);
      }
    };

    socket.on('playback-command', handlePlaybackCommand);
    socket.on('interactive-event', handleInteractive);

    const unsubLocal = subscribeLocal(({ type, data }) => {
      if (type === 'PLAYBACK_COMMAND') {
        handlePlaybackCommand(data);
      } else if (type === 'INTERACTIVE_EVENT') {
        handleInteractive(data);
      }
    });

    return () => {
      socket.off('playback-command', handlePlaybackCommand);
      socket.off('interactive-event', handleInteractive);
      unsubLocal();
    };
  }, [sessionId, clockOffset, onInteractiveEvent, socket]);

  return {
    isPlaying,
    currentTime,
    duration,
    setDuration,
    setCurrentTime,
    mediaRef,
    play,
    pause,
    seek,
    restart,
    interactiveState,
    triggerInteractive
  };
}

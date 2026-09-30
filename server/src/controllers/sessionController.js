import * as sessionService from '../services/sessionService.js';

export const createSession = (req, res) => {
  try {
    const { masterDeviceId, layoutId, initialMedia } = req.body || {};
    const session = sessionService.createSession({ masterDeviceId, layoutId, initialMedia });
    return res.status(201).json({ success: true, session });
  } catch (error) {
    console.error('Error creating session:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const joinSession = (req, res) => {
  try {
    const { sessionId, deviceId, deviceName, userAgent } = req.body || {};
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }

    const session = sessionService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or expired' });
    }

    if (session.status === 'ended') {
      return res.status(410).json({ success: false, message: 'This session has ended' });
    }

    const { device } = sessionService.registerOrUpdateDevice(sessionId, {
      deviceId,
      deviceName,
      userAgent
    });

    return res.json({ success: true, session, device });
  } catch (error) {
    console.error('Error joining session:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSessionById = (req, res) => {
  try {
    const { id } = req.params;
    const session = sessionService.getSession(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    return res.json({ success: true, session });
  } catch (error) {
    console.error('Error getting session:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLayout = (req, res) => {
  try {
    const { id } = req.params;
    const { layoutId } = req.body;
    const session = sessionService.updateSessionLayout(id, layoutId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    return res.json({ success: true, session });
  } catch (error) {
    console.error('Error updating layout:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const endSession = (req, res) => {
  try {
    const { id } = req.params;
    const success = sessionService.endSession(id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    return res.json({ success: true, message: 'Session ended' });
  } catch (error) {
    console.error('Error ending session:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

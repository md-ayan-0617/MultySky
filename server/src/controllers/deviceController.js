import * as sessionService from '../services/sessionService.js';

export const registerDevice = (req, res) => {
  try {
    const { id: sessionId } = req.params;
    const { deviceId, deviceName, userAgent } = req.body;

    const result = sessionService.registerOrUpdateDevice(sessionId, {
      deviceId,
      deviceName,
      userAgent
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    return res.json({ success: true, device: result.device, session: result.session });
  } catch (error) {
    console.error('Error registering device:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDevicePosition = (req, res) => {
  try {
    const { id: sessionId } = req.params;
    const { deviceId, newIndex } = req.body;

    const session = sessionService.updateDevicePosition(sessionId, deviceId, newIndex);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session or device not found' });
    }

    return res.json({ success: true, session });
  } catch (error) {
    console.error('Error updating device position:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeDevice = (req, res) => {
  try {
    const { id: sessionId, deviceId } = req.params;
    const success = sessionService.removeDevice(sessionId, deviceId);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Session or device not found' });
    }
    return res.json({ success: true, message: 'Device removed' });
  } catch (error) {
    console.error('Error removing device:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

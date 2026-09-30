// api.js - REST client for MultiScreen
const API_BASE = '/api';

export async function createSession(data = {}) {
  const res = await fetch(`${API_BASE}/session/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function joinSession(data) {
  const res = await fetch(`${API_BASE}/session/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getSession(id) {
  const res = await fetch(`${API_BASE}/session/${id}`);
  return res.json();
}

export async function updateLayout(sessionId, layoutId) {
  const res = await fetch(`${API_BASE}/session/${sessionId}/layout`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ layoutId })
  });
  return res.json();
}

export async function endSession(sessionId) {
  const res = await fetch(`${API_BASE}/session/${sessionId}/end`, {
    method: 'POST'
  });
  return res.json();
}

export async function registerDevice(sessionId, deviceData) {
  const res = await fetch(`${API_BASE}/session/${sessionId}/device`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deviceData)
  });
  return res.json();
}

export async function updateDevicePosition(sessionId, deviceId, newIndex) {
  const res = await fetch(`${API_BASE}/session/${sessionId}/device/position`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, newIndex })
  });
  return res.json();
}

export async function removeDevice(sessionId, deviceId) {
  const res = await fetch(`${API_BASE}/session/${sessionId}/device/${deviceId}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function getMediaList() {
  const res = await fetch(`${API_BASE}/media`);
  return res.json();
}

export async function uploadMedia(file, name, sessionId) {
  const formData = new FormData();
  formData.append('file', file);
  if (name) formData.append('name', name);
  if (sessionId) formData.append('sessionId', sessionId);

  const res = await fetch(`${API_BASE}/media/upload`, {
    method: 'POST',
    body: formData
  });
  return res.json();
}

export async function deleteMedia(id) {
  const res = await fetch(`${API_BASE}/media/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function getServerInfo() {
  try {
    const res = await fetch(`${API_BASE}/server-info`);
    return await res.json();
  } catch (e) {
    return {
      success: false,
      lanIps: [window.location.hostname],
      preferredIp: window.location.hostname
    };
  }
}

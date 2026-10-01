// api.js - REST client for MultiScreen

// Default production backend URL
const PROD_BACKEND_URL = 'https://multysky.onrender.com';

/**
 * Resolves the base URL for REST API requests.
 * - In development (Vite dev server), uses '/api' so requests go through the Vite proxy.
 * - In production (Vercel / deployed build), directs requests to https://multysky.onrender.com/api
 * - Can be overridden via VITE_API_URL or VITE_BACKEND_URL environment variables.
 */
export function getApiBase() {
  const envApiUrl = (import.meta.env.VITE_API_URL || '').trim();
  const envBackendUrl = (import.meta.env.VITE_BACKEND_URL || '').trim();

  // 1. Explicit env var override
  if (envApiUrl) {
    const clean = envApiUrl.replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  if (envBackendUrl) {
    const clean = envBackendUrl.replace(/\/+$/, '');
    return `${clean}/api`;
  }

  // 2. Localhost development: use relative '/api' for Vite dev proxy
  if (import.meta.env.DEV) {
    return '/api';
  }

  // 3. Production / Vercel: send requests directly to Render backend
  return `${PROD_BACKEND_URL}/api`;
}

export const API_BASE = getApiBase();

/**
 * Helper to safely parse responses from the server,
 * handling both JSON and fallback text/error formats.
 */
async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return {
      success: res.ok,
      message: text || res.statusText || 'Server responded with non-JSON format',
      status: res.status
    };
  }
}

export async function createSession(data = {}) {
  const res = await fetch(`${API_BASE}/session/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function joinSession(data) {
  const res = await fetch(`${API_BASE}/session/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function getSession(id) {
  const res = await fetch(`${API_BASE}/session/${id}`);
  return handleResponse(res);
}

export async function updateLayout(sessionId, layoutId) {
  const res = await fetch(`${API_BASE}/session/${sessionId}/layout`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ layoutId })
  });
  return handleResponse(res);
}

export async function endSession(sessionId) {
  const res = await fetch(`${API_BASE}/session/${sessionId}/end`, {
    method: 'POST'
  });
  return handleResponse(res);
}

export async function registerDevice(sessionId, deviceData) {
  const res = await fetch(`${API_BASE}/session/${sessionId}/device`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deviceData)
  });
  return handleResponse(res);
}

export async function updateDevicePosition(sessionId, deviceId, newIndex) {
  const res = await fetch(`${API_BASE}/session/${sessionId}/device/position`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, newIndex })
  });
  return handleResponse(res);
}

export async function removeDevice(sessionId, deviceId) {
  const res = await fetch(`${API_BASE}/session/${sessionId}/device/${deviceId}`, {
    method: 'DELETE'
  });
  return handleResponse(res);
}

export async function getMediaList() {
  const res = await fetch(`${API_BASE}/media`);
  return handleResponse(res);
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
  return handleResponse(res);
}

export async function deleteMedia(id) {
  const res = await fetch(`${API_BASE}/media/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(res);
}

export async function getServerInfo() {
  try {
    const res = await fetch(`${API_BASE}/server-info`);
    return await handleResponse(res);
  } catch (e) {
    return {
      success: false,
      lanIps: [window.location.hostname],
      preferredIp: window.location.hostname
    };
  }
}

import { API_BASE } from './api';

const TOKEN_KEY = 'ms-admin-jwt';

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token, persist = true) {
  if (token) {
    if (persist) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  } else {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

function getAuthHeaders(isJson = true) {
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  const token = getAdminToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-admin-token'] = token;
  }
  return headers;
}

async function handleRes(res) {
  const cType = res.headers.get('content-type') || '';
  if (cType.includes('application/json')) {
    return res.json();
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return {
      success: res.ok,
      message: text || res.statusText,
      status: res.status
    };
  }
}

// ── Authentication ───────────────────────────────────────────────────────────
export async function loginAdmin(password) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  const data = await handleRes(res);
  if (data?.success && data?.token) {
    setAdminToken(data.token, true);
  }
  return data;
}

export async function logoutAdmin() {
  try {
    await fetch(`${API_BASE}/admin/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (e) {
    console.warn('Logout network error', e);
  } finally {
    setAdminToken(null);
  }
  return { success: true };
}

export async function checkAdminAuth() {
  const token = getAdminToken();
  if (!token) return { success: false, authenticated: false };

  try {
    const res = await fetch(`${API_BASE}/admin/me`, {
      headers: getAuthHeaders()
    });
    const data = await handleRes(res);
    if (!data?.success) {
      setAdminToken(null);
    }
    return data;
  } catch {
    return { success: false, authenticated: false };
  }
}

export async function getAdminStats() {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: getAuthHeaders()
  });
  return handleRes(res);
}

// ── Public Gallery ───────────────────────────────────────────────────────────
export async function getPublicGallery() {
  try {
    const res = await fetch(`${API_BASE}/gallery`);
    return await handleRes(res);
  } catch (err) {
    console.warn('Using offline gallery fallback', err);
    return { success: false, categories: [] };
  }
}

export async function getCategoryImages(categorySlug) {
  try {
    const res = await fetch(`${API_BASE}/gallery/${categorySlug}`);
    return await handleRes(res);
  } catch (err) {
    console.warn('Using offline category fallback', err);
    return { success: false, images: [] };
  }
}

// ── Categories Management ────────────────────────────────────────────────────
export async function getCategories(isAdmin = false) {
  const res = await fetch(`${API_BASE}/categories`, {
    headers: isAdmin ? getAuthHeaders() : {}
  });
  return handleRes(res);
}

export async function createCategory(data) {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleRes(res);
}

export async function updateCategory(id, data) {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleRes(res);
}

export async function deleteCategory(id) {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleRes(res);
}

export async function reorderCategories(orderedIds) {
  const res = await fetch(`${API_BASE}/categories/reorder`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ orderedIds })
  });
  return handleRes(res);
}

// ── Images Management ────────────────────────────────────────────────────────
export async function getImages(filters = {}, isAdmin = false) {
  const params = new URLSearchParams();
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.categorySlug) params.append('categorySlug', filters.categorySlug);
  if (filters.sourceType) params.append('sourceType', filters.sourceType);
  if (filters.isPublished !== undefined) params.append('isPublished', filters.isPublished);
  if (filters.search) params.append('search', filters.search);

  const url = `${API_BASE}/images?${params.toString()}`;
  const res = await fetch(url, {
    headers: isAdmin ? getAuthHeaders() : {}
  });
  return handleRes(res);
}

export async function createImage(data) {
  const res = await fetch(`${API_BASE}/images`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleRes(res);
}

export async function uploadImageFiles(files, categoryId, title = '', description = '') {
  const formData = new FormData();
  if (Array.isArray(files)) {
    files.forEach(f => formData.append('files', f));
  } else {
    formData.append('files', files);
  }
  formData.append('categoryId', categoryId);
  if (title) formData.append('title', title);
  if (description) formData.append('description', description);

  const res = await fetch(`${API_BASE}/images/upload`, {
    method: 'POST',
    headers: getAuthHeaders(false), // don't set Content-Type for FormData
    body: formData
  });
  return handleRes(res);
}

export async function createBulkImages(categoryId, urls) {
  const res = await fetch(`${API_BASE}/images/bulk-url`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ categoryId, urls })
  });
  return handleRes(res);
}

export async function updateImage(id, data) {
  const res = await fetch(`${API_BASE}/images/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleRes(res);
}

export async function deleteImage(id) {
  const res = await fetch(`${API_BASE}/images/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleRes(res);
}

export async function getAdminImages(filters = {}) {
  return getImages(filters, true);
}

export async function uploadImageFile(formData) {
  const res = await fetch(`${API_BASE}/images/upload`, {
    method: 'POST',
    headers: getAuthHeaders(false),
    body: formData
  });
  return handleRes(res);
}

export async function bulkCreateImages(imagesOrCategory, urls) {
  if (Array.isArray(imagesOrCategory)) {
    // If passed array of { categoryId, imageUrl, title, etc. }
    const results = [];
    for (const item of imagesOrCategory) {
      const created = await createImage(item);
      results.push(created);
    }
    return results;
  }
  return createBulkImages(imagesOrCategory, urls);
}

export async function reorderImages(orderedIds) {
  const res = await fetch(`${API_BASE}/images/reorder`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ orderedIds })
  });
  return handleRes(res);
}

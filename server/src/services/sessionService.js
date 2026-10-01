// sessionService.js - In-memory and robust session management supporting up to 100 devices
export const sessions = new Map();

export const LAYOUTS = {
  '1x1': { id: '1x1', name: '1 × 1', rows: 1, cols: 1, total: 1, label: 'Single Screen' },
  '1x2': { id: '1x2', name: '1 × 2', rows: 1, cols: 2, total: 2, label: 'Dual Horizontal' },
  '2x1': { id: '2x1', name: '2 × 1', rows: 2, cols: 1, total: 2, label: 'Dual Vertical' },
  '2x2': { id: '2x2', name: '2 × 2', rows: 2, cols: 2, total: 4, label: 'Quad Display (2x2)' },
  '2x3': { id: '2x3', name: '2 × 3', rows: 2, cols: 3, total: 6, label: 'Wide Grid (2x3)' },
  '3x3': { id: '3x3', name: '3 × 3', rows: 3, cols: 3, total: 9, label: 'Mega Wall (3x3)' }
};

/**
 * Resolves layout from ID, preset name, or custom dimension object up to 100 phones.
 */
export const resolveLayout = (layoutInput) => {
  if (!layoutInput) return LAYOUTS['2x2'];

  if (typeof layoutInput === 'object') {
    const rows = Math.max(1, Math.min(10, parseInt(layoutInput.rows, 10) || 2));
    const cols = Math.max(1, Math.min(10, parseInt(layoutInput.cols, 10) || 2));
    const total = Math.min(100, Math.max(1, rows * cols));
    return {
      id: `${rows}x${cols}`,
      name: `${rows} × ${cols}`,
      rows,
      cols,
      total,
      label: `${rows}×${cols} Grid (${total} Screens)`
    };
  }

  const str = String(layoutInput).trim();
  if (LAYOUTS[str]) return LAYOUTS[str];

  const match = str.match(/^(\d+)x(\d+)$/i);
  if (match) {
    const rows = Math.max(1, Math.min(10, parseInt(match[1], 10)));
    const cols = Math.max(1, Math.min(10, parseInt(match[2], 10)));
    const total = Math.min(100, Math.max(1, rows * cols));
    return {
      id: `${rows}x${cols}`,
      name: `${rows} × ${cols}`,
      rows,
      cols,
      total,
      label: `${rows}×${cols} Grid (${total} Screens)`
    };
  }

  return LAYOUTS['2x2'];
};

export const generateSessionCode = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MS-${code}`;
};

export const getPositionLabel = (row, col, rows, cols) => {
  if (rows === 1 && cols === 1) return 'Full Screen';
  if (rows === 1 && cols === 2) return col === 0 ? 'Left Screen' : 'Right Screen';
  if (rows === 2 && cols === 1) return row === 0 ? 'Top Screen' : 'Bottom Screen';
  
  const vertical = row === 0 ? 'Top' : (row === rows - 1 ? 'Bottom' : `Row ${row + 1}`);
  const horizontal = col === 0 ? 'Left' : (col === cols - 1 ? 'Right' : `Col ${col + 1}`);
  
  if (cols <= 3 && rows <= 3) {
    return `${vertical} ${horizontal}`;
  }
  return `R${row + 1}:C${col + 1} (${vertical}-${horizontal})`;
};

export const createSession = ({ masterDeviceId = null, layoutId = '2x2', initialMedia = null, pin = null, requireApproval = false } = {}) => {
  const sessionId = generateSessionCode();
  const layout = resolveLayout(layoutId);

  const session = {
    id: sessionId,
    sessionCode: sessionId,
    masterDeviceId: masterDeviceId || `master-${Date.now()}`,
    pin: pin ? String(pin).trim() : null,
    requireApproval: !!requireApproval,
    layout,
    devices: [], // list of connected display devices (up to 100)
    media: initialMedia || {
      id: 'exp-cake-1',
      name: 'Virtual Birthday Cake Party',
      type: 'interactive',
      category: 'Interactive',
      subType: 'cake',
      thumbnail: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80'
    },
    joinMedia: {
      id: 'join-default',
      name: 'Welcome Flash Pulse',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80'
    },
    exitMedia: {
      id: 'exit-default',
      name: 'Farewell Starlight Pulse',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&auto=format&fit=crop&q=80'
    },
    blackout: false,
    timer: {
      isRunning: false,
      duration: 10,
      startTimestamp: null,
      targetTimestamp: null,
      remaining: 10
    },
    playback: {
      isPlaying: false,
      currentTime: 0,
      lastSyncTimestamp: Date.now(),
      playbackRate: 1.0,
      volume: 1.0,
      isMuted: false
    },
    bezel: {
      gapX: 3, // gap horizontal percentage
      gapY: 3, // gap vertical percentage
      scale: 100, // zoom percentage
      offsetX: 0,
      offsetY: 0
    },
    interactiveState: {
      cakeCut: false,
      cutPosition: null,
      candlesBlown: false,
      confettiTriggered: 0
    },
    status: 'active',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };

  sessions.set(sessionId, session);
  return session;
};

export const getSession = (sessionId) => {
  if (!sessionId) return null;
  const cleanId = sessionId.trim().toUpperCase();
  if (/^[A-Z0-9]{6}$/.test(cleanId)) {
    return sessions.get(`MS-${cleanId}`) || sessions.get(cleanId) || null;
  }
  return sessions.get(cleanId) || null;
};

export const updateSessionLayout = (sessionId, layoutInput) => {
  const session = getSession(sessionId);
  if (!session) return null;

  const layout = resolveLayout(layoutInput);
  session.layout = layout;

  // Re-assign or clamp device positions to new layout slots
  session.devices.forEach((dev, idx) => {
    const slotIdx = idx % layout.total;
    const row = Math.floor(slotIdx / layout.cols);
    const col = slotIdx % layout.cols;
    dev.position = {
      index: slotIdx,
      row,
      col,
      label: getPositionLabel(row, col, layout.rows, layout.cols)
    };
  });

  return session;
};

export const registerOrUpdateDevice = (sessionId, { deviceId, deviceName, socketId, role = 'display', userAgent = '', pin = '' }) => {
  const session = getSession(sessionId);
  if (!session) return null;

  // PIN verification if session is protected
  if (session.pin && role === 'display') {
    if (String(pin).trim() !== String(session.pin).trim()) {
      return { error: 'INVALID_PIN', message: 'Incorrect session PIN code' };
    }
  }

  let existing = session.devices.find(d => d.id === deviceId);

  if (existing) {
    existing.socketId = socketId || existing.socketId;
    if (existing.status === 'disconnected') {
      existing.status = session.requireApproval && existing.status !== 'approved' ? 'pending' : 'ready';
    }
    existing.lastSeen = Date.now();
    return { device: existing, session };
  }

  // Find next available slot in layout
  const usedSlots = new Set(session.devices.filter(d => d.status !== 'disconnected').map(d => d.position?.index));
  let assignedSlot = 0;
  for (let i = 0; i < session.layout.total; i++) {
    if (!usedSlots.has(i)) {
      assignedSlot = i;
      break;
    }
    if (i === session.layout.total - 1) {
      assignedSlot = session.devices.length % session.layout.total;
    }
  }

  const row = Math.floor(assignedSlot / session.layout.cols);
  const col = assignedSlot % session.layout.cols;

  const initialStatus = (session.requireApproval && role === 'display') ? 'pending' : 'ready';

  const newDevice = {
    id: deviceId || `dev-${Math.random().toString(36).substring(2, 8)}`,
    deviceCode: `P${String(session.devices.length + 1).padStart(2, '0')}`,
    name: deviceName || `Phone ${session.devices.length + 1}`,
    role,
    socketId,
    userAgent,
    position: {
      index: assignedSlot,
      row,
      col,
      label: getPositionLabel(row, col, session.layout.rows, session.layout.cols)
    },
    status: initialStatus,
    joinedAt: new Date().toISOString(),
    lastSeen: Date.now()
  };

  session.devices.push(newDevice);
  return { device: newDevice, session };
};

export const approveDevice = (sessionId, deviceId) => {
  const session = getSession(sessionId);
  if (!session) return null;

  const dev = session.devices.find(d => d.id === deviceId);
  if (!dev) return null;

  dev.status = 'ready';
  dev.lastSeen = Date.now();
  return { session, device: dev };
};

export const rejectDevice = (sessionId, deviceId) => {
  const session = getSession(sessionId);
  if (!session) return null;

  const idx = session.devices.findIndex(d => d.id === deviceId);
  if (idx !== -1) {
    const [removed] = session.devices.splice(idx, 1);
    return { session, removed };
  }
  return null;
};

export const removeDevice = (sessionId, deviceId) => {
  const session = getSession(sessionId);
  if (!session) return false;

  const idx = session.devices.findIndex(d => d.id === deviceId);
  if (idx !== -1) {
    session.devices.splice(idx, 1);
    return true;
  }
  return false;
};

export const updateDevicePosition = (sessionId, deviceId, newIndex) => {
  const session = getSession(sessionId);
  if (!session) return null;

  const dev = session.devices.find(d => d.id === deviceId);
  if (!dev) return null;

  const slotIdx = Math.max(0, Math.min(newIndex, session.layout.total - 1));
  const row = Math.floor(slotIdx / session.layout.cols);
  const col = slotIdx % session.layout.cols;

  dev.position = {
    index: slotIdx,
    row,
    col,
    label: getPositionLabel(row, col, session.layout.rows, session.layout.cols)
  };

  return session;
};

export const updateJoinExitMedia = (sessionId, { joinMedia, exitMedia }) => {
  const session = getSession(sessionId);
  if (!session) return null;

  if (joinMedia !== undefined) session.joinMedia = joinMedia;
  if (exitMedia !== undefined) session.exitMedia = exitMedia;

  return session;
};

export const updateTimer = (sessionId, { action, duration = 10 }) => {
  const session = getSession(sessionId);
  if (!session) return null;

  const now = Date.now();
  if (action === 'START') {
    const targetTimestamp = now + (duration * 1000);
    session.timer = {
      isRunning: true,
      duration,
      startTimestamp: now,
      targetTimestamp,
      remaining: duration
    };
  } else if (action === 'PAUSE') {
    session.timer.isRunning = false;
  } else if (action === 'RESET') {
    session.timer = {
      isRunning: false,
      duration,
      startTimestamp: null,
      targetTimestamp: null,
      remaining: duration
    };
  }

  return session;
};

export const setBlackout = (sessionId, blackout) => {
  const session = getSession(sessionId);
  if (!session) return null;
  session.blackout = !!blackout;
  return session;
};

export const endSession = (sessionId) => {
  const session = getSession(sessionId);
  if (!session) return false;
  session.status = 'ended';
  return true;
};

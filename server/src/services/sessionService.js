// sessionService.js - In-memory and robust session management
export const sessions = new Map();

export const LAYOUTS = {
  '1x1': { id: '1x1', name: '1 × 1', rows: 1, cols: 1, total: 1, label: 'Single Screen' },
  '1x2': { id: '1x2', name: '1 × 2', rows: 1, cols: 2, total: 2, label: 'Dual Horizontal' },
  '2x1': { id: '2x1', name: '2 × 1', rows: 2, cols: 1, total: 2, label: 'Dual Vertical' },
  '2x2': { id: '2x2', name: '2 × 2', rows: 2, cols: 2, total: 4, label: 'Quad Display (2x2)' },
  '2x3': { id: '2x3', name: '2 × 3', rows: 2, cols: 3, total: 6, label: 'Wide Grid (2x3)' },
  '3x3': { id: '3x3', name: '3 × 3', rows: 3, cols: 3, total: 9, label: 'Mega Wall (3x3)' }
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
  
  const vertical = row === 0 ? 'Top' : (row === rows - 1 ? 'Bottom' : 'Middle');
  const horizontal = col === 0 ? 'Left' : (col === cols - 1 ? 'Right' : 'Center');
  
  if (cols === 2 && rows === 2) {
    return `${vertical} ${horizontal}`;
  }
  return `Row ${row + 1}, Col ${col + 1} (${vertical}-${horizontal})`;
};

export const createSession = ({ masterDeviceId = null, layoutId = '2x2', initialMedia = null } = {}) => {
  const sessionId = generateSessionCode();
  const layout = LAYOUTS[layoutId] || LAYOUTS['2x2'];

  const session = {
    id: sessionId,
    sessionCode: sessionId,
    masterDeviceId: masterDeviceId || `master-${Date.now()}`,
    layout,
    devices: [], // list of connected display devices
    media: initialMedia || {
      id: 'exp-cake-1',
      name: 'Virtual Birthday Cake Party',
      type: 'interactive',
      category: 'Interactive',
      subType: 'cake',
      thumbnail: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80'
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
  return sessions.get(cleanId) || null;
};

export const updateSessionLayout = (sessionId, layoutId) => {
  const session = getSession(sessionId);
  if (!session) return null;

  const layout = LAYOUTS[layoutId] || LAYOUTS['2x2'];
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

export const registerOrUpdateDevice = (sessionId, { deviceId, deviceName, socketId, role = 'display', userAgent = '' }) => {
  const session = getSession(sessionId);
  if (!session) return null;

  let existing = session.devices.find(d => d.id === deviceId);

  if (existing) {
    existing.socketId = socketId || existing.socketId;
    existing.status = 'ready';
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

  const newDevice = {
    id: deviceId || `dev-${Math.random().toString(36).substring(2, 8)}`,
    deviceCode: `Device-${String(session.devices.length + 1).padStart(3, '0')}`,
    name: deviceName || `Screen ${session.devices.length + 1}`,
    role,
    socketId,
    userAgent,
    position: {
      index: assignedSlot,
      row,
      col,
      label: getPositionLabel(row, col, session.layout.rows, session.layout.cols)
    },
    status: 'ready',
    joinedAt: new Date().toISOString(),
    lastSeen: Date.now()
  };

  session.devices.push(newDevice);
  return { device: newDevice, session };
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

export const endSession = (sessionId) => {
  const session = getSession(sessionId);
  if (!session) return false;
  session.status = 'ended';
  return true;
};

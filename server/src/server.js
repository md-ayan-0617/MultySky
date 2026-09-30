import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

import sessionRoutes from './routes/sessionRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import { registerSessionHandlers } from './sockets/sessionSocket.js';
import { registerPlaybackHandlers } from './sockets/playbackSocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  pingTimeout: 20000,
  pingInterval: 10000
});

app.set('io', io);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads directory
const uploadsDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/session', sessionRoutes);
app.use('/api/media', mediaRoutes);

// Helper endpoint to get server local IP addresses (useful for QR code on mobile devices)
app.get('/api/server-info', (req, res) => {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const k in interfaces) {
    for (const k2 in interfaces[k]) {
      const address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        addresses.push(address.address);
      }
    }
  }

  res.json({
    success: true,
    lanIps: addresses,
    preferredIp: addresses[0] || 'localhost',
    port: process.env.PORT || 3001,
    clientPort: 5173
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Socket.IO event registrations
io.on('connection', (socket) => {
  registerSessionHandlers(io, socket);
  registerPlaybackHandlers(io, socket);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(`🚀 MultiScreen Backend Server is running!`);
  console.log(`📡 Local:   http://localhost:${PORT}`);
  
  const interfaces = os.networkInterfaces();
  for (const k in interfaces) {
    for (const k2 in interfaces[k]) {
      const address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        console.log(`📱 LAN:     http://${address.address}:${PORT}`);
      }
    }
  }
  console.log(`=================================================`);
});

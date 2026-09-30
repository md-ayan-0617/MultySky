import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('========================================================');
console.log('🚀 Launching MultiScreen Platform (Fullstack)');
console.log('========================================================');

// Discover network IPs
const interfaces = os.networkInterfaces();
let lanIp = 'localhost';
for (const k in interfaces) {
  for (const k2 in interfaces[k]) {
    const address = interfaces[k][k2];
    if (address.family === 'IPv4' && !address.internal) {
      lanIp = address.address;
      break;
    }
  }
}

// 1. Start Server
console.log('📡 Starting Backend & Socket.IO Server on port 3001...');
const serverProc = spawn('node', ['src/server.js'], {
  cwd: path.resolve(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

// 2. Start Client (Vite)
console.log('💻 Starting Vite React Frontend on port 5173...');
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const clientProc = spawn(npmCmd, ['run', 'dev', '--', '--host', '0.0.0.0'], {
  cwd: path.resolve(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  console.log('\n🛑 Shutting down MultiScreen...');
  serverProc.kill();
  clientProc.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

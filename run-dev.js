#!/usr/bin/env node

// Cross-platform development server startup script
// This script sets NODE_ENV and starts the server without requiring package.json changes

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set environment variable
process.env.NODE_ENV = 'development';

console.log('🚀 Starting Namhatta Management System...');
console.log('📁 Working directory:', __dirname);
console.log('🔧 Environment:', process.env.NODE_ENV);

// Start the server using tsx
const serverScript = join(__dirname, 'server', 'index.ts');
const child = spawn('npx', ['tsx', serverScript], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' },
  shell: true
});

child.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  child.kill('SIGTERM');
});
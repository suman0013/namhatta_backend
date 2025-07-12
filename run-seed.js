#!/usr/bin/env node

// Cross-platform seed script runner
// This script runs the TypeScript seed script using tsx

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set environment variable
process.env.NODE_ENV = 'development';

console.log('🌱 Running database seed script...');
console.log('📁 Working directory:', __dirname);

// Run the seed script using tsx
const seedScript = join(__dirname, 'seed-script.ts');
const child = spawn('npx', ['tsx', seedScript], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' },
  shell: true
});

child.on('error', (error) => {
  console.error('❌ Failed to run seed script:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log('✅ Seed script completed successfully');
  } else {
    console.log(`❌ Seed script exited with code ${code}`);
  }
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping seed script...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping seed script...');
  child.kill('SIGTERM');
});
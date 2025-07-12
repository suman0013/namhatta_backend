// Windows-compatible development script
process.env.NODE_ENV = 'development';

// Import and run the server
import('./server/index.ts').then(() => {
  console.log('Development server started successfully');
}).catch(error => {
  console.error('Failed to start development server:', error);
  process.exit(1);
});
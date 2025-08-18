// Database Configuration - Using IndexedDB for browser-based storage
// This file now simply exports the browserDB implementation

import browserDB from './browserDB';

// Export browserDB as the default database
export default browserDB;

// For backward compatibility with existing imports
export { browserDB as mongoDb };
export { browserDB as database }; 
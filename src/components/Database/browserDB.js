// Browser-Based Database using IndexedDB
// Works like MongoDB but runs entirely in the browser!
// No backend needed, supports large data (GBs), persistent storage

const DB_NAME = 'NeuroformDB';
const DB_VERSION = 1;

class BrowserDB {
  constructor() {
    this.db = null;
    this.init();
  }

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ Browser Database initialized!');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create collections (object stores)
        if (!db.objectStoreNames.contains('forms')) {
          const formsStore = db.createObjectStore('forms', { 
            keyPath: 'id', 
            autoIncrement: false 
          });
          formsStore.createIndex('formIDname', 'formIDname', { unique: false });
          formsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('submissions')) {
          const submissionsStore = db.createObjectStore('submissions', { 
            keyPath: 'id', 
            autoIncrement: false 
          });
          submissionsStore.createIndex('formId', 'formId', { unique: false });
          submissionsStore.createIndex('submittedAt', 'submittedAt', { unique: false });
        }
      };
    });
  }

  // Wait for DB to be ready
  async ready() {
    if (!this.db) {
      await this.init();
    }
    return this.db;
  }

  // MongoDB-like collection interface
  collection(name) {
    return {
      // Add document
      add: async (data) => {
        const db = await this.ready();
        const transaction = db.transaction([name], 'readwrite');
        const store = transaction.objectStore(name);
        
        const doc = {
          ...data,
          id: data.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: data.createdAt || new Date().toISOString()
        };
        
        return new Promise((resolve, reject) => {
          const request = store.add(doc);
          request.onsuccess = () => {
            console.log(`[IndexedDB] Added to ${name}:`, doc);
            resolve(doc);
          };
          request.onerror = () => reject(request.error);
        });
      },

      // Get all documents
      get: async () => {
        const db = await this.ready();
        const transaction = db.transaction([name], 'readonly');
        const store = transaction.objectStore(name);
        
        return new Promise((resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => {
            console.log(`[IndexedDB] Got ${request.result.length} documents from ${name}`);
            resolve(request.result);
          };
          request.onerror = () => reject(request.error);
        });
      },

      // Get single document
      doc: async (id) => {
        const db = await this.ready();
        const transaction = db.transaction([name], 'readonly');
        const store = transaction.objectStore(name);
        
        return new Promise((resolve, reject) => {
          const request = store.get(id);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      },

      // Update document
      update: async (id, data) => {
        const db = await this.ready();
        const transaction = db.transaction([name], 'readwrite');
        const store = transaction.objectStore(name);
        
        // Get existing document
        const existing = await new Promise((resolve, reject) => {
          const getRequest = store.get(id);
          getRequest.onsuccess = () => resolve(getRequest.result);
          getRequest.onerror = () => reject(getRequest.error);
        });

        if (!existing) return false;

        const updated = {
          ...existing,
          ...data,
          id,
          updatedAt: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
          const request = store.put(updated);
          request.onsuccess = () => {
            console.log(`[IndexedDB] Updated in ${name}:`, id);
            resolve(true);
          };
          request.onerror = () => reject(request.error);
        });
      },

      // Delete document
      delete: async (id) => {
        const db = await this.ready();
        const transaction = db.transaction([name], 'readwrite');
        const store = transaction.objectStore(name);
        
        return new Promise((resolve, reject) => {
          const request = store.delete(id);
          request.onsuccess = () => {
            console.log(`[IndexedDB] Deleted from ${name}:`, id);
            resolve(true);
          };
          request.onerror = () => reject(request.error);
        });
      },

      // Query with filters
      where: async (field, operator, value) => {
        const allDocs = await this.collection(name).get();
        
        return allDocs.filter(doc => {
          const fieldValue = doc[field];
          switch(operator) {
            case '==':
            case '===':
              return fieldValue === value;
            case '>':
              return fieldValue > value;
            case '<':
              return fieldValue < value;
            case '>=':
              return fieldValue >= value;
            case '<=':
              return fieldValue <= value;
            case '!=':
            case '!==':
              return fieldValue !== value;
            case 'in':
              return Array.isArray(value) && value.includes(fieldValue);
            case 'contains':
              return fieldValue && fieldValue.toString().includes(value);
            default:
              return false;
          }
        });
      },

      // Clear all documents in collection
      clear: async () => {
        const db = await this.ready();
        const transaction = db.transaction([name], 'readwrite');
        const store = transaction.objectStore(name);
        
        return new Promise((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => {
            console.log(`[IndexedDB] Cleared collection: ${name}`);
            resolve(true);
          };
          request.onerror = () => reject(request.error);
        });
      }
    };
  }

  // Export all data (for backup)
  async exportData() {
    const forms = await this.collection('forms').get();
    const submissions = await this.collection('submissions').get();
    
    const data = {
      forms,
      submissions,
      exportedAt: new Date().toISOString()
    };
    
    // Create download link
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuroform-backup-${Date.now()}.json`;
    a.click();
    
    return data;
  }

  // Import data (from backup)
  async importData(jsonData) {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    if (data.forms) {
      for (const form of data.forms) {
        await this.collection('forms').add(form);
      }
    }
    
    if (data.submissions) {
      for (const submission of data.submissions) {
        await this.collection('submissions').add(submission);
      }
    }
    
    console.log('✅ Data imported successfully!');
  }
}

// Create singleton instance
const browserDB = new BrowserDB();

// Export for use in components
export default browserDB;

// Also export as named export for flexibility
export { browserDB }; 
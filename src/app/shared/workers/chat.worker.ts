/// <reference lib="webworker" />

const DB_NAME = 'TabCacheDB';
const STORE_NAME = 'chat_cache';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Background Worker Event Listener
addEventListener('message', async ({ data }) => {
  const { action, payload } = data;

  if (action === 'PROCESS_AND_CACHE') {
    
    const cacheEntry = {
      id: payload.id,
      timestamp: Date.now(),
      raw: payload.data,
    };

    try {
      const db = await getDB();
      await saveToCache(db, cacheEntry);

      postMessage({
        action: 'CACHE_SUCCESS',
        payload: cacheEntry
      });
    } catch (error) {
      postMessage({ action: 'CACHE_ERROR', error: 'Failed to write to IndexedDB background thread' });
    }
  }

  if (action === 'FETCH_CACHE') {
    try {
      const db = await getDB();
      const cachedData = await getAllFromCache(db);;
      postMessage({ action: 'FETCH_SUCCESS', payload: cachedData });
    } catch (error) {
      postMessage({ action: 'FETCH_ERROR', error: 'Failed to read cache' });
    }
  }
});

// Helper: Write transactional data to database
function saveToCache(db: IDBDatabase, data: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
    const request = store.put(data);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Retrieves ALL items from the object store and sorts them chronologically
 */
function getAllFromCache(db: IDBDatabase): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const records = request.result || [];
      // Sort chronologically using your timestamp property so messages line up correctly
      const sortedRecords = records.sort((a, b) => a.timestamp - b.timestamp);
      resolve(sortedRecords);
    };

    request.onerror = () => {
      reject(transaction.error);
    };
  });

}
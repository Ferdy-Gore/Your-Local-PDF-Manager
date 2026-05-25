import { WorkspaceItem, SavedPDFBundle } from './types';

const DB_NAME = 'local_pdf_manager_db';
const DB_VERSION = 2;
const STORE_FAVORITES = 'favorites';
const STORE_BUNDLES = 'bundles';
const STORE_WORKSPACE = 'workspace';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_FAVORITES)) {
        db.createObjectStore(STORE_FAVORITES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_BUNDLES)) {
        db.createObjectStore(STORE_BUNDLES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_WORKSPACE)) {
        db.createObjectStore(STORE_WORKSPACE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open database'));
    };
  });
}

export async function getFavorites(): Promise<WorkspaceItem[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FAVORITES, 'readonly');
      const store = tx.objectStore(STORE_FAVORITES);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to fetch favorites'));
      };
    });
  } catch (err) {
    console.error('IndexedDB getFavorites error, checking localStorage fallback:', err);
    // Fallback to localStorage if IndexedDB fails (e.g. private browsing)
    try {
      const saved = localStorage.getItem('local_pdf_manager_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
}

export async function setFavorites(items: WorkspaceItem[]): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FAVORITES, 'readwrite');
      const store = tx.objectStore(STORE_FAVORITES);

      let addedCount = 0;
      let hasError = false;

      const clearReq = store.clear();
      clearReq.onsuccess = () => {
        if (items.length === 0) {
          tx.oncomplete = () => resolve();
          return;
        }

        items.forEach((item) => {
          const addReq = store.add(item);
          addReq.onerror = () => {
            if (!hasError) {
              hasError = true;
              reject(addReq.error || new Error('Failed to store favorite item'));
            }
          };
          addReq.onsuccess = () => {
            addedCount++;
            if (addedCount === items.length && !hasError) {
              // Wait for transaction to complete
              tx.oncomplete = () => resolve();
            }
          };
        });
      };

      clearReq.onerror = () => {
        reject(clearReq.error || new Error('Failed to clear favorites object store'));
      };

      tx.onerror = () => {
        if (!hasError) {
          reject(tx.error || new Error('Favorites transaction failed'));
        }
      };
    });
  } catch (err) {
    console.error('IndexedDB setFavorites error, testing localStorage fallback:', err);
    // Fallback behavior: try to save inside localStorage, if it fails then let it fail gracefully
    try {
      localStorage.setItem('local_pdf_manager_favorites', JSON.stringify(items));
    } catch (localStorageErr) {
      console.error('LocalStorage fallback also failed to save favorites:', localStorageErr);
      throw localStorageErr;
    }
  }
}

export async function getBundles(): Promise<SavedPDFBundle[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_BUNDLES, 'readonly');
      const store = tx.objectStore(STORE_BUNDLES);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to fetch bundles'));
      };
    });
  } catch (err) {
    console.error('IndexedDB getBundles error, checking localStorage fallback:', err);
    try {
      const saved = localStorage.getItem('local_pdf_manager_bundles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
}

export async function setBundles(items: SavedPDFBundle[]): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_BUNDLES, 'readwrite');
      const store = tx.objectStore(STORE_BUNDLES);

      let addedCount = 0;
      let hasError = false;

      const clearReq = store.clear();
      clearReq.onsuccess = () => {
        if (items.length === 0) {
          tx.oncomplete = () => resolve();
          return;
        }

        items.forEach((item) => {
          const addReq = store.add(item);
          addReq.onerror = () => {
            if (!hasError) {
              hasError = true;
              reject(addReq.error || new Error('Failed to store bundle item'));
            }
          };
          addReq.onsuccess = () => {
            addedCount++;
            if (addedCount === items.length && !hasError) {
              tx.oncomplete = () => resolve();
            }
          };
        });
      };

      clearReq.onerror = () => {
        reject(clearReq.error || new Error('Failed to clear bundles object store'));
      };

      tx.onerror = () => {
        if (!hasError) {
          reject(tx.error || new Error('Bundles transaction failed'));
        }
      };
    });
  } catch (err) {
    console.error('IndexedDB setBundles error, testing localStorage fallback:', err);
    try {
      localStorage.setItem('local_pdf_manager_bundles', JSON.stringify(items));
    } catch (localStorageErr) {
      console.error('LocalStorage fallback also failed to save bundles:', localStorageErr);
      throw localStorageErr;
    }
  }
}

export async function getWorkspaceItems(): Promise<WorkspaceItem[] | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_WORKSPACE, 'readonly');
      const store = tx.objectStore(STORE_WORKSPACE);
      const request = store.get('workspace_items');

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.items : null);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to fetch workspace items'));
      };
    });
  } catch (err) {
    console.error('IndexedDB getWorkspaceItems error, testing localStorage fallback:', err);
    try {
      const saved = localStorage.getItem('local_pdf_manager_workspace');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }
}

export async function setWorkspaceItems(items: WorkspaceItem[]): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_WORKSPACE, 'readwrite');
      const store = tx.objectStore(STORE_WORKSPACE);
      const request = store.put({ id: 'workspace_items', items });

      request.onsuccess = () => {
        tx.oncomplete = () => resolve();
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to store workspace items'));
      };
    });
  } catch (err) {
    console.error('IndexedDB setWorkspaceItems error, testing localStorage fallback:', err);
    try {
      localStorage.setItem('local_pdf_manager_workspace', JSON.stringify(items));
    } catch (localStorageErr) {
      console.error('LocalStorage fallback also failed to save workspace items:', localStorageErr);
    }
  }
}

// Offline Database using native IndexedDB for NataTale PWA Phase 2

export interface OfflinePhoto {
  localPhotoId: string;
  memoryLocalId: string;
  blob: Blob;
  cloudinaryUrl?: string;
  syncStatus: 'pending' | 'uploading' | 'synced' | 'failed';
}

export interface OfflineMemory {
  localId: string;
  id?: string; // MongoDB server _id if synced
  serverId?: string;
  title: string;
  date: string;
  location?: string;
  story?: string;
  category?: string;
  mood?: string;
  rating?: number;
  spotifyUrl?: string;
  spotifyTitle?: string;
  spotifyArtist?: string;
  images: string[]; // Can contain blob ObjectURLs or Cloudinary URLs
  localPhotoIds?: string[]; // IDs linking to offline_photos store
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  syncAction?: 'create' | 'update' | 'delete'; // For sync queue
  createdAt: string;
  updatedAt: string;
  lastSyncError?: string;
}

export interface OfflineLetter {
  localId: string;
  id?: string; // MongoDB server _id if synced
  serverId?: string;
  sender: string;
  recipient: string;
  title: string;
  content: string;
  category: string;
  signature?: string;
  isOpened: boolean;
  openedAt?: string | null;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  syncAction?: 'create' | 'update' | 'delete';
  createdAt: string;
  updatedAt: string;
  lastSyncError?: string;
}

const DB_NAME = 'natatale_offline_db';
const DB_VERSION = 2; // Incremented for letters store
const MEMORIES_STORE = 'offline_memories';
const PHOTOS_STORE = 'offline_photos';
const LETTERS_STORE = 'offline_letters';

let dbPromise: Promise<IDBDatabase> | null = null;

export function openOfflineDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store for local memories & sync queue
      if (!db.objectStoreNames.contains(MEMORIES_STORE)) {
        const memoryStore = db.createObjectStore(MEMORIES_STORE, { keyPath: 'localId' });
        memoryStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        memoryStore.createIndex('serverId', 'serverId', { unique: false });
      }

      // Store for raw photo blobs
      if (!db.objectStoreNames.contains(PHOTOS_STORE)) {
        const photoStore = db.createObjectStore(PHOTOS_STORE, { keyPath: 'localPhotoId' });
        photoStore.createIndex('memoryLocalId', 'memoryLocalId', { unique: false });
        photoStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      }

      // Store for offline letters & sync queue
      if (!db.objectStoreNames.contains(LETTERS_STORE)) {
        const letterStore = db.createObjectStore(LETTERS_STORE, { keyPath: 'localId' });
        letterStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        letterStore.createIndex('serverId', 'serverId', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

// --- Photo Blob Storage Operations ---

export async function saveOfflinePhoto(photo: OfflinePhoto): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTOS_STORE, 'readwrite');
    const store = tx.objectStore(PHOTOS_STORE);
    const req = store.put(photo);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getOfflinePhoto(localPhotoId: string): Promise<OfflinePhoto | undefined> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTOS_STORE, 'readonly');
    const store = tx.objectStore(PHOTOS_STORE);
    const req = store.get(localPhotoId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getPhotosForMemory(memoryLocalId: string): Promise<OfflinePhoto[]> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTOS_STORE, 'readonly');
    const store = tx.objectStore(PHOTOS_STORE);
    const index = store.index('memoryLocalId');
    const req = index.getAll(memoryLocalId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteOfflinePhotosForMemory(memoryLocalId: string): Promise<void> {
  const db = await openOfflineDb();
  const photos = await getPhotosForMemory(memoryLocalId);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTOS_STORE, 'readwrite');
    const store = tx.objectStore(PHOTOS_STORE);
    photos.forEach(p => store.delete(p.localPhotoId));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// --- Offline Memory Operations ---

export async function saveOfflineMemory(memory: OfflineMemory): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEMORIES_STORE, 'readwrite');
    const store = tx.objectStore(MEMORIES_STORE);
    const req = store.put(memory);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getOfflineMemory(localId: string): Promise<OfflineMemory | undefined> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEMORIES_STORE, 'readonly');
    const store = tx.objectStore(MEMORIES_STORE);
    const req = store.get(localId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllOfflineMemories(): Promise<OfflineMemory[]> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEMORIES_STORE, 'readonly');
    const store = tx.objectStore(MEMORIES_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingMemories(): Promise<OfflineMemory[]> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEMORIES_STORE, 'readonly');
    const store = tx.objectStore(MEMORIES_STORE);
    const req = store.getAll();
    req.onsuccess = () => {
      const all: OfflineMemory[] = req.result || [];
      const pending = all.filter(m => m.syncStatus === 'pending' || m.syncStatus === 'failed');
      resolve(pending);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteOfflineMemory(localId: string): Promise<void> {
  const db = await openOfflineDb();
  await deleteOfflinePhotosForMemory(localId);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEMORIES_STORE, 'readwrite');
    const store = tx.objectStore(MEMORIES_STORE);
    const req = store.delete(localId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// --- Offline Letters Operations ---

export async function saveOfflineLetter(letter: OfflineLetter): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LETTERS_STORE, 'readwrite');
    const store = tx.objectStore(LETTERS_STORE);
    const req = store.put(letter);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getOfflineLetter(localId: string): Promise<OfflineLetter | undefined> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LETTERS_STORE, 'readonly');
    const store = tx.objectStore(LETTERS_STORE);
    const req = store.get(localId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllOfflineLetters(): Promise<OfflineLetter[]> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LETTERS_STORE, 'readonly');
    const store = tx.objectStore(LETTERS_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingLetters(): Promise<OfflineLetter[]> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LETTERS_STORE, 'readonly');
    const store = tx.objectStore(LETTERS_STORE);
    const req = store.getAll();
    req.onsuccess = () => {
      const all: OfflineLetter[] = req.result || [];
      const pending = all.filter(l => l.syncStatus === 'pending' || l.syncStatus === 'failed');
      resolve(pending);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteOfflineLetter(localId: string): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LETTERS_STORE, 'readwrite');
    const store = tx.objectStore(LETTERS_STORE);
    const req = store.delete(localId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}


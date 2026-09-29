// Sync Engine for NataTale PWA Phase 2
import {
  getPendingMemories,
  getPhotosForMemory,
  saveOfflineMemory,
  saveOfflinePhoto,
  deleteOfflineMemory,
  OfflineMemory
} from './offlineDb';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || '';
const CLOUD_NAME = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;

let isSyncing = false;
type SyncCallback = (status: { isSyncing: boolean; countPending: number; lastSynced?: Date; error?: string }) => void;
const listeners = new Set<SyncCallback>();

export function onSyncStatusChange(cb: SyncCallback): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notifyListeners(status: { isSyncing: boolean; countPending: number; lastSynced?: Date; error?: string }) {
  listeners.forEach(cb => {
    try {
      cb(status);
    } catch (e) {
      console.error('Error in sync listener:', e);
    }
  });
}

// Upload a single blob to Cloudinary
async function uploadBlobToCloudinary(blob: Blob): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary credentials missing');
  }

  const formData = new FormData();
  formData.append('file', blob);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Cloudinary upload failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  if (!data.secure_url) {
    throw new Error('Cloudinary response did not contain secure_url');
  }

  return data.secure_url;
}

// Process a single memory sync
export async function syncSingleMemory(memory: OfflineMemory): Promise<OfflineMemory> {
  // If this memory was marked for delete
  if (memory.syncAction === 'delete') {
    if (memory.serverId) {
      const res = await fetch(`${API_BASE_URL}/api/memories/${memory.serverId}`, {
        method: 'DELETE'
      });
      if (!res.ok && res.status !== 404) {
        throw new Error(`Failed to delete memory from server (${res.status})`);
      }
    }
    await deleteOfflineMemory(memory.localId);
    return memory;
  }

  // 1. Mark as syncing
  memory.syncStatus = 'syncing';
  await saveOfflineMemory(memory);

  // 2. Upload any offline photo blobs to Cloudinary
  const offlinePhotos = await getPhotosForMemory(memory.localId);
  const updatedImages: string[] = [];

  // Iterate images
  for (let i = 0; i < memory.images.length; i++) {
    const imgUrl = memory.images[i];
    
    // Already a Cloudinary URL or remote URL
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
      updatedImages.push(imgUrl);
      continue;
    }

    // Check if we have an offline photo blob stored for this index or ID
    const matchingPhoto = offlinePhotos[i] || offlinePhotos.find(p => p.localPhotoId === memory.localPhotoIds?.[i]);

    if (matchingPhoto && matchingPhoto.blob) {
      // If already uploaded previously
      if (matchingPhoto.cloudinaryUrl) {
        updatedImages.push(matchingPhoto.cloudinaryUrl);
      } else {
        matchingPhoto.syncStatus = 'uploading';
        await saveOfflinePhoto(matchingPhoto);

        const uploadedUrl = await uploadBlobToCloudinary(matchingPhoto.blob);
        matchingPhoto.cloudinaryUrl = uploadedUrl;
        matchingPhoto.syncStatus = 'synced';
        await saveOfflinePhoto(matchingPhoto);
        updatedImages.push(uploadedUrl);
      }
    } else if (imgUrl.startsWith('data:')) {
      // Fallback: Data URL / base64
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const uploadedUrl = await uploadBlobToCloudinary(blob);
      updatedImages.push(uploadedUrl);
    } else {
      // Retain as is
      updatedImages.push(imgUrl);
    }
  }

  // 3. Prepare payload for MongoDB
  const payload = {
    title: memory.title,
    date: memory.date,
    location: memory.location || '',
    story: memory.story || '',
    images: updatedImages,
    category: memory.category || '',
    mood: memory.mood || '🥰',
    rating: memory.rating || 5,
    spotifyUrl: memory.spotifyUrl || '',
    spotifyTitle: memory.spotifyTitle || '',
    spotifyArtist: memory.spotifyArtist || ''
  };

  let serverId = memory.serverId;

  if (memory.syncAction === 'update' && serverId) {
    // PUT update existing server memory
    const res = await fetch(`${API_BASE_URL}/api/memories/${serverId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Server update failed (${res.status})`);
    }
  } else {
    // POST create new server memory
    const res = await fetch(`${API_BASE_URL}/api/memories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Server save failed (${res.status})`);
    }

    const savedDoc = await res.json();
    serverId = savedDoc._id || savedDoc.id;
  }

  // 4. Mark as Synced in IndexedDB
  memory.serverId = serverId;
  memory.id = serverId; // Match frontend ID
  memory.images = updatedImages;
  memory.syncStatus = 'synced';
  memory.syncAction = undefined;
  memory.lastSyncError = undefined;
  memory.updatedAt = new Date().toISOString();

  await saveOfflineMemory(memory);
  return memory;
}

// Run Sync Queue for all pending memories
export async function syncPendingMemories(onSuccessItem?: (syncedMem: OfflineMemory) => void): Promise<{ successCount: number; failCount: number }> {
  if (isSyncing) return { successCount: 0, failCount: 0 };
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { successCount: 0, failCount: 0 };
  }

  isSyncing = true;
  let successCount = 0;
  let failCount = 0;

  try {
    const pending = await getPendingMemories();
    notifyListeners({ isSyncing: true, countPending: pending.length });

    for (const mem of pending) {
      try {
        const synced = await syncSingleMemory(mem);
        successCount++;
        if (onSuccessItem) {
          onSuccessItem(synced);
        }
      } catch (err: any) {
        console.error('Failed to sync memory:', mem.localId, err);
        failCount++;
        mem.syncStatus = 'failed';
        mem.lastSyncError = err?.message || 'Sync failed';
        await saveOfflineMemory(mem);
      }
    }

    const remaining = await getPendingMemories();
    notifyListeners({
      isSyncing: false,
      countPending: remaining.length,
      lastSynced: successCount > 0 ? new Date() : undefined,
      error: failCount > 0 ? `${failCount} memory failed to sync` : undefined
    });
  } catch (globalErr: any) {
    console.error('Global sync queue error:', globalErr);
  } finally {
    isSyncing = false;
  }

  return { successCount, failCount };
}

// --- LETTERS SYNC ENGINE ---

import {
  getPendingLetters,
  saveOfflineLetter,
  deleteOfflineLetter,
  OfflineLetter
} from './offlineDb';

export async function syncSingleLetter(letter: OfflineLetter): Promise<OfflineLetter> {
  // If marked for deletion
  if (letter.syncAction === 'delete') {
    if (letter.serverId) {
      const res = await fetch(`${API_BASE_URL}/api/letters/${letter.serverId}`, {
        method: 'DELETE'
      });
      if (!res.ok && res.status !== 404) {
        throw new Error(`Failed to delete letter on server (${res.status})`);
      }
    }
    await deleteOfflineLetter(letter.localId);
    return letter;
  }

  // 1. Mark as syncing
  letter.syncStatus = 'syncing';
  await saveOfflineLetter(letter);

  // 2. Prepare payload
  const payload = {
    sender: letter.sender,
    recipient: letter.recipient,
    title: letter.title,
    content: letter.content,
    category: letter.category,
    signature: letter.signature || '',
    isOpened: letter.isOpened,
    openedAt: letter.openedAt,
    createdAt: letter.createdAt
  };

  let serverId = letter.serverId;

  if (letter.syncAction === 'update' && serverId) {
    const res = await fetch(`${API_BASE_URL}/api/letters/${serverId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Server update letter failed (${res.status})`);
    }
  } else {
    const res = await fetch(`${API_BASE_URL}/api/letters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Server save letter failed (${res.status})`);
    }

    const savedDoc = await res.json();
    serverId = savedDoc._id || savedDoc.id;
  }

  // 3. Mark as synced locally
  letter.serverId = serverId;
  letter.id = serverId;
  letter.syncStatus = 'synced';
  letter.syncAction = undefined;
  letter.lastSyncError = undefined;
  letter.updatedAt = new Date().toISOString();

  await saveOfflineLetter(letter);
  return letter;
}

export async function syncPendingLetters(onSuccessItem?: (syncedLetter: OfflineLetter) => void): Promise<{ successCount: number; failCount: number }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { successCount: 0, failCount: 0 };
  }

  let successCount = 0;
  let failCount = 0;

  try {
    const pending = await getPendingLetters();
    for (const letter of pending) {
      try {
        const synced = await syncSingleLetter(letter);
        successCount++;
        if (onSuccessItem) {
          onSuccessItem(synced);
        }
      } catch (err: any) {
        console.error('Failed to sync letter:', letter.localId, err);
        failCount++;
        letter.syncStatus = 'failed';
        letter.lastSyncError = err?.message || 'Sync failed';
        await saveOfflineLetter(letter);
      }
    }
  } catch (err) {
    console.error('Letter sync queue error:', err);
  }

  return { successCount, failCount };
}

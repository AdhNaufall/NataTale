import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { FloatingParticles } from './components/FloatingParticles';
import Timeline from './pages/Timeline';
import Archive from './pages/Archive';
import Write from './pages/Write';
import Story from './pages/Story';
import Us from './pages/Us';
import { Navigation } from './components/Navigation';
import LockScreen from './components/LockScreen';
import { memoriesData } from './data';
import {
  saveOfflineMemory,
  saveOfflinePhoto,
  getAllOfflineMemories,
  getOfflinePhoto,
  deleteOfflineMemory,
  OfflineMemory
} from './lib/offlineDb';
import { syncPendingMemories, onSyncStatusChange } from './lib/syncEngine';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || '';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('tanalumina_unlocked') === 'true';
  });
  const [currentPath, setCurrentPath] = useState('/');
  const [memories, setMemories] = useState<any[]>(() => {
    const localData = localStorage.getItem('natatale_memories');
    return localData ? JSON.parse(localData) : memoriesData;
  });
  const [editingMemory, setEditingMemory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(() => {
    return !localStorage.getItem('natatale_memories');
  });

  // Offline and Sync Status Banner
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncInfo, setSyncInfo] = useState<{ isSyncing: boolean; countPending: number; lastSynced?: Date; error?: string }>({
    isSyncing: false,
    countPending: 0
  });
  const [showSyncSuccessToast, setShowSyncSuccessToast] = useState(false);

  // Helper to safely merge server memories with local IndexedDB memories (preserving offline pending items)
  const mergeMemories = useCallback(async (serverList: any[]) => {
    try {
      const offlineList = await getAllOfflineMemories();
      
      // Deduplicate: If an offline memory is synced and matches a server item's ID or serverId, don't show twice
      const serverIds = new Set(serverList.map((m: any) => m.id || m._id));
      
      // Filter offline memories that are still pending or failed, or not yet in server list
      const pendingOrLocalOnly = offlineList.filter((offMem) => {
        if (offMem.syncAction === 'delete') return false; // Hide pending deletions
        if (offMem.serverId && serverIds.has(offMem.serverId)) return false;
        if (offMem.id && serverIds.has(offMem.id)) return false;
        return true;
      });

      // Format pending memories to match view schema & resolve local photo blobs if needed
      const formattedLocal: any[] = [];
      for (const offMem of pendingOrLocalOnly) {
        // Resolve images: if images array has local photo references or empty, attempt blob recovery
        let resolvedImages = [...(offMem.images || [])];
        if (offMem.localPhotoIds && offMem.localPhotoIds.length > 0) {
          for (let i = 0; i < offMem.localPhotoIds.length; i++) {
            if (!resolvedImages[i] || resolvedImages[i].startsWith('blob:')) {
              const photo = await getOfflinePhoto(offMem.localPhotoIds[i]);
              if (photo && photo.blob) {
                resolvedImages[i] = URL.createObjectURL(photo.blob);
              }
            }
          }
        }

        formattedLocal.push({
          id: offMem.localId,
          localId: offMem.localId,
          serverId: offMem.serverId,
          title: offMem.title,
          date: offMem.date,
          location: offMem.location,
          story: offMem.story,
          images: resolvedImages,
          category: offMem.category,
          mood: offMem.mood,
          rating: offMem.rating,
          spotifyUrl: offMem.spotifyUrl || '',
          spotifyTitle: offMem.spotifyTitle || '',
          spotifyArtist: offMem.spotifyArtist || '',
          syncStatus: offMem.syncStatus || 'pending'
        });
      }

      // Combine and sort by date ascending
      const combined = [...serverList, ...formattedLocal].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setMemories(combined);
      localStorage.setItem('natatale_memories', JSON.stringify(combined));
    } catch (e) {
      console.error('Error merging offline and server memories:', e);
      setMemories(serverList);
      localStorage.setItem('natatale_memories', JSON.stringify(serverList));
    }
  }, []);

  const fetchMemories = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      // Offline: load strictly from local IndexedDB & localStorage cache
      const localData = localStorage.getItem('natatale_memories');
      const cached = localData ? JSON.parse(localData) : memoriesData;
      await mergeMemories(cached);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/memories`);
      if (!res.ok) throw new Error('Backend not available');
      const data = await res.json();
      if (Array.isArray(data)) {
        await mergeMemories(data);
      }
    } catch (err) {
      console.warn('Failed to load memories from DB (using local cache/IndexedDB):', err);
      const localData = localStorage.getItem('natatale_memories');
      const cached = localData ? JSON.parse(localData) : memoriesData;
      await mergeMemories(cached);
    } finally {
      setIsLoading(false);
    }
  }, [mergeMemories]);

  // Initial load
  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  // Online / Offline Detection and Sync Trigger
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger background sync immediately when connection returns
      syncPendingMemories(() => {
        fetchMemories();
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to sync status changes
    const unsubscribeSync = onSyncStatusChange((status) => {
      setSyncInfo(status);
      if (!status.isSyncing && status.countPending === 0 && status.lastSynced) {
        setShowSyncSuccessToast(true);
        setTimeout(() => setShowSyncSuccessToast(false), 4000);
      }
    });

    // Initial check for pending syncs
    if (navigator.onLine) {
      syncPendingMemories(() => {
        fetchMemories();
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeSync();
    };
  }, [fetchMemories]);

  const navigate = (path: string) => {
    setCurrentPath(path);
  };

  // 1. ADD MEMORY: Offline-First Flow
  const addMemory = async (newMemory: any) => {
    const localId = 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const localPhotoIds: string[] = [];

    // Save photo blobs to IndexedDB
    if (newMemory.imageBlobs && newMemory.imageBlobs.length > 0) {
      for (let i = 0; i < newMemory.imageBlobs.length; i++) {
        const blob = newMemory.imageBlobs[i];
        const photoId = `photo_${localId}_${i}`;
        localPhotoIds.push(photoId);

        await saveOfflinePhoto({
          localPhotoId: photoId,
          memoryLocalId: localId,
          blob,
          cloudinaryUrl: newMemory.images?.[i]?.startsWith('http') ? newMemory.images[i] : undefined,
          syncStatus: 'pending'
        });
      }
    }

    const offlineMemDoc: OfflineMemory = {
      localId,
      title: newMemory.title,
      date: newMemory.date,
      location: newMemory.location,
      story: newMemory.story,
      category: newMemory.category,
      mood: newMemory.mood,
      rating: newMemory.rating,
      spotifyUrl: newMemory.spotifyUrl,
      spotifyTitle: newMemory.spotifyTitle,
      spotifyArtist: newMemory.spotifyArtist,
      images: newMemory.images || [],
      localPhotoIds,
      syncStatus: 'pending',
      syncAction: 'create',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to local IndexedDB immediately
    await saveOfflineMemory(offlineMemDoc);

    // Optimistically update UI
    const optimisticMemory = {
      ...newMemory,
      id: localId,
      localId,
      syncStatus: 'pending'
    };
    const updated = [...memories, optimisticMemory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setMemories(updated);
    localStorage.setItem('natatale_memories', JSON.stringify(updated));

    // If online, kick off sync in background
    if (navigator.onLine) {
      syncPendingMemories(() => {
        fetchMemories();
      });
    }
  };

  // 2. UPDATE MEMORY: Offline-First Flow
  const updateMemory = async (id: string, updatedMemory: any) => {
    const existing = memories.find(m => m.id === id || m.localId === id);
    const localId = existing?.localId || id;
    const serverId = existing?.serverId || (id.startsWith('local_') ? undefined : id);

    const offlineMemDoc: OfflineMemory = {
      localId,
      serverId,
      id: serverId || localId,
      title: updatedMemory.title,
      date: updatedMemory.date,
      location: updatedMemory.location,
      story: updatedMemory.story,
      category: updatedMemory.category,
      mood: updatedMemory.mood,
      rating: updatedMemory.rating,
      spotifyUrl: updatedMemory.spotifyUrl,
      spotifyTitle: updatedMemory.spotifyTitle,
      spotifyArtist: updatedMemory.spotifyArtist,
      images: updatedMemory.images || [],
      syncStatus: 'pending',
      syncAction: serverId ? 'update' : 'create',
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveOfflineMemory(offlineMemDoc);

    const updatedList = memories.map((m: any) => 
      (m.id === id || m.localId === id) ? { ...m, ...updatedMemory, syncStatus: 'pending' } : m
    );
    setMemories(updatedList);
    localStorage.setItem('natatale_memories', JSON.stringify(updatedList));
    setEditingMemory(null);

    if (navigator.onLine) {
      syncPendingMemories(() => {
        fetchMemories();
      });
    }
  };

  // 3. DELETE MEMORY: Offline-First Flow
  const deleteMemory = async (id: string) => {
    const existing = memories.find(m => m.id === id || m.localId === id);
    const localId = existing?.localId || id;
    const serverId = existing?.serverId || (id.startsWith('local_') ? undefined : id);

    if (serverId) {
      // Mark as pending deletion in IndexedDB
      await saveOfflineMemory({
        localId,
        serverId,
        title: existing?.title || '',
        date: existing?.date || '',
        images: [],
        syncStatus: 'pending',
        syncAction: 'delete',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      // Local only, can directly delete from IndexedDB
      await deleteOfflineMemory(localId);
    }

    const updatedList = memories.filter((m: any) => m.id !== id && m.localId !== id);
    setMemories(updatedList);
    localStorage.setItem('natatale_memories', JSON.stringify(updatedList));

    if (navigator.onLine) {
      syncPendingMemories(() => {
        fetchMemories();
      });
    }
  };

  const handleEdit = (memory: any) => {
    setEditingMemory(memory);
    navigate('/write');
  };

  if (!isAuthenticated) {
    return (
      <LockScreen 
        onUnlock={() => {
          setIsAuthenticated(true);
          sessionStorage.setItem('tanalumina_unlocked', 'true');
        }} 
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background bg-noise flex flex-col items-center justify-center font-sans text-slate relative overflow-hidden">
        <FloatingParticles />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center z-10"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="mb-4"
          >
            <Heart className="w-16 h-16 text-softblue fill-softblue/30 drop-shadow-lg" />
          </motion.div>
          
          {/* Cute NataTale Text */}
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-handwriting text-4xl text-softblue font-bold tracking-wider drop-shadow-sm"
          >
            NataTale
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-xs text-softblue/60 mt-2 font-serif uppercase tracking-[0.2em]"
          >
            Loading our memories...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const pageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -4, transition: { duration: 0.18, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-background bg-noise font-sans text-slate selection:bg-softblue selection:text-white relative">
      <FloatingParticles />

      {/* Discreet Offline / Sync Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-amber-500/90 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-2 border border-amber-400/40 select-none pointer-events-none"
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span>You're offline — memories will be saved on this device.</span>
          </motion.div>
        )}

        {isOnline && syncInfo.isSyncing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-softblue/90 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-2 border border-blue-400/40 select-none pointer-events-none"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Back online — syncing your memories...</span>
          </motion.div>
        )}

        {isOnline && !syncInfo.isSyncing && showSyncSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-600/90 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-2 border border-emerald-400/40 select-none pointer-events-none"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All memories are synced ♡</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Route Content */}
      <main className="pb-32 relative z-10">
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
          <motion.div
            key={currentPath}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full"
          >
            {currentPath === '/' && <Timeline memories={memories} onEdit={handleEdit} onDelete={deleteMemory} navigate={navigate} />}
            {currentPath === '/archive' && <Archive memories={memories} />}
            {currentPath === '/write' && <Write onSave={addMemory} onUpdate={updateMemory} navigate={navigate} memories={memories} editingMemory={editingMemory} setEditingMemory={setEditingMemory} />}
            {currentPath === '/story' && <Story memories={memories} navigate={navigate} />}
            {currentPath === '/us' && <Us memories={memories} navigate={navigate} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Navigation */}
      <Navigation currentPath={currentPath} navigate={navigate} />
    </div>
  );
}

export default App;

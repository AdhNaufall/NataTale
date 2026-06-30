import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { FloatingParticles } from './components/FloatingParticles';
import Timeline from './pages/Timeline';
import Archive from './pages/Archive';
import Write from './pages/Write';
import Us from './pages/Us';
import { Navigation } from './components/Navigation';
import LockScreen from './components/LockScreen';
import { memoriesData } from './data';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || '';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('tanalumina_unlocked') === 'true';
  });
  const [currentPath, setCurrentPath] = useState('/');
  const [memories, setMemories] = useState(() => {
    const localData = localStorage.getItem('natatale_memories');
    return localData ? JSON.parse(localData) : memoriesData;
  });
  const [editingMemory, setEditingMemory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMemories = () => {
    fetch(`${API_BASE_URL}/api/memories`)
      .then(res => {
        if (!res.ok) throw new Error('Backend not available');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setMemories(data);
          localStorage.setItem('natatale_memories', JSON.stringify(data));
        }
        setTimeout(() => setIsLoading(false), 1500); 
      })
      .catch(err => {
        console.error('Failed to load memories from DB:', err);
        setTimeout(() => setIsLoading(false), 1500);
      });
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addMemory = async (newMemory: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMemory)
      });
      if (res.ok) {
        fetchMemories();
      }
    } catch (err) {
      console.error('Failed to save to MongoDB:', err);
      // Fallback update for UX if backend is off
      const newMemoriesWithId = { ...newMemory, id: Date.now().toString() };
      const updated = [...memories, newMemoriesWithId].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setMemories(updated);
      localStorage.setItem('natatale_memories', JSON.stringify(updated));
    }
  };

  const updateMemory = async (id: string, updatedMemory: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/memories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMemory)
      });
      if (res.ok) {
        fetchMemories();
        setEditingMemory(null);
      }
    } catch (err) {
      const updatedList = memories.map(m => m.id === id ? { ...m, ...updatedMemory } : m);
      setMemories(updatedList);
      localStorage.setItem('natatale_memories', JSON.stringify(updatedList));
      setEditingMemory(null);
    }
  };

  const deleteMemory = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/memories/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchMemories();
      }
    } catch (err) {
      const updatedList = memories.filter(m => m.id !== id);
      setMemories(updatedList);
      localStorage.setItem('natatale_memories', JSON.stringify(updatedList));
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
          localStorage.setItem('tanalumina_unlocked', 'true');
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
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
  };

  return (
    <div className="min-h-screen bg-background bg-noise font-sans text-slate selection:bg-softblue selection:text-white relative">
      <FloatingParticles />
      {/* Route Content */}
      <main className="pb-32 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full"
          >
            {currentPath === '/' && <Timeline memories={memories} onEdit={handleEdit} onDelete={deleteMemory} />}
            {currentPath === '/archive' && <Archive memories={memories} />}
            {currentPath === '/write' && <Write onSave={addMemory} onUpdate={updateMemory} navigate={navigate} memories={memories} editingMemory={editingMemory} setEditingMemory={setEditingMemory} />}
            {currentPath === '/us' && <Us memories={memories} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Navigation */}
      <Navigation currentPath={currentPath} navigate={navigate} />
    </div>
  );
}

export default App;

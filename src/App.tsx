import React, { useState, useEffect } from 'react';
import Timeline from './pages/Timeline';
import Archive from './pages/Archive';
import Write from './pages/Write';
import Us from './pages/Us';
import { Navigation } from './components/Navigation';
import LockScreen from './components/LockScreen';
import { memoriesData } from './data';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('tanalumina_unlocked') === 'true';
  });
  const [currentPath, setCurrentPath] = useState('/');
  const [memories, setMemories] = useState(memoriesData);
  const [editingMemory, setEditingMemory] = useState<any>(null);

  const fetchMemories = () => {
    fetch('http://localhost:3001/api/memories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMemories(data);
      })
      .catch(err => console.error('Failed to load memories from DB:', err));
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
      const res = await fetch('http://localhost:3001/api/memories', {
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
      const updated = [...memories, newMemory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setMemories(updated);
    }
  };

  const updateMemory = async (id: string, updatedMemory: any) => {
    try {
      const res = await fetch(`http://localhost:3001/api/memories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMemory)
      });
      if (res.ok) {
        fetchMemories();
        setEditingMemory(null);
      }
    } catch (err) {
      console.error('Failed to update memory in MongoDB:', err);
    }
  };

  const deleteMemory = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/memories/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchMemories();
      }
    } catch (err) {
      console.error('Failed to delete memory from MongoDB:', err);
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

  return (
    <div className="min-h-screen bg-background bg-noise font-sans text-slate selection:bg-softblue selection:text-white">
      {/* Route Content */}
      <main className="pb-32">
        {currentPath === '/' && <Timeline memories={memories} onEdit={handleEdit} onDelete={deleteMemory} />}
        {currentPath === '/archive' && <Archive memories={memories} onEdit={handleEdit} onDelete={deleteMemory} />}
        {currentPath === '/write' && <Write onSave={addMemory} onUpdate={updateMemory} navigate={navigate} memories={memories} editingMemory={editingMemory} setEditingMemory={setEditingMemory} />}
        {currentPath === '/us' && <Us memories={memories} />}
      </main>

      {/* Global Navigation */}
      <Navigation currentPath={currentPath} navigate={navigate} />
    </div>
  );
}

export default App;

import { useState } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Archive({ memories }: { memories: any[] }) {
  const [filter, setFilter] = useState('');
  
  const allCategories = Array.from(new Set(memories.map(m => m.category).filter(Boolean)));
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredMemories = memories.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(filter.toLowerCase()) || (m.location && m.location.toLowerCase().includes(filter.toLowerCase()));
    const matchesCategory = activeCategory ? m.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-12 pb-32 px-4 max-w-4xl mx-auto">
      <h2 className="font-serif text-4xl font-bold text-slate mb-8 text-center">The Archive</h2>

      {/* Search and Filters */}
      <div className="mb-10 space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search memories..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-softblue focus:ring-1 focus:ring-softblue outline-none bg-white shadow-sm transition-all"
          />
        </div>
        
        <div className="flex flex-wrap justify-center gap-2">
          <button 
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${!activeCategory ? 'bg-lavender text-white' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
          >
            All
          </button>
          {allCategories.map(cat => (
            <button 
              key={cat as string}
              onClick={() => setActiveCategory(cat as string)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${activeCategory === cat ? 'bg-lavender text-white' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
            >
              {cat as string}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry Grid Simulation (CSS Columns) */}
      <motion.div layout className="columns-2 md:columns-3 gap-4">
        <AnimatePresence>
          {filteredMemories.flatMap(m => (m.images || [m.image]).filter(Boolean).map((img: string, idx: number) => ({ id: `${m.id}-${idx}`, img }))).map((item) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              key={item.id} 
              className="break-inside-avoid rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group cursor-pointer mb-4"
            >
              <img src={item.img} alt="Archive" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      
      {filteredMemories.length === 0 && (
        <div className="text-center text-gray-400 mt-20">No memories found.</div>
      )}
    </div>
  );
}

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
            className="w-full pl-12 pr-4 py-4 rounded-3xl border-none outline-none bg-background shadow-clay-input transition-all duration-300 ease-out focus:shadow-[inset_6px_6px_10px_rgba(0,0,0,0.06),inset_-6px_-6px_10px_rgba(255,255,255,0.9)]"
          />
        </div>
        
        <div className="flex flex-wrap justify-center gap-2">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(null)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${!activeCategory ? 'bg-lavender text-white shadow-clay-btn-active' : 'bg-background text-gray-500 hover:text-lavender shadow-clay-btn'}`}
          >
            All
          </motion.button>
          {allCategories.map(cat => (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={cat as string}
              onClick={() => setActiveCategory(cat as string)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeCategory === cat ? 'bg-lavender text-white shadow-clay-btn-active' : 'bg-background text-gray-500 hover:text-lavender shadow-clay-btn'}`}
            >
              {cat as string}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Masonry Grid Simulation (CSS Columns) */}
      <div className="columns-2 md:columns-3 gap-4">
        <AnimatePresence>
          {filteredMemories.flatMap(m => (m.images || [m.image]).filter(Boolean).map((img: string, idx: number) => ({ id: `${m.id}-${idx}`, img }))).map((item) => (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              key={item.id} 
              className="break-inside-avoid rounded-[2rem] p-2 sm:p-3 bg-background shadow-clay-card hover:shadow-polaroid transition-all duration-500 relative group cursor-pointer mb-6"
            >
              <img src={item.img} alt="Archive" className="w-full h-auto rounded-[1.5rem] object-cover group-hover:scale-[1.02] transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-[2rem]"></div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {filteredMemories.length === 0 && (
        <div className="text-center text-gray-400 mt-20">No memories found.</div>
      )}
    </div>
  );
}

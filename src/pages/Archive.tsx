import { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Heart, 
  MapPin, 
  Calendar as CalendarIcon, 
  Star, 
  Music2, 
  X, 
  Plus, 
  Edit, 
  Trash2, 
  Camera, 
  BookOpen 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { Carousel } from '../components/Carousel';

interface ArchiveProps {
  memories: any[];
  onEdit?: (m: any) => void;
  onDelete?: (id: string) => void;
  navigate?: (path: string) => void;
}

interface PhotoWallItem {
  id: string;
  type: 'photo' | 'text';
  imgUrl?: string;
  imgIndex?: number;
  totalImages?: number;
  memory: any;
  rotation: number;
  aspectClass: string;
}

export default function Archive({ memories, onEdit, onDelete, navigate }: ArchiveProps) {
  const [filter, setFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<any | null>(null);

  // Extract unique categories from memories
  const allCategories = useMemo(() => {
    return Array.from(new Set(memories.map(m => m.category).filter(Boolean)));
  }, [memories]);

  // Total summary counts
  const totalChapters = memories.length;
  const totalPhotos = useMemo(() => {
    return memories.reduce((acc, curr) => acc + (curr.images?.length || (curr.image ? 1 : 0)), 0);
  }, [memories]);
  const totalPlaces = useMemo(() => {
    return new Set(memories.map(m => m.location?.trim()).filter(Boolean)).size;
  }, [memories]);

  // Filter memories based on search query & active category
  const filteredMemories = useMemo(() => {
    return memories.filter(m => {
      const searchLower = filter.toLowerCase().trim();
      const matchesSearch = !searchLower || 
        m.title?.toLowerCase().includes(searchLower) || 
        m.location?.toLowerCase().includes(searchLower) ||
        m.story?.toLowerCase().includes(searchLower) ||
        m.category?.toLowerCase().includes(searchLower) ||
        m.spotifyTitle?.toLowerCase().includes(searchLower) ||
        m.spotifyArtist?.toLowerCase().includes(searchLower);

      const matchesCategory = activeCategory 
        ? (activeCategory === '__with_song__' ? Boolean(m.spotifyUrl) : m.category === activeCategory)
        : true;

      return matchesSearch && matchesCategory;
    });
  }, [memories, filter, activeCategory]);

  // Rotation angles for organic scrapbooking feel
  const rotations = useMemo(() => [-1.8, 1.4, -0.9, 1.8, -1.3, 0.8, -2.1, 1.6], []);
  const aspectRatios = useMemo(() => [
    'aspect-[4/5]', 
    'aspect-square', 
    'aspect-[3/4]', 
    'aspect-[4/5]', 
    'aspect-square', 
    'aspect-[3/4]'
  ], []);

  // Construct wall items: each photo is a pinned polaroid, memories without photos become text cards
  const wallItems = useMemo<PhotoWallItem[]>(() => {
    const items: PhotoWallItem[] = [];
    let itemIdx = 0;

    filteredMemories.forEach(m => {
      const memoryImages: string[] = (m.images && m.images.length > 0) ? m.images : (m.image ? [m.image] : []);

      if (memoryImages.length > 0) {
        memoryImages.forEach((imgUrl, imgIdx) => {
          items.push({
            id: `${m.id}-photo-${imgIdx}`,
            type: 'photo',
            imgUrl,
            imgIndex: imgIdx,
            totalImages: memoryImages.length,
            memory: m,
            rotation: rotations[itemIdx % rotations.length],
            aspectClass: aspectRatios[itemIdx % aspectRatios.length]
          });
          itemIdx++;
        });
      } else {
        // Text Scrapbook Card for memories without photos
        items.push({
          id: `${m.id}-text`,
          type: 'text',
          memory: m,
          rotation: rotations[itemIdx % rotations.length],
          aspectClass: 'aspect-[4/5]'
        });
        itemIdx++;
      }
    });

    return items;
  }, [filteredMemories, rotations, aspectRatios]);

  return (
    <div className="min-h-screen pt-8 pb-36 px-4 sm:px-6 max-w-6xl mx-auto font-sans text-slate selection:bg-lavender/30 relative">
      
      {/* Dreamy Ambient Background Blobs */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-lavender/15 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute top-80 right-1/4 w-80 h-80 bg-rose/15 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-softblue/15 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* 1. HERO SECTION */}
      <div className="text-center max-w-2xl mx-auto mb-10 select-none">
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/75 backdrop-blur-md rounded-full border border-lavender/25 shadow-xs text-xs font-bold uppercase tracking-[0.2em] text-lavender mb-3"
        >
          <Sparkles className="w-3.5 h-3.5 text-lavender" />
          <span>Our Digital Scrapbook</span>
          <Heart className="w-3.5 h-3.5 fill-rose/50 text-rose" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="font-serif text-4xl sm:text-6xl font-bold text-slate tracking-tight mb-2"
        >
          Our Photo Wall <span className="font-handwriting text-5xl sm:text-7xl font-normal text-lavender block sm:inline">♡</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-serif italic text-sm sm:text-base text-slate/60 max-w-md mx-auto leading-relaxed mb-5"
        >
          “Little pieces of us, pinned on our digital wall to be remembered forever.”
        </motion.p>

        {/* Dynamic Mini Counter Ribbon */}
        {totalChapters > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-4 px-5 py-2 bg-white/75 backdrop-blur-xl border border-white/80 rounded-full shadow-xs text-xs font-semibold text-slate/75"
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-softblue" />
              <strong>{totalChapters}</strong> {totalChapters === 1 ? 'Chapter' : 'Chapters'}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate/20 hidden sm:inline" />
            <span className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-lavender" />
              <strong>{totalPhotos}</strong> Photos
            </span>
            {totalPlaces > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate/20 hidden sm:inline" />
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <strong>{totalPlaces}</strong> Places
                </span>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* 2. SEARCH & FILTER SECTION */}
      <div className="mb-10 max-w-2xl mx-auto space-y-4">
        {/* Soft Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-lavender absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search our moments, places, stories..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-white/80 focus:border-lavender/50 focus:ring-2 focus:ring-lavender/30 outline-none bg-white/80 backdrop-blur-xl shadow-xs text-xs sm:text-sm text-slate placeholder:text-gray-400 transition-all font-sans"
          />
          {filter && (
            <button
              type="button"
              onClick={() => setFilter('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200/70 hover:bg-gray-200 text-slate/60 flex items-center justify-center text-xs transition-colors"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        
        {/* Scrapbook Pill Filters (Horizontally Scrollable on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar sm:flex-wrap sm:justify-center">
          <button 
            onClick={() => setActiveCategory(null)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shadow-2xs",
              !activeCategory 
                ? "bg-slate text-white shadow-md shadow-slate/20 scale-105" 
                : "bg-white/80 hover:bg-white text-slate/65 hover:text-slate border border-white/80"
            )}
          >
            ♡ All Photos
          </button>

          {allCategories.map(cat => (
            <button 
              key={cat as string}
              onClick={() => setActiveCategory(cat as string)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shadow-2xs",
                activeCategory === cat 
                  ? "bg-lavender text-white shadow-md shadow-lavender/30 scale-105" 
                  : "bg-white/80 hover:bg-white text-slate/65 hover:text-slate border border-white/80"
              )}
            >
              ✦ {cat as string}
            </button>
          ))}

          {/* Special filter: With Song ♡ */}
          {memories.some(m => Boolean(m.spotifyUrl)) && (
            <button 
              onClick={() => setActiveCategory(activeCategory === '__with_song__' ? null : '__with_song__')}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shadow-2xs",
                activeCategory === '__with_song__' 
                  ? "bg-[#1DB954] text-white shadow-md shadow-[#1DB954]/30 scale-105" 
                  : "bg-white/80 hover:bg-white text-slate/65 hover:text-slate border border-white/80"
              )}
            >
              <Music2 className="w-3 h-3" />
              <span>With Song</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. PHOTO WALL / SCRAPBOOK MASONRY */}
      {wallItems.length > 0 && (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {wallItems.map((item, idx) => {
              const memDate = new Date(item.memory.date);
              const formattedDate = memDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
              const isEven = idx % 2 === 0;

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.45, delay: Math.min(idx * 0.04, 0.4), ease: "easeOut" }}
                  key={item.id} 
                  className="break-inside-avoid relative group select-none mb-6"
                >
                  {/* Washi Tape Accent Sticker */}
                  <div className={cn(
                    "absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-4 backdrop-blur-xs z-20 transition-transform pointer-events-none border shadow-2xs",
                    isEven 
                      ? "bg-rose/45 border-rose/30 -rotate-3 group-hover:rotate-0" 
                      : "bg-softblue/45 border-softblue/30 rotate-2 group-hover:rotate-0"
                  )} />

                  {/* Polaroid Frame Card */}
                  <motion.div
                    whileHover={{ 
                      y: -6, 
                      scale: 1.02, 
                      rotate: 0,
                      transition: { type: "spring", stiffness: 350, damping: 25 }
                    }}
                    animate={{ rotate: item.rotation }}
                    onClick={() => setSelectedMemory(item.memory)}
                    className="bg-white p-3 sm:p-3.5 pb-5 sm:pb-6 rounded-sm border border-gray-100/90 shadow-[0_12px_30px_-8px_rgba(44,53,69,0.08),0_4px_10px_-2px_rgba(44,53,69,0.03)] group-hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
                  >
                    {/* PHOTO CARD */}
                    {item.type === 'photo' && item.imgUrl && (
                      <div className={cn("relative w-full rounded-xs overflow-hidden bg-gray-50 mb-3", item.aspectClass)}>
                        <img 
                          src={item.imgUrl} 
                          alt={item.memory.title || "Memory Photo"} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />

                        {/* Subtle Overlay gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-white">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose/90 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>View Chapter</span>
                          </span>
                          <p className="font-serif font-bold text-sm truncate">{item.memory.title}</p>
                        </div>

                        {/* Photo Index Badge if multiple photos */}
                        {item.totalImages && item.totalImages > 1 && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-full text-[9px] font-bold text-white tracking-wider flex items-center gap-1 shadow-xs">
                            <Camera className="w-2.5 h-2.5" />
                            <span>{(item.imgIndex || 0) + 1}/{item.totalImages}</span>
                          </div>
                        )}

                        {/* Mood Emoji Sticker */}
                        {item.memory.mood && (
                          <div className="absolute bottom-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-sm shadow-xs border border-white">
                            {item.memory.mood}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TEXT SCRAPBOOK CARD (When memory has no photos) */}
                    {item.type === 'text' && (
                      <div className="w-full aspect-[4/5] rounded-xs bg-gradient-to-br from-lavender/10 via-rose-50/30 to-softblue/10 p-5 flex flex-col justify-between text-left mb-3 border border-lavender/20 relative overflow-hidden">
                        <div className="absolute -top-6 -right-6 w-20 h-20 bg-lavender/20 rounded-full blur-xl pointer-events-none" />

                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-lavender block mb-1">
                            Chapter Note ✦
                          </span>
                          <h3 className="font-handwriting text-2xl font-bold text-slate line-clamp-2">
                            {item.memory.title}
                          </h3>
                        </div>

                        <p className="font-serif italic text-xs text-slate/70 line-clamp-4 leading-relaxed my-2">
                          "{item.memory.story?.replace(/[#*`_]/g, '')}"
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate/10 text-[10px] text-slate/50">
                          <span>{item.memory.location}</span>
                          <span className="text-lavender font-bold">Open →</span>
                        </div>
                      </div>
                    )}

                    {/* Polaroid Bottom Caption (Handwritten style) */}
                    <div className="px-1 text-left space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-handwriting text-xl font-bold text-slate truncate flex-1">
                          {item.memory.title}
                        </h4>
                        {item.memory.rating && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-500 shrink-0">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span>{item.memory.rating}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate/50 font-sans">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-2.5 h-2.5 text-softblue" />
                          <span>{formattedDate}</span>
                        </span>

                        {item.memory.location && (
                          <span className="flex items-center gap-0.5 truncate max-w-[110px]">
                            <MapPin className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                            <span className="truncate">{item.memory.location}</span>
                          </span>
                        )}
                      </div>

                      {/* Music note if memory has Our Song */}
                      {item.memory.spotifyUrl && (
                        <div className="pt-1 flex items-center gap-1 text-[10px] text-[#1DB954] font-semibold truncate">
                          <Music2 className="w-3 h-3 shrink-0 animate-pulse" />
                          <span className="truncate">
                            {item.memory.spotifyTitle ? item.memory.spotifyTitle : 'Our Song Attached'}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* 4. EMPTY STATES */}
      {/* Case A: Filter/Search results empty */}
      {memories.length > 0 && wallItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto my-16 p-8 bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-lg text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-lavender/15 text-lavender flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-slate mb-1">Nothing here yet ♡</h3>
          <p className="font-serif italic text-xs text-slate/60 leading-relaxed mb-5">
            Maybe this little corner is waiting for another memory, or try searching for another word.
          </p>
          <button
            onClick={() => { setFilter(''); setActiveCategory(null); }}
            className="px-5 py-2 bg-slate text-white text-xs font-bold rounded-xl hover:bg-[#1A202C] transition-all cursor-pointer shadow-sm"
          >
            Show All Memories
          </button>
        </motion.div>
      )}

      {/* Case B: No memories in system yet */}
      {memories.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto my-16 p-8 sm:p-10 bg-white/85 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl text-center relative overflow-hidden"
        >
          <div className="w-16 h-16 rounded-3xl bg-rose/15 text-rose flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 fill-rose/30" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate/40 block mb-1">
            Our Wall Is Waiting ♡
          </span>
          <h3 className="font-serif text-2xl font-bold text-slate mb-2">The first little memory is waiting to be pinned here.</h3>
          <p className="font-serif italic text-xs text-slate/60 leading-relaxed mb-6">
            Capture your first photo, write your sweet moment, and start decorating our romantic photo wall.
          </p>
          {navigate && (
            <button
              onClick={() => navigate('/write')}
              className="px-6 py-3 bg-slate text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#1A202C] transition-all shadow-lg shadow-slate/20 flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Write Our First Memory</span>
            </button>
          )}
        </motion.div>
      )}

      {/* 5. FULL MEMORY DETAIL CHAPTER MODAL */}
      <AnimatePresence>
        {selectedMemory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-text">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMemory(null)}
              className="absolute inset-0 bg-slate/50 backdrop-blur-md"
            />

            {/* Modal Scrapbook Sheet */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative w-full max-w-2xl bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-5 sm:p-8 shadow-2xl border border-white/80 max-h-[90vh] overflow-y-auto z-10 space-y-5"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMemory(null)}
                aria-label="Close memory modal"
                className="absolute top-5 right-5 w-9 h-9 bg-gray-100/80 hover:bg-gray-200 text-slate rounded-full flex items-center justify-center transition-colors cursor-pointer z-20"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header Details */}
              <div className="pr-10 text-left">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-3 py-1 bg-lavender/15 text-lavender rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {new Date(selectedMemory.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  {selectedMemory.category && (
                    <span className="px-3 py-1 bg-gray-100 text-slate/70 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {selectedMemory.category}
                    </span>
                  )}
                  {selectedMemory.mood && (
                    <span className="text-xl">{selectedMemory.mood}</span>
                  )}
                </div>

                <h2 className="font-handwriting text-3xl sm:text-4xl font-bold text-slate mt-1 leading-snug">
                  {selectedMemory.title}
                </h2>

                <div className="flex items-center gap-3 text-xs text-slate/50 mt-1">
                  {selectedMemory.location && (
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{selectedMemory.location}</span>
                    </span>
                  )}
                  {selectedMemory.rating && (
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{selectedMemory.rating} / 5 Stars</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Photo Carousel in Modal */}
              {(selectedMemory.images?.length > 0 || selectedMemory.image) && (
                <div className="rounded-2xl overflow-hidden bg-gray-50 shadow-sm border border-gray-100">
                  <Carousel images={selectedMemory.images || [selectedMemory.image]} />
                </div>
              )}

              {/* Story Content with ReactMarkdown */}
              <div className="font-sans text-slate/85 text-[13.5px] leading-relaxed text-left pt-2 border-t border-dashed border-gray-200">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="text-slate/80 leading-relaxed font-sans mb-3 text-[13.5px]">
                        {children}
                      </p>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="relative my-3.5 pl-4 pr-3 py-2.5 bg-gradient-to-r from-lavender/10 via-softblue/5 to-transparent border-l-2 border-lavender rounded-r-xl italic font-serif text-slate/90 text-sm">
                        <span className="text-lavender font-serif font-bold text-lg leading-none select-none mr-1">“</span>
                        {children}
                      </blockquote>
                    ),
                    h1: ({ children }) => (
                      <h4 className="font-serif font-bold text-slate text-base md:text-lg mt-3.5 mb-1.5 tracking-tight">
                        {children}
                      </h4>
                    ),
                    h2: ({ children }) => (
                      <h5 className="font-serif font-bold text-slate text-sm md:text-base mt-3 mb-1 tracking-tight">
                        {children}
                      </h5>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold text-slate font-sans">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-slate/90 font-serif">
                        {children}
                      </em>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 my-2 pl-1 text-slate/80 text-[13px]">
                        {children}
                      </ul>
                    )
                  }}
                >
                  {selectedMemory.story}
                </ReactMarkdown>
              </div>

              {/* OUR SONG CARD IN MODAL */}
              {selectedMemory.spotifyUrl && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-lavender/15 via-rose-50/40 to-softblue/15 border border-lavender/30 text-left relative overflow-hidden shadow-xs">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-lavender/20 flex items-center justify-center text-slate">
                        <Music2 className="w-4 h-4 text-lavender animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate/50 block leading-tight">
                          Our Song ♡
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3 pl-1">
                    {selectedMemory.spotifyTitle ? (
                      <div>
                        <p className="font-serif font-bold text-slate text-sm">“{selectedMemory.spotifyTitle}”</p>
                        {selectedMemory.spotifyArtist && (
                          <p className="text-xs text-slate/60 font-sans mt-0.5">{selectedMemory.spotifyArtist}</p>
                        )}
                      </div>
                    ) : (
                      <p className="font-serif italic text-slate/75 text-xs">
                        “A little soundtrack for this memory...”
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate/10 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate/40 italic font-serif">
                      Listen on Spotify
                    </span>
                    <a
                      href={selectedMemory.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1DB954]/10 hover:bg-[#1DB954]/20 text-[#1DB954] hover:text-[#189945] border border-[#1DB954]/30 rounded-full text-xs font-bold transition-all active:scale-95 shadow-xs"
                    >
                      <Music2 className="w-3.5 h-3.5" />
                      <span>Open on Spotify ↗</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Action Buttons in Modal (Edit / Delete) */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-slate/40 font-serif italic">
                  Cherished moment ♡
                </span>

                <div className="flex items-center gap-2">
                  {onEdit && (
                    <button 
                      onClick={() => { 
                        const mem = selectedMemory;
                        setSelectedMemory(null);
                        onEdit(mem); 
                      }} 
                      className="px-4 py-2 text-xs font-semibold text-slate/80 hover:text-blue-600 bg-gray-100 hover:bg-softblue/15 border border-transparent hover:border-softblue/30 rounded-full shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 text-softblue" /> 
                      <span>Edit Memory</span>
                    </button>
                  )}

                  {onDelete && (
                    <button 
                      onClick={() => { 
                        if (window.confirm('Are you sure you want to delete this precious memory?')) {
                          const id = selectedMemory.id;
                          setSelectedMemory(null);
                          onDelete(id);
                        }
                      }} 
                      className="px-4 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/80 hover:bg-rose-100/80 border border-rose-200/60 rounded-full shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" /> 
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

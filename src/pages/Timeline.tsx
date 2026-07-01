import { useEffect, useRef, useState, useMemo } from 'react';
import { Calendar as CalendarIcon, MapPin, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { Carousel } from '../components/Carousel';

export default function Timeline({ memories, onEdit, onDelete }: { memories: any[], onEdit?: (m: any) => void, onDelete?: (id: string) => void }) {
  const endRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Group memories by month and year
  const groupedMemories = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    memories.forEach(memory => {
      const date = new Date(memory.date);
      const monthYear = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(memory);
    });
    return groups;
  }, [memories]);

  // Reverse auto-scroll to latest
  useEffect(() => {
    // Small timeout to ensure rendering is done
    const timer = setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen pt-12 pb-24 px-4 max-w-2xl md:max-w-6xl mx-auto">
      
      {/* Mini Calendar Quick Jump (Fixed) */}
      <div className="fixed top-6 right-6 z-40">
        <button className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-lavender hover:scale-110 transition-transform border border-softblue/20">
          <CalendarIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-16">
        {Object.entries(groupedMemories).map(([monthYear, monthMemories]) => (
          <div key={monthYear} className="relative">
            {/* Sticky Month Header */}
            <div className="sticky top-6 z-30 flex justify-center mb-10 pointer-events-none">
              <span className="px-5 py-2 bg-background/95 backdrop-blur-md border border-softblue/30 rounded-full font-serif text-sm font-bold text-slate shadow-sm tracking-widest uppercase">
                {monthYear}
              </span>
            </div>

            {/* Timeline Line for the month (Mobile Only) */}
            <div className="absolute left-[19px] top-12 bottom-0 w-[2px] bg-gradient-to-b from-softblue/40 via-softblue/20 to-transparent rounded-full md:hidden"></div>

            {/* Grid for Desktop, Vertical List for Mobile */}
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:items-start">
              {monthMemories.map((memory) => {
                const isExpanded = expandedId === memory.id;
                const memoryDate = new Date(memory.date);
                
                return (
                    <motion.div 
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
                      key={memory.id} 
                      className="relative flex md:block gap-3 md:gap-0 md:mb-0"
                    >
                    {/* Dot (Mobile Only) */}
                    <div className="relative z-20 shrink-0 w-10 flex flex-col items-center md:hidden">
                      <div className="w-3 h-3 bg-lavender rounded-full border-2 border-background ring-4 ring-lavender/20 mt-6 shadow-sm"></div>
                      <span className="text-xs font-bold text-gray-400 mt-2">
                        {memoryDate.getDate()}
                      </span>
                    </div>

                    {/* Card (Polaroid Style) */}
                    <motion.div 
                      layout
                      onClick={() => setExpandedId(isExpanded ? null : memory.id)}
                      className={cn(
                        "flex-1 bg-white p-3 pb-10 md:p-4 md:pb-14 cursor-pointer transition-shadow duration-500",
                        "border border-gray-100 rounded-sm relative",
                        isExpanded 
                          ? "shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] z-30 ring-1 ring-black/5" 
                          : "shadow-polaroid hover:shadow-2xl"
                      )}
                      animate={isExpanded ? { scale: 1.03, rotate: 0, y: -5 } : { scale: 1, rotate: 0, y: 0 }}
                      whileHover={!isExpanded ? { y: -8, rotate: 1.5, zIndex: 30, scale: 1.02 } : undefined}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      {/* Date Badge (Desktop Only) */}
                      <div className="hidden md:block absolute -top-3 -left-3 bg-lavender text-white px-3 py-1 rounded-sm text-xs font-bold shadow-md z-40 transform -rotate-3 border border-white/20">
                        {memoryDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </div>

                      {memory.mood && (
                        <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 z-40 transform rotate-12 bg-white/90 backdrop-blur-md w-14 h-14 md:w-16 md:h-16 rounded-2xl shadow-lg border border-pink-100 flex items-center justify-center text-4xl md:text-5xl">
                          {/* Cute Pink Tape */}
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 bg-pink-200/40 backdrop-blur-md border border-pink-100/50 -rotate-6 z-50"></div>
                          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>{memory.mood}</motion.div>
                        </div>
                      )}

                      <Carousel images={memory.images || [memory.image]} />

                      <div className="px-1 md:px-2">
                        <h3 className="font-handwriting text-3xl md:text-3xl font-bold text-slate mb-2 md:mb-3 mt-3 md:mt-4 leading-none text-center">{memory.title}</h3>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="px-3 py-1 bg-softblue/10 text-blue-500 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-softblue/20 shadow-sm">
                            <MapPin className="w-3 h-3" /> {memory.location}
                          </span>
                        </div>

                        {/* Expanded Story */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-6 pt-5 border-t border-dashed border-gray-200"
                            >
                              <div className="prose prose-sm prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-slate font-sans">
                                <ReactMarkdown>{memory.story}</ReactMarkdown>
                              </div>
                              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-2">
                                <button onClick={(e) => { e.stopPropagation(); onEdit?.(memory); }} className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-softblue hover:bg-softblue/10 rounded-lg transition-colors flex items-center gap-1.5">
                                  <Edit className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button onClick={(e) => { 
                                  e.stopPropagation(); 
                                  if (window.confirm('Are you sure you want to delete this precious memory?')) {
                                    onDelete?.(memory.id);
                                  }
                                }} className="px-3 py-2 text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5">
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Anchor for auto-scroll */}
      <div ref={endRef} className="h-20 flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-softblue/50 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

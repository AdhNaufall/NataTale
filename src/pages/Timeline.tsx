import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  MapPin,
  Edit,
  Trash2,
  Star,
  Music2,
  Heart,
  Sparkles,
  ChevronDown,
  BookOpen,
  Plus,
  ArrowUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { Carousel } from '../components/Carousel';

interface TimelineProps {
  memories: any[];
  onEdit?: (m: any) => void;
  onDelete?: (id: string) => void;
  navigate?: (path: string) => void;
}

export default function Timeline({ memories, onEdit, onDelete, navigate }: TimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Group memories chronologically: Year -> Month
  const groupedByYearAndMonth = useMemo(() => {
    const sorted = [...memories].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const structure: { [year: string]: { [month: string]: any[] } } = {};

    sorted.forEach((memory) => {
      const date = new Date(memory.date);
      const year = date.getFullYear().toString();
      const month = date.toLocaleDateString('id-ID', { month: 'long' });

      if (!structure[year]) structure[year] = {};
      if (!structure[year][month]) structure[year][month] = [];
      structure[year][month].push(memory);
    });

    return structure;
  }, [memories]);

  // List of all month-year sections for quick jumping
  const monthSections = useMemo(() => {
    const list: { key: string; label: string; count: number }[] = [];
    Object.entries(groupedByYearAndMonth).forEach(([year, months]) => {
      Object.entries(months).forEach(([month, items]) => {
        list.push({
          key: `${year}-${month}`,
          label: `${month} ${year}`,
          count: items.length
        });
      });
    });
    return list;
  }, [groupedByYearAndMonth]);

  // Track scroll for "Back to top" button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionKey: string) => {
    setShowMonthPicker(false);
    const element = document.getElementById(`section-${sectionKey}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen pt-4 pb-36 px-3 sm:px-6 max-w-5xl mx-auto font-sans text-slate selection:bg-lavender/30">

      {/* Dreamy Ambient Light Blobs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-lavender/20 via-rose/15 to-transparent rounded-full blur-[110px] -z-10 pointer-events-none" />
      <div className="absolute top-[35%] right-0 w-80 h-80 bg-softblue/15 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute top-[65%] left-0 w-80 h-80 bg-rose/15 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Floating Mini Controls (Month Jump & Scroll Top) */}
      <div className="fixed top-6 right-5 sm:right-8 z-40 flex flex-col gap-2.5 items-end">
        {/* Month Jump Button */}
        {monthSections.length > 0 && (
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowMonthPicker(prev => !prev)}
              aria-label="Jump to timeline month"
              className="px-3.5 py-2 bg-white/85 hover:bg-white backdrop-blur-xl shadow-[0_10px_25px_-5px_rgba(44,53,69,0.08)] rounded-full flex items-center gap-2 text-xs font-bold text-slate border border-white/80 cursor-pointer transition-all"
            >
              <CalendarIcon className="w-4 h-4 text-lavender" />
              <span className="hidden sm:inline text-[11px] uppercase tracking-wider text-slate/70">Jump to</span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-slate/40 transition-transform duration-200", showMonthPicker && "rotate-180")} />
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
              {showMonthPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 mt-2.5 w-60 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white p-3 z-50 space-y-1"
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate/40 px-3 py-1.5 border-b border-gray-100 flex items-center justify-between">
                    <span>Chapters by Month</span>
                    <Sparkles className="w-3 h-3 text-lavender" />
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1 pr-1 pt-1">
                    {monthSections.map(({ key, label, count }) => (
                      <button
                        key={key}
                        onClick={() => scrollToSection(key)}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate hover:bg-lavender/15 hover:text-lavender rounded-2xl transition-all flex justify-between items-center cursor-pointer group"
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform">{label}</span>
                        <span className="text-[10px] font-bold bg-lavender/15 text-slate/80 group-hover:bg-lavender group-hover:text-white px-2 py-0.5 rounded-full transition-colors">
                          {count}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Scroll To Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToTop}
              aria-label="Back to top"
              className="w-10 h-10 bg-white/85 hover:bg-white backdrop-blur-xl shadow-[0_10px_25px_-5px_rgba(44,53,69,0.08)] rounded-full flex items-center justify-center text-slate/70 hover:text-lavender border border-white/80 cursor-pointer transition-all"
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* 1. EDITORIAL SCRAPBOOK HERO */}
      <div ref={heroRef} className="pt-8 pb-14 text-center max-w-2xl mx-auto relative select-none">
        {/* Cute Scrapbook Ribbon Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/75 backdrop-blur-md rounded-full border border-lavender/25 shadow-xs text-xs font-bold uppercase tracking-[0.2em] text-lavender mb-5"
        >
          <Sparkles className="w-3.5 h-3.5 text-lavender" />
          <span>OUR STORY TIMELINE</span>
          <Heart className="w-3.5 h-3.5 fill-rose/50 text-rose" />
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="font-serif text-4xl sm:text-6xl font-bold text-slate tracking-tight mb-3"
        >
          Little Moments... <br className="hidden sm:inline" />
          <span className="font-handwriting text-5xl sm:text-7xl font-normal text-lavender block sm:inline sm:ml-2">
          </span>
        </motion.h1>

        {/* Subtitle / Prose */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="font-serif italic text-sm sm:text-base text-slate/60 max-w-md mx-auto leading-relaxed mb-6"
        >
          “A quiet collection of every place we went, laugh we shared, and heartbeat we decided to keep forever.”
        </motion.p>

        {/* Memory Counter Pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="inline-flex items-center gap-3 px-5 py-2 bg-white/75 backdrop-blur-xl border border-white/80 rounded-full shadow-xs text-xs font-semibold text-slate/75"
        >
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-softblue" />
            <strong>{memories.length}</strong> {memories.length === 1 ? 'Chapter' : 'Chapters'}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate/20" />
          <span className="text-rose font-serif italic font-bold">and counting forever ♡</span>
        </motion.div>
      </div>

      {/* 2. EMPTY STATE */}
      {memories.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto my-12 p-8 sm:p-10 bg-white/85 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl text-center relative overflow-hidden"
        >
          {/* Decorative washi tape at top */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-lavender/35 backdrop-blur-sm -rotate-2 border border-lavender/30 shadow-xs" />

          <div className="w-16 h-16 rounded-3xl bg-lavender/15 text-lavender flex items-center justify-center mx-auto mb-5 shadow-inner ring-1 ring-lavender/25">
            <Heart className="w-8 h-8 fill-lavender/30" />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate/40 block mb-1">
            Our Story Starts Here
          </span>
          <h3 className="font-serif text-2xl font-bold text-slate mb-2">Every beautiful story has a first page.</h3>
          <p className="font-serif italic text-xs text-slate/60 leading-relaxed mb-6">
            Write down your very first memory, attach a photo, and start building your romantic scrapbook.
          </p>

          {navigate && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/write')}
              className="px-6 py-3.5 bg-slate text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#1A202C] transition-all shadow-lg shadow-slate/20 flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Write First Memory</span>
            </motion.button>
          )}
        </motion.div>
      )}

      {/* 3. EDITORIAL SCRAPBOOK TIMELINE */}
      {memories.length > 0 && (
        <div className="relative">

          {/* Central Timeline Spine Line (Desktop) & Left Spine Line (Mobile) */}
          <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 top-4 bottom-12 w-[2px] bg-gradient-to-b from-lavender/40 via-softblue/30 to-transparent rounded-full pointer-events-none" />

          {/* Iterate Years */}
          {Object.entries(groupedByYearAndMonth).map(([year, months], yearIdx) => (
            <div key={year} className="mb-20 last:mb-8 relative">

              {/* Year Floating Stamp Badge */}
              <div className="sticky top-4 z-30 flex justify-center mb-10 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.1 * yearIdx }}
                  className="pointer-events-auto px-5 py-2 bg-white/95 backdrop-blur-2xl border border-white/90 rounded-full shadow-[0_12px_30px_-5px_rgba(44,53,69,0.08)] text-slate flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-lavender animate-ping" />
                  <span className="font-serif text-sm font-bold tracking-widest text-slate uppercase">
                    Year {year}
                  </span>
                  <span className="text-[10px] text-lavender font-serif italic">✦</span>
                </motion.div>
              </div>

              {/* Iterate Months within Year */}
              {Object.entries(months).map(([month, monthMemories]) => {
                const sectionKey = `${year}-${month}`;

                return (
                  <div key={sectionKey} id={`section-${sectionKey}`} className="mb-14 scroll-mt-20">

                    {/* Month Separator Banner */}
                    <div className="flex items-center justify-center gap-3 mb-8 sm:mb-12">
                      <div className="hidden sm:block h-[1px] flex-1 bg-gradient-to-r from-transparent via-lavender/30 to-lavender/50 max-w-xs" />
                      <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/80 backdrop-blur-md rounded-full border border-lavender/25 text-[11px] font-bold uppercase tracking-[0.18em] text-slate/75 shadow-2xs">
                        <span>{month}</span>
                        <span className="px-2 py-0.5 bg-lavender/15 text-lavender text-[9px] font-bold rounded-full">
                          {monthMemories.length}
                        </span>
                      </div>
                      <div className="hidden sm:block h-[1px] flex-1 bg-gradient-to-l from-transparent via-lavender/30 to-lavender/50 max-w-xs" />
                    </div>

                    {/* Memories Vertical Flow */}
                    <div className="space-y-12 sm:space-y-16">
                      {monthMemories.map((memory, memIdx) => {
                        const isExpanded = expandedId === memory.id;
                        const memoryDate = new Date(memory.date);
                        const isEven = memIdx % 2 === 0;

                        // Slight rotation angle for organic feel
                        const rotationDeg = isExpanded ? 0 : (isEven ? -1.2 : 1.2);

                        return (
                          <div
                            key={memory.id}
                            className={cn(
                              "relative flex flex-col sm:flex-row items-start",
                              isEven ? "sm:flex-row-reverse" : ""
                            )}
                          >
                            {/* Central Timeline Dot (Desktop & Mobile) */}
                            <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 top-7 z-20 flex flex-col items-center pointer-events-none">
                              <div className={cn(
                                "w-4 h-4 rounded-full border-2 border-white bg-lavender shadow-md transition-all duration-300",
                                isExpanded ? "scale-125 ring-4 ring-lavender/30 bg-lavender" : "hover:scale-110"
                              )} />
                            </div>

                            {/* Date Badge Indicator for Timeline Spine (Desktop Side Callout) */}
                            <div className={cn(
                              "hidden sm:flex w-1/2 items-center px-8 pt-6 select-none",
                              isEven ? "justify-end text-right" : "justify-start text-left"
                            )}>
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-lavender block">
                                  {memoryDate.toLocaleDateString('id-ID', { weekday: 'long' })}
                                </span>
                                <span className="font-serif text-2xl font-bold text-slate/85 tracking-tight">
                                  {memoryDate.getDate()} {month.substring(0, 3)}
                                </span>
                                {memory.category && (
                                  <span className="text-[10px] text-slate/40 font-serif italic block">
                                    ✦ {memory.category}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Polaroid Scrapbook Card Container */}
                            <div className="w-full sm:w-1/2 pl-10 sm:pl-0 sm:px-8">
                              <motion.div
                                layout
                                initial={{ opacity: 0, y: 14 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-30px" }}
                                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                                className="relative group"
                              >
                                {/* Washi Tape Decoration on Polaroid Top */}
                                <div className={cn(
                                  "absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 backdrop-blur-xs z-30 transition-transform duration-200 pointer-events-none border shadow-2xs",
                                  isEven
                                    ? "bg-rose/40 border-rose/30 -rotate-2 group-hover:rotate-0"
                                    : "bg-softblue/40 border-softblue/30 rotate-2 group-hover:rotate-0"
                                )} />

                                {/* Polaroid Paper Frame */}
                                <motion.div
                                  role="button"
                                  tabIndex={0}
                                  aria-expanded={isExpanded}
                                  onClick={() => setExpandedId(isExpanded ? null : memory.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      setExpandedId(isExpanded ? null : memory.id);
                                    }
                                  }}
                                  animate={{ rotate: rotationDeg }}
                                  whileHover={!isExpanded ? { y: -4, scale: 1.012, rotate: 0 } : undefined}
                                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                  className={cn(
                                    "bg-white p-3.5 pb-8 sm:p-5 sm:pb-10 rounded-sm border border-gray-100/90 relative cursor-pointer text-left transition-shadow duration-250",
                                    isExpanded
                                      ? "shadow-[0_20px_50px_-15px_rgba(44,53,69,0.14)] ring-2 ring-lavender/30 z-30"
                                      : "shadow-[0_10px_25px_-5px_rgba(44,53,69,0.06),0_2px_8px_-2px_rgba(44,53,69,0.03)] hover:shadow-xl"
                                  )}
                                >
                                  {/* Mobile Date Header inside card */}
                                  <div className="flex sm:hidden items-center justify-between gap-2 mb-2.5 pb-2 border-b border-gray-100">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-lavender flex items-center gap-1">
                                      <CalendarIcon className="w-3 h-3 text-lavender" />
                                      {memoryDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    {memory.category && (
                                      <span className="text-[9px] font-bold text-slate/50 bg-gray-50 px-2 py-0.5 rounded-full">
                                        {memory.category}
                                      </span>
                                    )}
                                  </div>

                                  {/* Mood Emoji Sticker pinned on top corner */}
                                  {memory.mood && (
                                    <div
                                      className="absolute -top-3.5 -right-3.5 z-40 bg-white/95 backdrop-blur-md w-11 h-11 sm:w-12 sm:h-12 rounded-2xl shadow-md border border-pink-100 flex items-center justify-center text-2xl sm:text-3xl select-none transition-transform duration-200 group-hover:scale-105"
                                    >
                                      <span className="transform -rotate-6">{memory.mood}</span>
                                    </div>
                                  )}

                                  {/* Photo Section with Carousel */}
                                  {(memory.images?.length > 0 || memory.image) && (
                                    <div className="relative rounded-sm overflow-hidden mb-3 bg-gray-50">
                                      <Carousel images={memory.images || [memory.image]} />
                                    </div>
                                  )}

                                  {/* Title & Location Header */}
                                  <div className="px-1 mt-2">
                                    <h3 className="font-handwriting text-2xl sm:text-3xl font-bold text-slate mb-1 leading-snug">
                                      {memory.title}
                                    </h3>

                                    {/* Location & Star Rating Pills */}
                                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                      {memory.location && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-softblue/10 text-blue-600 rounded-full text-[10px] font-bold tracking-wide border border-softblue/20">
                                          <MapPin className="w-3 h-3 text-softblue" />
                                          <span className="truncate max-w-[140px] sm:max-w-[180px]">{memory.location}</span>
                                        </span>
                                      )}

                                      {memory.rating && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold border border-amber-200/60">
                                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                          <span>{memory.rating}/5</span>
                                        </span>
                                      )}

                                      {/* Collapsed Mini Spotify Badge if memory has song */}
                                      {!isExpanded && memory.spotifyUrl && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#1DB954]/10 text-[#1DB954] rounded-full text-[10px] font-bold border border-[#1DB954]/25 truncate max-w-[160px]">
                                          <Music2 className="w-3 h-3 flex-shrink-0" />
                                          <span className="truncate">
                                            {memory.spotifyTitle || 'Our Song ♡'}
                                          </span>
                                        </span>
                                      )}
                                    </div>

                                    {/* Collapsed Short Excerpt preview if not expanded */}
                                    {!isExpanded && memory.story && (
                                      <p className="font-serif italic text-xs text-slate/65 mt-3 line-clamp-2 leading-relaxed">
                                        "{memory.story.replace(/[#*`_]/g, '')}"
                                      </p>
                                    )}

                                    {/* Small hint to expand */}
                                    {!isExpanded && (
                                      <div className="mt-3.5 pt-2 border-t border-dashed border-gray-100 flex items-center justify-between text-[10px] text-slate/40 font-serif italic">
                                        <span>Click to open memory chapter</span>
                                        <span className="text-lavender font-sans font-bold">Read more →</span>
                                      </div>
                                    )}

                                    {/* EXPANDED FULL STORY CHAPTER */}
                                    <AnimatePresence>
                                      {isExpanded && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.35, ease: "easeOut" }}
                                          className="mt-5 pt-4 border-t border-dashed border-lavender/30"
                                        >
                                          {/* Story Typography with ReactMarkdown */}
                                          <div className="font-sans text-slate/85 text-[13.5px] leading-relaxed space-y-3">
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
                                                h3: ({ children }) => (
                                                  <h6 className="font-sans font-bold text-slate text-xs uppercase tracking-wider mt-2.5 mb-1">
                                                    {children}
                                                  </h6>
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
                                                ),
                                                ol: ({ children }) => (
                                                  <ol className="list-decimal list-inside space-y-1 my-2 pl-1 text-slate/80 text-[13px]">
                                                    {children}
                                                  </ol>
                                                ),
                                                hr: () => (
                                                  <div className="my-4 flex items-center justify-center gap-2">
                                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-lavender/30 to-transparent" />
                                                    <span className="text-lavender text-xs">✦</span>
                                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-lavender/30 to-transparent" />
                                                  </div>
                                                )
                                              }}
                                            >
                                              {memory.story}
                                            </ReactMarkdown>
                                          </div>

                                          {/* OUR SONG CARD ♡ */}
                                          {memory.spotifyUrl && (
                                            <motion.div
                                              initial={{ opacity: 0, y: 6 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                              className="my-5 p-4 rounded-2xl bg-gradient-to-br from-lavender/15 via-rose-50/40 to-softblue/15 border border-lavender/30 backdrop-blur-md shadow-xs text-left relative overflow-hidden"
                                            >
                                              <div className="absolute -top-8 -right-8 w-24 h-24 bg-lavender/20 rounded-full blur-xl pointer-events-none" />

                                              <div className="flex items-center justify-between gap-3 mb-2 relative z-10">
                                                <div className="flex items-center gap-2">
                                                  <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-lavender/20 flex items-center justify-center text-slate">
                                                    <Music2 className="w-4 h-4 text-lavender" />
                                                  </div>
                                                  <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate/50 block leading-tight">
                                                      Our Song ♡
                                                    </span>
                                                  </div>
                                                </div>
                                                <span className="text-[10px] font-serif italic text-slate/40 hidden sm:inline">
                                                  Soundtrack
                                                </span>
                                              </div>

                                              <div className="mb-3 pl-1 relative z-10">
                                                {memory.spotifyTitle ? (
                                                  <div>
                                                    <p className="font-serif font-bold text-slate text-sm">“{memory.spotifyTitle}”</p>
                                                    {memory.spotifyArtist && (
                                                      <p className="text-xs text-slate/60 font-sans mt-0.5">{memory.spotifyArtist}</p>
                                                    )}
                                                  </div>
                                                ) : (
                                                  <p className="font-serif italic text-slate/75 text-xs">
                                                    “A little soundtrack for this memory...”
                                                  </p>
                                                )}
                                              </div>

                                              <div className="pt-2 border-t border-slate/10 flex items-center justify-between gap-2 relative z-10">
                                                <span className="text-[10px] text-slate/40 italic font-serif truncate">
                                                  Listen on Spotify
                                                </span>
                                                <a
                                                  href={memory.spotifyUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  onClick={(e) => e.stopPropagation()}
                                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1DB954]/10 hover:bg-[#1DB954]/20 text-[#1DB954] hover:text-[#189945] border border-[#1DB954]/30 rounded-full text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
                                                >
                                                  <Music2 className="w-3.5 h-3.5" />
                                                  <span>Open on Spotify ↗</span>
                                                </a>
                                              </div>
                                            </motion.div>
                                          )}

                                          {/* Soft Glass Action Buttons (Edit & Delete) */}
                                          <div className="mt-6 pt-4 border-t border-slate/10 flex items-center justify-between">
                                            <span className="text-[11px] text-slate/40 font-serif italic">
                                              Created with love ♡
                                            </span>

                                            <div className="flex items-center gap-2">
                                              <button
                                                onClick={(e) => { e.stopPropagation(); onEdit?.(memory); }}
                                                className="px-3.5 py-1.5 text-xs font-semibold text-slate/75 hover:text-blue-600 bg-white/80 hover:bg-softblue/15 border border-slate/10 hover:border-softblue/30 backdrop-blur-md rounded-full shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                                              >
                                                <Edit className="w-3.5 h-3.5 text-softblue" />
                                                <span>Edit</span>
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (window.confirm('Are you sure you want to delete this precious memory?')) {
                                                    onDelete?.(memory.id);
                                                  }
                                                }}
                                                className="px-3.5 py-1.5 text-xs font-semibold text-rose-600/80 hover:text-rose-700 bg-white/80 hover:bg-rose-50/80 border border-rose-200/60 hover:border-rose-300 backdrop-blur-md rounded-full shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                                              >
                                                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                                <span>Delete</span>
                                              </button>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </motion.div>
                              </motion.div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* End of Story Romantic Stamp */}
          <div className="pt-10 pb-6 text-center select-none">
            <div className="inline-flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-lavender/20 flex items-center justify-center text-lavender shadow-inner ring-1 ring-lavender/30">
                <Heart className="w-4 h-4 fill-lavender/40" />
              </div>
              <p className="font-serif italic text-xs text-slate/40">
                To be continued, memory by memory... ♡
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

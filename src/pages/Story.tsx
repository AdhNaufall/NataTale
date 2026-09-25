import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Camera, 
  MapPin, 
  Sparkles, 
  Calendar, 
  Star, 
  Layers, 
  ArrowRight,
  BookOpen,
  Clock
} from 'lucide-react';
import { calculateRelationshipDuration } from '../lib/relationship';

interface StoryProps {
  memories: any[];
  navigate: (path: string) => void;
}

export default function Story({ memories, navigate }: StoryProps) {
  const [timeTogether, setTimeTogether] = useState(() => calculateRelationshipDuration());

  useEffect(() => {
    const updateCounter = () => {
      setTimeTogether(calculateRelationshipDuration());
    };

    updateCounter();
    const interval = setInterval(updateCounter, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sorted memories by date ascending
  const sortedMemories = useMemo(() => {
    return [...memories].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [memories]);

  // Total stats
  const totalChapters = memories.length;
  const totalPhotos = useMemo(() => {
    return memories.reduce((acc, curr) => acc + (curr.images?.length || (curr.image ? 1 : 0)), 0);
  }, [memories]);

  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(memories.map(m => m.location?.trim()).filter(Boolean)));
  }, [memories]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(memories.map(m => m.category?.trim()).filter(Boolean)));
  }, [memories]);

  // Category counts
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    memories.forEach(m => {
      if (m.category) {
        counts[m.category] = (counts[m.category] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [memories]);

  const maxCategoryCount = useMemo(() => {
    return categoryStats.length > 0 ? Math.max(...categoryStats.map(c => c.count)) : 1;
  }, [categoryStats]);

  // Mood counts
  const moodStats = useMemo(() => {
    const counts: Record<string, number> = {};
    memories.forEach(m => {
      const moodKey = m.mood?.trim() || '🥰';
      counts[moodKey] = (counts[moodKey] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count);
  }, [memories]);

  // Rating stats
  const ratingStats = useMemo(() => {
    if (memories.length === 0) return { average: 5, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    
    let sum = 0;
    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    memories.forEach(m => {
      const r = Math.min(5, Math.max(1, Math.round(m.rating || 5)));
      sum += m.rating || 5;
      breakdown[r] = (breakdown[r] || 0) + 1;
    });

    const average = (sum / memories.length).toFixed(1);
    return { average, breakdown };
  }, [memories]);

  // Monthly timeline activity distribution
  const monthlyActivity = useMemo(() => {
    const monthsMap: Record<string, { label: string; count: number; date: Date }> = {};
    
    sortedMemories.forEach(m => {
      const d = new Date(m.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      
      if (!monthsMap[key]) {
        monthsMap[key] = { label, count: 0, date: d };
      }
      monthsMap[key].count += 1;
    });

    return Object.values(monthsMap);
  }, [sortedMemories]);

  const maxMonthCount = useMemo(() => {
    return monthlyActivity.length > 0 ? Math.max(...monthlyActivity.map(m => m.count)) : 1;
  }, [monthlyActivity]);

  // First and latest chapters
  const firstChapter = sortedMemories.length > 0 ? sortedMemories[0] : null;
  const latestChapter = sortedMemories.length > 0 ? sortedMemories[sortedMemories.length - 1] : null;

  return (
    <div className="min-h-screen pt-10 pb-36 px-4 max-w-4xl mx-auto font-sans text-slate relative">
      
      {/* Ambient background glows */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-lavender/15 rounded-full blur-[90px] -z-10 pointer-events-none" />
      <div className="absolute top-96 right-1/4 w-80 h-80 bg-softblue/15 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Header Section */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/70 backdrop-blur-md rounded-full border border-white/60 shadow-sm text-xs font-bold uppercase tracking-widest text-lavender mb-3"
        >
          <Sparkles className="w-3.5 h-3.5 text-lavender" />
          <span>Our Story Overview</span>
          <Sparkles className="w-3.5 h-3.5 text-lavender" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="font-serif text-4xl sm:text-5xl font-bold text-slate mb-2 tracking-tight"
        >
          Moments in Numbers
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-sans text-slate/50 text-sm max-w-md mx-auto"
        >
          A quiet celebration of every little step, smile, and adventure we've shared so far.
        </motion.p>
      </div>

      {/* Hero Relationship Duration Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-8 shadow-[0_20px_50px_-15px_rgba(44,53,69,0.07)] border border-white/80 mb-8 relative overflow-hidden text-center"
      >
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-lavender/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-softblue/20 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate/40 mb-4">
          <Clock className="w-3.5 h-3.5 text-softblue" />
          <span>Time Together · Since May 23, 2026</span>
        </div>

        {/* Big Counter Digits */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 my-2">
          {timeTogether.years > 0 && (
            <div className="flex flex-col items-center">
              <span className="font-serif text-3xl sm:text-5xl font-bold text-slate tracking-tight">{timeTogether.years}</span>
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-slate/40 mt-1">Years</span>
            </div>
          )}
          
          <div className="flex flex-col items-center">
            <span className="font-serif text-3xl sm:text-5xl font-bold text-lavender tracking-tight">{timeTogether.months}</span>
            <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-slate/40 mt-1">Months</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-serif text-3xl sm:text-5xl font-bold text-softblue tracking-tight">{timeTogether.days}</span>
            <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-slate/40 mt-1">Days</span>
          </div>

          <div className="hidden sm:block w-[1px] h-12 bg-slate/10 mx-1"></div>

          <div className="flex items-center gap-2 sm:gap-3 bg-slate/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-slate/5">
            <div className="flex flex-col items-center">
              <span className="font-serif text-xl sm:text-2xl font-bold text-slate">{String(timeTogether.hours).padStart(2, '0')}</span>
              <span className="text-[8px] uppercase font-bold tracking-widest text-slate/40">Hrs</span>
            </div>
            <span className="text-slate/30 font-bold mb-3">:</span>
            <div className="flex flex-col items-center">
              <span className="font-serif text-xl sm:text-2xl font-bold text-slate">{String(timeTogether.minutes).padStart(2, '0')}</span>
              <span className="text-[8px] uppercase font-bold tracking-widest text-slate/40">Min</span>
            </div>
            <span className="text-slate/30 font-bold mb-3">:</span>
            <div className="flex flex-col items-center">
              <span className="font-serif text-xl sm:text-2xl font-bold text-softblue">{String(timeTogether.seconds).padStart(2, '0')}</span>
              <span className="text-[8px] uppercase font-bold tracking-widest text-slate/40">Sec</span>
            </div>
          </div>
        </div>

        <p className="font-serif italic text-xs sm:text-sm text-slate/50 mt-4">
          ...and counting every precious heartbeat together ♡
        </p>
      </motion.div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/70 backdrop-blur-xl p-5 rounded-[2rem] border border-white/80 shadow-sm flex flex-col items-center text-center hover:bg-white/90 transition-all hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-2xl bg-lavender/15 flex items-center justify-center text-lavender mb-3 shadow-inner ring-1 ring-lavender/25">
            <Heart className="w-5 h-5 fill-lavender/30" />
          </div>
          <span className="font-serif text-3xl font-bold text-slate mb-0.5">{totalChapters}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate/40">Chapters</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/70 backdrop-blur-xl p-5 rounded-[2rem] border border-white/80 shadow-sm flex flex-col items-center text-center hover:bg-white/90 transition-all hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-2xl bg-softblue/15 flex items-center justify-center text-softblue mb-3 shadow-inner ring-1 ring-softblue/25">
            <Camera className="w-5 h-5" />
          </div>
          <span className="font-serif text-3xl font-bold text-slate mb-0.5">{totalPhotos}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate/40">Photos</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/70 backdrop-blur-xl p-5 rounded-[2rem] border border-white/80 shadow-sm flex flex-col items-center text-center hover:bg-white/90 transition-all hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-2xl bg-mint/20 flex items-center justify-center text-emerald-600 mb-3 shadow-inner ring-1 ring-mint/30">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="font-serif text-3xl font-bold text-slate mb-0.5">{uniqueLocations.length}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate/40">Places</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/70 backdrop-blur-xl p-5 rounded-[2rem] border border-white/80 shadow-sm flex flex-col items-center text-center hover:bg-white/90 transition-all hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose/25 flex items-center justify-center text-rose-500 mb-3 shadow-inner ring-1 ring-rose/30">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-serif text-3xl font-bold text-slate mb-0.5">{uniqueCategories.length}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate/40">Categories</span>
        </motion.div>
      </div>

      {/* Empty State Guard */}
      {memories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-10 text-center border border-white/80 shadow-sm my-8"
        >
          <div className="w-16 h-16 rounded-full bg-lavender/15 flex items-center justify-center text-lavender mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-slate mb-2">We're Just Getting Started ♡</h3>
          <p className="text-slate/60 text-sm max-w-sm mx-auto mb-6">
            Once you create your first chapter in the Write tab, your relationship summary, categories, and memories will blossom here.
          </p>
          <button
            onClick={() => navigate('/write')}
            className="px-6 py-3 bg-slate text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-slate/90 transition-all shadow-md active:scale-95"
          >
            Write Our First Story
          </button>
        </motion.div>
      ) : (
        <>
          {/* Milestone Cards: First Chapter & Latest Chapter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {firstChapter && (
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/80 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-lavender bg-lavender/15 px-3 py-1 rounded-full border border-lavender/20">
                    First Chapter
                  </span>
                  <span className="text-xs font-semibold text-slate/40 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(firstChapter.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h4 className="font-handwriting text-2xl font-bold text-slate mb-1">
                  {firstChapter.title}
                </h4>
                <p className="text-xs text-slate/50 flex items-center gap-1 mt-2">
                  <MapPin className="w-3 h-3 text-softblue" />
                  <span>{firstChapter.location}</span>
                  {firstChapter.mood && <span className="ml-2">{firstChapter.mood}</span>}
                </p>
              </motion.div>
            )}

            {latestChapter && (
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
                className="bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/80 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-softblue/15 px-3 py-1 rounded-full border border-softblue/20">
                    Latest Chapter
                  </span>
                  <span className="text-xs font-semibold text-slate/40 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(latestChapter.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h4 className="font-handwriting text-2xl font-bold text-slate mb-1">
                  {latestChapter.title}
                </h4>
                <p className="text-xs text-slate/50 flex items-center gap-1 mt-2">
                  <MapPin className="w-3 h-3 text-softblue" />
                  <span>{latestChapter.location}</span>
                  {latestChapter.mood && <span className="ml-2">{latestChapter.mood}</span>}
                </p>
              </motion.div>
            )}
          </div>

          {/* Categories & Moods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            
            {/* Category Frequency */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/70 backdrop-blur-xl p-6 sm:p-7 rounded-[2.5rem] border border-white/80 shadow-sm"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate">Our Categories</h3>
                  <p className="text-[11px] text-slate/40 uppercase tracking-wider font-bold mt-0.5">Distribution of Adventures</p>
                </div>
                <span className="w-8 h-8 rounded-full bg-lavender/15 text-lavender flex items-center justify-center font-serif text-xs font-bold">
                  {categoryStats.length}
                </span>
              </div>

              <div className="space-y-3.5">
                {categoryStats.slice(0, 5).map((cat, idx) => {
                  const percentage = Math.round((cat.count / maxCategoryCount) * 100);
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate/80">
                        <span>{cat.name}</span>
                        <span className="text-slate/40 text-[11px] font-bold">{cat.count} {cat.count === 1 ? 'Chapter' : 'Chapters'}</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate/5 rounded-full overflow-hidden p-0.5 border border-slate/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.1 * idx, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-lavender via-softblue to-mint"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Moods Distribution & Rating */}
            <div className="flex flex-col gap-4">
              
              {/* Moods Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="bg-white/70 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/80 shadow-sm flex-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-slate">Our Moods</h3>
                    <p className="text-[11px] text-slate/40 uppercase tracking-wider font-bold mt-0.5">Vibes of Our Days</p>
                  </div>
                  <span className="text-xs text-softblue font-bold">
                    {moodStats.reduce((a, b) => a + b.count, 0)} Recorded
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {moodStats.map((item, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/80 rounded-2xl border border-slate/5 shadow-sm text-sm"
                    >
                      <span className="text-xl">{item.mood}</span>
                      <span className="text-xs font-bold text-slate/75">{item.count}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Rating Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white/70 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/80 shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate/40 mb-1">
                    Memory Rating
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold text-slate">{ratingStats.average}</span>
                    <span className="text-xs text-slate/40 font-bold">/ 5.0</span>
                  </div>
                  <div className="flex gap-1 mt-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-serif italic text-slate/60 block">
                    {memories.length} Precious
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-softblue">
                    Memories Logged
                  </span>
                </div>
              </motion.div>

            </div>
          </div>

          {/* Timeline Monthly Distribution */}
          {monthlyActivity.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="bg-white/70 backdrop-blur-xl p-6 sm:p-7 rounded-[2.5rem] border border-white/80 shadow-sm mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate">Journey Over Time</h3>
                  <p className="text-[11px] text-slate/40 uppercase tracking-wider font-bold mt-0.5">Memories per Month</p>
                </div>
                <div className="text-xs font-semibold text-slate/40 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-lavender" />
                  <span>{monthlyActivity.length} Months Logged</span>
                </div>
              </div>

              {/* Monthly Bar Representation */}
              <div className="flex items-end justify-between gap-2 sm:gap-4 h-32 pt-6 px-2 overflow-x-auto">
                {monthlyActivity.map((month, idx) => {
                  const heightPercent = Math.max(20, Math.round((month.count / maxMonthCount) * 100));
                  return (
                    <div key={idx} className="flex-1 min-w-[48px] flex flex-col items-center gap-2 group">
                      {/* Tooltip Count */}
                      <span className="text-[10px] font-bold text-slate/60 opacity-80 group-hover:opacity-100 transition-opacity">
                        {month.count}
                      </span>
                      {/* Bar */}
                      <div className="w-full max-w-[28px] h-20 bg-slate/5 rounded-2xl flex items-end p-1 border border-slate/5">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ duration: 0.6, delay: 0.05 * idx, ease: "easeOut" }}
                          className="w-full rounded-xl bg-gradient-to-t from-softblue to-lavender shadow-sm group-hover:brightness-110 transition-all"
                        />
                      </div>
                      {/* Month Label */}
                      <span className="text-[10px] font-bold text-slate/40 uppercase tracking-wider">
                        {month.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Most Recent Memory Featured Card */}
          {latestChapter && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-slate to-[#1A202C] text-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden"
            >
              <div className="absolute -right-16 -top-16 w-60 h-60 bg-lavender/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 w-60 h-60 bg-softblue/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-lavender bg-white/10 px-3 py-1 rounded-full border border-white/10 inline-block mb-2">
                    Latest Featured Chapter
                  </span>
                  <h3 className="font-handwriting text-3xl font-bold text-white">
                    {latestChapter.title}
                  </h3>
                </div>

                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white border border-white/20 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Open in Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10 items-center">
                {/* Image Preview if available */}
                {(latestChapter.images?.length > 0 || latestChapter.image) && (
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-white/10 bg-white/5">
                    <img
                      src={latestChapter.images?.[0] || latestChapter.image}
                      alt={latestChapter.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Story excerpt and metadata */}
                <div className={latestChapter.images?.length > 0 || latestChapter.image ? "sm:col-span-2 space-y-3" : "sm:col-span-3 space-y-3"}>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-softblue" />
                      {new Date(latestChapter.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-mint" />
                      {latestChapter.location}
                    </span>
                    {latestChapter.mood && (
                      <>
                        <span>•</span>
                        <span>{latestChapter.mood}</span>
                      </>
                    )}
                  </div>

                  <p className="text-white/80 text-sm leading-relaxed line-clamp-3 font-sans">
                    {latestChapter.story.replace(/[#*`_]/g, '')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}

    </div>
  );
}

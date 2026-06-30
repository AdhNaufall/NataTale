import { useState, useEffect, useMemo } from 'react';
import { Camera, CalendarHeart, Sparkles, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Us({ memories }: { memories: any[] }) {
  const totalMemories = memories.length;
  const totalPhotos = memories.reduce((acc, curr) => acc + (curr.images?.length || 1), 0);
  
  // Pick up to 4 random images for the scrapbook
  const randomPhotos = useMemo(() => {
    const allImages = memories.flatMap(m => m.images || [m.image]).filter(Boolean);
    const shuffled = [...allImages].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, [memories]);

  // Generate random rotations for polaroids
  const rotations = useMemo(() => [
    -12, 8, -6, 15
  ], []);

  const [timeTogether, setTimeTogether] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Tanggal jadian: 23 Mei 2026
    const startDate = new Date('2026-05-23T00:00:00');
    
    const updateCounter = () => {
      const now = new Date();
      const diff = now.getTime() - startDate.getTime();
      
      if (diff < 0) return;

      const totalSeconds = Math.floor(diff / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(totalMinutes / 60);
      const totalDays = Math.floor(totalHours / 24);
      
      const years = Math.floor(totalDays / 365);
      const remainingDays = totalDays % 365;
      const months = Math.floor(remainingDays / 30);
      const days = remainingDays % 30;

      const hours = totalHours % 24;
      const minutes = totalMinutes % 60;
      const seconds = totalSeconds % 60;

      setTimeTogether({ years, months, days, hours, minutes, seconds });
    };

    updateCounter();
    const interval = setInterval(updateCounter, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen pt-12 pb-32 px-6 max-w-lg mx-auto text-center relative">
      
      {/* Decorative Orbs */}
      <div className="absolute top-40 left-0 w-64 h-64 bg-lavender/10 rounded-full blur-[80px] -z-10 animate-pulse" />
      <div className="absolute top-80 right-0 w-64 h-64 bg-softblue/10 rounded-full blur-[80px] -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      <h2 className="font-serif text-5xl font-bold text-slate mb-3 mt-4">Our Journey</h2>
      <p className="text-gray-400 mb-12 tracking-wide text-sm font-medium">Building memories, one day at a time.</p>

      {/* Scrapbook Polaroids */}
      {randomPhotos.length > 0 && (
        <div className="relative h-64 mb-20 flex justify-center items-center">
          {randomPhotos.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.5, y: -50, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: rotations[idx] }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 12, 
                delay: idx * 0.15 
              }}
              whileHover={{ 
                scale: 1.15, 
                rotate: 0, 
                zIndex: 50,
                y: -20,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              className="absolute w-36 aspect-[3/4] bg-white p-2 pb-8 shadow-polaroid border border-gray-100 rounded-sm cursor-pointer"
              style={{
                left: `calc(50% - 72px + ${(idx - 1.5) * 40}px)`, // Spread them out slightly
                zIndex: 10 + idx
              }}
            >
              <img src={img} alt="Scrapbook" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                <HeartIcon className="w-4 h-4 text-rose/30" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Live Counter Widget (Premium Glassmorphic) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 mb-8 relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-lavender/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-softblue/10 rounded-full blur-2xl"></div>
        
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate/40 mb-6 flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3 text-lavender" />
          Time Together
          <Sparkles className="w-3 h-3 text-lavender" />
        </h3>
        
        <div className="flex justify-center gap-4 sm:gap-6 text-center">
          {timeTogether.years > 0 && (
            <div className="flex flex-col items-center">
              <span className="text-3xl font-serif font-bold text-softblue mb-1">{timeTogether.years}</span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400">Yrs</span>
            </div>
          )}
          <div className="flex flex-col items-center">
            <span className="text-3xl font-serif font-bold text-lavender mb-1">{timeTogether.months}</span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400">Mths</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-serif font-bold text-mint mb-1">{timeTogether.days}</span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400">Days</span>
          </div>
          <div className="w-[1px] h-10 bg-gray-200 mx-1"></div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-serif font-bold text-slate mb-1">{timeTogether.hours.toString().padStart(2, '0')}</span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400">Hrs</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-serif font-bold text-slate mb-1">{timeTogether.minutes.toString().padStart(2, '0')}</span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400">Min</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-serif font-bold text-slate mb-1">{timeTogether.seconds.toString().padStart(2, '0')}</span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400">Sec</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-2 gap-4 mb-16"
      >
        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-white/50 flex flex-col items-center hover:bg-white/80 transition-colors">
          <div className="w-12 h-12 rounded-full bg-lavender/15 flex items-center justify-center text-lavender mb-4 shadow-inner ring-1 ring-lavender/20">
            <CalendarHeart className="w-6 h-6" />
          </div>
          <span className="text-3xl font-serif font-bold text-slate mb-1">{totalMemories}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate/40">Chapters</span>
        </div>

        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-white/50 flex flex-col items-center hover:bg-white/80 transition-colors">
          <div className="w-12 h-12 rounded-full bg-mint/20 flex items-center justify-center text-mint mb-4 shadow-inner ring-1 ring-mint/20">
            <Camera className="w-6 h-6" />
          </div>
          <span className="text-3xl font-serif font-bold text-slate mb-1">{totalPhotos}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate/40">Captures</span>
        </div>
      </motion.div>

      {/* App Ecosystem Portal */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[2rem] p-8 text-left relative overflow-hidden shadow-2xl shadow-slate/20"
      >
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-softblue/10 rounded-full blur-2xl"></div>
        
        <h3 className="font-serif text-2xl font-bold text-white mb-2 relative z-10">TanaLumina</h3>
        <p className="text-gray-400 text-sm mb-8 relative z-10 font-medium">Enter the photobooth universe and capture your raw moments.</p>
        
        <a 
          href="https://tanalumina-photobooth.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 rounded-2xl font-bold tracking-wide flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          Open Portal <ExternalLink className="w-4 h-4" />
        </a>
      </motion.div>

    </div>
  );
}

function HeartIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

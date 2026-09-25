import { useState, useEffect, useMemo } from 'react';
import { Sparkles, ExternalLink, Dices, ArrowRight, Heart, MapPin, Calendar, Camera, Music, Music2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateRelationshipDuration } from '../lib/relationship';

interface UsProps {
  memories: any[];
  navigate?: (path: string) => void;
}

export default function Us({ memories, navigate }: UsProps) {
  const [timeTogether, setTimeTogether] = useState(() => calculateRelationshipDuration());

  useEffect(() => {
    const updateCounter = () => {
      setTimeTogether(calculateRelationshipDuration());
    };

    updateCounter();
    const interval = setInterval(updateCounter, 1000);
    return () => clearInterval(interval);
  }, []);

  // Pick up to 4 random images for the top scrapbook on initial load
  const randomPhotos = useMemo(() => {
    const allImages = memories.flatMap(m => m.images || [m.image]).filter(Boolean);
    const shuffled = [...allImages].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, [memories]);

  // Rotations for the top scrapbook polaroids
  const rotations = useMemo(() => [-10, 8, -5, 12], []);

  // Total stats for emotional captions
  const totalMemories = memories.length;
  const totalPhotos = useMemo(() => {
    return memories.reduce((acc, curr) => acc + (curr.images?.length || (curr.image ? 1 : 0)), 0);
  }, [memories]);
  const uniquePlacesCount = useMemo(() => {
    return new Set(memories.map(m => m.location?.trim()).filter(Boolean)).size;
  }, [memories]);

  // Highlights: top-rated memories or earliest memory
  const highlights = useMemo(() => {
    if (memories.length === 0) return [];
    const sorted = [...memories].sort((a, b) => (b.rating || 5) - (a.rating || 5));
    return sorted.slice(0, 3);
  }, [memories]);

  // Random memory generator for "A Little Reminder / Surprise Me"
  const [randomMemoryIndex, setRandomMemoryIndex] = useState(0);

  const currentRandomMemory = useMemo(() => {
    if (memories.length === 0) return null;
    return memories[randomMemoryIndex % memories.length];
  }, [memories, randomMemoryIndex]);

  const handleSurpriseMe = () => {
    if (memories.length <= 1) return;
    let nextIndex = Math.floor(Math.random() * memories.length);
    if (nextIndex === randomMemoryIndex) {
      nextIndex = (nextIndex + 1) % memories.length;
    }
    setRandomMemoryIndex(nextIndex);
  };

  return (
    <div className="min-h-screen pt-10 pb-36 px-4 sm:px-6 max-w-xl mx-auto text-center font-sans text-slate relative select-none">

      {/* Decorative Orbs */}
      <div className="absolute top-24 left-0 w-72 h-72 bg-lavender/15 rounded-full blur-[90px] -z-10 pointer-events-none animate-pulse" />
      <div className="absolute top-96 right-0 w-72 h-72 bg-rose/15 rounded-full blur-[90px] -z-10 pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-40 left-1/3 w-64 h-64 bg-softblue/15 rounded-full blur-[80px] -z-10 pointer-events-none" />

      {/* 1. HERO — "OUR LITTLE WORLD" */}
      <div className="mb-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/70 backdrop-blur-md rounded-full border border-white/60 shadow-xs text-xs font-bold uppercase tracking-widest text-lavender mb-3"
        >
          <Heart className="w-3.5 h-3.5 fill-lavender/30 text-lavender" />
          <span>Our Little World</span>
          <Heart className="w-3.5 h-3.5 fill-lavender/30 text-lavender" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="font-serif text-5xl sm:text-6xl font-bold text-slate mb-2 tracking-tight"
        >
          NATATALE
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-handwriting text-2xl sm:text-3xl text-slate/75 mb-3"
        >
          Two souls, one beautiful journey.
        </motion.p>
      </div>

      {/* 2. OUR SCRAPBOOK POLAROIDS */}
      {randomPhotos.length > 0 && (
        <div className="relative h-64 sm:h-72 mb-12 flex justify-center items-center">
          {randomPhotos.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9, y: 15, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: rotations[idx] }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
                delay: idx * 0.08
              }}
              whileHover={{
                scale: 1.06,
                rotate: 0,
                zIndex: 50,
                y: -8,
                transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
              }}
              className="absolute w-32 sm:w-40 aspect-[3/4] bg-white p-2 pb-7 sm:pb-9 shadow-polaroid border border-gray-100 rounded-sm cursor-pointer transition-shadow"
              style={{
                left: `calc(50% - 64px + ${(idx - 1.5) * 36}px)`,
                zIndex: 10 + idx
              }}
            >
              {/* Cute Washi Tape at the top of the middle polaroid */}
              {idx === 1 && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-10 h-4 bg-rose/40 backdrop-blur-xs border border-rose/30 -rotate-3 z-30" />
              )}
              {idx === 2 && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-10 h-4 bg-softblue/40 backdrop-blur-xs border border-softblue/30 rotate-6 z-30" />
              )}

              <img src={img} alt="Scrapbook moment" className="w-full h-full object-cover" />
              <div className="absolute bottom-1.5 sm:bottom-2.5 left-0 right-0 flex justify-center items-center">
                <Heart className="w-3.5 h-3.5 text-rose/40 fill-rose/20" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 3. RELATIONSHIP DURATION LIVE COUNTER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-8 shadow-[0_15px_40px_-15px_rgba(44,53,69,0.06)] border border-white/80 mb-8 relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-lavender/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-rose/15 rounded-full blur-2xl pointer-events-none" />

        <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate/40 mb-6 flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3 text-lavender" />
          <span>We've Been Us For</span>
          <Sparkles className="w-3 h-3 text-lavender" />
        </h3>

        <div className="flex justify-center gap-3 sm:gap-5 text-center">
          {timeTogether.years > 0 && (
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-serif font-bold text-softblue mb-0.5">{timeTogether.years}</span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate/40">Yrs</span>
            </div>
          )}
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-lavender mb-0.5">{timeTogether.months}</span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate/40">Mths</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-mint mb-0.5">{timeTogether.days}</span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate/40">Days</span>
          </div>

          <div className="w-[1px] h-10 bg-slate/10 mx-0.5 sm:mx-1"></div>

          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-slate mb-0.5">{String(timeTogether.hours).padStart(2, '0')}</span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate/40">Hrs</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-slate mb-0.5">{String(timeTogether.minutes).padStart(2, '0')}</span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate/40">Min</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-rose-500 mb-0.5">{String(timeTogether.seconds).padStart(2, '0')}</span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate/40">Sec</span>
          </div>
        </div>

        <p className="font-serif italic text-xs text-slate/45 mt-4">
          and falling more in love with every passing second ♡
        </p>
      </motion.div>

      {/* 4. "LITTLE THINGS ABOUT US" — SCRAPBOOK PROSE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-white/80 via-white/60 to-lavender/10 backdrop-blur-xl p-6 sm:p-7 rounded-[2.5rem] border border-white/80 shadow-sm text-left mb-8 relative overflow-hidden"
      >
        <span className="font-handwriting text-2xl font-bold text-lavender block mb-1">
          A little piece of our story...
        </span>
        <p className="font-serif italic text-slate/75 text-sm leading-relaxed mb-4">
          "A collection of little moments, different places, late-night talks, and memories we decided to keep forever."
        </p>

        {memories.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-slate/10 font-sans text-xs text-slate/70">
            <div className="flex items-center gap-2">
              <span className="text-rose-400 font-bold">♡</span>
              <span>We've written <strong>{totalMemories}</strong> precious chapters together so far.</span>
            </div>
            {uniquePlacesCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-bold">📍</span>
                <span>Our footsteps have wandered through <strong>{uniquePlacesCount}</strong> special places.</span>
              </div>
            )}
            {totalPhotos > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">📸</span>
                <span>Over <strong>{totalPhotos}</strong> captured smiles and candid memories saved.</span>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* 5. "A LITTLE REMINDER — RANDOM MEMORY FOR YOU" */}
      {currentRandomMemory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/70 backdrop-blur-xl p-6 sm:p-7 rounded-[2.5rem] border border-white/80 shadow-sm mb-8 text-left relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-lavender bg-lavender/15 px-3 py-1 rounded-full border border-lavender/20 inline-block mb-1">
                A Little Reminder
              </span>
              <h3 className="font-serif text-xl font-bold text-slate">Remember this day?</h3>
            </div>

            <button
              onClick={handleSurpriseMe}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-lavender/15 hover:bg-lavender/25 text-lavender rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Surprise me with another memory"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Surprise Me ♡</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentRandomMemory.id || randomMemoryIndex}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-polaroid space-y-3"
            >
              {/* Image thumbnail if available */}
              {(currentRandomMemory.images?.length > 0 || currentRandomMemory.image) && (
                <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-gray-50">
                  <img
                    src={currentRandomMemory.images?.[0] || currentRandomMemory.image}
                    alt={currentRandomMemory.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-handwriting text-2xl font-bold text-slate">
                    {currentRandomMemory.title}
                  </h4>
                  {currentRandomMemory.mood && (
                    <span className="text-2xl">{currentRandomMemory.mood}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate/50 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-softblue" />
                    {new Date(currentRandomMemory.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-500" />
                    {currentRandomMemory.location}
                  </span>
                </div>

                <p className="text-xs text-slate/75 leading-relaxed line-clamp-2 font-sans italic">
                  "{currentRandomMemory.story.replace(/[#*`_]/g, '')}"
                </p>

                {currentRandomMemory.spotifyUrl && (
                  <div className="pt-2">
                    <a
                      href={currentRandomMemory.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-lavender/15 to-softblue/15 hover:from-lavender/25 hover:to-softblue/25 text-slate border border-lavender/25 rounded-xl text-[11px] font-bold transition-all active:scale-95 shadow-2xs group max-w-full"
                    >
                      <Music2 className="w-3.5 h-3.5 text-lavender shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="truncate">
                        {currentRandomMemory.spotifyTitle ? (
                          <>
                            <span className="font-serif font-bold text-slate">“{currentRandomMemory.spotifyTitle}”</span>
                            {currentRandomMemory.spotifyArtist && (
                              <span className="text-slate/60 font-normal font-sans ml-1">· {currentRandomMemory.spotifyArtist}</span>
                            )}
                          </>
                        ) : (
                          <span>Our Song: Listen on Spotify ↗</span>
                        )}
                      </span>
                    </a>
                  </div>
                )}

                {navigate && (
                  <div className="mt-3 pt-2 border-t border-dashed border-gray-100 flex justify-end">
                    <button
                      onClick={() => navigate('/')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-softblue hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <span>View in Timeline</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {/* 6. "LITTLE HIGHLIGHTS" POLAROID CAROUSEL / CARDS */}
      {highlights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-10 text-left"
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <div>
              <h3 className="font-serif text-xl font-bold text-slate">Little Highlights</h3>
              <p className="text-[11px] text-slate/40 uppercase tracking-wider font-bold">Moments we treasure most</p>
            </div>
            {navigate && (
              <button
                onClick={() => navigate('/')}
                className="text-xs font-bold text-softblue hover:text-blue-600 flex items-center gap-1 cursor-pointer"
              >
                <span>All Chapters</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {highlights.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => navigate?.('/')}
                className="bg-white p-3 pb-4 rounded-2xl shadow-polaroid border border-gray-100 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {(item.images?.length > 0 || item.image) ? (
                    <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-2">
                      <img
                        src={item.images?.[0] || item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square w-full rounded-xl bg-lavender/10 flex items-center justify-center text-lavender mb-2">
                      <Heart className="w-6 h-6 fill-lavender/20" />
                    </div>
                  )}
                  <h4 className="font-handwriting text-xl font-bold text-slate truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate/40 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 text-softblue" />
                    <span className="truncate">{item.location}</span>
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-dashed border-gray-100 flex items-center justify-between text-[10px] text-slate/40">
                  <span>{new Date(item.date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span>
                  {item.mood && <span>{item.mood}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 7. APP ECOSYSTEM & SOCIAL PORTAL — TANALUMINA & TIKTOK */}
      <div className="space-y-4">
        <div className="text-left px-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate/40 mb-1">
            <Sparkles className="w-3 h-3 text-lavender" />
            <span>Our Little Digital World</span>
          </div>
          <h3 className="font-serif text-xl font-bold text-slate">Connected Spaces</h3>
        </div>

        <div className="space-y-4">
          {/* TanaLumina Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[2.5rem] p-7 text-left relative overflow-hidden shadow-2xl shadow-slate/20 group hover:shadow-slate/30 transition-all"
          >
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-softblue/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-softblue/80 bg-white/10 px-3 py-1 rounded-full border border-white/10 inline-block">
                Photobooth Portal
              </span>
              <Camera className="w-4 h-4 text-softblue/60" />
            </div>

            <h3 className="font-serif text-2xl font-bold text-white mb-1.5 relative z-10">TanaLumina</h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-6 relative z-10 font-sans leading-relaxed">
              Step into our photobooth universe and capture our raw, joyful, and candid moments.
            </p>

            <a
              href="https://tanalumina-photobooth.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 w-full py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white border border-white/20 rounded-2xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
            >
              <span>Open Photobooth Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </motion.div>

          {/* TikTok Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="bg-gradient-to-br from-[#1E1B2E] via-[#1F1D36] to-[#0F172A] rounded-[2.5rem] p-7 text-left relative overflow-hidden shadow-2xl shadow-slate/20 group hover:shadow-slate/30 transition-all border border-rose-500/10"
          >
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-lavender/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-rose-300/90 bg-rose-500/15 px-3 py-1 rounded-full border border-rose-400/20 inline-block">
                Our Little Videos
              </span>
              <Music className="w-4 h-4 text-rose-400/70" />
            </div>

            <h3 className="font-serif text-2xl font-bold text-white mb-1.5 relative z-10">TikTok</h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-6 relative z-10 font-sans leading-relaxed">
              A little collection of our random moments, video memories, laughs, and chaos ♡
            </p>

            <a
              href="https://www.tiktok.com/@natadeqoqo.jpg?_r=1&_t=ZS-99y6MxZJdyv"
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 w-full py-3.5 bg-rose-500/20 hover:bg-rose-500/30 backdrop-blur-xs text-white border border-rose-400/30 rounded-2xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
            >
              <span>Visit @natadeqoqo.jpg</span>
              <ExternalLink className="w-3.5 h-3.5 text-rose-200" />
            </a>
          </motion.div>
        </div>
      </div>

    </div>
  );
}

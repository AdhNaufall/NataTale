import React from 'react';
import { Camera, CalendarHeart, Sparkles, ExternalLink } from 'lucide-react';

export default function Us({ memories }: { memories: any[] }) {
  const totalMemories = memories.length;
  const totalPhotos = memories.reduce((acc, curr) => acc + (curr.images?.length || 1), 0);
  
  const [timeTogether, setTimeTogether] = React.useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  React.useEffect(() => {
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
    <div className="min-h-screen pt-20 pb-32 px-6 max-w-md mx-auto text-center">
      
      <div className="w-32 h-32 mx-auto rounded-full bg-softblue/20 flex items-center justify-center mb-8 border-4 border-white shadow-lg relative">
        <HeartIcon className="w-12 h-12 text-lavender animate-pulse" />
        {/* Floating elements */}
        <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2" />
      </div>

      <h2 className="font-serif text-4xl font-bold text-slate mb-2">Our Journey</h2>
      <p className="text-gray-500 mb-8">Building memories, one day at a time.</p>

      {/* Live Counter */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-12">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Time Together</h3>
        <div className="flex justify-center gap-3 text-center">
          {timeTogether.years > 0 && (
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-bold text-softblue">{timeTogether.years}</span>
              <span className="text-[9px] uppercase font-bold text-gray-400">Yrs</span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-bold text-lavender">{timeTogether.months}</span>
            <span className="text-[9px] uppercase font-bold text-gray-400">Mths</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-bold text-mint">{timeTogether.days}</span>
            <span className="text-[9px] uppercase font-bold text-gray-400">Days</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-bold text-slate">{timeTogether.hours}</span>
            <span className="text-[9px] uppercase font-bold text-gray-400">Hrs</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-bold text-slate">{timeTogether.minutes}</span>
            <span className="text-[9px] uppercase font-bold text-gray-400">Min</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-bold text-softblue">{timeTogether.seconds}</span>
            <span className="text-[9px] uppercase font-bold text-gray-400">Sec</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-16">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-lavender/10 flex items-center justify-center text-lavender mb-3">
            <CalendarHeart className="w-5 h-5" />
          </div>
          <span className="text-3xl font-serif font-bold text-slate mb-1">{totalMemories}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Chapters</span>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-mint/20 flex items-center justify-center text-mint mb-3">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-3xl font-serif font-bold text-slate mb-1">{totalPhotos}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Captures</span>
        </div>
      </div>

      {/* App Ecosystem Portal */}
      <div className="bg-gradient-to-br from-[#2D2D2D] to-[#1A1A1A] rounded-[2rem] p-8 text-left relative overflow-hidden shadow-xl">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        <h3 className="font-serif text-2xl font-bold text-white mb-2">TanaLumina</h3>
        <p className="text-gray-400 text-sm mb-6">Enter the photobooth universe and capture your raw moments.</p>
        <a 
          href="https://tanalumina-photobooth.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 bg-white text-slate rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
        >
          Open Portal <ExternalLink className="w-4 h-4" />
        </a>
      </div>

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

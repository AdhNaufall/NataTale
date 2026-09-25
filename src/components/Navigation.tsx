import { Clock, PenTool, Grid, Heart, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface NavigationProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export function Navigation({ currentPath, navigate }: NavigationProps) {
  const navItems = [
    { path: '/', label: 'Timeline', icon: Clock },
    { path: '/archive', label: 'Archive', icon: Grid },
    { path: '/write', label: 'Write', icon: PenTool },
    { path: '/story', label: 'Story', icon: Sparkles },
    { path: '/us', label: 'Us', icon: Heart },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-2 w-[95%] max-w-md">
      <div className="bg-white/75 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2rem] px-3 sm:px-4 py-2.5 sm:py-3 flex justify-between items-center relative overflow-hidden">
        {/* Subtle inner highlight */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-white/60 pointer-events-none rounded-[2rem]"></div>
        
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 sm:gap-1 transition-all duration-200 w-14 sm:w-16 z-10 cursor-pointer",
                isActive ? "text-slate" : "text-gray-400 hover:text-softblue"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute -inset-x-1.5 -inset-y-1.5 bg-softblue/15 rounded-2xl -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <motion.div
                animate={isActive ? { y: -1, scale: 1.04 } : { y: 0, scale: 1 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "p-1 rounded-2xl transition-colors duration-200",
                  isActive ? "text-softblue" : ""
                )}
              >
                <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", isActive ? "stroke-[2.25px]" : "stroke-2")} />
              </motion.div>
              <span 
                className={cn(
                  "text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wider sm:tracking-widest mt-0.5 transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-60"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

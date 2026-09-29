import { Clock, PenTool, Grid, Heart, Sparkles, Mail } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface NavigationProps {
  currentPath: string;
  navigate: (path: string) => void;
  unopenedLettersCount?: number;
}

export function Navigation({ currentPath, navigate, unopenedLettersCount = 0 }: NavigationProps) {
  const navItems = [
    { path: '/', label: 'Timeline', icon: Clock },
    { path: '/archive', label: 'Archive', icon: Grid },
    { path: '/write', label: 'Write', icon: PenTool },
    { path: '/letters', label: 'Letters', icon: Mail, badge: unopenedLettersCount },
    { path: '/story', label: 'Story', icon: Sparkles },
    { path: '/us', label: 'Us', icon: Heart },
  ];

  return (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-2 w-[96%] max-w-lg">
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(44,53,69,0.09)] rounded-[2rem] px-2 sm:px-4 py-2 sm:py-2.5 flex justify-between items-center relative overflow-hidden">
        {/* Subtle inner highlight */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-white/70 pointer-events-none rounded-[2rem]"></div>
        
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          const badgeCount = item.badge || 0;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex flex-col items-center justify-center transition-all duration-200 flex-1 py-0.5 z-10 cursor-pointer min-w-0",
                isActive ? "text-slate" : "text-gray-400 hover:text-softblue"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute -inset-x-1 -inset-y-1 bg-softblue/15 rounded-2xl -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <motion.div
                animate={isActive ? { y: -1, scale: 1.05 } : { y: 0, scale: 1 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "p-1 rounded-xl transition-colors duration-200 relative",
                  isActive ? "text-softblue" : ""
                )}
              >
                <Icon className={cn("w-4.5 h-4.5 sm:w-5 sm:h-5", isActive ? "stroke-[2.25px]" : "stroke-2")} />
                
                {/* Unopened Letters Badge */}
                {badgeCount > 0 && !isActive && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-rose border border-white animate-pulse" />
                )}
              </motion.div>
              <span 
                className={cn(
                  "text-[8px] sm:text-[8.5px] font-bold uppercase tracking-tight sm:tracking-wider mt-0.5 transition-opacity duration-200 truncate max-w-full",
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

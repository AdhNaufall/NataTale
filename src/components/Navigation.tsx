import { Clock, PenTool, Grid, Heart } from 'lucide-react';
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
    { path: '/us', label: 'Us', icon: Heart },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-2 w-[90%] max-w-sm">
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2rem] px-4 py-3 flex justify-between items-center relative overflow-hidden">
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
                "relative flex flex-col items-center gap-1 transition-all duration-300 w-16 z-10",
                isActive ? "text-slate" : "text-gray-400 hover:text-softblue"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute -inset-x-2 -inset-y-2 bg-softblue/15 rounded-2xl -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
              <motion.div
                animate={isActive ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={cn(
                  "p-1 rounded-2xl transition-colors duration-300",
                  isActive ? "text-softblue" : ""
                )}
              >
                <Icon className={cn("w-6 h-6", isActive ? "stroke-[2.5px]" : "stroke-2")} />
              </motion.div>
              <motion.span 
                animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.6, y: 0 }}
                className="text-[9px] font-bold uppercase tracking-widest mt-0.5"
              >
                {item.label}
              </motion.span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

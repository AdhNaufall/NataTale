import { Clock, PenTool, Grid, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

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
    <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-softblue/20 z-50 px-6 py-4">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors duration-200",
                isActive ? "text-lavender" : "text-gray-400 hover:text-softblue"
              )}
            >
              <div className={cn(
                "p-2 rounded-2xl transition-all duration-300",
                isActive ? "bg-lavender/10 scale-110" : ""
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

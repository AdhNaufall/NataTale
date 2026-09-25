import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function FloatingParticles() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number; duration: number; driftX: number }[]>([]);

  useEffect(() => {
    // Generate subtle ambient particles (reduced count, slower, calm drift)
    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage of screen width
      y: Math.random() * 100 + 100, // Start from below screen
      size: Math.random() * 14 + 8, // size between 8-22px
      delay: Math.random() * 8, // 0-8s delay
      duration: Math.random() * 14 + 18, // 18-32s very slow duration
      driftX: (Math.random() - 0.5) * 12, // Subtle horizontal drift
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bg-white/20 rounded-full backdrop-blur-xs shadow-[0_0_12px_rgba(255,255,255,0.3)]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}vw`,
            bottom: `-15vh`, // Start below the screen
          }}
          animate={{
            y: ['0vh', '-120vh'], // Float up past the top of the screen
            x: [`0vw`, `${p.driftX}vw`],
            opacity: [0, 0.45, 0], // Subtle fade in then out
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}

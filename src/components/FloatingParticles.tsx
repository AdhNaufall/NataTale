import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function FloatingParticles() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage of screen width
      y: Math.random() * 100 + 100, // Start from below screen
      size: Math.random() * 20 + 10, // size between 10-30px
      delay: Math.random() * 5, // 0-5s delay
      duration: Math.random() * 10 + 10, // 10-20s duration
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bg-white/30 rounded-full backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.5)]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}vw`,
            bottom: `-20vh`, // Start below the screen
          }}
          animate={{
            y: ['0vh', '-120vh'], // Float up past the top of the screen
            x: [`0vw`, `${(Math.random() - 0.5) * 20}vw`], // Slight horizontal drift
            opacity: [0, 0.8, 0], // Fade in then out
            rotate: [0, 360],
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

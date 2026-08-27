import React, { useState, useEffect } from 'react';
import { Heart, Delete } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface LockScreenProps {
  onUnlock: () => void;
}

const PAD_MAPPING: Record<string, string> = {
  '1': '',
  '2': 'A B C',
  '3': 'D E F',
  '4': 'G H I',
  '5': 'J K L',
  '6': 'M N O',
  '7': 'P Q R S',
  '8': 'T U V',
  '9': 'W X Y Z',
  '0': ''
};

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  // THE SECRET PIN (You can change this!)
  const SECRET_PIN = "230526";

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (pin === SECRET_PIN) {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 500); // Wait for shake animation
    }
  };

  useEffect(() => {
    if (pin.length === SECRET_PIN.length) {
      handleSubmit();
    }
  }, [pin]);

  const handleKeyPress = (num: string) => {
    if (pin.length < SECRET_PIN.length && !error) {
      setPin(p => p + num);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background bg-noise p-6 overflow-hidden select-none">
      
      {/* Dynamic Ambient Background Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          x: [0, 20, 0],
          y: [0, -20, 0]
        }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[28rem] h-[28rem] bg-gradient-to-tr from-lavender/25 to-rose/20 rounded-full blur-[90px] -z-10 pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, -25, 0],
          y: [0, 25, 0]
        }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-gradient-to-br from-softblue/25 to-mint/20 rounded-full blur-[90px] -z-10 pointer-events-none" 
      />

      {/* Main Glass Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm bg-white/75 backdrop-blur-2xl p-8 sm:p-9 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(44,53,69,0.12),0_0_0_1px_rgba(255,255,255,0.8)] border border-white/80 flex flex-col items-center mx-4 relative"
      >
        {/* Pulsing Heart Emblem */}
        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className="mb-3 relative"
        >
          <div className="absolute inset-0 bg-softblue/30 rounded-full blur-xl animate-pulse" />
          <Heart className="w-11 h-11 text-softblue fill-softblue/30 drop-shadow-md relative z-10" />
        </motion.div>

        {/* Title */}
        <h1 className="font-serif text-3xl font-bold tracking-wider text-slate mb-1 drop-shadow-sm">NataTale</h1>
        <p className="text-[11px] uppercase tracking-[0.25em] font-sans font-bold text-slate/40 mb-8">
          Enter Passcode
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
          
          {/* Pulsing PIN Indicator Dots with Spring Physics */}
          <motion.div
            animate={error ? { x: [-16, 16, -12, 12, -6, 6, 0] } : {}}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="flex gap-4 sm:gap-5 mb-10 h-7 items-center justify-center"
          >
            {Array.from({ length: SECRET_PIN.length }).map((_, index) => {
              const isFilled = pin.length > index;
              return (
                <div key={index} className="relative flex items-center justify-center">
                  <motion.div
                    animate={
                      error
                        ? { scale: [1, 1.2, 1], backgroundColor: "#F43F5E", borderColor: "#E11D48" }
                        : isFilled
                        ? { scale: [0.8, 1.25, 1.1], transition: { type: "spring", stiffness: 500, damping: 20 } }
                        : { scale: 1 }
                    }
                    className={cn(
                      "w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 transition-colors duration-200",
                      isFilled
                        ? "bg-gradient-to-tr from-slate to-slate/80 border-slate shadow-[0_0_12px_rgba(44,53,69,0.35)]"
                        : "border-slate/25 bg-white/40 shadow-inner",
                      error && "shadow-[0_0_15px_rgba(244,63,94,0.6)]"
                    )}
                  />
                  {/* Subtle Glow Ripple when just filled */}
                  {isFilled && !error && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.8 }}
                      animate={{ scale: 1.8, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 rounded-full bg-softblue/50 pointer-events-none"
                    />
                  )}
                </div>
              );
            })}
          </motion.div>

          <input
            type="number"
            value={pin}
            onChange={(e) => {
              if (e.target.value.length <= SECRET_PIN.length && !error) {
                setPin(e.target.value);
              }
            }}
            className="opacity-0 absolute -z-10 h-0 w-0"
            autoFocus
            inputMode="numeric"
            pattern="[0-9]*"
          />

          {/* Tactile Frosted Glass Dial Pad */}
          <div className="grid grid-cols-3 gap-x-5 gap-y-3.5 sm:gap-x-7 sm:gap-y-4 w-full max-w-[280px]">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <motion.button
                key={num}
                type="button"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.90, y: 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                onClick={() => handleKeyPress(num)}
                className={cn(
                  "w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] mx-auto rounded-full",
                  "bg-gradient-to-b from-white/90 to-white/50 backdrop-blur-md",
                  "border border-white/90 shadow-[0_4px_12px_rgba(44,53,69,0.04),0_1px_2px_rgba(44,53,69,0.02)]",
                  "hover:shadow-[0_8px_20px_-4px_rgba(152,207,249,0.35),0_0_0_1px_rgba(152,207,249,0.4)]",
                  "active:shadow-inner active:bg-slate/5",
                  "flex flex-col items-center justify-center transition-all duration-150 relative cursor-pointer"
                )}
              >
                <span className="text-2xl sm:text-3xl font-light text-slate leading-none mt-0.5">{num}</span>
                <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-slate/40 uppercase mt-0.5 h-2.5">
                  {PAD_MAPPING[num]}
                </span>
              </motion.button>
            ))}
            
            {/* Empty space bottom left */}
            <div className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] mx-auto" />

            {/* Zero Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.90, y: 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              onClick={() => handleKeyPress('0')}
              className={cn(
                "w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] mx-auto rounded-full",
                "bg-gradient-to-b from-white/90 to-white/50 backdrop-blur-md",
                "border border-white/90 shadow-[0_4px_12px_rgba(44,53,69,0.04),0_1px_2px_rgba(44,53,69,0.02)]",
                "hover:shadow-[0_8px_20px_-4px_rgba(152,207,249,0.35),0_0_0_1px_rgba(152,207,249,0.4)]",
                "active:shadow-inner active:bg-slate/5",
                "flex flex-col items-center justify-center transition-all duration-150 relative cursor-pointer"
              )}
            >
              <span className="text-2xl sm:text-3xl font-light text-slate leading-none">0</span>
            </motion.button>

            {/* Backspace Button */}
            <AnimatePresence>
              {pin.length > 0 ? (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setPin(p => p.slice(0, -1))}
                  className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] mx-auto rounded-full flex items-center justify-center text-slate/60 hover:text-slate hover:bg-white/60 transition-colors cursor-pointer"
                >
                  <Delete className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />
                </motion.button>
              ) : (
                <div className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] mx-auto" />
              )}
            </AnimatePresence>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

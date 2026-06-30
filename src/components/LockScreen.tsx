import React, { useState, useEffect } from 'react';
import { Lock, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
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
      }, 400); // Wait for shake animation
    }
  };

  useEffect(() => {
    if (pin.length === SECRET_PIN.length) {
      handleSubmit();
    }
  }, [pin]);

  const handleKeyPress = (num: string) => {
    if (pin.length < SECRET_PIN.length) {
      setPin(p => p + num);
      setError(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background bg-noise p-6 overflow-hidden">
      
      {/* Decorative Orbs (Light Theme) */}
      <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-lavender/30 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-softblue/30 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-[3rem] shadow-2xl border border-white flex flex-col items-center mx-4"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="mb-4"
        >
          <Heart className="w-12 h-12 text-softblue fill-softblue/30 drop-shadow-lg" />
        </motion.div>
        <h1 className="text-softblue font-serif text-3xl font-bold tracking-wide mb-8 drop-shadow-sm">NataTale</h1>

        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          
          {/* Passcode Dots */}
          <motion.div
            animate={error ? { x: [-12, 12, -10, 10, -5, 5, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex gap-4 sm:gap-6 mb-16 h-6 items-center"
          >
            {Array.from({ length: SECRET_PIN.length }).map((_, index) => {
              const isFilled = pin.length > index;
              return (
                <div
                  key={index}
                  className={cn(
                    "w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 transition-all duration-200",
                    isFilled 
                      ? "bg-slate border-slate scale-110" 
                      : "border-slate/20 bg-transparent",
                    error && "bg-rose border-rose"
                  )}
                />
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

          {/* iOS Style Dial Pad */}
          <div className="grid grid-cols-3 gap-x-6 gap-y-4 sm:gap-x-8 sm:gap-y-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <motion.button
                key={num}
                type="button"
                whileTap={{ scale: 0.85, backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                onClick={() => handleKeyPress(num)}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate/5 flex flex-col items-center justify-center transition-colors hover:bg-slate/10 relative shadow-sm border border-white/50"
              >
                <span className="text-2xl sm:text-3xl font-light text-slate leading-none mt-1">{num}</span>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate/40 uppercase mt-0.5 h-3">
                  {PAD_MAPPING[num]}
                </span>
              </motion.button>
            ))}
            
            {/* Empty space bottom left */}
            <div />

            {/* Zero Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.85, backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
              onClick={() => handleKeyPress('0')}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate/5 flex flex-col items-center justify-center transition-colors hover:bg-slate/10 shadow-sm border border-white/50"
            >
              <span className="text-2xl sm:text-3xl font-light text-slate leading-none">0</span>
            </motion.button>

            {/* Backspace Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={() => setPin(p => p.slice(0, -1))}
              className={cn(
                "w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-slate/60 transition-opacity",
                pin.length > 0 ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <span className="text-sm font-semibold tracking-wide hover:text-slate">Cancel</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Lock, Heart, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface LockScreenProps {
  onUnlock: () => void;
}

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
      setPin('');
      setTimeout(() => setError(false), 500);
    }
  };

  useEffect(() => {
    if (pin.length === SECRET_PIN.length) {
      handleSubmit();
    }
  }, [pin]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background bg-noise p-6 overflow-hidden">

      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-lavender/20 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-softblue/20 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-white flex flex-col items-center text-center mx-4"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-softblue to-lavender rounded-full flex items-center justify-center mb-6 shadow-lg relative">
          <Lock className="w-8 h-8 text-white absolute" />
          <Heart className="w-8 h-8 text-white absolute opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </div>

        <h1 className="font-serif text-3xl font-bold text-slate mb-2">NataTale</h1>
        <p className="text-gray-500 text-sm mb-8">Enter the secret date to unlock our memories.</p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <motion.div
            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex gap-2 sm:gap-4 mb-8 flex-wrap justify-center"
          >
            {Array.from({ length: SECRET_PIN.length }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-10 h-12 sm:w-12 sm:h-14 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold text-slate border-2 transition-colors",
                  pin.length > index ? "border-softblue bg-softblue/5" : "border-gray-200 bg-white",
                  error && "border-red-400 bg-red-50 text-red-500"
                )}
              >
                {pin[index] ? '•' : ''}
              </div>
            ))}
          </motion.div>

          <input
            type="number"
            value={pin}
            onChange={(e) => {
              if (e.target.value.length <= SECRET_PIN.length) {
                setPin(e.target.value);
                setError(false);
              }
            }}
            className="opacity-0 absolute -z-10 h-0 w-0"
            autoFocus
            inputMode="numeric"
            pattern="[0-9]*"
          />

          <div className="grid grid-cols-3 gap-4 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => pin.length < SECRET_PIN.length && setPin(p => p + num)}
                className="h-12 sm:h-14 rounded-full bg-white shadow-sm border border-gray-100 text-lg sm:text-xl font-bold text-slate hover:bg-gray-50 active:scale-95 transition-all"
              >
                {num}
              </button>
            ))}
            <div className="col-start-2">
              <button
                type="button"
                onClick={() => pin.length < SECRET_PIN.length && setPin(p => p + '0')}
                className="w-full h-12 sm:h-14 rounded-full bg-white shadow-sm border border-gray-100 text-lg sm:text-xl font-bold text-slate hover:bg-gray-50 active:scale-95 transition-all"
              >
                0
              </button>
            </div>
            <div className="col-start-3 flex justify-center items-center">
              <button
                type="button"
                onClick={() => setPin(p => p.slice(0, -1))}
                className="w-12 h-12 sm:w-14 sm:h-14 flex justify-center items-center rounded-full text-gray-400 hover:text-slate hover:bg-gray-100 active:scale-95 transition-all mx-auto"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

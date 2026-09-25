import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CarouselProps {
  images: string[];
}

export function Carousel({ images }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  if (!images || images.length === 0) return null;
  if (images.length === 1) {
    return (
      <div className="w-full max-h-[380px] sm:max-h-[440px] flex items-center justify-center overflow-hidden bg-[#181614]/5 rounded-xs mb-4">
        <img 
          src={images[0]} 
          alt="Memory" 
          className="w-full h-auto max-h-[380px] sm:max-h-[440px] object-contain block mx-auto" 
          loading="lazy" 
          decoding="async" 
        />
      </div>
    );
  }

  return (
    <div className="relative mb-4 group w-full max-h-[380px] sm:max-h-[440px] min-h-[220px] flex items-center justify-center overflow-hidden bg-[#181614]/5 rounded-xs cursor-pointer select-none" onClick={nextImage}>
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          alt={`Memory ${currentIndex}`}
          className="w-full h-auto max-h-[380px] sm:max-h-[440px] object-contain block mx-auto"
          loading="lazy"
          decoding="async"
        />
      </AnimatePresence>
      
      {/* Pagination indicators */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
        {images.map((_, idx) => (
          <div 
            key={idx} 
            className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/40'}`} 
          />
        ))}
      </div>

    </div>
  );
}

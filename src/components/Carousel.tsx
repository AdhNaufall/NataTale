import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
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
      <div className="w-full aspect-square overflow-hidden bg-gray-100 mb-4">
        <img src={images[0]} alt="Memory" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className="relative mb-4 group aspect-square overflow-hidden bg-gray-100 cursor-pointer" onClick={nextImage}>
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          alt={`Memory ${currentIndex}`}
          className="w-full h-full object-cover absolute inset-0"
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

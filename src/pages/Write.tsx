import React, { useState, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Write({ onSave, onUpdate, navigate, memories = [], editingMemory, setEditingMemory }: { onSave: (memory: any) => void, onUpdate?: (id: string, m: any) => void, navigate: (p: string) => void, memories?: any[], editingMemory?: any, setEditingMemory?: (m: any) => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [story, setStory] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState(5);
  const [mood, setMood] = useState('🥰');
  const [showCategories, setShowCategories] = useState(false);
  
  const MOOD_EMOJIS = ['🥰', '🤪', '🥹', '😴', '😡', '🥳', '😎'];

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract unique categories from existing memories for autocomplete suggestions
  const existingCategories = Array.from(new Set(memories.map(m => m.category))).filter(Boolean);
  const filteredCategories = existingCategories.filter(cat => 
    (cat as string).toLowerCase().includes(category.toLowerCase())
  );

  React.useEffect(() => {
    if (editingMemory) {
      setTitle(editingMemory.title || '');
      setDate(editingMemory.date || '');
      setLocation(editingMemory.location || '');
      setStory(editingMemory.story || '');
      setImages(editingMemory.images || []);
      setCategory(editingMemory.category || '');
      setMood(editingMemory.mood || '🥰');
      setRating(editingMemory.rating || 5);
    }
    
    // Clear edit mode when unmounting (e.g. clicking away to Timeline)
    return () => {
      if (setEditingMemory) setEditingMemory(null);
    };
  }, [editingMemory, setEditingMemory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const memData = {
      title,
      date,
      location,
      story,
      images,
      category,
      mood,
      rating
    };

    if (editingMemory && onUpdate) {
      onUpdate(editingMemory.id, memData);
    } else {
      onSave(memData);
    }
    
    navigate('/');
  };

  const processFiles = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height *= MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width *= MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 70% quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          
          setImages(prev => [...prev, compressedBase64]);
        };
        
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset input so the same file can be selected again if removed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="min-h-screen pt-12 pb-32 px-4 max-w-2xl mx-auto">
      <h2 className="font-serif text-4xl font-bold text-slate mb-8 text-center">
        {editingMemory ? 'Edit Chapter' : 'Write a Story'}
      </h2>

      <form onSubmit={handleSubmit} className="bg-white p-5 md:p-10 rounded-[2rem] shadow-sm border border-gray-100 space-y-5 md:space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Title</label>
          <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-softblue outline-none font-serif text-xl" placeholder="A day to remember..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Date</label>
            <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-softblue outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Location</label>
            <input required type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-softblue outline-none text-sm" placeholder="Where did we go?" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Photos</label>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center",
              isDragging ? "border-lavender bg-lavender/5" : "border-gray-200 bg-gray-50 hover:bg-gray-100"
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              multiple
              accept="image/*"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-softblue/10 flex items-center justify-center text-softblue mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="font-bold text-gray-700">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 mt-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm">
                  <img src={img} alt={`Upload preview ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                    className="absolute top-2 right-2 w-6 h-6 bg-white/90 text-slate rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="w-3 h-3 font-bold" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Category</label>
          <input
            required
            type="text"
            value={category}
            onChange={e => setCategory(e.target.value)}
            onFocus={() => setShowCategories(true)}
            onBlur={() => setTimeout(() => setShowCategories(false), 200)}
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-softblue outline-none text-sm"
            placeholder="e.g. Cafe Hopping"
          />
          <AnimatePresence>
            {showCategories && filteredCategories.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 w-full mt-2 py-2 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 max-h-48 overflow-y-auto"
              >
                {filteredCategories.map((cat, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setCategory(cat as string);
                      setShowCategories(false);
                    }}
                    className="px-4 py-2.5 text-sm text-gray-700 hover:bg-softblue/10 hover:text-softblue cursor-pointer transition-colors"
                  >
                    {cat as string}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Mood Today</label>
          <div className="flex gap-3 flex-wrap items-center">
            {MOOD_EMOJIS.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => setMood(emoji)}
                className={cn(
                  "w-12 h-12 text-3xl flex items-center justify-center rounded-xl transition-all duration-300",
                  mood === emoji ? "bg-softblue/10 scale-110 shadow-sm" : "hover:bg-gray-50 grayscale hover:grayscale-0 opacity-50 hover:opacity-100"
                )}
              >
                {emoji}
              </button>
            ))}
            <div className="w-[2px] h-8 bg-gray-200 mx-1 rounded-full"></div>
            <input
              type="text"
              value={!MOOD_EMOJIS.includes(mood) ? mood : ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val) setMood(val);
                else setMood('🥰'); // default back if cleared
              }}
              placeholder="+"
              title="Ketik emoji kustom dari keyboard"
              className={cn(
                "w-12 h-12 text-3xl text-center rounded-xl transition-all duration-300 outline-none placeholder:text-gray-300 placeholder:text-2xl border-2",
                !MOOD_EMOJIS.includes(mood) && mood 
                  ? "bg-softblue/10 border-softblue scale-110 shadow-sm" 
                  : "border-dashed border-gray-300 bg-transparent hover:bg-gray-50 focus:border-softblue focus:bg-softblue/5"
              )}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-2">Pilih dari atas atau ketik emoji sendiri di kotak paling kanan.</p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">The Story (Markdown)</label>
          <textarea required value={story} onChange={e => setStory(e.target.value)} rows={6} className="w-full px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-softblue outline-none text-sm resize-none leading-relaxed" placeholder="Write the memories... you can use **bold** or lists!"></textarea>
        </div>

        <button type="submit" className="w-full py-4 bg-slate text-white rounded-xl font-bold tracking-widest uppercase hover:bg-[#2D2D2D] transition-colors mt-8">
          {editingMemory ? 'Update Chapter' : 'Save Chapter'}
        </button>
      </form>
    </div>
  );
}

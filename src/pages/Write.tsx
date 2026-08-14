import React, { useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Write({ onSave, onUpdate, navigate, memories = [], editingMemory, setEditingMemory }: { onSave: (memory: any) => void, onUpdate?: (id: string, m: any) => void, navigate: (p: string) => void, memories?: any[], editingMemory?: any, setEditingMemory?: (m: any) => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [story, setStory] = useState('');
  const [images, setImages] = useState<{ url: string; isUploading: boolean; id: string }[]>([]);
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState(5);
  const [mood, setMood] = useState('🥰');
  const [showCategories, setShowCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const MOOD_EMOJIS = ['🥰', '🤪', '🥹', '😴', '😡', '🥳', '😎'];

  const [isDragging, setIsDragging] = useState(false);

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
      setImages((editingMemory.images || []).map((url: string, index: number) => ({ url, isUploading: false, id: `${index}-${Date.now()}` })));
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
    setIsSubmitting(true);

    const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const hasBase64 = images.some(img => img.url.startsWith('data:'));

    if (cloudName && uploadPreset && hasBase64) {
      alert('Beberapa gambar gagal diunggah ke Cloudinary atau masih dalam proses. Pastikan semua gambar berhasil diunggah demi performa loading website.');
      setIsSubmitting(false);
      return;
    }
    
    setTimeout(() => {
      const memData = {
        title,
        date,
        location,
        story,
        images: images.map(img => img.url),
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
    }, 1200);
  };

  const processFiles = async (files: FileList | null) => {
    if (!files) return;

    for (const file of Array.from(files)) {
      const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif';
      const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name) || isHeic;
      if (!isImage) continue;

      try {
        let fileToProcess = file;

        if (isHeic) {
          // Dynamically import heic2any to avoid loading issues in Vite
          const heic2anyModule = await import('heic2any');
          const heic2any = heic2anyModule.default;
          
          const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.7
          });
          const singleBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          fileToProcess = new File([singleBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
            type: 'image/jpeg'
          });
        }

        await new Promise<void>((resolve, reject) => {
          const objectUrl = URL.createObjectURL(fileToProcess);
          const img = new Image();

          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 800;
              const MAX_HEIGHT = 800;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height = Math.round(height * (MAX_WIDTH / width));
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width = Math.round(width * (MAX_HEIGHT / height));
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);

              // Compress to JPEG with 70% quality
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
              
              const tempId = Math.random().toString(36).substring(2, 9);
              setImages(prev => [...prev, { url: compressedBase64, isUploading: true, id: tempId }]);
              URL.revokeObjectURL(objectUrl);
              resolve();

              // Background Cloudinary Upload
              const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
              const uploadPreset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;

              if (cloudName && uploadPreset) {
                const formData = new FormData();
                formData.append('file', compressedBase64);
                formData.append('upload_preset', uploadPreset);

                fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                  method: 'POST',
                  body: formData
                })
                  .then(res => {
                    if (!res.ok) throw new Error('Cloudinary response error');
                    return res.json();
                  })
                  .then(data => {
                    if (data.secure_url) {
                      setImages(prev => prev.map(img => img.id === tempId ? { ...img, url: data.secure_url, isUploading: false } : img));
                    } else {
                      throw new Error('No secure url in response');
                    }
                  })
                  .catch(err => {
                    console.error('Cloudinary upload failed, using Base64 fallback:', err);
                    setImages(prev => prev.map(img => img.id === tempId ? { ...img, isUploading: false } : img));
                  });
              } else {
                // If environment variables are missing, fallback to Base64 immediately
                setImages(prev => prev.map(img => img.id === tempId ? { ...img, isUploading: false } : img));
              }
            } catch (err) {
              URL.revokeObjectURL(objectUrl);
              reject(err);
            }
          };

          img.onerror = (err) => {
            URL.revokeObjectURL(objectUrl);
            reject(err);
          };

          img.src = objectUrl;
        });
      } catch (error: any) {
        console.error('Failed to process image:', file.name, error);
        alert(`Gagal memproses gambar "${file.name}". Error: ${error?.message || error || 'Format/berkas tidak didukung'}`);
      }
    }
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
    e.target.value = '';
  };

  const removeImage = (idToRemove: string) => {
    setImages(images.filter((img) => img.id !== idToRemove));
  };

  return (
    <div className="min-h-screen pt-12 pb-32 px-4 max-w-2xl mx-auto">
      
      <AnimatePresence>
        {isSubmitting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0], opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-8xl drop-shadow-2xl"
            >
               💌
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 font-serif text-slate font-bold text-xl tracking-widest uppercase"
            >
              Saving Memory...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <h2 className="font-serif text-4xl font-bold text-slate mb-8 text-center">
        {editingMemory ? 'Edit Chapter' : 'Write a Story'}
      </h2>

      <form onSubmit={handleSubmit} className="bg-white p-5 md:p-10 rounded-[2rem] shadow-sm border border-gray-100 space-y-5 md:space-y-6">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/50 mb-1">Title</label>
          <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-0 py-2 bg-transparent border-b-2 border-gray-100 focus:border-lavender outline-none font-serif text-2xl transition-colors placeholder:text-gray-300" placeholder="A day to remember..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/50 mb-1">Date</label>
            <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-0 py-2 bg-transparent border-b-2 border-gray-100 focus:border-lavender outline-none text-sm transition-colors text-gray-700" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/50 mb-1">Location Name</label>
            <input required type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-0 py-2 bg-transparent border-b-2 border-gray-100 focus:border-lavender outline-none text-sm transition-colors placeholder:text-gray-300" placeholder="Where did we go?" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/50 mb-2 mt-4">Photos</label>

          {/* Drag & Drop Zone */}
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 text-center block",
              isDragging ? "border-lavender bg-lavender/5 scale-[1.02]" : "border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300"
            )}
          >
            <input
              type="file"
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
          </label>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 mt-4">
              {images.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm">
                  <img src={img.url} alt="Upload preview" className={cn("w-full h-full object-cover", img.isUploading && "opacity-40 blur-[1px]")} />
                  {img.isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <div className="w-6 h-6 border-2 border-slate border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                    className="absolute top-2 right-2 w-6 h-6 bg-white/90 text-slate rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                  >
                    <X className="w-3 h-3 font-bold" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/50 mb-1 mt-2">Category</label>
          <input
            required
            type="text"
            value={category}
            onChange={e => setCategory(e.target.value)}
            onFocus={() => setShowCategories(true)}
            onBlur={() => setTimeout(() => setShowCategories(false), 200)}
            className="w-full px-0 py-2 bg-transparent border-b-2 border-gray-100 focus:border-lavender outline-none text-sm transition-colors placeholder:text-gray-300"
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
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/50 mb-2 mt-4">Mood Today</label>
          <div className="flex gap-3 flex-wrap items-center">
            {MOOD_EMOJIS.map(emoji => (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                key={emoji}
                type="button"
                onClick={() => setMood(emoji)}
                className={cn(
                  "w-12 h-12 text-3xl flex items-center justify-center rounded-xl transition-all duration-300",
                  mood === emoji ? "bg-lavender/15 shadow-sm ring-1 ring-lavender/30" : "hover:bg-gray-50 grayscale hover:grayscale-0 opacity-50 hover:opacity-100"
                )}
              >
                {emoji}
              </motion.button>
            ))}
            <div className="w-[2px] h-8 bg-gray-100 mx-1 rounded-full"></div>
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
                  ? "bg-lavender/15 border-lavender/30 scale-110 shadow-sm ring-1 ring-lavender/30" 
                  : "border-dashed border-gray-200 bg-transparent hover:bg-gray-50 focus:border-lavender focus:bg-lavender/5"
              )}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-2">Pilih dari atas atau ketik emoji sendiri di kotak paling kanan.</p>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/50 mb-2 mt-4">The Story</label>
          <textarea required value={story} onChange={e => setStory(e.target.value)} rows={6} className="w-full px-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-lavender/50 outline-none text-sm resize-none leading-relaxed transition-all focus:bg-white" placeholder="Write the memories... you can use **bold** or lists!"></textarea>
        </div>

        <motion.button 
          whileHover={!(images.some(img => img.isUploading) || isSubmitting) ? { scale: 1.02 } : undefined}
          whileTap={!(images.some(img => img.isUploading) || isSubmitting) ? { scale: 0.98 } : undefined}
          type="submit" 
          disabled={images.some(img => img.isUploading) || isSubmitting}
          className={cn(
            "w-full py-4 bg-slate text-white rounded-2xl font-bold tracking-widest uppercase hover:bg-[#1A202C] transition-colors mt-8 shadow-lg shadow-slate/20",
            (images.some(img => img.isUploading) || isSubmitting) && "opacity-50 cursor-not-allowed"
          )}
        >
          {images.some(img => img.isUploading) ? 'Uploading Images...' : (editingMemory ? 'Update Chapter' : 'Save Chapter')}
        </motion.button>
      </form>
    </div>
  );
}

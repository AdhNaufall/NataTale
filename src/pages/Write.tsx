import React, { useState } from 'react';
import { Camera, X, Star, Music2, ExternalLink, Calendar as CalendarIcon, MapPin, Tag, Sparkles, Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Curated scrapbook mood stamps with pastel tones and friendly labels
const SCRAPBOOK_MOODS = [
  { emoji: '🥰', label: 'Loved', bg: 'bg-rose/25', border: 'border-rose/40', text: 'text-rose-700' },
  { emoji: '✨', label: 'Happy', bg: 'bg-amber-100/70', border: 'border-amber-200', text: 'text-amber-700' },
  { emoji: '🥹', label: 'Soft', bg: 'bg-lavender/25', border: 'border-lavender/40', text: 'text-purple-700' },
  { emoji: '🌙', label: 'Sleepy', bg: 'bg-indigo-50', border: 'border-indigo-200/60', text: 'text-indigo-700' },
  { emoji: '☁️', label: 'Melancholy', bg: 'bg-blue-50', border: 'border-blue-200/60', text: 'text-blue-700' },
  { emoji: '🥳', label: 'Excited', bg: 'bg-orange-50', border: 'border-orange-200/60', text: 'text-orange-700' },
  { emoji: '😎', label: 'Chill', bg: 'bg-emerald-50', border: 'border-emerald-200/60', text: 'text-emerald-700' },
];

export default function Write({ onSave, onUpdate, navigate, memories = [], editingMemory, setEditingMemory }: { onSave: (memory: any) => void, onUpdate?: (id: string, m: any) => void, navigate: (p: string) => void, memories?: any[], editingMemory?: any, setEditingMemory?: (m: any) => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [story, setStory] = useState('');
  const [images, setImages] = useState<{ url: string; isUploading: boolean; id: string; blob?: Blob }[]>([]);
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [mood, setMood] = useState('🥰');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [spotifyTitle, setSpotifyTitle] = useState('');
  const [spotifyArtist, setSpotifyArtist] = useState('');
  const [isFetchingSpotify, setIsFetchingSpotify] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomMoodOpen, setIsCustomMoodOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Helper for Spotify URL validation
  const isSpotifyUrlValid = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return true; // Empty is allowed
    return /^https?:\/\/(open\.)?spotify\.com\/track\/[a-zA-Z0-9]+(\?.*)?$/i.test(trimmed);
  };

  const hasInvalidSpotifyUrl = Boolean(spotifyUrl.trim() && !isSpotifyUrlValid(spotifyUrl));

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
      setSpotifyUrl(editingMemory.spotifyUrl || '');
      setSpotifyTitle(editingMemory.spotifyTitle || '');
      setSpotifyArtist(editingMemory.spotifyArtist || '');

      const isDefaultMood = SCRAPBOOK_MOODS.some(m => m.emoji === editingMemory.mood);
      if (editingMemory.mood && !isDefaultMood) {
        setIsCustomMoodOpen(true);
      }
    }
    
    // Clear edit mode when unmounting (e.g. clicking away to Timeline)
    return () => {
      if (setEditingMemory) setEditingMemory(null);
    };
  }, [editingMemory, setEditingMemory]);

  // Auto-detect Spotify metadata when URL changes
  React.useEffect(() => {
    const trimmed = spotifyUrl.trim();
    if (!trimmed) {
      setSpotifyTitle('');
      setSpotifyArtist('');
      setIsFetchingSpotify(false);
      return;
    }

    if (!isSpotifyUrlValid(trimmed)) {
      setSpotifyTitle('');
      setSpotifyArtist('');
      setIsFetchingSpotify(false);
      return;
    }

    // If editing and URL is unchanged from stored memory, don't re-fetch if we already have title
    if (editingMemory && editingMemory.spotifyUrl === trimmed && (spotifyTitle || editingMemory.spotifyTitle)) {
      return;
    }

    let isCancelled = false;
    setIsFetchingSpotify(true);

    const timer = setTimeout(async () => {
      try {
        const API_BASE_URL = (import.meta as any).env.VITE_API_URL || '';
        let titleFound = '';
        let artistFound = '';

        // 1. Try backend endpoint first
        try {
          const res = await fetch(`${API_BASE_URL}/api/spotify-metadata?url=${encodeURIComponent(trimmed)}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.title) {
              titleFound = data.title;
              artistFound = data.artist || '';
            }
          }
        } catch (backendErr) {
          // Backend offline or error - try direct client fallback
        }

        // 2. Direct Spotify oEmbed fallback if backend didn't return title
        if (!titleFound) {
          try {
            const oembedRes = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(trimmed)}`);
            if (oembedRes.ok) {
              const odata = await oembedRes.json();
              if (odata?.title) {
                titleFound = odata.title;
              }
            }
          } catch (oembedErr) {
            // Silently fallback - spotifyUrl will still be saved
          }
        }

        if (!isCancelled) {
          setSpotifyTitle(titleFound);
          setSpotifyArtist(artistFound);
          setIsFetchingSpotify(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setIsFetchingSpotify(false);
        }
      }
    }, 500);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [spotifyUrl, editingMemory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Save locally first! Pass Blobs & preview URLs seamlessly
    setTimeout(() => {
      const memData = {
        title,
        date,
        location,
        story,
        images: images.map(img => img.url),
        imageBlobs: images.map(img => img.blob).filter(Boolean),
        category,
        mood,
        rating,
        spotifyUrl: spotifyUrl.trim(),
        spotifyTitle: spotifyTitle.trim(),
        spotifyArtist: spotifyArtist.trim()
      };

      if (editingMemory && onUpdate) {
        onUpdate(editingMemory.id, memData);
      } else {
        onSave(memData);
      }
      
      navigate('/');
    }, 600);
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

              canvas.toBlob((blob) => {
                if (!blob) {
                  resolve();
                  return;
                }

                // Create persistent local Object URL for instant preview
                const previewUrl = URL.createObjectURL(blob);
                const tempId = Math.random().toString(36).substring(2, 9);

                // Add to state immediately with Blob for IndexedDB storage
                const isOnline = typeof navigator !== 'undefined' && navigator.onLine;
                setImages(prev => [...prev, { url: previewUrl, isUploading: isOnline, id: tempId, blob }]);
                URL.revokeObjectURL(objectUrl);
                resolve();

                // If online, optionally attempt background upload to Cloudinary directly
                const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
                const uploadPreset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;

                if (isOnline && cloudName && uploadPreset) {
                  const formData = new FormData();
                  formData.append('file', blob);
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
                        setImages(prev => prev.map(imgItem => imgItem.id === tempId ? { ...imgItem, url: data.secure_url, isUploading: false } : imgItem));
                      } else {
                        throw new Error('No secure url in response');
                      }
                    })
                    .catch(err => {
                      console.log('Background Cloudinary upload skipped/failed; will sync via queue:', err);
                      setImages(prev => prev.map(imgItem => imgItem.id === tempId ? { ...imgItem, isUploading: false } : imgItem));
                    });
                } else {
                  setImages(prev => prev.map(imgItem => imgItem.id === tempId ? { ...imgItem, isUploading: false } : imgItem));
                }
              }, 'image/jpeg', 0.75);
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

  // Subtle rotations for polaroid preview stack
  const polaroidRotations = [-2.5, 2, -1.5, 2.5, -2, 1.5];

  return (
    <div className="min-h-screen pt-6 sm:pt-10 md:pt-12 pb-44 sm:pb-40 px-3.5 sm:px-6 max-w-2xl mx-auto font-sans text-slate pb-safe-nav">
      
      {/* Saving Submission Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -15, opacity: 0 }}
              animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0], opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-7xl drop-shadow-xl"
            >
               💌
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-5 font-serif text-slate font-bold text-lg tracking-widest uppercase"
            >
              Saving our memory...
            </motion.p>
            <p className="text-xs text-slate/50 font-handwriting text-lg mt-1">Written with love in NataTale ♡</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editorial Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-5 sm:mb-8"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lavender/10 border border-lavender/20 text-slate/70 text-[11px] font-medium mb-2.5">
          <Sparkles className="w-3 h-3 text-lavender" />
          <span>Scrapbook Entry</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-slate tracking-tight">
          {editingMemory ? 'Edit Chapter' : 'Write a Story'}
        </h1>
        <p className="font-handwriting text-base sm:text-xl text-slate/60 mt-1 flex items-center justify-center gap-1.5">
          <span>A little moment worth remembering</span>
          <Heart className="w-3.5 h-3.5 fill-rose text-rose inline-block" />
        </p>
      </motion.div>

      {/* Main Continuous Scrapbook Card */}
      <motion.form 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onSubmit={handleSubmit} 
        className="bg-white/95 backdrop-blur-xs p-4 sm:p-8 md:p-10 rounded-3xl sm:rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(44,53,69,0.06)] border border-slate/5 space-y-5 sm:space-y-7 relative overflow-hidden"
      >
        {/* Subtle decorative washi tape accent at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-2.5 sm:h-3 bg-lavender/20 border-b border-lavender/30 rounded-b-sm transform -rotate-1 opacity-75 pointer-events-none" />

        {/* SECTION 1: OUR CHAPTER TITLE */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/40 flex items-center gap-1">
              <span>Chapter Title</span>
            </label>
            <span className="text-[10px] font-handwriting text-slate/40 text-sm sm:text-base">give it a name ♡</span>
          </div>
          <input 
            required 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full px-0 py-1.5 sm:py-2 bg-transparent border-b-2 border-slate/10 focus:border-lavender outline-none font-serif text-xl sm:text-3xl text-slate font-medium transition-colors placeholder:text-slate/25 placeholder:font-serif placeholder:italic" 
            placeholder="A day to remember..." 
          />
        </div>

        {/* SECTION 2: METADATA DETAILS (Date, Location, Category) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5 pt-0.5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/40 mb-1 flex items-center gap-1.5">
              <CalendarIcon className="w-3 h-3 text-lavender" />
              <span>Date</span>
            </label>
            <input 
              required 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="w-full h-10 sm:h-11 px-3 py-2 bg-[#FAF8FE]/80 border border-slate/10 rounded-xl focus:border-lavender focus:bg-white focus:ring-2 focus:ring-lavender/20 outline-none text-xs sm:text-sm font-medium text-slate transition-all" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/40 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-rose-400" />
              <span>Location</span>
            </label>
            <input 
              required 
              type="text" 
              value={location} 
              onChange={e => setLocation(e.target.value)} 
              className="w-full h-10 sm:h-11 px-3 py-2 bg-[#FAF8FE]/80 border border-slate/10 rounded-xl focus:border-lavender focus:bg-white focus:ring-2 focus:ring-lavender/20 outline-none text-xs sm:text-sm text-slate transition-all placeholder:text-slate/30" 
              placeholder="Where did we go?" 
            />
          </div>

          <div className="sm:col-span-2 relative">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/40 mb-1 flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-softblue" />
              <span>Category</span>
            </label>
            <input
              required
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              onFocus={() => setShowCategories(true)}
              onBlur={() => setTimeout(() => setShowCategories(false), 200)}
              className="w-full h-10 sm:h-11 px-3 py-2 bg-[#FAF8FE]/80 border border-slate/10 rounded-xl focus:border-lavender focus:bg-white focus:ring-2 focus:ring-lavender/20 outline-none text-xs sm:text-sm text-slate transition-all placeholder:text-slate/30"
              placeholder="e.g. Cafe Hopping, Road Trip, Anniversary"
            />
            <AnimatePresence>
              {showCategories && filteredCategories.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute z-50 w-full mt-1.5 py-1.5 bg-white rounded-2xl shadow-[0_12px_30px_-8px_rgba(44,53,69,0.12)] border border-slate/10 max-h-48 overflow-y-auto"
                >
                  {filteredCategories.map((cat, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setCategory(cat as string);
                        setShowCategories(false);
                      }}
                      className="px-4 py-2 text-xs sm:text-sm text-slate hover:bg-lavender/10 hover:text-purple-700 cursor-pointer transition-colors flex items-center gap-2"
                    >
                      <span className="text-slate/30">#</span>
                      <span>{cat as string}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Subtle Scrapbook Divider */}
        <div className="flex items-center justify-center gap-2 py-0.5 text-slate/20">
          <div className="h-px bg-slate/10 flex-1" />
          <span className="text-xs">♡</span>
          <div className="h-px bg-slate/10 flex-1" />
        </div>

        {/* SECTION 3: POLAROID PHOTO UPLOADER */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/40 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-lavender" />
              <span>Memories in Frames</span>
            </label>
            {images.length > 0 && (
              <span className="text-[11px] font-handwriting text-slate/60 text-sm sm:text-base">
                {images.length} {images.length === 1 ? 'photo' : 'photos'} saved ♡
              </span>
            )}
          </div>

          {/* Scrapbook Drag & Drop Zone */}
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "w-full border-2 border-dashed rounded-2xl p-4 sm:p-7 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-center block relative group",
              isDragging 
                ? "border-lavender bg-lavender/10 scale-[1.01]" 
                : "border-slate/15 bg-[#FAF8FE]/60 hover:bg-[#FAF8FE] hover:border-lavender/60"
            )}
          >
            <input
              type="file"
              onChange={handleFileInput}
              multiple
              accept="image/*"
              className="hidden"
            />
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-xs border border-lavender/30 flex items-center justify-center text-lavender mb-2 group-hover:scale-105 transition-transform">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-lavender" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate">
              Add the photos we'll want to look back on ♡
            </p>
            <p className="text-[11px] text-slate/40 font-handwriting text-sm sm:text-base mt-0.5">
              Tap to browse or drop photos here
            </p>
            <p className="text-[9px] text-slate/35 uppercase tracking-wider mt-1">
              JPG, PNG, WEBP or HEIC (Optimized automatically)
            </p>
          </label>

          {/* Polaroid-Inspired Photo Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-3 pt-0.5">
              {images.map((img, index) => {
                const rot = polaroidRotations[index % polaroidRotations.length];
                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    key={img.id} 
                    style={{ transform: `rotate(${rot}deg)` }}
                    className="relative bg-white p-2 pb-4 sm:pb-5 rounded-xl shadow-[0_4px_16px_rgba(44,53,69,0.06)] border border-slate/10 group hover:rotate-0 hover:scale-[1.03] transition-all duration-200"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-slate/5">
                      <img 
                        src={img.url} 
                        alt="Memory preview" 
                        className={cn("w-full h-full object-cover", img.isUploading && "opacity-40 blur-[1px]")} 
                      />
                      {img.isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                          <div className="w-5 h-5 border-2 border-lavender border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    
                    {/* Cute Polaroid Bottom Note */}
                    <div className="mt-1 px-1 flex items-center justify-between text-[10px] text-slate/40 font-handwriting text-xs sm:text-sm truncate">
                      <span>moment #{index + 1}</span>
                      <span>♡</span>
                    </div>

                    {/* Delete Photo Button */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white text-slate/70 hover:text-rose-600 rounded-full flex items-center justify-center shadow-md border border-slate/10 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                      title="Remove photo"
                    >
                      <X className="w-3 h-3 font-bold" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Subtle Scrapbook Divider */}
        <div className="flex items-center justify-center gap-2 py-0.5 text-slate/20">
          <div className="h-px bg-slate/10 flex-1" />
          <span className="text-xs">✦</span>
          <div className="h-px bg-slate/10 flex-1" />
        </div>

        {/* SECTION 4: MOOD TODAY (Scrapbook Mood Stamps) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/40 flex items-center gap-1.5">
              <span>Mood Today</span>
            </label>
            <span className="text-[10px] font-handwriting text-slate/50 text-sm sm:text-base">
              how did it feel? ♡
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2.5">
            {SCRAPBOOK_MOODS.map(m => {
              const isSelected = mood === m.emoji;
              return (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={m.emoji}
                  type="button"
                  onClick={() => {
                    setMood(m.emoji);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 sm:py-2.5 px-1 rounded-2xl border transition-all duration-200 cursor-pointer relative",
                    isSelected 
                      ? `${m.bg} ${m.border} shadow-xs scale-[1.02] sm:scale-[1.03] ring-1 ring-lavender/30` 
                      : "bg-[#FAF8FE]/60 border-slate/10 hover:bg-[#FAF8FE] hover:border-slate/20 opacity-75 hover:opacity-100"
                  )}
                >
                  <span className="text-xl sm:text-2xl mb-0.5 sm:mb-1 leading-none">{m.emoji}</span>
                  <span className={cn(
                    "text-[9px] sm:text-[10px] font-semibold tracking-tight",
                    isSelected ? m.text : "text-slate/60"
                  )}>
                    {m.label}
                  </span>
                  {isSelected && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-lavender" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Custom Mood Trigger & Input */}
          <div className="mt-2.5 pt-0.5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsCustomMoodOpen(!isCustomMoodOpen)}
              className="text-[11px] text-slate/50 hover:text-slate font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{isCustomMoodOpen ? '− Hide custom mood' : '＋ Type a custom emoji / mood'}</span>
            </button>
            {!SCRAPBOOK_MOODS.some(m => m.emoji === mood) && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-lavender/15 text-purple-700 font-medium border border-lavender/30 flex items-center gap-1">
                <span>Active mood:</span>
                <span className="text-sm">{mood}</span>
              </span>
            )}
          </div>

          <AnimatePresence>
            {isCustomMoodOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-2"
              >
                <div className="p-2.5 sm:p-3 bg-[#FAF8FE] border border-slate/10 rounded-xl flex items-center gap-3">
                  <input
                    type="text"
                    value={!SCRAPBOOK_MOODS.some(m => m.emoji === mood) ? mood : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) setMood(val);
                      else setMood('🥰');
                    }}
                    placeholder="Type emoji here (e.g. 🌻, ☕, 🏕️)"
                    className="flex-1 bg-white h-9 sm:h-10 px-3 py-1.5 border border-slate/10 rounded-lg text-xs sm:text-sm outline-none focus:border-lavender text-slate"
                  />
                  <span className="text-[11px] text-slate/40 font-handwriting text-sm shrink-0">Any emoji you like!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 5: HOW SPECIAL WAS THIS MEMORY (Rating) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/40 flex items-center gap-1">
              <span>How Special Was This?</span>
            </label>
            <span className="text-xs font-serif font-bold text-amber-600 bg-amber-50/90 px-2.5 py-0.5 rounded-full border border-amber-200/60">
              {hoverRating !== null ? hoverRating : rating} / 5 Stars
            </span>
          </div>

          <div className="flex items-center justify-between p-3 sm:p-4 bg-[#FAF8FE]/80 border border-slate/10 rounded-2xl">
            <div className="flex items-center gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const currentScore = hoverRating !== null ? hoverRating : rating;
                const isFilled = currentScore >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onFocus={() => setHoverRating(star)}
                    onBlur={() => setHoverRating(null)}
                    aria-label={`Rate ${star} of 5 stars`}
                    className="p-1 rounded-xl text-amber-400 hover:scale-110 active:scale-95 transition-transform duration-150 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={cn(
                        "w-5 h-5 sm:w-7 sm:h-7 transition-colors duration-150",
                        isFilled
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_2px_6px_rgba(251,191,36,0.35)]"
                          : "fill-transparent text-slate/20 hover:text-amber-200"
                      )}
                    />
                  </button>
                );
              })}
            </div>

            <span className="text-xs text-slate/50 font-handwriting text-sm sm:text-base hidden sm:inline pr-1">
              {(hoverRating !== null ? hoverRating : rating) === 5
                ? 'A truly magical moment ♡'
                : (hoverRating !== null ? hoverRating : rating) === 4
                ? 'A wonderful memory ✨'
                : (hoverRating !== null ? hoverRating : rating) === 3
                ? 'A sweet little time ✦'
                : (hoverRating !== null ? hoverRating : rating) === 2
                ? 'A nice cozy day 🌿'
                : 'A day we remember ☕'}
            </span>
          </div>
        </div>

        {/* SECTION 6: OUR SONG (Memory Soundtrack) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/40 flex items-center gap-1.5">
              <Music2 className="w-3.5 h-3.5 text-lavender" />
              <span>Our Song</span>
            </label>
            <span className="text-[10px] text-slate/40 font-handwriting text-xs sm:text-sm">
              optional soundtrack
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate/50 font-serif italic mb-2">
            “A song that reminds us of this memory...”
          </p>

          <div className="space-y-2">
            <div className="relative">
              <input
                type="url"
                value={spotifyUrl}
                onChange={e => setSpotifyUrl(e.target.value)}
                placeholder="Paste a Spotify song link (e.g. https://open.spotify.com/track/...)"
                className={cn(
                  "w-full h-10 sm:h-11 px-3 py-2 bg-[#FAF8FE]/80 border rounded-xl focus:border-lavender focus:bg-white focus:ring-2 focus:ring-lavender/20 outline-none text-xs sm:text-sm transition-all text-slate placeholder:text-slate/30 font-sans",
                  hasInvalidSpotifyUrl ? "border-rose-300 focus:ring-rose-200" : "border-slate/10"
                )}
              />
              {spotifyUrl && (
                <button
                  type="button"
                  onClick={() => setSpotifyUrl('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate/10 hover:bg-slate/20 text-slate/60 flex items-center justify-center text-xs transition-colors cursor-pointer"
                  title="Clear Spotify link"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {hasInvalidSpotifyUrl && (
              <motion.p 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[11px] text-rose-500 font-medium pl-1 flex items-center gap-1"
              >
                <span>Please enter a valid Spotify track link ♡</span>
              </motion.p>
            )}

            {/* Aesthetic Mini Music Soundtrack Card */}
            {spotifyUrl.trim() && !hasInvalidSpotifyUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-2.5 sm:p-3 bg-gradient-to-r from-lavender/15 via-rose-50/40 to-softblue/15 border border-lavender/30 rounded-xl flex items-center justify-between gap-2.5 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white shadow-xs border border-lavender/30 flex items-center justify-center text-lavender shrink-0">
                    {isFetchingSpotify ? (
                      <div className="w-3.5 h-3.5 border-2 border-lavender border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Music2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-lavender" />
                    )}
                  </div>
                  <div className="min-w-0">
                    {isFetchingSpotify ? (
                      <div>
                        <p className="font-serif font-bold text-slate text-xs">Listening for song details...</p>
                        <p className="text-[10px] text-slate/50 font-handwriting text-xs sm:text-sm">finding track metadata ♡</p>
                      </div>
                    ) : spotifyTitle ? (
                      <div>
                        <p className="font-serif font-bold text-slate text-xs truncate">“{spotifyTitle}”</p>
                        <p className="text-[10px] text-slate/60 font-sans truncate">{spotifyArtist || 'Spotify Track'}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-serif font-bold text-slate text-xs truncate">Soundtrack Attached</p>
                        <p className="text-[10px] text-slate/40 truncate font-mono">{spotifyUrl}</p>
                      </div>
                    )}
                  </div>
                </div>

                <a
                  href={spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-white/90 hover:bg-white text-slate text-[10px] font-bold rounded-lg border border-slate/10 shadow-xs flex items-center gap-1 shrink-0 transition-transform hover:scale-105 active:scale-95"
                >
                  <span>Open</span>
                  <ExternalLink className="w-2.5 h-2.5 text-lavender" />
                </a>
              </motion.div>
            )}
          </div>
        </div>

        {/* SECTION 7: THE STORY JOURNAL */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/40 flex items-center gap-1">
              <span>The Story</span>
            </label>
            <span className="text-[10px] text-slate/40 font-handwriting text-xs sm:text-base">markdown supported **bold**</span>
          </div>
          <textarea 
            required 
            value={story} 
            onChange={e => setStory(e.target.value)} 
            rows={5} 
            className="w-full p-3.5 sm:p-4 bg-[#FAF8FE]/80 border border-slate/10 rounded-2xl focus:border-lavender focus:bg-white focus:ring-2 focus:ring-lavender/20 outline-none text-xs sm:text-sm text-slate resize-none leading-relaxed transition-all placeholder:text-slate/30 font-sans" 
            placeholder="Tell us what happened... the laughs, the little details, what made this day special ♡"
          />
        </div>

        {/* SECTION 8: SAVE BUTTON */}
        <div className="pt-2 sm:pt-3">
          <motion.button 
            whileHover={!isSubmitting ? { scale: 1.01 } : undefined}
            whileTap={!isSubmitting ? { scale: 0.98 } : undefined}
            type="submit" 
            disabled={isSubmitting}
            className={cn(
              "w-full py-3.5 sm:py-4 bg-slate text-white rounded-2xl font-bold tracking-widest uppercase hover:bg-[#1A202C] transition-all shadow-md shadow-slate/15 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer",
              isSubmitting && "opacity-60 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <span>Saving to Scrapbook...</span>
            ) : (
              <>
                <span>{editingMemory ? 'Update Chapter' : 'Save This Memory'}</span>
                <Heart className="w-3.5 h-3.5 fill-white/80 text-white/80 inline-block" />
              </>
            )}
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
}

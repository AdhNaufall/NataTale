import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  Sparkles, 
  Plus, 
  X, 
  Dices
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export interface LetterItem {
  id: string;
  localId?: string;
  sender: string;
  recipient: string;
  title: string;
  content: string;
  category: string;
  signature?: string;
  isOpened: boolean;
  openedAt?: string | null;
  createdAt: string;
  syncStatus?: 'pending' | 'syncing' | 'synced' | 'failed';
}

interface LettersProps {
  letters: LetterItem[];
  onSaveLetter: (letter: Omit<LetterItem, 'id' | 'createdAt' | 'isOpened'>) => Promise<void> | void;
  onOpenLetter: (id: string) => Promise<void> | void;
  navigate?: (path: string) => void;
}

// Romantic categories for love letters
export const LETTER_CATEGORIES = [
  { id: 'just_because', label: 'Just Because', emoji: '💗', moodQuery: '♡ I miss you', desc: 'Little thoughts on ordinary days' },
  { id: 'miss_you', label: 'When You Miss Me', emoji: '🫂', moodQuery: '♡ I miss you', desc: 'A warm hug when we are apart' },
  { id: 'comfort', label: "When You're Sad", emoji: '🌧️', moodQuery: '☁ I need comfort', desc: 'Soft words to dry your tears' },
  { id: 'happy', label: "When You're Happy", emoji: '☀️', moodQuery: '☀ I want something happy', desc: 'To celebrate our joyous smiles' },
  { id: 'after_fight', label: 'After We Fight', emoji: '🌿', moodQuery: '☁ I need comfort', desc: 'A gentle reminder of our love' },
  { id: 'goodnight', label: 'Before You Sleep', emoji: '🌙', moodQuery: '♡ I miss you', desc: 'Sweet dreams and quiet nights' },
  { id: 'future', label: 'Future Us', emoji: '🔮', moodQuery: '✨ Surprise me', desc: 'Promises and hopes for tomorrow' },
  { id: 'surprise', label: 'Surprise', emoji: '✨', moodQuery: '✨ Surprise me', desc: 'A little mystery for your heart' }
];

export default function Letters({ letters, onSaveLetter, onOpenLetter }: LettersProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'unopened' | 'from_nata' | 'from_partner'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Modals & States
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [readingLetter, setReadingLetter] = useState<LetterItem | null>(null);
  const [isOpeningAnimation, setIsOpeningAnimation] = useState(false);
  const [openingCandidate, setOpeningCandidate] = useState<LetterItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [sender, setSender] = useState<'Nata' | 'Partner'>('Nata');
  const [recipient, setRecipient] = useState<'Partner' | 'Nata'>('Partner');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('just_because');
  const [content, setContent] = useState('');
  const [signature, setSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unopened count
  const unopenedCount = useMemo(() => {
    return letters.filter(l => !l.isOpened).length;
  }, [letters]);

  // Filtered letters list
  const filteredLetters = useMemo(() => {
    return letters.filter(l => {
      // Tab filter
      if (activeTab === 'unopened' && l.isOpened) return false;
      if (activeTab === 'from_nata' && l.sender !== 'Nata') return false;
      if (activeTab === 'from_partner' && l.sender !== 'Partner') return false;

      // Category filter
      if (selectedCategory && l.category !== selectedCategory) return false;

      return true;
    });
  }, [letters, activeTab, selectedCategory]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Open Random Letter Action
  const handleOpenRandom = (categoryFilter?: string) => {
    let pool = letters;

    if (categoryFilter) {
      pool = letters.filter(l => l.category === categoryFilter);
    }

    if (pool.length === 0) {
      showToast("There isn't a letter for this one yet ♡");
      return;
    }

    // Prioritize unopened letters if available, otherwise pick from all
    const unread = pool.filter(l => !l.isOpened);
    const candidateList = unread.length > 0 ? unread : pool;
    const randomIndex = Math.floor(Math.random() * candidateList.length);
    const chosen = candidateList[randomIndex];

    // Trigger opening sequence
    setOpeningCandidate(chosen);
    setIsOpeningAnimation(true);

    setTimeout(() => {
      setIsOpeningAnimation(false);
      setReadingLetter(chosen);
      setOpeningCandidate(null);
      if (!chosen.isOpened) {
        onOpenLetter(chosen.id);
      }
    }, 900);
  };

  const handleManualOpenLetter = (letter: LetterItem) => {
    setOpeningCandidate(letter);
    setIsOpeningAnimation(true);

    setTimeout(() => {
      setIsOpeningAnimation(false);
      setReadingLetter(letter);
      setOpeningCandidate(null);
      if (!letter.isOpened) {
        onOpenLetter(letter.id);
      }
    }, 700);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);

    try {
      await onSaveLetter({
        sender,
        recipient,
        title: title.trim(),
        content: content.trim(),
        category,
        signature: signature.trim() || `${sender} ♡`
      });

      // Reset form
      setTitle('');
      setContent('');
      setSignature('');
      setIsWriteOpen(false);
      showToast("Letter sealed and saved into our box ♡");
    } catch (err) {
      console.error(err);
      showToast("Failed to save letter");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Someday';
    }
  };

  return (
    <div className="min-h-screen pt-8 sm:pt-12 pb-36 px-4 max-w-xl mx-auto font-sans text-slate relative">
      
      {/* Toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[80] px-4 py-2 bg-slate/90 text-white backdrop-blur-md rounded-full text-xs font-medium shadow-lg flex items-center gap-2 border border-white/20"
          >
            <Heart className="w-3.5 h-3.5 fill-rose text-rose" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose/15 border border-rose/30 text-rose-800 text-[11px] font-medium mb-3">
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          <span>Secret Letter Box</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate tracking-tight">
          Our Little Letters
        </h1>
        <p className="font-handwriting text-lg sm:text-xl text-slate/60 mt-1 flex items-center justify-center gap-1.5">
          <span>A few words we left for each other...</span>
          <Heart className="w-3.5 h-3.5 fill-rose text-rose inline-block" />
        </p>

        {/* Counter Pill */}
        <div className="mt-3 inline-flex items-center gap-3 px-4 py-1.5 bg-white/80 backdrop-blur-md rounded-2xl border border-slate/10 shadow-xs text-xs">
          <span className="font-semibold text-slate/70">
            {letters.length} {letters.length === 1 ? 'letter' : 'letters'} total
          </span>
          <span className="text-slate/25">•</span>
          <span className={cn(
            "font-semibold flex items-center gap-1",
            unopenedCount > 0 ? "text-rose-600" : "text-slate/50"
          )}>
            <span>{unopenedCount} still sealed</span>
            <Heart className="w-3 h-3 fill-current inline-block" />
          </span>
        </div>
      </motion.div>

      {/* 2. MAIN INTERACTIVE LETTER BOX CARD */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white/95 backdrop-blur-sm p-6 sm:p-7 rounded-[2rem] shadow-[0_12px_40px_-15px_rgba(44,53,69,0.08)] border border-slate/10 text-center relative overflow-hidden mb-8"
      >
        {/* Subtle washi tape accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-3.5 bg-rose/20 border-b border-rose/30 rounded-b-sm transform -rotate-1 opacity-80 pointer-events-none" />

        {/* Letter Stack Visual */}
        <div className="relative h-28 sm:h-32 flex items-center justify-center my-2">
          {/* Background Envelopes */}
          <motion.div 
            animate={{ rotate: [-6, -4, -6], y: [0, -2, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-36 sm:w-44 h-24 sm:h-28 bg-[#FFF8FA] rounded-2xl border border-rose-200/70 shadow-xs flex items-center justify-center opacity-70"
          >
            <span className="text-2xl">💌</span>
          </motion.div>
          <motion.div 
            animate={{ rotate: [6, 4, 6], y: [0, 2, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-36 sm:w-44 h-24 sm:h-28 bg-[#F8FAFE] rounded-2xl border border-softblue/30 shadow-xs flex items-center justify-center opacity-85"
          >
            <span className="text-2xl">✉️</span>
          </motion.div>

          {/* Foreground Main Envelope */}
          <motion.div 
            whileHover={{ scale: 1.04, rotate: 0 }}
            className="relative w-40 sm:w-48 h-26 sm:h-30 bg-white rounded-2xl border border-slate/15 shadow-[0_8px_24px_rgba(44,53,69,0.08)] flex flex-col items-center justify-center p-3 cursor-pointer z-10"
            onClick={() => handleOpenRandom()}
          >
            <span className="text-3xl mb-1">💌</span>
            <span className="text-xs font-serif font-bold text-slate">Open one for me ♡</span>
            <span className="text-[10px] font-handwriting text-slate/50 text-sm">tap to unseal a letter</span>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2.5 justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpenRandom()}
            className="flex-1 py-3 px-5 bg-slate text-white rounded-2xl font-bold text-xs sm:text-sm tracking-wider uppercase shadow-md shadow-slate/15 hover:bg-[#1A202C] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Dices className="w-4 h-4 text-rose-300" />
            <span>Open a Random Letter ♡</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsWriteOpen(true)}
            className="py-3 px-5 bg-white text-slate border border-slate/15 rounded-2xl font-bold text-xs sm:text-sm tracking-wider uppercase hover:bg-slate/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-lavender" />
            <span>Write a Letter</span>
          </motion.button>
        </div>

        {/* 3. RANDOM BY MOOD / SITUATION SHORTCUTS */}
        <div className="mt-6 pt-5 border-t border-slate/10 text-left">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate/40 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-lavender" />
            <span>What do you need right now?</span>
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[
              { label: '♡ I miss you', categoryId: 'miss_you' },
              { label: '☁ I need comfort', categoryId: 'comfort' },
              { label: '☀ I want something happy', categoryId: 'happy' },
              { label: '✨ Surprise me', categoryId: 'surprise' }
            ].map(pill => (
              <button
                key={pill.label}
                onClick={() => handleOpenRandom(pill.categoryId)}
                className="px-3 py-1.5 rounded-full bg-[#FAF8FE] hover:bg-lavender/15 text-slate/75 hover:text-purple-800 text-[11px] font-medium border border-slate/10 transition-all cursor-pointer"
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 4. OUR LETTERS ARCHIVE SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-slate">Our Letters</h2>
            <p className="text-xs text-slate/50 font-handwriting text-base">Browse all messages saved in our box</p>
          </div>
          
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-[11px] font-medium text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1 cursor-pointer"
            >
              <span>Clear Filter</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { key: 'all', label: 'All' },
            { key: 'unopened', label: `Unopened (${unopenedCount})` },
            { key: 'from_nata', label: 'From Nata' },
            { key: 'from_partner', label: 'From Partner' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                "px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer text-[11px]",
                activeTab === tab.key 
                  ? "bg-slate text-white shadow-xs" 
                  : "bg-white/80 text-slate/60 hover:bg-white border border-slate/10"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          {LETTER_CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                className={cn(
                  "px-2.5 py-1 rounded-xl text-[10px] font-medium whitespace-nowrap border transition-all cursor-pointer flex items-center gap-1",
                  isSelected
                    ? "bg-lavender/25 border-lavender/50 text-purple-900 shadow-2xs font-bold"
                    : "bg-white/70 border-slate/10 text-slate/60 hover:bg-white"
                )}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Letters List */}
        {filteredLetters.length === 0 ? (
          <div className="bg-white/70 p-8 rounded-3xl border border-slate/10 text-center space-y-3">
            <div className="text-4xl mb-1">💌</div>
            <h3 className="font-serif font-bold text-slate text-lg">No little letters yet...</h3>
            <p className="text-xs text-slate/60 font-handwriting text-base max-w-xs mx-auto">
              Maybe it's time to leave one for each other ♡
            </p>
            <button
              onClick={() => setIsWriteOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-slate text-white rounded-xl text-xs font-bold tracking-wider uppercase hover:bg-[#1A202C] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write the First Letter</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredLetters.map((l, index) => {
              const catObj = LETTER_CATEGORIES.find(c => c.id === l.category);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                  key={l.id}
                  onClick={() => handleManualOpenLetter(l)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left relative overflow-hidden group hover:scale-[1.015] shadow-xs",
                    l.isOpened 
                      ? "bg-white/85 border-slate/10 hover:border-lavender/40 hover:bg-white" 
                      : "bg-gradient-to-br from-[#FFF8FA] to-white border-rose-200/80 shadow-rose-100/50 hover:border-rose-300"
                  )}
                >
                  {/* Sealed / Opened Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate/5 text-slate/70">
                      <span>{catObj?.emoji || '💌'}</span>
                      <span>{catObj?.label || l.category}</span>
                    </span>

                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                      l.isOpened 
                        ? "bg-slate/5 text-slate/40 border-slate/10" 
                        : "bg-rose-50 text-rose-600 border-rose-200 font-bold animate-pulse"
                    )}>
                      {l.isOpened ? 'Opened' : 'Sealed ♡'}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-slate text-sm sm:text-base line-clamp-1 mb-1">
                    {l.title}
                  </h3>

                  {/* If opened, show small peek; if sealed, show romantic teaser */}
                  <p className="text-xs text-slate/50 line-clamp-2 leading-relaxed mb-3">
                    {l.isOpened 
                      ? l.content 
                      : "A sealed letter waiting to be opened by your heart..."}
                  </p>

                  <div className="pt-2 border-t border-slate/5 flex items-center justify-between text-[10px] text-slate/45">
                    <span className="font-handwriting text-sm text-slate/60">
                      From {l.sender} → {l.recipient}
                    </span>
                    <span>{formatDate(l.createdAt)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. OPENING LETTER ANIMATION OVERLAY */}
      <AnimatePresence>
        {isOpeningAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate/60 backdrop-blur-md px-4"
          >
            <motion.div
              initial={{ scale: 0.7, y: 30, rotate: -6 }}
              animate={{ 
                scale: [0.7, 1.08, 1], 
                y: [30, -10, 0],
                rotate: [-6, 3, 0]
              }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="w-72 sm:w-80 bg-white p-6 rounded-3xl shadow-2xl border border-rose-200 text-center relative overflow-hidden"
            >
              <div className="text-6xl mb-3 animate-bounce">💌</div>
              <h3 className="font-serif font-bold text-slate text-lg">Unsealing Letter...</h3>
              <p className="font-handwriting text-slate/60 text-lg mt-1">
                {openingCandidate ? `From ${openingCandidate.sender} with love ♡` : 'Opening your letter...'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. PHYSICAL LETTER DETAIL MODAL */}
      <AnimatePresence>
        {readingLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-slate/50 backdrop-blur-xs p-4 overflow-y-auto"
            onClick={() => setReadingLetter(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FFFDF9] max-w-lg w-full p-6 sm:p-9 rounded-[2rem] shadow-2xl border border-[#EBE3D5] relative text-left my-8"
            >
              {/* Paper texture and vintage washi tape at top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-lavender/25 border-b border-lavender/40 rounded-b-sm transform -rotate-1 opacity-75" />

              {/* Close button */}
              <button
                onClick={() => setReadingLetter(null)}
                className="absolute top-4 right-4 w-7 h-7 bg-slate/5 hover:bg-slate/10 rounded-full flex items-center justify-center text-slate/60 hover:text-slate transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Letter Header */}
              <div className="border-b border-[#EBE3D5] pb-4 mb-5 pt-2">
                <div className="flex items-center justify-between text-xs text-slate/40 mb-1 font-mono">
                  <span>{formatDate(readingLetter.createdAt)}</span>
                  <span className="font-sans px-2 py-0.5 rounded-full bg-rose/15 text-rose-700 font-medium text-[10px]">
                    {LETTER_CATEGORIES.find(c => c.id === readingLetter.category)?.emoji || '💌'}{' '}
                    {LETTER_CATEGORIES.find(c => c.id === readingLetter.category)?.label || readingLetter.category}
                  </span>
                </div>
                
                <p className="font-handwriting text-slate/70 text-xl">
                  To: {readingLetter.recipient} ♡
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate mt-1">
                  {readingLetter.title}
                </h2>
              </div>

              {/* Letter Content */}
              <div className="text-slate/85 font-sans text-sm sm:text-base leading-relaxed whitespace-pre-wrap min-h-[140px] font-normal">
                {readingLetter.content}
              </div>

              {/* Letter Signature / Footer */}
              <div className="mt-8 pt-4 border-t border-[#EBE3D5] text-right">
                <p className="font-handwriting text-2xl text-slate font-bold">
                  {readingLetter.signature || `With all my love,\n${readingLetter.sender} ♡`}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. WRITE A LETTER MODAL */}
      <AnimatePresence>
        {isWriteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-slate/50 backdrop-blur-xs p-4 overflow-y-auto"
            onClick={() => !isSubmitting && setIsWriteOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-slate/10 relative text-left my-8"
            >
              <button
                onClick={() => setIsWriteOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 bg-slate/5 hover:bg-slate/10 rounded-full flex items-center justify-center text-slate/60 hover:text-slate transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-lavender flex items-center gap-1 mb-1">
                  <Heart className="w-3 h-3 fill-lavender text-lavender" />
                  <span>Leave a message</span>
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate">
                  Write a Letter ♡
                </h2>
                <p className="text-xs text-slate/50 font-handwriting text-base">
                  It will stay sealed in our box until it is opened...
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs sm:text-sm">
                
                {/* Sender & Recipient */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/40 mb-1">
                      From
                    </label>
                    <select
                      value={sender}
                      onChange={(e) => {
                        const s = e.target.value as 'Nata' | 'Partner';
                        setSender(s);
                        setRecipient(s === 'Nata' ? 'Partner' : 'Nata');
                      }}
                      className="w-full px-3 py-2 bg-[#FAF8FE] border border-slate/10 rounded-xl outline-none focus:border-lavender text-slate font-medium"
                    >
                      <option value="Nata">Nata ♡</option>
                      <option value="Partner">Partner ♡</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/40 mb-1">
                      To
                    </label>
                    <input
                      type="text"
                      disabled
                      value={recipient === 'Nata' ? 'Nata ♡' : 'Partner ♡'}
                      className="w-full px-3 py-2 bg-slate/5 border border-slate/10 rounded-xl text-slate/60 font-medium"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/40 mb-1">
                    When Should This Be Opened?
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8FE] border border-slate/10 rounded-xl outline-none focus:border-lavender text-slate font-medium"
                  >
                    {LETTER_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.emoji} {c.label} ({c.desc})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject / Title */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/40 mb-1">
                    Subject / Title
                  </label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Just wanted to tell you how proud I am..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF8FE] border border-slate/10 rounded-xl outline-none focus:border-lavender text-slate placeholder:text-slate/30"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/40 mb-1">
                    Your Letter
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Dear you,&#10;&#10;I don't know when you'll read this, but I wanted you to know... ♡"
                    className="w-full p-3.5 bg-[#FAF8FE] border border-slate/10 rounded-2xl outline-none focus:border-lavender text-slate leading-relaxed resize-none placeholder:text-slate/30"
                  />
                </div>

                {/* Signature */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate/40 mb-1">
                    Sign-off / Signature (Optional)
                  </label>
                  <input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder={`e.g. Forever yours, ${sender} ♡`}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8FE] border border-slate/10 rounded-xl outline-none focus:border-lavender text-slate placeholder:text-slate/30 font-handwriting text-lg"
                  />
                </div>

                {/* Save / Seal Button */}
                <div className="pt-3">
                  <motion.button
                    whileHover={!isSubmitting ? { scale: 1.01 } : undefined}
                    whileTap={!isSubmitting ? { scale: 0.98 } : undefined}
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "w-full py-3.5 bg-slate text-white rounded-2xl font-bold tracking-wider uppercase hover:bg-[#1A202C] transition-all shadow-md shadow-slate/15 flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm",
                      isSubmitting && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Heart className="w-4 h-4 fill-rose-300 text-rose-300" />
                    <span>{isSubmitting ? 'Sealing Letter...' : 'Seal & Save Letter ♡'}</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

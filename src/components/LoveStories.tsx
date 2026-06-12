import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  BookOpen, 
  Calendar,
  HeartCrack
} from 'lucide-react';
import { loveStories, LoveStory } from '../data/loveStories';

export const LoveStories = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes = 300 seconds
  const [autoPlay, setAutoPlay] = useState(true);
  const [showHearts, setShowHearts] = useState<Array<{ id: string; left: number; delay: number; scale: number; duration: number }>>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger floating hearts occasionally or when story changes
  const spawnHearts = () => {
    const newHearts = Array.from({ length: 12 }).map((_, i) => ({
      id: `${Date.now()}-${i}-${Math.random()}`,
      left: Math.random() * 100, // percentage
      delay: Math.random() * 2,
      scale: 0.4 + Math.random() * 0.8,
      duration: 3 + Math.random() * 4,
    }));
    setShowHearts(prev => [...prev.slice(-20), ...newHearts]);
  };

  useEffect(() => {
    spawnHearts();
  }, [currentIndex]);

  // Handle countdown interval
  useEffect(() => {
    if (autoPlay) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer finished, go to next story
            setCurrentIndex(curr => (curr + 1) % loveStories.length);
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoPlay]);

  const activeStory = loveStories[currentIndex];

  const handleNext = () => {
    setCurrentIndex(curr => (curr + 1) % loveStories.length);
    setTimeLeft(300); // Reset timer
  };

  const handlePrev = () => {
    setCurrentIndex(curr => (curr - 1 + loveStories.length) % loveStories.length);
    setTimeLeft(300); // Reset timer
  };

  const handleRandom = () => {
    let nextIdx = currentIndex;
    while (nextIdx === currentIndex && loveStories.length > 1) {
      nextIdx = Math.floor(Math.random() * loveStories.length);
    }
    setCurrentIndex(nextIdx);
    setTimeLeft(300); // Reset timer
    spawnHearts();
  };

  const selectStory = (index: number) => {
    setCurrentIndex(index);
    setTimeLeft(300); // Reset timer
  };

  // Convert seconds to MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Percentage of timer elapsed (300 seconds total)
  const progressPercent = ((300 - timeLeft) / 300) * 100;

  return (
    <section className="relative min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/10 dark:bg-[#070b13] flex flex-col items-center justify-start overflow-hidden">
      {/* Decorative animated particles background */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-pink-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-rose-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Floating Hearts Container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <AnimatePresence>
          {showHearts.map(heart => (
            <motion.div
              key={heart.id}
              initial={{ opacity: 0, y: "105vh", x: `${heart.left}vw` }}
              animate={{ opacity: [0, 0.7, 0.7, 0], y: "-10vh" }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: heart.duration, 
                delay: heart.delay,
                ease: "easeOut"
              }}
              style={{ scale: heart.scale }}
              className="absolute text-pink-400/25 dark:text-pink-600/20 select-none"
            >
              <Heart size={24} fill="currentColor" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-6xl w-full relative z-10 flex flex-col items-center">
        {/* Page Header */}
        <div className="text-center mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100 dark:bg-pink-950/40 border border-pink-200/50 dark:border-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-xs font-semibold mb-3 tracking-wider uppercase">
            <Heart size={12} fill="currentColor" className="animate-pulse" />
            <span>Hopson Mode • Cabinet de Lecture</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-tight mb-4">
            Nos Histoires d'Amour ✨
          </h1>
          <p className="text-slate-600 dark:text-slate-350 text-sm sm:text-base">
            Installe-toi confortablement, ma princesse. Laisse-toi emporter par quelques douces chroniques romantiques écrites rien que pour toi.
          </p>
        </div>

        {/* Outer Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
          
          {/* Main Story Book Card (7 cols) */}
          <div className="lg:col-span-8 flex flex-col h-full">
            <div className="relative bg-white/90 dark:bg-slate-900/90 border border-pink-150 dark:border-pink-950/40 rounded-[2.5rem] shadow-xl dark:shadow-pink-950/5 flex-grow overflow-hidden flex flex-col p-6 sm:p-10">
              
              {/* Backdrops glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-pink-300 dark:bg-pink-900/10 rounded-full blur-3xl pointer-events-none opacity-30" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-300 dark:bg-rose-900/10 rounded-full blur-3xl pointer-events-none opacity-30" />

              {/* Progress bar and countdown state */}
              <div className="relative z-15 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-pink-100/60 dark:border-pink-950/30 pb-5 mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-pink-50 dark:bg-pink-950/50 text-pink-500 dark:text-pink-400">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-500">
                      Récit Actuel
                    </p>
                    <p className="text-xs font-bold text-pink-500 dark:text-pink-400">
                      Chapitre {currentIndex + 1} sur {loveStories.length}
                    </p>
                  </div>
                </div>

                {/* Countdown Timer Visual */}
                <div className="flex items-center gap-4 bg-pink-50/50 dark:bg-pink-950/20 px-4 py-2 rounded-2xl border border-pink-100/30 dark:border-pink-900/10 w-full sm:w-auto">
                  <div className="relative w-4 h-4 flex items-center justify-center">
                    <Clock size={15} className="text-pink-500 dark:text-pink-400 animate-spin [animation-duration:12s]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-mono">
                      Cycle automatique (5 min) :
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                        {formatTime(timeLeft)}
                      </span>
                      <button
                        onClick={() => setAutoPlay(!autoPlay)}
                        className={`text-[10px] select-none hover:underline cursor-pointer ${autoPlay ? 'text-pink-500' : 'text-slate-400'}`}
                        title={autoPlay ? "Pause de lecture automatique" : "Reprendre la lecture automatique"}
                      >
                        [{autoPlay ? "Désactiver" : "Activer"}]
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic story card transition */}
              <div className="relative flex-grow flex flex-col justify-between min-h-[350px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="space-y-6 flex-grow"
                  >
                    {/* Story Header */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl" role="img" aria-label="story emoji">
                          {activeStory.emoji}
                        </span>
                        <div>
                          <span className="text-xs font-bold tracking-widest text-pink-500 uppercase">
                            {activeStory.tag}
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white leading-tight">
                            {activeStory.title}
                          </h2>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-505 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {activeStory.date}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-300" />
                        <span className="flex items-center gap-1 font-semibold text-pink-500">
                          {activeStory.readingTime}
                        </span>
                      </div>
                    </div>

                    {/* Story Paragraphs */}
                    <div className="space-y-4 pt-2 text-slate-700 dark:text-slate-200">
                      {activeStory.paragraphs.map((para, pIdx) => (
                        <p 
                          key={pIdx} 
                          className="text-base sm:text-lg leading-relaxed first-of-type:font-semibold first-of-type:text-slate-900 first-of-type:dark:text-white/95"
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Switch Controls */}
                <div className="relative z-10 border-t border-slate-100 dark:border-slate-800/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Prev / Next buttons */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={handlePrev}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-pink-50 hover:text-pink-600 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-700 dark:hover:text-pink-400 border border-slate-100 dark:border-slate-700/80 transition-all cursor-pointer flex-1 sm:flex-none flex items-center justify-center"
                      title="Histoire précédente"
                      id="stories-prev-btn"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <button
                      onClick={handleNext}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-pink-50 hover:text-pink-600 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-700 dark:hover:text-pink-400 border border-slate-100 dark:border-slate-700/80 transition-all cursor-pointer flex-1 sm:flex-none flex items-center justify-center"
                      title="Histoire suivante"
                      id="stories-next-btn"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  {/* Random Shuffle Story */}
                  <button
                    onClick={handleRandom}
                    className="px-5 py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700 text-white font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-pink-500/15 w-full sm:w-auto active:scale-95"
                    id="stories-shuffle-btn"
                  >
                    <RotateCw size={16} className="animate-spin [animation-duration:15s]" />
                    <span>Créer une étincelle (Aléatoire)</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar timer at the absolute bottom of the card container */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-850 overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-pink-400 via-rose-500 to-pink-600"
                  style={{ width: `${progressPercent}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>

            </div>
          </div>

          {/* Catalog / Sidebar List (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Direct selector index */}
            <div className="bg-white/90 dark:bg-slate-900/90 border border-pink-150 dark:border-pink-950/40 rounded-[2.5rem] p-6 shadow-xl dark:shadow-pink-950/5 relative overflow-hidden">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                Index des recueils
              </h3>

              <div className="space-y-3">
                {loveStories.map((story, index) => {
                  const isActive = index === currentIndex;
                  return (
                    <button
                      key={story.id}
                      onClick={() => selectStory(index)}
                      className={`w-full text-left p-4 rounded-[1.5rem] flex items-start gap-3 transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-gradient-to-br from-pink-50 to-rose-50/30 dark:from-pink-950/30 dark:to-rose-950/10 border-pink-300 dark:border-pink-900/60 shadow-md translate-x-1'
                          : 'bg-transparent border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850/50 text-slate-600 dark:text-slate-400'
                      }`}
                      id={`story-select-item-${story.id}`}
                    >
                      <span className="text-2xl pt-1 select-none" role="img" aria-label="emoji">
                        {story.emoji}
                      </span>
                      <div className="flex-grow min-w-0">
                        <span className={`text-[9px] uppercase font-bold tracking-widest ${isActive ? 'text-pink-500' : 'text-slate-400'}`}>
                          {story.tag}
                        </span>
                        <h4 className={`text-sm font-bold truncate leading-snug ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {story.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                          {story.readingTime}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Micro Sweet Card */}
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-[2.5rem] p-6 shadow-lg shadow-pink-500/10 relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <Heart size={32} fill="white" className="mx-auto mb-3 animate-ping [animation-duration:2s]" />
              <h4 className="font-extrabold text-lg mb-1">
                La Reine des Cœurs
              </h4>
              <p className="text-xs text-pink-100 leading-relaxed max-w-xs mx-auto">
                Chaque histoire de cet index se nourrit de ta tendresse. Merci de faire partie de la vie de Mike Gouthon et d'en écrire les plus belles pages. 👑🌹
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

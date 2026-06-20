import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HeartOff, X, ShieldAlert } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export const HopsonRemovedModal: React.FC = () => {
  const { showHopsonRemovedModal, setShowHopsonRemovedModal, ownerName } = useNavigation();

  // Block scrolling on the body while the modal is open
  useEffect(() => {
    if (showHopsonRemovedModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showHopsonRemovedModal]);

  return (
    <AnimatePresence>
      {showHopsonRemovedModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 select-none">
          {/* Ambient Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowHopsonRemovedModal(false)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-xl"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-pink-100 dark:border-pink-950/40 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col items-center text-center space-y-6"
          >
            {/* Ambient subtle background radial glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-pink-500/10 dark:bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Corner Close Button */}
            <button
              onClick={() => setShowHopsonRemovedModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-full transition-all cursor-pointer"
              title="Fermer"
            >
              <X size={18} />
            </button>

            {/* Status Icon */}
            <div className="relative">
              <div className="p-4 bg-pink-50 dark:bg-pink-950/20 text-pink-500 dark:text-pink-400 rounded-2xl border border-pink-100 dark:border-pink-900/30 flex items-center justify-center">
                <HeartOff size={36} className="animate-pulse" />
              </div>
              {/* Little warning badge overlay */}
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white border border-white dark:border-slate-900">
                <ShieldAlert size={12} />
              </span>
            </div>

            {/* Typography */}
            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-bold font-sans text-slate-900 dark:text-white-50 leading-snug tracking-tight">
                Mode Hopson Indisponible
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-sans leading-relaxed px-1 sm:px-4">
                Désolé ! Je suis l'assistant de <span className="font-bold text-indigo-505 dark:text-indigo-400">{ownerName}</span> et il m'a demandé de supprimer le mode Hopson...
              </p>
            </div>

            {/* Friendly Close Button */}
            <button
              onClick={() => setShowHopsonRemovedModal(false)}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-750 text-white font-semibold text-xs uppercase tracking-wider font-mono rounded-xl border border-slate-800 dark:border-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg cursor-pointer"
            >
              Compris / D'accord
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

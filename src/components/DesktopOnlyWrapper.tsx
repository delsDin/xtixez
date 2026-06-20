import React, { useState, useEffect } from 'react';
import { Monitor, ArrowLeft, Cpu, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigation } from '../context/NavigationContext';

interface DesktopOnlyWrapperProps {
  children: React.ReactNode;
  moduleName: string;
}

export const DesktopOnlyWrapper: React.FC<DesktopOnlyWrapperProps> = ({ children, moduleName }) => {
  const { setActiveSection } = useNavigation();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = windowWidth >= 1024;

  if (isDesktop) {
    return <>{children}</>;
  }

  return (
    <div className="flex-grow flex items-center justify-center min-h-[70vh] px-6 py-12 relative overflow-hidden select-none">
      {/* Dynamic decorative backdrop particles */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white to-slate-100/50 dark:from-slate-950/20 dark:via-[#0b0f19] dark:to-slate-900/40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/80 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-150/60 dark:border-slate-800/60 p-8 shadow-xl relative z-10 text-center"
      >
        {/* Decorative corner accents */}
        <div className="absolute top-3 left-3 w-2 h-2 border-t-2 border-l-2 border-slate-300 dark:border-slate-700 rounded-tl" />
        <div className="absolute top-3 right-3 w-2 h-2 border-t-2 border-r-2 border-slate-300 dark:border-slate-700 rounded-tr" />
        <div className="absolute bottom-3 left-3 w-2 h-2 border-b-2 border-l-2 border-slate-300 dark:border-slate-700 rounded-bl" />
        <div className="absolute bottom-3 right-3 w-2 h-2 border-b-2 border-r-2 border-slate-300 dark:border-slate-700 rounded-br" />

        {/* Visual Header */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-accent/10 dark:bg-accent/5 rounded-full blur-xl animate-ping" style={{ animationDuration: '3s' }} />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent/90 to-indigo-500 flex items-center justify-center shadow-lg shadow-accent/20">
            <Monitor className="text-white w-8 h-8 animate-bounce" style={{ animationDuration: '2.5s' }} />
          </div>
          <div className="absolute -top-1 -right-1 bg-amber-500 text-[10px] font-black uppercase text-white px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
            <Cpu size={10} />
            <span>PC</span>
          </div>
        </div>

        {/* Text Details */}
        <h2 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 mb-2 uppercase">
          {moduleName}
        </h2>
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-accent dark:text-accent font-mono uppercase tracking-widest mb-4">
          <Sparkles size={12} className="animate-spin" style={{ animationDuration: '4s' }} />
          <span>Poste de travail requis</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-8 max-w-sm mx-auto">
          Cet espace est un outil d'ingénierie avancé conçu exclusivement pour un affichage sur grand écran (résolution minimale de 1024px) avec l'ergonomie d'un clavier physique.
        </p>

        {/* Command Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => setActiveSection('home')}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-accent hover:opacity-95 cursor-pointer shadow-md shadow-accent/10 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} />
            <span>Retourner à l'accueil</span>
          </button>
          
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-mono">
            Résolution actuelle : {windowWidth}px / 1024px
          </div>
        </div>
      </motion.div>
    </div>
  );
};

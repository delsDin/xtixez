import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme, schemes } from '../context/ThemeContext';
import { Sparkles, Clock, Check, ShieldAlert, Cpu, ToggleLeft, ToggleRight, Sun, Moon, Settings } from 'lucide-react';

export const ThemeSelector: React.FC<{ variant?: 'header' | 'floating' }> = ({ variant = 'header' }) => {
  const { 
    darkMode, 
    toggleDarkMode, 
    currentSchemeIndex, 
    currentScheme, 
    setSchemeIndex, 
    isThemeLocked, 
    enableAutoSync 
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format the hour range mapped to each scheme index (modulo 5 mapping)
  const getMappedHours = (index: number): string => {
    switch (index) {
      case 0: return "00h - 05h, 10h - 15h";
      case 1: return "01h - 06h, 11h - 16h";
      case 2: return "02h - 07h, 12h - 17h";
      case 3: return "03h - 08h, 13h - 18h";
      case 4: return "04h - 09h, 14h - 19h";
      default: return "";
    }
  };

  const getThemeHoursName = (index: number): string => {
    switch (index) {
      case 0: return "Aurore Digitale";
      case 1: return "Synergie Cosmique";
      case 2: return "Code Sagesse";
      case 3: return "Abîme Virtuel";
      case 4: return "Crépuscule UX";
      default: return "";
    }
  };

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans" ref={containerRef}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.2 }}
              className="mb-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 overflow-hidden"
              id="theme-panel-floating"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1.5">
                  <Cpu size={14} className="text-accent animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                    Sélecteur de Thèmes
                  </span>
                </div>
                <button 
                  onClick={toggleDarkMode}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:text-accent transition-colors cursor-pointer"
                  title="Basculer Mode Sombre / Clair"
                  id="btn-floating-theme-mode"
                >
                  {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                </button>
              </div>

              {/* Auto Sync Toggle Status */}
              <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5 mb-3 border border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Clock size={13} className={`shrink-0 ${!isThemeLocked ? 'text-accent animate-pulse' : 'text-slate-400'}`} />
                  <div>
                    <span className="font-bold text-slate-850 dark:text-slate-200 block">
                      {!isThemeLocked ? 'Mode Auto-Horaire Actif' : 'Mode Thème Figé'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                      {!isThemeLocked ? 'S\'accorde à l\'heure locale en direct' : 'Verrouillé manuellement'}
                    </span>
                  </div>
                </div>
                
                {isThemeLocked ? (
                  <button
                    onClick={enableAutoSync}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-accent/15 hover:bg-accent/25 text-accent text-[10px] font-bold transition-all cursor-pointer font-sans"
                    id="btn-enable-autosync"
                  >
                    Réactiver Auto
                  </button>
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>

              {/* Preset List */}
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                {schemes.map((scheme, idx) => {
                  const isActive = currentSchemeIndex === idx;
                  return (
                    <div
                      key={scheme.id}
                      onClick={() => setSchemeIndex(idx)}
                      className={`relative flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer select-none ${
                        isActive 
                          ? 'bg-accent/10 border-accent dark:border-accent text-slate-900 dark:text-white' 
                          : 'bg-transparent border-slate-150 dark:border-slate-800 hover:border-accent/40 text-slate-700 dark:text-slate-300'
                      }`}
                      id={`preset-theme-${scheme.id}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Custom Dynamic Gradient Bubble */}
                        <div 
                          className="w-4.5 h-4.5 rounded-full shrink-0 shadow-inner flex items-center justify-center border border-white/20"
                          style={{
                            background: `linear-gradient(135deg, ${scheme.primary}, ${scheme.gradientTo})`
                          }}
                        >
                          {isActive && <Check size={10} className="text-white drop-shadow-md font-bold" />}
                        </div>

                        {/* Theme Profile text */}
                        <div className="truncate flex-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-bold text-xs truncate">
                              {scheme.name}
                            </span>
                          </div>
                          <span className="block text-[9px] text-slate-400 truncate font-mono">
                            {scheme.vibe}
                          </span>
                        </div>
                      </div>

                      {/* Display Slot indicator */}
                      <span className="text-[8px] font-mono shrink-0 px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-500 max-w-[80px] truncate">
                        {getThemeHoursName(idx)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Settings Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 hover:bg-accent hover:text-white text-slate-700 dark:text-slate-200 rounded-full shadow-lg hover:shadow-accent/25 border border-slate-200 dark:border-slate-800 transition-all select-none cursor-pointer duration-300 hover:scale-105 active:scale-95 group"
          title="Sélecteur de Thèmes de Couleur"
          aria-expanded={isOpen}
          id="btn-floating-theme-toggle"
        >
          <Settings size={20} className={`text-accent group-hover:text-white transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0 animate-pulse'}`} />
        </button>
      </div>
    );
  }

  // Header Dropdown implementation
  return (
    <div className="relative font-sans" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={`Thème: ${currentScheme.name} (${currentScheme.vibe}) - Cliquez pour personnaliser`}
        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 text-xs font-semibold hover:border-accent/45 transition-all select-none cursor-pointer duration-200"
        aria-haspopup="true"
        aria-expanded={isOpen}
        id="btn-header-theme-toggle"
      >
        <Clock size={12} className={`text-accent ${!isThemeLocked ? 'animate-pulse' : ''} shrink-0`} />
        {!isThemeLocked && (
          <span className="text-emerald-500 text-[10px] animate-pulse shrink-0">●</span>
        )}
        <span className="text-accent">{currentScheme.name.split(' ')[0]}</span>
        <Sparkles size={11} className="text-accent scale-95 group-hover:scale-110 transition-transform shrink-0" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl p-4 overflow-hidden z-50 text-left font-sans"
            id="theme-panel-header"
          >
            {/* Popover Title config info */}
            <div className="border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-3 flex justify-between items-center bg-transparent">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                🎨 Personnalisation
              </span>
              <span className="text-[10px] bg-accent-light text-accent rounded px-1.5 font-bold">
                {schemes.length} Thèmes
              </span>
            </div>

            {/* Micro-panel active state descriptor details */}
            <div className="mb-3.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 p-3 rounded-xl">
              <span className="block font-bold text-slate-800 dark:text-white capitalize text-[13px] mb-0.5">
                {currentScheme.name}
              </span>
              <p className="text-[10px] font-mono leading-relaxed text-slate-500">
                Spécifique : <span className="text-accent font-bold">{currentScheme.vibe}</span>
              </p>
              
              {!isThemeLocked ? (
                <div className="flex items-center gap-1.5 mt-1.5 text-[9px] font-mono text-emerald-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Cycle horaire synchronisé (heure locale : {new Date().getHours()}h)</span>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-1.5 mt-2 bg-transparent text-[9px] font-mono text-slate-400">
                  <span>Thème verrouillé manuellement</span>
                  <button
                    onClick={enableAutoSync}
                    className="text-[9px] underline text-accent hover:text-accent-dark font-bold cursor-pointer"
                    id="btn-header-enable-autosync"
                  >
                    Activer l'auto-sync d'heure
                  </button>
                </div>
              )}
            </div>

            {/* List Palette Grid Grid */}
            <div className="space-y-1.5" id="header-preset-list">
              {schemes.map((scheme, idx) => {
                const isActive = currentSchemeIndex === idx;
                return (
                  <button
                    key={scheme.id}
                    onClick={() => {
                      setSchemeIndex(idx);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border text-left cursor-pointer transition-all select-none ${
                      isActive 
                        ? 'bg-accent/10 border-accent dark:border-accent' 
                        : 'bg-transparent border-slate-100 dark:border-slate-800 hover:border-accent/30'
                    }`}
                    id={`header-preset-theme-${scheme.id}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Linear color previews bubble */}
                      <div 
                        className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center border border-white/10"
                        style={{
                          background: `linear-gradient(135deg, ${scheme.primary}, ${scheme.gradientTo})`
                        }}
                      >
                        {isActive && <Check size={10} className="text-white drop-shadow font-bold" />}
                      </div>

                      {/* Info lines text */}
                      <div className="truncate shrink">
                        <span className="block font-bold text-xs text-slate-850 dark:text-slate-100 truncate">
                          {scheme.name}
                        </span>
                        <span className="block text-[9px] text-slate-450 dark:text-slate-400 truncate font-mono">
                          {scheme.vibe}
                        </span>
                      </div>
                    </div>

                    <span className="text-[8px] font-mono shrink-0 px-1 py-0.5 rounded bg-slate-150 dark:bg-slate-950 text-slate-500">
                      {getThemeHoursName(idx)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Standard Quick Darkmode action footer panel */}
            <div className="border-t border-slate-100 dark:border-slate-800/60 mt-3 pt-2.5 flex justify-between items-center text-[10px] font-mono">
              <span className="text-slate-450 dark:text-slate-500">Mode d'énergie</span>
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 transition-all cursor-pointer border border-slate-150 dark:border-slate-850"
                id="btn-header-toggle-darkmode"
              >
                {darkMode ? <Sun size={11} className="text-accent" /> : <Moon size={11} className="text-accent" />}
                <span className="font-bold">{darkMode ? "Clair" : "Sombre"}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

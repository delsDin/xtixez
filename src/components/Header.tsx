import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Moon, Sun, Sparkles, Clock, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';
import { skillsData, projectsData, experienceData, testimonialsData } from '../data/mockData';
import { ThemeSelector } from './ThemeSelector';

export const Header = () => {
  const { darkMode, toggleDarkMode, currentScheme, cycleScheme } = useTheme();
  const { activeSection, setActiveSection, isHopsonMode, surprisesUnlocked } = useNavigation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dropdown states
  const [isLabMenuOpen, setIsLabMenuOpen] = useState(false);
  const [isLoveMenuOpen, setIsLoveMenuOpen] = useState(false);

  // Refs for outside click detection
  const labDropdownRef = useRef<HTMLDivElement>(null);
  const loveDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (labDropdownRef.current && !labDropdownRef.current.contains(event.target as Node)) {
        setIsLabMenuOpen(false);
      }
      if (loveDropdownRef.current && !loveDropdownRef.current.contains(event.target as Node)) {
        setIsLoveMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasSkills = Object.values(skillsData).some(arr => arr.length > 0);
  const hasProjects = projectsData.length > 0;
  const hasExperience = experienceData.length > 0 || testimonialsData.length > 0;

  // Flattened link list for the mobile menu
  const mobileNavLinks = [
    { name: 'Accueil', id: 'home', show: true },
    { name: 'À propos', id: 'about', show: true },
    { name: 'Histoires', id: 'love-stories', show: isHopsonMode },
    { name: 'Surprises 🚪', id: 'surprises', show: isHopsonMode && !surprisesUnlocked },
    { name: 'Élixirs', id: 'elixir', show: isHopsonMode && surprisesUnlocked },
    { name: 'Roue Complice', id: 'wheel', show: isHopsonMode && surprisesUnlocked },
    { name: 'Clic d\'Amour', id: 'clicker', show: isHopsonMode && surprisesUnlocked },
    { name: 'Compilateur', id: 'romanticCoder', show: isHopsonMode && surprisesUnlocked },
    { name: 'Boîte Respi', id: 'breathing', show: isHopsonMode && surprisesUnlocked },
    { name: 'Services', id: 'services', show: !isHopsonMode },
    { name: 'Terminal AI', id: 'terminal', show: true },
    { name: 'Pipeline', id: 'pipeline', show: !isHopsonMode },
    { name: 'Compétences', id: 'skills', show: hasSkills && !isHopsonMode },
    { name: 'Certifications', id: 'certifications', show: !isHopsonMode },
    { name: 'Projets', id: 'projects', show: hasProjects && !isHopsonMode },
    { name: 'Expérience', id: 'experience', show: hasExperience && !isHopsonMode },
    { name: 'Contact', id: 'contact', show: !isHopsonMode },
  ].filter(link => link.show);

  // Desktop Navigation Configuration:
  // We keep core sections visible and group secondary/lab panels into drop-downs to avoid layout wrapping.
  const desktopPrimaryLinks = isHopsonMode
    ? [
        { name: 'Accueil', id: 'home' },
        { name: 'À propos', id: 'about' },
        { name: 'Histoires', id: 'love-stories' },
        ...(!surprisesUnlocked ? [{ name: 'Surprises 🚪', id: 'surprises' }] : []),
      ]
    : [
        { name: 'Accueil', id: 'home' },
        { name: 'À propos', id: 'about' },
        { name: 'Services', id: 'services' },
        { name: 'Compétences', id: 'skills', show: hasSkills },
        { name: 'Projets', id: 'projects', show: hasProjects },
        { name: 'Contact', id: 'contact' },
      ].filter(l => l.show !== false);

  const labDropdownLinks = [
    { name: 'Terminal AI', id: 'terminal' },
    { name: 'Pipeline', id: 'pipeline' },
    { name: 'Certifications', id: 'certifications' },
    { name: 'Expérience / Avis', id: 'experience', show: hasExperience },
  ].filter(l => l.show !== false);

  const loveDropdownLinks = [
    { name: '🔮 Élixirs d\'Amour', id: 'elixir' },
    { name: '🎡 Roue Complice', id: 'wheel' },
    { name: '❤️ Clic d\'Amour', id: 'clicker' },
    { name: '💻 Compilateur Romantique', id: 'romanticCoder' },
    { name: '🌬️ Boîte de Respiration', id: 'breathing' },
  ];

  const handleNavClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveSection(id);
    setIsMobileMenuOpen(false);
    setIsLabMenuOpen(false);
    setIsLoveMenuOpen(false);
    
    const targetSection = document.getElementById(id);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isLabActive = labDropdownLinks.some(link => activeSection === link.id);
  const isLoveActive = loveDropdownLinks.some(link => activeSection === link.id);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-slate-900/85 backdrop-blur-md shadow-sm py-2.5 border-b border-slate-100/30 dark:border-slate-800/20'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <a 
          href="#home" 
          onClick={(e) => handleNavClick('home', e)}
          className="text-2xl font-bold text-accent tracking-tighter"
        >
          De<span className="text-slate-800 dark:text-slate-100">ls</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          <ul className="flex items-center gap-4 xl:gap-5">
            {/* Primary static items */}
            {desktopPrimaryLinks.map((link) => (
              <li key={link.name} className="relative">
                <a
                  href={`#${link.id}`}
                  onClick={(e) => handleNavClick(link.id, e)}
                  className={`text-[13px] font-bold transition-colors relative py-1 px-2 block cursor-pointer select-none uppercase tracking-wider ${
                    activeSection === link.id
                      ? 'text-accent'
                      : 'text-slate-600 hover:text-accent dark:text-slate-300 dark:hover:text-accent'
                  }`}
                >
                  {link.name}
                  {activeSection === link.id && (
                    <motion.div
                      layoutId="activeSectionUnderline"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              </li>
            ))}

            {/* Standard Mode - Lab AI & Dropdown menu */}
            {!isHopsonMode && (
              <li className="relative" ref={labDropdownRef}>
                <button
                  onClick={() => setIsLabMenuOpen(!isLabMenuOpen)}
                  className={`text-[13px] font-bold hover:text-accent transition-all py-1 px-2.5 rounded-lg flex items-center gap-1 cursor-pointer select-none uppercase tracking-wider ${
                    isLabActive || isLabMenuOpen
                      ? 'text-accent bg-accent/5'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>Lab & Plus</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isLabMenuOpen ? 'rotate-180 text-accent' : 'rotate-0'}`} />
                </button>

                <AnimatePresence>
                  {isLabMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 text-left"
                    >
                      {labDropdownLinks.map((link) => (
                        <a
                          key={link.name}
                          href={`#${link.id}`}
                          onClick={(e) => handleNavClick(link.id, e)}
                          className={`block px-4.5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                            activeSection === link.id
                              ? 'text-accent bg-accent/5 font-extrabold'
                              : 'text-slate-600 dark:text-slate-300 hover:text-accent dark:hover:text-amber-400'
                          }`}
                        >
                          {link.name}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )}

            {/* Hopson Mode - Interactive Games & Exercises Dropdown */}
            {isHopsonMode && surprisesUnlocked && (
              <li className="relative" ref={loveDropdownRef}>
                <button
                  onClick={() => setIsLoveMenuOpen(!isLoveMenuOpen)}
                  className={`text-[13px] font-bold hover:text-accent transition-all py-1 px-2.5 rounded-lg flex items-center gap-1 cursor-pointer select-none uppercase tracking-wider ${
                    isLoveActive || isLoveMenuOpen
                      ? 'text-accent bg-accent/5 font-extrabold shadow-sm'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>Complictés 💖</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isLoveMenuOpen ? 'rotate-180 text-accent' : 'rotate-0'}`} />
                </button>

                <AnimatePresence>
                  {isLoveMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl py-2.5 z-50 text-left"
                    >
                      <div className="px-4 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                        <span className="text-[9px] font-mono font-black text-rose-500 uppercase tracking-widest block">
                          Espace Privé Mike & Dels
                        </span>
                      </div>
                      {loveDropdownLinks.map((link) => (
                        <a
                          key={link.name}
                          href={`#${link.id}`}
                          onClick={(e) => handleNavClick(link.id, e)}
                          className={`block px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition-all hover:bg-rose-500/5 ${
                            activeSection === link.id
                              ? 'text-accent bg-accent/5 font-black'
                              : 'text-slate-600 dark:text-slate-300 hover:text-accent dark:hover:text-accent'
                          }`}
                        >
                          {link.name}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )}
          </ul>

          <div className="h-4.5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          <ThemeSelector variant="header" />

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"
            aria-label="Toggle theme"
          >
            <motion.div
              whileTap={{ rotate: 180, scale: 0.8 }}
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </motion.div>
          </button>
        </nav>

        {/* Mobile / Tablet Nav Toggle */}
        <div className="lg:hidden flex items-center gap-3">
          <ThemeSelector variant="header" />

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <motion.div
              whileTap={{ rotate: 180, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </motion.div>
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-600 dark:text-slate-300 p-1 cursor-pointer"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg py-4 px-4 flex flex-col gap-3.5 border-b border-slate-150/40 dark:border-slate-800/40 max-h-[85vh] overflow-y-auto"
          >
            {mobileNavLinks.map((link) => (
              <a
                key={link.name}
                href={`#${link.id}`}
                onClick={(e) => handleNavClick(link.id, e)}
                className={`text-[13px] font-bold uppercase tracking-wider py-1.5 px-2 rounded-lg transition-all ${
                  activeSection === link.id
                    ? 'text-accent bg-accent/5 font-extrabold'
                    : 'text-slate-600 hover:text-accent dark:text-slate-305 dark:hover:text-accent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {link.name}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

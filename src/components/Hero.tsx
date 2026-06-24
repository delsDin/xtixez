import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Github, Linkedin, Mail, Download, Check, Loader2 } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useData } from '../context/DataContext';
import profileImg from '../data/profil.png';
import { downloadCV } from '../utils/cvDownloader';

const normalPhrases = [
  "Je transforme des données complexes en applications web performantes, élégantes et intuitives.",
  "Passionné par l'intersection entre l'ingénierie logicielle avancée et l'intelligence artificielle.",
  "Je conçois des architectures full-stack robustes et des modèles de Machine Learning scalables.",
  "Engagé à livrer des solutions de haute qualité avec un code propre, performant et optimisé.",
  "À la recherche permanente d'innovations technologiques pour résoudre des défis concrets."
];

export const Hero = () => {
  const { setActiveSection } = useNavigation();
  const { generalInfo } = useData();
  const [greeting, setGreeting] = useState('Bonjour, je suis');
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'generating' | 'success'>('idle');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  const activePhrases = generalInfo?.normal_phrases || normalPhrases;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 18) {
      setGreeting('Bonjour, je suis');
    } else if (hour >= 18 && hour < 24) {
      setGreeting('Bonsoir, je suis');
    } else {
      setGreeting('Je suis');
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % activePhrases.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activePhrases.length]);

  const handleNavClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveSection(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadCV = () => {
    if (downloadStatus !== 'idle') return;
    
    setDownloadStatus('generating');
    
    setTimeout(() => {
      try {
        downloadCV();
        setDownloadStatus('success');
        
        setTimeout(() => {
          setDownloadStatus('idle');
        }, 2000);
      } catch (err) {
        console.error(err);
        setDownloadStatus('idle');
      }
    }, 900);
  };

  return (
    <section id="home" className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center pb-10 px-4 overflow-hidden">
      <div className="container mx-auto max-w-5xl flex flex-col-reverse lg:flex-row items-center gap-12 relative z-10">
        <motion.div 
          className="flex-1 text-center lg:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-accent font-semibold tracking-wide uppercase text-sm mb-3">
            {greeting}
          </h2>
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-2 lg:whitespace-nowrap text-slate-900 dark:text-white">
            {generalInfo?.owner_name || 'Dels M. Dinla.'}
          </h1>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-medium mb-6 text-slate-500 dark:text-slate-400">
            {generalInfo?.owner_title_prefix || 'Dev Python'} <span className="text-accent font-bold">{generalInfo?.owner_title_suffix || '& Data Scientist'}</span>
          </h3>
          
          {/* Dynamic Carousel Phrases */}
          <div className="min-h-[5.5rem] md:min-h-[4rem] flex flex-col justify-start mb-8 max-w-xl mx-auto lg:mx-0">
            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-350 leading-relaxed font-sans">
              {activePhrases[currentPhraseIndex]}
            </p>
            
            {/* Carousel dots indicators */}
            <div className="flex items-center justify-center lg:justify-start gap-1.5 mt-4">
              {activePhrases.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPhraseIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentPhraseIndex === idx 
                      ? 'w-6 bg-accent'
                      : 'w-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                  aria-label={`Afficher la phrase ${idx + 1}`}
                  title={`Phrase ${idx + 1}`}
                />
              ))}
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 ml-2 animate-pulse select-none">
                auto-défilé
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
            <a 
              href="#contact" 
              onClick={(e) => handleNavClick('contact', e)}
              className="px-8 py-3 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20 w-full sm:w-auto text-center cursor-pointer"
            >
              Me contacter
            </a>
            
            <motion.button 
              onClick={handleDownloadCV}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`group flex items-center justify-center gap-2.5 px-8 py-3 rounded-full border text-sm font-medium transition-all duration-300 w-full sm:w-auto cursor-pointer shadow-md hover:shadow-lg ${
                downloadStatus === 'success'
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                  : downloadStatus === 'generating'
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  : 'bg-white/40 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-accent/40 text-slate-700 dark:text-slate-300 hover:text-accent dark:hover:text-accent'
              }`}
              disabled={downloadStatus === 'generating'}
            >
              {downloadStatus === 'generating' ? (
                <>
                  <span>Génération...</span>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                </>
              ) : downloadStatus === 'success' ? (
                <>
                  <span className="font-bold">CV Téléchargé !</span>
                  <Check className="w-4.5 h-4.5 text-emerald-500 stroke-[3px]" />
                </>
              ) : (
                <>
                  <span>Télécharger mon CV</span>
                  <Download className="w-4.5 h-4.5 group-hover:translate-y-0.5 transition-transform duration-200" />
                </>
              )}
            </motion.button>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-5">
            <a href={generalInfo?.github_url || "https://github.com/delsDin"} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-pink-500 transition-colors">
              <Github size={22} />
            </a>
            <a href={generalInfo?.linkedin_url || "https://www.linkedin.com/in/dels-dinla"} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-pink-500 transition-colors">
              <Linkedin size={22} />
            </a>
            <a href={`mailto:${generalInfo?.owner_email || "delsmarceldinla@gmail.com"}`} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-pink-500 transition-colors">
              <Mail size={22} />
            </a>
          </div>
        </motion.div>

        <motion.div 
          className="flex-1 flex justify-center lg:justify-end"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-80 lg:h-80">
            <div className="absolute inset-0 bg-gradient-to-tr rounded-full blur-2xl opacity-20 animate-pulse from-gradient-from to-gradient-to"></div>
            <img 
              src={generalInfo?.profile_picture_url || profileImg} 
              alt={generalInfo?.owner_name || "Dels M. Dinla."} 
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              className="relative z-10 w-full h-full object-cover rounded-full border-4 shadow-xl border-white dark:border-slate-800 pointer-events-none select-none"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

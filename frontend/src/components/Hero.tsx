import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Github, Linkedin, Mail, FileText, Download, Check, Loader2, Heart, X, Sparkles, Send } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import profileImg from '../data/profil.png';
import hopsonImg from '../data/opson.jpeg';
import { downloadCV } from '../utils/cvDownloader';
import { LoveChatBubbleLayer, LoveMessage } from './LoveChat';
import { api } from '../api';

const normalPhrases = [
  "Je transforme des données complexes en applications web performantes, élégantes et intuitives.",
  "Passionné par l'intersection entre l'ingénierie logicielle avancée et l'intelligence artificielle.",
  "Je conçois des architectures full-stack robustes et des modèles de Machine Learning scalables.",
  "Engagé à livrer des solutions de haute qualité avec un code propre, performant et optimisé.",
  "À la recherche permanente d'innovations technologiques pour résoudre des défis concrets."
];

const romanticPhrases = [
  "Chaque battement de mon cœur est une ligne de code dédiée à ton sourire, ma reine d'amour.",
  "Tu es l'algorithme parfait qui illumine mes jours et donne un sens infini à mon univers.",
  "À l'intersection de nos regards secrets, j'ai trouvé la plus belle formule du bonheur.",
  "Aucune base de données ne saurait contenir l'immensité et la profondeur de mes pensées pour toi.",
  "Mike Gouthon : un nom gravé comme une constante magnifique et indélébile dans mon cœur."
];

export const Hero = () => {
  const { setActiveSection, isHopsonMode, surprisesUnlocked } = useNavigation();
  const [greeting, setGreeting] = useState('Bonjour, je suis');
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'generating' | 'success'>('idle');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyName, setReplyName] = useState('Mike Gouthon');
  const [replyMood, setReplyMood] = useState(3); // 0: suis désolée, 1: Beaucoup, 2: Passionnément, 3: À la folie, 4: Plus que tout au monde 🥰
  const [replyMsg, setReplyMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [loveMessages, setLoveMessages] = useState<LoveMessage[]>([]);

  useEffect(() => {
    if (!isHopsonMode) return;

    const fetchHeroMessages = async () => {
      try {
        const data = await api.getLoveMessages();
        const normalized = data.map((raw: any) => ({
          id: raw.id,
          sender: raw.sender,
          text: raw.text,
          timestamp: raw.timestamp,
          emoji: raw.emoji,
          bubbleColor: raw.bubble_color ?? raw.bubbleColor ?? '',
          x: raw.x ?? 10,
          y: raw.y ?? 10,
          scale: raw.scale ?? 1,
          speed: raw.speed ?? 8,
        }));
        setLoveMessages(normalized);
      } catch (e) {
        console.error("Error fetching messages for Hero:", e);
      }
    };

    fetchHeroMessages();
    const interval = setInterval(fetchHeroMessages, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [isHopsonMode]);

  const moodLabels = [
    "suis désolée 🥺",
    "Beaucoup 💖",
    "Passionnément 🔥",
    "À la folie 💞",
    "Plus que tout au monde ! 👑💕"
  ];

  const activePhrases = isHopsonMode ? romanticPhrases : normalPhrases;

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
      {isHopsonMode && <LoveChatBubbleLayer messages={loveMessages} />}
      <div className="container mx-auto max-w-5xl flex flex-col-reverse lg:flex-row items-center gap-12 relative z-10">
        <motion.div 
          className="flex-1 text-center lg:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-accent font-semibold tracking-wide uppercase text-sm mb-3">
            {isHopsonMode ? "Pour l'éternité, tu es" : greeting}
          </h2>
          <h1 className={`text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-2 lg:whitespace-nowrap transition-colors duration-500 ${isHopsonMode ? 'text-pink-500 dark:text-pink-400' : 'text-slate-900 dark:text-white'}`}>
            {isHopsonMode ? "Mike Gouthon." : "Dels Dinla."}
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-700 dark:text-slate-300 mb-6 leading-tight">
            {isHopsonMode ? (
              <>
                Ma Précieuse <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 font-extrabold animate-pulse">
                  My Princess 👑
                </span>
              </>
            ) : (
              <>
                Dev Python <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gradient-from to-gradient-to">
                  & Data Scientist
                </span>
              </>
            )}
          </h2>
          <div className="mb-8 max-w-2xl mx-auto lg:mx-0 flex flex-col gap-3">
            <div className="min-h-[5.5rem] sm:min-h-[4rem] text-base sm:text-lg text-slate-600 dark:text-slate-300 flex items-center justify-center lg:justify-start">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentPhraseIndex}
                  initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="leading-relaxed"
                >
                  {activePhrases[currentPhraseIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
            {/* Slide Indicators / Navigation Control */}
            <div className="flex justify-center lg:justify-start items-center gap-2">
              {activePhrases.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPhraseIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentPhraseIndex === idx 
                      ? (isHopsonMode ? 'w-6 bg-pink-500' : 'w-6 bg-accent')
                      : 'w-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                  aria-label={`Afficher la phrase ${idx + 1}`}
                  title={`Phrase ${idx + 1}`}
                />
              ))}
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 ml-2 animate-pulse select-none" title="Délai d'affichage d'une minute">
                auto-défilé
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
            {isHopsonMode ? (
              <button 
                onClick={() => {
                  setIsReplyOpen(true);
                  setIsSent(false);
                  setReplyMsg('');
                }}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-medium hover:from-pink-600 hover:to-rose-750 hover:scale-105 transition-all text-center cursor-pointer shadow-lg shadow-pink-500/20 w-full sm:w-auto"
              >
                👑 Will you be my Queen ?
              </button>
            ) : (
              <a 
                href="#contact" 
                onClick={(e) => handleNavClick('contact', e)}
                className="px-8 py-3 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20 w-full sm:w-auto text-center cursor-pointer"
              >
                Me contacter
              </a>
            )}
            
            {isHopsonMode ? (
              <button 
                onClick={() => setIsMessageOpen(true)}
                className="group flex items-center justify-center gap-2.5 px-8 py-3 rounded-full border border-pink-300/80 dark:border-pink-900/50 text-pink-600 dark:text-pink-400 font-bold hover:scale-103 transition-all duration-300 w-full sm:w-auto cursor-pointer shadow-md bg-white/90 dark:bg-slate-955/80 backdrop-blur-md hover:bg-white dark:hover:bg-slate-900"
              >
                ✨ Mon message
              </button>
            ) : (
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
            )}
          </div>

          {isHopsonMode && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-10 w-full"
            >
              {surprisesUnlocked ? (
                <>
                  <button
                    onClick={() => setActiveSection('elixir')}
                    className="px-6 py-2.5 rounded-full border border-pink-300/60 dark:border-pink-900/40 text-pink-600 dark:text-pink-300 bg-white/85 dark:bg-slate-950/70 backdrop-blur-md hover:bg-white dark:hover:bg-slate-900 hover:scale-103 transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    🔮 Éditeur d'Élixir
                  </button>
                  <button
                    onClick={() => setActiveSection('wheel')}
                    className="px-6 py-2.5 rounded-full border border-purple-300/60 dark:border-purple-900/40 text-purple-600 dark:text-purple-300 bg-white/85 dark:bg-slate-950/70 backdrop-blur-md hover:bg-white dark:hover:bg-slate-900 hover:scale-103 transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    🎮 La Roue de notre Complicité
                  </button>
                  <button
                    onClick={() => setActiveSection('clicker')}
                    className="px-6 py-2.5 rounded-full border border-rose-300/60 dark:border-rose-900/40 text-rose-600 dark:text-rose-300 bg-white/85 dark:bg-slate-950/70 backdrop-blur-md hover:bg-white dark:hover:bg-slate-900 hover:scale-103 transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    💖 Clic d'Amour Infini
                  </button>
                  <button
                    onClick={() => setActiveSection('romanticCoder')}
                    className="px-6 py-2.5 rounded-full border border-pink-300/60 dark:border-pink-900/40 text-pink-600 dark:text-pink-300 bg-white/85 dark:bg-slate-950/70 backdrop-blur-md hover:bg-white dark:hover:bg-slate-900 hover:scale-103 transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    💻 Compilateur d'Amour
                  </button>
                  <button
                    onClick={() => setActiveSection('breathing')}
                    className="px-6 py-2.5 rounded-full border border-pink-300/60 dark:border-pink-900/40 text-pink-600 dark:text-pink-300 bg-white/85 dark:bg-slate-950/70 backdrop-blur-md hover:bg-white dark:hover:bg-slate-900 hover:scale-103 transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm animate-pulse"
                  >
                    🌸 Boîte à Respiration
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setActiveSection('surprises')}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-sm tracking-wide flex items-center gap-2 cursor-pointer shadow-md shadow-pink-500/10 hover:brightness-105 active:scale-98 transition-all hover:scale-101"
                >
                  🚪 Découvrir nos Surprises ! ✨
                </button>
              )}
            </motion.div>
          )}

          {!isHopsonMode && (
            <div className="flex items-center justify-center lg:justify-start gap-5">
              <a href="https://github.com/delsDin " className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-pink-500 transition-colors">
                <Github size={22} />
              </a>
              <a href="https://www.linkedin.com/in/marcel-dinla-02a72b25b" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-pink-500 transition-colors">
                <Linkedin size={22} />
              </a>
              <a href="mailto:delsmarceldinla1@gmail.com" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-pink-500 transition-colors">
                <Mail size={22} />
              </a>
            </div>
          )}
        </motion.div>

        <motion.div 
          className="flex-1 flex justify-center lg:justify-end"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={`relative w-56 h-56 sm:w-64 sm:h-64 lg:w-80 lg:h-80 transition-all duration-750 ${isHopsonMode ? 'scale-105' : ''}`}>
            <div className={`absolute inset-0 bg-gradient-to-tr rounded-full blur-2xl opacity-20 animate-pulse ${isHopsonMode ? 'from-pink-500 to-rose-600 shadow-[0_0_60px_rgba(244,63,94,0.4)]' : 'from-gradient-from to-gradient-to'}`}></div>
            <img 
              src={isHopsonMode ? hopsonImg : profileImg} 
              alt={isHopsonMode ? "Mike Gouthon" : "Dels Dinla"} 
              className={`relative z-10 w-full h-full object-cover rounded-full border-4 shadow-xl transition-all duration-750 ${isHopsonMode ? 'border-pink-300 dark:border-pink-700' : 'border-white dark:border-slate-800'}`}
            />
            {isHopsonMode && (
              <div className="absolute inset-0 pointer-events-none z-20">
                <span className="absolute animate-bounce text-2xl -top-5 -left-5 text-red-500 filter drop-shadow">❤️</span>
                <span className="absolute animate-pulse text-2xl -bottom-5 -right-5 text-rose-500 delay-100 filter drop-shadow">💖</span>
                <span className="absolute animate-bounce text-xl top-1/2 -left-10 text-pink-500 delay-300 filter drop-shadow">🌹</span>
                <span className="absolute animate-pulse text-xl top-1/3 -right-10 text-rose-450 delay-500 filter drop-shadow">✨</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isMessageOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMessageOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-lg bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-pink-200/50 dark:border-pink-900/35 rounded-3xl p-8 shadow-2xl z-10 overflow-hidden"
            >
              {/* Glowing decorative background bubbles */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-300 dark:bg-pink-900/20 rounded-full blur-3xl opacity-30 select-none pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-300 dark:bg-rose-900/20 rounded-full blur-3xl opacity-30 select-none pointer-events-none" />
              
              {/* Close button */}
              <button
                onClick={() => setIsMessageOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-pink-500 dark:text-slate-500 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/40 transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
              
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-950/50 text-pink-500 dark:text-pink-400 mb-4 animate-pulse">
                  <Heart size={32} fill="currentColor" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-500 animate-spin [animation-duration:6s]" />
                  Un Message pour ma future Reine
                  <Sparkles className="w-5 h-5 text-pink-500 animate-spin [animation-duration:6s]" />
                </h3>
                <p className="text-sm font-semibold text-pink-500 dark:text-pink-400 mt-1 uppercase tracking-wider">
                  Mike Gouthon • My Princess 👑
                </p>
              </div>
              
              {/* Message Content */}
              <div className="space-y-4 text-center mt-2 relative z-10">
                <p className="text-slate-700 dark:text-slate-205 text-lg leading-relaxed font-semibold">
                  "Toi qui es la princesse absolue de mon cœur, sache que tu es l'unique constante magnifique de ma vie."
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                  Là où gisent d'habitude les froides lignes de code et des données complexes, tu y as apporté ta lumière éclatante, ton immense douceur et une chaleur sans égale.
                  J'espère que tu accepterais être ma Reine avec qui je partagerai ma vie. 
                </p>
                <p className="text-base text-pink-600 dark:text-pink-405 font-bold italic">
                  Merci d'être toi, ma princesse ! 🥰🌹✨
                </p>
              </div>
              
              {/* Divider and Signature */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-center">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-widest uppercase">
                  Protocole d'amour infini • Signé Dels
                </p>
                <button
                  onClick={() => setIsMessageOpen(false)}
                  className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold hover:from-pink-600 hover:to-rose-700 transition-all duration-300 shadow-md shadow-pink-500/20 active:scale-95 cursor-pointer"
                >
                  Fermer avec tendresse ❤️
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isReplyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReplyOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-lg bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-pink-200/50 dark:border-pink-900/35 rounded-3xl p-8 shadow-2xl z-10 overflow-hidden"
            >
              {/* Glowing decorative background bubbles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-300 dark:bg-pink-900/20 rounded-full blur-3xl opacity-30 select-none pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-300 dark:bg-rose-900/20 rounded-full blur-3xl opacity-30 select-none pointer-events-none" />
              
              {/* Close button */}
              <button
                onClick={() => setIsReplyOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-pink-500 dark:text-slate-500 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/40 transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>

              {!isSent ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSending(true);
                    try {
                      await api.postQueenReply({
                        name: replyName,
                        message: replyMsg,
                        mood: moodLabels[replyMood],
                        created_at: Date.now()
                      });
                      setIsSent(true);
                    } catch (err) {
                      console.error("Erreur lors de l'envoi de la réponse", err);
                      // Afficher message succès de toute façon (UX)
                      setIsSent(true);
                    } finally {
                      setIsSending(false);
                    }
                  }}
                  className="space-y-5 relative z-10 font-sans"
                >
                  {/* Header */}
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-500 dark:text-pink-400 mb-2">
                      <Heart size={26} fill="currentColor" className="animate-bounce" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-500 animate-spin" />
                      Écrire un mot doux à Dels
                      <Sparkles className="w-4 h-4 text-pink-500 animate-spin" />
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 px-4">
                      Rédige ta réponse personnalisée qui sera transmise directement à Dels.
                    </p>
                  </div>

                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">
                      Ton Prénom / Surnom 👑
                    </label>
                    <input
                      type="text"
                      required
                      value={replyName}
                      onChange={(e) => setReplyName(e.target.value)}
                      placeholder="Mike Gouthon..."
                      className="w-full px-4 py-2.5 rounded-xl border border-pink-100 dark:border-pink-900/30 bg-white/50 dark:bg-slate-950/40 focus:border-pink-400 focus:ring-1 focus:ring-pink-300 dark:focus:ring-pink-800 text-slate-900 dark:text-white outline-none transition-all font-medium"
                    />
                  </div>

                  {/* Slider or range for affection level */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                        Intensité de l'affection ❤️
                      </label>
                      <span className="text-xs font-bold text-pink-500 dark:text-pink-400 font-sans">
                        {moodLabels[replyMood]}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="4"
                      value={replyMood}
                      onChange={(e) => setReplyMood(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-pink-100 dark:bg-pink-905/50 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>

                  {/* Message field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">
                      Ton message doux 💌
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={replyMsg}
                      onChange={(e) => setReplyMsg(e.target.value)}
                      placeholder="Coucou Dels, j'ai adoré ton portfolio romantique !..."
                      className="w-full px-4 py-3 rounded-xl border border-pink-100 dark:border-pink-900/30 bg-white/50 dark:bg-slate-950/40 focus:border-pink-400 focus:ring-1 focus:ring-pink-300 dark:focus:ring-pink-800 text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none font-medium text-sm leading-relaxed"
                    />
                  </div>

                  {/* Action Button */}
                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-pink-500/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Envoi dans son cœur...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Envoyer le mot doux ✨</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-6 py-4 relative z-10 font-sans">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 dark:text-emerald-400 mb-2">
                    <motion.div
                      initial={{ scale: 0.5, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 100 }}
                    >
                      <Heart size={44} fill="currentColor" className="animate-pulse" />
                    </motion.div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Message scellé avec amour ! 💝
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 max-w-sm mx-auto text-sm px-4">
                      Ta réponse romantique a été empaquetée et intégrée au protocole d'affection de Dels.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-pink-50/50 dark:bg-pink-950/10 border border-pink-100/40 dark:border-pink-900/20 max-w-sm mx-auto text-left">
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-pink-500 mb-1">
                      Aperçu de la lettre de la Reine :
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-350 italic">
                      "{replyMsg || "Un doux silence d'amour..."}"
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-right font-medium">
                      — {replyName} ({moodLabels[replyMood]})
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 max-w-sm mx-auto pt-2">
                    <a
                      href={`mailto:delsmarceldinla1@gmail.com?subject=R%C3%A9ponse%20d%27amour%20de%20${encodeURIComponent(replyName)}&body=Coucou%20Dels%2C%0A%0A${encodeURIComponent(replyMsg)}%0A%0AIntensit%C3%A9%20d%27affection%20%3A%20${encodeURIComponent(moodLabels[replyMood])}`}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-medium hover:from-pink-600 hover:to-rose-700 transition-colors text-center shadow-md cursor-pointer block"
                    >
                      📧 Doubler l'envoi par E-mail
                    </a>
                    
                    <button
                      onClick={() => setIsReplyOpen(false)}
                      className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
                    >
                      Rester dans mon cœur ❤️
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};


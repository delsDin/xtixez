import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigation } from '../context/NavigationContext';
import { 
  Heart, 
  Sparkles, 
  Gift, 
  ArrowRight, 
  Tv, 
  Code2, 
  Compass, 
  MousePointerClick, 
  Wind,
  Shuffle,
  ShieldAlert,
  Stars
} from 'lucide-react';

export const SurprisesPresentation = () => {
  const { setSurprisesUnlocked, setActiveSection } = useNavigation();
  const [isDoorOpen, setIsDoorOpen] = useState(false);

  const features = [
    {
      title: "🔮 Élixirs d'Amour",
      desc: "Assemblez des attributs suprêmes comme la dévotion, l'empathie ou l'intelligence pour distiller des philtres d'amour magiques aux rendus visuels et poétiques uniques.",
      color: "from-pink-500/20 via-rose-500/10 to-transparent",
      borderColor: "border-pink-300/30",
      textColor: "text-pink-600 dark:text-pink-400",
      icon: <Sparkles className="w-5 h-5 text-pink-500" />
    },
    {
      title: "🎮 Roue de la Complicité",
      desc: "Une roue du destin fluide et physique remplie de petits gages, de défis complices ou de douces attentions à tourner à deux.",
      color: "from-purple-500/20 via-indigo-500/10 to-transparent",
      borderColor: "border-purple-300/30",
      textColor: "text-purple-600 dark:text-purple-400",
      icon: <Shuffle className="w-5 h-5 text-purple-500" />
    },
    {
      title: "💖 Clic d'Amour Infini",
      desc: "Un clicker sensoriel qui génère une nuée de cœurs à chaque impulsion pour accumuler des points d'affection et décadenasser des messages secrets précieux.",
      color: "from-rose-500/20 via-red-500/10 to-transparent",
      borderColor: "border-rose-300/30",
      textColor: "text-rose-600 dark:text-rose-400",
      icon: <MousePointerClick className="w-5 h-5 text-rose-500" />
    },
    {
      title: "💻 Compilateur de Tendresse",
      desc: "Un terminal de code interactif en TypeScript où chaque bloc de code amoureux s'exécute pour calculer votre synergie et doper le compilateur.",
      color: "from-blue-500/20 via-indigo-500/10 to-transparent",
      borderColor: "border-blue-300/30",
      textColor: "text-blue-600 dark:text-blue-400",
      icon: <Code2 className="w-5 h-5 text-blue-500" />
    },
    {
      title: "🌸 Boîte de Respiration sync",
      desc: "Un havre de relaxation guidée par un expandeur d'ondes sinusoïdales pour vous détendre sous un rythme d'apaisement infini en phase avec l'univers.",
      color: "from-teal-500/20 via-emerald-500/10 to-transparent",
      borderColor: "border-teal-300/30",
      textColor: "text-teal-600 dark:text-teal-400",
      icon: <Wind className="w-5 h-5 text-teal-400" />
    }
  ];

  const handleUnlockSurprises = () => {
    setSurprisesUnlocked(true);
    setActiveSection('elixir'); // Automatically direct to the first awesome feature
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full flex items-center justify-center p-4 sm:p-6 md:p-10 select-none">
      <AnimatePresence mode="wait">
        {!isDoorOpen ? (
          /* SECTION 1: The Closed Door Interface */
          <motion.div
            key="closed-door"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative max-w-xl w-full text-center bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-pink-200/50 dark:border-pink-900/30 rounded-[2.5rem] p-8 sm:p-12 md:p-14 shadow-2xl flex flex-col items-center justify-center"
          >
            {/* Glowing orbs background */}
            <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-tr from-pink-500/10 via-rose-500/5 to-purple-500/10 blur-xl opacity-80 pointer-events-none" />

            {/* Sparkles particle aura around the door */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-pink-400/15 dark:bg-pink-900/10 rounded-full blur-3xl" />

            <div className="relative mb-8 text-6xl select-none animate-bounce [animation-duration:3s]">
              🚪
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                Section des <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Surprises</span> 🌸
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed max-w-md mx-auto mb-10 font-medium">
                Surnommée ma Reine par Dels, une suite d'applications romantiques et immersives a été codée sur mesure pour égayer vos journées. 
                <br />
                <span className="text-semibold text-pink-500 dark:text-pink-400 mt-2 block">
                  Êtes-vous prête à découvrir ce qui se cache derrière la porte ?
                </span>
              </p>
            </motion.div>

            {/* Pulsing interactive Door Trigger Button */}
            <motion.button
              whileHover={{ scale: 1.05, shadow: "0px 10px 30px rgba(244, 63, 94, 0.3)" }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsDoorOpen(true)}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-extrabold text-sm uppercase tracking-wider cursor-pointer shadow-lg transition-all duration-300 hover:brightness-105 active:brightness-95 [box-shadow:0_0_25px_rgba(244,63,94,0.15)] overflow-hidden"
            >
              {/* Internal shine animation effect */}
              <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:animate-[shine_0.8s_ease-in-out_infinite]" />
              
              <Gift size={16} fill="currentColor" className="animate-wiggle" />
              <span>Ouvrir la Porte des Surprises</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        ) : (
          /* SECTION 2: The Detailed Presentation Card (Menu of Unlocked Content) */
          <motion.div
            key="presentation-card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="relative max-w-4xl w-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-pink-250/50 dark:border-pink-900/30 rounded-[3rem] p-6 sm:p-10 md:p-12 shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Glowing ambient decorative backdrops */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Header / Intro section */}
            <div className="text-center mb-8 relative z-10 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest font-extrabold uppercase bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-200/50 dark:border-pink-901/30 mb-3.5">
                <Stars size={10} className="text-pink-500 animate-[spin_4s_linear_infinite]" />
                Présentation des Fonctionnalités
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-850 dark:text-white tracking-tight mb-3">
                Le Coffre aux Merveilles 🗝️
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-350 font-medium">
                Voici les 5 créations secrètes développées pour notre univers connecté. Cliquez sur le bouton ci-dessous pour toutes les intégrer sur votre tableau de bord permanent.
              </p>
            </div>

            {/* Features dynamic showcase grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10 mb-8">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className={`relative p-5 rounded-2xl bg-gradient-to-b ${feat.color} border ${feat.borderColor} transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group h-full`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-xl bg-white/80 dark:bg-slate-950/45 border border-slate-150 dark:border-slate-800 shadow-sm">
                        {feat.icon}
                      </div>
                      <h4 className={`text-sm font-black ${feat.textColor} tracking-tight`}>
                        {feat.title}
                      </h4>
                    </div>
                    <p className="text-[11.5px] leading-relaxed text-slate-550 dark:text-slate-400 font-medium font-sans">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}

              {/* Secret feature presentation box to complete 6-grid bento feel */}
              <div className="relative p-5 rounded-2xl bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/20 flex flex-col justify-center items-center text-center h-full sm:min-h-[140px] md:min-h-0">
                <Heart size={20} fill="currentColor" className="text-amber-500 animate-pulse mb-2.5" />
                <h5 className="text-[12px] font-extrabold text-amber-600 dark:text-amber-400 mb-1">
                  Amour et Code Intangible
                </h5>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider max-w-[180px]">
                  FONCTION INTIME : COMPILATION CONTINUELLE
                </p>
              </div>
            </div>

            {/* Unlock Action button */}
            <div className="relative z-10 text-center flex flex-col items-center justify-center border-t border-slate-150/40 dark:border-slate-800/40 pt-8 gap-3">
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                Prête à activer toutes ces surprises ?
              </p>
              
              <button
                onClick={handleUnlockSurprises}
                className="group inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-pink-500/20 active:scale-98 transition-all duration-300"
              >
                <span>Activer l'Accès Complet aux Modules</span>
                <Sparkles size={11} fill="currentColor" className="animate-spin [animation-duration:5s]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  HelpCircle, 
  Play, 
  Heart, 
  Trophy, 
  History, 
  Trash2,
  Volume2,
  VolumeX,
  Star
} from 'lucide-react';

interface WheelSector {
  text: string;
  emoji: string;
  color: string;
  textColor: string;
  description: string;
}

const SECTORS: WheelSector[] = [
  {
    text: "Un massage gratuit",
    emoji: "💆‍♀️",
    color: "#ec4899", // pink-500
    textColor: "#ffffff",
    description: "Accordé par Dels, avec de l'huile parfumée et toute la douceur du monde."
  },
  {
    text: "Un câlin de 2 minutes",
    emoji: "🤗",
    color: "#a855f7", // purple-500
    textColor: "#ffffff",
    description: "Un câlin serré, chaud et silencieux pour se ressourcer mutuellement."
  },
  {
    text: "Raconter une blague nulle",
    emoji: "😹",
    color: "#3b82f6", // blue-500
    textColor: "#ffffff",
    description: "Le perdant doit raconter la blague la plus idiote de son répertoire pour faire sourire l'autre !"
  },
  {
    text: "Un compliment secret",
    emoji: "🤫",
    color: "#10b981", // emerald-500
    textColor: "#ffffff",
    description: "Révéler un détail craquant que tu n'as encore jamais dit à voix haute."
  },
  {
    text: "Un bisou de 10 secondes",
    emoji: "💋",
    color: "#f43f5e", // rose-500
    textColor: "#ffffff",
    description: "Un baiser tendre et infini posé doucement là où tu le souhaites."
  },
  {
    text: "Un joker de vaisselle",
    emoji: "🍽️",
    color: "#f59e0b", // amber-500
    textColor: "#ffffff",
    description: "Le privilège de passer son tour lors du prochain repas en laissant l'autre s'occuper de tout !"
  },
  {
    text: "Un mot doux murmuré",
    emoji: "✨",
    color: "#84cc16", // lime-500
    textColor: "#ffffff",
    description: "Murmurer à l'oreille trois choses pour lesquelles tu es reconnaissant d'avoir l'autre dans ta vie."
  },
  {
    text: "Rendre un service mignon",
    emoji: "💌",
    color: "#6366f1", // indigo-500
    textColor: "#ffffff",
    description: "Préparer un café royal, masser les pieds ou border l'autre avec amour."
  }
];

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  duration: number;
  delay: number;
}

export const ComplicityWheel = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [winner, setWinner] = useState<WheelSector | null>(null);
  const [history, setHistory] = useState<Array<{ id: number; sector: WheelSector; date: string }>>(() => {
    try {
      const stored = localStorage.getItem('hopson_wheel_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [heartExplosion, setHeartExplosion] = useState<HeartParticle[]>([]);
  
  // Audio Context for synthetic sound effects
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem('hopson_wheel_history', JSON.stringify(history));
  }, [history]);

  // Init web audio safely on user action/spin
  const playTickSound = (frequency = 600, duration = 0.05) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency / 3, ctx.currentTime + duration);

      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Synth click block: Context non initialized", e);
    }
  };

  const playFanfareSound = () => {
    if (!soundEnabled) return;
    try {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          playTickSound(freq, 0.15);
        }, idx * 100);
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const spinTheWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);
    setHeartExplosion([]);

    // Select random sector
    const sectorCount = SECTORS.length;
    const chosenIndex = Math.floor(Math.random() * sectorCount);
    
    // Rotation calculations:
    // Make at least 5 complete spins (1800 degrees) plus the alignment to the winning slice.
    // The top pointing pointer requires aligning the slice correctly:
    // Slices go clockwise starting from east (0 deg) usually. To align chosenIndex to the TOP (270 deg)
    // we calculate the target angle correctly.
    const sliceAngle = 360 / sectorCount;
    // Angle representing center of the chosen index
    const sectorCenterAngle = (chosenIndex * sliceAngle) + (sliceAngle / 2);
    // Align with top (270 deg): offset = 270 - sectorCenterAngle
    const targetOffset = 270 - sectorCenterAngle;
    
    // Final Target Rotation (always positive forward)
    const extraSpins = 6 + Math.floor(Math.random() * 4); // 6 to 9 spins
    const totalNewRotation = (extraSpins * 360) + targetOffset;

    // Track sound tick frequency during animation transition
    let lastTickAngle = 0;
    const duration = 4000; // 4 seconds spin
    const startTime = performance.now();

    const animateTicks = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Cozy easeOutQuad or easeOutCubic curve
      const cubicProgress = 1 - Math.pow(1 - progress, 3.5);
      const angle = cubicProgress * totalNewRotation;
      
      setCurrentRotation(angle);

      // Trigger tick sound as each slice boundary rotates past the top
      const currentNotches = Math.floor(angle / sliceAngle);
      const lastNotches = Math.floor(lastTickAngle / sliceAngle);
      if (currentNotches > lastNotches) {
        playTickSound(650 - (progress * 250), 0.04);
      }
      lastTickAngle = angle;

      if (progress < 1) {
        requestAnimationFrame(animateTicks);
      } else {
        // Safe wrap winner index correction
        const rawFinalAngle = angle % 360;
        // Determine slice at 270 deg
        const finalWinnerIndex = Math.floor(((270 - rawFinalAngle + 360) % 360) / sliceAngle);
        const wonSector = SECTORS[finalWinnerIndex];
        
        setIsSpinning(false);
        setWinner(wonSector);
        playFanfareSound();

        // Spawn beautiful heart explosions
        const centerCoords = { x: 50, y: 50 }; // percentages for visual modal
        const heartColors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#fb7185', '#ff9494'];
        const explosion = Array.from({ length: 45 }).map((_, i) => ({
          id: Math.random() + i,
          x: 20 + Math.random() * 60,
          y: -10 - Math.random() * 20, // drift from top
          size: 10 + Math.random() * 22,
          color: heartColors[Math.floor(Math.random() * heartColors.length)],
          rotation: Math.random() * 360,
          duration: 3 + Math.random() * 2,
          delay: Math.random() * 0.5,
        }));
        setHeartExplosion(explosion);

        // Add to historic log
        const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        setHistory(prev => [{
          id: Math.random() * 100000,
          sector: wonSector,
          date: timestamp
        }, ...prev.slice(0, 19)]);
      }
    };

    requestAnimationFrame(animateTicks);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('hopson_wheel_history');
  };

  return (
    <section className="relative min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/10 dark:bg-[#070b13] flex flex-col items-center justify-start overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-purple-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-pink-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Floating Sparkles decorative */}
      <div className="absolute top-10 left-12 text-pink-300 dark:text-pink-900/30 animate-pulse pointer-events-none">
        <Star size={32} />
      </div>
      <div className="absolute bottom-20 right-16 text-purple-300 dark:text-purple-900/30 animate-pulse pointer-events-none">
        <Heart size={28} fill="currentColor" className="opacity-40" />
      </div>

      <div className="max-w-6xl w-full relative z-10 flex flex-col items-center">
        
        {/* Header content */}
        <div className="text-center mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-semibold mb-3 tracking-wider uppercase">
            <Sparkles size={12} className="animate-spin [animation-duration:12s]" />
            <span>Hopson Mode • Liens du Cœur</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-tight mb-4">
            La Roue de notre Complicité 🎮
          </h1>
          <p className="text-slate-600 dark:text-slate-350 text-sm sm:text-base">
            Fais tourner la roue sacrée du couple pour pimenter vos moments complices. Remporte un gage mignon, un privilège exclusif ou un mot doux scellé entre Dels 💖 et Mike 👑.
          </p>
        </div>

        {/* Content alignment grids */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full items-stretch">
          
          {/* LEFT: Spin physical wheel (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-purple-200/50 dark:border-purple-950/35 rounded-[2.5rem] p-6 sm:p-10 shadow-xl relative overflow-hidden">
            
            {/* Audio Toggle Top-Right */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                // Trigger context resume
                if (!audioCtxRef.current) {
                  audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                }
              }}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors z-30"
              title={soundEnabled ? "Couper le bip sonore" : "Activer le bip sonore"}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            <div className="relative flex flex-col items-center justify-center p-4">
              
              {/* Wheel Stand Pointer (Arrow pointing down at 270 degrees / TOP) */}
              <div className="absolute top-0 z-20 flex flex-col items-center">
                <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md">
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                </div>
                {/* Triangular pointer */}
                <div 
                  className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-rose-500 -mt-1 drop-shadow-md"
                />
              </div>

              {/* Physical Spin Wheel Circle using SVG */}
              <div className="w-72 h-72 sm:w-[22rem] sm:h-[22rem] md:w-[26rem] md:h-[26rem] rounded-full p-2 bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-850 dark:to-slate-950 border-4 border-slate-700/20 dark:border-slate-800/80 shadow-2xl relative flex items-center justify-center select-none overflow-hidden">
                
                <motion.div
                  id="complicity-wheel-spindle"
                  style={{ rotate: currentRotation }}
                  className="w-full h-full rounded-full relative"
                >
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <defs>
                      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="0.5" stdDeviation="0.4" floodOpacity="0.4" />
                      </filter>
                    </defs>

                    {/* Generate colored sectors */}
                    {SECTORS.map((sector, idx) => {
                      const numSectors = SECTORS.length;
                      const angle = 360 / numSectors;
                      const startAngle = idx * angle;
                      const endAngle = startAngle + angle;
                      
                      // Convert coordinates
                      const rad = (deg: number) => (deg * Math.PI) / 180;
                      const x1 = 50 + 48 * Math.cos(rad(startAngle));
                      const y1 = 50 + 48 * Math.sin(rad(startAngle));
                      const x2 = 50 + 48 * Math.cos(rad(endAngle));
                      const y2 = 50 + 48 * Math.sin(rad(endAngle));

                      // Arc path string
                      const d = `M 50 50 L ${x1} ${y1} A 48 48 0 0 1 ${x2} ${y2} Z`;

                      // Calculate label position
                      const labelAngle = startAngle + (angle / 2);
                      const labelRadius = 32; // distance from center
                      const lx = 50 + labelRadius * Math.cos(rad(labelAngle));
                      const ly = 50 + labelRadius * Math.sin(rad(labelAngle));

                      return (
                        <g key={idx}>
                          {/* Colored Wheel Piece */}
                          <path
                            d={d}
                            fill={sector.color}
                            className="transition-all hover:brightness-105"
                            stroke="#ffffff"
                            strokeWidth="0.4"
                            opacity="0.9"
                          />
                          
                          {/* Floating Emoji / Label Text */}
                          <g transform={`translate(${lx}, ${ly}) rotate(${labelAngle + 90})`} style={{ filter: 'url(#shadow)' }}>
                            <text
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill={sector.textColor}
                              fontSize="4.2"
                              fontFamily="sans-serif"
                              fontWeight="bold"
                              className="select-none pointer-events-none fill-white tracking-widest uppercase opacity-95"
                            >
                              {sector.emoji}
                            </text>
                            {/* Text underneath for larger screens */}
                            <text
                              y="5"
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill={sector.textColor}
                              fontSize="1.9"
                              fontFamily="sans-serif"
                              fontWeight="600"
                              className="hidden sm:block select-none pointer-events-none fill-white/90"
                            >
                              {sector.text.substring(0, 15)}...
                            </text>
                          </g>
                        </g>
                      );
                    })}

                    {/* Ring outline */}
                    <circle cx="50" cy="50" r="48" fill="none" stroke="#e2e8f0" strokeWidth="0.5" opacity="0.15" />
                  </svg>
                </motion.div>

                {/* Golden/White Shiny Center Spindle Hub Button */}
                <button
                  id="spin-center-button"
                  onClick={spinTheWheel}
                  disabled={isSpinning}
                  className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-amber-400 hover:scale-105 active:scale-95 transition-all text-white font-extrabold text-sm border-4 border-white dark:border-slate-900 shadow-2xl flex flex-col items-center justify-center cursor-pointer select-none disabled:opacity-90 z-10"
                >
                  <motion.div
                    animate={isSpinning ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="flex flex-col items-center justify-center gap-1"
                  >
                    <Play size={18} fill="currentColor" className="ml-0.5" />
                    <span className="text-[10px] tracking-widest uppercase font-black">
                      {isSpinning ? "Tourne" : "Lancer"}
                    </span>
                  </motion.div>
                </button>

                {/* Subtle light decoration dots around border */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angleDeg = i * (360 / 12);
                  const rad = (angleDeg * Math.PI) / 180;
                  return (
                    <div
                      key={i}
                      style={{
                        top: `calc(50% + ${Math.sin(rad) * 47.5}% - 4px)`,
                        left: `calc(50% + ${Math.cos(rad) * 47.5}% - 4px)`,
                      }}
                      className="absolute w-2 h-2 rounded-full bg-white border border-slate-400/50 dark:border-slate-600 shadow-sm animate-pulse pointer-events-none"
                    />
                  );
                })}
              </div>

              {/* Instuction footer */}
              <div className="mt-8 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <HelpCircle size={14} className="text-purple-500" />
                <span>Clique sur <b>LANCER</b> ou sur le centre pour activer la rotation.</span>
              </div>

            </div>

          </div>

          {/* RIGHT: Winner Modal / History Cards (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            
            {/* Winner output banner */}
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-purple-200/50 dark:border-purple-950/35 rounded-[2.5rem] p-6 sm:p-8 shadow-xl text-center relative overflow-hidden flex-grow flex flex-col justify-center min-h-[16rem]">
              
              <AnimatePresence mode="wait">
                {winner ? (
                  <motion.div
                    key="won"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 dark:bg-rose-950/40 text-rose-500 rounded-full text-[10px] font-extrabold uppercase tracking-widest animate-bounce">
                      <Trophy size={12} />
                      <span>Gage Remporté !</span>
                    </div>

                    <div className="text-5xl mt-2 select-none">{winner.emoji}</div>
                    
                    <div>
                      <h4 
                        className="text-2xl font-black leading-tight tracking-tight mt-1"
                        style={{ color: winner.color }}
                      >
                        {winner.text}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-350 text-sm mt-3 px-2 leading-relaxed text-justify sm:text-center">
                        {winner.description}
                      </p>
                    </div>

                    <div className="pt-2">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        * Le gage doit être honoré avec le sourire par l'un de vous deux !
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-8 space-y-3"
                  >
                    <div className="p-4 rounded-3xl bg-purple-50 dark:bg-purple-950/20 border border-purple-100/50 dark:border-purple-900/30 text-purple-500">
                      <Trophy size={32} />
                    </div>
                    <h4 className="text-lg font-extrabold text-slate-800 dark:text-white">
                      En attente du tirage...
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
                      Laisse le destin guider ton affection. Une fois la roue stabilisée, le gage à honorer apparaîtra ici avec tous ses détails romantiques.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* History tracking list */}
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-purple-200/50 dark:border-purple-950/35 rounded-[2.5rem] p-6 sm:p-8 shadow-xl flex flex-col justify-between max-h-[18rem]">
              
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-purple-100/30 dark:border-purple-900/20">
                <h4 className="text-sm font-black text-slate-850 dark:text-slate-200 flex items-center gap-2">
                  <History size={16} className="text-purple-500" />
                  Derniers Gages Tirés
                </h4>
                
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="p-1 px-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-[10px] font-bold text-red-500 dark:text-red-400 cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={11} />
                    Effacer
                  </button>
                )}
              </div>

              <div className="flex-grow overflow-y-auto space-y-2.5 pr-1 max-h-[10rem]">
                {history.length > 0 ? (
                  history.map((item) => (
                    <div 
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/30 border border-slate-150 dark:border-slate-850 flex items-center justify-between text-xs gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{item.sector.emoji}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[140px] sm:max-w-[180px]">
                          {item.sector.text}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">
                          {item.date}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs text-center flex flex-col items-center justify-center gap-1.5">
                    <span>Aucun gage dans l'historique de Dels & Mike.</span>
                    <span className="text-[10px] text-slate-400/70">Fais tourner la roue pour commencer !</span>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Celebration floating heart particles drifting upward overlay */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
        <AnimatePresence>
          {heartExplosion.map((heart) => (
            <motion.div
              key={heart.id}
              initial={{ 
                opacity: 0,
                y: "110vh",
                x: `${heart.x}vw`,
                scale: 0.1,
                rotate: heart.rotation 
              }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                y: "-10vh",
                scale: [0.5, 1.2, 1, 0.7],
                rotate: heart.rotation + 180
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: heart.duration,
                delay: heart.delay,
                ease: "linear"
              }}
              style={{ color: heart.color }}
              className="absolute"
            >
              <Heart 
                size={heart.size} 
                fill="currentColor" 
                style={{ filter: 'drop-shadow(0 0 5px rgba(244, 63, 94, 0.4))' }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </section>
  );
};

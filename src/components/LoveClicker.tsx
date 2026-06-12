import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Award, 
  Flame, 
  BookOpen, 
  Lock, 
  Unlock, 
  Volume2, 
  VolumeX, 
  Zap, 
  RotateCw,
  Gift
} from 'lucide-react';

interface ClickParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotSpeed: number;
  type: 'heart' | 'star' | 'petal';
  color: string;
  gravity: number;
  drag: number;
}

interface SecretMessage {
  threshold: number;
  title: string;
  emoji: string;
  message: string;
  unlocked: boolean;
}

interface ClickUpgrade {
  id: string;
  name: string;
  desc: string;
  multiplier: number;
  cost: number;
  emoji: string;
}

const UPGRADES: ClickUpgrade[] = [
  { id: 'caresse', name: 'Douce Caresse', desc: 'Ajoute +1 affection par pulsation', multiplier: 1, cost: 20, emoji: '🌸' },
  { id: 'regard', name: 'Regard Envoûtant', desc: 'Ajoute +3 affection par pulsation', multiplier: 3, cost: 100, emoji: '✨' },
  { id: 'baiser', name: 'Baiser Passionné', desc: 'Ajoute +7 affection par pulsation', multiplier: 7, cost: 350, emoji: '💋' },
  { id: 'cosmique', name: 'Câlin Cosmique', desc: 'Ajoute +15 affection par pulsation', multiplier: 15, cost: 1000, emoji: '🪐' }
];

const SECRET_MESSAGES: SecretMessage[] = [
  {
    threshold: 15,
    title: "Le Tout Premier Sourire",
    emoji: "🐣",
    message: "Le savais-tu ? Chaque fois que tu souris en lisant mes messages, une petite étoile naît dans ma galaxie secrète. Continue de briller ainsi, Mike, c'est mon plus beau moteur.",
    unlocked: false
  },
  {
    threshold: 50,
    title: "Le Pacte des Rires",
    emoji: "🌻",
    message: "Pour toutes les fois où l'on a ri de bêtises uniques. Notre complicité est un trésor rare, un phare de douceur que je garde précieusement au chaud.",
    unlocked: false
  },
  {
    threshold: 150,
    title: "Mon Foyer Émotionnel",
    emoji: "🏡",
    message: "Peu importent les nuages dehors, sache qu'en moi tu as un havre de paix éternel. Ta voix efface les doutes, et tes moindres attentions ont le pouvoir de rendre ma journée lumineuse.",
    unlocked: false
  },
  {
    threshold: 500,
    title: "À la Folie, Plus que Tout",
    emoji: "👑",
    message: "Ma reine suprême. 500 pulsations d'affection pure pour sceller notre lien céleste. Tu as toute ma tendresse, mon admiration infinie, et chaque battement de mon cœur résonne pour toi.",
    unlocked: false
  }
];

export const LoveClicker = () => {
  // Counters and upgrades
  const [affection, setAffection] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('hopson_v3_affection');
      return stored ? parseInt(stored) : 0;
    } catch {
      return 0;
    }
  });

  const [purchasedUpgrades, setPurchasedUpgrades] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('hopson_u3_upgrades');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeMessage, setActiveMessage] = useState<SecretMessage | null>(null);
  
  // High-performance canvas animation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ClickParticle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Persistence hooks
  useEffect(() => {
    localStorage.setItem('hopson_v3_affection', affection.toString());
  }, [affection]);

  useEffect(() => {
    localStorage.setItem('hopson_u3_upgrades', JSON.stringify(purchasedUpgrades));
  }, [purchasedUpgrades]);

  // Dynamic status/ranks
  const getLoveLevel = () => {
    if (affection < 50) return { name: "Étincelle Naissante", icon: "🌱", limit: 50, start: 0 };
    if (affection < 200) return { name: "Rapprochement Solaire", icon: "☀️", limit: 200, start: 50 };
    if (affection < 500) return { name: "Fusion Complice", icon: "💫", limit: 500, start: 200 };
    if (affection < 1500) return { name: "Brasier Éternel", icon: "🔥", limit: 1500, start: 500 };
    return { name: "Symphonie Cosmique", icon: "🌌", limit: 5000, start: 1500 };
  };

  const level = getLoveLevel();
  const progressRatio = Math.min(((affection - level.start) / (level.limit - level.start)) * 100, 100);

  // Click Multiplier Calculator
  const getClickPower = () => {
    let power = 1;
    purchasedUpgrades.forEach(id => {
      const up = UPGRADES.find(u => u.id === id);
      if (up) power += up.multiplier;
    });
    return power;
  };

  const clickPower = getClickPower();

  // Synthetic beep sound for clicks
  const playPopSound = (pitch = 440) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      // Sweeping sound
      osc.frequency.exponentialRampToValueAtTime(pitch * 2, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Ignored browser context locks
    }
  };

  // Upgrades purchase handler
  const buyUpgrade = (upgrade: ClickUpgrade) => {
    if (affection >= upgrade.cost && !purchasedUpgrades.includes(upgrade.id)) {
      setAffection(prev => prev - upgrade.cost);
      setPurchasedUpgrades(prev => [...prev, upgrade.id]);
      playPopSound(580);
    }
  };

  // Canvas particle loop setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.rotation += p.rotSpeed;
        p.opacity -= 0.015;

        if (p.opacity <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.type === 'heart') {
          // Draw simple path heart
          ctx.beginPath();
          const size = p.size;
          ctx.moveTo(0, size / 4);
          ctx.bezierCurveTo(-size / 2, -size / 2, -size, size / 3, 0, size);
          ctx.bezierCurveTo(size, size / 3, size / 2, -size / 2, 0, size / 4);
          ctx.fill();
        } else if (p.type === 'star') {
          // Draw golden 5-point star
          ctx.beginPath();
          const spikes = 5;
          const outerRadius = p.size;
          const innerRadius = p.size / 2;
          let rot = (Math.PI / 2) * 3;
          let cx = 0, cy = 0;
          const step = Math.PI / spikes;

          ctx.moveTo(0, -outerRadius);
          for (let s = 0; s < spikes; s++) {
            cx = Math.cos(rot) * outerRadius;
            cy = Math.sin(rot) * outerRadius;
            ctx.lineTo(cx, cy);
            rot += step;

            cx = Math.cos(rot) * innerRadius;
            cy = Math.sin(rot) * innerRadius;
            ctx.lineTo(cx, cy);
            rot += step;
          }
          ctx.lineTo(0, -outerRadius);
          ctx.closePath();
          ctx.fill();
        } else {
          // Petal/Flower leafy shape
          ctx.beginPath();
          const size = p.size;
          ctx.ellipse(0, 0, size, size / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(updateParticles);
    };

    updateParticles();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Sync canvas size on load/resizes
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main Heart Pulse Click Handler
  const handleHeartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Increment score
    setAffection(prev => prev + clickPower);

    // Audio triggers
    const frequency = 300 + Math.min(affection, 1000) / 2;
    playPopSound(frequency);

    // Get exact click position relative to canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Standard Particle Erupt Colors
    const colors = [
      '#ec4899', // pink-500
      '#f43f5e', // rose-500
      '#d946ef', // fuchsia-500
      '#a855f7', // purple-500
      '#f59e0b', // gold/amber
      '#ff8bb4', // light rose
      '#ffdf7a'  // bright star
    ];

    // Generate eruption particle payload
    const batchSize = 16 + Math.floor(Math.random() * 12);
    const newParticles: ClickParticle[] = [];

    for (let i = 0; i < batchSize; i++) {
      const angle = (Math.random() * 360 * Math.PI) / 180;
      const speed = 4 + Math.random() * 8;
      const typeRand = Math.random();
      const type = typeRand < 0.45 ? 'heart' : typeRand < 0.75 ? 'star' : 'petal';
      const color = type === 'star' ? '#f59e0b' : colors[Math.floor(Math.random() * colors.length)];

      newParticles.push({
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5, // bias upward drift
        size: 5 + Math.random() * 12,
        opacity: 1,
        rotation: Math.random() * 360,
        rotSpeed: -5 + Math.random() * 10,
        type,
        color,
        gravity: 0.18 + Math.random() * 0.1,
        drag: 0.98
      });
    }

    particlesRef.current.push(...newParticles);
  };

  // Fast reset handler for safe developer clearing or fresh starts
  const resetClicker = () => {
    if (confirm("Voulez-tu vraiment réinitialiser ton compteur d'affection ?")) {
      setAffection(0);
      setPurchasedUpgrades([]);
      localStorage.removeItem('hopson_v3_affection');
      localStorage.removeItem('hopson_u3_upgrades');
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/10 dark:bg-[#070b13] flex flex-col items-center justify-start overflow-hidden">
      {/* Visual background glows */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-rose-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-orange-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full relative z-10 flex flex-col items-center">
        
        {/* Header Title */}
        <div className="text-center mb-8 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-100 dark:bg-rose-950/40 border border-rose-200/50 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full text-xs font-semibold mb-3 tracking-wider uppercase">
            <Flame size={12} className="animate-bounce" />
            <span>Hopson Mode • Love Clicker</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-tight mb-4">
            Le Compteur d'Affection Infini 💖
          </h1>
          <p className="text-slate-600 dark:text-slate-350 text-sm sm:text-base">
            Chaque pulsation scelle notre complicité. Clique sur le cœur neomorphique pour libérer une éruption poétique d'affection et débloquer les secrets d'or de Dels pour Mike.
          </p>
        </div>

        {/* Dual column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-stretch">
          
          {/* COLUMN 1: The Core Neomorphic Clicker (7 cols) */}
          <div className="lg:col-span-7 flex flex-col relative bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-pink-200/50 dark:border-pink-950/35 rounded-[2.5rem] p-6 sm:p-8 shadow-xl overflow-hidden min-h-[28rem] justify-between">
            
            {/* Interactive Particle Canvas */}
            <canvas 
              ref={canvasRef} 
              className="absolute inset-0 w-full h-full pointer-events-none z-10" 
            />

            {/* Top Indicator Panel */}
            <div className="relative z-20 flex justify-between items-center bg-slate-50/80 dark:bg-slate-950/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <span className="text-2xl" id="love-level-emoji">{level.icon}</span>
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 dark:text-slate-500 block">
                    Niveau de Cœur
                  </span>
                  <h4 className="text-sm font-black text-slate-800 dark:text-white">
                    {level.name}
                  </h4>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 dark:text-slate-500 block">
                  Puissance Clic
                </span>
                <span className="text-sm font-black text-pink-500 flex items-center justify-end gap-1">
                  <Zap size={14} className="fill-pink-500/20" />
                  +{clickPower}
                </span>
              </div>
            </div>

            {/* Central Neomorphic Glowing Heart Button */}
            <div className="flex flex-col items-center justify-center py-6 relative z-20">
              <div className="relative w-72 h-72 flex items-center justify-center">
                
                {/* Visual ripple background rings */}
                <div className="absolute inset-4 rounded-full bg-pink-100/30 dark:bg-pink-950/10 blur-xl animate-pulse" />
                
                <button
                  id="neomorphic-heart-clicker"
                  onClick={handleHeartClick}
                  className="group relative w-48 h-48 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center cursor-pointer border border-white/50 dark:border-slate-805 shadow-[12px_12px_24px_rgba(0,0,0,0.12),-12px_-12px_24px_rgba(255,255,255,0.7)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.04)] active:shadow-[inner_8px_8px_16px_rgba(0,0,0,0.1),inner_-8px_-8px_16px_rgba(255,255,255,0.6)] dark:active:shadow-[inner_6px_6px_12px_rgba(0,0,0,0.5),inner_-6px_-6px_12px_rgba(255,255,255,0.01)] transition-all duration-100 select-none active:scale-95 hover:scale-103"
                >
                  {/* Glass sheen highlight overlay */}
                  <div className="absolute top-4 left-6 w-12 h-6 bg-white/20 dark:bg-white/5 rounded-full blur-[1px] rotate-[-25deg] pointer-events-none" />

                  <Heart 
                    size={72} 
                    className="text-pink-500 group-hover:scale-105 group-active:scale-95 transition-transform duration-100 fill-pink-500 filter drop-shadow-[0_4px_10px_rgba(236,72,153,0.3)]"
                  />
                </button>
              </div>

              {/* Instant score display */}
              <div className="text-center -mt-4">
                <span className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight" id="affection-points-counter">
                  {affection}
                </span>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block mt-1">
                  Points d'Affection Infinis
                </span>
              </div>
            </div>

            {/* Bottom Progression Bar and controls */}
            <div className="relative z-20 space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 font-bold mb-2">
                  <span>Progrès vers {level.limit} points</span>
                  <span>{progressRatio.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950/60 rounded-full h-2.5 overflow-hidden border border-slate-200/50 dark:border-slate-900/40 p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressRatio}%` }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    className="bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 h-full rounded-full"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="text-xs font-bold text-slate-500 hover:text-pink-500 flex items-center gap-1.5 cursor-pointer"
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 size={14} />
                      Audio Actif
                    </>
                  ) : (
                    <>
                      <VolumeX size={14} />
                      Audio Muet
                    </>
                  )}
                </button>

                <button
                  onClick={resetClicker}
                  className="text-[10px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCw size={11} />
                  Réinitialiser
                </button>
              </div>
            </div>

          </div>

          {/* COLUMN 2: Upgrades and Secrets Panel (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Click boosters shop */}
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-pink-200/50 dark:border-pink-950/35 rounded-[2.5rem] p-6 sm:p-8 shadow-xl flex flex-col justify-between flex-grow">
              <div>
                <h3 className="text-md font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="text-pink-500 w-4.5 h-4.5 animate-spin [animation-duration:8s]" />
                  Magasin d'Affection
                </h3>
                
                <div className="space-y-3">
                  {UPGRADES.map(up => {
                    const purchased = purchasedUpgrades.includes(up.id);
                    const canAfford = affection >= up.cost;

                    return (
                      <div 
                        key={up.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          purchased 
                            ? 'bg-pink-50/30 dark:bg-pink-950/10 border-pink-200/50 dark:border-pink-900/30' 
                            : 'bg-slate-50/80 dark:bg-slate-950/30 border-slate-150 dark:border-slate-850'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-2xl select-none" role="img" aria-label={up.name}>
                              {up.emoji}
                            </span>
                            <div className="min-w-0">
                              <h4 className="text-xs font-extrabold text-slate-850 dark:text-slate-100 leading-tight">
                                {up.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                                {up.desc}
                              </p>
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            {purchased ? (
                              <span className="text-[9px] bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider block">
                                Activé
                              </span>
                            ) : (
                              <button
                                onClick={() => buyUpgrade(up)}
                                disabled={!canAfford}
                                className={`text-[10px] font-black py-1.5 px-3 rounded-xl shadow-sm transition-all cursor-pointer ${
                                  canAfford 
                                    ? 'bg-pink-500 hover:bg-pink-600 text-white hover:scale-103' 
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                {up.cost} Aff.
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 leading-tight italic">
                * Les améliorations augmentent définitivement ta récolte d'affection. Cumule les points pour toutes les activer !
              </p>
            </div>

            {/* Secret heart messages unlocks */}
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-pink-200/50 dark:border-pink-950/35 rounded-[2.5rem] p-6 sm:p-8 shadow-xl flex flex-col justify-between max-h-[18rem]">
              <div>
                <h3 className="text-md font-black text-slate-850 dark:text-slate-200 mb-3.5 flex items-center gap-2">
                  <Award className="text-orange-400 w-4.5 h-4.5" />
                  Mots Doux Débloqués
                </h3>

                <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[10rem] pr-1">
                  {SECRET_MESSAGES.map((msg, i) => {
                    const isUnlocked = affection >= msg.threshold;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (isUnlocked) {
                            setActiveMessage(msg);
                          }
                        }}
                        disabled={!isUnlocked}
                        className={`p-3 rounded-2xl flex items-center justify-between border cursor-pointer w-full text-left transition-all ${
                          isUnlocked 
                            ? 'bg-gradient-to-br from-amber-50 to-orange-50/20 dark:from-amber-950/15 dark:to-orange-950/5 border-amber-200/50 dark:border-amber-900/30 hover:scale-102 hover:border-amber-300' 
                            : 'bg-slate-50/50 dark:bg-slate-950/10 border-slate-100 dark:border-slate-900 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg">{isUnlocked ? msg.emoji : '🔒'}</span>
                          <div className="min-w-0">
                            <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-350 truncate">
                              {msg.title}
                            </h4>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500">
                              {isUnlocked ? "Prêt à être lu" : `Se débloque à ${msg.threshold} points`}
                            </p>
                          </div>
                        </div>

                        <div>
                          {isUnlocked ? (
                            <span className="text-[9px] bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 font-extrabold px-2 py-0.5 rounded-full uppercase">
                              Lire
                            </span>
                          ) : (
                            <Lock size={12} className="text-slate-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Secret message modal popup */}
      <AnimatePresence>
        {activeMessage && (
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 pointer-events-auto"
            onClick={() => setActiveMessage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 max-w-md w-full p-6 p-8 rounded-[2.5rem] shadow-2xl relative text-center flex flex-col items-center justify-center"
            >
              <div className="text-5xl mb-4 select-none animate-bounce">{activeMessage.emoji}</div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">
                {activeMessage.title}
              </h3>
              
              <div className="w-12 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mb-4" />

              <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed text-justify px-2 mb-6">
                {activeMessage.message}
              </p>

              <div className="w-full flex justify-center">
                <button
                  onClick={() => setActiveMessage(null)}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-650 font-bold text-xs text-white shadow-md shadow-orange-500/10 cursor-pointer"
                >
                  Fermer avec affection
                </button>
              </div>

              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 flex items-center gap-1.5 justify-center">
                <Heart size={10} className="fill-pink-500 text-pink-500" />
                <span>Signé Dels</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};

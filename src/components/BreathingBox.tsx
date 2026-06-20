import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wind, 
  Play, 
  Square, 
  Volume2, 
  VolumeX, 
  Activity, 
  Clock, 
  Flame, 
  Smile, 
  RotateCw,
  Heart
} from 'lucide-react';

// Meditation patterns
interface MeditationPattern {
  id: string;
  name: string;
  desc: string;
  inhale: number;  // seconds
  holdFull: number;
  exhale: number;
  holdEmpty: number;
}

const PATTERNS: MeditationPattern[] = [
  { 
    id: "coherence", 
    name: "Cohérence Cardiaque 5-5", 
    desc: "Harmonise le rythme cardiaque pour chasser le stress instantanément.",
    inhale: 5, 
    holdFull: 0, 
    exhale: 5, 
    holdEmpty: 0 
  },
  { 
    id: "box", 
    name: "Respiration Carrée 4-4-4-4", 
    desc: "Utilisée par les maîtres Zen pour focaliser l'esprit et stabiliser le système nerveux.",
    inhale: 4, 
    holdFull: 4, 
    exhale: 4, 
    holdEmpty: 4 
  },
  { 
    id: "relax", 
    name: "Sommeil Royal / Anxiété 4-7-8", 
    desc: "Un cycle ultra-décontractant pour s'endormir de bonheur ou apaiser l'esprit.",
    inhale: 4, 
    holdFull: 7, 
    exhale: 8, 
    holdEmpty: 0 
  }
];

export const BreathingBox = () => {
  const [activePatternId, setActivePatternId] = useState<string>("coherence");
  const [sessionDuration, setSessionDuration] = useState<number>(60); // seconds: 60, 120, 300
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Realtime meditation states
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'holdFull' | 'exhale' | 'holdEmpty'>('inhale');
  const [phaseProgress, setPhaseProgress] = useState<number>(0); // 0 to 1 inside current phase
  const [completedSessions, setCompletedSessions] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('hopson_zen_sessions');
      return stored ? parseInt(stored) : 0;
    } catch {
      return 0;
    }
  });

  // Background Interactive Wave Rendering
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const waveTimeRef = useRef<number>(0);
  
  // Custom synthesizer wave references
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const activePattern = PATTERNS.find(p => p.id === activePatternId) || PATTERNS[0];

  // Save session count in local storage
  useEffect(() => {
    localStorage.setItem('hopson_zen_sessions', completedSessions.toString());
  }, [completedSessions]);

  // Audio Context synth creator/activator
  const initSynth = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create a smooth, warm triangle oscillator representing calming organic breeze
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, ctx.currentTime); // very low bass drone

      // Filter settings for warm tone
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();

      oscRef.current = osc;
      gainNodeRef.current = gain;
    } catch (e) {
      console.warn("Could not load ambient synth engine:", e);
    }
  };

  const stopSynth = () => {
    try {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // Adjust Synthesizer Pitch and Gain smoothly in real-time according to breathing cycle
  useEffect(() => {
    if (!isRunning || !soundEnabled || !gainNodeRef.current || !oscRef.current) {
      stopSynth();
      return;
    }

    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const now = ctx.currentTime;
      
      if (currentPhase === 'inhale') {
        // Frequency sweep upward from 140Hz up to 210Hz (gentle rise)
        const targetFreq = 140 + (phaseProgress * 70);
        oscRef.current.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.1);
        // Fade sound in nicely
        const targetVol = 0.08 + (phaseProgress * 0.12);
        gainNodeRef.current.gain.linearRampToValueAtTime(targetVol, now + 0.1);
      } else if (currentPhase === 'holdFull') {
        // Warm constant light tone
        oscRef.current.frequency.exponentialRampToValueAtTime(210, now + 0.1);
        gainNodeRef.current.gain.linearRampToValueAtTime(0.20, now + 0.1);
      } else if (currentPhase === 'exhale') {
        // Sweep frequency downward from 210Hz back to 140Hz
        const targetFreq = 210 - (phaseProgress * 70);
        oscRef.current.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.1);
        // Fade sound down nicely
        const targetVol = 0.20 - (phaseProgress * 0.16);
        gainNodeRef.current.gain.linearRampToValueAtTime(Math.max(0.04, targetVol), now + 0.1);
      } else { // holdEmpty
        // Very low steady hum of stillness
        oscRef.current.frequency.exponentialRampToValueAtTime(140, now + 0.1);
        gainNodeRef.current.gain.linearRampToValueAtTime(0.03, now + 0.1);
      }
    } catch (e) {
      // Audio sweeps locks safeguard
    }
  }, [currentPhase, phaseProgress, isRunning, soundEnabled]);

  // Handle active session timing state machines
  useEffect(() => {
    if (!isRunning) return;

    // Track total seconds remaining count
    const durationTimer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Finished the full breath minute!
          setIsRunning(false);
          setCurrentPhase('inhale');
          setPhaseProgress(0);
          setCompletedSessions(c => c + 1);
          stopSynth();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Frame-level progress interpolation tracker for phase smooth movement
    let innerFrame: number;
    let lastTime = performance.now();
    let currentPhaseSeconds = 0;

    const tickFrame = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      currentPhaseSeconds += delta;

      // Determine duration limit of current active phase
      let currentLimit = activePattern.inhale;
      if (currentPhase === 'holdFull') currentLimit = activePattern.holdFull;
      else if (currentPhase === 'exhale') currentLimit = activePattern.exhale;
      else if (currentPhase === 'holdEmpty') currentLimit = activePattern.holdEmpty;

      if (currentLimit <= 0) {
        // Skip null duration phases (e.g. no hold full or empty in coherence)
        transitionToNextPhase();
        currentPhaseSeconds = 0;
      } else {
        const progress = Math.min(currentPhaseSeconds / currentLimit, 1);
        setPhaseProgress(progress);

        if (progress >= 1) {
          transitionToNextPhase();
          currentPhaseSeconds = 0;
        }
      }

      innerFrame = requestAnimationFrame(tickFrame);
    };

    const transitionToNextPhase = () => {
      setCurrentPhase((curr) => {
        if (curr === 'inhale') {
          return activePattern.holdFull > 0 ? 'holdFull' : 'exhale';
        } else if (curr === 'holdFull') {
          return 'exhale';
        } else if (curr === 'exhale') {
          return activePattern.holdEmpty > 0 ? 'holdEmpty' : 'inhale';
        } else {
          return 'inhale';
        }
      });
      setPhaseProgress(0);
    };

    innerFrame = requestAnimationFrame(tickFrame);

    return () => {
      clearInterval(durationTimer);
      cancelAnimationFrame(innerFrame);
    };
  }, [isRunning, currentPhase, activePatternId]);

  // High performance visual calming wave loops
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderCalmVibrations = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      waveTimeRef.current += 1.2;

      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      // Tonal wave properties mapped to breathing cycle
      let amplitude = 22;
      let frequency = 0.007;
      let alpha = 0.15;
      let numWaves = 4;

      if (isRunning) {
        if (currentPhase === 'inhale') {
          amplitude = 15 + (phaseProgress * 25);
          frequency = 0.005 + (phaseProgress * 0.006);
          alpha = 0.12 + (phaseProgress * 0.12);
        } else if (currentPhase === 'holdFull') {
          amplitude = 40;
          frequency = 0.011;
          alpha = 0.24;
        } else if (currentPhase === 'exhale') {
          amplitude = 40 - (phaseProgress * 25);
          frequency = 0.011 - (phaseProgress * 0.006);
          alpha = 0.24 - (phaseProgress * 0.12);
        } else { // holdEmpty
          amplitude = 15;
          frequency = 0.005;
          alpha = 0.10;
        }
      }

      // Draw subtle overlapping sinusoïdes waves
      for (let w = 0; w < numWaves; w++) {
        ctx.beginPath();
        const offset = w * 45;
        const colorFactor = w / numWaves;

        // Gradient theme colors
        ctx.strokeStyle = `rgba(${236 - colorFactor * 40}, ${72 + colorFactor * 60}, ${153 + colorFactor * 40}, ${alpha - (w * 0.02)})`;
        ctx.lineWidth = 1.5 + (w * 0.5);

        for (let x = 0; x < width; x += 3) {
          const t = waveTimeRef.current * 0.015;
          const sine = Math.sin((x * frequency) + t + (offset * Math.PI / 180));
          const y = midY + (sine * amplitude) + (Math.cos((x * 0.002) - t) * (amplitude / 3));
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(renderCalmVibrations);
    };

    renderCalmVibrations();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRunning, currentPhase, phaseProgress]);

  // Sync canvas dimensions
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

  const handleStart = () => {
    if (isRunning) {
      setIsRunning(false);
      stopSynth();
    } else {
      setSecondsLeft(sessionDuration);
      setCurrentPhase('inhale');
      setPhaseProgress(0);
      setIsRunning(true);
      initSynth();
    }
  };

  const getPhaseTextInFrench = () => {
    if (!isRunning) return "Prêts pour la parenthèse ?";
    if (currentPhase === 'inhale') return "Inspire doucement...";
    if (currentPhase === 'holdFull') return "Retiens ton souffle...";
    if (currentPhase === 'exhale') return "Expire lentement...";
    return "Vide tes poumons, détends-toi...";
  };

  const getPulseScaleFactor = () => {
    if (!isRunning) return 1.0;
    
    if (currentPhase === 'inhale') {
      return 1.0 + (phaseProgress * 0.45); // expand up to 1.45
    } else if (currentPhase === 'holdFull') {
      return 1.45; // stay expanded
    } else if (currentPhase === 'exhale') {
      return 1.45 - (phaseProgress * 0.45); // shrink down to 1.0
    } else { // holdEmpty
      return 1.0; // stay small
    }
  };

  const getPulseOpacity = () => {
    if (!isRunning) return 0.75;
    
    if (currentPhase === 'inhale') {
      return 0.45 + (phaseProgress * 0.50); // luminous glow increase
    } else if (currentPhase === 'holdFull') {
      return 0.95; 
    } else if (currentPhase === 'exhale') {
      return 0.95 - (phaseProgress * 0.50); // slow dim out
    } else { // holdEmpty
      return 0.45;
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="relative min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/10 dark:bg-[#070b13] flex flex-col items-center justify-start overflow-hidden">
      {/* Background radial soft light blobs */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-pink-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-indigo-505/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full relative z-10 flex flex-col items-center">
        
        {/* Header meditation block */}
        <div className="text-center mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100 dark:bg-pink-950/40 border border-pink-200/50 dark:border-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-xs font-semibold mb-3 tracking-wider uppercase">
            <Wind size={12} className="animate-spin [animation-duration:10s]" />
            <span>Hopson Mode • Cohérence Céleste</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-tight mb-4 animate-[fade-in_0.5s_ease-out]">
            La Boîte à Respiration 🌸
          </h1>
          <p className="text-slate-600 dark:text-slate-350 text-sm sm:text-base leading-relaxed">
            Synchronisez vos cœurs en temps réel de manière magique. Prenez une pause d'une minute ensemble pour aligner vos respirations guidés par les vagues relaxantes de Mike 💖 pour Dels 👑.
          </p>
        </div>

        {/* Layout content slots */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full items-stretch">
          
          {/* COLUMN 1: Settings / Meditation type selection (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-pink-200/50 dark:border-pink-950/35 rounded-[2.5rem] p-6 sm:p-8 shadow-xl flex flex-col justify-between h-full">
              
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <Activity size={18} className="text-pink-500 animate-pulse" />
                  Configuration Zen
                </h3>

                {/* Duration select */}
                <div className="space-y-3 mb-6">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">
                    1. Durée de la parenthèse amoureuse
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[60, 120, 300].map((duration) => (
                      <button
                        key={duration}
                        disabled={isRunning}
                        onClick={() => {
                          setSessionDuration(duration);
                          setSecondsLeft(duration);
                        }}
                        className={`py-2.5 rounded-xl border text-xs font-extrabold cursor-pointer transition-all ${
                          sessionDuration === duration
                            ? 'bg-pink-500 border-pink-500 text-white shadow-md'
                            : 'bg-slate-50/80 dark:bg-slate-950/40 border-slate-150 dark:border-slate-850 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800/80 disabled:opacity-40'
                        }`}
                      >
                        {duration / 60} {duration === 60 ? 'Minute' : 'Minutes'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Breath Style Pattern select */}
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">
                    2. Rythme respiratoire du cœur
                  </span>

                  <div className="space-y-3">
                    {PATTERNS.map((pattern) => (
                      <button
                        key={pattern.id}
                        disabled={isRunning}
                        onClick={() => setActivePatternId(pattern.id)}
                        className={`p-4 rounded-2xl text-left border cursor-pointer transition-all w-full flex flex-col gap-1.5 ${
                          activePatternId === pattern.id
                            ? 'bg-purple-600 border-purple-600 text-white shadow-lg'
                            : 'bg-slate-50/80 dark:bg-slate-950/40 border-slate-150 dark:border-slate-850 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800/80 disabled:opacity-40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-extrabold tracking-wide uppercase">
                            {pattern.name.split(" ")[0]} 
                          </h4>
                          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                            {pattern.inhale}s In • {pattern.exhale}s Out
                          </span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${activePatternId === pattern.id ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
                          {pattern.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Volume synthetic sound switch & completions indicators */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="text-xs font-bold text-slate-400 hover:text-pink-500 flex items-center gap-1.5 cursor-pointer"
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 size={16} />
                      Bruit de Vagues
                    </>
                  ) : (
                    <>
                      <VolumeX size={16} />
                      Audio Coupé
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-pink-50/30 dark:bg-pink-950/15 p-2 rounded-xl border border-pink-100/40 dark:border-pink-950/20">
                  <Smile size={14} className="text-pink-500 animate-[bounce_2s_infinite]" />
                  <span>Niveau Zen : {completedSessions} pauses complétées</span>
                </div>
              </div>

            </div>

          </div>

          {/* COLUMN 2: meditational central circular pulse (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-pink-200/50 dark:border-pink-950/35 rounded-[2.5rem] p-6 sm:p-10 shadow-xl overflow-hidden relative justify-center h-full min-h-[30rem] text-center">
            
            {/* Interactive Sine Waves Canvas */}
            <canvas 
              ref={canvasRef} 
              className="absolute inset-x-0 bottom-0 top-0 w-full h-full pointer-events-none opacity-40 z-10" 
            />

            {/* Glowing Luminous meditation circle */}
            <div className="relative flex-grow flex flex-col items-center justify-center py-8 z-20">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                
                {/* Outermost breathing wave pulse glow */}
                <motion.div
                  style={{ 
                    scale: getPulseScaleFactor() + 0.15,
                    opacity: getPulseOpacity() * 0.15
                  }}
                  className="absolute inset-0 rounded-full bg-pink-400/30 dark:bg-pink-500/10 blur-2xl"
                />

                {/* Inner breathing wave pulse glow */}
                <motion.div
                  style={{ 
                    scale: getPulseScaleFactor() + 0.05,
                    opacity: getPulseOpacity() * 0.3
                  }}
                  className="absolute inset-6 rounded-full bg-pink-400/25 dark:bg-pink-500/20 blur-xl"
                />

                {/* Primary Circle Layer */}
                <motion.div
                  id="breathing-glowing-ring"
                  style={{ 
                    scale: getPulseScaleFactor(),
                    opacity: getPulseOpacity()
                  }}
                  className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 shadow-[0_12px_40px_rgba(236,72,153,0.35)] dark:shadow-[0_12px_40px_rgba(236,72,153,0.15)] flex items-center justify-center border-4 border-white/60 dark:border-slate-900/40 transition-shadow duration-300"
                >
                  <AnimatePresence mode="wait">
                    {isRunning ? (
                      <motion.div
                        key={currentPhase}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-col items-center justify-center text-white"
                      >
                        <Heart size={28} fill="currentColor" className="animate-[pulse_1.5s_infinite] mb-1.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-white/90">
                          {currentPhase === 'inhale' && 'Inspirer'}
                          {currentPhase === 'holdFull' && 'Retenir'}
                          {currentPhase === 'exhale' && 'Expirer'}
                          {currentPhase === 'holdEmpty' && 'Attendre'}
                        </span>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-white">
                        <Wind size={28} className="animate-pulse mb-1" />
                        <span className="text-xs font-black tracking-widest uppercase">Zen</span>
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>

              </div>

              {/* Dynamic prompt instruct label text */}
              <div className="mt-8 space-y-2">
                <h4 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white transition-opacity block min-h-[1.75rem]" id="breathing-prompt-instructions">
                  {getPhaseTextInFrench()}
                </h4>
                
                {isRunning && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-bold tracking-widest uppercase flex items-center justify-center gap-1.5">
                    <Clock size={12} className="text-pink-500" />
                    <span>TEMPS RESTANT : {formatSeconds(secondsLeft)}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Standby/Play Trigger Control Centered */}
            <div className="z-20 border-t border-slate-100 dark:border-slate-800/80 pt-6 mt-4 flex items-center justify-center flex-shrink-0">
              <button
                id="breathing-play-trigger"
                onClick={handleStart}
                className={`px-8 py-3.5 rounded-full font-black text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg hover:scale-104 active:scale-96 cursor-pointer transition-all ${
                  isRunning
                    ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-900 dark:hover:bg-white shadow-slate-900/10'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-pink-500/20'
                }`}
              >
                {isRunning ? (
                  <>
                    <Square size={13} fill="currentColor" />
                    Arrêter la Parenthèse
                  </>
                ) : (
                  <>
                    <Play size={13} fill="currentColor" />
                    Lancer la Parenthèse (1 min)
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

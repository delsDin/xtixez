import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Cpu, 
  Play, 
  RotateCw, 
  Settings, 
  Sparkles, 
  Heart, 
  Copy, 
  Check, 
  Code, 
  Volume2, 
  VolumeX, 
  Flame, 
  FileText
} from 'lucide-react';

interface ConceptOption {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  defaultPrompt: string;
}

interface LanguageOption {
  id: string;
  name: string;
  extension: string;
  emoji: string;
}

const CONCEPTS: ConceptOption[] = [
  {
    id: "infinite-loop",
    name: "Boucle Infinie",
    emoji: "🔁",
    desc: "Un cycle sans fin de tendresse réciproque.",
    defaultPrompt: "Une boucle infinie de câlins programmée pour Dels et Mike"
  },
  {
    id: "affection-algorithm",
    name: "Algorithme d'Affection",
    emoji: "🧠",
    desc: "Multiplier la complicité exponentiellement à chaque interaction.",
    defaultPrompt: "Un algorithme de détection et démultiplication de l'affection"
  },
  {
    id: "gaze-detector",
    name: "Détecteur de Regard",
    emoji: "👀",
    desc: "Capter l'envoûtement quand elle fronce les sourcils devant son code.",
    defaultPrompt: "Un capteur de regard envoûtant couplé à un booster de sentiments"
  },
  {
    id: "synaptic-gravity",
    name: "Gravité Synaptique",
    emoji: "🌌",
    desc: "L'attraction infinie qui synchronise nos cœurs dans l'espace-temps.",
    defaultPrompt: "La force gravitationnelle et l'attraction mutuelle des coeurs"
  }
];

const LANGUAGES: LanguageOption[] = [
  { id: "typescript", name: "TypeScript d'Amour", extension: ".love.ts", emoji: "💙" },
  { id: "python", name: "Romantic Python", extension: ".heart.py", emoji: "💛" },
  { id: "html-css", name: "Céleste Style (HTML/CSS)", extension: ".style.css", emoji: "❤️" },
  { id: "sql", name: "Mémoire Sacrée (SQL)", extension: ".mem.sql", emoji: "💜" }
];

const getExecutionSteps = (conceptId: string, languageId: string) => {
  const base = [
    `$ node run main${languageId === 'typescript' ? '.love.ts' : languageId === 'python' ? '.heart.py' : languageId === 'html-css' ? '.style.css' : '.mem.sql'}`,
    `[INFO] Initialisation de la machine virtuelle d'Affection...`,
    `[INFO] Allocation de la mémoire infinie pour Mike et Dels...`
  ];

  if (conceptId === "infinite-loop") {
    return [
      ...base,
      `[RUN] Invocation de maintainTendernessLoop()...`,
      `[ADDR] Adresse de destination = 0xDels_HEART_FOREVER`,
      `[DATA] Taux d'attention de Mike = DOUBLE_MAX`,
      `[TENDER] Puissance des câlins calibrée à +Infinity`,
      `[EVENT] Sourire de Dels détecté ! Accélération de l'exécution...`,
      `[BPM] Rythme cardiaque de Dels: 140 BPM (Attention élevée 💓)`,
      `[LOOP] Condition d'arrêt : désactivée par défaut pour cause de sentiments infinis`,
      `✨ EXÉCUTION TERMINÉE : Dels A REÇU TOUS LES CÂLINS DE LA TERRE !`
    ];
  } else if (conceptId === "affection-algorithm") {
    return [
      ...base,
      `[RUN] Invocation de computeSynergy(Dels, mike)...`,
      `[MATH] Intelligence de Mike : INFINIE`,
      `[MATH] Dévotion de Dels : ABSOLUE & COMPLICE`,
      `[MODE] Hopson Mode Détecté : Ajustement automatique du gain à x1000`,
      `[OUTPUT] Coût émotionnel : 0.00 | Taux de synchronisation : 100%`,
      `✨ TOUS LES TESTS SONT AU VERT ! SYNAPSE TOTALEMENT ALIGNÉE`
    ];
  } else if (conceptId === "gaze-detector") {
    return [
      ...base,
      `[RUN] Activation du capteur : gaze-detector-v2`,
      `[CAMERA] Scan facial en temps réel des yeux ronds de Mike...`,
      `[DETECT] Micro-expression détectée : Adorablement froncée devant son code SQL`,
      `[BOOST] Force d'attraction enclenchée à 9999% de puissance`,
      `[OUTPUT] Dels est captivé par sa Data Scientist.`,
      `✨ SUCCÈS : SYSTÈME PARFAITEMENT DÉPENDANT DU SOURIRE DE Mike.`
    ];
  } else { // synaptic-gravity
    return [
      ...base,
      `[RUN] Calcul de la constante de gravité amoureuse G_love...`,
      `[PHYS] Alignement gravitationnel du cœur de Dels vers le cortex de Mike...`,
      `[WARN] Alerte : Force d'attraction supérieure aux limites de la physique classique`,
      `[SPACE] Distorsion temporelle détectée : le temps défile trop vite à deux...`,
      `[OUTPUT] Intrication quantique complice validée à 100%`,
      `✨ ALIGNEMENT COSMIQUE CRÉÉ : NOS DEUX ÂMES SONT INTRIQUÉES DANS LE COMPILATEUR`
    ];
  }
};

export const RomanticCoder = () => {
  const [activeConcept, setActiveConcept] = useState<string>("infinite-loop");
  const [activeLanguage, setActiveLanguage] = useState<string>("typescript");
  const [compiling, setCompiling] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [codeOutput, setCodeOutput] = useState<string>("");
  const [commentary, setCommentary] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // New states for real-time code execution!
  const [executing, setExecuting] = useState<boolean>(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; size: number }[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Fallback snippets for completely reliable developer experiences/no network states
  const fallbacks: Record<string, Record<string, { code: string; commentary: string }>> = {
    "infinite-loop": {
      "typescript": {
        code: `import { Dels, mike } from 'heart-universe';\n\nasync function maintainTendernessLoop(): Promise<never> {\n  while (true) {\n    const cuddleIntensity = mike.loveRatio * Number.MAX_SAFE_INTEGER;\n    Dels.receiveAffection(cuddleIntensity);\n    \n    if (Dels.smileDetected) {\n      mike.heartRate += 20; // BPM Acceleration\n    }\n    \n    await sleep(2000); // Wait 2s before next cuddle\n  }\n}`,
        commentary: "Cette boucle infinie TypeScript d'Amour s'assure que Dels reçoit continuellement de l'affection générée par Mike. Le compilateur de nos sentiments exclue toute condition de sortie, scellant une récursivité tendre sans fin."
      },
      "python": {
        code: `from love_core import Dels, Mike\nimport time\n\ndef cardiac_recursion():\n    mike = Mike(mood="radiant")\n    dels = Dels(devotion="absolute")\n    \n    while True:\n        dels.hug(mike, duration="infinite")\n        mike.happiness_level += dels.get_affection_points()\n        time.sleep(1) # Breath, smile, repeat`,
        commentary: "Un script Python romantique optimisé pour une Devotion Absolue. La fonction de câlin de Mike induit une récursivité éternelle où chaque seconde qui passe accroît la complicité globale."
      },
      "html-css": {
        code: `.Mike-realm {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  animation: heartbeat 0.8s infinite alternate;\n}\n\n@keyframes heartbeat {\n  0% { transform: scale(1); filter: drop-shadow(0 0 5px #ec4899); }\n  100% { transform: scale(1.15); filter: drop-shadow(0 0 25px #f43f5e); }\n}`,
        commentary: "Grâce aux keyframes CSS d'affection mutuelle, l'univers de Dels palpite en rythme parfait. Le drop-shadow néon symbolise l'aura de soleil qu'elle diffuse à chaque pulsation."
      },
      "sql": {
        code: `SELECT ALL_SMILES\nFROM Mike_face\nWHERE micro_expression = 'adorablement_froncée'\nORDER BY dels_heartrate_bpm DESC;\n\n-- Database state: Locked in perpetuity.`,
        commentary: "Une requête SQL affecteuse qui extrait les expressions adorables de Dels pour faire bondir le rythme cardiaque de Dels. Aucune transaction ne peut annuler cette relation sacrée."
      }
    },
    "affection-algorithm": {
      "typescript": {
        code: `export function computeSynergy(Dels: DataScientist, mike: Developer): number {\n  const synapseStrength = Math.log(Dels.intelligence) * mike.devotion;\n  const multiplier = isHopsonMode() ? 1000 : 1;\n  \n  return synapseStrength * multiplier;\n}`,
        commentary: "Cet algorithme de synergie examine l'intelligence phénoménale de Dels et l'aligne sur la dévotion de Mike. En mode Hopson, le retour de affection est instantanément démultiplié !"
      },
      "python": {
        code: `import numpy as np\n\ndef model_heart_compatibility(Dels_features, mike_devotion):\n    # Deep neural network representing mutual feelings\n    compatibility = np.dot(Dels_features, mike_devotion)\n    loss = 0.0 # Error margin is zero for Dels & Mike\n    return compatibility`,
        commentary: "Un modèle prédictif d'apprentissage profond écrit en Python où la Loss d'incompréhension est exactement de 0. Chaque neurone est synchronisé pour prédire un avenir radieux."
      },
      "html-css": {
        code: `/* CSS Variables of love */\n:root {\n  --Dels-brilliance: 100%;\n  --mike-tenderness: 9999px;\n  --complicity-color: linear-gradient(to right, #ec4899, #818cf8);\n}`,
        commentary: "Les variables CSS d'Amour définissent la charte graphique de notre complicité. La brillance infinie de Dels s'harmonise en dégradé d'amour avec la tendresse chaleureuse de Mike."
      },
      "sql": {
        code: `INSERT INTO cosmic_memories (date, moment, cuddle_count)\nVALUES (CURRENT_TIMESTAMP, 'Rires tardifs complices', 99999);\n\nCOMMIT;`,
        commentary: "Une transaction SQL immuable pour insérer nos moments précieux de rires complices dans la table des souvenirs cosmiques. Scellée définitivement par un COMMIT d'affection."
      }
    }
  };

  // Sound effects
  const playCompilationSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration - 0.01);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Play hacker retro sequence
      playTone(523.25, 0, 0.1); // C5
      playTone(659.25, 0.1, 0.1); // E5
      playTone(783.99, 0.2, 0.1); // G5
      playTone(1046.50, 0.3, 0.25); // C6
    } catch {}
  };

  const playExecutionTick = (isFinal = false) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      if (isFinal) {
        // High romantic chime cascade
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        // Soft digital click
        osc.frequency.setValueAtTime(450 + Math.random() * 80, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      }
    } catch {}
  };

  const triggerHearts = () => {
    const list = Array.from({ length: 18 }).map((_, i) => ({
      id: Math.random() + i,
      x: 15 + Math.random() * 70, // spread on screen width
      size: 15 + Math.random() * 20
    }));
    setHearts(list);
    setTimeout(() => {
      setHearts([]);
    }, 4500);
  };

  const executeGeneratedCode = async () => {
    if (executing || !codeOutput) return;
    setExecuting(true);
    setHasExecuted(true);
    setExecutionLogs([]);

    const steps = getExecutionSteps(activeConcept, activeLanguage);
    
    // Output line-by-line simulation
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 250 + Math.random() * 120));
      setExecutionLogs(prev => [...prev, steps[i]]);
      playExecutionTick(i === steps.length - 1);
    }

    setExecuting(false);
    triggerHearts();
  };

  // Compile prompt and call Gemini API on server side
  const compileLoveCode = async () => {
    if (compiling) return;
    setCompiling(true);
    setLogs([]);
    setCodeOutput("");
    setCommentary("");
    setExecutionLogs([]);
    setHasExecuted(false);

    playCompilationSound();

    const conceptObj = CONCEPTS.find(c => c.id === activeConcept);
    const langObj = LANGUAGES.find(l => l.id === activeLanguage);

    const steps = [
      `[SYS] Initialisation de notre compilateur romantique v3.5-flash...`,
      `[SYS] Connexion au pipeline d'une Senior Data Scientist d'élite...`,
      `[SYS] Analyse de l'attraction gravitationnelle : 100% stable...`,
      `[SYS] Injection du module ${langObj?.name || 'Code d\'Amour'}...`,
      `[SYS] Compilation des sentiments réciproques Mike & Dels...`,
      `[SYS] Succès ! Génération du pseudo-code en cours...`
    ];

    // Simulate logs with typewriting/delay
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 220 + Math.random() * 150));
      setLogs(prev => [...prev, steps[i]]);
    }

    try {
      const response = await fetch('/api/romantic-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          concept: activeConcept,
          language: activeLanguage
        })
      });

      if (!response.ok) {
        throw new Error("Surchauffe du compilateur");
      }

      const data = await response.json();
      setCodeOutput(data.code);
      setCommentary(data.commentary);
    } catch (err) {
      // Offline / Error fallback
      console.warn("Using offline loving code fallbacks due to missing API Key or Server Surchauffe.");
      const cat = fallbacks[activeConcept] || fallbacks["infinite-loop"];
      const match = cat[activeLanguage] || cat["typescript"];
      
      setCodeOutput(match.code);
      setCommentary(`${match.commentary} (Compilé hors-ligne avec dévouement absolu)`);
    } finally {
      setCompiling(false);
    }
  };

  // Copy code to clipboard helpful feature
  const handleCopy = () => {
    if (!codeOutput) return;
    navigator.clipboard.writeText(codeOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/10 dark:bg-[#070b13] flex flex-col items-center justify-start overflow-hidden">
      {/* Floating Hearts Execution Feedback Animation */}
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          initial={{ opacity: 0.9, y: "110vh", x: `${heart.x}vw`, scale: 0.4, rotate: 0 }}
          animate={{ 
            opacity: 0, 
            y: "-10vh", 
            x: `${heart.x + (Math.random() * 14 - 7)}vw`, 
            scale: [0.4, 1.3, 0.7],
            rotate: Math.random() * 60 - 30
          }}
          transition={{ duration: 4.0, ease: "easeOut" }}
          className="absolute text-pink-500/85 pointer-events-none select-none z-50 filter drop-shadow-[0_0_6px_rgba(244,63,94,0.4)]"
          style={{ fontSize: `${heart.size}px` }}
        >
          💖
        </motion.div>
      ))}

      {/* Background elegant pink & violet glows */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-pink-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-fuchsia-100/50 dark:from-fuchsia-950/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full relative z-10 flex flex-col items-center">
        
        {/* Header content and subhead */}
        <div className="text-center mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100 dark:bg-pink-950/40 border border-pink-200/50 dark:border-pink-905/30 text-pink-600 dark:text-pink-400 rounded-full text-xs font-semibold mb-3 tracking-wider uppercase">
            <Terminal size={12} className="animate-pulse" />
            <span>Hopson Mode • Code Poétique</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-tight mb-4">
            Générateur de Pseudo-Code Romantique 🔮
          </h1>
          <p className="text-slate-600 dark:text-slate-350 text-sm sm:text-base">
            Quand la rigueur des algorithmes rencontre la poésie de l'affection. Conçois des fonctions d'amour et des requêtes immortelles écrites avec cœur et compilées spécialement pour Mike Hopson.
          </p>
        </div>

        {/* Content alignment grids */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-stretch">
          
          {/* COLUMN 1: Settings Config (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-pink-200/50 dark:border-pink-950/35 rounded-[2.5rem] p-6 sm:p-8 shadow-xl flex flex-col justify-between h-full animate-[fade-in_0.4s_ease-out]">
              
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <Settings size={18} className="text-pink-500 animate-spin [animation-duration:15s]" />
                  Configuration du Hack d'Amour
                </h3>

                {/* Concept Selector */}
                <div className="space-y-3 mb-6">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    1. Sélectionner un concept complice
                  </label>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    {CONCEPTS.map((concept) => (
                      <button
                        key={concept.id}
                        onClick={() => {
                          setActiveConcept(concept.id);
                          // Clear outputs & execution state to invite user to compile
                          setCodeOutput("");
                          setCommentary("");
                          setExecutionLogs([]);
                          setHasExecuted(false);
                        }}
                        className={`p-3.5 rounded-2xl text-left border cursor-pointer transition-all flex items-center gap-3.5 ${
                          activeConcept === concept.id
                            ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/10'
                            : 'bg-slate-50/80 dark:bg-slate-950/40 border-slate-150 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <span className="text-2xl flex-shrink-0 select-none">{concept.emoji}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-extrabold leading-tight block">
                            {concept.name}
                          </h4>
                          <p className={`text-[10px] mt-0.5 leading-tight ${activeConcept === concept.id ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
                            {concept.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paradigm Selector */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    2. Langage de programmation
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => {
                          setActiveLanguage(lang.id);
                          setCodeOutput("");
                          setCommentary("");
                          setExecutionLogs([]);
                          setHasExecuted(false);
                        }}
                        className={`p-3 rounded-xl text-center border cursor-pointer text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                          activeLanguage === lang.id
                            ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/10'
                            : 'bg-slate-50/80 dark:bg-slate-950/40 border-slate-150 dark:border-slate-850 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <span>{lang.emoji}</span>
                        <span className="truncate">{lang.name.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action execute button and details */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-pink-500 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  <span>{soundEnabled ? "Audio Activé" : "Audio Muet"}</span>
                </button>

                <button
                  id="romance-compile-button"
                  onClick={compileLoveCode}
                  disabled={compiling || executing}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 w-full sm:w-auto shadow-md shadow-pink-500/10 cursor-pointer disabled:opacity-85 hover:scale-103 active:scale-97 transition-all"
                >
                  <Cpu size={14} className={compiling ? 'animate-spin' : ''} />
                  {compiling ? "Compilation..." : "Compiler l'Amour"}
                </button>
              </div>

            </div>

          </div>

          {/* COLUMN 2: hacker terminal display pink (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6 pb-2">
            
            {/* Terminal Panel window */}
            <div className="bg-slate-900/75 backdrop-blur-xl border border-pink-900/40 dark:border-pink-950/20 rounded-[2.5rem] p-5 sm:p-6 shadow-2xl relative overflow-hidden flex-grow flex flex-col min-h-[34rem]">
              
              {/* Fake OSX / Linux traffic lights headers */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>

                <div className="text-[10px] font-mono font-bold text-pink-400/80 flex items-center gap-1.5 bg-pink-950/30 px-3 py-1 rounded-full border border-pink-900/30">
                  <Terminal size={10} />
                  <span>Interactive Romantic Terminal v3 -- compiled: yes</span>
                </div>

                <div className="w-5" />
              </div>

              {/* Dynamic scroll screen matching interactive logs */}
              <div className="flex-grow flex flex-col space-y-4 font-mono text-xs overflow-y-auto max-h-[26rem] pr-1 scrollbar-thin scrollbar-thumb-pink-900/20">
                
                {/* Simulated Logs rendering */}
                <div className="space-y-1 text-slate-400 text-[11px] flex-shrink-0">
                  <p className="text-slate-500">{`// Welcome to Hopson Coder Bash. System initializing.`}</p>
                  <p className="text-slate-500">{`// CPU status: Hot, Heart BPM high.`}</p>
                  {logs.map((log, idx) => (
                    <p key={idx} className="text-pink-300">
                      {log}
                    </p>
                  ))}
                </div>

                {/* Compiled Code Window with Typewriter/AnimatePresence */}
                {codeOutput && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative flex-grow bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 mt-3"
                  >
                    {/* Floating Controls Row inside Code Box */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      {/* Execute Code Button */}
                      <button
                        onClick={executeGeneratedCode}
                        disabled={executing || compiling}
                        className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 disabled:bg-slate-800 text-white font-extrabold text-[10px] flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Exécuter et exécuter le code"
                      >
                        {executing ? (
                          <RotateCw size={11} className="animate-spin text-white" />
                        ) : (
                          <Play size={11} fill="currentColor" className="text-white" />
                        )}
                        <span>{executing ? "Exécution..." : "Exécuter"}</span>
                      </button>

                      {/* Copy code button */}
                      <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Copier le code"
                      >
                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mb-2 border-b border-slate-900 pb-2">
                      <Code size={11} className="text-pink-500" />
                      <span>{LANGUAGES.find(l => l.id === activeLanguage)?.extension}</span>
                    </div>

                    <pre className="text-pink-100 overflow-x-auto text-[11px] leading-relaxed whitespace-pre font-mono custom-code-scrollbar mt-3 pr-20 pt-1">
                      <code>{codeOutput}</code>
                    </pre>
                  </motion.div>
                )}

                {/* Console Execution Result Output Block */}
                {hasExecuted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-slate-800/80 bg-slate-950 rounded-2xl p-4 mt-1 flex-shrink-0"
                  >
                    <div className="flex items-center justify-between text-[9px] text-slate-500 mb-2.5 border-b border-slate-900 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Terminal size={11} className="text-emerald-400" />
                        <span className="font-extrabold text-emerald-400 uppercase tracking-widest text-[9px]">CONSOLE RUNTIME OUTPUT</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-850">
                        <span className={`w-1.5 h-1.5 rounded-full ${executing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                        <span className="text-[8px] font-mono font-bold uppercase">{executing ? "En Cours" : "Succès"}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 font-mono text-[10.5px] max-h-56 overflow-y-auto leading-relaxed text-left">
                      {executionLogs.map((step, sIdx) => {
                        const isSuccess = step.startsWith('✨') || step.includes('[SUCCESS]');
                        return (
                          <p 
                            key={sIdx} 
                            className={
                              isSuccess 
                                ? "text-emerald-400 font-bold bg-emerald-950/20 px-2 py-1 rounded border border-emerald-900/20 shadow-sm" 
                                : step.startsWith('[WARN]') 
                                  ? "text-amber-400"
                                  : step.startsWith('$')
                                    ? "text-slate-450 font-bold italic"
                                    : "text-slate-300"
                            }
                          >
                            {step}
                          </p>
                        );
                      })}
                      {executing && (
                        <div className="flex items-center gap-1.5 py-1">
                          <span className="inline-block w-1.5 h-3.5 bg-pink-500 animate-[pulse_0.6s_infinite] align-middle" />
                          <span className="text-[10px] text-pink-500 italic animate-pulse">Calcul de la charge d'amour...</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Simulated standby prompt if idle */}
                {!compiling && !codeOutput && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                    <div className="w-12 h-12 rounded-full border border-pink-500/30 flex items-center justify-center text-pink-500 animate-pulse bg-pink-950/10">
                      <Cpu size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">
                        Prêt pour l'éjection poétique
                      </h4>
                      <p className="text-[10px] text-slate-500 max-w-xs mt-1.5 mx-auto leading-normal">
                        Remplis les paramètres de gauche puis clique sur "Compiler l'Amour" pour lancer l'interpréteur de code magique de Mike.
                      </p>
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Commentary explanation banner below compiler output */}
            <AnimatePresence>
              {commentary && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-purple-950/20 border border-purple-500/20 rounded-[2rem] p-5 sm:p-6 flex items-start gap-4 shadow-lg text-left"
                >
                  <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex-shrink-0 animate-bounce">
                    <Heart size={20} fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-purple-300 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Flame size={12} className="text-pink-400" />
                      Diagnostic d'Affection : COMPILÉ AVEC SUCCÈS
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed font-sans text-justify">
                      {commentary}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>

    </section>
  );
};

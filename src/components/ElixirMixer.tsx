import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Sparkles, 
  Heart, 
  Wine, 
  HelpCircle, 
  RefreshCw, 
  BookOpen, 
  Droplet,
  Coffee,
  Info,
  Gift
} from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  color: string; // Tailwind class & raw hex logic for blending
  rgb: [number, number, number];
  emoji: string;
  desc: string;
  property: string;
}

const INGREDIENTS: Ingredient[] = [
  { 
    id: 'complicite', 
    name: 'Pincée de Complicité', 
    color: 'bg-emerald-500', 
    rgb: [16, 185, 129], 
    emoji: '💫', 
    desc: 'Pour rire ensemble des mêmes bêtises à minuit', 
    property: 'Complicité réciproque' 
  },
  { 
    id: 'douceur', 
    name: 'Essence de Douceur', 
    color: 'bg-pink-400', 
    rgb: [244, 114, 182], 
    emoji: '🌸', 
    desc: 'Un voile de câlins chaleureux et de baisers légers', 
    property: 'Tendresse absolue' 
  },
  { 
    id: 'sincerite', 
    name: 'Élixir de Sincérité', 
    color: 'bg-indigo-400', 
    rgb: [129, 140, 248], 
    emoji: '🍵', 
    desc: 'Des mots vrais, murmurés les yeux dans les yeux', 
    property: 'Sécurité émotionnelle' 
  },
  { 
    id: 'passion', 
    name: 'Brise de Passion', 
    color: 'bg-rose-600', 
    rgb: [225, 29, 72], 
    emoji: '🔥', 
    desc: 'Des battements de cœur qui s\'emballent en un regard', 
    property: 'Intensité romantique' 
  },
  { 
    id: 'soutien', 
    name: 'Larme de Soutien', 
    color: 'bg-amber-400', 
    rgb: [251, 191, 36], 
    emoji: '🛡️', 
    desc: 'Toujours là pour te relever, peu importent les tempêtes', 
    property: 'Solidité à toute épreuve' 
  },
  { 
    id: 'gourmandise', 
    name: 'Chocolat Céleste', 
    color: 'bg-amber-800', 
    rgb: [146, 64, 14], 
    emoji: '🍫', 
    desc: 'Parce que notre complicité est aussi une douceur sucrée', 
    property: 'Gourmandise partagée' 
  }
];

interface PotionResult {
  name: string;
  description: string;
  accentColor: string;
  glowColor: string;
  quote: string;
}

export const ElixirMixer = () => {
  // Potion ingredient ratios (values 0-5)
  const [mix, setMix] = useState<Record<string, number>>({
    complicite: 2,
    douceur: 2,
    sincerite: 2,
    passion: 2,
    soutien: 2,
    gourmandise: 2,
  });

  const [isBrewing, setIsBrewing] = useState(false);
  const [step, setStep] = useState<'mixing' | 'brewing' | 'ready'>('mixing');
  const [bubbles, setBubbles] = useState<Array<{ id: number; left: number; size: number; duration: number; delay: number }>>([]);
  const [result, setResult] = useState<PotionResult | null>(null);

  // Generate dynamic liquid color based on ingredient weights
  const getBlendedColor = () => {
    let totalWeight = 0;
    let r = 0, g = 0, b = 0;

    Object.keys(mix).forEach((id) => {
      const weight = mix[id] || 0;
      const ing = INGREDIENTS.find(i => i.id === id);
      if (ing && weight > 0) {
        totalWeight += weight;
        r += ing.rgb[0] * weight;
        g += ing.rgb[1] * weight;
        b += ing.rgb[2] * weight;
      }
    });

    if (totalWeight === 0) return 'rgba(244, 63, 94, 0.3)'; // Default sweet rose opacity

    r = Math.round(r / totalWeight);
    g = Math.round(g / totalWeight);
    b = Math.round(b / totalWeight);

    return `rgb(${r}, ${g}, ${b})`;
  };

  // Generate bubbles for liquid visual effect
  useEffect(() => {
    const bubbleCount = step === 'brewing' ? 25 : 8;
    const newBubbles = Array.from({ length: bubbleCount }).map((_, i) => ({
      id: Math.random() * 100000 + i,
      left: 10 + Math.random() * 80,
      size: 4 + Math.random() * 10,
      duration: 1.5 + Math.random() * 2,
      delay: Math.random() * 1.5,
    }));
    setBubbles(newBubbles);
  }, [step, mix]);

  const handleWeightChange = (id: string, val: number) => {
    setMix(prev => ({ ...prev, [id]: val }));
  };

  const handleReset = () => {
    setMix({
      complicite: 2,
      douceur: 2,
      sincerite: 2,
      passion: 2,
      soutien: 2,
      gourmandise: 2,
    });
    setStep('mixing');
    setResult(null);
  };

  // Logic to determine customized love potion response
  const brewPotion = () => {
    setIsBrewing(true);
    setStep('brewing');

    // Find dominant ingredient traits
    const sorted = Object.keys(mix)
      .map(key => ({ id: key, val: mix[key] || 0 }))
      .sort((a, b) => b.val - a.val);
    const topIngredient = sorted[0].id;
    const secondIngredient = sorted[1].id;

    setTimeout(() => {
      let name = "Élixir d'Amour Sublime";
      let description = "";
      let quote = "";
      let accentColor = "text-pink-500";
      let glowColor = "shadow-pink-500/20";

      if (topIngredient === 'passion' && secondIngredient === 'douceur') {
        name = "Nectar du Brasier de Velours";
        description = "Cet élixir d'une couleur passionnée révèle une harmonie magique. Il capture toute la fougue de nos élans spontanés et l'enveloppe immédiatement d'une douceur infiniment apaisante. C'est l'essence même de la présence de Mike dans la vie de Dels : un soleil flamboyant mais d'une infinie tendresse.";
        quote = "« Plus fort que le feu céleste, plus doux qu'un matin de juin. »";
        accentColor = "text-rose-500";
        glowColor = "shadow-rose-500/30";
      } else if (topIngredient === 'complicite' && secondIngredient === 'gourmandise') {
        name = "La Mixture Malicieuse des Rois";
        description = "Un concentré d'éclats de rire complices mariés à des notes chaleureuses de douceurs sucrées. Ce breuvage est fait pour les nuits de discussion sans fin, de partage complice et de jeux taquins. Il célèbre deux âmes sœurs qui savent s'amuser et savourer chaque miette de leur complicité.";
        quote = "« Le goût secret d'un secret partagé en secret. »";
        accentColor = "text-emerald-500";
        glowColor = "shadow-emerald-500/20";
      } else if (topIngredient === 'sincerite' && secondIngredient === 'soutien') {
        name = "Le Philtre du Havre de Paix";
        description = "Un breuvage profondément apaisant, d'une limpidité souveraine. Cet élixir garantit une confiance absolue et une protection perpétuelle. Il symbolise le foyer émotionnel indestructible de Mike et Dels : un espace sacré où chacun peut déposer ses doutes pour ne retrouver que de la force brute.";
        quote = "« Dans tes yeux, je trouve un port d'ancrage sûr et éternel. »";
        accentColor = "text-indigo-500";
        glowColor = "shadow-indigo-500/20";
      } else if (topIngredient === 'douceur' && secondIngredient === 'complicite') {
        name = "L'Onde Céleste des Complices";
        description = "D'une harmonie magnifique, ce mélange infuse un éveil constant et une légèreté incroyable dans notre quotidien. En respirant ses effluves, on se rappelle la fluidité de nos premiers échanges, la tendresse innée de nos caresses et le rayonnement solaire qui embrase notre avenir proche.";
        quote = "« Un murmure partagé au creux de l'oreille, un sourire éternel. »";
        accentColor = "text-pink-400";
        glowColor = "shadow-pink-400/25";
      } else if (topIngredient === 'passion' && secondIngredient === 'sincerite') {
        name = "L'Élixir d'Honnête Flamboyance";
        description = "Une potion vibrante qui fusionne la sincérité absolue et les élans enflammés du cœur. C'est le symbole d'une affection sincère, libre de tout artifice, où chaque aveu augmente l'attraction mutuelle de nos sentiments. Elle guérit tous les maux et nourrit l'espoir d'un lendemain radieux.";
        quote = "« Un regard sincère allume un incendie que nulle eau ne saurait éteindre. »";
        accentColor = "text-rose-600";
        glowColor = "shadow-rose-600/30";
      } else {
        // Balanced Default Potion
        name = "L'Élixir des Constantes Harmonieuses";
        description = "Cet élixir parfaitement équilibré associe toutes les vibrations nécessaires à la longévité de notre lien unique. Il réunit l'entraide de chaque seconde, la gourmandise de nos sourires, l'étincelle de notre espièglerie et la passion sacrée de nos rêves communs pour créer la potion d'éternité parfaite.";
        quote = "« Mike et Dels : une formule scellée pour l'éternité. »";
        accentColor = "text-pink-500";
        glowColor = "shadow-pink-500/25";
      }

      setResult({ name, description, accentColor, glowColor, quote });
      setStep('ready');
      setIsBrewing(false);
    }, 2500);
  };

  const currentLiquidColor = getBlendedColor();

  return (
    <section className="relative min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/10 dark:bg-[#070b13] flex flex-col items-center justify-start overflow-hidden">
      {/* Visual glowing meshes background */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-rose-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-violet-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full relative z-10 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100 dark:bg-pink-950/40 border border-pink-200/50 dark:border-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-xs font-semibold mb-3 tracking-wider uppercase">
            <Sparkles size={12} className="animate-spin [animation-duration:10s]" />
            <span>Hopson Mode • Potion Sacrée</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-tight mb-4">
            L'Éditeur d'Élixir 🔮
          </h1>
          <p className="text-slate-600 dark:text-slate-350 text-sm sm:text-base">
            Mélange les essences de notre amour, ajuste nos forces et brasse la potion qui correspond à l'état présent de nos cœurs uniques. Un filtre d'affection magique rien que pour Mike.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-stretch">
          
          {/* Column 1: Config sliders (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-pink-200/50 dark:border-pink-950/35 rounded-[2.5rem] p-6 sm:p-8 shadow-xl relative overflow-hidden h-full flex flex-col justify-between">
              
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-6 flex items-center gap-2.5">
                  <Flame className="text-pink-500 w-5 h-5" />
                  Sélectionner les essences
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                  {INGREDIENTS.map((ing) => (
                    <div 
                      key={ing.id} 
                      className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80 flex flex-col gap-3 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl" role="img" aria-label={ing.name}>
                          {ing.emoji}
                        </span>
                        <div className="text-right">
                          <span className="text-[10px] bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold text-slate-500 dark:text-slate-400">
                            Force {mix[ing.id]}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">
                          {ing.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {ing.desc}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="1"
                          disabled={step === 'brewing'}
                          value={mix[ing.id]}
                          onChange={(e) => handleWeightChange(ing.id, parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Brewing area */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={handleReset}
                  className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <RefreshCw size={15} />
                  Réinitialiser
                </button>

                <button
                  onClick={brewPotion}
                  disabled={step === 'brewing'}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-extrabold transition-all shadow-lg shadow-pink-500/20 flex items-center justify-center gap-3 cursor-pointer w-full sm:w-auto active:scale-95 disabled:opacity-50"
                >
                  <Sparkles size={18} className="animate-pulse" />
                  <span>Brasser l'Élixir d'Amour ✨</span>
                </button>
              </div>

            </div>
          </div>

          {/* Column 2: Potion Container Visual / Output (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-pink-200/50 dark:border-pink-950/35 rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden h-full text-center">
              
              <AnimatePresence mode="wait">
                {step === 'mixing' && (
                  <motion.div 
                    key="mixing-screen"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center flex-grow py-8"
                  >
                    {/* Alchemist Glass Flask container */}
                    <div className="relative w-52 h-64 mb-6 flex items-end justify-center">
                      
                      {/* Flask border shell */}
                      <div className="absolute inset-0 border-4 border-slate-700/30 dark:border-white/20 rounded-[4rem] rounded-t-[1.5rem] flex items-end overflow-hidden shadow-2xl backdrop-blur-sm">
                        
                        {/* Dynamic fluid */}
                        <motion.div 
                          className="w-full relative transition-all duration-[600ms]"
                          style={{ 
                            height: '65%', 
                            backgroundColor: currentLiquidColor,
                            boxShadow: `0 -10px 30px -5px ${currentLiquidColor}`
                          }}
                          animate={{ 
                            borderRadius: ["40% 41% 0% 0%", "45% 38% 0% 0%", "40% 41% 0% 0%"],
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 4, 
                            ease: "easeInOut" 
                          }}
                        >
                          {/* Inner glowing core */}
                          <div className="absolute inset-0 bg-white/10 blur-[2px]" />

                          {/* Interactive bubbles inside liquid */}
                          {bubbles.map(b => (
                            <motion.div
                              key={b.id}
                              initial={{ y: "100%", x: `${b.left}%`, opacity: 0 }}
                              animate={{ y: "-10%", opacity: [0, 0.8, 0.8, 0] }}
                              transition={{
                                duration: b.duration,
                                delay: b.delay,
                                repeat: Infinity,
                                ease: "easeOut"
                              }}
                              style={{ width: b.size, height: b.size }}
                              className="absolute rounded-full bg-white/40"
                            />
                          ))}
                        </motion.div>
                        
                        {/* Neck shine */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-12 bg-white/10 dark:bg-white/5 rounded-full" />
                      </div>

                      {/* Flask stopper cork */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-6 bg-amber-800 rounded-lg shadow-md z-10" />

                      {/* Floating hearts above flask */}
                      <div className="absolute -top-10 inset-x-0 h-10 overflow-hidden pointer-events-none">
                        <motion.div
                          animate={{ y: [-10, -30], opacity: [0, 1, 0] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                          className="text-pink-500 flex justify-center gap-1"
                        >
                          <Heart size={14} fill="currentColor" />
                        </motion.div>
                      </div>
                    </div>

                    <h4 className="text-lg font-black text-slate-800 dark:text-white mb-2">
                      Mélangeur en marche
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
                      La couleur du liquide s'ajuste dynamiquement à ton savant mélange d'affinités mutuelles. Admire la douce fusion stellaire dans le becher.
                    </p>
                  </motion.div>
                )}

                {step === 'brewing' && (
                  <motion.div 
                    key="brewing-screen"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center flex-grow py-8"
                  >
                    {/* Heated shaking flask */}
                    <motion.div 
                      className="relative w-52 h-64 mb-6"
                      animate={{ 
                        rotate: [-2, 2, -2, 2, -2],
                        y: [-1, 2, -2, 1, -1]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 0.25, 
                        ease: "easeInOut" 
                      }}
                    >
                      {/* Flask boarder */}
                      <div className="absolute inset-0 border-4 border-slate-700/30 dark:border-white/20 rounded-[4rem] rounded-t-[1.5rem] flex items-end overflow-hidden shadow-2xl p-0.5">
                        <div 
                          className="w-full h-4/5 relative"
                          style={{ 
                            backgroundColor: currentLiquidColor,
                          }}
                        >
                          {/* Extreme boiling bubbles */}
                          {bubbles.map(b => (
                            <motion.div
                              key={b.id}
                              initial={{ y: "100%", x: `${b.left}%`, opacity: 0 }}
                              animate={{ y: "-10%", opacity: [0, 0.9, 0.9, 0] }}
                              transition={{
                                duration: b.duration * 0.4, // speed up boiling!
                                repeat: Infinity,
                                ease: "easeOut"
                              }}
                              style={{ width: b.size * 1.2, height: b.size * 1.2 }}
                              className="absolute rounded-full bg-white/50"
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Hot furnace indicator at bottom */}
                      <div className="absolute -bottom-2 inset-x-8 h-4 bg-orange-500/40 rounded-full blur-md" />
                    </motion.div>

                    <h4 className="text-xl font-black text-rose-500 dark:text-rose-400 mb-2 animate-pulse">
                      Brasage en cours...
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
                      Nous fusionnons les rires, les baisers volés, et la tendresse inconditionnelle. La réaction amoureuse libère un élixir merveilleux...
                    </p>
                  </motion.div>
                )}

                {step === 'ready' && result && (
                  <motion.div 
                    key="ready-screen"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center flex-grow py-4"
                  >
                    {/* Glowing brewed potion glass */}
                    <div className="relative w-36 h-36 mb-6 flex items-center justify-center">
                      <div className="absolute inset-0 bg-pink-500/10 rounded-full blur-2xl animate-pulse" />
                      <motion.div 
                        animate={{ y: [-4, 4, -4] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="relative z-10 p-6 rounded-[2rem] border border-pink-200/50 dark:border-pink-900/40 shadow-xl"
                        style={{ backgroundColor: `${currentLiquidColor}1d` }}
                      >
                        <Wine 
                          size={48} 
                          className={`mx-auto ${result.accentColor}`} 
                          style={{ filter: `drop-shadow(0 0 10px ${currentLiquidColor})` }}
                        />
                      </motion.div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] tracking-wider font-extrabold text-pink-500 uppercase">
                          Élixir brassé avec succès
                        </span>
                        <h4 className="text-2xl font-black text-slate-800 dark:text-white mt-1 leading-tight">
                          {result.name}
                        </h4>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed text-justify px-2">
                        {result.description}
                      </p>

                      <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50/20 dark:from-pink-950/20 dark:to-rose-950/10 border border-pink-100/50 dark:border-pink-900/30">
                        <p className="text-xs italic font-semibold text-pink-600 dark:text-pink-400">
                          {result.quote}
                        </p>
                      </div>

                      <button
                        onClick={() => setStep('mixing')}
                        className="mt-2 text-xs font-bold text-slate-400 hover:text-pink-500 underline transition-colors cursor-pointer select-none"
                      >
                        Retourner à la recette
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

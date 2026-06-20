import { fetchPortfolioConfig } from '../lib/config-api';
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, Shield, Award, Cpu, Code2, Database, Brain, ArrowUpRight, Zap
} from 'lucide-react';

interface SkillItem {
  name: string;
  level: number;
  description?: string;
  tags?: string[];
}

// Detailed metadata with explanations for active indicators to enrich the user's focus view
const SKILL_METADATA: Record<string, { desc: string; category: string; icon: React.ReactNode; levelLabel: string }> = {
  'React': {
    desc: 'Création d\'interfaces performantes de classe production (React 18 & 19, Hooks v2, Context API, SSR/Next.js).',
    category: 'Ingénierie Frontend',
    icon: <Code2 size={16} className="text-cyan-400" />,
    levelLabel: 'Expert / Formateur'
  },
  'Node.js': {
    desc: 'Développement de backends asynchrones scalables, architectures RESTful, Express, Middlewares et web sockets.',
    category: 'Architecture Backend',
    icon: <Cpu size={16} className="text-emerald-400" />,
    levelLabel: 'Avancé'
  },
  'TypeScript': {
    desc: 'Typage statique strict haut de gamme, génériques complexes, interfaces d\'API robustes et intégration d\'outils.',
    category: 'Langages typés',
    icon: <Shield size={16} className="text-blue-400" />,
    levelLabel: 'Haute Maîtrise'
  },
  'Python': {
    desc: 'Programmation scientifique, scripts d\'automatisation avancés, modélisation IA et manipulation massive de Big Data.',
    category: 'Calcul Scientifique',
    icon: <Code2 size={16} className="text-blue-500" />,
    levelLabel: 'Expert Principal'
  },
  'Tailwind CSS': {
    desc: 'Conception d\'interfaces utilisateur pixel-parfaites, dalles responsive, bento-grids, thémage dynamique.',
    category: 'Design d\'Interface',
    icon: <Award size={16} className="text-indigo-400" />,
    levelLabel: 'Excellent'
  },
  'PostgreSQL': {
    desc: 'Modélisation relationnelle de bases ACID compliquées, requêtes d\'agrégation optimisées, indexation et triggers.',
    category: 'Stockage Relationnel',
    icon: <Database size={16} className="text-accent" />,
    levelLabel: 'Avancé'
  },
  'Pandas': {
    desc: 'Préparation et manipulation de séries temporelles complexes, nettoyage de données volumineuses, agrégation et jointure.',
    category: 'Data Science',
    icon: <Database size={16} className="text-orange-400" />,
    levelLabel: 'Expert'
  },
  'Scikit-learn': {
    desc: 'Conception de pipelines de Machine learning classique (Classificateurs, Régressions, Random Forests, K-Means).',
    category: 'Apprentissage ML',
    icon: <Brain size={16} className="text-purple-400" />,
    levelLabel: 'Haute Maîtrise'
  },
  'TensorFlow': {
    desc: 'Création et optimisation de réseaux de neurones profonds (CNN pour la classification d\'images, Transformers).',
    category: 'Deep Learning',
    icon: <Cpu size={16} className="text-amber-500" />,
    levelLabel: 'Praticien Certifié'
  },
  'SQL': {
    desc: 'Maîtrise absolue du standard ANSI SQL, gestion de partitions, jointures complexes, optimisation des plans de requêtes.',
    category: 'Données Structurées',
    icon: <Database size={16} className="text-accent" />,
    levelLabel: 'Maîtrise Totale'
  },
  'Data Visualization (D3.js)': {
    desc: 'Conception de graphiques vectoriels dynamiques sur mesure, manipulation et intégration directe d\'arbres DOM.',
    category: 'Visualisation',
    icon: <Award size={16} className="text-pink-400" />,
    levelLabel: 'Compétent / d3'
  },
  'Machine Learning': {
    desc: 'Architectures de modèles supervisés, évaluation A/B Testing, ingénierie de variables prédictives.',
    category: 'Intelligence Artificielle',
    icon: <Brain size={16} className="text-violet-400" />,
    levelLabel: 'Médiateur Technique'
  },
  'Git & GitHub': {
    desc: 'Stratégies de branching (Gitflow), résolutions avancées de conflits, rebasing, pull requests et peer validation.',
    category: 'Méthodologie Collaboratif',
    icon: <Award size={16} className="text-slate-300" />,
    levelLabel: 'Flux Expérimenté'
  },
  'Docker': {
    desc: 'Conteneurisation d\'applications, fichiers Dockerfile multi-stages optimisés, architectures de microservices.',
    category: 'DevOps / Infrastructure',
    icon: <Cpu size={16} className="text-sky-450 text-sky-400" />,
    levelLabel: 'Opérationnel / DevOps'
  },
  'CI/CD': {
    desc: 'Mise en place de workflows d\'intégration et de déploiement continu via GitHub Actions vers cloud GCP.',
    category: 'DevOps / automatisation',
    icon: <Shield size={16} className="text-teal-400" />,
    levelLabel: 'Autonome'
  },
  'Méthodes Agiles': {
    desc: 'Organisation en sprints courts, rituels Scrum / Kanban, gestion des tableaux Jira et priorisation des backlogs.',
    category: 'Méthodologie Agile',
    icon: <CheckCircle size={16} className="text-emerald-400" />,
    levelLabel: 'Scrum Master'
  },
  'AWS / Cloud': {
    desc: 'Hébergement applicatif sur instances virtuelles, seaux d\'objets S3 sécurisés, gestion élémentaire IAM.',
    category: 'Ingénierie Cloud',
    icon: <Brain size={16} className="text-orange-500" />,
    levelLabel: 'Praticien Cloud'
  },
  'UI/UX Design': {
    desc: 'Conception de wireframes interactifs, ergonomie de conversion web, palette de contraste de couleurs.',
    category: 'Design Expérientiel',
    icon: <Award size={16} className="text-purple-300" />,
    levelLabel: 'Sensibilité Forte'
  }
};

export const RadarSkillsChart: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [hoveredSkill, setHoveredSkill] = useState<SkillItem | null>(null);
  const [skillsList, setSkillsList] = useState<any[]>([]);

  const fetchSkills = async () => {
    try {
      const data = await fetchPortfolioConfig();
        if (data) {
        if (data.skills && Array.isArray(data.skills)) {
          setSkillsList(data.skills);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    // Fallback static structure
    setSkillsList([
      { id: 'development', title: 'Développement', skills: [] },
      { id: 'data-science', title: 'Data Science', skills: [] },
      { id: 'autres', title: 'Autres', skills: [] }
    ]);
  };

  useEffect(() => {
    fetchSkills();
    window.addEventListener('portfolio_config_updated', fetchSkills);
    return () => window.removeEventListener('portfolio_config_updated', fetchSkills);
  }, []);

  // Combine skills to make lists for each view category
  const activeSkillsList = useMemo<SkillItem[]>(() => {
    if (activeCategory === 'all') {
      const topSkills: SkillItem[] = [];
      skillsList.forEach(category => {
        if (category.skills && category.skills.length > 0) {
          topSkills.push(category.skills[0]);
        }
      });
      const allSkills = skillsList.flatMap(c => c.skills || []);
      while (topSkills.length < 6 && allSkills.length > topSkills.length) {
        const next = allSkills.find(s => !topSkills.includes(s));
        if (next) topSkills.push(next);
        else break;
      }
      return topSkills.slice(0, 6);
    }

    const matchedCategory = skillsList.find(c => c.id === activeCategory);
    return matchedCategory?.skills || [];
  }, [skillsList, activeCategory]);

  // If there's no hovered skill, fallback to the top skill dynamically
  const displayedSkill = hoveredSkill || activeSkillsList[0] || null;

  // Geometry parameters
  const size = 380;
  const center = size / 2;
  const maxRadius = size * 0.36; // Maximum size representing level 100
  const totalAxes = activeSkillsList.length;

  // Compute geometric radar axes coordinates
  const radarAxes = useMemo(() => {
    return activeSkillsList.map((skill, index) => {
      // First axis starts at vertical top (-90 degrees)
      const angle = (index * 2 * Math.PI) / totalAxes - Math.PI / 2;
      const factor = skill.level / 100;
      
      const xMax = center + Math.cos(angle) * maxRadius;
      const yMax = center + Math.sin(angle) * maxRadius;
      
      const xSkill = center + Math.cos(angle) * (maxRadius * factor);
      const ySkill = center + Math.sin(angle) * (maxRadius * factor);

      return {
        ...skill,
        angle,
        xMax,
        yMax,
        xSkill,
        ySkill
      };
    });
  }, [activeSkillsList, size, center, maxRadius, totalAxes]);

  // String points formatted for the visual SVG polygon representation
  const polygonPointsStr = useMemo(() => {
    return radarAxes.map(axis => `${axis.xSkill},${axis.ySkill}`).join(' ');
  }, [radarAxes]);

  // Background radial lines to draw polygons (representing scale coordinates e.g. 25%, 50%, 75%, 100%)
  const concentricRings = [25, 50, 75, 100];

  return (
    <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl p-5 md:p-8 shadow-sm">
      
      {/* Tab selectors for Radar scope */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Zap size={18} className="text-accent animate-pulse" />
            <span>Radar de Profil Technique</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cartographie interactive du spectre de compétences. Survolez les points du polygone pour détailler le savoir-faire.
          </p>
        </div>

        {/* Categories Controls */}
        <div className="flex bg-slate-200/60 dark:bg-slate-950/45 p-1 rounded-xl border border-slate-200/30 dark:border-slate-800/60 flex-wrap">
          <button
            onClick={() => { setActiveCategory('all'); setHoveredSkill(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
              activeCategory === 'all' 
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Vue Globale
          </button>
          
          {skillsList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setHoveredSkill(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                activeCategory === cat.id
                  ? 'bg-accent text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel Content: Split into vector SVG Radar on left, Detail panel on right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* SVG Graphic (Col span 7) */}
        <div className="md:col-span-7 flex justify-center items-center relative overflow-hidden select-none">
          
          {/* SVG Frame */}
          <svg 
            width={size} 
            height={size} 
            viewBox={`0 0 ${size} ${size}`} 
            className="w-full max-w-[340px] md:max-w-full h-auto drop-shadow-xl z-10"
          >
            <defs>
              {/* Radial color gradient inside active skill polygon matching dark vs light themes */}
              <radialGradient id="radarSlope" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1" />
                <stop offset="65%" stopColor="#ef3333" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#ef3131" stopOpacity="0.65" />
              </radialGradient>
              
              {/* Specialized slope colors depending on active visual categories */}
              <radialGradient id="slopeDev" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.42" />
              </radialGradient>
              <radialGradient id="slopeDS" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.42" />
              </radialGradient>
              <radialGradient id="slopeAutres" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.42" />
              </radialGradient>

              {/* Polished drop filter drop shadow */}
              <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="x" dy="2" stdDeviation="4" floodColor="#ef3131" floodOpacity="0.15" />
              </filter>
            </defs>

            {/* Ring Axis Circles grid outlines */}
            {concentricRings.map((ringLevel) => {
              // Points formatted for polygon representations at exact level ring
              const ringPoints = activeSkillsList.map((_, index) => {
                const angle = (index * 2 * Math.PI) / totalAxes - Math.PI / 2;
                const r = maxRadius * (ringLevel / 100);
                const x = center + Math.cos(angle) * r;
                const y = center + Math.sin(angle) * r;
                return `${x},${y}`;
              }).join(' ');

              return (
                <g key={ringLevel}>
                  {/* Concentric polygon skeleton wireframe */}
                  <polygon 
                    points={ringPoints} 
                    className="fill-none stroke-slate-200 dark:stroke-slate-800" 
                    strokeWidth="1" 
                  />
                  
                  {/* Dotted level values indicators along first vertical Axis */}
                  <text 
                    x={center + 3} 
                    y={center - (maxRadius * (ringLevel / 100)) + 3} 
                    className="font-mono text-[9px] fill-slate-400 dark:fill-slate-500 font-semibold"
                    textAnchor="start"
                  >
                    {ringLevel}%
                  </text>
                </g>
              );
            })}

            {/* Straight radial lines representing coordinates axes */}
            {radarAxes.map((axis, index) => (
              <line 
                key={`line-${index}`}
                x1={center} 
                y1={center} 
                x2={axis.xMax} 
                y2={axis.yMax} 
                className="stroke-slate-200 dark:stroke-slate-800/80" 
                strokeWidth="1.2" 
                strokeDasharray={index % 2 === 1 ? "4,4" : "0"}
              />
            ))}

            {/* The active area polygon path with beautiful fill and solid borders */}
            <motion.polygon
              points={polygonPointsStr}
              fill={
                activeCategory === 'dev' ? 'url(#slopeDev)' : 
                activeCategory === 'ds' ? 'url(#slopeDS)' :
                activeCategory === 'autres' ? 'url(#slopeAutres)' : 'url(#radarSlope)'
              }
              stroke={
                activeCategory === 'dev' ? '#2563eb' : 
                activeCategory === 'ds' ? '#f97316' :
                activeCategory === 'autres' ? '#10b981' : '#f43f5e'
              }
              strokeWidth="2.5"
              className="transition-colors duration-500"
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 15 }}
            />

            {/* Invisible hover-trigger segments for outer sections targeting easier mobile touch */}
            {radarAxes.map((axis, index) => {
              const textOffset = 21;
              const angle = axis.angle;
              const textX = center + Math.cos(angle) * (maxRadius + textOffset);
              const textY = center + Math.sin(angle) * (maxRadius + textOffset);

              return (
                <g key={`axis-ui-${index}`}>
                  {/* Outer names titles */}
                  <text
                    x={textX}
                    y={textY}
                    className="font-mono text-[9px] sm:text-[10px] font-extrabold fill-slate-700 dark:fill-slate-300 pointer-events-none"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {axis.name.split(' ')[0]} {/* shortened for smaller viewports */}
                  </text>
                  
                  {/* Smaller helper second line text for axis name if space permits */}
                  {axis.name.split(' ').length > 1 && (
                    <text
                      x={textX}
                      y={textY + 11}
                      className="font-mono text-[8px] sm:text-[9px] fill-slate-400 dark:fill-slate-500 pointer-events-none"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {axis.name.split(' ').slice(1).join(' ')}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Bullet nodes placed at precise vertex boundaries */}
            {radarAxes.map((axis, index) => {
              const isHovered = displayedSkill?.name === axis.name;
              let dotColor = 'fill-rose-500';
              if (activeCategory === 'dev') dotColor = 'fill-blue-500';
              else if (activeCategory === 'ds') dotColor = 'fill-orange-500';
              else if (activeCategory === 'autres') dotColor = 'fill-emerald-500';

              return (
                <g 
                  key={`dot-group-${index}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredSkill(axis)}
                  onTouchStart={() => setHoveredSkill(axis)}
                >
                  {/* Interactive glowing ring on active status */}
                  {isHovered && (
                    <circle
                      cx={axis.xSkill}
                      cy={axis.ySkill}
                      r="12"
                      className="fill-none stroke-current opacity-30 animate-ping"
                      style={{
                        color: activeCategory === 'dev' ? '#2563eb' : 
                               activeCategory === 'ds' ? '#f97316' :
                               activeCategory === 'autres' ? '#10b981' : '#f43f5e'
                      }}
                    />
                  )}

                  {/* Standard coordinate dot */}
                  <circle
                    cx={axis.xSkill}
                    cy={axis.ySkill}
                    r={isHovered ? "7" : "4.5"}
                    className={`${dotColor} stroke-white dark:stroke-slate-950 transition-all duration-300`}
                    strokeWidth={isHovered ? "2.5" : "1.5"}
                  />
                </g>
              );
            })}

          </svg>

          {/* Central Hub Core Overlay text representing active category highlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none text-center flex flex-col items-center">
            <span className="text-[12px] font-mono tracking-widest text-slate-300 dark:text-slate-700 font-extrabold uppercase">
              {activeCategory === 'all' ? 'SYNTHÈSE' : 
               activeCategory === 'dev' ? 'DEV_CORE' : 
               activeCategory === 'ds' ? 'DATA_ML' : 'SYS_OPS'}
            </span>
          </div>

        </div>

        {/* Interactive Detailed Skill Card on Right (Col span 5) */}
        <div className="md:col-span-5 h-full flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {displayedSkill && (
              <motion.div
                key={displayedSkill.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="bg-white dark:bg-slate-950/80 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-md min-h-[220px] flex flex-col justify-between"
              >
                <div>
                  
                  {/* Meta heading */}
                  <div className="flex justify-between items-start mb-2.5">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#f43f5e] dark:text-[#f43f5e]/80 flex items-center gap-1">
                      {SKILL_METADATA[displayedSkill.name]?.icon || <Award size={13} />}
                      {SKILL_METADATA[displayedSkill.name]?.category || 'Compétence technique'}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-slate-400">
                      NIVEAU : <span className="text-slate-800 dark:text-slate-100 font-black">{displayedSkill.level}%</span>
                    </span>
                  </div>

                  {/* Title & level indicator */}
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-1.5 justify-between">
                    <span>{displayedSkill.name}</span>
                    <span className={`text-[10px] font-mono font-bold rounded px-1.5 py-0.5 border ${
                      activeCategory === 'dev' 
                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
                        : activeCategory === 'ds' 
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' 
                        : 'bg-rose-500/10 text-[#f43f5e] border-rose-500/20'
                    }`}>
                      {SKILL_METADATA[displayedSkill.name]?.levelLabel || 'Expérimenté'}
                    </span>
                  </h4>

                  {/* Progressive indicator bar */}
                  <div className="w-full bg-slate-150 dark:bg-slate-850 rounded-full h-1 my-3 overflow-hidden">
                    <motion.div 
                      className={`h-1 rounded-full ${
                        activeCategory === 'dev' ? 'bg-blue-500' :
                        activeCategory === 'ds' ? 'bg-orange-500' : 'bg-rose-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${displayedSkill.level}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>

                  {/* Substantive summary sentence explaining competence value */}
                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed mb-4">
                    {SKILL_METADATA[displayedSkill.name]?.desc || 'Maîtrise complète et rigoureuse des technologies associées à ce champ métier dans des contextes professionnels exigeants.'}
                  </p>

                </div>

                {/* Micro tech features tagging */}
                <div className="flex flex-wrap gap-1.5 mt-auto border-t border-slate-100 dark:border-slate-800/80 pt-3.5">
                  <span className="text-[9px] font-mono py-0.5 px-2 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-md">
                    Autonomie 5/5
                  </span>
                  <span className="text-[9px] font-mono py-0.5 px-2 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-md">
                    Production Ready
                  </span>
                  <span className="text-[9px] font-mono py-0.5 px-2 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-md flex items-center gap-1">
                    <ArrowUpRight size={8} /> Projets Associés
                  </span>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { useData } from '../context/DataContext';
import { RadarSkillsChart } from './RadarSkillsChart';
import { ListFilter, Radar } from 'lucide-react';

const SkillBar: React.FC<{ name: string; level: number; index: number }> = ({ name, level, index }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div 
      className="mb-5 p-1.5 rounded-xl transition-colors duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/40" 
      ref={ref}
      whileHover={{ x: 6 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    >
      <div className="flex justify-between mb-1.5">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{name}</span>
        <span className="text-xs font-bold text-accent font-mono">{level}%</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden relative">
        <motion.div
          className="bg-accent h-2.5 rounded-full relative overflow-hidden"
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : {}}
          transition={{ duration: 1.2, delay: index * 0.08, ease: "easeOut" }}
        >
          {/* Animated shine line */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent w-1/3 h-full"
            animate={{ x: ['-100%', '300%'] }}
            transition={{ repeat: Infinity, duration: 2.2, delay: index * 0.15, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export const Skills = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [viewMode, setViewMode] = useState<'radar' | 'lists'>('radar');
  const { skills: skillsData } = useData();

  const skillsList = [
    { id: 'development', title: 'Développement', skills: skillsData.development },
    { id: 'data-science', title: 'Data Science', skills: skillsData.dataScience },
    { id: 'autres', title: 'Autres', skills: skillsData.autres }
  ];

  return (
    <section id="skills" className="py-20">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
              Compétences Techniques
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">
              Explorez mon profil et mon niveau de maîtrise selon deux structures de visualisations sur mesure de votre choix.
            </p>

            {/* Layout Toggler Navigation Tabs */}
            <div className="inline-flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 relative z-20">
              <button
                onClick={() => setViewMode('radar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                  viewMode === 'radar'
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-md'
                     : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Radar size={13} className={viewMode === 'radar' ? 'text-rose-500 animate-pulse' : ''} />
                <span>RADAR DIRECT</span>
              </button>

              <button
                onClick={() => setViewMode('lists')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                  viewMode === 'lists'
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <ListFilter size={13} className={viewMode === 'lists' ? 'text-accent' : ''} />
                <span>Vue analytique</span>
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === 'radar' ? (
              <motion.div
                key="radar-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <RadarSkillsChart />
              </motion.div>
            ) : (
              <motion.div
                key="list-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
              >
                {skillsList.map((categoryData, catIdx) => (
                  <motion.div 
                    key={categoryData.id || catIdx}
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="p-6 bg-white/65 dark:bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-slate-100/50 dark:border-slate-800/80"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{categoryData.title}</h3>
                    </div>
                    <div>
                      {(categoryData.skills || []).map((skill, index) => (
                        <SkillBar key={`${skill.name}-${index}`} name={skill.name} level={skill.level} index={index} />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

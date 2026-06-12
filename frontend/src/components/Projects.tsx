import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { Github, ExternalLink, X, GitCommit, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { projectsData as mockProjects } from '../data/mockData';
import { api } from '../api';
import { TiltCard } from './TiltCard';

const ProjectModal = ({ project, onClose }: { project: any; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'git'>('details');
  const [loading, setLoading] = useState(false);
  const [updates, setUpdates] = useState<any[]>([]);
  const [searchSummary, setSearchSummary] = useState('');
  const [sources, setSources] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchUpdates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/project-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: project.title, techs: project.techs })
      });
      if (!res.ok) throw new Error("Erreur de récupération des activités.");
      const data = await res.json();
      setUpdates(data.updates || []);
      setSearchSummary(data.searchSummary || '');
      setSources(data.sources || []);
    } catch (e: any) {
      setError(e.message || "Impossible d'obtenir les mises à jour via Google Search.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'git' && updates.length === 0) {
      fetchUpdates();
    }
  }, [activeTab]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm shadow-xs"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col border border-slate-200/40 dark:border-slate-800/40"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-20 cursor-pointer"
          >
            <X size={20} />
          </button>
          
          <div className="h-48 sm:h-56 w-full relative shrink-0">
            <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
            <div className="absolute bottom-4 left-6 right-6">
              <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full bg-amber-600/90 text-white mb-2 inline-block">
                {project.category}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-sans text-white tracking-tight">{project.title}</h3>
            </div>
          </div>

          <div className="flex border-b border-slate-150/40 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-950/20 px-6 pt-1 shrink-0 select-none">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'details'
                  ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <span>Présentation</span>
            </button>
            <button
              onClick={() => setActiveTab('git')}
              className={`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'git'
                  ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <GitCommit size={14} className="text-amber-600 dark:text-amber-400" />
              <span>Activité / Commits Réels</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-550"></span>
              </span>
            </button>
          </div>
          
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white/50 dark:bg-transparent">
            {activeTab === 'details' ? (
              <>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.techs.map((tech: string) => (
                    <span key={tech} className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 border border-slate-200/10">
                      {tech}
                    </span>
                  ))}
                </div>
                
                <h4 className="text-xs font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">À propos du projet</h4>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed text-sm">
                  {project.details}
                </p>
                
                <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 text-white transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <Github size={16} />
                    Code Source
                  </a>
                  {project.demo && project.demo !== '#' && project.demo !== '' && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-300 transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      <ExternalLink size={16} />
                      Visiter
                    </a>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-600/15 dark:border-amber-400/10 flex items-start gap-3">
                  <div className="p-2 bg-amber-600/10 dark:bg-amber-400/10 rounded-lg text-amber-600 dark:text-amber-400 shrink-0">
                    <Search size={16} className="animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-[10px] font-mono font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">
                      MOTEUR DE GROUNDING IA
                    </h5>
                    <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                      L'intelligence artificielle interroge l'index global de Google pour identifier les publications, dépôts open-source et modifications réelles associés pour forger un flux de commits ultra-authentique lié à l'ingénierie de Dels.
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <RefreshCw className="w-8 h-8 text-amber-605 dark:text-amber-400 animate-spin" />
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 animate-pulse text-center">
                      Consultation de l'index Google Search & génération de la chronologie Git...
                    </p>
                  </div>
                ) : error ? (
                  <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center gap-3 text-rose-600 dark:text-rose-450">
                    <AlertCircle size={20} />
                    <span className="text-xs font-medium">{error}</span>
                    <button
                      onClick={fetchUpdates}
                      className="ml-auto text-xs font-black uppercase tracking-wider underline cursor-pointer"
                    >
                      Réessayer
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {searchSummary && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850/40">
                        <span className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">
                          TENDANCES TECHNOLOGIQUES REELLES CONSTATEES
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                          "{searchSummary}"
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-4">
                        CHRONOLOGIE RECENTE DES COMMITS (VÉRIFIÉS)
                      </span>
                      
                      <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-6">
                        {updates.map((commit) => (
                          <div key={commit.commitHash} className="relative pl-6">
                            <div className={`absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                              commit.category === 'feature' ? 'bg-emerald-500' :
                              commit.category === 'fix' ? 'bg-rose-500' :
                              commit.category === 'refactor' ? 'bg-blue-500' :
                              commit.category === 'docs' ? 'bg-amber-500' : 'bg-slate-500'
                            }`} />
                            
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1">
                              <h5 className="text-xs font-extrabold text-slate-850 dark:text-slate-200 uppercase tracking-tight">
                                {commit.message}
                              </h5>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="px-1.5 py-0.5 text-[8px] font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                  {commit.commitHash}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                                  {commit.date}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
                              {commit.details}
                            </p>
                            
                            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-450 dark:text-slate-500">
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-450 dark:bg-slate-500" />
                                {commit.author}
                              </span>
                              <span className="capitalize px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-950/60 text-slate-500 text-[9px] border border-slate-100/50 dark:border-slate-800/40 font-bold uppercase tracking-wider">
                                {commit.category}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {sources.length > 0 && (
                      <div className="pt-4 border-t border-slate-150/40 dark:border-slate-800/40">
                        <span className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2.5">
                          SOURCES / DOCUMENTATION DE RECHERCHE ACTUALISÉE
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {sources.map((source, index) => (
                            <a
                              key={index}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 dark:hover:bg-slate-900 border border-slate-150/40 dark:border-slate-800/30 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-205 transition-all text-[11px] font-mono"
                            >
                              <span className="w-1 h-1 rounded-full bg-amber-500" />
                              <span className="max-w-[200px] truncate">{source.title}</span>
                              <ExternalLink size={10} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const Projects = () => {
  const [projectsData, setProjectsData] = useState<any[]>(mockProjects);
  
  useEffect(() => {
    api.getProjects()
      .then(data => {
        if (data && data.length > 0) {
          setProjectsData(data);
        }
      })
      .catch(err => console.error("Impossible de récupérer les projets:", err));
  }, []);

  const [filter, setFilter] = useState('Tous');
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  // Get original set of projects for category
  const categoryProjects = filter === 'Tous' 
    ? projectsData 
    : projectsData.filter(p => p.category === filter);

  // Extract unique technologies for the selected category
  const availableTechs = Array.from(
    new Set(categoryProjects.flatMap(p => p.techs))
  ).sort();

  // Filter projects by both category and technology if selected
  const filteredProjects = categoryProjects.filter(p => {
    if (selectedTech && availableTechs.includes(selectedTech)) {
      return p.techs.includes(selectedTech);
    }
    return true;
  });

  const displayedProjects = filteredProjects.slice(0, visibleCount);

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 3);
  };

  const handleShowLess = () => {
    setVisibleCount(3);
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFilterChange = (cat: string) => {
    setFilter(cat);
    setSelectedTech(null); // Reset tech filter on category change
    setVisibleCount(3); // Reset visible count when changing filter
  };

  return (
    <section id="projects" className="py-20 bg-slate-50 dark:bg-slate-800/50">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Projets Phares
          </h2>
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {['Tous', 'Dev', 'Data', 'Autres'].filter(cat => cat === 'Tous' || projectsData.some(p => p.category === cat)).map(cat => (
              <motion.button
                key={cat}
                onClick={() => handleFilterChange(cat)}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  filter === cat
                    ? 'bg-accent text-white shadow-md shadow-accent/20'
                    : 'bg-white/80 dark:bg-slate-900/60 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/80 shadow-xs'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          {/* Selection Dropdown to filter by technology */}
          <div className="mb-12 text-center max-w-xs mx-auto px-4">
            <label htmlFor="tech-select" className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5 block font-sans">
              Filtrer par technologie :
            </label>
            <div className="relative group">
              <select
                id="tech-select"
                value={selectedTech || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedTech(val === '' ? null : val);
                  setVisibleCount(3);
                }}
                className="w-full text-left pl-4 pr-10 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/70 hover:border-accent/50 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md text-slate-700 dark:text-slate-200 font-medium text-sm focus:ring-2 focus:ring-accent/40 focus:border-accent outline-none transition-all cursor-pointer appearance-none shadow-xs group-hover:shadow-sm"
              >
                <option value="">Toutes les technologies ({availableTechs.length})</option>
                {availableTechs.map((tech) => (
                  <option key={tech} value={tech}>
                    {tech}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 dark:text-slate-500 transition-transform group-hover:translate-y-[1px]">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {displayedProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex"
                >
                  <TiltCard maxTilt={12} scaleOnHover={1.03} className="w-full flex">
                    <div className="w-full bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-xl shadow-md border border-slate-100/60 dark:border-slate-700/50 hover:border-accent/40 dark:hover:border-accent/30 overflow-hidden flex flex-col transition-all duration-300">
                      <div className="h-48 relative overflow-hidden group/img cursor-pointer" onClick={() => setSelectedProject(project)}>
                        <img 
                          src={project.image} 
                          alt={project.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button 
                            className="px-4.5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold transform -translate-y-4 group-hover/img:translate-y-0 transition-all duration-300 shadow-lg cursor-pointer text-sm"
                          >
                            Voir détails <span>→</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer" onClick={() => setSelectedProject(project)}>
                          {project.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.techs.slice(0, 3).map((tech: string) => (
                            <span key={tech} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-550/5">
                              {tech}
                            </span>
                          ))}
                          {project.techs.length > 3 && (
                            <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-50 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 border border-slate-200/20">
                              +{project.techs.length - 3}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-450 text-sm leading-relaxed flex-1 mb-6">
                          {project.description}
                        </p>
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100 dark:border-slate-705">
                          <button 
                            onClick={() => setSelectedProject(project)}
                            className="group/link text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 transition-all cursor-pointer"
                          >
                            En savoir plus 
                            <span className="group-hover/link:translate-x-1 transition-transform duration-200">→</span>
                          </button>
                          <div className="flex gap-3">
                            <motion.a 
                              href={project.github} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              whileHover={{ scale: 1.25, rotate: 6 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                              <Github size={18} />
                            </motion.a>
                            {project.demo && project.demo !== '#' && project.demo !== '' && (
                              <motion.a 
                                href={project.demo} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                whileHover={{ scale: 1.25, rotate: -6 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" 
                                title="Visiter"
                              >
                                <ExternalLink size={18} />
                              </motion.a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {(visibleCount < filteredProjects.length || visibleCount > 3) && (
            <div className="mt-12 flex justify-center gap-4">
              {visibleCount < filteredProjects.length && (
                <button
                  onClick={handleShowMore}
                  className="px-8 py-3 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  Voir plus de projets
                </button>
              )}
              {visibleCount > 3 && (
                <button
                  onClick={handleShowLess}
                  className="px-8 py-3 rounded-full bg-white/80 dark:bg-slate-900/60 backdrop-blur-md text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  Voir moins
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </section>
  );
};

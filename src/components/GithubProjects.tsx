import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { 
  Github, 
  ExternalLink, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  Star, 
  GitFork, 
  Eye, 
  Clock,
  Sparkles,
  BookOpen,
  Dot,
  User,
  Users,
  Building
} from 'lucide-react';

interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  stars: number;
  forks: number;
  watchers: number;
  language: string | null;
  topics: string[];
  updatedAt: string;
  createdAt: string;
  pushedAt: string;
  size: number;
  license: string | null;
  private: boolean;
  owner?: string;
  ownerType?: 'user' | 'collaborator' | 'organization';
  ownerAvatar?: string;
}

export const GithubProjects = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedOwnerType, setSelectedOwnerType] = useState<'all' | 'user' | 'collaborator' | 'organization'>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'forks' | 'name'>('updated');

  const fetchRepos = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    setWarning(null);
    try {
      const url = `/api/github/repos${forceRefresh ? '?refresh=true' : ''}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Erreur serveur: Séquence de retour ${res.status}`);
      }
      const data = await res.json();
      
      setEnabled(data.enabled !== false);
      if (data.enabled !== false) {
        setRepos(data.repos || []);
        setCached(!!data.cached);
        setLastSync(data.lastSync || null);
        if (data.warning) setWarning(data.warning);
      }
    } catch (e: any) {
      console.error(e);
      setError("Impossible de charger les projets GitHub publique. Veuillez réessayer ultérieurement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  // Getting UNIQUE languages from repositories
  const languages = Array.from(
    new Set(repos.map((repo) => repo.language).filter(Boolean))
  ) as string[];

  // Filter & Sort Logic
  const filteredAndSortedRepos = repos
    .filter((repo) => {
      const matchesSearch = 
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.topics || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesLanguage = selectedLanguage 
        ? repo.language === selectedLanguage 
        : true;

      const matchesOwnerType = 
        selectedOwnerType === 'all'
          ? true
          : selectedOwnerType === 'user'
            ? (!repo.ownerType || repo.ownerType === 'user')
            : repo.ownerType === selectedOwnerType;
      
      return matchesSearch && matchesLanguage && matchesOwnerType;
    })
    .sort((a, b) => {
      if (sortBy === 'stars') return b.stars - a.stars;
      if (sortBy === 'forks') return b.forks - a.forks;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      // default: updated (by pushedAt timestamp)
      return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime();
    });

  // Calculate hours / minutes ago for last sync
  const getCacheTimeText = () => {
    if (!lastSync) return 'Jamais';
    const seconds = Math.floor((Date.now() - lastSync) / 1000);
    if (seconds < 60) return "À l'instant";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours} heure(s)`;
    return new Date(lastSync).toLocaleString('fr-FR');
  };

  const getLanguageColor = (lang: string | null) => {
    if (!lang) return 'bg-slate-400';
    const colors: Record<string, string> = {
      Python: 'bg-blue-500',
      TypeScript: 'bg-amber-500',
      JavaScript: 'bg-yellow-400',
      HTML: 'bg-orange-500',
      CSS: 'bg-indigo-400',
      Rust: 'bg-amber-700',
      Go: 'bg-cyan-400',
      Java: 'bg-red-600',
      C: 'bg-slate-500',
      'C++': 'bg-pink-500',
      Shell: 'bg-emerald-500',
      Jupyter: 'bg-orange-600',
    };
    return colors[lang] || 'bg-amber-400';
  };

  const userReposCount = repos.filter(r => !r.ownerType || r.ownerType === 'user').length;
  const collabReposCount = repos.filter(r => r.ownerType === 'collaborator').length;
  const orgReposCount = repos.filter(r => r.ownerType === 'organization').length;

  return (
    <section 
      ref={ref} 
      id="github" 
      className="py-16 sm:py-24 px-4 bg-slate-50/50 dark:bg-slate-900/10 min-h-[75vh]"
    >
      <div className="container mx-auto max-w-5xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 select-none mb-4 text-xs font-semibold tracking-wider uppercase"
          >
            <Github size={13} />
            <span>Intégration GitHub Live</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3"
          >
            Mes Projets GitHub
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base"
          >
            Tous mes dépôts publics synchronisés directement en temps réel depuis l'API GitHub de mon profil de développeur.
          </motion.p>
        </div>

        {/* State Validation */}
        {!enabled ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-50 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 rounded-2xl p-6 text-center max-w-md mx-auto"
          >
            <AlertCircle className="w-8 h-8 mx-auto mb-3 animate-bounce" />
            <h4 className="font-bold mb-1">Intégration Désactivée</h4>
            <p className="text-xs">
              La synchronisation automatique avec GitHub est actuellement désactivée dans les paramètres d'administration. Vous pouvez l'activer avec votre pseudonyme de développeur.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Dynamic Sync & Warning Panel */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white/70 dark:bg-slate-950/20 backdrop-blur-md rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 shadow-sm select-none">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  <div className="w-3 h-3 bg-emerald-400 rounded-full absolute inset-0 animate-ping opacity-60" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Source : API Publique GitHub
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block">
                    Mis à jour : {getCacheTimeText()} {cached && " (Mémoire Cache)"}
                  </span>
                </div>
              </div>

              {warning && (
                <div className="flex items-center gap-1.5 text-[10px] bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-200/20 max-w-sm">
                  <AlertCircle size={10} className="shrink-0" />
                  <span className="truncate">{warning}</span>
                </div>
              )}

              <button
                id="btn_sync_github"
                onClick={() => fetchRepos(true)}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-white dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-800 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200/40 dark:border-slate-800 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                title="Actualiser les projets depuis GitHub"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                <span>Mettre à jour</span>
              </button>
            </div>

            {/* Filter Tabs for Owner Types */}
            {(collabReposCount > 0 || orgReposCount > 0) && (
              <div className="flex flex-wrap items-center gap-2 mb-6 bg-slate-100/50 dark:bg-slate-950/25 p-1.5 rounded-2xl border border-slate-205/10 dark:border-slate-800 select-none">
                <button
                  onClick={() => setSelectedOwnerType('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    selectedOwnerType === 'all'
                      ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs border border-slate-200/50 dark:border-slate-700/50'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-transparent'
                  }`}
                >
                  Tous les Projets ({repos.length})
                </button>
                <button
                  onClick={() => setSelectedOwnerType('user')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedOwnerType === 'user'
                      ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200/50 dark:border-slate-700/50'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-transparent'
                  }`}
                >
                  <User size={12} className="shrink-0" />
                  <span>Mes Projets ({userReposCount})</span>
                </button>
                {collabReposCount > 0 && (
                  <button
                    onClick={() => setSelectedOwnerType('collaborator')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedOwnerType === 'collaborator'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/50 dark:border-slate-700/50'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-transparent'
                    }`}
                  >
                    <Users size={12} className="shrink-0" />
                    <span>Collaborations ({collabReposCount})</span>
                  </button>
                )}
                {orgReposCount > 0 && (
                  <button
                    onClick={() => setSelectedOwnerType('organization')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedOwnerType === 'organization'
                        ? 'bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-xs border border-slate-200/50 dark:border-slate-700/50'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-transparent'
                    }`}
                  >
                    <Building size={12} className="shrink-0" />
                    <span>Organisations ({orgReposCount})</span>
                  </button>
                )}
              </div>
            )}

            {/* Filters, Sorts & Search controls block */}
            <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6">
                
                {/* Live Search */}
                <div className="relative col-span-1 md:col-span-2">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search size={16} />
                  </span>
                  <input
                    id="input_github_search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher par nom de dépôt, caractéristiques..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-2xl focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent text-slate-800 dark:text-white shadow-inner transition-colors"
                  />
                </div>

                {/* Sort Option */}
                <div>
                  <select
                    id="select_github_sort"
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="w-full py-2.5 px-3.5 text-sm bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-2xl focus:outline-hidden text-slate-800 dark:text-white font-medium shadow-inner cursor-pointer"
                  >
                    <option value="updated">Récemment mis à jour</option>
                    <option value="stars">Nombre d'étoiles</option>
                    <option value="forks">Nombre de forks</option>
                    <option value="name">Nom de dépôt (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Languages tags filters chips */}
              {languages.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono mr-1">
                    Langages : 
                  </span>
                  <button
                    onClick={() => setSelectedLanguage(null)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                      selectedLanguage === null
                        ? 'bg-accent text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Tout ({repos.length})
                  </button>
                  {languages.map((lang) => {
                    const count = repos.filter(r => r.language === lang).length;
                    return (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-3 py-1 rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
                          selectedLanguage === lang
                            ? 'bg-accent text-white shadow-md'
                            : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${getLanguageColor(lang)}`} />
                        <span>{lang}</span>
                        <span className="opacity-60 text-[10px]">({count})</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/15 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-3xl p-6 text-center shadow-xs flex items-center justify-center gap-3">
                <AlertCircle size={22} className="shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Loading Grid Skeleton */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((idx) => (
                  <div 
                    key={idx}
                    className="border border-slate-200/50 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/20 rounded-3xl p-6 relative overflow-hidden"
                  >
                    <div className="animate-pulse flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        <div className="h-5 w-5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                      </div>
                      <div className="flex gap-4 pt-2">
                        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Repositories Grid Display (No repos state handled) */}
                {filteredAndSortedRepos.length === 0 ? (
                  <div className="text-center py-16 bg-white/30 dark:bg-slate-900/10 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <BookOpen className="w-10 h-10 mx-auto text-slate-350 mb-3" />
                    <h4 className="text-slate-800 dark:text-slate-205 font-bold mb-1">Aucun dépôt trouvé</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Aucun projet GitHub ne correspond aux filtres de recherche ou de langage sélectionnés.
                    </p>
                  </div>
                ) : (
                  <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredAndSortedRepos.map((repo, index) => (
                        <motion.div
                          key={repo.id}
                          layout
                          initial={{ opacity: 0, scale: 0.97, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
                          className="group relative flex flex-col justify-between border border-slate-200/50 hover:border-accent/40 dark:border-slate-800/80 dark:hover:border-accent/30 bg-white/70 hover:bg-white dark:bg-slate-900/30 dark:hover:bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <div>
                            {/* Card Header title and links */}
                            <div className="flex justify-between items-start gap-3 mb-1">
                              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-accent font-sans truncate tracking-tight">
                                {repo.name}
                              </h3>
                              <div className="flex items-center gap-2 select-none shrink-0 pt-0.5">
                                <a
                                  href={repo.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
                                  title="Consulter le code sur GitHub"
                                >
                                  <Github size={15} />
                                </a>
                                {repo.homepage && (
                                  <a
                                    href={repo.homepage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
                                    title="Visiter la publication live"
                                  >
                                    <ExternalLink size={15} />
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Owner Badge */}
                            {repo.ownerType && repo.ownerType !== 'user' && (
                              <div className="flex items-center gap-1.5 mb-3.5 select-none font-mono">
                                {repo.ownerAvatar ? (
                                  <img 
                                    src={repo.ownerAvatar} 
                                    alt={repo.owner} 
                                    referrerPolicy="no-referrer"
                                    className="w-4 h-4 rounded-full border border-slate-250/10 bg-slate-100 dark:bg-slate-800" 
                                  />
                                ) : (
                                  <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-500">
                                    {repo.owner?.substring(0, 1).toUpperCase()}
                                  </div>
                                )}
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                  repo.ownerType === 'organization' 
                                    ? 'bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 border border-pink-200/5' 
                                    : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200/5'
                                }`}>
                                  {repo.ownerType === 'organization' ? <Building size={10} className="shrink-0" /> : <User size={10} className="shrink-0" />}
                                  <span>{repo.owner}</span>
                                </span>
                              </div>
                            )}

                            {/* Description */}
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-sans mb-5 line-clamp-3 min-h-[2.5rem] antialiased">
                              {repo.description || "Aucune description fournie pour ce dépôt public."}
                            </p>
                          </div>

                          <div>
                            {/* Topics tags list */}
                            {repo.topics.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-5 overflow-hidden max-h-12">
                                {repo.topics.slice(0, 4).map((topic) => (
                                  <span 
                                    key={topic}
                                    className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-405 lowercase tracking-tight select-none border border-slate-200/10"
                                  >
                                    #{topic}
                                  </span>
                                ))}
                                {repo.topics.length > 4 && (
                                  <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 text-slate-400 uppercase select-none">
                                    +{repo.topics.length - 4}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Card Footer: Metadata and stats */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50 font-mono text-[10px] sm:text-xs text-slate-400 select-none">
                              
                              {/* Primary Language */}
                              <div className="flex items-center gap-1.5">
                                {repo.language ? (
                                  <>
                                    <span className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`} />
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                      {repo.language}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="w-2 h-2 rounded-full bg-slate-350" />
                                    <span>Sans langage</span>
                                  </>
                                )}
                              </div>

                              {/* GitHub stats stars/forks */}
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 hover:text-amber-500 transition-colors" title={`${repo.stars} étoiles`}>
                                  <Star size={12} className="text-amber-500" />
                                  <span>{repo.stars}</span>
                                </span>
                                <span className="flex items-center gap-1 hover:text-blue-400 transition-colors" title={`${repo.forks} forks`}>
                                  <GitFork size={12} />
                                  <span>{repo.forks}</span>
                                </span>
                                <span className="flex items-center gap-1" title="Dernier push">
                                  <Clock size={11} />
                                  <span>
                                    {new Date(repo.pushedAt).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })}
                                  </span>
                                </span>
                              </div>
                              
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </>
            )}
          </>
        )}

      </div>
    </section>
  );
};

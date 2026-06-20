import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { 
  Search, 
  ExternalLink, 
  Calendar, 
  Cpu, 
  BookOpen, 
  RefreshCw, 
  AlertCircle, 
  Newspaper, 
  ArrowRight,
  TrendingUp,
  Globe,
  Tag,
  Volume2,
  VolumeX,
  Pause
} from 'lucide-react';

interface Article {
  title: string;
  technology: string;
  excerpt: string;
  date: string;
  sourceName: string;
  url: string;
}

export const Blog = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [selectedTech, setSelectedTech] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [trendSummary, setTrendSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio Speech States
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Speech synthesis cleanup & state handlers
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        if (!(window as any).isSpeakingDescriptiveAnswer) {
          window.speechSynthesis.cancel();
        }
      }
    };
  }, []);

  const handleSpeak = (article: Article) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;

    if (currentlyPlaying === article.title) {
      if (synth.speaking) {
        if (synth.paused) {
          synth.resume();
          setIsPaused(false);
        } else {
          synth.pause();
          setIsPaused(true);
        }
      } else {
        startSpeaking(article);
      }
    } else {
      synth.cancel();
      startSpeaking(article);
    }
  };

  const startSpeaking = (article: Article) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;

    const utteranceText = `Article sur ${article.technology} publié par ${article.sourceName}. Titre : ${article.title}. Résumé : ${article.excerpt}`;
    const utterance = new SpeechSynthesisUtterance(utteranceText);
    utterance.lang = 'fr-FR';

    // Try finding french voice
    if (synth.getVoices) {
      const voices = synth.getVoices();
      const frenchVoice = voices.find(v => v.lang.startsWith('fr'));
      if (frenchVoice) {
        utterance.voice = frenchVoice;
      }
    }

    utterance.onend = () => {
      setCurrentlyPlaying(null);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn("SpeechSynthesis error:", e);
      setCurrentlyPlaying(null);
      setIsPaused(false);
    };

    setCurrentlyPlaying(article.title);
    setIsPaused(false);
    synth.speak(utterance);
  };

  const handleStopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setCurrentlyPlaying(null);
    setIsPaused(false);
  };

  const techFilters = [
    { label: 'Tous', value: 'All' },
    { label: 'React & TS', value: 'React' },
    { label: 'Python & FastAPI', value: 'Python' },
    { label: 'AI & Machine Learning', value: 'Machine Learning' },
    { label: 'Data Engineering', value: 'Data' }
  ];

  const fetchArticles = async (tech: string, forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);
    try {
      const url = `/api/blog?tech=${encodeURIComponent(tech)}&refresh=${forceRefresh ? 'true' : 'false'}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Impossible de joindre l'API d'actualités.");
      }
      const data = await res.json();
      setArticles(data.articles || []);
      setTrendSummary(data.techTrendSummary || '');
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Une erreur est survenue lors de la synchronisation via Google Search. Affichage des articles stockés.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchArticles(selectedTech);
  }, [selectedTech]);

  // Client-side text filter on current articles
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const query = searchQuery.toLowerCase().trim();
    return articles.filter(article => 
      article.title.toLowerCase().includes(query) || 
      article.excerpt.toLowerCase().includes(query) ||
      article.technology.toLowerCase().includes(query) ||
      article.sourceName.toLowerCase().includes(query)
    );
  }, [articles, searchQuery]);

  // Map technology labels to visual colors for tags
  const getTechBadgeStyle = (tech: string) => {
    const t = tech.toLowerCase();
    if (t.includes('react') || t.includes('ts') || t.includes('typescript')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200/40';
    }
    if (t.includes('python')) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/40';
    }
    if (t.includes('machine') || t.includes('learning') || t.includes('ml') || t.includes('ai') || t.includes('ia')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200/40';
    }
    if (t.includes('data') || t.includes('airflow') || t.includes('sql') || t.includes('postgres')) {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/40';
    }
    return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-350 border-slate-700/30';
  };

  return (
    <section id="blog" className="py-20 px-4 md:px-6 max-w-7xl mx-auto w-full flex-grow flex flex-col justify-center">
      {/* Title block */}
      <div className="text-center max-w-3xl mx-auto mb-12" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-mono font-black tracking-widest uppercase mb-3 border border-amber-500/20"
        >
          <Newspaper size={13} />
          <span>Journal de Veille</span>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans mb-4"
        >
          Veille Technologique <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-600 to-amber-400">&</span> Blog
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-sans max-w-2xl mx-auto"
        >
          Extraction et compilation en temps réel d'actualités et publications majeures sur mes technologies de prédilection via le moteur Gemini et la recherche Google.
        </motion.p>
      </div>

      {/* Control bar / Filters & Search */}
      <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-4 sm:p-6 mb-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 select-none">
          {/* Tech Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 w-full lg:w-auto">
            {techFilters.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedTech(tab.value)}
                className={`px-3 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer border ${
                  selectedTech === tab.value
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    : 'bg-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-amber-400 border-transparent hover:bg-slate-100/40 dark:hover:bg-slate-800/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input & Action Button */}
          <div className="flex items-center gap-2 w-full lg:w-96">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={15} />
              <input
                type="text"
                placeholder="Filtrer les articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-bold pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 text-slate-900 dark:text-white border border-slate-200/60 dark:border-slate-800/60 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <button
              onClick={() => fetchArticles(selectedTech, true)}
              disabled={isLoading || isRefreshing}
              title="Forcer la re-synchronisation via Google Search"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/10 transition-colors cursor-pointer disabled:opacity-55"
            >
              <RefreshCw size={15} className={`${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Error / Warning Alert Alerting gracefully */}
      {errorMessage && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/25 p-4 rounded-xl text-slate-700 dark:text-amber-300 text-xs font-bold mb-6">
          <AlertCircle className="shrink-0 text-amber-500 mt-0.5" size={16} />
          <div>{errorMessage}</div>
        </div>
      )}

      {/* Dynamic AI Landscape Summary Card */}
      {trendSummary && !isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-8 p-5 sm:p-6 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5 border border-amber-500/20 dark:border-amber-500/10 rounded-2xl"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <TrendingUp size={18} />
            </div>
            <div>
              <h4 className="text-[10px] font-mono font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1.5">
                Note de conjoncture / Analyse IA
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans italic font-medium">
                "{trendSummary}"
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading Canvas state */}
      {isLoading ? (
        <div className="flex-grow flex flex-col items-center justify-center py-20">
          <div className="relative mb-4 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <Newspaper className="absolute text-amber-500" size={16} />
          </div>
          <p className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest animate-pulse">
            Consultation Google Search Grounding...
          </p>
        </div>
      ) : (
        <div className="flex-grow">
          {/* Empty state if nothing matches filter */}
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 bg-white/40 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <BookOpen className="mx-auto text-slate-400 dark:text-slate-600 mb-3" size={32} />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350 uppercase mb-1">Aucun article trouvé</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Essayez d'élargir vos filtres ou de relancer une recherche.</p>
            </div>
          ) : (
            /* Articles Cards Grid */
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredArticles.map((article, idx) => (
                  <motion.div
                    key={article.title + idx}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: idx * 0.05 }}
                    className="group flex flex-col justify-between h-full bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-150/40 dark:border-slate-800/40 overflow-hidden hover:border-amber-500/40 dark:hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 dark:hover:bg-slate-900/60"
                  >
                    {/* Header Image Accent */}
                    <div className="h-3.5 bg-gradient-to-r from-amber-500/20 via-orange-500/2 bg-amber-500/10 group-hover:bg-amber-500/30 transition-all duration-300" />
                    
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Meta Tags: Tech Badge & Source name */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${getTechBadgeStyle(article.technology)}`}>
                          {article.technology}
                        </span>
                        
                        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500">
                          <Globe size={11} />
                          <span>{article.sourceName}</span>
                        </div>
                      </div>

                      {/* Main Title */}
                      <h3 className="text-base font-black font-sans leading-snug text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors duration-200 mb-3 ml-0.5 line-clamp-2">
                        {article.title}
                      </h3>

                      {/* Summary Excerpt */}
                      <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-350 leading-relaxed font-sans line-clamp-4 flex-grow mb-4">
                        {article.excerpt}
                      </p>

                      {/* Footer Section */}
                      <div className="flex items-center justify-between border-t border-slate-100/60 dark:border-slate-800/30 pt-4 mt-auto">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                          <Calendar size={12} />
                          <span>{article.date}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Audio TTS Button */}
                          <button
                            onClick={() => handleSpeak(article)}
                            title={currentlyPlaying === article.title ? (isPaused ? "Reprendre la lecture" : "Mettre en pause") : "Écouter l'article (Audio)"}
                            className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                              currentlyPlaying === article.title
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 animate-pulse'
                                : 'bg-slate-50 border-slate-200/50 hover:bg-slate-100 dark:bg-slate-800/40 dark:border-slate-700/30 dark:hover:bg-slate-800/80 text-slate-550 dark:text-slate-400 hover:text-amber-500'
                            }`}
                          >
                            {currentlyPlaying === article.title && !isPaused ? (
                              <Pause size={12} className="text-amber-500 animate-pulse" />
                            ) : (
                              <Volume2 size={12} />
                            )}
                          </button>

                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] font-mono font-black uppercase text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300 transition-colors cursor-pointer"
                          >
                            <span>Lire</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      )}

      {/* Floating Audio Bar / Synthesizer controller */}
      <AnimatePresence>
        {currentlyPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-[60] max-w-sm w-[calc(100vw-32px)] sm:w-80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md rounded-2xl border border-amber-500/30 dark:border-amber-500/20 shadow-xl p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Volume2 size={16} className={isPaused ? "" : "animate-bounce"} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[9px] font-mono font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-0.5">
                  Lecture Audio Active
                </p>
                <h5 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                  {currentlyPlaying}
                </h5>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 select-none">
              <button
                onClick={() => {
                  if (typeof window === 'undefined' || !window.speechSynthesis) return;
                  const synth = window.speechSynthesis;
                  if (isPaused) {
                    synth.resume();
                    setIsPaused(false);
                  } else {
                    synth.pause();
                    setIsPaused(true);
                  }
                }}
                className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-colors border border-slate-200/40 dark:border-slate-800/40 cursor-pointer"
                title={isPaused ? "Reprendre la lecture" : "Mettre en pause"}
              >
                {isPaused ? <Volume2 size={13} /> : <Pause size={13} />}
              </button>
              <button
                onClick={handleStopSpeaking}
                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/25 rounded-xl transition-colors cursor-pointer"
                title="Arrêter la lecture"
              >
                <VolumeX size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

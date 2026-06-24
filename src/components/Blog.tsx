import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import {
  Search,
  ExternalLink,
  Calendar,
  BookOpen,
  RefreshCw,
  AlertCircle,
  Newspaper,
  TrendingUp,
  Globe,
  Volume2,
  VolumeX,
  Pause,
  Play,
  X,
  Tag,
  Clock,
  ArrowUpRight,
  Headphones,
  ChevronRight,
} from 'lucide-react';

interface Article {
  title: string;
  technology: string;
  excerpt: string;
  date: string;
  sourceName: string;
  url: string;
}

type CacheSource = 'live' | 'memory' | 'database' | 'static' | null;

// ─── Article Detail Modal ────────────────────────────────────────────────────
interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  getTechBadgeStyle: (tech: string) => string;
}

interface ArticleDetail {
  paragraphs: string[];
  keyPoints: string[];
  readingTimeMinutes: number;
  sourceQuality: string | null;
  sources: Array<{ title: string; url: string }>;
  fromCache: boolean;
}

const ArticleModal = ({ article, onClose, getTechBadgeStyle }: ArticleModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Rich content states
  const [detail, setDetail] = useState<ArticleDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        setVoices(window.speechSynthesis.getVoices());
      }
    };
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Fetch rich article content on open
  useEffect(() => {
    if (!article) return;
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);

    const params = new URLSearchParams({
      url:   article.url,
      title: article.title,
      tech:  article.technology,
    });

    fetch(`/api/blog/article?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setDetail(data as ArticleDetail);
      })
      .catch(() => {
        setDetailError("Impossible de charger le contenu complet. Affichage du résumé.");
      })
      .finally(() => setDetailLoading(false));
  }, [article]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Stop TTS on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Build the full text for TTS — prefer rich paragraphs, fallback to excerpt
  const fullText = useMemo(() => {
    if (!article) return '';
    const intro = `Article sur ${article.technology}, publié par ${article.sourceName}. ${article.title}.`;
    if (detail?.paragraphs?.length) {
      return `${intro} ${detail.paragraphs.join(' ')}`;
    }
    return `${intro} ${article.excerpt}`;
  }, [article, detail]);

  const startReading = useCallback(() => {
    if (!article || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (intervalRef.current) clearInterval(intervalRef.current);

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.95;

    const frVoice = voices.find(v => v.lang.startsWith('fr'));
    if (frVoice) utterance.voice = frVoice;

    utterance.onboundary = (e) => {
      setProgress(Math.round((e.charIndex / fullText.length) * 100));
    };
    utterance.onend = () => { setIsPlaying(false); setIsPaused(false); setProgress(100); };
    utterance.onerror = () => { setIsPlaying(false); setIsPaused(false); };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
    setProgress(0);
  }, [article, fullText, voices]);

  const togglePause = () => {
    if (!window.speechSynthesis) return;
    if (isPaused) { window.speechSynthesis.resume(); setIsPaused(false); }
    else           { window.speechSynthesis.pause();  setIsPaused(true);  }
  };

  const stopReading = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false); setIsPaused(false); setProgress(0);
  };

  const handleClose = () => { stopReading(); onClose(); };

  if (!article) return null;

  // ── Skeleton for loading state ──────────────────────────────────────────────
  const ContentSkeleton = () => (
    <div className="space-y-3 animate-pulse">
      {[100, 90, 75, 95, 80].map((w, i) => (
        <div key={i} className={`h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full`} style={{ width: `${w}%` }} />
      ))}
      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2 mt-4" />
      {[85, 70].map((w, i) => (
        <div key={i} className={`h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full`} style={{ width: `${w}%` }} />
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        key="article-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleClose}
        className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6"
      >
        <motion.div
          key="article-modal-panel"
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 340, damping: 32 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full sm:max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-950 rounded-t-3xl sm:rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-2xl overflow-hidden"
        >
          {/* Gradient accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 shrink-0" />

          {/* Header */}
          <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${getTechBadgeStyle(article.technology)}`}>
                <Tag size={9} className="inline mr-1" />
                {article.technology}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                <Globe size={10} />
                {article.sourceName}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                <Calendar size={10} />
                {article.date}
              </span>
              {detail && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  <Clock size={10} />
                  {detail.readingTimeMinutes} min de lecture
                </span>
              )}
            </div>
            <button
              onClick={handleClose}
              className="shrink-0 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-grow p-5 sm:p-6 space-y-6 custom-scrollbar">

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
              {article.title}
            </h2>

            {/* TTS Player Block */}
            <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-orange-500/3 to-amber-500/5 dark:from-amber-500/8 dark:to-orange-500/4 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <Headphones size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                    Lecture vocale
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                    {detailLoading
                      ? 'Chargement du contenu...'
                      : isPlaying
                        ? isPaused ? 'En pause — cliquez sur ▶ pour reprendre' : 'Lecture en cours...'
                        : detail?.paragraphs?.length
                          ? `Contenu complet chargé · ${detail.paragraphs.length} paragraphes`
                          : 'Résumé disponible à la lecture'
                    }
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full mb-4 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'linear', duration: 0.3 }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {!isPlaying ? (
                  <button
                    onClick={startReading}
                    disabled={detailLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs font-mono uppercase tracking-wide transition-all cursor-pointer shadow-md shadow-amber-500/20 hover:shadow-amber-500/30"
                  >
                    <Play size={13} />
                    Écouter l'article
                  </button>
                ) : (
                  <>
                    <button
                      onClick={togglePause}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs font-mono uppercase tracking-wide transition-all cursor-pointer"
                    >
                      {isPaused ? <Play size={13} /> : <Pause size={13} />}
                      {isPaused ? 'Reprendre' : 'Pause'}
                    </button>
                    <button
                      onClick={stopReading}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/20 font-bold text-xs font-mono uppercase tracking-wide transition-all cursor-pointer"
                    >
                      <VolumeX size={13} />
                      Arrêter
                    </button>
                  </>
                )}
                {isPlaying && !isPaused && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-amber-500 ml-1">
                    <span className="w-1 h-3 bg-amber-400 rounded-full animate-[bounce_0.8s_ease-in-out_infinite]" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-4 bg-amber-500 rounded-full animate-[bounce_0.8s_ease-in-out_infinite]" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-2 bg-amber-400 rounded-full animate-[bounce_0.8s_ease-in-out_infinite]" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </div>
            </div>

            {/* Key Points */}
            {detail?.keyPoints?.length ? (
              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/50 bg-slate-50/60 dark:bg-slate-900/40 p-4 sm:p-5 space-y-3">
                <h3 className="text-[11px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={12} />
                  Points clés
                </h3>
                <ul className="space-y-2">
                  {detail.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="leading-relaxed font-sans">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Article content — paragraphs or skeleton or error */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={12} />
                {detailLoading
                  ? 'Récupération du contenu via Google Search...'
                  : detail?.paragraphs?.length
                    ? 'Contenu de l\'article'
                    : 'Résumé de l\'article'}
              </h3>

              {detailLoading ? (
                <ContentSkeleton />
              ) : detailError ? (
                <>
                  <div className="flex items-center gap-2 text-[11px] text-amber-600 dark:text-amber-400 font-mono mb-2">
                    <AlertCircle size={12} />
                    {detailError}
                  </div>
                  {article.excerpt.split('. ').filter(Boolean).map((sentence, i) => (
                    <p key={i} className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                      {sentence.trim()}{sentence.endsWith('.') ? '' : '.'}
                    </p>
                  ))}
                </>
              ) : detail?.paragraphs?.length ? (
                <div className="space-y-4">
                  {detail.paragraphs.map((para, i) => (
                    <p key={i} className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                      {para}
                    </p>
                  ))}
                </div>
              ) : (
                article.excerpt.split('. ').filter(Boolean).map((sentence, i) => (
                  <p key={i} className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {sentence.trim()}{sentence.endsWith('.') ? '' : '.'}
                  </p>
                ))
              )}
            </div>

            {/* Grounding sources */}
            {detail?.sources?.length ? (
              <div className="space-y-2">
                <h3 className="text-[11px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Globe size={12} />
                  Sources de recherche
                </h3>
                <div className="flex flex-wrap gap-2">
                  {detail.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/40 transition-colors cursor-pointer max-w-[200px]"
                    >
                      <ExternalLink size={10} className="shrink-0" />
                      <span className="truncate">{src.title}</span>
                    </a>
                  ))}
                </div>
                {detail.sourceQuality && (
                  <p className="text-[10px] font-mono italic text-slate-400 dark:text-slate-600 pt-1">
                    {detail.sourceQuality}
                  </p>
                )}
              </div>
            ) : null}
          </div>

          {/* Footer CTA */}
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between gap-3 shrink-0">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              Source · {article.sourceName}
            </p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs font-mono uppercase tracking-wide transition-all cursor-pointer shadow-sm"
            >
              Lire l'article original
              <ArrowUpRight size={13} />
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};


// ─── Main Blog Component ─────────────────────────────────────────────────────
export const Blog = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [selectedTech, setSelectedTech] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [trendSummary, setTrendSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cacheSource, setCacheSource] = useState<CacheSource>(null);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Floating TTS bar states (for card-level quick-play)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Speech synthesis cleanup
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
    utterance.rate = 0.95;

    if (synth.getVoices) {
      const voices = synth.getVoices();
      const frenchVoice = voices.find(v => v.lang.startsWith('fr'));
      if (frenchVoice) utterance.voice = frenchVoice;
    }

    utterance.onend = () => { setCurrentlyPlaying(null); setIsPaused(false); };
    utterance.onerror = () => { setCurrentlyPlaying(null); setIsPaused(false); };

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
    setCacheSource(null);
    setCachedAt(null);
    try {
      const url = `/api/blog?tech=${encodeURIComponent(tech)}&refresh=${forceRefresh ? 'true' : 'false'}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Impossible de joindre l'API d'actualités.");
      }
      const data = await res.json();
      setArticles(data.articles || []);
      setTrendSummary(data.techTrendSummary || '');
      setCacheSource(data.fromCache ? (data.cacheSource || 'memory') : 'live');
      setCachedAt(data.cachedAt || null);
      if (data.fromCache && data.cacheSource !== 'live') {
        setErrorMessage(
          data.cacheSource === 'database'
            ? "L'API Google Search est temporairement indisponible. Affichage des derniers articles enregistrés en base de données."
            : data.cacheSource === 'memory'
            ? "Articles issus du cache serveur (API temporairement indisponible)."
            : "Articles de référence affichés (API indisponible)."
        );
      }
    } catch (err: any) {
      console.error(err);
      setCacheSource('static');
      setErrorMessage("Une erreur est survenue lors de la synchronisation. Affichage des articles de secours.");
      // Fallback local en cas d'erreur réseau / serveur crashé
      const FALLBACK_ARTICLES = [
        {
          title: "React 19 Server Components & Actions : Le guide ultime",
          technology: "React",
          excerpt: "Découvrez comment l'architecture serveur de React 19 simplifie la gestion d'état et l'accès aux bases de données en direct sans API intermédiaire, tout en conservant d'excellentes performances d'affichage.",
          date: "Il y a 3 jours",
          sourceName: "react.dev",
          url: "https://react.dev/blog/2024/12/05/react-19"
        },
        {
          title: "Python 3.13 introduit un compilateur JIT expérimental",
          technology: "Python",
          excerpt: "La dernière mise à jour majeure de Python apporte une refonte du GIL permettant de vrais traitements parallèles, ainsi qu'un nouveau compilateur Just-In-Time pour accélérer l'exécution des boucles complexes.",
          date: "La semaine dernière",
          sourceName: "Python Software Foundation",
          url: "https://docs.python.org/3/whatsnew/3.13.html"
        },
        {
          title: "L'essor du RAG et de l'affinage (Fine-Tuning) pour l'IA générative",
          technology: "Machine Learning",
          excerpt: "Une plongée technique au cœur de l'optimisation des grands modèles de langage par génération augmentée par récupération (RAG) et apprentissage par renforcement.",
          date: "La semaine dernière",
          sourceName: "Hugging Face Blog",
          url: "https://huggingface.co/blog"
        }
      ];
      
      const filteredFallback = tech !== "All"
        ? FALLBACK_ARTICLES.filter(a => a.technology.toLowerCase().includes(tech.toLowerCase()))
        : FALLBACK_ARTICLES;
        
      setArticles(filteredFallback.length > 0 ? filteredFallback : FALLBACK_ARTICLES);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchArticles(selectedTech);
  }, [selectedTech]);

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) {
      // Afficher au plus 6 articles par défaut
      return articles.slice(0, 6);
    }
    
    // Si l'utilisateur effectue une recherche, chercher dans TOUS les articles accumulés (sans limite de 6)
    const query = searchQuery.toLowerCase().trim();
    return articles.filter(article =>
      article.title.toLowerCase().includes(query) ||
      article.excerpt.toLowerCase().includes(query) ||
      article.technology.toLowerCase().includes(query) ||
      article.sourceName.toLowerCase().includes(query)
    );
  }, [articles, searchQuery]);

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

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <ArticleModal
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
            getTechBadgeStyle={getTechBadgeStyle}
          />
        )}
      </AnimatePresence>

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
          </div>
        </div>
      </div>

      {/* Cache source indicator (DB fallback) */}
      {cacheSource === 'database' && cachedAt && !errorMessage && (
        <div className="flex items-center gap-2 bg-blue-500/8 border border-blue-500/20 px-4 py-2.5 rounded-xl text-slate-500 dark:text-blue-300/70 text-[11px] font-mono mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
          <span>Articles issus du cache base de données — dernière mise à jour : {new Date(cachedAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )}

      {/* Error / Warning Alert */}
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

      {/* Loading State */}
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
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 bg-white/40 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <BookOpen className="mx-auto text-slate-400 dark:text-slate-600 mb-3" size={32} />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350 uppercase mb-1">Aucun article trouvé</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Essayez d'élargir vos filtres ou de relancer une recherche.</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredArticles.map((article, idx) => (
                  <motion.div
                    key={article.title + idx}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: idx * 0.05 }}
                    className="group flex flex-col justify-between h-full bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-150/40 dark:border-slate-800/40 overflow-hidden hover:border-amber-500/40 dark:hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 dark:hover:bg-slate-900/60 cursor-pointer"
                    onClick={() => setSelectedArticle(article)}
                  >
                    {/* Header accent */}
                    <div className="h-3.5 bg-gradient-to-r from-amber-500/20 via-orange-500/2 bg-amber-500/10 group-hover:bg-amber-500/30 transition-all duration-300" />

                    <div className="p-6 flex flex-col flex-grow">
                      {/* Meta */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${getTechBadgeStyle(article.technology)}`}>
                          {article.technology}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500">
                          <Globe size={11} />
                          <span>{article.sourceName}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-black font-sans leading-snug text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors duration-200 mb-3 ml-0.5 line-clamp-2">
                        {article.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-350 leading-relaxed font-sans line-clamp-3 flex-grow mb-4">
                        {article.excerpt}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between border-t border-slate-100/60 dark:border-slate-800/30 pt-4 mt-auto">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                          <Calendar size={12} />
                          <span>{article.date}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Quick TTS button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSpeak(article); }}
                            title={currentlyPlaying === article.title ? (isPaused ? 'Reprendre' : 'Mettre en pause') : 'Écoute rapide'}
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

                          {/* Read More */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedArticle(article); }}
                            className="flex items-center gap-1 text-[11px] font-mono font-black uppercase text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300 transition-colors cursor-pointer"
                          >
                            <span>Lire</span>
                            <ChevronRight size={12} />
                          </button>
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

      {/* Floating Audio Bar (quick-play from card) */}
      <AnimatePresence>
        {currentlyPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-[60] max-w-sm w-[calc(100vw-32px)] sm:w-80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md rounded-2xl border border-amber-500/30 dark:border-amber-500/20 shadow-xl p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Volume2 size={16} className={isPaused ? '' : 'animate-bounce'} />
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
                  if (isPaused) { synth.resume(); setIsPaused(false); }
                  else { synth.pause(); setIsPaused(true); }
                }}
                className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-colors border border-slate-200/40 dark:border-slate-800/40 cursor-pointer"
                title={isPaused ? 'Reprendre' : 'Mettre en pause'}
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

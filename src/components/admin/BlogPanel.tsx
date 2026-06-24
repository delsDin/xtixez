import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper, RefreshCw, Plus, Edit3, Trash2, Save, X,
  ExternalLink, Tag, Globe, Calendar, Search, Eye, EyeOff,
  ChevronDown, ChevronUp, Database, Wifi, WifiOff, Check,
  AlertCircle, Clock, BookOpen, Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BlogPost {
  id?: number;
  tech_key: string;
  articles: Article[];
  trend_summary: string;
  fetched_at: string;
  source: string;
}

interface Article {
  title: string;
  technology: string;
  excerpt: string;
  date: string;
  sourceName: string;
  url: string;
}

interface ManualPost {
  id?: number;
  title: string;
  technology: string;
  excerpt: string;
  date: string;
  source_name: string;
  url: string;
  status: 'published' | 'draft';
  created_at?: string;
}

// ── Status badge ──────────────────────────────────────────────────────────────
const SourceBadge = ({ source }: { source: string }) => {
  if (source === 'gemini') return (
    <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
      <Sparkles size={8} />Gemini AI
    </span>
  );
  if (source === 'manual') return (
    <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
      <Edit3 size={8} />Manuel
    </span>
  );
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider rounded-full bg-slate-700/40 text-slate-400 border border-slate-700/40">
      {source}
    </span>
  );
};

// ── Tech badge ────────────────────────────────────────────────────────────────
const TechBadge = ({ tech }: { tech: string }) => {
  const t = tech.toLowerCase();
  let cls = 'bg-slate-700/40 text-slate-400 border-slate-700/30';
  if (t.includes('react') || t.includes('typescript')) cls = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  else if (t.includes('python')) cls = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  else if (t.includes('machine') || t.includes('ml') || t.includes('ai') || t.includes('ia')) cls = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  else if (t.includes('data') || t.includes('sql') || t.includes('postgres')) cls = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

  return (
    <span className={`px-2 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider rounded-full border ${cls}`}>
      <Tag size={8} className="inline mr-0.5" />{tech}
    </span>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
    <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
      <Newspaper size={32} className="text-slate-600" />
    </div>
    <div>
      <p className="text-sm font-bold text-slate-400 font-mono uppercase tracking-widest">Aucun article</p>
      <p className="text-xs text-slate-600 mt-1">Créez votre premier article ou synchronisez le cache.</p>
    </div>
    <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 text-xs font-bold font-mono uppercase tracking-wide transition-all cursor-pointer">
      <Plus size={13} />
      Créer un article
    </button>
  </div>
);

// ── Main BlogPanel ────────────────────────────────────────────────────────────
export const BlogPanel: React.FC = () => {
  const [status, setStatus] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });

  // Cache tab
  const [cacheEntries, setCacheEntries] = useState<BlogPost[]>([]);
  const [isCacheLoading, setIsCacheLoading] = useState(false);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  // Manual posts tab
  const [manualPosts, setManualPosts] = useState<ManualPost[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<ManualPost | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formTechnology, setFormTechnology] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formSourceName, setFormSourceName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');
  const [isSaving, setIsSaving] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'cache' | 'manual'>('cache');

  // Syncing from API
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatus({ text, type });
    setTimeout(() => setStatus({ text: '', type: '' }), 4000);
  };

  // ── Load cache entries from Supabase ────────────────────────────────────────
  const loadCache = useCallback(async () => {
    setIsCacheLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_cache')
        .select('*')
        .order('fetched_at', { ascending: false });
      if (error) throw error;
      setCacheEntries(data || []);
    } catch (e: any) {
      showStatus(`Erreur chargement cache : ${e.message}`, 'error');
    } finally {
      setIsCacheLoading(false);
    }
  }, []);

  // ── Load manual posts from Supabase ─────────────────────────────────────────
  const loadManualPosts = useCallback(async () => {
    setIsPostsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setManualPosts(data || []);
    } catch (e: any) {
      // Table might not exist yet
      if (e.message?.includes('relation') || e.code === '42P01') {
        setManualPosts([]);
      } else {
        showStatus(`Erreur chargement posts : ${e.message}`, 'error');
      }
    } finally {
      setIsPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCache();
    loadManualPosts();
  }, [loadCache, loadManualPosts]);

  // ── Sync a cache key via the API ────────────────────────────────────────────
  const syncCacheKey = async (techKey: string) => {
    setIsSyncing(techKey);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/blog?tech=${encodeURIComponent(techKey === 'all' ? 'All' : techKey)}&refresh=true`);
      if (!res.ok) throw new Error('API unavailable');
      showStatus(`✓ Cache "${techKey}" synchronisé avec succès.`, 'success');
      await loadCache();
    } catch (e: any) {
      showStatus(`Erreur sync "${techKey}" : ${e.message}`, 'error');
    } finally {
      setIsSyncing(null);
    }
  };

  // ── Delete a cache entry ─────────────────────────────────────────────────────
  const deleteCacheEntry = async (techKey: string) => {
    if (!confirm(`Supprimer le cache "${techKey}" ?`)) return;
    try {
      await supabase.from('blog_cache').delete().eq('tech_key', techKey);
      showStatus(`Cache "${techKey}" supprimé.`, 'success');
      setCacheEntries(prev => prev.filter(e => e.tech_key !== techKey));
    } catch (e: any) {
      showStatus(`Erreur : ${e.message}`, 'error');
    }
  };

  // ── Open form (new or edit) ──────────────────────────────────────────────────
  const openForm = (post?: ManualPost) => {
    if (post) {
      setEditingPost(post);
      setFormTitle(post.title);
      setFormTechnology(post.technology);
      setFormExcerpt(post.excerpt);
      setFormDate(post.date);
      setFormSourceName(post.source_name);
      setFormUrl(post.url);
      setFormStatus(post.status);
    } else {
      setEditingPost(null);
      setFormTitle('');
      setFormTechnology('');
      setFormExcerpt('');
      setFormDate(new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }));
      setFormSourceName('');
      setFormUrl('');
      setFormStatus('published');
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPost(null);
  };

  // ── Save manual post ─────────────────────────────────────────────────────────
  const savePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formExcerpt.trim()) return;
    setIsSaving(true);

    const payload: ManualPost = {
      title: formTitle.trim(),
      technology: formTechnology.trim() || 'Divers',
      excerpt: formExcerpt.trim(),
      date: formDate.trim(),
      source_name: formSourceName.trim() || 'Blog',
      url: formUrl.trim() || '#',
      status: formStatus,
    };

    try {
      if (editingPost?.id) {
        // Update
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', editingPost.id);
        if (error) throw error;
        showStatus('Article modifié avec succès.', 'success');
      } else {
        // Insert
        const { error } = await supabase.from('blog_posts').insert(payload);
        if (error) throw error;
        showStatus('Nouvel article publié avec succès.', 'success');
      }
      closeForm();
      loadManualPosts();
    } catch (e: any) {
      showStatus(`Erreur : ${e.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete manual post ───────────────────────────────────────────────────────
  const deletePost = async (id: number) => {
    if (!confirm('Supprimer cet article définitivement ?')) return;
    try {
      await supabase.from('blog_posts').delete().eq('id', id);
      showStatus('Article supprimé.', 'success');
      setManualPosts(prev => prev.filter(p => p.id !== id));
    } catch (e: any) {
      showStatus(`Erreur : ${e.message}`, 'error');
    }
  };

  // ── Toggle post status ───────────────────────────────────────────────────────
  const toggleStatus = async (post: ManualPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await supabase.from('blog_posts').update({ status: newStatus }).eq('id', post.id);
      setManualPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: newStatus } : p));
    } catch (e: any) {
      showStatus(`Erreur : ${e.message}`, 'error');
    }
  };

  const filteredPosts = manualPosts.filter(p =>
    !searchQuery || [p.title, p.technology, p.excerpt, p.source_name].some(
      f => f.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Newspaper size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black font-mono uppercase tracking-wider text-slate-100">
              Gestion du Blog
            </h2>
            <p className="text-[10px] text-slate-500 font-mono">
              Cache IA ({cacheEntries.length} clés) · Articles manuels ({manualPosts.length})
            </p>
          </div>
        </div>

        <button
          onClick={() => { setActiveTab('manual'); openForm(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 text-[11px] font-bold font-mono uppercase tracking-wide transition-all cursor-pointer"
        >
          <Plus size={13} />
          Nouvel article
        </button>
      </div>

      {/* Status bar */}
      <AnimatePresence>
        {status.text && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-mono font-bold border ${
              status.type === 'success'
                ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400'
                : 'bg-red-950/30 border-red-800/50 text-red-400'
            }`}
          >
            {status.type === 'success' ? <Check size={12} /> : <AlertCircle size={12} />}
            {status.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/50 border border-slate-800 rounded-xl p-1">
        {([
          { key: 'cache', label: 'Cache IA', icon: Database },
          { key: 'manual', label: 'Articles manuels', icon: Edit3 },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 flex-1 justify-center px-4 py-2 text-[11px] font-mono font-bold uppercase tracking-wide rounded-lg transition-all cursor-pointer ${
              activeTab === key
                ? 'bg-slate-800 text-slate-100 shadow'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* ── CACHE TAB ─────────────────────────────────────────────────────────── */}
      {activeTab === 'cache' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Entrées stockées en base de données
            </p>
            <button
              onClick={loadCache}
              disabled={isCacheLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-bold uppercase text-slate-400 hover:text-slate-200 bg-slate-900/40 border border-slate-800 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={11} className={isCacheLoading ? 'animate-spin' : ''} />
              Actualiser
            </button>
          </div>

          {isCacheLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-900/40 rounded-xl animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : cacheEntries.length === 0 ? (
            <div className="text-center py-12">
              <Database size={28} className="mx-auto text-slate-600 mb-3" />
              <p className="text-xs font-bold text-slate-500 font-mono uppercase">Cache vide</p>
              <p className="text-[11px] text-slate-600 mt-1">Les données seront créées lors du premier appel à l'API blog.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cacheEntries.map(entry => (
                <div
                  key={entry.tech_key}
                  className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden"
                >
                  {/* Cache entry header */}
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => setExpandedKey(expandedKey === entry.tech_key ? null : entry.tech_key)}
                        className="shrink-0 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors cursor-pointer"
                      >
                        {expandedKey === entry.tech_key ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-black text-slate-200 uppercase">
                            {entry.tech_key}
                          </span>
                          <SourceBadge source={entry.source} />
                          <span className="text-[9px] font-mono text-slate-500">
                            {Array.isArray(entry.articles) ? entry.articles.length : 0} articles
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock size={9} className="text-slate-600" />
                          <span className="text-[9px] font-mono text-slate-600">
                            {entry.fetched_at
                              ? new Date(entry.fetched_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                              : '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => syncCacheKey(entry.tech_key)}
                        disabled={isSyncing === entry.tech_key}
                        title="Resynchroniser via Google Search"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSyncing === entry.tech_key
                          ? <RefreshCw size={11} className="animate-spin" />
                          : <Wifi size={11} />}
                        Sync
                      </button>
                      <button
                        onClick={() => deleteCacheEntry(entry.tech_key)}
                        className="p-1.5 rounded-xl text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Trend summary */}
                  {entry.trend_summary && (
                    <div className="px-4 pb-2">
                      <p className="text-[11px] italic text-slate-500 font-sans leading-relaxed line-clamp-2">
                        "{entry.trend_summary}"
                      </p>
                    </div>
                  )}

                  {/* Expanded articles list */}
                  <AnimatePresence>
                    {expandedKey === entry.tech_key && Array.isArray(entry.articles) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-slate-800/60"
                      >
                        <div className="p-4 space-y-3">
                          <p className="text-[9px] font-mono font-black uppercase tracking-widest text-slate-500 mb-2">
                            Articles en cache
                          </p>
                          {entry.articles.map((art, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/40">
                              <span className="text-[9px] font-mono text-slate-600 mt-1 shrink-0 w-4">
                                {i + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <TechBadge tech={art.technology || entry.tech_key} />
                                  <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                                    <Globe size={8} />{art.sourceName}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-600 flex items-center gap-1">
                                    <Calendar size={8} />{art.date}
                                  </span>
                                </div>
                                <p className="text-[11px] font-bold text-slate-300 leading-snug line-clamp-1">
                                  {art.title}
                                </p>
                                <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                                  {art.excerpt}
                                </p>
                              </div>
                              <a
                                href={art.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                              >
                                <ExternalLink size={11} />
                              </a>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}

          {/* Quick sync buttons for common keys */}
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-500">
              Synchronisation rapide
            </p>
            <div className="flex flex-wrap gap-2">
              {['all', 'React', 'Python', 'Machine Learning', 'Data'].map(key => {
                const exists = cacheEntries.some(e => e.tech_key === key.toLowerCase() || e.tech_key === key);
                return (
                  <button
                    key={key}
                    onClick={() => syncCacheKey(key)}
                    disabled={isSyncing === key}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-bold uppercase rounded-xl border transition-all cursor-pointer disabled:opacity-50 ${
                      exists
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10'
                        : 'bg-slate-900/40 border-slate-700/40 text-slate-400 hover:text-slate-200 hover:border-slate-600/60'
                    }`}
                  >
                    {isSyncing === key ? (
                      <RefreshCw size={9} className="animate-spin" />
                    ) : exists ? (
                      <Wifi size={9} />
                    ) : (
                      <WifiOff size={9} />
                    )}
                    {key}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── MANUAL POSTS TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'manual' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-8 pr-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 text-[11px] font-mono focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
              />
            </div>
            <button
              onClick={() => openForm()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 text-[11px] font-bold font-mono uppercase tracking-wide transition-all cursor-pointer"
            >
              <Plus size={12} />
              Ajouter
            </button>
            <button
              onClick={loadManualPosts}
              disabled={isPostsLoading}
              className="p-2 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={isPostsLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {isPostsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-slate-900/40 rounded-xl animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <EmptyState onAdd={() => openForm()} />
          ) : (
            <div className="space-y-3">
              {filteredPosts.map(post => (
                <div
                  key={post.id}
                  className={`bg-slate-900/40 border rounded-2xl p-4 transition-all ${
                    post.status === 'draft'
                      ? 'border-slate-700/40 opacity-60'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <TechBadge tech={post.technology} />
                        <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                          <Globe size={8} />{post.source_name}
                        </span>
                        <span className="text-[9px] font-mono text-slate-600 flex items-center gap-1">
                          <Calendar size={8} />{post.date}
                        </span>
                        <span className={`px-1.5 py-0.5 text-[8px] font-mono font-black uppercase rounded-full border ${
                          post.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-700/40 text-slate-500 border-slate-700/30'
                        }`}>
                          {post.status === 'published' ? 'Publié' : 'Brouillon'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-200 leading-snug mb-1">
                        {post.title}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleStatus(post)}
                        title={post.status === 'published' ? 'Passer en brouillon' : 'Publier'}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all cursor-pointer"
                      >
                        {post.status === 'published' ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent transition-all cursor-pointer"
                      >
                        <ExternalLink size={13} />
                      </a>
                      <button
                        onClick={() => openForm(post)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all cursor-pointer"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => deletePost(post.id!)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SQL Helper notice */}
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-mono text-amber-400/70 leading-relaxed">
              La table <code className="bg-amber-500/10 px-1 rounded text-amber-300">blog_posts</code> doit exister dans Supabase. Exécutez le script <code>supabase_blog_posts.sql</code> si ce n'est pas encore fait.
            </p>
          </div>
        </div>
      )}

      {/* ── ARTICLE FORM MODAL ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeForm}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl"
            >
              {/* Form header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-950/95 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <BookOpen size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black font-mono uppercase tracking-wider text-slate-100">
                      {editingPost ? 'Modifier l\'article' : 'Nouvel article'}
                    </h3>
                    <p className="text-[9px] font-mono text-slate-500">
                      {editingPost ? `ID #${editingPost.id}` : 'Publication manuelle'}
                    </p>
                  </div>
                </div>
                <button onClick={closeForm} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
                  <X size={15} />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={savePost} className="p-5 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Titre <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="Titre de l'article"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs font-sans focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Technology */}
                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      Technologie
                    </label>
                    <input
                      type="text"
                      value={formTechnology}
                      onChange={e => setFormTechnology(e.target.value)}
                      placeholder="React, Python..."
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs font-sans focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  {/* Date */}
                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      Date de publication
                    </label>
                    <input
                      type="text"
                      value={formDate}
                      onChange={e => setFormDate(e.target.value)}
                      placeholder="Il y a 2 jours..."
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs font-sans focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Source name */}
                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      Nom de la source
                    </label>
                    <input
                      type="text"
                      value={formSourceName}
                      onChange={e => setFormSourceName(e.target.value)}
                      placeholder="Medium, Dev.to..."
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs font-sans focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  {/* Status */}
                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      Statut
                    </label>
                    <select
                      value={formStatus}
                      onChange={e => setFormStatus(e.target.value as 'published' | 'draft')}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="published">Publié</option>
                      <option value="draft">Brouillon</option>
                    </select>
                  </div>
                </div>

                {/* URL */}
                <div>
                  <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    URL de l'article
                  </label>
                  <input
                    type="url"
                    value={formUrl}
                    onChange={e => setFormUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs font-sans focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Résumé / Extrait <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formExcerpt}
                    onChange={e => setFormExcerpt(e.target.value)}
                    placeholder="Rédigez un résumé détaillé de l'article (2-4 phrases)..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs font-sans focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                  />
                  <p className="text-[9px] text-slate-600 font-mono mt-1">
                    {formExcerpt.length} caractères
                  </p>
                </div>

                {/* Form actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-4 py-2 text-[11px] font-mono font-bold uppercase text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2 text-[11px] font-mono font-bold uppercase bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-500/20"
                  >
                    {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                    {editingPost ? 'Enregistrer' : 'Publier'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Check, AlertTriangle } from 'lucide-react';
import { fetchSectionVisibility, saveSectionVisibility, type SectionVisibility } from '../../lib/config-api';

export const VisibilityPanel: React.FC = () => {
  const [visibilitySettings, setVisibilitySettings] = useState<SectionVisibility | null>(null);
  const [isSavingVisibility, setIsSavingVisibility] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'err' | 'info' | '' }>({ text: '', type: '' });

  const showStatus = (text: string, type: 'success' | 'err' | 'info' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: '', type: '' }), 4000);
  };

  useEffect(() => {
    const loadVisibility = async () => {
      const vis = await fetchSectionVisibility();
      setVisibilitySettings(vis);
    };
    loadVisibility();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-sm font-bold font-mono tracking-wide text-slate-100 flex items-center gap-2">
            <Eye size={16} className="text-emerald-400" />
            <span>VISIBILITÉ DES SECTIONS</span>
          </h2>
          <p className="text-slate-400 text-[10px] uppercase font-mono tracking-wider mt-1">
            Activez ou désactivez les sections affichées sur le site.
          </p>
        </div>
        <button 
          onClick={async () => {
            if (!visibilitySettings) return;
            setIsSavingVisibility(true);
            const res = await saveSectionVisibility(visibilitySettings);
            setIsSavingVisibility(false);
            if (res.ok) {
              showStatus("Visibilité sauvegardée avec succès !", "success");
              window.dispatchEvent(new Event('portfolio_config_updated'));
            } else {
              showStatus("Erreur lors de la sauvegarde: " + res.error, "err");
            }
          }} 
          disabled={isSavingVisibility || !visibilitySettings}
          className="py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 self-start md:self-auto cursor-pointer"
        >
          <Check size={12} className={isSavingVisibility ? "animate-pulse" : ""} />
          <span>{isSavingVisibility ? "Enregistrement..." : "Enregistrer"}</span>
        </button>
      </div>

      {statusMessage.text && (
        <div className={`px-6 py-2 rounded-xl text-[11px] font-mono leading-relaxed transition-all duration-300 flex items-center gap-2 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/30 border border-emerald-800/50 text-emerald-400' 
            : statusMessage.type === 'err' 
            ? 'bg-red-950/30 border border-red-800/50 text-red-400'
            : 'bg-indigo-950/30 border border-indigo-800/50 text-indigo-400'
        }`}>
          {statusMessage.type === 'success' ? <Check size={12} /> : <AlertTriangle size={12} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {!visibilitySettings ? (
        <div className="py-20 text-center text-slate-400 font-mono text-sm">Chargement des paramètres...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(visibilitySettings).map(([key, value]) => {
            // Avoid unlisted keys
            if (!['home', 'about', 'services', 'skills', 'certifications', 'projects', 'experience', 'blog', 'contact', 'github', 'pipeline', 'ml_playground', 'terminal', 'cv_generator'].includes(key)) return null;
            
            const toggleKey = key as keyof SectionVisibility;
            return (
              <div key={key} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm font-mono text-slate-300 capitalize">
                  {key.replace('_', ' ')}
                </span>
                <button
                  type="button"
                  onClick={() => setVisibilitySettings(prev => prev ? ({ ...prev, [toggleKey]: !prev[toggleKey] }) : null)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    value ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      value ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, Check, RefreshCw, Upload, Download, Eye, Layout, Palette, Type, Link as LinkIcon, Trash2, Plus, Github, Linkedin, Mail, MapPin, Phone, ExternalLink, X } from 'lucide-react';
import { AnimatePresence } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from "recharts";

export const ConfigCVPanel = ({    cvFullName, setCvFullName, cvJobTitle, setCvJobTitle, cvAvatarUrl, setCvAvatarUrl, cvSummary, setCvSummary, cvEmail, setCvEmail, cvPhone, setCvPhone, cvLocation, setCvLocation, cvGithub, setCvGithub, cvLinkedin, setCvLinkedin, cvWebsite, setCvWebsite, cvShowWebsite, setCvShowWebsite, cvLanguages, setCvLanguages, cvTemplate, setCvTemplate, cvFontFamily, setCvFontFamily, cvColorTheme, setCvColorTheme, handleUpdateCvConfig, isLoading, handleFileChange, cvAvatarFile, setCvAvatarFile, statusMessage, isDragging, handleDragOver, handleDragLeave, handleDrop, cvSubTab, setCvSubTab, fetchGeneratedResumes, isResumesLoading, generatedResumes, handleUpdateCVConfig, cvPaperBg, setCvPaperBg, showStatus, showCvVisualStats, setShowCvVisualStats, cvChartTab, setCvChartTab , selectedInspectResume, setSelectedInspectResume , cvTemplateFilter, setCvTemplateFilter, cvViewMode, setCvViewMode, filteredResumes, cvSortField, cvSortOrder, handleCvSort, handleDeleteGeneratedResume , cvSearchTerm, setCvSearchTerm }: any) => {
  return (
    <>

              <motion.div
                key="config-cv-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-white font-mono uppercase tracking-wider mb-1 flex items-center gap-2">
                      📄 Gestion du Générateur de CV
                    </h2>
                    <p className="text-xs text-slate-400">
                      Modifiez les données pré-chargées par défaut ou accédez aux CV rédigés par les utilisateurs de l'application.
                    </p>
                  </div>
                  {cvSubTab === 'generated' && (
                    <button
                      type="button"
                      onClick={fetchGeneratedResumes}
                      className="self-start sm:self-center px-3.5 py-2 bg-slate-900 hover:bg-slate-850 text-slate-355 font-mono text-[11px] font-bold uppercase rounded-xl border border-slate-800 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <RefreshCw size={12} className={isResumesLoading ? "animate-spin" : ""} />
                      Synchroniser
                    </button>
                  )}
                </div>

                {/* Sub Tab Navigation */}
                <div className="flex border-b border-slate-850 gap-6 pb-0.5">
                  <button
                    type="button"
                    onClick={() => setCvSubTab('defaults')}
                    className={`pb-3.5 font-mono text-xs font-black tracking-wider uppercase transition-all relative cursor-pointer flex items-center gap-2 ${
                      cvSubTab === 'defaults' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ⚙️ Configuration par Défaut
                    {cvSubTab === 'defaults' && (
                      <motion.div layoutId="cvActiveUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCvSubTab('generated');
                      fetchGeneratedResumes();
                    }}
                    className={`pb-3.5 font-mono text-xs font-black tracking-wider uppercase transition-all relative cursor-pointer flex items-center gap-2 ${
                      cvSubTab === 'generated' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    📂 CVs Générés ({generatedResumes.length})
                    {cvSubTab === 'generated' && (
                      <motion.div layoutId="cvActiveUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                    )}
                  </button>
                </div>

                {cvSubTab === 'defaults' ? (
                  <form onSubmit={handleUpdateCVConfig} className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-6 max-w-4xl">
                  {/* Profil */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2 font-mono flex items-center gap-1.5">
                      👤 Profil & Identité par défaut
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                          Nom Complet
                        </label>
                        <input 
                          type="text" 
                          required
                          value={cvFullName}
                          onChange={(e) => setCvFullName(e.target.value)}
                          placeholder="e.g. Alexandre Dupont"
                          className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                          Poste / Titre de profil
                        </label>
                        <input 
                          type="text" 
                          required
                          value={cvJobTitle}
                          onChange={(e) => setCvJobTitle(e.target.value)}
                          placeholder="e.g. Data Scientist Senior"
                          className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                        Résumé / Synthèse de présentation
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={cvSummary}
                        onChange={(e) => setCvSummary(e.target.value)}
                        placeholder="Présentation accrocheuse résumant vos compétences clés..."
                        className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>

                    {/* Photo de profil uploader / url edit */}
                    <div className="space-y-2.5 bg-slate-950/40 p-4 border border-slate-800/80 rounded-xl">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">📷 Photo de profil par défaut sur le CV (avatarUrl)</label>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-800 shrink-0 bg-slate-950 flex items-center justify-center shadow-lg">
                          {cvAvatarUrl ? (
                            <img src={cvAvatarUrl} alt="Aperçu" className="w-full h-full object-cover" onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop";
                            }} />
                          ) : (
                            <span className="text-[8px] text-slate-550">Aucun</span>
                          )}
                        </div>

                        <div className="flex-grow w-full space-y-2">
                          <div className="block">
                            <label className="flex items-center justify-center gap-1.5 cursor-pointer py-2 px-3 border border-slate-800 bg-slate-950 hover:bg-slate-900 text-[10px] font-bold text-slate-300 rounded-xl transition-all shadow-md">
                              <Upload size={11} className="text-emerald-500" />
                              <span>Téléverser une nouvelle image</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      if (typeof reader.result === 'string') {
                                        setCvAvatarUrl(reader.result as string);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>

                          <div className="space-y-1">
                            <input
                              type="text"
                              value={cvAvatarUrl || ""}
                              placeholder="Ou entrez l'URL directe d'une image..."
                              onChange={(e) => setCvAvatarUrl(e.target.value)}
                              className="w-full text-xs py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coordonnées */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2 font-mono flex items-center gap-1.5">
                      ✉️ Contacts & Liens par défaut
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                          Adresse Email
                        </label>
                        <input 
                          type="email" 
                          required
                          value={cvEmail}
                          onChange={(e) => setCvEmail(e.target.value)}
                          placeholder="e.g. contact@domain.com"
                          className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                          Téléphone
                        </label>
                        <input 
                          type="text" 
                          required
                          value={cvPhone}
                          onChange={(e) => setCvPhone(e.target.value)}
                          placeholder="e.g. +33 6 12 34 56 78"
                          className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                          Localisation (Ville, Pays)
                        </label>
                        <input 
                          type="text" 
                          required
                          value={cvLocation}
                          onChange={(e) => setCvLocation(e.target.value)}
                          placeholder="e.g. Paris, France"
                          className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                          URL GitHub
                        </label>
                        <input 
                          type="url" 
                          value={cvGithub}
                          onChange={(e) => setCvGithub(e.target.value)}
                          placeholder="e.g. https://github.com/..."
                          className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                          URL LinkedIn
                        </label>
                        <input 
                          type="url" 
                          value={cvLinkedin}
                          onChange={(e) => setCvLinkedin(e.target.value)}
                          placeholder="e.g. https://linkedin.com/in/..."
                          className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                          Site Web / Portfolio
                        </label>
                        <input 
                          type="url" 
                          value={cvWebsite}
                          onChange={(e) => setCvWebsite(e.target.value)}
                          placeholder="e.g. https://alexdupont.dev"
                          className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 pb-1">
                      <input
                        type="checkbox"
                        id="cvShowWebsiteToggle"
                        checked={cvShowWebsite}
                        onChange={(e) => setCvShowWebsite(e.target.checked)}
                        className="w-4 h-4 text-emerald-500 border-slate-800 bg-slate-950 rounded focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                      />
                      <label htmlFor="cvShowWebsiteToggle" className="text-xs font-semibold text-slate-350 cursor-pointer select-none">
                        Afficher le site web / portfolio par défaut sur le CV physique
                      </label>
                    </div>
                  </div>

                  {/* Langues */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                        🗣️ Langues parlées par défaut
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setCvLanguages(prev => [...(prev || []), { name: "", level: "" }]);
                        }}
                        className="px-2 py-1 text-[8px] font-bold uppercase tracking-wider font-mono bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-450 flex items-center gap-0.5 cursor-pointer hover:bg-emerald-500/25 transition-all"
                      >
                        <Plus size={10} /> Ajouter une langue
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(cvLanguages || []).map((l, lIdx) => (
                        <div key={lIdx} className="flex gap-2 items-center bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                          <input
                            type="text"
                            value={l.name || ""}
                            placeholder="Langue (ex: Anglais)"
                            onChange={(e) => {
                              const freshL = [...cvLanguages];
                              freshL[lIdx] = { ...freshL[lIdx], name: e.target.value };
                              setCvLanguages(freshL);
                            }}
                            className="w-1/2 text-xs py-1.5 px-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none focus:border-emerald-500 font-mono"
                          />
                          <input
                            type="text"
                            value={l.level || ""}
                            placeholder="Niveau (ex: Courant)"
                            onChange={(e) => {
                              const freshL = [...cvLanguages];
                              freshL[lIdx] = { ...freshL[lIdx], level: e.target.value };
                              setCvLanguages(freshL);
                            }}
                            className="w-1/2 text-xs py-1.5 px-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none focus:border-emerald-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCvLanguages(cvLanguages.filter((_, idx) => idx !== lIdx));
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                            title="Supprimer cette langue"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      {(cvLanguages || []).length === 0 && (
                        <div className="col-span-2 text-center py-4 text-[10px] font-mono text-slate-500 bg-slate-950/20 rounded-xl border border-dashed border-slate-800">
                          Aucune langue renseignée. Cliquez sur "Ajouter une langue" pour en configurer.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Design */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2 font-mono flex items-center gap-1.5">
                      🎨 Gabarits Visuels & Chartes Graphiques
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Template Selector */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                          Layout Template
                        </label>
                        <select
                          value={cvTemplate}
                          onChange={(e: any) => setCvTemplate(e.target.value)}
                          className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          <option value="split">Split Layout (Moderne)</option>
                          <option value="modern">Modern Minimalist</option>
                          <option value="executive">Executive Classic</option>
                          <option value="bento">Bento Grid (Innovant)</option>
                        </select>
                      </div>

                      {/* Font */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                          Typographie
                        </label>
                        <select
                          value={cvFontFamily}
                          onChange={(e: any) => setCvFontFamily(e.target.value)}
                          className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          <option value="sans">Inter Sans (Standard)</option>
                          <option value="mono">JetBrains Mono (Tech)</option>
                          <option value="serif">Lora Serif (Élégant)</option>
                          <option value="display">Space Grotesk (Moderne)</option>
                        </select>
                      </div>

                      {/* Color Palette */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                          Thème Palette
                        </label>
                        <select
                          value={cvColorTheme}
                          onChange={(e: any) => setCvColorTheme(e.target.value)}
                          className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          <option value="midnight">Cosmic Midnight (Ardoise)</option>
                          <option value="emerald">Emerald Zen (Émeraude)</option>
                          <option value="royal">Royal Premium (Bleu royal)</option>
                          <option value="berry">Wild Berry (Fruits sauvages)</option>
                        </select>
                      </div>

                      {/* Background Style */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                          Style d'Arrière-plan
                        </label>
                        <select
                          value={cvPaperBg}
                          onChange={(e: any) => setCvPaperBg(e.target.value)}
                          className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          <option value="white">Blanc Pur</option>
                          <option value="cream">Crème Vintage</option>
                          <option value="mist">Brumes Matinales</option>
                          <option value="amber">Ambre Doux</option>
                          <option value="grid">Grille Militaire (Tech)</option>
                          <option value="slate">Slate Dark (Sombre)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setCvFullName("Alexandre Dupont");
                        setCvJobTitle("Data Scientist Senior & Développeur Full-Stack");
                        setCvAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop");
                        setCvSummary("Data Scientist chevronné et ingénieur Full-Stack robuste. Expert dans l'élaboration de modèles intelligents, l'ingénierie de données complexes et le développement d'interfaces web interactives haut de gamme réactives.");
                        setCvEmail("alexandre.dupont@dev.fr");
                        setCvPhone("+33 6 12 34 56 78");
                        setCvLocation("Paris, France");
                        setCvGithub("https://github.com/alexdupont");
                        setCvLinkedin("https://linkedin.com/in/alexdupont");
                        setCvWebsite("https://alexdupont.dev");
                        setCvShowWebsite(true);
                        setCvLanguages([
                          { name: "Français", level: "Natif" },
                          { name: "Anglais", level: "Professionnel (C1 - 945 TOEIC)" },
                          { name: "Espagnol", level: "Intermédiaire (B2)" }
                        ]);
                        setCvTemplate('split');
                        setCvFontFamily('sans');
                        setCvColorTheme('midnight');
                        setCvPaperBg('white');
                        showStatus("Formulaire réinitialisé aux données d'origine usine locaux. Cliquez sur 'Enregistrer' pour synchroniser.", "success");
                      }}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800 hover:text-slate-200 rounded-xl text-xs font-mono tracking-wider uppercase cursor-pointer transition-colors"
                    >
                      Données Usine
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs font-mono tracking-wide uppercase cursor-pointer transition-colors"
                    >
                      {isLoading ? "Envoi en cours..." : "Enregistrer la config CV"}
                    </button>
                  </div>
                </form>
                ) : (
                  <div className="space-y-6">
                    {/* CV Mini Stats Dashboard */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono text-slate-400">CVs Uniques Enregistrés</span>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-white font-mono">{generatedResumes.length}</span>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold">Actif</span>
                        </div>
                      </div>

                      <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono text-slate-400">Layout Préféré</span>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-xs font-black text-emerald-400 uppercase tracking-wide font-mono">
                            {(() => {
                              const templateCount = generatedResumes.reduce((acc: any, curr) => {
                                acc[curr.template] = (acc[curr.template] || 0) + 1;
                                return acc;
                              }, {});
                              let popular = "Aucun";
                              let maxCount = 0;
                              Object.keys(templateCount).forEach(k => {
                                if (templateCount[k] > maxCount) {
                                  maxCount = templateCount[k];
                                  popular = k === 'split' ? "Split Layout" : k === 'modern' ? "Modern" : k === 'executive' ? "Executive" : k === 'bento' ? "Bento Grid" : k;
                                }
                              });
                              return popular;
                            })()}
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono text-slate-400 font-mono">Moy. Compétences / CV</span>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-white font-mono">
                            {(generatedResumes.reduce((acc, curr) => acc + (curr.skillsCount || 0), 0) / Math.max(1, generatedResumes.length)).toFixed(1)}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono font-bold">items</span>
                        </div>
                      </div>

                      <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono text-slate-400 font-mono">Moy. Expériences / CV</span>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-white font-mono">
                            {(generatedResumes.reduce((acc, curr) => acc + (curr.experienceCount || 0), 0) / Math.max(1, generatedResumes.length)).toFixed(1)}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono font-bold font-mono">postes</span>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Analytique Card with Recharts */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">📊</span>
                          <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-white font-mono">
                              Analyse & Tendance des CV Générés
                            </h3>
                            <p className="text-[10px] text-slate-400">
                              Aperçu interactif des choix d'esthétique, des thèmes et de la fréquence de rédaction.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCvVisualStats(!showCvVisualStats)}
                          className="self-start sm:self-center px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] font-mono uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                        >
                          {showCvVisualStats ? "Masquer les Graphiques ▲" : "Afficher les Graphiques ▼"}
                        </button>
                      </div>

                      {showCvVisualStats && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 overflow-hidden pt-2"
                        >
                          {/* Segmented control for charts tab */}
                          <div className="flex bg-slate-950 p-1 border border-slate-850 rounded-xl max-w-lg">
                            <button
                              type="button"
                              onClick={() => setCvChartTab('timeline')}
                              className={`flex-1 py-1.5 text-center rounded-lg text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                                cvChartTab === 'timeline'
                                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              📈 Fréquence / Timeline
                            </button>
                            <button
                              type="button"
                              onClick={() => setCvChartTab('templates')}
                              className={`flex-1 py-1.5 text-center rounded-lg text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                                cvChartTab === 'templates'
                                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              🎨 Gabarits de design
                            </button>
                            <button
                              type="button"
                              onClick={() => setCvChartTab('colors')}
                              className={`flex-1 py-1.5 text-center rounded-lg text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                                cvChartTab === 'colors'
                                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              🌈 Thèmes de Couleur
                            </button>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
                            {/* Chart Display Area */}
                            <div className="lg:col-span-2 bg-slate-950/40 border border-slate-850/80 p-4 rounded-xl min-h-[250px] flex flex-col justify-between">
                              <div className="mb-2">
                                <h4 className="text-[10px] font-bold uppercase font-mono text-slate-400">
                                  {cvChartTab === 'timeline' && "Volume cumulé des rédactions (derniers 7 jours)"}
                                  {cvChartTab === 'templates' && "Index de popularité des gabarits (Layout templates)"}
                                  {cvChartTab === 'colors' && "Répartition des choix de palettes d'accentuation"}
                                </h4>
                              </div>

                              <div className="w-full h-48 mt-2">
                                {generatedResumes.length === 0 ? (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 space-y-1">
                                    <span className="text-xl">📁</span>
                                    <p className="text-[9px] font-mono text-slate-500 uppercase">Aucun CV répertorié</p>
                                    <p className="text-[9px] text-slate-600 max-w-[200px]">Créez ou exportez des CVs pour peupler l'historique de l'application.</p>
                                  </div>
                                ) : (
                                  <ResponsiveContainer width="100%" height={192} minWidth={0}>
                                    {cvChartTab === 'timeline' ? (
                                      <AreaChart data={(() => {
                                        const dataMap: { [key: string]: number } = {};
                                        const today = new Date();
                                        for (let i = 6; i >= 0; i--) {
                                          const d = new Date();
                                          d.setDate(today.getDate() - i);
                                          const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
                                          dataMap[label] = 0;
                                        }
                                        generatedResumes.forEach(r => {
                                          if (!r.timestamp) return;
                                          try {
                                            const d = new Date(r.timestamp);
                                            const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
                                            if (dataMap[label] !== undefined) {
                                              dataMap[label] += 1;
                                            }
                                          } catch (e) {}
                                        });
                                        return Object.keys(dataMap).map(key => ({
                                          date: key,
                                          Générations: dataMap[key]
                                        }));
                                      })()}>
                                        <defs>
                                          <linearGradient id="colorGenerations" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                          </linearGradient>
                                        </defs>
                                        <XAxis 
                                          dataKey="date" 
                                          stroke="#475569" 
                                          fontSize={8} 
                                          tickLine={false} 
                                          axisLine={{ stroke: '#1e293b' }}
                                          fontFamily="monospace"
                                        />
                                        <YAxis 
                                          stroke="#475569" 
                                          fontSize={8} 
                                          tickLine={false} 
                                          axisLine={{ stroke: '#1e293b' }}
                                          fontFamily="monospace"
                                          allowDecimals={false}
                                        />
                                        <Tooltip 
                                          contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }}
                                          labelStyle={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '9px', fontWeight: 'bold' }}
                                          itemStyle={{ color: '#10b981', fontFamily: 'monospace', fontSize: '10px' }}
                                        />
                                        <Area type="monotone" dataKey="Générations" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorGenerations)" />
                                      </AreaChart>
                                    ) : cvChartTab === 'templates' ? (
                                      <BarChart data={(() => {
                                        const counts: { [key: string]: number } = { split: 0, modern: 0, executive: 0, bento: 0 };
                                        generatedResumes.forEach(r => {
                                          const t = r.template || 'split';
                                          if (counts[t] !== undefined) counts[t] += 1;
                                        });
                                        const labels: { [key: string]: string } = {
                                          split: 'Split Layout',
                                          modern: 'Modern',
                                          executive: 'Executive',
                                          bento: 'Bento Grid'
                                        };
                                        return Object.keys(counts).map(key => ({
                                          name: labels[key],
                                          Nombre: counts[key]
                                        }));
                                      })()}>
                                        <XAxis 
                                          dataKey="name" 
                                          stroke="#475569" 
                                          fontSize={8} 
                                          tickLine={false} 
                                          axisLine={{ stroke: '#1e293b' }}
                                          fontFamily="monospace"
                                        />
                                        <YAxis 
                                          stroke="#475569" 
                                          fontSize={8} 
                                          tickLine={false} 
                                          axisLine={{ stroke: '#1e293b' }}
                                          fontFamily="monospace"
                                          allowDecimals={false}
                                        />
                                        <Tooltip 
                                          cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                                          contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }}
                                          labelStyle={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '9px' }}
                                          itemStyle={{ color: '#06b6d4', fontFamily: 'monospace', fontSize: '10px' }}
                                        />
                                        <Bar dataKey="Nombre" fill="#06b6d4" radius={[3, 3, 0, 0]}>
                                          {
                                            ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'].map((color, index) => (
                                              <Cell key={`cell-${index}`} fill={color} />
                                            ))
                                          }
                                        </Bar>
                                      </BarChart>
                                    ) : (
                                      <BarChart 
                                        layout="vertical"
                                        data={(() => {
                                          const themes: { [key: string]: number } = {};
                                          generatedResumes.forEach(r => {
                                            const key = r.colorTheme || 'midnight';
                                            themes[key] = (themes[key] || 0) + 1;
                                          });
                                          return Object.keys(themes).map(key => ({
                                            theme: key.charAt(0).toUpperCase() + key.slice(1),
                                            Créations: themes[key]
                                          })).sort((a,b) => b.Créations - a.Créations).slice(0, 5);
                                        })()}
                                      >
                                        <XAxis 
                                          type="number"
                                          stroke="#475569" 
                                          fontSize={8} 
                                          tickLine={false} 
                                          axisLine={{ stroke: '#1e293b' }}
                                          fontFamily="monospace"
                                          allowDecimals={false}
                                        />
                                        <YAxis 
                                          type="category"
                                          dataKey="theme" 
                                          stroke="#475569" 
                                          fontSize={8} 
                                          tickLine={false} 
                                          axisLine={{ stroke: '#1e293b' }}
                                          fontFamily="monospace"
                                          width={75}
                                        />
                                        <Tooltip 
                                          cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                                          contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }}
                                          labelStyle={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '9px' }}
                                          itemStyle={{ color: '#8b5cf6', fontFamily: 'monospace', fontSize: '10px' }}
                                        />
                                        <Bar dataKey="Créations" fill="#8b5cf6" radius={[0, 3, 3, 0]} barSize={12} />
                                      </BarChart>
                                    )}
                                  </ResponsiveContainer>
                                )}
                              </div>
                            </div>

                            {/* Sidebar Insights */}
                            <div className="bg-slate-950/25 border border-slate-850/60 p-4 rounded-xl flex flex-col justify-between space-y-4">
                              <div className="space-y-1.5">
                                <h4 className="text-[9px] font-black uppercase font-mono text-emerald-400">💡 Optimisation default</h4>
                                <p className="text-[9px] text-slate-400 font-sans leading-relaxed">
                                  Renseignements analytiques calculés sur les préférences d'embauche de vos utilisateurs d'après les copies de CVs actives.
                                </p>
                              </div>

                              <div className="space-y-2">
                                <div className="p-2 bg-slate-950/70 rounded-lg border border-slate-850 flex items-center justify-between">
                                  <span className="text-[8px] font-mono text-slate-500 uppercase">Option design n°1</span>
                                  <span className="text-[9px] font-mono font-bold text-white">
                                    {(() => {
                                      const counts: { [key: string]: number } = {};
                                      generatedResumes.forEach(r => { counts[r.template] = (counts[r.template] || 0) + 1; });
                                      let fav = 'bento';
                                      let maxVal = -1;
                                      Object.keys(counts).forEach(k => {
                                        if (counts[k] > maxVal) { maxVal = counts[k]; fav = k; }
                                      });
                                      const names: any = { split: 'Split Layout', modern: 'Modern', executive: 'Executive', bento: 'Bento Grid' };
                                      return generatedResumes.length > 0 ? (names[fav] || fav) : 'Aucun';
                                    })()}
                                  </span>
                                </div>

                                <div className="p-2 bg-slate-950/70 rounded-lg border border-slate-850 flex items-center justify-between">
                                  <span className="text-[8px] font-mono text-slate-500 uppercase">Thème le moins rédigé</span>
                                  <span className="text-[9px] font-mono font-bold text-rose-450">
                                    {(() => {
                                      const counts: { [key: string]: number } = { midnight: 0, forest: 0, ocean: 0, sunset: 0, luxury: 0 };
                                      generatedResumes.forEach(r => {
                                        const theme = r.colorTheme || 'midnight';
                                        if (counts[theme] !== undefined) counts[theme]++;
                                      });
                                      let leastFav = 'ocean';
                                      let minVal = Infinity;
                                      let foundAny = false;
                                      Object.keys(counts).forEach(k => {
                                        if (counts[k] > 0) foundAny = true;
                                        if (counts[k] < minVal) { minVal = counts[k]; leastFav = k; }
                                      });
                                      return generatedResumes.length > 0 && foundAny ? leastFav.charAt(0).toUpperCase() + leastFav.slice(1) : 'Aucun';
                                    })()}
                                  </span>
                                </div>

                                <div className="p-2 bg-slate-950/70 rounded-lg border border-slate-850 flex items-center justify-between">
                                  <span className="text-[8px] font-mono text-slate-500 uppercase">Fermeté 24 dernières h</span>
                                  <span className="text-[9px] font-mono font-bold text-emerald-400">
                                    {(generatedResumes.filter(r => {
                                      const diff = Date.now() - new Date(r.timestamp).getTime();
                                      return diff <= 24 * 60 * 60 * 1000;
                                    }).length)} CVs
                                  </span>
                                </div>
                              </div>
                              <div className="text-[8px] text-slate-600 font-mono italic text-right uppercase tracking-wider">
                                Calcul en direct
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Filter and Search Bar with View Mode Toggles */}
                    <div className="flex flex-col xl:flex-row gap-3 bg-slate-900/20 border border-slate-850 p-3 rounded-xl justify-between">
                      <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={cvSearchTerm}
                            onChange={(e) => setCvSearchTerm(e.target.value)}
                            placeholder="Rechercher par nom, poste, email, mots-clés..."
                            className="w-full py-2 pl-9 pr-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                          />
                          <span className="absolute left-3 top-2.5 text-slate-500">🔍</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold pl-1">Filtrer:</span>
                          <select
                            value={cvTemplateFilter}
                            onChange={(e: any) => setCvTemplateFilter(e.target.value)}
                            className="py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-350 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="all">Tous les templates</option>
                            <option value="split">Split Layout</option>
                            <option value="modern">Modern Minimalist</option>
                            <option value="executive">Executive Classic</option>
                            <option value="bento">Bento Grid</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end xl:self-auto">
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Affichage:</span>
                        <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg">
                          <button
                            type="button"
                            onClick={() => setCvViewMode('table')}
                            className={`px-3 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                              cvViewMode === 'table' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            📋 Tableau
                          </button>
                          <button
                            type="button"
                            onClick={() => setCvViewMode('grid')}
                            className={`px-3 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                              cvViewMode === 'grid' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            🗂️ Grille
                          </button>
                        </div>
                      </div>
                    </div>

                    {isResumesLoading ? (
                      <div className="py-16 text-center space-y-3">
                        <div className="animate-spin text-slate-600 mx-auto w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
                        <p className="text-xs text-slate-400 font-mono">Synchronisation des CV avec la base de données...</p>
                      </div>
                    ) : filteredResumes.length === 0 ? (
                      <div className="border border-dashed border-slate-800 rounded-2xl py-12 text-center">
                        <p className="text-slate-500 text-xs font-mono">Aucun CV correspondant ou généré pour le moment.</p>
                        <p className="text-slate-600 text-[10px] font-sans mt-2">
                          Tous les CV créés et modifiés sur le générateur se synchroniseront automatiquement ici en temps réel.
                        </p>
                      </div>
                    ) : cvViewMode === 'table' ? (
                      /* Rich searchable and sortable table container */
                      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/10">
                        <div className="overflow-x-auto custom-scrollbar">
                          <table className="w-full text-left border-collapse font-sans text-xs">
                            <thead>
                              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono text-[9px] uppercase tracking-wider font-bold">
                                <th 
                                  onClick={() => handleCvSort('fullName')}
                                  className="p-3.5 pl-5 cursor-pointer hover:bg-slate-900 hover:text-white transition-colors"
                                >
                                  <div className="flex items-center gap-1.5 justify-start">
                                    Nom & Titre professionnel
                                    <span className="text-emerald-400 font-bold">
                                      {cvSortField === 'fullName' ? (cvSortOrder === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                                    </span>
                                  </div>
                                </th>
                                <th className="p-3.5 pl-3">Infos contact</th>
                                <th 
                                  onClick={() => handleCvSort('template')}
                                  className="p-3.5 pl-3 cursor-pointer hover:bg-slate-900 hover:text-white transition-colors"
                                >
                                  <div className="flex items-center gap-1.5">
                                    Gabarit / Design
                                    <span className="text-emerald-400 font-bold">
                                      {cvSortField === 'template' ? (cvSortOrder === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                                    </span>
                                  </div>
                                </th>
                                <th 
                                  onClick={() => handleCvSort('skillsCount')}
                                  className="p-3.5 pl-3 cursor-pointer hover:bg-slate-900 hover:text-white transition-colors text-right"
                                >
                                  <div className="flex items-center gap-1.5 justify-end">
                                    Compétences
                                    <span className="text-emerald-400 font-bold">
                                      {cvSortField === 'skillsCount' ? (cvSortOrder === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                                    </span>
                                  </div>
                                </th>
                                <th 
                                  onClick={() => handleCvSort('experienceCount')}
                                  className="p-3.5 pl-3 cursor-pointer hover:bg-slate-900 hover:text-white transition-colors text-right"
                                >
                                  <div className="flex items-center gap-1.5 justify-end">
                                    Expérience
                                    <span className="text-emerald-400 font-bold">
                                      {cvSortField === 'experienceCount' ? (cvSortOrder === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                                    </span>
                                  </div>
                                </th>
                                <th 
                                  onClick={() => handleCvSort('timestamp')}
                                  className="p-3.5 pl-3 cursor-pointer hover:bg-slate-900 hover:text-white transition-colors"
                                >
                                  <div className="flex items-center gap-1.5 justify-start">
                                    Dernière sync
                                    <span className="text-emerald-400 font-bold">
                                      {cvSortField === 'timestamp' ? (cvSortOrder === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                                    </span>
                                  </div>
                                </th>
                                <th className="p-3.5 pr-5 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-850/60 font-mono text-[11px] text-slate-300">
                              {filteredResumes.map((resume: any, index) => {
                                const formattedDate = new Date(resume.timestamp).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                });

                                // Template badges coloring
                                const templateColorObj = 
                                  resume.template === 'bento' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                                  resume.template === 'split' ? 'text-sky-400 bg-sky-500/10 border-sky-500/20' :
                                  resume.template === 'modern' ? 'text-violet-400 bg-violet-500/10 border-violet-500/20' :
                                  'text-amber-400 bg-amber-500/10 border-amber-500/20';

                                return (
                                  <tr 
                                    key={resume.id} 
                                    className="hover:bg-slate-900/30 transition-colors group"
                                  >
                                    {/* Name and Professional Title */}
                                    <td className="p-3.5 pl-5 font-sans">
                                      <div className="flex items-center gap-3">
                                        {/* Avatar initials placeholder */}
                                        <div className="w-7 h-7 rounded-lg bg-slate-950 font-mono text-[10px] font-black uppercase text-emerald-400 flex items-center justify-center border border-slate-800">
                                          {(resume.fullName || 'CV').split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                                        </div>
                                        <div>
                                          <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                                            {resume.fullName}
                                          </div>
                                          <div className="text-[10px] text-slate-450 mt-0.5 max-w-[180px] truncate" title={resume.jobTitle}>
                                            {resume.jobTitle || 'Sans titre professionnel'}
                                          </div>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Contact information column */}
                                    <td className="p-3.5 pl-3">
                                      <div className="space-y-0.5 text-[10px] text-slate-400">
                                        {resume.email ? (
                                          <a href={`mailto:${resume.email}`} className="block hover:underline text-slate-300">
                                            ✉️ {resume.email}
                                          </a>
                                        ) : null}
                                        {resume.phone ? (
                                          <span className="block text-slate-400">📞 {resume.phone}</span>
                                        ) : null}
                                        {resume.location ? (
                                          <span className="block text-[9px] text-slate-500">📍 {resume.location}</span>
                                        ) : null}
                                      </div>
                                    </td>

                                    {/* Template & Styling details */}
                                    <td className="p-3.5 pl-3">
                                      <div className="flex flex-col gap-1 items-start justify-center">
                                        <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${templateColorObj}`}>
                                          {resume.template || 'split'}
                                        </span>
                                        <span className="text-[9px] text-slate-500">
                                          Thème: <span className="text-slate-350">{resume.colorTheme || 'midnight'}</span>
                                        </span>
                                      </div>
                                    </td>

                                    {/* Skills Count */}
                                    <td className="p-3.5 pl-3 text-right">
                                      <span className="px-2 py-1 bg-slate-950 rounded text-slate-300 font-bold border border-slate-850">
                                        {resume.skillsCount || 0}
                                      </span>
                                    </td>

                                    {/* Experience Count */}
                                    <td className="p-3.5 pl-3 text-right">
                                      <span className="px-2 py-1 bg-slate-950 rounded text-slate-300 font-bold border border-slate-850">
                                        {resume.experienceCount || 0}
                                      </span>
                                    </td>

                                    {/* Sync timestamp date */}
                                    <td className="p-3.5 pl-3 text-slate-400 whitespace-nowrap text-[10px]">
                                      {formattedDate}
                                    </td>

                                    {/* Actions button series */}
                                    <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => setSelectedInspectResume(resume)}
                                          className="p-1 px-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded text-[10px] uppercase font-bold tracking-wide transition-all cursor-pointer"
                                        >
                                          🔍 Inspecter
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteGeneratedResume(resume.id)}
                                          className="p-1.5 bg-slate-950 text-slate-550 hover:text-rose-400 border border-slate-800 hover:border-rose-950/60 hover:bg-rose-950/20 rounded transition-all cursor-pointer"
                                          title="Purger ce CV"
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="p-3 bg-slate-950/40 text-center border-t border-slate-850 text-[9px] text-slate-500 font-mono uppercase tracking-wider flex justify-between px-5">
                          <span>Données synchronisées en temps réel</span>
                          <span>{filteredResumes.length} enregistrements filtrés</span>
                        </div>
                      </div>
                    ) : (
                      /* Fallback Grid code preserved */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filteredResumes.map((resume: any) => {
                          const formattedDate = new Date(resume.timestamp).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric'
                          });

                          return (
                            <div key={resume.id} className="bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all flex flex-col justify-between group space-y-4">
                              <div className="space-y-3">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="text-sm font-black text-white font-mono tracking-wide mb-0.5">
                                      {resume.fullName}
                                    </h4>
                                    <p className="text-xs font-bold text-emerald-400 font-sans">
                                      {resume.jobTitle || 'Sans titre professionnel'}
                                    </p>
                                  </div>

                                  <div className="flex gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedInspectResume(resume)}
                                      className="p-1 px-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded text-[9px] uppercase font-bold tracking-wide transition-all cursor-pointer"
                                    >
                                      Visualiser
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteGeneratedResume(resume.id)}
                                      className="p-1 px-2 bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/50 text-slate-500 hover:text-rose-450 rounded-lg text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                                      title="Supprimer ce CV"
                                    >
                                      <Trash2 size={10} />
                                      Purger
                                    </button>
                                  </div>
                                </div>

                                {/* Body metadata details */}
                                <div className="space-y-1.5 pt-2 border-t border-slate-850">
                                  {resume.email && (
                                    <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                                      <span className="text-slate-600">✉️</span> 
                                      <a href={`mailto:${resume.email}`} className="hover:underline text-slate-350">{resume.email}</a>
                                    </p>
                                  )}
                                  {resume.phone && (
                                    <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                                      <span className="text-slate-600">📞</span> 
                                      <span className="text-slate-350">{resume.phone}</span>
                                    </p>
                                  )}
                                  {resume.location && (
                                    <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                                      <span className="text-slate-600">📍</span> 
                                      <span className="text-slate-350">{resume.location}</span>
                                    </p>
                                  )}
                                </div>

                                {/* Summary block snippet */}
                                {resume.summary && (
                                  <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-lg">
                                    <p className="text-[10px] text-slate-400 font-sans leading-relaxed line-clamp-2">
                                      {resume.summary}
                                    </p>
                                  </div>
                                )}

                                {/* Technical counts & specs */}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 bg-slate-950 border border-slate-850 rounded text-slate-300">
                                    🛠️ {resume.skillsCount || 0} compétences
                                  </span>
                                  <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 bg-slate-950 border border-slate-850 rounded text-slate-300">
                                    💼 {resume.experienceCount || 0} exp
                                  </span>
                                  <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 bg-slate-950 border border-slate-850 rounded text-slate-300">
                                    🎓 {resume.educationCount || 0} form
                                  </span>
                                  {resume.certificationCount > 0 && (
                                    <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 bg-slate-950 border border-slate-850 rounded text-slate-300">
                                      🏆 {resume.certificationCount} certifs
                                    </span>
                                  )}
                                </div>

                                {/* Layout Choices */}
                                <div className="grid grid-cols-2 gap-2 bg-slate-950/30 p-2 border border-slate-850 rounded-lg text-[9px] font-mono">
                                  <div>
                                    <span className="text-slate-500 block uppercase">Gabarit Layout:</span>
                                    <span className="text-emerald-400 font-bold capitalize">{resume.template || 'split'}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 block uppercase">Thème Couleur:</span>
                                    <span className="text-slate-350 capitalize">{resume.colorTheme || 'midnight'}</span>
                                  </div>
                                  <div className="pt-1">
                                    <span className="text-slate-500 block uppercase">Typographie:</span>
                                    <span className="text-slate-350 capitalize">{resume.fontFamily || 'sans'}</span>
                                  </div>
                                  <div className="pt-1">
                                    <span className="text-slate-500 block uppercase">Arrière-plan:</span>
                                    <span className="text-slate-350 capitalize">{resume.paperBg || 'white'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-[9px] text-slate-500 font-mono">
                                  <span>Session: {resume.id.substring(0, 16)}</span>
                                  <span>Sync: {formattedDate}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Detailed inspection modal for viewing full CV records */}
                    <AnimatePresence>
                      {selectedInspectResume && (
                        <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl relative"
                          >
                            {/* Close cross */}
                            <button
                              type="button"
                              onClick={() => setSelectedInspectResume(null)}
                              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                            >
                              <X size={18} />
                            </button>

                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-850 bg-slate-950/40">
                              <div className="flex items-baseline gap-2">
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] uppercase font-black uppercase">
                                  Fiche de CV détaillée
                                </span>
                                <span className="text-slate-500 font-mono text-[9px]">ID: {selectedInspectResume.id}</span>
                              </div>
                              <h3 className="text-lg font-black text-white font-mono uppercase tracking-wide mt-2">
                                🔎 Inspecter: {selectedInspectResume.fullName}
                              </h3>
                              <p className="text-xs font-bold text-emerald-400 font-sans mt-0.5">
                                {selectedInspectResume.jobTitle || 'Sans titre professionnel'}
                              </p>
                            </div>

                            {/* Modal Body / Resume payload visualizer */}
                            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 text-xs text-slate-300 font-mono">
                              {/* Sub Header Specs */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                                <div>
                                  <span className="text-[9px] text-slate-500 uppercase block">Gabarit layout</span>
                                  <span className="text-white font-bold capitalize">{selectedInspectResume.template || 'split'}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-500 uppercase block font-mono">Thème visuel</span>
                                  <span className="text-white font-bold capitalize">{selectedInspectResume.colorTheme || 'midnight'}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-500 uppercase block">Police</span>
                                  <span className="text-white font-bold capitalize">{selectedInspectResume.fontFamily || 'sans'}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-500 uppercase block">Arrière-plan</span>
                                  <span className="text-white font-bold capitalize">{selectedInspectResume.paperBg || 'white'}</span>
                                </div>
                              </div>

                              {/* Identity profile */}
                              <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase text-emerald-400 border-b border-slate-800 pb-1 font-mono">
                                  👤 Identité & Coordonnées
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                                  <p><span className="text-slate-500">Nom Complet :</span> <span className="text-white font-bold">{selectedInspectResume.fullName}</span></p>
                                  {selectedInspectResume.email && (
                                    <p>
                                      <span className="text-slate-500">Email :</span>{' '}
                                      <a href={`mailto:${selectedInspectResume.email}`} className="text-emerald-400 hover:underline">
                                        {selectedInspectResume.email}
                                      </a>
                                    </p>
                                  )}
                                  {selectedInspectResume.phone && (
                                    <p><span className="text-slate-500">Téléphone :</span> <span className="text-white">{selectedInspectResume.phone}</span></p>
                                  )}
                                  {selectedInspectResume.location && (
                                    <p><span className="text-slate-500">Localisation :</span> <span className="text-white">{selectedInspectResume.location}</span></p>
                                  )}
                                  {selectedInspectResume.website && (
                                    <p>
                                      <span className="text-slate-500">Site Web :</span>{' '}
                                      <a href={selectedInspectResume.website} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
                                        {selectedInspectResume.website}
                                      </a>
                                    </p>
                                  )}
                                  {selectedInspectResume.linkedin && (
                                    <p>
                                      <span className="text-slate-500">LinkedIn :</span>{' '}
                                      <a href={selectedInspectResume.linkedin} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
                                        {selectedInspectResume.linkedin}
                                      </a>
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Professional Summary */}
                              {selectedInspectResume.summary && (
                                <div className="space-y-2">
                                  <h4 className="text-[10px] font-black uppercase text-emerald-400 border-b border-slate-800 pb-1 font-mono">
                                    📝 Résumé Professionnel / Bio
                                  </h4>
                                  <div className="p-3 bg-slate-950/35 border border-slate-850 rounded-xl leading-relaxed text-slate-300 font-sans">
                                    {selectedInspectResume.summary}
                                  </div>
                                </div>
                              )}

                              {/* Skills */}
                              {selectedInspectResume.skills && Array.isArray(selectedInspectResume.skills) && selectedInspectResume.skills.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="text-[10px] font-black uppercase text-emerald-400 border-b border-slate-800 pb-1 font-mono">
                                    🛠️ Compétences Renseignées ({selectedInspectResume.skills.length})
                                  </h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {selectedInspectResume.skills.map((skill: string, sIndex: number) => (
                                      <span key={sIndex} className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-[10px] text-slate-200 rounded-lg">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Experiences */}
                              {selectedInspectResume.experiences && Array.isArray(selectedInspectResume.experiences) && selectedInspectResume.experiences.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="text-[10px] font-black uppercase text-emerald-400 border-b border-slate-800 pb-1 font-mono">
                                    💼 Parcours Professionnel ({selectedInspectResume.experiences.length})
                                  </h4>
                                  <div className="space-y-3">
                                    {selectedInspectResume.experiences.map((exp: any, eIdx: number) => (
                                      <div key={eIdx} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1.5">
                                        <div className="flex justify-between items-start flex-wrap gap-y-1">
                                          <div>
                                            <span className="font-bold text-white text-[11px] block">{exp.role || "Poste"}</span>
                                            <span className="text-emerald-450 text-[10px]">{exp.company || "Entreprise"}</span>
                                          </div>
                                          <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-450 font-mono">
                                            {exp.period || "Période"}
                                          </span>
                                        </div>
                                        {exp.description && (
                                          <p className="text-[10px] text-slate-400 font-sans leading-relaxed mt-1">
                                            {exp.description}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Educations */}
                              {selectedInspectResume.educations && Array.isArray(selectedInspectResume.educations) && selectedInspectResume.educations.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="text-[10px] font-black uppercase text-emerald-400 border-b border-slate-800 pb-1 font-mono">
                                    🎓 Formations & Diplômes ({selectedInspectResume.educations.length})
                                  </h4>
                                  <div className="space-y-3">
                                    {selectedInspectResume.educations.map((edu: any, edIdx: number) => (
                                      <div key={edIdx} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1.5">
                                        <div className="flex justify-between items-start flex-wrap gap-y-1">
                                          <div>
                                            <span className="font-bold text-white text-[11px] block">{edu.degree || "Diplôme / Formation"}</span>
                                            <span className="text-emerald-450 text-[10px]">{edu.school || "Établissement / École"}</span>
                                          </div>
                                          <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-450 font-mono">
                                            {edu.year || "Année"}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Modal Footer actions */}
                            <div className="p-5 border-t border-slate-850 bg-slate-950/40 flex justify-between gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  // Prompt standard copy raw JSON payload
                                  navigator.clipboard.writeText(JSON.stringify(selectedInspectResume, null, 2));
                                  showStatus("Fiche brute copiée dans le presse-papiers avec succès", "success");
                                }}
                                className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-300 font-mono text-[10px] font-bold uppercase rounded-xl border border-slate-800 transition-all cursor-pointer"
                              >
                                📋 Copier JSON Brut
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedInspectResume(null)}
                                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold font-mono text-[10px] uppercase rounded-xl cursor-pointer"
                              >
                                Fermer
                              </button>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            
    </>
  );
};

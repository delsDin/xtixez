import { fetchPortfolioConfig } from '../lib/config-api';
import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { MarkdownDescription } from './MarkdownDescription';
import { motion, AnimatePresence } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { 
  Award, 
  CheckCircle, 
  ExternalLink, 
  Search, 
  Building2, 
  Calendar, 
  Hash, 
  Copy, 
  Check, 
  Filter, 
  Sparkles, 
  Cpu, 
  Layers, 
  Globe,
  Eye,
  X,
  Printer,
  Download,
  FileText
} from 'lucide-react';

interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialId: string;
  category: 'cloud-data' | 'ml-ai' | 'dev';
  skills: string[];
  description: string;
  verifyUrl: string;
  logoColor: string;
  status?: 'published' | 'draft';
  attachmentUrl?: string;
  attachmentType?: 'pdf' | 'image';
}

export const Certifications = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [activeTab, setActiveTab] = useState<'all' | 'cloud-data' | 'ml-ai' | 'dev'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewingCert, setViewingCert] = useState<Certification | null>(null);
  const [viewingDesc, setViewingDesc] = useState<Certification | null>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const { certifications: certsData } = useData();

  const certificationsList = React.useMemo(() => {
    if (certsData && certsData.length > 0) {
      return certsData.filter((c: any) => c.status !== 'draft');
    }
    return [];
  }, [certsData]);

  const handleCopy = (id: string, credId: string) => {
    navigator.clipboard.writeText(credId);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;
    if (printContent) {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>${viewingCert?.title || 'Certificat'} - Dels Dinla</title>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              <style>
                @media print {
                  body { padding: 40px; background: white; color: black; }
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body class="bg-white p-10 flex items-center justify-center min-h-screen">
              <div class="border-8 border-yellow-600 p-8 max-w-4xl w-full bg-white shadow-xl text-center relative font-sans">
                ${printContent}
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(() => window.close(), 500);
                }
              </script>
            </body>
          </html>
        `);
        win.document.close();
      }
    }
  };

  const filteredCertifications = certificationsList.filter(cert => {
    const matchesTab = activeTab === 'all' || cert.category === activeTab;
    const matchesKeyword = cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cert.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cert.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          cert.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesKeyword;
  });

  // Custom signature names based on issuer
  const getSignatureName = (issuer: string) => {
    if (issuer.includes('Google')) return 'Thomas Kurian, CEO Google Cloud';
    if (issuer.includes('AWS')) return 'Matt Garman, CEO Amazon Web Services';
    if (issuer.includes('TensorFlow')) return 'Jeff Dean, Google Senior Fellow';
    if (issuer.includes('Meta')) return 'Mark Zuckerberg, Founder & CEO Meta';
    if (issuer.includes('NVIDIA')) return 'Jensen Huang, Founder & CEO NVIDIA';
    return "Directeur des Certifications Académiques";
  };

  const getSignatureScript = (issuer: string) => {
    if (issuer.includes('Google')) return 'Th. Kurian';
    if (issuer.includes('AWS')) return 'Matt Garman';
    if (issuer.includes('TensorFlow')) return 'J. Dean';
    if (issuer.includes('Meta')) return 'M. Zuckerberg';
    if (issuer.includes('NVIDIA')) return 'Jensen Huang';
    return 'D. Admin';
  };

  return (
    <section id="certifications" className="py-20">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Header Section */}
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest font-extrabold uppercase bg-accent/10 text-accent border border-accent/20 mb-3">
              <Award size={12} className="animate-pulse" />
              Certifications & Diplômes
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              Mes Certifications
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Titres professionnels et accréditations officielles validant mes compétences en Science des Données, Cloud Computing et Développement Full-Stack.
            </p>
          </div>

          {/* Filters & Search Control Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-150/50 dark:border-slate-800/50">
            {/* Nav Tabs */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start">
              {[
                { label: 'Toutes', value: 'all' },
                { label: 'Cloud & Big Data', value: 'cloud-data' },
                { label: 'Intelligence Artificielle', value: 'ml-ai' },
                { label: 'Web & Development', value: 'dev' }
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer select-none ${
                    activeTab === tab.value
                      ? 'bg-accent text-white shadow-md shadow-accent/20'
                      : 'bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une technologie, un titre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-accent text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Certifications Dynamic Display Grid */}
          <AnimatePresence mode="popLayout animate">
            {filteredCertifications.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {filteredCertifications.map((cert) => (
                  <motion.div
                    key={cert.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", damping: 22, stiffness: 150 }}
                    whileHover={{ y: -4 }}
                    className="relative bg-white dark:bg-slate-900 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-md flex flex-col justify-between"
                  >
                    <div>
                      {/* Badge and Issuer Info Area */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {/* Circular Logo placeholder with gradient */}
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cert.logoColor} flex items-center justify-center text-white shadow-md shadow-slate-950/5`}>
                            <Award className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-700 dark:text-white font-sans flex items-center gap-1.5 leading-snug">
                              <Building2 size={13} />
                              {cert.issuer}
                            </h3>
                            <h4 className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Calendar size={11} />
                              {cert.date}
                            </h4>
                          </div>
                        </div>

                        {/* Top-right Status Badge */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold font-mono tracking-wider bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30">
                          <CheckCircle size={9.5} fill="currentColor" className="text-white dark:text-emerald-950/40" />
                          AGRÉÉ
                        </span>
                      </div>

                      {/* Title & Description of Certification */}
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight">
                        {cert.title}
                      </h3>
                      <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-5">
                        {cert.description && cert.description.length > 150 ? (
                          <>
                            <MarkdownDescription 
                              text={cert.description.slice(0, 150)} 
                              className="inline [&>p]:inline [&>p]:mb-0" 
                            />
                            <span>... </span>
                            <button
                              onClick={() => setViewingDesc(cert)}
                              className="inline text-accent hover:text-accent/85 hover:underline font-bold cursor-pointer transition-colors ml-0.5"
                            >
                              lire la suite
                            </button>
                          </>
                        ) : (
                          <MarkdownDescription text={cert.description} />
                        )}
                      </div>

                      {/* Validated Skills section */}
                      <div className="mb-5">
                        <h4 className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <Cpu size={10} />
                          Compétences Certifiées
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {cert.skills.map((skill) => (
                            <span 
                              key={skill}
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer with copy, preview and visit */}
                    <div className="flex items-center justify-between border-t border-slate-150/50 dark:border-slate-800/40 pt-4 mt-2">
                      {/* Copy Credential ID code bar */}
                      <button
                        onClick={() => handleCopy(cert.id, cert.credentialId)}
                        className="inline-flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-slate-500 hover:text-accent dark:text-slate-400 dark:hover:text-accent transition-colors select-none cursor-pointer"
                        title="Copier l'identifiant de la certification"
                      >
                        <Hash size={11} />
                        <span>ID : {cert.credentialId ? (cert.credentialId.length > 10 ? cert.credentialId.slice(0, 10) + '...' : cert.credentialId) : 'N/A'}</span>
                        {copiedId === cert.id ? (
                          <Check size={11} className="text-emerald-500 shrink-0" />
                        ) : (
                          <Copy size={11} className="shrink-0 text-slate-400 group-hover:text-slate-650" />
                        )}
                      </button>

                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* Interactive Certificate Preview trigger button - only if attachment exists */}
                        {cert.attachmentUrl && (
                          <button
                            onClick={() => setViewingCert(cert)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-sans font-extrabold tracking-wider uppercase bg-accent-light/10 hover:bg-accent text-accent hover:text-white border border-accent/25 dark:border-accent/35 transition-all cursor-pointer shadow-sm active:scale-95 select-none"
                          >
                            <Eye size={10} />
                            <span>Afficher</span>
                          </button>
                        )}

                        {/* Verify external source url */}
                        <a
                          href={cert.verifyUrl}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="inline-flex items-center gap-1 text-[10px] font-sans font-extrabold tracking-wider uppercase text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          <span>Vérifier</span>
                          <ExternalLink size={9} />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              /* fallback Empty state on keywords mismatch */
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white/50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl"
              >
                <Award className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Aucune certification trouvée
                </h4>
                <p className="text-xs text-slate-400">
                  Essayez de rechercher un autre mot-clé ou vérifiez la catégorie sélectionnée.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Certificate View Modal Popup Area overlay */}
        <AnimatePresence>
          {viewingCert && (
            <div 
              onClick={() => setViewingCert(null)}
              className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-10 overflow-y-auto bg-slate-950/85 backdrop-blur-md cursor-pointer"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.93, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 30 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
                className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-auto cursor-default"
              >
                {/* Modal Topbar Controls */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-10 select-none">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-accent animate-pulse" />
                    <span className="text-xs font-mono font-black text-slate-200 uppercase tracking-widest">
                      Aperçu du Certificat
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {/* Close action */}
                    <button
                      onClick={() => setViewingCert(null)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                      title="Fermer la fenêtre"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Content body: real document only (PDF or image) */}
                <div className="p-4 sm:p-8 overflow-x-auto bg-slate-950 flex items-center justify-center min-h-[460px] relative">
                  {viewingCert.attachmentUrl ? (
                    <div className="w-full flex justify-center items-center">
                      {viewingCert.attachmentType === 'pdf' ? (
                        <div className="w-full h-[600px] border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-2xl">
                          <embed
                            src={viewingCert.attachmentUrl}
                            type="application/pdf"
                            className="w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="max-w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/60 flex justify-center items-center">
                          <img
                            src={viewingCert.attachmentUrl}
                            alt={viewingCert.title}
                            className="max-h-[600px] object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p className="text-sm font-medium">Aucun document disponible pour cette certification.</p>
                    </div>
                  )}
                </div>

                {/* Modal footer */}
                <div className="px-6 py-4 bg-slate-900/40 border-t border-slate-800 select-none flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[10px] text-slate-500 font-mono text-center sm:text-left">
                    Document officiel de certification — {viewingCert.issuer}
                  </p>
                  <button
                    onClick={() => setViewingCert(null)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-sm active:scale-95 text-center flex items-center justify-center gap-2 select-none"
                  >
                    <X size={14} />
                    <span>Fermer</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Full Description Modal overlay */}
        <AnimatePresence>
          {viewingDesc && (
            <div 
              onClick={() => setViewingDesc(null)}
              className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-10 overflow-y-auto bg-slate-950/85 backdrop-blur-md cursor-pointer"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 cursor-default my-auto"
              >
                {/* Header info */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${viewingDesc.logoColor} flex items-center justify-center text-white shadow-md shrink-0`}>
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-accent uppercase tracking-wider">
                      {viewingDesc.issuer}
                    </h4>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                      {viewingDesc.title}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1.5">
                      <Calendar size={11} /> {viewingDesc.date}
                    </p>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 border-t border-slate-150/50 dark:border-slate-800/40 pt-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Description Complète
                  </h4>
                  <MarkdownDescription text={viewingDesc.description} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium" />

                  {viewingDesc.skills && viewingDesc.skills.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                        Compétences Validées
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {viewingDesc.skills.map((skill) => (
                          <span 
                            key={skill}
                            className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-205 dark:border-slate-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer buttons */}
                <div className="flex flex-wrap items-center gap-3 border-t border-slate-150/50 dark:border-slate-800/40 pt-5 mt-6">
                  {viewingDesc.attachmentUrl && (
                    <button
                      onClick={() => {
                        setViewingCert(viewingDesc);
                        setViewingDesc(null);
                      }}
                      className="px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold text-white bg-accent hover:bg-accent/90 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <Eye size={13} />
                      <span>Afficher le document</span>
                    </button>
                  )}
                  <a
                    href={viewingDesc.verifyUrl}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <span>Vérifier</span>
                    <ExternalLink size={11} />
                  </a>
                  <button
                    onClick={() => setViewingDesc(null)}
                    className="ml-auto px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

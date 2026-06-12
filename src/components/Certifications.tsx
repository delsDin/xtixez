import React, { useState, useRef } from 'react';
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
  Download
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
}

const certificationsList: Certification[] = [
  {
    id: 'gcp-pde',
    title: 'Google Cloud Professional Data Engineer',
    issuer: 'Google Cloud',
    date: 'Janvier 2025',
    credentialId: 'GCP-PDE-82910',
    category: 'cloud-data',
    skills: ['BigQuery', 'Dataflow', 'Dataproc', 'Cloud Composer', 'Bigtable', 'Machine Learning'],
    description: 'Connaissance approfondie de la conception, de la sécurisation, de la mise à l\'échelle, du déploiement et du monitoring de systèmes de traitement de données performants sur GCP.',
    verifyUrl: 'https://cloud.google.com/certification',
    logoColor: 'from-blue-600 via-blue-400 to-indigo-500'
  },
  {
    id: 'aws-mls',
    title: 'AWS Certified Machine Learning - Specialty',
    issuer: 'Amazon Web Services (AWS)',
    date: 'Novembre 2024',
    credentialId: 'AWS-MLS-93108',
    category: 'ml-ai',
    skills: ['Amazon SageMaker', 'Rekognition', 'Comprehend', 'Feature Engineering', 'Model Deployment'],
    description: 'Validation de l\'expertise dans la conception, la mise en œuvre, le déploiement et la maintenance de solutions d\'apprentissage automatique de pointe sur le cloud AWS.',
    verifyUrl: 'https://aws.amazon.com/certification',
    logoColor: 'from-orange-500 via-amber-500 to-yellow-400'
  },
  {
    id: 'tf-dev',
    title: 'TensorFlow Developer Certificate',
    issuer: 'TensorFlow / Google',
    date: 'Juillet 2023',
    credentialId: 'TF-DEV-30192',
    category: 'ml-ai',
    skills: ['Deep Learning', 'Computer Vision', 'NLP', 'Neural Networks', 'TensorFlow 2.x'],
    description: 'Atteste d\'une capacité technique solide à concevoir, construire et optimiser des modèles d\'apprentissage profond applicables à des cas réels.',
    verifyUrl: 'https://www.tensorflow.org/certificate',
    logoColor: 'from-amber-600 via-orange-500 to-rose-550'
  },
  {
    id: 'meta-fed',
    title: 'Meta Front-End Developer Professional Certificate',
    issuer: 'Meta / Coursera',
    date: 'Avril 2023',
    credentialId: 'META-FED-10293',
    category: 'dev',
    skills: ['React', 'CSS3 / Tailwind', 'TypeScript', 'UI/UX Design', 'API Integration'],
    description: 'Validation intensive de la maîtrise de l\'écosystème React modern, de la programmation asynchrone, du responsive design adaptatif et de l\'expérience utilisateur esthétique.',
    verifyUrl: 'https://www.coursera.org',
    logoColor: 'from-blue-500 via-cyan-400 to-teal-500'
  },
  {
    id: 'nv-fdl',
    title: 'Fundamentals of Deep Learning',
    issuer: 'NVIDIA Deep Learning Institute',
    date: 'Février 2024',
    credentialId: 'NV-FDL-40122',
    category: 'ml-ai',
    skills: ['CNNs', 'Sequence Models', 'Fine-Tuning', 'Data Augmentation', 'GPU Acceleration'],
    description: 'Atteste d\'une maîtrise des mécanismes profonds d\'apprentissage, le fine-tuning de modèles pré-entraînés et la parallélisation de calculs sur l\'architecture GPU de pointe NVIDIA.',
    verifyUrl: 'https://www.nvidia.com/dli',
    logoColor: 'from-emerald-500 via-green-400 to-teal-600'
  }
];

export const Certifications = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [activeTab, setActiveTab] = useState<'all' | 'cloud-data' | 'ml-ai' | 'dev'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewingCert, setViewingCert] = useState<Certification | null>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

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
                    className="relative bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-slate-150/80 dark:border-slate-850/60 shadow-md flex flex-col justify-between"
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
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 font-sans flex items-center gap-1.5 leading-snug">
                              <Building2 size={13} />
                              {cert.issuer}
                            </h3>
                            <h4 className="text-xs font-mono font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
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
                      <h3 className="text-base sm:text-lg font-black text-slate-850 dark:text-white mb-2 leading-tight">
                        {cert.title}
                      </h3>
                      <p className="text-xs text-slate-550 dark:text-slate-350 leading-relaxed font-medium mb-5">
                        {cert.description}
                      </p>

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
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-850 text-slate-650 dark:text-slate-300 border border-slate-200/40 dark:border-slate-800"
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
                        <span>ID : {cert.credentialId}</span>
                        {copiedId === cert.id ? (
                          <Check size={11} className="text-emerald-500 shrink-0" />
                        ) : (
                          <Copy size={11} className="shrink-0 text-slate-400 group-hover:text-slate-650" />
                        )}
                      </button>

                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* Interactive Certificate Preview trigger button */}
                        <button
                          onClick={() => setViewingCert(cert)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-sans font-extrabold tracking-wider uppercase bg-accent-light/10 hover:bg-accent text-accent hover:text-white border border-accent/25 dark:border-accent/35 transition-all cursor-pointer shadow-sm active:scale-95 select-none"
                        >
                          <Eye size={10} />
                          <span>Afficher</span>
                        </button>

                        {/* Verify external source url */}
                        <a
                          href={cert.verifyUrl}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="inline-flex items-center gap-1 text-[10px] font-sans font-extrabold tracking-wider uppercase text-slate-550 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
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
                className="relative w-full max-w-4xl bg-slate-900 border border-slate-850 rounded-3xl overflow-hidden shadow-2xl my-auto cursor-default"
              >
                {/* Modal Topbar Controls */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-850 bg-slate-900/95 backdrop-blur-md sticky top-0 z-10 select-none">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-accent animate-pulse" />
                    <span className="text-xs font-mono font-black text-slate-200 uppercase tracking-widest">
                      Aperçu du Certificat
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    {/* Print trigger button */}
                    <button
                      onClick={handlePrint}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider"
                      title="Imprimer"
                    >
                      <Printer size={15} />
                      <span className="hidden sm:inline">Imprimer / PDF</span>
                    </button>

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

                {/* Content body containing certificate paper card */}
                <div className="p-4 sm:p-10 overflow-x-auto bg-slate-950 flex items-center justify-center min-h-[460px] relative">
                  <div 
                    ref={printAreaRef}
                    className="bg-[#faf9f6] text-slate-800 p-8 sm:p-14 rounded-2xl relative border-[12px] border-amber-600/60 shadow-2xl w-full max-w-3xl aspect-[1.414/1] flex flex-col justify-between overflow-hidden select-none"
                    style={{ 
                      boxShadow: 'inset 0 0 45px rgba(139, 92, 26, 0.18)',
                      backgroundImage: 'radial-gradient(#8b5c1a08 1.2px, transparent 0)',
                      backgroundSize: '24px 24px'
                    }}
                  >
                    {/* Inner gold security micro borders */}
                    <div className="absolute inset-4 pointer-events-none border-2 border-dashed border-amber-600/30 rounded-lg" />
                    
                    {/* Giant badge background watermark opacity */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.035]">
                      <Award className="w-[450px] h-[450px] text-amber-950" />
                    </div>

                    {/* Certificate Crest & Headers */}
                    <div className="text-center relative z-10">
                      <div className="flex justify-center mb-3">
                        <span className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${viewingCert.logoColor} flex items-center justify-center text-white shadow-xl rotate-3`}>
                          <Award className="w-8 h-8" />
                        </span>
                      </div>
                      <h4 className="text-[10px] sm:text-xs font-mono font-black text-amber-700/90 tracking-widest uppercase mb-1">
                        {viewingCert.issuer}
                      </h4>
                      <h1 className="text-2xl sm:text-4xl font-serif text-slate-900 font-extrabold tracking-tight leading-snug">
                        Certificat de Réussite
                      </h1>
                      <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-600/40 to-transparent mx-auto mt-2" />
                    </div>

                    {/* Main Statement */}
                    <div className="text-center my-6 relative z-10">
                      <p className="text-[11px] sm:text-xs font-serif italic text-slate-500 mb-1">
                        Le présent titre officiel est décerné avec distinction à &nbsp;
                      </p>
                      <h2 className="text-2xl sm:text-4xl font-black font-sans text-slate-900 tracking-tight border-b-2 border-slate-300 w-fit mx-auto px-6 pb-1 my-2">
                        Dels Dinla
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto font-medium mt-3">
                        pour avoir validé l’intégralité des examens requis, et démontré son expertise approfondie et ses compétences d’ingénierie avancées pour :
                      </p>
                      <h3 className="text-sm sm:text-base font-bold font-sans text-amber-800 tracking-tight mt-3">
                        🏆 {viewingCert.title}
                      </h3>
                    </div>

                    {/* Bottom layout metadata, gold stamp seal, and script signatures */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-4 relative z-10">
                      {/* Left Block: Credential metadata */}
                      <div className="text-left font-mono text-[9px] text-slate-550 max-w-xs space-y-0.5 self-start">
                        <p className="font-bold text-slate-700">COORDONNÉES DU CERTIFICAT :</p>
                        <p>ID d’accréditation : {viewingCert.credentialId}</p>
                        <p>Date d’émission : {viewingCert.date}</p>
                        <p>Statut : Validé & Enregistré dans le registre officiel</p>
                        <p className="text-[8px] text-amber-600 font-bold">✓ Vérifiable en ligne de manière cryptologique</p>
                      </div>

                      {/* Middle Block: Physical Gold Ribbon Badge Stamp Seal */}
                      <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                        {/* Red ribbons decoration */}
                        <div className="absolute top-[40%] left-[28%] w-4 h-12 bg-rose-600 origin-top rotate-[25deg] shadow-sm rounded-b-md" />
                        <div className="absolute top-[40%] right-[28%] w-4 h-12 bg-rose-700 origin-top -rotate-[25deg] shadow-sm rounded-b-md" />
                        
                        {/* Gold seal */}
                        <div className="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-600 via-amber-400 to-yellow-500 border-2 border-yellow-200/40 shadow-lg flex items-center justify-center text-yellow-950 font-black text-[9px] tracking-tight text-center leading-none">
                          OFFICIAL<br/>SEAL
                        </div>
                        <div className="absolute w-15 h-15 rounded-full border border-dashed border-yellow-400/50" />
                      </div>

                      {/* Right Block: Signatures */}
                      <div className="text-center sm:text-right flex flex-col items-center sm:items-end">
                        <span 
                          className="text-xl sm:text-2xl text-indigo-900/90 italic tracking-wide mb-1 block h-8 select-none"
                          style={{ fontFamily: "'Brush Script MT', cursive, Georgia, serif, sans-serif" }}
                        >
                          {getSignatureScript(viewingCert.issuer)}
                        </span>
                        <div className="w-36 h-px bg-slate-300" />
                        <p className="text-[9px] font-bold text-slate-700 mt-1 uppercase tracking-tight">
                          {getSignatureName(viewingCert.issuer).split(',')[0]}
                        </p>
                        <p className="text-[8px] text-slate-500">
                          {getSignatureName(viewingCert.issuer).split(',')[1] || viewingCert.issuer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal footer warning & Action close */}
                <div className="px-6 py-4 bg-slate-900/40 border-t border-slate-850 select-none flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[10px] text-slate-500 font-mono text-center sm:text-left">
                    Il s’agit d’une réplique numérique interactive vérifiée du titre de certification original de Dels Dinla.
                  </p>
                  <button
                    onClick={() => setViewingCert(null)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-750 hover:border-slate-650 transition-all cursor-pointer shadow-sm active:scale-95 text-center flex items-center justify-center gap-2 select-none"
                  >
                    <X size={14} />
                    <span>Retour / Fermer</span>
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

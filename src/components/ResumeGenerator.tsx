import { fetchPortfolioConfig } from '../lib/config-api';
import { supabase } from '../lib/supabase';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, Upload, Printer, Briefcase, GraduationCap, Award, Code, 
  MapPin, Mail, Phone, Globe, Github, Linkedin, Plus, Trash2, 
  Settings, Columns, Type, Palette, Sparkles, RefreshCw, Layers, Copy, Check, Scissors,
  User, Shield
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Structure state types
interface CustomSectionItem {
  id: string;
  title: string;
  subtitle: string;
  period: string;
  description: string[];
}

interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

interface ResumeState {
  fullName: string;
  jobTitle: string;
  avatarUrl: string;
  summary: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  experiences: {
    id: string;
    role: string;
    company: string;
    period: string;
    description: string[];
    technologies: string[];
  }[];
  education: {
    id: string;
    degree: string;
    school: string;
    period: string;
    details: string;
  }[];
  skills: string[];
  certifications: string[];
  languages: {
    name: string;
    level: string;
  }[];
  customSections: CustomSection[];
  paperBg?: 'white' | 'cream' | 'mist' | 'amber' | 'grid' | 'slate';
  pageBreaks?: string[];
  avoidSectionSplits?: boolean;
}

// Initial defaults preloaded from mockData
const initialResumeData: ResumeState = {
  fullName: "Alexandre Dupont",
  jobTitle: "Data Scientist Senior & Développeur Full-Stack",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
  summary: "Data Scientist chevronné et ingénieur Full-Stack robuste. Expert dans l'élaboration de modèles intelligents, l'ingénierie de données complexes et le développement d'interfaces web interactives haut de gamme réactives.",
  email: "alexandre.dupont@dev.fr",
  phone: "+33 6 12 34 56 78",
  location: "Paris, France",
  website: "https://alexdupont.dev",
  github: "https://github.com/alexdupont",
  linkedin: "https://linkedin.com/in/alexdupont",
  experiences: [],
  education: [
    {
      id: "edu_1",
      degree: "Master en Data Science & Big Data",
      school: "Université de Technologie de Paris",
      period: "2016 - 2018",
      details: "Spécialisation en Deep Learning, traitement du langage naturel (NLP) et calcul distribué Spark/Hadoop."
    },
    {
      id: "edu_2",
      degree: "Licence d'Informatique & Systèmes",
      school: "Sorbonne Université",
      period: "2013 - 2016",
      details: "Projets théoriques orientés algorithmique avancée, structures de données et modélisation relationnelle SQL."
    }
  ],
  skills: [],
  certifications: [
    "AWS Certified Solutions Architect – Associate",
    "TensorFlow Developer Certificate (Google)",
    "Scrum Alliance Product Owner (CSPO)"
  ],
  languages: [
    { name: "Français", level: "Natif" },
    { name: "Anglais", level: "Professionnel (C1 - 945 TOEIC)" },
    { name: "Espagnol", level: "Intermédiaire (B2)" }
  ],
  customSections: [
    {
      id: "cust_proj",
      title: "Projets personnels",
      items: [
        {
          id: "cust_item_1",
          title: "Dashboard Analytique E-commerce",
          subtitle: "React, Python, FastAPI, Pandas",
          period: "2024",
          description: [
            "Une plateforme interactive pour visualiser les ventes et prédire les tendances futures grâce au Machine Learning.",
            "Visualisation dynamique haute performance et prévisions à 85% de précision."
          ]
        },
        {
          id: "cust_item_2",
          title: "Classification d'Images Médicales",
          subtitle: "TensorFlow, Python, OpenCV",
          period: "2023",
          description: [
            "Modèle de Deep Learning (CNN) pour la détection précoce d'anomalies sur des radiographies.",
            "Précision finale de 92% validée sur un dataset clinique de 10 000 clichés."
          ]
        }
      ]
    },
    {
      id: "cust_vol",
      title: "Bénévolat",
      items: [
        {
          id: "cust_item_3",
          title: "Mentor en programmation web",
          subtitle: "Association TechPourTous",
          period: "2022 - Présent",
          description: [
            "Accompagnement d'étudiants issus de milieux prioritaires dans leur insertion professionnelle (Web & Data).",
            "Soutien hebdomadaire, correction de projets et préparation d'exercices d'entretien technique."
          ]
        }
      ]
    }
  ],
  paperBg: 'white',
  pageBreaks: [],
  avoidSectionSplits: true
};

export const ResumeGenerator: React.FC = () => {
  const { darkMode } = useTheme();
  
  // Custom states initialized from localStorage with initialResumeData fallback
  const [data, setData] = useState<ResumeState>(() => {
    try {
      const saved = localStorage.getItem('resume_generator_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && 'fullName' in parsed) {
          if (!parsed.customSections) {
            parsed.customSections = [];
          }
          if (!parsed.paperBg) {
            parsed.paperBg = 'white';
          }
          if (!parsed.pageBreaks) {
            parsed.pageBreaks = [];
          }
          if (parsed.avoidSectionSplits === undefined) {
            parsed.avoidSectionSplits = true;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to retrieve autosaved resume data from localStorage:", e);
    }
    return initialResumeData;
  });

  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');

  const [template, setTemplate] = useState<'split' | 'modern' | 'executive' | 'bento'>(() => {
    try {
      const saved = localStorage.getItem('resume_generator_template');
      if (saved && ['split', 'modern', 'executive', 'bento'].includes(saved)) {
        return saved as 'split' | 'modern' | 'executive' | 'bento';
      }
    } catch {}
    return 'split';
  });

  const [fontFamily, setFontFamily] = useState<'sans' | 'mono' | 'serif' | 'display'>(() => {
    try {
      const saved = localStorage.getItem('resume_generator_font_family');
      if (saved && ['sans', 'mono', 'serif', 'display'].includes(saved)) {
        return saved as 'sans' | 'mono' | 'serif' | 'display';
      }
    } catch {}
    return 'sans';
  });

  const [colorTheme, setColorTheme] = useState<'midnight' | 'emerald' | 'royal' | 'berry'>(() => {
    try {
      const saved = localStorage.getItem('resume_generator_color_theme');
      if (saved && ['midnight', 'emerald', 'royal', 'berry'].includes(saved)) {
        return saved as 'midnight' | 'emerald' | 'royal' | 'berry';
      }
    } catch {}
    return 'midnight';
  });
  
  // Autosave status state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');

  const [cvId] = useState<string>(() => {
    try {
      let id = localStorage.getItem('resume_generator_cv_id');
      if (!id) {
        id = 'cv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
        localStorage.setItem('resume_generator_cv_id', id);
      }
      return id;
    } catch {
      return 'cv_fallback_' + Date.now();
    }
  });

  const syncCVToServer = async () => {
    try {
      await supabase.from('generated_resumes').upsert({
          id: cvId,
          full_name: data.fullName || "Sans nom",
          job_title: data.jobTitle || "",
          company_name: "", // or whatever is appropriate
          job_description: "", // or whatever is appropriate
          generated_content: {
            email: data.email || "",
            phone: data.phone || "",
            location: data.location || "",
            github: data.github || "",
            linkedin: data.linkedin || "",
            website: data.website || "",
            summary: data.summary || "",
            template,
            fontFamily,
            colorTheme,
            paperBg: data.paperBg || 'white',
            skillsCount: (data.skills || []).length,
            experienceCount: (data.experiences || []).length,
            educationCount: (data.education || []).length,
            certificationCount: (data.certifications || []).length
          }
      });
    } catch (e) {
      console.warn("Failed to sync CV compilation with server:", e);
    }
  };

  // Autosave debounced effect
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('resume_generator_data', JSON.stringify(data));
        localStorage.setItem('resume_generator_template', template);
        localStorage.setItem('resume_generator_font_family', fontFamily);
        localStorage.setItem('resume_generator_color_theme', colorTheme);
        setSaveStatus('saved');
        syncCVToServer();
      } catch (err) {
        console.error("Failed to autosave to localStorage:", err);
        setSaveStatus('idle');
      }
    }, 1000); // Debounce to allow smooth, non-blocking typing
    return () => clearTimeout(timer);
  }, [data, template, fontFamily, colorTheme]);
  
  // Loading & Alert feedback states
  const [copiedLink, setCopiedLink] = useState(false);
  const [notification, setNotification] = useState<{ id: string; msg: string; type: 'success' | 'info' | 'warn' } | null>(null);

  // Quick form sub-item edits
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');

  const [serverDefaultCV, setServerDefaultCV] = useState<any>(null);

  useEffect(() => {
    const fetchDefaultCV = async () => {
      try {
        const config = await fetchPortfolioConfig();
        if (config && config.defaultResume) {
            setServerDefaultCV(config.defaultResume);
            const saved = localStorage.getItem('resume_generator_data');
            if (!saved) {
              const cv = config.defaultResume;
              setData(prev => ({
                ...prev,
                fullName: cv.fullName || prev.fullName,
                jobTitle: cv.jobTitle || prev.jobTitle,
                summary: cv.summary || prev.summary,
                email: cv.email || prev.email,
                phone: cv.phone || prev.phone,
                location: cv.location || prev.location,
                github: cv.github || prev.github,
                linkedin: cv.linkedin || prev.linkedin,
                website: cv.website || prev.website,
                paperBg: cv.paperBg || prev.paperBg
              }));
              if (cv.template) setTemplate(cv.template);
              if (cv.fontFamily) setFontFamily(cv.fontFamily);
              if (cv.colorTheme) setColorTheme(cv.colorTheme);
            }
          }
      } catch (err) {
        console.error("Failed to load CV configuration from server:", err);
      }
    };
    fetchDefaultCV();
  }, []);
  
  const showNotification = (msg: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setNotification({ id: Date.now().toString(), msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Helper selectors for layout styles
  const getFontClass = () => {
    switch (fontFamily) {
      case 'mono': return 'font-mono';
      case 'serif': return 'font-serif';
      case 'display': return 'font-sans tracking-tight';
      default: return 'font-sans';
    }
  };

  const getPaperBgClassesAndStyle = () => {
    const bgType = data.paperBg || 'white';
    switch (bgType) {
      case 'cream':
        return {
          bgClass: 'paper-bg-cream bg-[#FCFAF2] text-slate-800 border-amber-950/10 shadow-lg',
          bgStyle: {}
        };
      case 'mist':
        return {
          bgClass: 'paper-bg-mist bg-[#F3F6F9] text-slate-800 border-blue-950/10 shadow-lg',
          bgStyle: {}
        };
      case 'amber':
        return {
          bgClass: 'paper-bg-amber bg-[#FAF5EB] text-[#1C1C1A] border-amber-950/15 shadow-lg',
          bgStyle: {}
        };
      case 'grid':
        return {
          bgClass: 'paper-bg-grid bg-white text-slate-800 border-slate-200 shadow-lg',
          bgStyle: {
            backgroundImage: 'radial-gradient(#cbd1da 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }
        };
      case 'slate':
        return {
          bgClass: 'paper-bg-slate bg-[#0F172A] text-slate-100 border-slate-800 shadow-xl dark:border-slate-800',
          bgStyle: {}
        };
      case 'white':
      default:
        return {
          bgClass: 'paper-bg-white bg-white text-slate-800 border-slate-200 shadow-lg',
          bgStyle: {}
        };
    }
  };

  const renderPageBreak = (id: string) => {
    if (!(data.pageBreaks || []).includes(id)) return null;
    return (
      <div key={`break-visual-${id}`} className="page-break w-full py-4 my-2 flex items-center justify-center relative select-none">
        <div className="absolute inset-x-0 border-t border-dashed border-rose-400 dark:border-rose-900/50 pointer-events-none no-print" />
        <span className="relative z-10 px-3 py-1 bg-rose-50 dark:bg-slate-900 border border-rose-200 dark:border-rose-950 rounded-full font-mono text-[8.5px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest flex items-center gap-1.5 no-print">
          ✂️ Saut de page A4 (Nouvelle page après impression)
        </span>
      </div>
    );
  };

  const colorsMap = {
    midnight: {
      primary: 'bg-slate-900 border-slate-900 text-white',
      accentText: 'text-blue-500 dark:text-blue-400',
      accentBg: 'bg-blue-500/10 dark:bg-blue-500/15 text-blue-500 border-blue-500/20',
      borderLine: 'border-slate-200 dark:border-slate-800',
      leftSidebarBg: 'bg-slate-50 dark:bg-slate-905',
      primaryBtn: 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white'
    },
    emerald: {
      primary: 'bg-emerald-950 border-emerald-950 text-white',
      accentText: 'text-emerald-500 dark:text-emerald-400',
      accentBg: 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
      borderLine: 'border-emerald-100 dark:border-emerald-900/40',
      leftSidebarBg: 'bg-emerald-50/40 dark:bg-emerald-950/10',
      primaryBtn: 'bg-emerald-900 hover:bg-emerald-850 text-white'
    },
    royal: {
      primary: 'bg-zinc-900 border-zinc-900 text-white',
      accentText: 'text-amber-500 dark:text-amber-400',
      accentBg: 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-500 border-amber-500/20',
      borderLine: 'border-zinc-200 dark:border-zinc-800',
      leftSidebarBg: 'bg-zinc-50 dark:bg-zinc-905',
      primaryBtn: 'bg-zinc-900 hover:bg-zinc-800 text-white'
    },
    berry: {
      primary: 'bg-purple-950 border-purple-950 text-white',
      accentText: 'text-pink-500 dark:text-pink-400',
      accentBg: 'bg-pink-500/10 dark:bg-pink-500/15 text-pink-500 border-pink-500/20',
      borderLine: 'border-purple-100 dark:border-purple-900/30',
      leftSidebarBg: 'bg-purple-50/30 dark:bg-purple-955/10',
      primaryBtn: 'bg-purple-900 hover:bg-purple-850 text-white'
    }
  };

  const activeColors = colorsMap[colorTheme] || colorsMap.midnight;

  // Handler functions for dynamic experience elements
  const handleExperienceChange = (id: string, field: string, val: any) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => {
        if (exp.id === id) {
          return { ...exp, [field]: val };
        }
        return exp;
      })
    }));
  };

  const handleAddExperience = () => {
    const freshId = `exp_${Date.now()}`;
    setData(prev => ({
      ...prev,
      experiences: [
        {
          id: freshId,
          role: "Nouvel Emploi",
          company: "Nom de l'Entreprise",
          period: "2025 - Présent",
          description: [
            "Ajoutez un fait d'arme ou un accomplissement clé.",
            "Utilisez des chiffres précis pour marquer l'impact (+20% performances)."
          ],
          technologies: ["React", "TypeScript"]
        },
        ...prev.experiences
      ]
    }));
    showNotification("Poste d'expérience professionnelle ajouté !", "success");
  };

  const handleDeleteExperience = (id: string) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id)
    }));
    showNotification("Expérience supprimée.", "info");
  };

  const handleAchievementChange = (expId: string, achIdx: number, val: string) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => {
        if (exp.id === expId) {
          const freshDesc = [...exp.description];
          freshDesc[achIdx] = val;
          return { ...exp, description: freshDesc };
        }
        return exp;
      })
    }));
  };

  const handleAddAchievement = (expId: string) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => {
        if (exp.id === expId) {
          return { ...exp, description: [...exp.description, "Nouvelle réalisation clé..."] };
        }
        return exp;
      })
    }));
  };

  const handleDeleteAchievement = (expId: string, achIdx: number) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => {
        if (exp.id === expId) {
          return { ...exp, description: exp.description.filter((_, idx) => idx !== achIdx) };
        }
        return exp;
      })
    }));
  };

  // Education changes
  const handleEducationChange = (id: string, field: string, val: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(edu => (edu.id === id ? { ...edu, [field]: val } : edu))
    }));
  };

  const handleAddEducation = () => {
    const freshId = `edu_${Date.now()}`;
    setData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { id: freshId, degree: "Diplôme / Certificat obtenu", school: "Université / École", period: "2024", details: "Précisions ou de projet d'études..." }
      ]
    }));
    showNotification("Formation académique ajoutée !", "success");
  };

  const handleDeleteEducation = (id: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
    showNotification("Formation supprimée.", "info");
  };

  // Skill management
  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSkill.trim()) return;
    if (data.skills.includes(newSkill.trim())) {
      showNotification("Compétence déjà enregistrée !", "warn");
      return;
    }
    setData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()]
    }));
    setNewSkill('');
    showNotification("Compétence ajoutée !", "success");
  };

  const handleRemoveSkill = (skill: string) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  // Certifications management
  const handleAddCert = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCert.trim()) return;
    setData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCert.trim()]
    }));
    setNewCert('');
    showNotification("Certification enregistrée !", "success");
  };

  const handleRemoveCert = (cert: string) => {
    setData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert)
    }));
  };

  // Custom Sections Management Handlers
  const handleAddSection = () => {
    const id = `cust_sec_${Date.now()}`;
    setData(prev => ({
      ...prev,
      customSections: [
        ...(prev.customSections || []),
        {
          id,
          title: "Nouvelle Section Personnalisée",
          items: []
        }
      ]
    }));
    showNotification("Section personnalisée ajoutée !", "success");
  };

  const handleDeleteSection = (sectionId: string) => {
    setData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).filter(sec => sec.id !== sectionId)
    }));
    showNotification("Section retirée définitivement.", "info");
  };

  const handleSectionTitleChange = (sectionId: string, newTitle: string) => {
    setData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(sec => 
        sec.id === sectionId ? { ...sec, title: newTitle } : sec
      )
    }));
  };

  const handleAddSectionItem = (sectionId: string) => {
    const itemId = `cust_item_${Date.now()}`;
    setData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(sec => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            items: [
              ...sec.items,
              {
                id: itemId,
                title: "Nouveau projet / Activité",
                subtitle: "Rôle, technologies ou organisation",
                period: "2025 - Présent",
                description: ["Élément important ou accomplissement marquant."]
              }
            ]
          };
        }
        return sec;
      })
    }));
    showNotification("Élément ajouté à la section !", "success");
  };

  const handleDeleteSectionItem = (sectionId: string, itemId: string) => {
    setData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(sec => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            items: sec.items.filter(item => item.id !== itemId)
          };
        }
        return sec;
      })
    }));
    showNotification("Élément supprimé.", "info");
  };

  const handleSectionItemChange = (sectionId: string, itemId: string, field: string, val: any) => {
    setData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(sec => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            items: sec.items.map(item => 
              item.id === itemId ? { ...item, [field]: val } : item
            )
          };
        }
        return sec;
      })
    }));
  };

  const handleCustomItemBulletChange = (sectionId: string, itemId: string, bulletIdx: number, val: string) => {
    setData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(sec => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            items: sec.items.map(item => {
              if (item.id === itemId) {
                const freshBullets = [...item.description];
                freshBullets[bulletIdx] = val;
                return { ...item, description: freshBullets };
              }
              return item;
            })
          };
        }
        return sec;
      })
    }));
  };

  const handleAddCustomItemBullet = (sectionId: string, itemId: string) => {
    setData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(sec => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            items: sec.items.map(item => {
              if (item.id === itemId) {
                return { ...item, description: [...item.description, "Nouvelle précision clé..."] };
              }
              return item;
            })
          };
        }
        return sec;
      })
    }));
  };

  const handleDeleteCustomItemBullet = (sectionId: string, itemId: string, bulletIdx: number) => {
    setData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(sec => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            items: sec.items.map(item => {
              if (item.id === itemId) {
                return { ...item, description: item.description.filter((_, idx) => idx !== bulletIdx) };
              }
              return item;
            })
          };
        }
        return sec;
      })
    }));
  };

  // Printing engine trigger
  const handlePrint = () => {
    // We can inject clean print directive CSS rules directly and call window.print
    const styleElement = document.createElement('style');
    styleElement.id = 'print-style';
    styleElement.innerHTML = `
      @media print {
        header, footer, nav, aside, button, .no-print, input, textarea, select {
          display: none !important;
        }
        body, html {
          background-color: white !important;
          color: black !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .printable-cv-stage {
          display: block !important;
          position: absolute;
          left: 0;
          top: 0;
          width: 100% !important;
          max-width: 100% !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .page-break {
          page-break-before: always !important;
          break-before: page !important;
          display: block !important;
          height: 0 !important;
          min-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
        }
        /* Page breaking layout helper: convert grid/columns to flat block flow to preserve page-break rendering */
        .printable-cv-stage .grid,
        .printable-cv-stage [class*="grid-cols-"] {
          display: block !important;
        }
        .printable-cv-stage .md\\:col-span-4,
        .printable-cv-stage .md\\:col-span-8,
        .printable-cv-stage .md\\:col-span-12,
        .printable-cv-stage .col-span-2,
        .printable-cv-stage .col-span-1 {
          width: 100% !important;
          max-width: 100% !important;
          border-right: none !important;
          border-left: none !important;
          padding-right: 0 !important;
          padding-left: 0 !important;
          margin-bottom: 2rem !important;
        }
        /* Group sections so individual cards never split midpoint */
        .break-inside-avoid {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      }
    `;
    document.head.appendChild(styleElement);
    window.print();
    setTimeout(() => {
      const el = document.getElementById('print-style');
      if (el) el.remove();
    }, 1000);
  };

  // Backup state exporters
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `CV_${data.fullName.replace(/\s+/g, '_')}.json`);
    dlAnchorElem.click();
    showNotification("Sauvegarde JSON exportée avec succès !", "success");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.fullName && parsed.experiences) {
            if (!parsed.customSections) {
              parsed.customSections = [];
            }
            if (!parsed.paperBg) {
              parsed.paperBg = 'white';
            }
            if (!parsed.pageBreaks) {
              parsed.pageBreaks = [];
            }
            if (parsed.avoidSectionSplits === undefined) {
              parsed.avoidSectionSplits = true;
            }
            setData(parsed);
            showNotification("Configuration CV importée avec succès !", "success");
          } else {
            showNotification("Format non supporté: champs requis manquants.", "warn");
          }
        } catch (err) {
          showNotification("Impossible de décoder ce fichier JSON.", "warn");
        }
      };
    }
  };

  return (
    <section id="cv-generator-section" className="py-20 relative overflow-hidden bg-transparent">
      {/* Background ambient mesh */}
      <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-950/20 pointer-events-none -z-10" />

      {/* Floating alert notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-20 right-6 z-50 p-4 rounded-xl border shadow-lg font-mono text-xs flex items-center gap-3 ${
              notification.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                : notification.type === 'warn'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-500'
            }`}
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>{notification.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        
        {/* Module Header Title block */}
        <div className="mb-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-205 dark:border-slate-805/40 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 mb-2 px-2.5 py-1 rounded bg-accent/5 text-accent text-[10px] font-bold uppercase tracking-wider border border-accent/15 font-mono">
              <Palette size={10} className="shrink-0" />
              <span>Studio Créatif</span>
            </div>
            <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <User size={22} className="text-accent shrink-0" />
              <span>Générateur de CV Interactif</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Modelez, personnalisez et prévisualisez instantanément votre profil professionnel sous de multiples templates. Sauvegardez vos réglages ou imprimez en haute fidélité PDF d'une seule commande.
            </p>
          </div>

          {/* Quick Action buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2.5">
            {/* Autosave Badge Indicator */}
            <div 
              className={`px-3 py-2 flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase rounded-xl border transition-all duration-300 ${
                saveStatus === 'saving'
                  ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30 text-amber-500 animate-pulse'
                  : saveStatus === 'saved'
                    ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
              title="Vos modifications sont automatiquement sauvegardées en temps réel dans votre stockage local."
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                saveStatus === 'saving'
                  ? 'bg-amber-400'
                  : saveStatus === 'saved'
                    ? 'bg-emerald-500'
                    : 'bg-slate-400'
              }`} />
              <span>
                {saveStatus === 'saving' ? "Enregistrement..." : "Sauvegardé Localement"}
              </span>
            </div>

            <button
              onClick={handlePrint}
              className="px-4.5 py-2.5 bg-accent text-[11px] hover:bg-opacity-90 font-extrabold text-white font-mono uppercase rounded-xl shadow-lg hover:shadow-accent/20 cursor-pointer flex items-center gap-2 transition-all hover:scale-[1.02]"
              title="Lancer l'impression PDF"
            >
              <Printer size={13} />
              Imprimer / PDF
            </button>

            <button
              onClick={handleExportJSON}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 font-mono text-[11px] font-black uppercase rounded-xl border border-slate-200 dark:border-slate-805 flex items-center gap-1.5 cursor-pointer"
              title="Exporter les modifications au format local JSON"
            >
              <Download size={12} />
              Sauvegarder JSON
            </button>

            <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 font-mono text-[11px] font-black uppercase rounded-xl border border-slate-200 dark:border-slate-805 flex items-center gap-1.5 cursor-pointer">
              <Upload size={12} />
              Importer JSON
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportJSON} 
                className="hidden" 
              />
            </label>

            <button
              onClick={() => {
                if (serverDefaultCV) {
                  const cv = serverDefaultCV;
                  setData({
                    ...initialResumeData,
                    fullName: cv.fullName || initialResumeData.fullName,
                    jobTitle: cv.jobTitle || initialResumeData.jobTitle,
                    summary: cv.summary || initialResumeData.summary,
                    email: cv.email || initialResumeData.email,
                    phone: cv.phone || initialResumeData.phone,
                    location: cv.location || initialResumeData.location,
                    github: cv.github || initialResumeData.github,
                    linkedin: cv.linkedin || initialResumeData.linkedin,
                    website: cv.website || initialResumeData.website,
                    paperBg: cv.paperBg || initialResumeData.paperBg
                  });
                  if (cv.template) setTemplate(cv.template);
                  if (cv.fontFamily) setFontFamily(cv.fontFamily);
                  if (cv.colorTheme) setColorTheme(cv.colorTheme);
                  showNotification("Champs réinitialisés à la configuration par défaut de l'administrateur !", "info");
                } else {
                  setData(initialResumeData);
                  showNotification("Champs réinitialisés aux données d'origine !", "info");
                }
              }}
              className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition-colors"
              title="Restaurer par défaut"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Master Workspace Split: Editor Form vs Live Frame Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* EDITOR FORM SHEET: LEFT (5 cols) */}
          <div className="lg:col-span-5 flex flex-col bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            
            {/* Form category tabs switcher */}
            <div className="flex border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/20 p-2">
              <button
                onClick={() => setActiveTab('content')}
                className={`flex-1 py-3 text-center rounded-xl font-mono text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'content'
                    ? 'bg-white dark:bg-slate-900 text-accent border border-slate-200/60 dark:border-slate-800 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Settings size={13} />
                1. Contenu textuel
              </button>
              <button
                onClick={() => setActiveTab('design')}
                className={`flex-1 py-3 text-center rounded-xl font-mono text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'design'
                    ? 'bg-white dark:bg-slate-900 text-accent border border-slate-200/60 dark:border-slate-800 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Layers size={13} />
                2. Design & Style
              </button>
            </div>

            {/* TAB CONTAINER CONTENT WORKSPACE */}
            <div className="p-6 overflow-y-auto max-h-[720px] custom-scrollbar space-y-6">
              {activeTab === 'content' && (
                <div className="space-y-6">
                  {/* Bio Identité Section */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5">&#128100; Identité Professionnelle</h3>
                    
                    {/* Photo de profil uploader / url edit */}
                    <div className="space-y-2.5 bg-slate-50/50 dark:bg-slate-950/25 p-3 rounded-xl border border-slate-200/40 dark:border-slate-850/40">
                      <label className="text-[9px] font-black uppercase text-slate-400 font-mono tracking-wider flex items-center gap-1.5">📷 Photo de profil</label>
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200/80 dark:border-slate-800 shrink-0 bg-slate-100 dark:bg-slate-900 flex items-center justify-center shadow-inner">
                          {data.avatarUrl ? (
                            <img src={data.avatarUrl} alt="Aperçu" className="w-full h-full object-cover" onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop";
                            }} />
                          ) : (
                            <span className="text-[8px] text-slate-400">Aucun</span>
                          )}
                        </div>

                        <div className="flex-grow w-full space-y-2">
                          <div className="block">
                            <label className="flex items-center justify-center gap-1.5 cursor-pointer py-1.5 px-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-[10px] font-bold text-slate-700 dark:text-slate-305 rounded-lg transition-all shadow-sm">
                              <Upload size={11} className="text-accent" />
                              <span>Téléverser un fichier photo</span>
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
                                        setData(prev => ({ ...prev, avatarUrl: reader.result as string }));
                                        showNotification("Photo de profil mise à jour !", "success");
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
                              value={data.avatarUrl || ""}
                              placeholder="Ou entrez l'URL directe d'une image..."
                              onChange={(e) => setData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                              className="w-full text-[10px] p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:border-accent outline-none font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase font-mono">Nom Complet</label>
                        <input
                          type="text"
                          value={data.fullName}
                          onChange={(e) => setData(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-800 dark:text-slate-100 focus:border-accent font-sans outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase font-mono">Prénom / Intitule de Poste</label>
                        <input
                          type="text"
                          value={data.jobTitle}
                          onChange={(e) => setData(prev => ({ ...prev, jobTitle: e.target.value }))}
                          className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-800 dark:text-slate-100 focus:border-accent font-sans outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-450 uppercase font-mono">Bio / Résumé Professionnel</label>
                      <textarea
                        rows={3}
                        value={data.summary}
                        onChange={(e) => setData(prev => ({ ...prev, summary: e.target.value }))}
                        className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-800 dark:text-slate-200 focus:border-accent font-sans resize-y outline-none leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase font-mono">Courriel (Email)</label>
                        <input
                          type="email"
                          value={data.email}
                          onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-800 dark:text-slate-100 focus:border-accent font-mono outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase font-mono">Téléphone</label>
                        <input
                          type="text"
                          value={data.phone}
                          onChange={(e) => setData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-800 dark:text-slate-100 focus:border-accent font-mono outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase font-mono">Localisation / Ville</label>
                        <input
                          type="text"
                          value={data.location}
                          onChange={(e) => setData(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-800 dark:text-slate-100 focus:border-accent font-sans outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase font-mono">Profil LinkedIn</label>
                        <input
                          type="text"
                          value={data.linkedin}
                          onChange={(e) => setData(prev => ({ ...prev, linkedin: e.target.value }))}
                          className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-800 dark:text-slate-100 focus:border-accent font-mono outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase font-mono">Profil GitHub</label>
                        <input
                          type="text"
                          value={data.github || ""}
                          placeholder="https://github.com/votre-compte"
                          onChange={(e) => setData(prev => ({ ...prev, github: e.target.value }))}
                          className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-800 dark:text-slate-100 focus:border-accent font-mono outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase font-mono">Site Web / Portfolio</label>
                        <input
                          type="text"
                          value={data.website || ""}
                          placeholder="https://votre-portfolio.com"
                          onChange={(e) => setData(prev => ({ ...prev, website: e.target.value }))}
                          className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-800 dark:text-slate-100 focus:border-accent font-mono outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1.5 pb-1">
                      <input
                        type="checkbox"
                        id="showWebsiteToggle"
                        checked={data.showWebsite !== false}
                        onChange={(e) => setData(prev => ({ ...prev, showWebsite: e.target.checked }))}
                        className="w-4 h-4 text-accent border-slate-300 rounded focus:ring-accent accent-accent cursor-pointer"
                      />
                      <label htmlFor="showWebsiteToggle" className="text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                        Afficher le site web / portfolio sur le CV physique
                      </label>
                    </div>
                  </div>

                  {/* Experiences Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      <h3 className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
                        <Briefcase size={12} className="text-accent" />
                        &#128188; Expériences Professionnelles
                      </h3>
                      <button
                        onClick={handleAddExperience}
                        className="px-2 py-1 text-[8px] font-bold uppercase tracking-wider font-mono bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded text-accent flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={10} /> Ajouter
                      </button>
                    </div>

                    <div className="space-y-5">
                      {data.experiences.map((exp) => (
                        <div key={exp.id} className="p-3.5 bg-slate-50 dark:bg-slate-955 rounded-xl border border-slate-150 dark:border-slate-850/80 space-y-3 relative group/card">
                          
                          <button
                            onClick={() => handleDeleteExperience(exp.id)}
                            className="absolute top-2.5 right-2.5 p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/15 hover:border-rose-500/30 rounded-lg cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                            title="Supprimer ce poste"
                          >
                            <Trash2 size={11} />
                          </button>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="space-y-0.5">
                              <label className="text-[8px] font-bold text-slate-400 uppercase font-mono">Poste / Rôle</label>
                              <input
                                type="text"
                                value={exp.role}
                                onChange={(e) => handleExperienceChange(exp.id, 'role', e.target.value)}
                                className="w-full text-[11px] p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded font-bold text-slate-800 dark:text-white outline-none"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-[8px] font-bold text-slate-400 uppercase font-mono">Entreprise</label>
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                                className="w-full text-[11px] p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded font-bold text-slate-850 dark:text-white outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="space-y-0.5">
                              <label className="text-[8px] font-bold text-slate-400 uppercase font-mono">Période d'activité</label>
                              <input
                                type="text"
                                value={exp.period}
                                onChange={(e) => handleExperienceChange(exp.id, 'period', e.target.value)}
                                className="w-full text-[11px] p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded font-mono text-slate-600 dark:text-slate-300 outline-none"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-[8px] font-bold text-slate-400 uppercase font-mono">Technologies (par virgule)</label>
                              <input
                                type="text"
                                value={exp.technologies.join(', ')}
                                onChange={(e) => handleExperienceChange(exp.id, 'technologies', e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean))}
                                className="w-full text-[11px] p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded font-mono text-emerald-500 outline-none"
                              />
                            </div>
                          </div>

                          {/* Achievements lists */}
                          <div className="space-y-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                            <div className="flex items-center justify-between">
                              <span className="text-[8.5px] font-black uppercase text-slate-400 font-mono">Réalisations / Missions :</span>
                              <button
                                onClick={() => handleAddAchievement(exp.id)}
                                className="px-1.5 py-0.5 text-[8px] font-bold bg-slate-200 hover:bg-slate-350 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 cursor-pointer flex items-center gap-0.5"
                              >
                                <Plus size={9} /> Ligne
                              </button>
                            </div>
                            <div className="space-y-2">
                              {exp.description.map((descLine, achIdx) => (
                                <div key={achIdx} className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    value={descLine}
                                    onChange={(e) => handleAchievementChange(exp.id, achIdx, e.target.value)}
                                    className="flex-1 text-[11px] p-1.5 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded text-slate-600 dark:text-slate-300 outline-none leading-relaxed"
                                  />
                                  <button
                                    onClick={() => handleDeleteAchievement(exp.id, achIdx)}
                                    className="p-1.5 hover:bg-rose-500/10 text-rose-500 rounded hover:scale-105 cursor-pointer"
                                    title="Supprimer cette ligne"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education Form Subunit */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      <h3 className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
                        <GraduationCap size={13} className="text-accent" />
                        &#127891; Formations & Études
                      </h3>
                      <button
                        onClick={handleAddEducation}
                        className="px-2 py-1 text-[8px] font-bold uppercase tracking-wider font-mono bg-accent/15 hover:bg-accent/20 rounded border border-accent/20 text-accent flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={10} /> École
                      </button>
                    </div>

                    <div className="space-y-4">
                      {data.education.map((edu) => (
                        <div key={edu.id} className="p-3 bg-slate-50 dark:bg-slate-955 rounded-xl border border-slate-150 dark:border-slate-850/80 space-y-2.5 relative">
                          <button
                            onClick={() => handleDeleteEducation(edu.id)}
                            className="absolute top-2.5 right-2.5 p-1 text-rose-400 hover:text-rose-600 rounded cursor-pointer"
                            title="Supprimer cette ligne"
                          >
                            <Trash2 size={11} />
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                              <label className="text-[8px] font-bold text-slate-400 uppercase font-mono">Diplôme / Titre</label>
                              <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                                className="w-full text-[11px] p-1.5 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded text-slate-800 dark:text-white outline-none"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-[8px] font-bold text-slate-400 uppercase font-mono">École / Établissement</label>
                              <input
                                type="text"
                                value={edu.school}
                                onChange={(e) => handleEducationChange(edu.id, 'school', e.target.value)}
                                className="w-full text-[11px] p-1.5 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded text-slate-800 dark:text-white outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                              <label className="text-[8px] font-bold text-slate-400 uppercase font-mono">Période</label>
                              <input
                                type="text"
                                value={edu.period}
                                onChange={(e) => handleEducationChange(edu.id, 'period', e.target.value)}
                                className="w-full text-[11px] p-1.5 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded text-slate-600 outline-none"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-[8px] font-bold text-slate-400 uppercase font-mono">Précisions (matières clés)</label>
                              <input
                                type="text"
                                value={edu.details}
                                onChange={(e) => handleEducationChange(edu.id, 'details', e.target.value)}
                                className="w-full text-[11px] p-1.5 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded text-slate-500 outline-none font-sans"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills tags list */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-1">
                      <Code size={12} className="text-accent" />
                      &#128187; Compétences Techniques (Tags)
                    </h3>
                    
                    <form onSubmit={handleAddSkill} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ex: PyTorch, Docker, NextJS..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="flex-1 text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-800 dark:text-slate-100 outline-none focus:border-accent"
                      />
                      <button
                        type="submit"
                        className="px-3.5 bg-slate-900 border border-slate-800 dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-800 text-white font-mono text-[10px] font-bold uppercase rounded-lg cursor-pointer"
                      >
                        Ajouter
                      </button>
                    </form>

                    <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto p-1 border border-slate-100 dark:border-slate-900 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                      {data.skills.map((s) => (
                        <span 
                          key={s} 
                          className="px-2 py-1 text-[9px] font-mono font-bold bg-white dark:bg-slate-900 shadow-sm border border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-1.5 group"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(s)}
                            className="text-slate-400 group-hover:text-rose-500 text-[11px] cursor-pointer"
                            title="Enlever"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certifications and languages */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    
                    {/* Certifications column block */}
                    <div className="space-y-3">
                      <h4 className="text-[9.5px] font-black uppercase text-slate-400 font-mono tracking-wider flex items-center gap-1">
                        <Award size={12} className="text-amber-500" /> Certificats Accrédités
                      </h4>
                      <form onSubmit={handleAddCert} className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Reconnaissance..."
                          value={newCert}
                          onChange={(e) => setNewCert(e.target.value)}
                          className="flex-1 text-[10.5px] p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg outline-none text-slate-800 dark:text-white"
                        />
                        <button type="submit" className="px-2 bg-slate-900 dark:bg-slate-800 text-[9px] font-bold uppercase text-white rounded-lg cursor-pointer">
                          +
                        </button>
                      </form>

                      <div className="space-y-1 max-h-[120px] overflow-y-auto">
                        {data.certifications.map((c) => (
                          <div key={c} className="flex justify-between items-center bg-slate-50/80 dark:bg-slate-955/60 p-2 border border-slate-150 dark:border-slate-850 rounded-lg text-[10px] text-slate-600 dark:text-slate-350 font-sans group">
                            <span className="truncate flex-1 font-medium">{c}</span>
                            <button onClick={() => handleRemoveCert(c)} className="text-rose-500 opacity-60 hover:opacity-100 ml-1.5 cursor-pointer">&times;</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Languages column block */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[9.5px] font-black uppercase text-slate-400 font-mono tracking-wider flex items-center gap-1">
                          &#127467;&#127479; Langues parlées
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setData(prev => ({
                              ...prev,
                              languages: [...(prev.languages || []), { name: "", level: "" }]
                            }));
                            showNotification("Nouvelle langue ajoutée !", "success");
                          }}
                          className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider font-mono bg-accent/10 border border-accent/20 rounded text-accent flex items-center gap-0.5 cursor-pointer hover:bg-accent/20 transition-all"
                        >
                          <Plus size={8} /> Ajouter
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {(data.languages || []).map((l, lIdx) => (
                          <div key={lIdx} className="flex gap-1.5 items-center bg-slate-50/50 dark:bg-slate-950/20 p-1.5 rounded-lg border border-slate-200/40 dark:border-slate-850/40">
                            <input
                              type="text"
                              value={l.name || ""}
                              placeholder="Langue (ex: Anglais)"
                              onChange={(e) => {
                                const freshL = [...data.languages];
                                freshL[lIdx] = { ...freshL[lIdx], name: e.target.value };
                                setData(prev => ({ ...prev, languages: freshL }));
                              }}
                              className="w-[45%] text-[10px] p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded text-slate-800 dark:text-white outline-none"
                            />
                            <input
                              type="text"
                              value={l.level || ""}
                              placeholder="Niveau (ex: Courant)"
                              onChange={(e) => {
                                const freshL = [...data.languages];
                                freshL[lIdx] = { ...freshL[lIdx], level: e.target.value };
                                setData(prev => ({ ...prev, languages: freshL }));
                              }}
                              className="w-[45%] text-[10px] p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded text-slate-500 dark:text-slate-300 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const freshL = data.languages.filter((_, idx) => idx !== lIdx);
                                setData(prev => ({ ...prev, languages: freshL }));
                                showNotification("Langue supprimée.", "info");
                              }}
                              className="p-1 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer transition-colors shrink-0"
                              title="Supprimer cette langue"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ))}
                        {(data.languages || []).length === 0 && (
                          <div className="text-center py-2 text-[8.5px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100/30 dark:bg-slate-950/20 rounded-lg border border-dashed border-slate-200/30">
                            Aucune langue renseignée. Clicker sur "Ajouter".
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Custom dyn Sections editor block */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black uppercase text-slate-450 font-mono tracking-wider flex items-center gap-1.5">
                        <Layers size={13} className="text-accent" />
                        📂 Sections personnalisées (Projets, Bénévolat...)
                      </h3>
                      <button
                        onClick={handleAddSection}
                        className="px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider font-mono bg-accent/15 hover:bg-accent/25 rounded border border-accent/20 text-accent flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={10} /> Section
                      </button>
                    </div>

                    <div className="space-y-6">
                      {(data.customSections || []).map((sec) => (
                        <div key={sec.id} className="p-4 bg-slate-55 de:bg-slate-955 rounded-2xl border border-slate-205 dark:border-slate-850/85 space-y-4 relative">
                          <button
                            onClick={() => handleDeleteSection(sec.id)}
                            className="absolute top-3.5 right-3.5 p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/15 rounded-lg cursor-pointer transition-colors"
                            title="Supprimer cette section personnalisée"
                          >
                            <Trash2 size={11} />
                          </button>

                          {/* Section Title modification */}
                          <div className="space-y-1 pr-10">
                            <label className="text-[8.5px] font-bold text-slate-405 uppercase font-mono">Titre de la section</label>
                            <input
                              type="text"
                              value={sec.title}
                              onChange={(e) => handleSectionTitleChange(sec.id, e.target.value)}
                              className="w-full text-xs p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-bold outline-none focus:border-accent"
                              placeholder="Ex: Projets personnels, Bénévolat, Publications..."
                            />
                          </div>

                          {/* Section items list */}
                          <div className="space-y-3.5 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                            <div className="flex items-center justify-between">
                              <span className="text-[8.5px] font-black uppercase text-slate-400 font-mono">Éléments de la section :</span>
                              <button
                                onClick={() => handleAddSectionItem(sec.id)}
                                className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-slate-200 hover:bg-slate-350 dark:bg-slate-850 rounded text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-0.5"
                              >
                                <Plus size={9} /> Élément
                              </button>
                            </div>

                            <div className="space-y-4">
                              {sec.items.map((item) => (
                                <div key={item.id} className="p-3 bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-900 rounded-xl space-y-3 relative">
                                  <button
                                    onClick={() => handleDeleteSectionItem(sec.id, item.id)}
                                    className="absolute top-2.5 right-2.5 p-1 text-rose-450 hover:text-rose-600 rounded cursor-pointer"
                                    title="Supprimer cet élément"
                                  >
                                    <Trash2 size={11} />
                                  </button>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <div className="space-y-0.5">
                                      <label className="text-[8px] font-bold text-slate-400 uppercase font-mono">Titre de l'activité</label>
                                      <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => handleSectionItemChange(sec.id, item.id, 'title', e.target.value)}
                                        className="w-full text-[10.5px] p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded text-slate-850 dark:text-white font-bold outline-none"
                                        placeholder="Ex: Projet Portfolio"
                                      />
                                    </div>
                                    <div className="space-y-0.5">
                                      <label className="text-[8px] font-bold text-slate-400 uppercase font-mono">Sous-titre / Rôle / Techs</label>
                                      <input
                                        type="text"
                                        value={item.subtitle}
                                        onChange={(e) => handleSectionItemChange(sec.id, item.id, 'subtitle', e.target.value)}
                                        className="w-full text-[10.5px] p-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded text-slate-600 dark:text-slate-350 outline-none"
                                        placeholder="Ex: React, Tailwind"
                                      />
                                    </div>
                                    <div className="space-y-0.5">
                                      <label className="text-[8px] font-bold text-slate-400 uppercase font-mono">Horodatage / Période</label>
                                      <input
                                        type="text"
                                        value={item.period}
                                        onChange={(e) => handleSectionItemChange(sec.id, item.id, 'period', e.target.value)}
                                        className="w-full text-[10.5px] p-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded text-slate-500 font-mono outline-none"
                                        placeholder="Ex: 2024"
                                      />
                                    </div>
                                  </div>

                                  {/* Bullets description lines */}
                                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-905">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[8px] font-black uppercase text-slate-400 font-mono font-bold">Détails / Réalisations :</span>
                                      <button
                                        onClick={() => handleAddCustomItemBullet(sec.id, item.id)}
                                        className="px-1.5 py-0.5 text-[8px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-slate-500 cursor-pointer flex items-center gap-0.5"
                                      >
                                        <Plus size={8} /> Ligne
                                      </button>
                                    </div>
                                    <div className="space-y-2">
                                      {item.description.map((bullet, bulletIdx) => (
                                        <div key={bulletIdx} className="flex gap-2 items-center">
                                          <input
                                            type="text"
                                            value={bullet}
                                            onChange={(e) => handleCustomItemBulletChange(sec.id, item.id, bulletIdx, e.target.value)}
                                            className="flex-1 text-[10.5px] p-1.5 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 rounded text-slate-600 dark:text-slate-350 outline-none"
                                          />
                                          <button
                                            onClick={() => handleDeleteCustomItemBullet(sec.id, item.id, bulletIdx)}
                                            className="p-1 hover:bg-rose-500/10 text-rose-500 rounded cursor-pointer"
                                            title="Supprimer cette ligne"
                                          >
                                            <Trash2 size={10} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {activeTab === 'design' && (
                <div className="space-y-6">
                  
                  {/* Choose Layout Template */}
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
                      <Columns size={13} className="text-accent" />
                      Gabarit Architectural (Layout Template)
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'split', name: 'Split Moderne', desc: 'Deux colonnes, sidebar de contrastes' },
                        { id: 'modern', name: 'Minimaliste Pur', desc: 'Une seule colonne aérée' },
                        { id: 'executive', name: 'Executive Chic', desc: 'Horizontales fines de luxe' },
                        { id: 'bento', name: 'Bento Grid', desc: 'Cartons technologiques futuristes' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setTemplate(t.id as any);
                            showNotification(`Gabarit adopté : ${t.name}`, "info");
                          }}
                          className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                            template === t.id
                              ? 'border-accent bg-accent/5 dark:bg-accent/10 shadow-sm'
                              : 'border-slate-200 dark:border-slate-805 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-400'
                          }`}
                        >
                          <span className={`text-[11px] font-bold uppercase tracking-wider font-mono ${template === t.id ? 'text-accent' : 'text-slate-800 dark:text-slate-250'}`}>{t.name}</span>
                          <span className="text-[8.5px] text-slate-400 font-sans mt-0.5 leading-relaxed">{t.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Choose Theme Palette */}
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
                      <Palette size={13} className="text-accent" />
                      Harmonie & palette de couleurs
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'midnight', name: 'Midnight Slate', color: 'bg-blue-500', desc: 'Bleu Cosmique et Acier glacé' },
                        { id: 'emerald', name: 'Emerald Forest', color: 'bg-emerald-500', desc: 'Vert sapin et contrastes éco' },
                        { id: 'royal', name: 'Charcoal & Gold', color: 'bg-amber-500', desc: 'Noir luxueux et or étincelant' },
                        { id: 'berry', name: 'Cosmic Berry', color: 'bg-pink-500', desc: 'Magenta créatif cyberpunk' }
                      ].map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setColorTheme(p.id as any);
                            showNotification(`Palette harmonisée : ${p.name}`, "info");
                          }}
                          className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                            colorTheme === p.id
                              ? 'border-slate-900 dark:border-white shadow-md bg-slate-50 dark:bg-slate-905'
                              : 'border-slate-200 dark:border-slate-805 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-3 h-3 rounded-full ${p.color} inline-block`} />
                            <span className={`text-[11px] font-mono font-bold uppercase tracking-wide ${colorTheme === p.id ? 'text-slate-850 dark:text-white font-black' : 'text-slate-700 dark:text-slate-350'}`}>{p.name}</span>
                          </div>
                          <span className="text-[8.5px] text-slate-400 font-sans leading-relaxed">{p.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Typography Fonts choice */}
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
                      <Type size={13} className="text-accent" />
                      Polices Typographiques (Typography)
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'sans', name: 'Inter (Sans)', sample: 'Abc - Standard Corporate' },
                        { id: 'mono', name: 'JetBrains (Mono)', sample: 'sys - Developer Tech' },
                        { id: 'serif', name: 'Playfair (Serif)', sample: 'Editorial & Luxury' },
                        { id: 'display', name: 'Outfit / Display', sample: 'Minimalist Modern font' }
                      ].map(font => (
                        <button
                          key={font.id}
                          onClick={() => {
                            setFontFamily(font.id as any);
                            showNotification(`Typographie modifiée : ${font.name}`, "info");
                          }}
                          className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                            fontFamily === font.id
                              ? 'border-accent bg-accent/5 shadow-sm'
                              : 'border-slate-200 dark:border-slate-805 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-400'
                          }`}
                        >
                          <span className={`text-[11px] font-bold uppercase tracking-wider font-mono ${fontFamily === font.id ? 'text-accent' : 'text-slate-800 dark:text-slate-250'}`}>{font.name}</span>
                          <span className="text-[9px] text-slate-400 font-sans mt-0.5 mt-1">{font.sample}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Choose Paper Background Style */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
                      <Palette size={13} className="text-accent" />
                      Arrière-plan & style du papier du CV
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'white', name: 'Blanc Pur', bg: 'bg-white border-slate-350', desc: 'Classique brillant haute contraste' },
                        { id: 'cream', name: 'Crème Ivoire', bg: 'bg-[#FCFAF2] border-amber-900/15', desc: 'Style chaud vintage élégant' },
                        { id: 'mist', name: 'Brume Douce', bg: 'bg-[#F4F7FA] border-blue-900/15', desc: 'Teinte froide moderne reposante' },
                        { id: 'amber', name: 'Ambre Minimaliste', bg: 'bg-[#FAF6EE] border-amber-900/15', desc: 'Beige chaud type papier recyclé' },
                        { id: 'grid', name: 'Grille Technique', bg: 'bg-white bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:6px_6px] border-slate-300', desc: 'Trame quadrillée pour profils techniques' },
                        { id: 'slate', name: 'Ardoise Sombre', bg: 'bg-[#1E293B] border-slate-700', desc: 'Présentation digitale noire moderne' }
                      ].map(bg => (
                        <button
                          key={bg.id}
                          onClick={() => {
                            setData(prev => ({ ...prev, paperBg: bg.id as any }));
                            showNotification(`Fond du papier modifié : ${bg.name}`, "info");
                          }}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                            (data.paperBg || 'white') === bg.id
                              ? 'border-accent bg-accent/5 shadow-sm'
                              : 'border-slate-200 dark:border-slate-805 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`w-3.5 h-3.5 rounded border ${bg.bg} inline-block`} />
                            <span className={`text-[10.5px] font-bold ${ (data.paperBg || 'white') === bg.id ? 'text-accent' : 'text-slate-800 dark:text-slate-250'}`}>{bg.name}</span>
                          </div>
                          <span className="text-[8.5px] text-slate-450 leading-relaxed font-sans">{bg.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Multi-page and Page Breaks Setup */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
                      <Scissors size={13} className="text-accent" />
                      Gestion multi-pages & sauts de page A4
                    </h3>
                    
                    <p className="text-[8.5px] leading-relaxed text-slate-400 dark:text-slate-450 font-sans">
                      Activez des sauts de page pour forcer les sections de votre choix à commencer sur la page suivante lors de l'impression PDF ou papier.
                    </p>

                    <div className="space-y-1.5 pt-1">
                      {[
                        { id: 'break_experiences', label: '✂️ Saut de page AVANT les Expériences' },
                        { id: 'break_education', label: '✂️ Saut de page AVANT la Formation' },
                        { id: 'break_skills', label: '✂️ Saut de page AVANT les Compétences' },
                        { id: 'break_certifications', label: '✂️ Saut de page AVANT les Certifications' },
                        { id: 'break_languages', label: '✂️ Saut de page AVANT les Langues' },
                        ...(data.customSections || []).map(sec => ({
                          id: `break_${sec.id}`,
                          label: `✂️ Saut de page AVANT: "${sec.title}"`
                        }))
                      ].map(item => {
                        const isChecked = (data.pageBreaks || []).includes(item.id);
                        return (
                          <div 
                            key={item.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                              isChecked
                                ? 'border-accent bg-accent/5'
                                : 'border-slate-150 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-900/20'
                            }`}
                          >
                            <span className="text-[9.5px] font-bold text-slate-700 dark:text-slate-350 pr-2 truncate">
                              {item.label}
                            </span>
                            <button
                              onClick={() => {
                                const activeBreaks = data.pageBreaks || [];
                                const newBreaks = activeBreaks.includes(item.id)
                                  ? activeBreaks.filter(b => b !== item.id)
                                  : [...activeBreaks, item.id];
                                setData(prev => ({ ...prev, pageBreaks: newBreaks }));
                                showNotification(
                                  activeBreaks.includes(item.id) 
                                    ? "Saut de page retiré" 
                                    : "Saut de page planifié !", 
                                  "info"
                                );
                              }}
                              className={`px-2.5 py-1 text-[8px] font-mono font-bold uppercase rounded-md tracking-wider transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-accent text-white hover:bg-accent/90'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-755'
                              }`}
                            >
                              {isChecked ? 'ACTIF' : 'INACTIF'}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Block Grouping Optimization */}
                    <div className="pt-3.5 border-t border-slate-150 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-900/20">
                        <div className="flex flex-col gap-0.5 text-left pr-2">
                          <span className="text-[9.5px] font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                            <Shield size={11} className="text-emerald-500 shrink-0" />
                            <span>Éviter les coupures de blocs</span>
                          </span>
                          <span className="text-[7.5px] text-slate-450 leading-tight font-sans">
                            Conserver les expériences et projets entiers sur la même page (saut de page automatique du bloc si nécessaire).
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setData(prev => ({ ...prev, avoidSectionSplits: !prev.avoidSectionSplits }));
                            showNotification(
                              !data.avoidSectionSplits 
                                ? "Regroupement de blocs activé !" 
                                : "Regroupement désactivé", 
                              "success"
                            );
                          }}
                          className={`px-2.5 py-1 text-[8px] font-mono font-bold uppercase rounded-md tracking-wider transition-all cursor-pointer ${
                            data.avoidSectionSplits
                              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-755'
                          }`}
                        >
                          {data.avoidSectionSplits ? 'ACTIF' : 'INACTIF'}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Config footer status credits */}
            <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 text-[9.5px] text-slate-500 font-mono flex items-center justify-between">
              <span>Fichier: cv_generator.json</span>
              <span>Autosave: localState</span>
            </div>

          </div>

          {/* DYNAMIC LIVE PREVIEW FRAME STAGE: RIGHT (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            
            {/* Stage header info tab */}
            <div className="mb-2.5 flex items-center justify-between px-2 text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <Sparkles size={11} className="text-yellow-500" />
                Papier Virtuel Haute Fidélité (A4 portrait)
              </span>
              <span>Zoom: 100% (Modèle réactif)</span>
            </div>

            {/* A4 PAPER-LIKE CONTAINER WRAPPER PREVIEW */}
            {(() => {
              const { bgClass, bgStyle } = getPaperBgClassesAndStyle();
              return (
                <div 
                  id="resume-print-area"
                  className={`printable-cv-stage ${bgClass} shadow-xl rounded-2xl w-full min-h-[840px] p-6 sm:p-8 md:p-10 ${getFontClass()} transition-all relative overflow-hidden`}
                  style={{ contentVisibility: 'auto', ...bgStyle }}
                >
                  <style>{`
                    .paper-bg-slate h1, .paper-bg-slate h2, .paper-bg-slate h3, .paper-bg-slate h4, .paper-bg-slate h5, .paper-bg-slate .text-slate-900, .paper-bg-slate .text-slate-800 {
                      color: #ffffff !important;
                    }
                    .paper-bg-slate p, .paper-bg-slate span, .paper-bg-slate li, .paper-bg-slate a, .paper-bg-slate .text-slate-600, .paper-bg-slate .text-slate-550, .paper-bg-slate .text-slate-500, .paper-bg-slate .text-slate-705 {
                      color: #cbd5e1 !important;
                    }
                    .paper-bg-slate .border-slate-100, .paper-bg-slate .border-slate-105, .paper-bg-slate .border-slate-200, .paper-bg-slate .border-slate-205, .paper-bg-slate .border-slate-250, .paper-bg-slate .border-b {
                      border-color: #334155 !important;
                    }
                    .paper-bg-slate .bg-slate-50, .paper-bg-slate .bg-slate-100, .paper-bg-slate .bg-slate-50\\/75, .paper-bg-slate .bg-slate-50\\/50 {
                      background-color: #1e293b !important;
                      border-color: #475569 !important;
                      color: #f1f5f9 !important;
                    }
                    
                    @media print {
                      .printable-cv-stage.paper-bg-slate {
                        background-color: #0f172a !important;
                        color: #cbd5e1 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                      }
                      .printable-cv-stage.paper-bg-cream {
                        background-color: #FCFAF2 !important;
                        color: #1a1a1a !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                      }
                      .printable-cv-stage.paper-bg-mist {
                        background-color: #F3F6F9 !important;
                        color: #1a1a1a !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                      }
                      .printable-cv-stage.paper-bg-amber {
                        background-color: #FAF5EB !important;
                        color: #1c1c1a !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                      }
                    }
                  `}</style>
              
              {/* LAYOUT RENDERER SWITCHES BASED ON ACTIVE CHOSEN TEMPLATE STATE */}

              {/* 1. SPLIT MODERN TWO COLUMN TEMPLATE */}
              {template === 'split' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch pt-2">
                  
                  {/* Dual Column: Sidebar Column (4 columns) */}
                  <div className="md:col-span-4 flex flex-col gap-6 pr-4 border-r border-slate-105">
                    
                    {/* Header Photo Profile Card */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3.5">
                      <div className="w-18 h-18 rounded-full overflow-hidden border-2 border-slate-900/10 shadow-md">
                        <img 
                          src={data.avatarUrl} 
                          alt={data.fullName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <h1 className="text-md font-black text-slate-900 uppercase tracking-tight leading-tight">{data.fullName}</h1>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${activeColors.accentText} mt-1`}>{data.jobTitle}</p>
                      </div>
                    </div>

                    {/* Contacts Module bar */}
                    <div className="space-y-2.5 py-4 border-t border-b border-latex-103">
                      <h4 className="text-[9.5px] font-black uppercase text-slate-400 font-mono tracking-wider">Coordonnées</h4>
                      
                      <div className="space-y-1.5 text-[10px] text-slate-600 space-y-2">
                        <a href={`mailto:${data.email}`} className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                          <Mail size={11} className={activeColors.accentText} />
                          <span className="truncate">{data.email}</span>
                        </a>
                        <div className="flex items-center gap-2">
                          <Phone size={11} className={activeColors.accentText} />
                          <span>{data.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={11} className={activeColors.accentText} />
                          <span>{data.location}</span>
                        </div>
                        {data.showWebsite !== false && data.website && (
                          <a href={data.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                            <Globe size={11} className={activeColors.accentText} />
                            <span>CV.Portfolio</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Skills Tag Section */}
                    <div className="space-y-2.5">
                      <h4 className="text-[9.5px] font-black uppercase text-slate-400 font-mono tracking-wider">Compétences</h4>
                      <div className="flex flex-wrap gap-1">
                        {data.skills.map((s) => (
                          <span key={s} className="px-1.5 py-0.5 text-[8.5px] font-mono bg-slate-100 text-slate-700 rounded-md border border-slate-200/40">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Certifications and Languages */}
                    {data.certifications.length > 0 && (
                      <div className="space-y-2.5">
                        <h4 className="text-[9.5px] font-black uppercase text-slate-400 font-mono tracking-wider">Certifications</h4>
                        <ul className="space-y-1.5 text-[9px] text-slate-600 leading-relaxed list-disc list-inside">
                          {data.certifications.map((c) => (
                            <li key={c} className="truncate">{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {data.languages.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[9.5px] font-black uppercase text-slate-400 font-mono tracking-wider">Langues</h4>
                        <div className="space-y-1 text-[9px] text-slate-600">
                          {data.languages.map((l) => (
                            <div key={l.name} className="flex justify-between">
                              <span className="font-bold">{l.name}</span>
                              <span className="opacity-75">{l.level}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Right side main body experience column (8 columns) */}
                  <div className="md:col-span-8 flex flex-col gap-6">
                    
                    {/* Professional Summary */}
                    <div className="pb-4 border-b border-slate-105">
                      <h4 className="text-[9.5px] font-black uppercase text-slate-450 font-mono tracking-wider mb-2">Profil & Sommaire</h4>
                      <p className="text-[10.5px] text-slate-600 leading-relaxed font-sans font-medium">{data.summary}</p>
                    </div>

                    {/* Professional Experiences list */}
                    {renderPageBreak('break_experiences')}
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1">
                        Expériences Professionnelles
                      </h3>

                      <div className="space-y-5">
                        {data.experiences.map((exp) => (
                          <div key={exp.id} className={`space-y-2 relative ${data.avoidSectionSplits ? 'break-inside-avoid' : ''}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <div>
                                <h4 className="text-[11.5px] font-black text-slate-900">{exp.role}</h4>
                                <p className="text-[9.5px] font-bold text-slate-500 font-mono uppercase">{exp.company}</p>
                              </div>
                              <span className="text-[8.5px] font-mono text-slate-450 font-bold bg-slate-50 px-1.5 py-0.5 border border-slate-200/50 rounded-md self-start sm:self-center">
                                {exp.period}
                              </span>
                            </div>

                            {/* Bullet descriptions */}
                            <ul className="list-disc list-outside ml-4 text-[9.5px] text-slate-600 space-y-1.5 leading-relaxed font-sans">
                              {exp.description.map((ach, idx) => (
                                <li key={idx}>
                                  {ach}
                                Amin
                                </li>
                              ))}
                            </ul>

                            {/* Tags list */}
                            {exp.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {exp.technologies.map((t) => (
                                  <span key={t} className={`px-1 rounded font-mono text-[7px] font-bold tracking-wider uppercase border ${activeColors.accentBg}`}>
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Education Subblock */}
                    {data.education.length > 0 && (
                      <React.Fragment>
                        {renderPageBreak('break_education')}
                        <div className="space-y-3 pt-2">
                          <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                            Cursus Académique
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {data.education.map((edu) => (
                              <div key={edu.id} className="space-y-0.5">
                                <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 font-bold mb-0.5">
                                  <span>{edu.period}</span>
                                </div>
                                <h4 className="text-[10.5px] font-black text-slate-800 leading-tight">{edu.degree}</h4>
                                <p className="text-[9px] font-bold text-slate-500 font-mono">{edu.school}</p>
                                <p className="text-[8.5px] text-slate-500 mt-1 font-sans font-medium">{edu.details}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </React.Fragment>
                    )}

                    {/* Custom Sections Block */}
                    {(data.customSections || []).map((sec) => (
                      sec.items && sec.items.length > 0 && (
                        <React.Fragment key={sec.id}>
                          {renderPageBreak(`break_${sec.id}`)}
                          <div className="space-y-3 pt-2">
                            <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                              {sec.title}
                            </h3>
                            <div className="space-y-4">
                              {sec.items.map((item) => (
                                <div key={item.id} className={`space-y-1.5 ${data.avoidSectionSplits ? 'break-inside-avoid' : ''}`}>
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                    <div>
                                      <h4 className="text-[11px] font-black text-slate-900">{item.title}</h4>
                                      <p className="text-[9px] font-bold text-slate-500 font-mono uppercase">{item.subtitle}</p>
                                    </div>
                                    <span className="text-[8.5px] font-mono text-slate-450 font-bold bg-slate-50 px-1.5 py-0.5 border border-slate-200/50 rounded-md self-start sm:self-center">
                                      {item.period}
                                    </span>
                                  </div>
                                  {item.description && item.description.length > 0 && (
                                    <ul className="list-disc list-outside ml-4 text-[9.5px] text-slate-600 space-y-1 leading-relaxed font-sans font-medium">
                                      {item.description.map((bullet, bIdx) => (
                                        <li key={bIdx}>{bullet}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </React.Fragment>
                      )
                    ))}

                  </div>

                </div>
              )}

              {/* 2. MINIMALIST PUR SINGLE COLUMN TEMPLATE */}
              {template === 'modern' && (
                <div className="space-y-6 pt-2">
                  
                  {/* Clean header centered */}
                  <div className="text-center pb-6 border-b border-slate-100 flex flex-col items-center gap-3">
                    <h1 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-widest leading-none mb-1">{data.fullName}</h1>
                    <p className={`text-[10.5px] font-black uppercase tracking-widest ${activeColors.accentText}`}>{data.jobTitle}</p>
                    
                    {/* Horizontal simple contact inline strip */}
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[9px] text-slate-500 font-mono mt-1 border-t border-slate-105/50 pt-2.5 w-full max-w-lg">
                      <span className="flex items-center gap-1"><Mail size={9} className="shrink-0 text-slate-400" /> {data.email}</span>
                      <span className="flex items-center gap-1"><Phone size={9} className="shrink-0 text-slate-400" /> {data.phone}</span>
                      <span className="flex items-center gap-1"><MapPin size={9} className="shrink-0 text-slate-400" /> {data.location}</span>
                      {data.showWebsite !== false && data.website && (
                        <span className="flex items-center gap-1"><Globe size={9} className="shrink-0 text-slate-400" /> {data.website.replace('https://', '')}</span>
                      )}
                    </div>
                  </div>

                  {/* Summary Abstract */}
                  <p className="text-[10.5px] text-slate-600 text-center max-w-2xl mx-auto italic leading-relaxed font-sans font-medium">
                    "{data.summary}"
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 items-stretch">
                    
                    {/* Left main: core experience */}
                    <div className="md:col-span-8 space-y-6 md:pr-4 md:border-r border-slate-100">
                      
                      {renderPageBreak('break_experiences')}
                      <div className="space-y-4">
                        <h3 className="text-[9.5px] font-black uppercase tracking-widest text-slate-450 border-b border-slate-200 pb-1.5 font-mono">
                          Expérience Professionnelle
                        </h3>
                        
                        <div className="space-y-5">
                          {data.experiences.map((exp) => (
                            <div key={exp.id} className={`space-y-2 ${data.avoidSectionSplits ? 'break-inside-avoid' : ''}`}>
                              <div className="flex justify-between items-baseline">
                                <div>
                                  <h4 className="text-[11px] font-black text-slate-900 leading-tight">{exp.role}</h4>
                                  <span className="text-[9px] font-bold text-slate-450 font-mono uppercase">{exp.company}</span>
                                </div>
                                <span className="text-[8.5px] font-mono text-slate-400 font-bold">{exp.period}</span>
                              </div>

                              <ul className="list-disc list-outside ml-4 text-[9px] text-slate-550 space-y-1 leading-relaxed">
                                {exp.description.map((ach, idx) => (
                                  <li key={idx}>{ach}</li>
                                ))}
                              </ul>
                              
                              {exp.technologies.length > 0 && (
                                <div className="text-[8px] text-slate-400 font-mono">
                                  Technologies: <span className="text-slate-650 font-bold">{exp.technologies.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Custom Sections Block */}
                      {(data.customSections || []).map((sec) => (
                        sec.items && sec.items.length > 0 && (
                          <React.Fragment key={sec.id}>
                            {renderPageBreak(`break_${sec.id}`)}
                            <div className="space-y-4 pt-4 border-t border-slate-105/40">
                              <h3 className="text-[9.5px] font-black uppercase tracking-widest text-slate-450 border-b border-slate-200 pb-1.5 font-mono">
                                {sec.title}
                              </h3>
                              <div className="space-y-4">
                              {sec.items.map((item) => (
                                <div key={item.id} className={`space-y-1.5 ${data.avoidSectionSplits ? 'break-inside-avoid' : ''}`}>
                                  <div className="flex justify-between items-baseline">
                                    <div>
                                      <h4 className="text-[11px] font-black text-slate-900 leading-tight">{item.title}</h4>
                                      <span className="text-[8.5px] font-bold text-slate-450 font-mono uppercase">{item.subtitle}</span>
                                    </div>
                                    <span className="text-[8px] font-mono text-slate-400 font-bold whitespace-nowrap">{item.period}</span>
                                  </div>
                              {item.description && item.description.length > 0 && (
                                    <ul className="list-disc list-outside ml-4 text-[8.5px] text-slate-550 space-y-1 leading-relaxed">
                                      {item.description.map((bullet, bID) => (
                                        <li key={bID}>{bullet}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </React.Fragment>
                      )
                    ))}

                    </div>

                    {/* Right main: skills & schools */}
                    <div className="md:col-span-4 space-y-5">
                      
                      <div className="space-y-2.5">
                        <h3 className="text-[9.5px] font-black uppercase tracking-widest text-slate-450 border-b border-slate-200 pb-1.5 font-mono">
                          Compétences
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {data.skills.map((s) => (
                            <span key={s} className="px-1.5 py-0.5 bg-slate-50 text-slate-700 border border-slate-200/60 rounded text-[8.5px] font-mono">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {data.education.length > 0 && (
                        <div className="space-y-3.5">
                          <h3 className="text-[9.5px] font-black uppercase tracking-widest text-slate-450 border-b border-slate-200 pb-1.5 font-mono">
                            Formations
                          </h3>
                          {data.education.map(edu => (
                            <div key={edu.id} className="space-y-0.5">
                              <span className="text-[8px] font-mono text-slate-450">{edu.period}</span>
                              <h4 className="text-[10px] font-bold text-slate-805 leading-tight">{edu.degree}</h4>
                              <p className="text-[8.5px] text-slate-500">{edu.school}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {data.certifications.length > 0 && (
                        <div className="space-y-2.5">
                          <h3 className="text-[9.5px] font-black uppercase tracking-widest text-slate-450 border-b border-slate-200 pb-1.5 font-mono">
                            Certifications
                          </h3>
                          <ul className="space-y-1 text-[8.5px] text-slate-500 list-disc list-inside">
                            {data.certifications.map(c => (
                              <li key={c} className="truncate">{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    </div>

                  </div>

                </div>
              )}

              {/* 3. EXECUTIVE CHIC EXECUTIVE LUXURY TEMPLATE */}
              {template === 'executive' && (
                <div className="space-y-6 pt-1">
                  
                  {/* Clean header, inline contacts with top or bottom fine horizontal line */}
                  <div className="text-center py-4 border-t-2 border-b-2 border-slate-900 mt-2 space-y-1">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">{data.fullName}</h1>
                    <p className={`text-[10px] font-bold font-mono tracking-widest uppercase ${activeColors.accentText}`}>{data.jobTitle}</p>
                    
                    <div className="flex flex-wrap items-center justify-center gap-x-4 text-[9px] text-slate-500 font-mono pt-1">
                      <span className="flex items-center gap-1"><MapPin size={9} className="shrink-0 text-slate-400" /> {data.location}</span>
                      <span className="flex items-center gap-1"><Mail size={9} className="shrink-0 text-slate-400" /> {data.email}</span>
                      <span className="flex items-center gap-1"><Phone size={9} className="shrink-0 text-slate-400" /> {data.phone}</span>
                      {data.showWebsite !== false && data.website && (
                        <span className="flex items-center gap-1"><Globe size={9} className="shrink-0 text-slate-400" /> {data.website.replace('https://', '')}</span>
                      )}
                    </div>
                  </div>

                  {/* Summary section */}
                  <p className="text-[10px] text-slate-650 leading-relaxed max-w-3xl font-sans font-medium">{data.summary}</p>

                  {/* Dual columns identical or sequential blocks */}
                  <div className="space-y-5">
                    {renderPageBreak('break_experiences')}
                    <h3 className="text-[9.5px] font-black uppercase tracking-widest border-b border-slate-350 pb-1 font-mono text-slate-900">
                      Parcours Professionnel
                    </h3>

                    <div className="space-y-5">
                      {data.experiences.map((exp) => (
                        <div key={exp.id} className={`space-y-1.5 ${data.avoidSectionSplits ? 'break-inside-avoid' : ''}`}>
                          <div className="flex items-center justify-between font-serif">
                            <span className="text-[11px] font-black text-slate-900">{exp.role} — <span className="font-bold text-slate-500">{exp.company}</span></span>
                            <span className="text-[9px] font-mono text-slate-400 font-bold">{exp.period}</span>
                          </div>

                          <ul className="list-disc list-outside ml-4 text-[9px] text-slate-600 space-y-1 leading-relaxed">
                            {exp.description.map((ach, idx) => (
                              <li key={idx}>{ach}</li>
                            ))}
                          </ul>

                          {exp.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 font-mono text-[7px] text-slate-400">
                              <span>Technologies: [ <span className="text-slate-600 font-bold">{exp.technologies.join(', ')}</span> ]</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Combined Skills & Education row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-105">
                    
                    <div className="space-y-2.5">
                      <h4 className="text-[9.5px] font-black uppercase tracking-widest text-slate-900 font-mono border-b border-slate-150 pb-0.5">Formations Académiques</h4>
                      {data.education.map(edu => (
                        <div key={edu.id} className="space-y-0.5">
                          <div className="flex justify-between items-baseline text-[8.5px] font-mono text-slate-400 font-bold">
                            <span>{edu.period}</span>
                          </div>
                          <h5 className="text-[10px] font-bold text-slate-800">{edu.degree}</h5>
                          <p className="text-[8.5px] text-slate-500">{edu.school}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2.5">
                      <h4 className="text-[9.5px] font-black uppercase tracking-widest text-slate-900 font-mono border-b border-slate-150 pb-0.5">Compétences & Savoir-faire</h4>
                      <div className="flex flex-wrap gap-1">
                        {data.skills.map(s => (
                          <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200/40 rounded text-[8.5px] font-mono">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Custom Sections Block */}
                  {(data.customSections || []).map((sec) => (
                    sec.items && sec.items.length > 0 && (
                      <React.Fragment key={sec.id}>
                        {renderPageBreak(`break_${sec.id}`)}
                        <div className="space-y-4 pt-4 border-t border-slate-105">
                          <h3 className="text-[9.5px] font-black uppercase tracking-widest border-b border-slate-350 pb-1 font-mono text-slate-900">
                            {sec.title}
                          </h3>
                          <div className="space-y-4">
                            {sec.items.map((item) => (
                              <div key={item.id} className={`space-y-1.5 ${data.avoidSectionSplits ? 'break-inside-avoid' : ''}`}>
                                <div className="flex items-center justify-between font-serif">
                                <span className="text-[11px] font-black text-slate-900">{item.title} — <span className="font-bold text-slate-500 font-sans text-[10px] uppercase">{item.subtitle}</span></span>
                                <span className="text-[9px] font-mono text-slate-400 font-bold">{item.period}</span>
                              </div>
                              {item.description && item.description.length > 0 && (
                                <ul className="list-disc list-outside ml-4 text-[9px] text-slate-600 space-y-1 leading-relaxed">
                                  {item.description.map((bullet, bIdx) => (
                                    <li key={bIdx}>{bullet}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </React.Fragment>
                    )
                  ))}

                </div>
              )}

              {/* 4. CREATIVE BENTO GRID PORTFOLIO STYLE TEMPLATE */}
              {template === 'bento' && (
                <div className="space-y-5 pt-1">
                  
                  {/* Bento top header row */}
                  <div className="grid grid-cols-3 gap-4">
                    
                    {/* Box 1: Core Bio card */}
                    <div className="col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-200/60 shadow-sm flex flex-col justify-between min-h-[120px]">
                      <div>
                        <h1 className="text-md font-black text-slate-900 uppercase tracking-tight">{data.fullName}</h1>
                        <p className={`text-[9px] font-bold uppercase ${activeColors.accentText} font-mono mt-0.5`}>{data.jobTitle}</p>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-2 font-sans font-medium line-clamp-3 leading-relaxed">"{data.summary}"</p>
                    </div>

                    {/* Box 2: Quick contact photo card */}
                    <div className="col-span-1 p-4 bg-slate-900 text-white rounded-xl flex flex-col items-center justify-center text-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden mb-2 border border-white/20">
                        <img src={data.avatarUrl} alt={data.fullName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[8px] font-mono text-slate-300 truncate w-full">{data.email}</span>
                      <span className="text-[7.5px] font-mono text-slate-400 mt-0.5">{data.location}</span>
                    </div>

                  </div>

                  {/* Grid layout sections */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* Box 3: Classic Experience timeline vertical block (8 cols) */}
                    <div className="md:col-span-8 p-4 bg-white border border-slate-250 rounded-xl shadow-sm space-y-4">
                      <h4 className="text-[9.5px] font-black uppercase text-slate-900 font-mono tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                        <Briefcase size={12} className="text-blue-500" />
                        Timeline d'Expérience
                      </h4>

                      <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                        {data.experiences.slice(0, 3).map((exp) => (
                          <div key={exp.id} className="space-y-1">
                            <div className="flex justify-between items-baseline">
                              <h5 className="text-[10px] font-black text-slate-900 leading-tight">{exp.role} <span className="opacity-60 text-[9px] font-medium font-sans">@ {exp.company}</span></h5>
                              <span className="text-[8px] text-slate-450 font-mono font-bold whitespace-nowrap">{exp.period}</span>
                            </div>
                            <p className="text-[8.5px] text-slate-550 leading-relaxed font-sans font-medium">{exp.description[0]}</p>
                            {exp.description[1] && <p className="text-[8.5px] text-slate-550 leading-relaxed font-sans font-medium">{exp.description[1]}</p>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Box 4: Combined multi mini grid column elements (4 cols) */}
                    <div className="md:col-span-4 flex flex-col gap-4">
                      
                      {/* Box 4.1: Mini items of Skills tags */}
                      <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-205 shadow-xs flex-1">
                        <h5 className="text-[8.5px] font-black uppercase text-slate-450 font-mono mb-2">Savoir-faire</h5>
                        <div className="flex flex-wrap gap-1">
                          {data.skills.slice(0, 9).map(s => (
                            <span key={s} className="px-1.5 py-0.5 bg-white text-slate-700 border border-slate-150 rounded text-[7.5px] font-mono">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Box 4.2: Mini educational status */}
                      {data.education.length > 0 && (
                        <div className="p-3.5 bg-slate-950 text-white rounded-xl shadow-sm flex-1">
                          <h5 className="text-[8px] font-black uppercase text-slate-400 font-mono mb-1.5">Dernier Diplôme</h5>
                          <span className="text-[7.5px] font-mono text-emerald-400 font-bold">{data.education[0].period}</span>
                          <h5 className="text-[9.5px] font-black leading-tight mt-0.5">{data.education[0].degree}</h5>
                          <p className="text-[8px] text-slate-400 truncate mt-0.5">{data.education[0].school}</p>
                        </div>
                      )}

                    </div>

                  </div>

                  {/* Bento custom sections row (extra boxes) */}
                  {(data.customSections || []).some(sec => sec.items && sec.items.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(data.customSections || []).map((sec) => (
                        sec.items && sec.items.length > 0 && (
                          <div key={sec.id} className="p-4 bg-slate-50/75 border border-slate-205 rounded-xl shadow-xs space-y-3">
                            <h4 className="text-[9px] font-black uppercase text-slate-800 font-mono tracking-wider border-b border-slate-200/50 pb-1">
                              📂 {sec.title}
                            </h4>
                            <div className="space-y-3">
                              {sec.items.map((item) => (
                                <div key={item.id} className="space-y-1">
                                  <div className="flex justify-between items-baseline">
                                    <h5 className="text-[9.5px] font-black text-slate-900 leading-tight">
                                      {item.title} <span className="opacity-65 text-[8px] font-normal font-sans">| {item.subtitle}</span>
                                    </h5>
                                    <span className="text-[7.5px] text-slate-450 font-mono font-bold whitespace-nowrap">{item.period}</span>
                                  </div>
                                  {item.description && item.description.length > 0 && (
                                    <ul className="list-disc list-outside ml-3.5 text-[8px] text-slate-550 space-y-0.5 font-sans font-medium leading-relaxed">
                                      {item.description.map((bullet, blIdx) => (
                                        <li key={blIdx}>{bullet}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* PDF Margin layout safety footer invisible unless printed */}
              <div className="hidden print:block pt-12 text-center text-[7px] text-slate-400 font-mono font-bold tracking-widest uppercase mt-4 border-t border-slate-100">
                Généré à l'aide du Portfolio de {data.fullName}
              </div>

            </div>
          );
        })()}

      </div>

        </div>

      </div>
    </section>
  );
};

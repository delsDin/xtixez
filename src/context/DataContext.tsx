import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { reportIncident } from '../lib/incident-logger';
export interface GeneralInfo {
  owner_name: string;
  owner_title_prefix: string;
  owner_title_suffix: string;
  profile_picture_url: string;
  normal_phrases: string[];
  owner_email: string;
  owner_phone: string;
  owner_location: string;
  whatsapp_number: string;
  github_url: string;
  linkedin_url: string;
  maintenance_mode: boolean;
  about_title?: string;
  about_paragraphs?: string[];
  about_citations?: string[];
}

export interface MaintenanceConfig {
  isActive: boolean;
  startDate: string;
  reason: string;
  autoReopen: boolean;
  autoReopenDate: string;
  reopenDate: string;
  reopenedAt: string;
}

const fallbackGeneralInfo: GeneralInfo = {
  owner_name: 'Dels M. Dinla.',
  owner_title_prefix: 'Dev Python',
  owner_title_suffix: '& Data Scientist',
  profile_picture_url: '',
  normal_phrases: [
    "Je transforme des données complexes en applications web performantes, élégantes et intuitives.",
    "Passionné par l'intersection entre l'ingénierie logicielle avancée et l'intelligence artificielle.",
    "Je conçois des architectures full-stack robustes et des modèles de Machine Learning scalables.",
    "Engagé à livrer des solutions de haute qualité avec un code propre, performant et optimisé.",
    "À la recherche permanente d'innovations technologiques pour résoudre des défis concrets."
  ],
  owner_email: 'delsmarceldinla@gmail.com',
  owner_phone: '+229 01 53 02 43 67',
  owner_location: 'Abomey-Calavi, Bénin',
  whatsapp_number: '22953024367',
  github_url: 'https://github.com/delsDin',
  linkedin_url: 'https://www.linkedin.com/in/dels-dinla',
  maintenance_mode: false,
  about_title: "À propos de moi",
  about_paragraphs: [
    "Je suis un développeur full-stack passionné par la création de solutions technologiques innovantes."
  ],
  about_citations: [
    "La technologie est le meilleur moyen de résoudre les problèmes de demain."
  ]
};

const fallbackMaintenanceConfig: MaintenanceConfig = {
  isActive: false,
  startDate: '',
  reason: 'Maintenance technique en cours.',
  autoReopen: false,
  autoReopenDate: '',
  reopenDate: '',
  reopenedAt: ''
};

export const fallbackSectionVisibility = {
  home: true,
  about: true,
  services: true,
  skills: true,
  certifications: true,
  projects: true,
  experience: true,
  blog: true,
  contact: true,
  github: true,
  pipeline: true,
  ml_playground: true,
  terminal: true,
  cv_generator: true,
};


interface DataContextType {
  projects: any[];
  experiences: any[];
  services: any[];
  skills: any;
  testimonials: any[];
  generalInfo: GeneralInfo;
  maintenanceConfig: MaintenanceConfig;
  loading: boolean;
  error: string | null;
  certifications: any[];
  sectionVisibility: typeof fallbackSectionVisibility;
}

const DataContext = createContext<DataContextType>({
  projects: [],
  experiences: [],
  services: [],
  skills: { development: [], dataScience: [], autres: [] },
  testimonials: [],
  generalInfo: fallbackGeneralInfo,
  maintenanceConfig: fallbackMaintenanceConfig,
  loading: false,
  error: null,
  certifications: [],
  sectionVisibility: fallbackSectionVisibility
});

const CACHE_KEY = 'stisx_portfolio_data_cache';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Erreur lecture cache local:', e);
    }
    return {
      projects: [],
      experiences: [],
      services: [],
      skills: { development: [], dataScience: [], autres: [] },
      testimonials: [],
      generalInfo: fallbackGeneralInfo,
      maintenanceConfig: fallbackMaintenanceConfig,
      certifications: [],
      sectionVisibility: fallbackSectionVisibility
    };
  });
  
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem(CACHE_KEY);
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        if (!localStorage.getItem(CACHE_KEY)) {
          setLoading(true);
        }
        
        // Fetch all tables in parallel
        const [
          { data: projectsRes, error: pErr },
          { data: expRes, error: eErr },
          { data: servRes, error: servErr },
          { data: skillsRes, error: skErr },
          { data: testRes, error: tErr },
          { data: genInfoRes, error: gErr },
          { data: maintRes, error: mErr },
          { data: certsRes, error: cErr },
          { data: visRes, error: vErr }
        ] = await Promise.all([
          supabase.from('projects').select('*').order('id', { ascending: true }),
          supabase.from('experiences').select('*').order('id', { ascending: true }),
          supabase.from('services').select('*'),
          supabase.from('skills').select('*'),
          supabase.from('testimonials').select('*'),
          supabase.from('general_info').select('*').single(),
          supabase.from('maintenance_config').select('*').eq('id', 1).single(),
          supabase.from('certifications').select('*').order('created_at', { ascending: false }),
          supabase.from('section_visibility').select('*').eq('id', 1).single()
        ]);

        // Fallback checks for major layout data
        if (pErr || eErr || servErr || skErr || tErr || gErr) {
          const errors = [pErr, eErr, servErr, skErr, tErr, gErr].filter(Boolean);
          const combinedMsg = errors.map(e => e.message).join('; ');
          reportIncident({
            source: 'supabase_read_initial',
            errorMessage: `Failed to load portfolio tables: ${combinedMsg}`,
            severity: gErr ? 'critical' : 'warning',
            metadata: { errors }
          });

          console.warn('Erreur lors du chargement depuis Supabase, utilisation des données locales.');
          setError('Impossible de joindre la base de données ou tables manquantes.');
          return; // Use fallbacks if DB fails
        }
        
        if (cErr) {
          console.error("Error fetching certifications:", cErr);
        }

        // Format skills data to match the expected format { development: [], dataScience: [], autres: [] }
        const formattedSkills = {
          development: skillsRes?.filter(s => s.category === 'development') || [],
          dataScience: skillsRes?.filter(s => s.category === 'dataScience') || [],
          autres: skillsRes?.filter(s => s.category === 'autres') || [],
        };

        let formattedMaint: MaintenanceConfig = fallbackMaintenanceConfig;
        if (maintRes) {
          formattedMaint = {
            isActive: !!maintRes.is_active,
            startDate: maintRes.start_date || '',
            reason: maintRes.reason || '',
            autoReopen: !!maintRes.auto_reopen,
            autoReopenDate: maintRes.auto_reopen_date || '',
            reopenDate: maintRes.reopen_date || '',
            reopenedAt: maintRes.reopened_at || ''
          };

          // --- LOGIQUE DE REOUVERTURE AUTOMATIQUE ---
          if (formattedMaint.isActive && formattedMaint.autoReopen && formattedMaint.autoReopenDate) {
            const now = new Date();
            const reopenTime = new Date(formattedMaint.autoReopenDate);
            if (now >= reopenTime) {
              console.log("Automatic reopen time reached! Disabling maintenance mode.");
              try {
                const actualReopenedAt = now.toISOString();
                // Update in DB
                await supabase.from('maintenance_config')
                  .update({ is_active: false, reopened_at: actualReopenedAt })
                  .eq('id', 1);

                // Update local model
                formattedMaint.isActive = false;
                formattedMaint.reopenedAt = actualReopenedAt;
              } catch (dbErr) {
                console.error("Failed to automatically reopen in DB:", dbErr);
              }
            }
          }
        }

        const newData = {
          projects: projectsRes?.length ? projectsRes : [],
          experiences: expRes?.length ? expRes : [],
          services: servRes?.length ? servRes : [],
          skills: skillsRes?.length ? formattedSkills : { development: [], dataScience: [], autres: [] },
          testimonials: testRes?.length ? testRes.filter((t: any) => t.is_active !== false) : [],
          generalInfo: genInfoRes ? {
            ...genInfoRes,
            maintenance_mode: !!genInfoRes.maintenance_mode
          } : fallbackGeneralInfo,
          maintenanceConfig: formattedMaint,
          certifications: certsRes?.length ? certsRes.map((c: any) => ({
            id: c.id,
            title: c.title,
            issuer: c.issuer,
            date: c.date,
            credentialId: c.credential_id || 'N/A',
            category: c.category,
            skills: c.skills || [],
            description: c.description || '',
            verifyUrl: c.verify_url || '#',
            logoColor: c.logo_color || 'from-blue-600 via-blue-400 to-indigo-500',
            status: c.status || 'published',
            attachmentUrl: c.attachment_url || '',
            attachmentType: c.attachment_type || ''
          })) : [],
          sectionVisibility: visRes ? {
            home: visRes.home !== false,
            about: visRes.about !== false,
            services: visRes.services !== false,
            skills: visRes.skills !== false,
            certifications: visRes.certifications !== false,
            projects: visRes.projects !== false,
            experience: visRes.experience !== false,
            blog: visRes.blog !== false,
            contact: visRes.contact !== false,
            github: visRes.github !== false,
            pipeline: visRes.pipeline !== false,
            ml_playground: visRes.ml_playground !== false,
            terminal: visRes.terminal !== false,
            cv_generator: visRes.cv_generator !== false,
          } : fallbackSectionVisibility
        };
        
        setData(newData);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(newData));
        } catch (e) {
          console.warn('Erreur écriture cache local:', e);
        }
        
      } catch (err: any) {
        reportIncident({
          source: 'datacontext_catch',
          errorMessage: err?.message || String(err),
          errorStack: err?.stack,
          severity: 'warning'
        });
        console.error('Erreur DataContext:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    window.addEventListener('portfolio_config_updated', fetchAllData);
    return () => {
      window.removeEventListener('portfolio_config_updated', fetchAllData);
    };
  }, []);

  return (
    <DataContext.Provider value={{ ...data, loading, error }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

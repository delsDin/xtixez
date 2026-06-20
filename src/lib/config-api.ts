import { supabase } from './supabase';

export const fetchPortfolioConfig = async () => {
  try {
    const [
      { data: generalInfo },
      { data: cvConfig },
      { data: githubConfig },
      { data: voiceConfig },
      { data: certs },
      { data: services },
      { data: projects },
      { data: flatSkills },
      { data: experiences }
    ] = await Promise.all([
      supabase.from('general_info').select('*').single(),
      supabase.from('cv_config').select('*').single(),
      supabase.from('github_config').select('*').single(),
      supabase.from('voice_config').select('*').single(),
      supabase.from('certifications').select('*').order('created_at', { ascending: false }),
      supabase.from('services').select('*').order('id', { ascending: true }),
      supabase.from('projects').select('*').order('id', { ascending: true }),
      supabase.from('skills').select('*').order('level', { ascending: false }),
      supabase.from('experiences').select('*').order('id', { ascending: true })
    ]);

    // Reconstruct skills by category
    const skillsByCategory: Record<string, any> = {};
    if (flatSkills) {
      flatSkills.forEach((s: any) => {
        if (!skillsByCategory[s.category]) {
          skillsByCategory[s.category] = {
            id: s.category,
            title: s.category === 'dev' ? 'Développement' : s.category === 'data' ? 'Data & IA' : s.category === 'tools' ? 'Outils' : s.category,
            skills: []
          };
        }
        skillsByCategory[s.category].skills.push({ name: s.name, level: s.level });
      });
    }
    const structuredSkills = Object.values(skillsByCategory);

    return {
      ownerName: generalInfo?.owner_name || '',
      ownerTitlePrefix: generalInfo?.owner_title_prefix || '',
      ownerTitleSuffix: generalInfo?.owner_title_suffix || '',
      profilePictureUrl: generalInfo?.profile_picture_url || '',
      normalPhrases: generalInfo?.normal_phrases || [],
      ownerEmail: generalInfo?.owner_email || '',
      ownerPhone: generalInfo?.owner_phone || '',
      ownerLocation: generalInfo?.owner_location || '',
      whatsappNumber: generalInfo?.whatsapp_number || '',
      githubUrl: generalInfo?.github_url || '',
      linkedinUrl: generalInfo?.linkedin_url || '',

      // Mapped About config
      aboutTitle: generalInfo?.about_title || "À propos de moi",
      aboutParagraphs: generalInfo?.about_paragraphs || [],
      aboutCitations: generalInfo?.about_citations || [],

      defaultResume: cvConfig ? {
         fullName: cvConfig.full_name || '',
         jobTitle: cvConfig.job_title || '',
         avatarUrl: cvConfig.avatar_url || '',
         summary: cvConfig.summary || '',
         email: cvConfig.email || '',
         phone: cvConfig.phone || '',
         location: cvConfig.location || '',
         github: cvConfig.github || '',
         linkedin: cvConfig.linkedin || '',
         website: cvConfig.website || '',
         showWebsite: cvConfig.show_website !== false,
         languages: cvConfig.languages || [],
         template: cvConfig.template || 'split',
         fontFamily: cvConfig.font_family || 'sans',
         colorTheme: cvConfig.color_theme || 'midnight',
         paperBg: cvConfig.paper_bg || 'white'
      } : null,

      githubUsername: githubConfig?.username || 'delsDin',
      hasGithubToken: !!githubConfig?.token,
      githubSyncEnabled: githubConfig?.sync_enabled !== false,
      githubExcludedRepos: githubConfig?.excluded_repos || [],
      githubOrganizations: githubConfig?.organizations || [],
      githubCollaborators: githubConfig?.collaborators || [],
      githubOnlyContributedCollab: githubConfig?.only_contributed_collab !== false,
      githubReposCache: githubConfig?.repos_cache || [],

      voiceBgTriggerEnabled: voiceConfig?.bg_trigger_enabled || false,
      voiceTriggerKeywords: voiceConfig?.trigger_keywords || '',
      voiceStopKeywords: voiceConfig?.stop_keywords || '',
      voiceMacros: voiceConfig?.macros || null,
      voiceHistory: voiceConfig?.history || null,
      certifications: certs ? certs.map((c: any) => ({
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
      services: services ? services.map((s: any) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        longDescription: s.long_description || '',
        iconName: s.icon_name || 'chart',
        color: s.color || 'bg-orange-100 text-orange-600',
        features: s.features || [],
        advantages: s.advantages || [],
        useCases: s.use_cases || [],
        technologies: s.technologies || [],
        duration: s.duration || '',
        deliverables: s.deliverables || []
      })) : [],
      projects: projects || [],
      skills: structuredSkills || [],
      experiences: experiences || []
    };
  } catch (error) {
    console.error("Error fetching config from Supabase:", error);
    return {} as any;
  }
};

export const fetchMaintenanceConfig = async () => {
  try {
    const { data, error } = await supabase
      .from('maintenance_config')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.warn("Error fetching maintenance config:", error);
      return null;
    }

    return {
      isActive: !!data.is_active,
      startDate: data.start_date || '',
      reason: data.reason || '',
      autoReopen: !!data.auto_reopen,
      autoReopenDate: data.auto_reopen_date || '',
      reopenDate: data.reopen_date || '',
      reopenedAt: data.reopened_at || ''
    };
  } catch (error) {
    console.error("Error fetching maintenance config:", error);
    return null;
  }
};

export const saveMaintenanceConfig = async (payload: {
  isActive: boolean;
  startDate?: string;
  reason?: string;
  autoReopen?: boolean;
  autoReopenDate?: string;
  reopenDate?: string;
  reopenedAt?: string;
}) => {
  try {
    const dbPayload: any = {
      id: 1,
      is_active: payload.isActive
    };

    if (payload.startDate !== undefined) dbPayload.start_date = payload.startDate;
    if (payload.reason !== undefined) dbPayload.reason = payload.reason;
    if (payload.autoReopen !== undefined) dbPayload.auto_reopen = payload.autoReopen;
    if (payload.autoReopenDate !== undefined) dbPayload.auto_reopen_date = payload.autoReopenDate || null;
    if (payload.reopenDate !== undefined) dbPayload.reopen_date = payload.reopenDate;
    if (payload.reopenedAt !== undefined) dbPayload.reopened_at = payload.reopenedAt || null;

    const { error } = await supabase
      .from('maintenance_config')
      .upsert(dbPayload);

    if (error) {
      console.error("Error saving maintenance config:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (error: any) {
    console.error("Error saving maintenance config:", error);
    return { ok: false, error: error.message };
  }
};

export const fetchIncidentLogs = async () => {
  try {
    const { data, error } = await supabase
      .from('incident_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching incident logs:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Error fetching incident logs:", error);
    return [];
  }
};

export const clearIncidentLogs = async () => {
  try {
    const { error } = await supabase
      .from('incident_logs')
      .delete()
      .gte('created_at', new Date(0).toISOString()); // Delete all rows

    if (error) {
      console.error("Error clearing incident logs:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (error: any) {
    console.error("Error clearing incident logs:", error);
    return { ok: false, error: error.message };
  }
};

export const settleIncidentLog = async (id: string, settled: boolean = true) => {
  try {
    const { error } = await supabase
      .from('incident_logs')
      .update({ settled })
      .eq('id', id);

    if (error) {
      console.error("Error settling incident log:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (error: any) {
    console.error("Error settling incident log:", error);
    return { ok: false, error: error.message };
  }
};




import { fetchPortfolioConfig, fetchMaintenanceConfig, saveMaintenanceConfig, fetchIncidentLogs, clearIncidentLogs, settleIncidentLog, fetchSectionVisibility, saveSectionVisibility, type SectionVisibility } from '../lib/config-api';
import React, { useState, useEffect, useRef } from 'react';
import { reportIncident } from '../lib/incident-logger';
import { MarkdownDescription } from './MarkdownDescription';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Server, AlertTriangle, MessageSquare, Trash2, 
  RotateCcw, HardDrive, Cpu, Activity, RefreshCw, X, ShieldAlert, Check, Plus,
  Image as ImageIcon, Upload, Award, ExternalLink, TrendingUp, Users, Eye, Globe, Compass, 
  Monitor, Smartphone, Tablet, Calendar, Mail, Menu, ChevronDown,
  Shield, Key, Lock, Unlock, Volume2, Bell, VolumeX, Search, Filter,
  CheckCircle, AlertCircle, Bookmark, Copy, BarChart2, Clock, MousePointerClick, Bot
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { supabase } from '../lib/supabase';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import defaultProfileImg from '../data/profil.png';
import { LiveVoiceTester } from './LiveVoiceTester';
import { LiveTtsTester } from './LiveTtsTester';
import { playErrorSound } from '../utils/audioAlert';
import { TelemetryPanel } from "./admin/TelemetryPanel";
import { VisitStatsPanel } from "./admin/VisitStatsPanel";
import { VisibilityPanel } from "./admin/VisibilityPanel";
import { ConfigAccessPanel } from "./admin/ConfigAccessPanel";
import { ConfigCVPanel } from "./admin/ConfigCVPanel";
import { BlogPanel } from "./admin/BlogPanel";

interface AdminMetrics {
  uptime: string;
  cpuUsage: string;
  memoryUsage: string;
  apiRequestsTotal: number;
  dbLatency: string;
  activeConnections: number;
  version: string;
}


export const AdminDashboard: React.FC = () => {
  const saveToSupabase = async (payload: any) => {
    try {
      if (payload.projects) {
        for (const p of payload.projects) {
          await supabase.from('projects').upsert(p);
        }
      }
      if (payload.experiences) {
        for (const e of payload.experiences) {
          await supabase.from('experiences').upsert(e);
        }
      }
      if (payload.services) {
        for (const s of payload.services) {
          const dbService = {
            id: s.id,
            title: s.title,
            description: s.description,
            long_description: s.longDescription,
            icon_name: s.iconName,
            color: s.color,
            features: s.features,
            advantages: s.advantages,
            use_cases: s.useCases,
            technologies: s.technologies,
            duration: s.duration,
            deliverables: s.deliverables
          };
          await supabase.from('services').upsert(dbService);
        }
      }
      if (payload.testimonials) {
        for (const t of payload.testimonials) {
          await supabase.from('testimonials').upsert(t);
        }
      }
      if (payload.certifications) {
        for (const c of payload.certifications) {
          const dbCert = {
            id: c.id,
            title: c.title,
            issuer: c.issuer,
            date: c.date,
            credential_id: c.credentialId,
            category: c.category,
            skills: c.skills,
            description: c.description,
            verify_url: c.verifyUrl,
            logo_color: c.logoColor,
            status: c.status,
            attachment_url: c.attachmentUrl,
            attachment_type: c.attachmentType
          };
          await supabase.from('certifications').upsert(dbCert);
        }
      }
      if (payload.skills) {
        // Need to flatten the categorized skills into rows
        const flatSkills = [];
        for (const cat of payload.skills) {
          if (cat.skills) {
            for (const s of cat.skills) {
              flatSkills.push({
                id: `${cat.id}-${s.name.replace(/\s+/g, '-').toLowerCase()}`,
                category: cat.id,
                name: s.name,
                level: s.level
              });
            }
          }
        }
        if (flatSkills.length > 0) {
          await supabase.from('skills').upsert(flatSkills);
        }
      }
      // General Info mapped from payload root
      if (payload.ownerName !== undefined || payload.ownerEmail !== undefined || payload.aboutTitle !== undefined) {
        const { data: currentInfo } = await supabase
          .from('general_info')
          .select('*')
          .eq('id', 1)
          .single();

        const mergedInfo = {
          id: 1,
          owner_name: payload.ownerName !== undefined ? payload.ownerName : (currentInfo?.owner_name || ''),
          owner_title_prefix: payload.ownerTitlePrefix !== undefined ? payload.ownerTitlePrefix : (currentInfo?.owner_title_prefix || ''),
          owner_title_suffix: payload.ownerTitleSuffix !== undefined ? payload.ownerTitleSuffix : (currentInfo?.owner_title_suffix || ''),
          profile_picture_url: payload.profilePictureUrl !== undefined ? payload.profilePictureUrl : (currentInfo?.profile_picture_url || ''),
          normal_phrases: payload.normalPhrases !== undefined ? payload.normalPhrases : (currentInfo?.normal_phrases || []),
          owner_email: payload.ownerEmail !== undefined ? payload.ownerEmail : (currentInfo?.owner_email || ''),
          owner_phone: payload.ownerPhone !== undefined ? payload.ownerPhone : (currentInfo?.owner_phone || ''),
          owner_location: payload.ownerLocation !== undefined ? payload.ownerLocation : (currentInfo?.owner_location || ''),
          whatsapp_number: payload.whatsappNumber !== undefined ? payload.whatsappNumber : (currentInfo?.whatsapp_number || ''),
          github_url: payload.githubUrl !== undefined ? payload.githubUrl : (currentInfo?.github_url || ''),
          linkedin_url: payload.linkedinUrl !== undefined ? payload.linkedinUrl : (currentInfo?.linkedin_url || ''),
          about_title: payload.aboutTitle !== undefined ? payload.aboutTitle : (currentInfo?.about_title || ''),
          about_paragraphs: payload.aboutParagraphs !== undefined ? payload.aboutParagraphs : (currentInfo?.about_paragraphs || []),
          about_citations: payload.aboutCitations !== undefined ? payload.aboutCitations : (currentInfo?.about_citations || [])
        };

        await supabase.from('general_info').upsert(mergedInfo);
      }

      // CV Default Configuration
      if (payload.defaultResume) {
        await supabase.from('cv_config').upsert({
          id: 1,
          full_name: payload.defaultResume.fullName || '',
          job_title: payload.defaultResume.jobTitle || '',
          avatar_url: payload.defaultResume.avatarUrl || '',
          summary: payload.defaultResume.summary || '',
          email: payload.defaultResume.email || '',
          phone: payload.defaultResume.phone || '',
          location: payload.defaultResume.location || '',
          github: payload.defaultResume.github || '',
          linkedin: payload.defaultResume.linkedin || '',
          website: payload.defaultResume.website || '',
          show_website: payload.defaultResume.showWebsite !== false,
          languages: payload.defaultResume.languages || [],
          template: payload.defaultResume.template || 'split',
          font_family: payload.defaultResume.fontFamily || 'sans',
          color_theme: payload.defaultResume.colorTheme || 'midnight',
          paper_bg: payload.defaultResume.paperBg || 'white'
        });
      }

      // Github Configuration
      if (payload.githubUsername !== undefined) {
        await supabase.from('github_config').upsert({
          id: 1,
          username: payload.githubUsername,
          token: payload.githubToken || '',
          sync_enabled: payload.githubSyncEnabled !== false,
          excluded_repos: payload.githubExcludedRepos ? payload.githubExcludedRepos.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          organizations: payload.githubOrganizations ? payload.githubOrganizations.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          collaborators: payload.githubCollaborators ? payload.githubCollaborators.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          only_contributed_collab: payload.githubOnlyContributedCollab !== false
        });
      }

      // Voice Configuration
      if (payload.voiceConfig) {
        await supabase.from('voice_config').upsert({
          id: 1,
          bg_trigger_enabled: payload.voiceConfig.bgTriggerEnabled !== undefined ? payload.voiceConfig.bgTriggerEnabled : false,
          trigger_keywords: payload.voiceConfig.triggerKeywords !== undefined ? payload.voiceConfig.triggerKeywords : '',
          stop_keywords: payload.voiceConfig.stopKeywords !== undefined ? payload.voiceConfig.stopKeywords : '',
          macros: payload.voiceConfig.macros || [],
          history: payload.voiceConfig.history || []
        });
      }
      return { ok: true, json: async () => ({}) };
    } catch (e) {
      console.error("Supabase sync error", e);
      return { ok: false, json: async () => ({ error: e.message }) };
    }
  };

  const { isAdminMode, setIsAdminMode, setHasSuspiciousAlert } = useNavigation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [visibilitySettings, setVisibilitySettings] = useState<SectionVisibility | null>(null);
  const [isSavingVisibility, setIsSavingVisibility] = useState<boolean>(false);



  useEffect(() => {
    let subscription: any;
    
    const checkSessionToken = async () => {
      if (isAdminMode) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setAdminToken(session.access_token);
          setIsAuthenticated(true);
          localStorage.setItem("admin_token", session.access_token);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("admin_token");
        }
        
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          if (isAdminMode) {
            if (session) {
              setAdminToken(session.access_token);
              setIsAuthenticated(true);
              localStorage.setItem("admin_token", session.access_token);
            } else {
              setIsAuthenticated(false);
              localStorage.removeItem("admin_token");
            }
          }
        });
        subscription = data.subscription;
      } else {
        setIsAuthenticated(false);
      }
    };
    
    checkSessionToken();
    
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [isAdminMode]);

  const handleAuthenticate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPassword = passwordInput.trim();
    
    if (!cleanPassword) {
      setAuthError("Veuillez saisir un mot de passe.");
      return;
    }
    setAuthError('');
    setIsAuthenticating(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'delsdenla.dev@gmail.com',
        password: cleanPassword
      });
      
      if (error) {
        setAuthError("Mot de passe incorrect.");
        playErrorSound();
        try {
          await supabase.from('admin_notifications').insert({
            type: 'suspicious',
            title: "🔒 Alerte de sécurité",
            message: "Une tentative de connexion administrateur a échoué avec un mot de passe incorrect."
          });
        } catch (e) {
          console.error("Failed to log suspicious activity:", e);
        }
      } else if (data.session) {
        localStorage.setItem("admin_token", data.session.access_token);
        setAdminToken(data.session.access_token);
        setIsAuthenticated(true);
        setAuthError('');
      }
    } catch (err) {
      setAuthError("Erreur de communication avec le serveur d'authentification.");
      playErrorSound();
    } finally {
      setIsAuthenticating(false);
    }
  };
        
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'err' | '' }>({ text: '', type: '' });

  // Custom Message Form states for admin injection

  // Simulated live chart data for database load (read/write operations per sec)
  const [chartData, setChartData] = useState<Array<{ name: string; ops: number; latency: number }>>([
    { name: '10:00', ops: 34, latency: 1.2 },
    { name: '11:00', ops: 45, latency: 1.3 },
    { name: '12:00', ops: 56, latency: 1.5 },
    { name: '13:00', ops: 48, latency: 1.1 },
    { name: '14:00', ops: 62, latency: 1.4 },
    { name: '15:00', ops: 70, latency: 1.6 },
    { name: '16:00', ops: 58, latency: 1.2 },
    { name: '17:00', ops: 75, latency: 1.4 },
  ]);

  const [adminToken, setAdminToken] = useState<string>(() => localStorage.getItem("admin_token") || "token_admin_secure_312_core_v1");

  // Real-time notification states
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [isNotifCenterOpen, setIsNotifCenterOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeToasts, setActiveToasts] = useState<any[]>([]);

  // Newsletter state
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<any[]>([]);

  // Filtering states for Access Audit Log
  const [filterIp, setFilterIp] = useState<string>('');
  const [filterLocation, setFilterLocation] = useState<string>('');

  const playNotificationSound = (type: 'suspicious' | 'success' | 'new_message') => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (type === 'suspicious') {
        const osc1 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(880, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc1.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.5);
      } else if (type === 'new_message') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(329.63, ctx.currentTime);
        osc.frequency.setValueAtTime(440.00, ctx.currentTime + 0.10);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (err) {
      console.warn("Audio Context could not play alert tone:", err);
    }
  };

  const triggerNewNotification = (params: { type: string, title: string, message: string, timestamp?: number }) => {
    const newId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newNotif = {
      id: newId,
      type: params.type,
      title: params.title,
      message: params.message,
      timestamp: params.timestamp || Date.now(),
      read: false
    };
    
    setAdminNotifications(prev => [newNotif, ...prev].slice(0, 100));
    setActiveToasts(prev => [...prev, newNotif]);
    
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== newId));
    }, 6000);

    playNotificationSound(params.type as any);
  };

  // Admin access configuration states
  const [allowedPasswords, setAllowedPasswords] = useState<string[]>(["mot_de_passe", "password", "admin", "sudo"]);
  const [voiceCommandAccess, setVoiceCommandAccess] = useState<"password_required" | "bypass_required" | "disabled">("password_required");
            const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  
  // Tagging states and handlers
  
  
  
  
  
  // Visit statistics state
  const [visitStats, setVisitStats] = useState<any | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(false);

  // Homepage Config states
  const [activeTab, setActiveTab] = useState<'telemetry' | 'stats' | 'configAccess' | 'configHome' | 'configAbout' | 'configServices' | 'configSkills' | 'configProjects' | 'configExperiences' | 'configCertifications' | 'configContact' | 'contactMessages' | 'configCV' | 'configVoice' | 'configGithub' | 'newsletter' | 'agentChat' | 'configTestimonials' | 'maintenance' | 'incidentLogs' | 'visibility' | 'blog'>(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return (sessionStorage.getItem('admin_active_tab') as any) || 'telemetry';
      }
    } catch (e) {
      console.warn("sessionStorage not available", e);
    }
    return 'telemetry';
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('admin_active_tab', activeTab);
      }
    } catch (e) {
      console.warn("sessionStorage not available", e);
    }
  }, [activeTab]);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState<boolean>(false);

  // Maintenance Config states
  const [maintIsActive, setMaintIsActive] = useState<boolean>(false);
  const [maintStartDate, setMaintStartDate] = useState<string>('');
  const [maintReason, setMaintReason] = useState<string>('');
  const [maintAutoReopen, setMaintAutoReopen] = useState<boolean>(false);
  const [maintAutoReopenDate, setMaintAutoReopenDate] = useState<string>('');
  const [maintReopenDateText, setMaintReopenDateText] = useState<string>('');
  const [maintReopenedAt, setMaintReopenedAt] = useState<string>('');

  // Incident Tracking states
  const [incidentLogs, setIncidentLogs] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(false);



  // Testimonials Config states
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [isTestimonialsLoading, setIsTestimonialsLoading] = useState<boolean>(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState<number | null>(null);
  const [isAddingTestimonial, setIsAddingTestimonial] = useState<boolean>(false);
  const [testName, setTestName] = useState('');
  const [testRole, setTestRole] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [testAvatar, setTestAvatar] = useState('');
  const [testIsActive, setTestIsActive] = useState<boolean>(true);
  
  // Received Contact Messages list states
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState<boolean>(false);
  
  // Agent Chat History
  const [agentChatHistory, setAgentChatHistory] = useState<any[]>([]);
  const [isAgentChatLoading, setIsAgentChatLoading] = useState<boolean>(false);
  const [homeName, setHomeName] = useState('');
  const [homeTitlePrefix, setHomeTitlePrefix] = useState('');
  const [homeTitleSuffix, setHomeTitleSuffix] = useState('');
  const [homeProfilePic, setHomeProfilePic] = useState('');
  const [homePhrasesText, setHomePhrasesText] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Contact & Social Links Config states
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactLocation, setContactLocation] = useState('');
  const [contactGithub, setContactGithub] = useState('');
  const [contactLinkedin, setContactLinkedin] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');

  // GitHub Integration Admin states
  const [githubUsername, setGithubUsernameState] = useState('delsDin');
  const [githubToken, setGithubTokenState] = useState('');
  const [hasGithubToken, setHasGithubToken] = useState(false);
  const [githubSyncEnabled, setGithubSyncEnabled] = useState(true);
  const [githubExcludedReposText, setGithubExcludedReposText] = useState('');
  const [githubOrganizationsText, setGithubOrganizationsText] = useState('');
  const [githubCollaboratorsText, setGithubCollaboratorsText] = useState('');
  const [githubOnlyContributedCollab, setGithubOnlyContributedCollab] = useState(true);
  const [githubFetchedRepos, setGithubFetchedRepos] = useState<any[]>([]);
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);

  // Experiences Config states
  const [experiences, setExperiences] = useState<any[]>([]);
  const [editingExperienceId, setEditingExperienceId] = useState<string | number | null>(null);
  const [isAddingExperience, setIsAddingExperience] = useState<boolean>(false);
  const [expId, setExpId] = useState<string | number>('');
  const [expRole, setExpRole] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expPeriod, setExpPeriod] = useState('');
  const [expDescriptionText, setExpDescriptionText] = useState('');
  const [expDetails, setExpDetails] = useState('');
  const [expTechnologiesText, setExpTechnologiesText] = useState('');
  const [expAchievementsText, setExpAchievementsText] = useState('');
  const [expStatus, setExpStatus] = useState<'published' | 'draft'>('published');

  // Certifications Config states
  const [certifications, setCertifications] = useState<any[]>([]);
  const [editingCertificationId, setEditingCertificationId] = useState<string | number | null>(null);
  const [isAddingCertification, setIsAddingCertification] = useState<boolean>(false);
  const [viewingDesc, setViewingDesc] = useState<any | null>(null);
  const [certId, setCertId] = useState<string>('');
  const [certTitle, setCertTitle] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certDate, setCertDate] = useState('');
  const [certCredentialId, setCertCredentialId] = useState('');
  const [certCategory, setCertCategory] = useState<'cloud-data' | 'ml-ai' | 'dev'>('cloud-data');
  const [certSkillsText, setCertSkillsText] = useState('');
  const [certDescription, setCertDescription] = useState('');
  const [certVerifyUrl, setCertVerifyUrl] = useState('');
  const [certLogoColor, setCertLogoColor] = useState('from-blue-600 via-blue-400 to-indigo-500');
  const [certStatus, setCertStatus] = useState<'published' | 'draft'>('published');
  const [certAttachmentUrl, setCertAttachmentUrl] = useState('');
  const [certAttachmentType, setCertAttachmentType] = useState<string>('');
  const [certUploadError, setCertUploadError] = useState('');
  const [certIsUploading, setCertIsUploading] = useState(false);

  // About Config states
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutParagraphsText, setAboutParagraphsText] = useState('');
  const [aboutCitationsText, setAboutCitationsText] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectCategories, setProjectCategories] = useState<string[]>([]);
  const [newProjCategoryInput, setNewProjCategoryInput] = useState('');
  const [isManagingProjCategories, setIsManagingProjCategories] = useState(false);

  // Category selection for the editor
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // States for adding/editing a category
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryTitle, setEditingCategoryTitle] = useState('');

  // States for adding/editing a skill
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<number>(80);
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null);
  const [editingSkillName, setEditingSkillName] = useState('');
  const [editingSkillLevel, setEditingSkillLevel] = useState<number>(80);

  // Projects Config sub-states
  const [editingProjectId, setEditingProjectId] = useState<string | number | null>(null);
  const [isAddingProject, setIsAddingProject] = useState<boolean>(false);
  const [projId, setProjId] = useState<string | number>('');
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState('Dev');
  const [projImage, setProjImage] = useState('');
  const [projTechsText, setProjTechsText] = useState('');
  const [projDescription, setProjDescription] = useState('');
  const [projDetails, setProjDetails] = useState('');
  const [projGithub, setProjGithub] = useState('');
  const [projDemo, setProjDemo] = useState('');
  const [projStatus, setProjStatus] = useState<'published' | 'draft'>('published');

  // Services Config sub-states
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [isAddingService, setIsAddingService] = useState<boolean>(false);
  const [srvId, setSrvId] = useState('');
  const [srvTitle, setSrvTitle] = useState('');
  const [srvDescription, setSrvDescription] = useState('');
  const [srvLongDescription, setSrvLongDescription] = useState('');
  const [srvIconName, setSrvIconName] = useState('chart');
  const [srvColor, setSrvColor] = useState('bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400');
  const [srvDuration, setSrvDuration] = useState('');
  
  const [srvFeatures, setSrvFeatures] = useState<string[]>([]);
  const [srvAdvantages, setSrvAdvantages] = useState<string[]>([]);
  const [srvUseCases, setSrvUseCases] = useState<string[]>([]);
  const [srvTechnologies, setSrvTechnologies] = useState<string[]>([]);
  const [srvDeliverables, setSrvDeliverables] = useState<string[]>([]);
  
  const [newFeature, setNewFeature] = useState('');
  const [newAdvantage, setNewAdvantage] = useState('');
  const [newUseCase, setNewUseCase] = useState('');
  const [newTech, setNewTech] = useState('');
  const [newDeliverable, setNewDeliverable] = useState('');

  // CV Generator Management states
  const [cvFullName, setCvFullName] = useState("");
  const [cvJobTitle, setCvJobTitle] = useState("");
  const [cvAvatarUrl, setCvAvatarUrl] = useState("");
  const [cvSummary, setCvSummary] = useState("");
  const [cvEmail, setCvEmail] = useState("");
  const [cvPhone, setCvPhone] = useState("");
  const [cvLocation, setCvLocation] = useState("");
  const [cvGithub, setCvGithub] = useState("");
  const [cvLinkedin, setCvLinkedin] = useState("");
  const [cvWebsite, setCvWebsite] = useState("");
  const [cvShowWebsite, setCvShowWebsite] = useState(true);
  const [cvLanguages, setCvLanguages] = useState<{name: string, level: string}[]>([]);
  const [cvTemplate, setCvTemplate] = useState<'split' | 'modern' | 'executive' | 'bento'>('split');
  const [cvFontFamily, setCvFontFamily] = useState<'sans' | 'mono' | 'serif' | 'display'>('sans');
  const [cvColorTheme, setCvColorTheme] = useState<'midnight' | 'emerald' | 'royal' | 'berry'>('midnight');
  const [cvPaperBg, setCvPaperBg] = useState<'white' | 'cream' | 'mist' | 'amber' | 'grid' | 'slate'>('white');

  // Sub-tabs for ConfigCV
  const [cvSubTab, setCvSubTab] = useState<'defaults' | 'generated'>('defaults');
  const [generatedResumes, setGeneratedResumes] = useState<any[]>([]);
  const [isResumesLoading, setIsResumesLoading] = useState<boolean>(false);
  const [cvSearchTerm, setCvSearchTerm] = useState('');
  const [cvTemplateFilter, setCvTemplateFilter] = useState<'all' | 'split' | 'modern' | 'executive' | 'bento'>('all');
  const [cvSortField, setCvSortField] = useState<'fullName' | 'timestamp' | 'jobTitle' | 'template' | 'skillsCount' | 'experienceCount'>('timestamp');
  const [cvSortOrder, setCvSortOrder] = useState<'asc' | 'desc'>('desc');
  const [cvViewMode, setCvViewMode] = useState<'table' | 'grid'>('table');
  const [selectedInspectResume, setSelectedInspectResume] = useState<any | null>(null);
  const [cvAvatarFile, setCvAvatarFile] = useState<File | null>(null);
  const handleUpdateCvConfig = async () => {}; // fallback if not defined
  const [cvChartTab, setCvChartTab] = useState<'timeline' | 'templates' | 'colors'>('timeline');
  const [showCvVisualStats, setShowCvVisualStats] = useState<boolean>(true);

  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [voiceBgTriggerEnabled, setVoiceBgTriggerEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('voice_bg_trigger_enabled') === 'true';
    }
    return false;
  });
  const [voiceTriggerKeywords, setVoiceTriggerKeywords] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('voice_trigger_keywords') || 'dels, bonjour dels';
    }
    return 'dels, bonjour dels';
  });
  const [voiceStopKeywords, setVoiceStopKeywords] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('voice_stop_keywords') || "c'est bon, arrête, attend, stop";
    }
    return "c'est bon, arrête, attend, stop";
  });
  const [voiceMuteSpeak, setVoiceMuteSpeak] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('voice_mute_speak') === 'true';
    }
    return false;
  });

  const [voiceMacros, setVoiceMacros] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('voice_macros');
        return raw ? JSON.parse(raw) : [
          {
            id: 'macro-1',
            name: 'Prepare my tour',
            trigger: 'prepare my tour',
            actions: ['skills', 'projects', 'contact']
          },
          {
            id: 'macro-2',
            name: 'Prépare ma visite',
            trigger: 'prépare ma visite',
            actions: ['skills', 'projects', 'contact']
          }
        ];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [newMacroName, setNewMacroName] = useState('');
  const [newMacroTrigger, setNewMacroTrigger] = useState('');
  const [newMacroActions, setNewMacroActions] = useState<string[]>([]);
  const [editingMacroId, setEditingMacroId] = useState<string | null>(null);

  const allAvailableSections = [
    { value: 'home', label: 'Home / Accueil' },
    { value: 'about', label: 'About / Présentation' },
    { value: 'services', label: 'Services' },
    { value: 'skills', label: 'Skills / Compétences' },
    { value: 'certifications', label: 'Certifications' },
    { value: 'projects', label: 'Projects / Réalisations' },
    { value: 'experience', label: 'Experience / Parcours' },
    { value: 'pipeline', label: 'Data Pipeline' },
    { value: 'ml-playground', label: 'ML Playground' },
    { value: 'cv-generator', label: 'CV Generator / Logiciel de CV' },
    { value: 'terminal', label: 'Interactive Terminal / Console' },
    { value: 'blog', label: 'Blog / Articles' },
    { value: 'contact', label: 'Contact' }
  ];

  const [voiceHistory, setVoiceHistory] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('voice_command_history') || '[]';
        return JSON.parse(raw);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    const handleHistoryUpdate = () => {
      try {
        const raw = localStorage.getItem('voice_command_history') || '[]';
        setVoiceHistory(JSON.parse(raw));
      } catch (e) {
        console.warn("Could not load updated history", e);
      }
    };
    const handleSettingsUpdate = () => {
      if (typeof window !== 'undefined') {
        setVoiceMuteSpeak(localStorage.getItem('voice_mute_speak') === 'true');
        setVoiceBgTriggerEnabled(localStorage.getItem('voice_bg_trigger_enabled') === 'true');
        try {
          const raw = localStorage.getItem('voice_macros');
          if (raw) {
            setVoiceMacros(JSON.parse(raw));
          }
        } catch (e) {
          console.warn("Could not load updated macros from localstorage", e);
        }
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('voice_history_updated', handleHistoryUpdate);
      window.addEventListener('voice_settings_updated', handleSettingsUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('voice_history_updated', handleHistoryUpdate);
        window.removeEventListener('voice_settings_updated', handleSettingsUpdate);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const handleCvSort = (field: 'fullName' | 'timestamp' | 'jobTitle' | 'template' | 'skillsCount' | 'experienceCount') => {
    if (cvSortField === field) {
      setCvSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setCvSortField(field);
      setCvSortOrder('desc');
    }
  };

  // Fetch Homepage Config from API
  const fetchHomeConfig = async () => {
    try {
      const data = await fetchPortfolioConfig();
        if (data) {
        setHomeName(data.ownerName || '');
        setHomeTitlePrefix(data.ownerTitlePrefix || '');
        setHomeTitleSuffix(data.ownerTitleSuffix || '');
        setHomeProfilePic(data.profilePictureUrl || '');
        setContactEmail(data.ownerEmail || '');
        setContactPhone(data.ownerPhone || '');
        setContactLocation(data.ownerLocation || '');
        setContactGithub(data.githubUrl || '');
        setGithubUsernameState(data.githubUsername || 'delsDin');
        setGithubSyncEnabled(data.githubSyncEnabled !== false);
        setHasGithubToken(!!data.hasGithubToken);
        setGithubTokenState(data.hasGithubToken ? '••••••••' : '');
        if (data.githubExcludedRepos) {
          setGithubExcludedReposText(data.githubExcludedRepos.join(', '));
        } else {
          setGithubExcludedReposText('');
        }
        if (data.githubOrganizations) {
          setGithubOrganizationsText(data.githubOrganizations.join(', '));
        } else {
          setGithubOrganizationsText('');
        }
        if (data.githubCollaborators) {
          setGithubCollaboratorsText(data.githubCollaborators.join(', '));
        } else {
          setGithubCollaboratorsText('');
        }
        setGithubOnlyContributedCollab(data.githubOnlyContributedCollab !== false);
        if (data.githubReposCache) {
          setGithubFetchedRepos(data.githubReposCache);
        }
        setContactLinkedin(data.linkedinUrl || '');
        setContactWhatsapp(data.whatsappNumber || '');
        if (data.normalPhrases) {
          setHomePhrasesText(data.normalPhrases.join('\n'));
        }
        setAboutTitle(data.aboutTitle || 'À propos de moi');
        if (data.aboutParagraphs) {
          setAboutParagraphsText(data.aboutParagraphs.join('\n\n'));
        }
        if (data.aboutCitations) {
          setAboutCitationsText(data.aboutCitations.join('\n'));
        }
        if (data.services) {
          setServices(data.services);
        }
        if (data.skills) {
          setSkills(data.skills);
          if (data.skills.length > 0 && !selectedCategoryId) {
            setSelectedCategoryId(data.skills[0].id);
          }
        }
        if (data.projects) {
          setProjects(data.projects);
        }
        if (data.projectCategories && Array.isArray(data.projectCategories)) {
          setProjectCategories(data.projectCategories);
        }
        if (data.experiences && Array.isArray(data.experiences)) {
          setExperiences(data.experiences);
        }
        if (data.certifications && Array.isArray(data.certifications)) {
          setCertifications(data.certifications);
        }
        if (data.defaultResume) {
          const cv = data.defaultResume;
          setCvFullName(cv.fullName || "Alexandre Dupont");
          setCvJobTitle(cv.jobTitle || "Data Scientist Senior & Développeur Full-Stack");
          setCvAvatarUrl(cv.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop");
          setCvSummary(cv.summary || "");
          setCvEmail(cv.email || "");
          setCvPhone(cv.phone || "");
          setCvLocation(cv.location || "");
          setCvGithub(cv.github || "");
          setCvLinkedin(cv.linkedin || "");
          setCvWebsite(cv.website || "");
          setCvShowWebsite(cv.showWebsite !== undefined ? cv.showWebsite : true);
          setCvLanguages(cv.languages && Array.isArray(cv.languages) ? cv.languages : [
            { name: "Français", level: "Natif" },
            { name: "Anglais", level: "Professionnel (C1 - 945 TOEIC)" },
            { name: "Espagnol", level: "Intermédiaire (B2)" }
          ]);
          setCvTemplate(cv.template || 'split');
          setCvFontFamily(cv.fontFamily || 'sans');
          setCvColorTheme(cv.colorTheme || 'midnight');
          setCvPaperBg(cv.paperBg || 'white');
        } else {
          setCvFullName("");
          setCvJobTitle("");
          setCvAvatarUrl("");
          setCvSummary("");
          setCvEmail("");
          setCvPhone("");
          setCvLocation("");
          setCvGithub("");
          setCvLinkedin("");
          setCvWebsite("");
          setCvShowWebsite(true);
          setCvLanguages([]);
          setCvTemplate('split');
          setCvFontFamily('sans');
          setCvColorTheme('midnight');
          setCvPaperBg('white');
        }

        if (data.voiceBgTriggerEnabled !== undefined) {
          setVoiceBgTriggerEnabled(data.voiceBgTriggerEnabled);
          localStorage.setItem('voice_bg_trigger_enabled', String(data.voiceBgTriggerEnabled));
        }
        if (data.voiceTriggerKeywords) {
          setVoiceTriggerKeywords(data.voiceTriggerKeywords);
          localStorage.setItem('voice_trigger_keywords', data.voiceTriggerKeywords);
        }
        if (data.voiceStopKeywords) {
          setVoiceStopKeywords(data.voiceStopKeywords);
          localStorage.setItem('voice_stop_keywords', data.voiceStopKeywords);
        }
        if (data.voiceMacros) {
          setVoiceMacros(data.voiceMacros);
          localStorage.setItem('voice_macros', JSON.stringify(data.voiceMacros));
        }
        if (data.voiceHistory) {
          setVoiceHistory(data.voiceHistory);
          localStorage.setItem('voice_command_history', JSON.stringify(data.voiceHistory));
        }
      }
    } catch (e) {
      console.error("Error loaded general homepage configuration:", e);
    }
  };

  const fetchMaintenanceSettings = async () => {
    try {
      const data = await fetchMaintenanceConfig();
      if (data) {
        setMaintIsActive(data.isActive);
        setMaintStartDate(data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : '');
        setMaintReason(data.reason);
        setMaintAutoReopen(data.autoReopen);
        setMaintAutoReopenDate(data.autoReopenDate ? new Date(data.autoReopenDate).toISOString().slice(0, 16) : '');
        setMaintReopenDateText(data.reopenDate);
        setMaintReopenedAt(data.reopenedAt);
      }
    } catch (err) {
      console.error("Error loading maintenance config in dashboard:", err);
    }
  };

  const handleUpdateMaintenanceConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await saveMaintenanceConfig({
        isActive: maintIsActive,
        startDate: maintStartDate ? new Date(maintStartDate).toISOString() : undefined,
        reason: maintReason,
        autoReopen: maintAutoReopen,
        autoReopenDate: maintAutoReopen && maintAutoReopenDate ? new Date(maintAutoReopenDate).toISOString() : undefined,
        reopenDate: maintReopenDateText,
        reopenedAt: maintReopenedAt ? new Date(maintReopenedAt).toISOString() : undefined
      });

      if (res.ok) {
        showStatus("Configuration de maintenance enregistrée et synchronisée !", "success");
        window.dispatchEvent(new Event('portfolio_config_updated'));
      } else {
        showStatus(`Erreur de modification: ${res.error || 'Statut inconnu'}`, "err");
      }
    } catch (err) {
      showStatus("Erreur réseau de mise à jour.", "err");
    } finally {
      setIsLoading(false);
    }
  };

  const loadIncidentLogs = async () => {
    setIsLogsLoading(true);
    try {
      const logs = await fetchIncidentLogs();
      setIncidentLogs(logs);
    } catch (err) {
      console.error("Error loading incident logs:", err);
      showStatus("Impossible de charger les incidents.", "err");
    } finally {
      setIsLogsLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir effacer tous les incidents ?")) return;
    try {
      const res = await clearIncidentLogs();
      if (res.ok) {
        setIncidentLogs([]);
        showStatus("Logs d'incidents effacés avec succès !", "success");
        
        // Deactivate maintenance mode automatically
        const maintRes = await saveMaintenanceConfig({
          isActive: false,
          reopenedAt: new Date().toISOString()
        });
        if (maintRes.ok) {
          showStatus("Logs effacés. Mode maintenance désactivé !", "success");
          window.dispatchEvent(new Event('portfolio_config_updated'));
        }
      } else {
        showStatus("Erreur lors du vidage des logs.", "err");
      }
    } catch (err) {
      showStatus("Erreur réseau.", "err");
    }
  };

  const handleSettleIncident = async (id: string, currentSettled: boolean) => {
    try {
      const nextSettled = !currentSettled;
      const res = await settleIncidentLog(id, nextSettled);
      if (res.ok) {
        showStatus(currentSettled ? "Incident marqué comme non résolu." : "Incident marqué comme réglé !", "success");
        
        const updatedLogs = incidentLogs.map(log => log.id === id ? { ...log, settled: nextSettled } : log);
        setIncidentLogs(updatedLogs);

        // Check if there are any remaining unsettled critical incidents
        const hasActiveCritical = updatedLogs.some(log => log.severity === 'critical' && !log.settled);
        
        if (!hasActiveCritical && nextSettled) {
          // No more active critical incidents! Deactivate maintenance mode automatically
          const maintRes = await saveMaintenanceConfig({
            isActive: false,
            reopenedAt: new Date().toISOString()
          });
          if (maintRes.ok) {
            showStatus("Tous les incidents critiques sont réglés. Mode maintenance désactivé !", "success");
            window.dispatchEvent(new Event('portfolio_config_updated'));
          }
        }
      } else {
        showStatus("Impossible de mettre à jour le statut.", "err");
      }
    } catch (err) {
      showStatus("Erreur réseau lors de la mise à jour.", "err");
    }
  };

  const handleSimulateIncident = async (severity: 'info' | 'warning' | 'critical') => {
    try {
      showStatus(`Simulation d'un incident ${severity}...`, "success");
      await reportIncident({
        source: 'simulation_test',
        errorMessage: `Incident simulé de gravité : ${severity}`,
        errorStack: 'SimulationStackError: Tested inside Admin Dashboard\n  at handleSimulateIncident (AdminDashboard.tsx:930)',
        severity,
        metadata: {
          simulatedBy: 'admin',
          browser: navigator.userAgent
        }
      });
      showStatus("Incident simulé enregistré !", "success");
      
      // Reload logs
      loadIncidentLogs();
      
      // If critical, trigger reload/maintenance state check
      if (severity === 'critical') {
        window.dispatchEvent(new Event('portfolio_config_updated'));
      }
    } catch (err) {
      showStatus("Erreur lors de la simulation.", "err");
    }
  };



  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleImageFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleImageFile(file);
    }
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showStatus("Veuillez sélectionner un fichier image valide.", "err");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showStatus("L'image est trop lourde. Veuillez choisir une image de moins de 5 Mo.", "err");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setHomeProfilePic(event.target.result as string);
        showStatus("Photo de profil chargée localement ! Enregistrez pour synchroniser.", "success");
      }
    };
    reader.onerror = () => {
      showStatus("Erreur de décodage de l'image.", "err");
    };
    reader.readAsDataURL(file);
  };

  // Fetch visitor statistics from live API
  const fetchVisitStats = async () => {
    setIsStatsLoading(true);
    try {
      const { data, error } = await supabase.from('visits_stats').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        const loadedVisits = data;
        const totalVisits = loadedVisits.length;
        const uniqueIps = new Set(loadedVisits.map((v: any) => v.ip));
        const uniqueVisitors = uniqueIps.size;

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const visitsToday = loadedVisits.filter((v: any) => new Date(v.created_at).getTime() >= todayStart).length;

        // Group last 14 days
        const byDay: Array<{ date: string; visits: number; uniques: number }> = [];
        const localesMonths = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
        
        const oneDayMs = 24 * 60 * 60 * 1000;
        for (let i = 13; i >= 0; i--) {
          const targetDate = new Date(Date.now() - i * oneDayMs);
          const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
          const endOfDay = startOfDay + oneDayMs;

          const dayVisits = loadedVisits.filter((v: any) => {
            const t = new Date(v.created_at).getTime();
            return t >= startOfDay && t < endOfDay;
          });
          const dayUniques = new Set(dayVisits.map((v: any) => v.ip)).size;

          const formattedDate = `${targetDate.getDate()} ${localesMonths[targetDate.getMonth()]}`;
          byDay.push({
            date: formattedDate,
            visits: dayVisits.length,
            uniques: dayUniques
          });
        }

        // Group devices
        let mobile = 0;
        let tablet = 0;
        let desktop = 0;
        loadedVisits.forEach((v: any) => {
          const d = (v.device || v.user_agent || '').toLowerCase();
          if (d.includes("ipad") || d.includes("tablet")) {
            tablet++;
          } else if (d.includes("mobi") || d.includes("iphone") || d.includes("android")) {
            mobile++;
          } else {
            desktop++;
          }
        });
        const byDevice = [
          { name: "Ordinateur", value: desktop || 10 },
          { name: "Mobile", value: mobile || 5 },
          { name: "Tablette", value: tablet || 2 }
        ];

        // Group path/referrer
        const pathCounts: Record<string, number> = {};
        loadedVisits.forEach((v: any) => {
          const p = v.path || "Direct";
          pathCounts[p] = (pathCounts[p] || 0) + 1;
        });

        const byReferrer = Object.entries(pathCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6);

        // Group browsers
        let chrome = 0, safari = 0, firefox = 0, edge = 0, other = 0;
        loadedVisits.forEach((v: any) => {
          const b = (v.browser || v.user_agent || '').toLowerCase();
          if (b.includes("edg/")) edge++;
          else if (b.includes("firefox") && !b.includes("seamonkey")) firefox++;
          else if (b.includes("chrome") || b.includes("chromium")) chrome++;
          else if (b.includes("safari") && !b.includes("chrome") && !b.includes("chromium")) safari++;
          else other++;
        });

        const recentLogs = loadedVisits.slice(0, 50).map((v: any) => ({
          timestamp: new Date(v.created_at).getTime(),
          userAgent: v.user_agent || v.browser || 'Inconnu',
          referrer: v.path || 'Direct',
          ipHash: v.ip || "unknown"
        }));

        setVisitStats({
          totalVisits,
          uniqueVisitors,
          visitsToday,
          bounceRate: "42%", // Mock
          avgDuration: "2m 14s", // Mock
          byDay,
          byReferrer,
          byDevice,
          recentLogs
        });
      }
    } catch (e) {
      console.error("Error loaded visit statistics:", e);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const fetchAgentChatHistory = async () => {
    setIsAgentChatLoading(true);
    try {
      const { data, error } = await supabase
        .from('agent_chat_history')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      if (data) {
        // Group by session_id
        const grouped = data.reduce((acc: any, curr: any) => {
          if (!acc[curr.session_id]) {
            acc[curr.session_id] = { session_id: curr.session_id, messages: [] };
          }
          acc[curr.session_id].messages.push(curr);
          return acc;
        }, {});
        
        const sortedSessions = Object.values(grouped).sort((a: any, b: any) => {
          const lastMsgA = a.messages[a.messages.length - 1];
          const lastMsgB = b.messages[b.messages.length - 1];
          return new Date(lastMsgB.created_at).getTime() - new Date(lastMsgA.created_at).getTime();
        });
        
        setAgentChatHistory(sortedSessions);
      }
    } catch (e) {
      console.error("Error loading agent chat history:", e);
    } finally {
      setIsAgentChatLoading(false);
    }
  };

  // Fetch metrics & messages from live APIs
  const fetchAdminData = async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch Metrics (Fallback simulation if needed)
      // Since the backend is now fully Serverless/Supabase, we simulate telemetry metrics
      // or derive them from database rows.
      setMetrics({
        uptime: "99.99%",
        cpuUsage: "4.2%",
        memoryUsage: "128 MB",
        apiRequestsTotal: 14052,
        dbLatency: "12ms",
        activeConnections: 5,
        version: "2.1.0"
      });
      
      // 2. Fetch Visit Stats
      await fetchVisitStats();

      // 4. Fetch Received Contact Messages
      await fetchContactMessages();

      // 5. Fetch Generated Resumes List
      await fetchGeneratedResumes();

      // 6. Fetch Section Visibility
      const vis = await fetchSectionVisibility();
      if (vis) setVisibilitySettings(vis);
    } catch (e) {
      console.error("Error loaded administrative assets:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchContactMessages = async () => {
    setIsMessagesLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (data) {
        setContactMessages(data);
      }
    } catch (e) {
      console.error("Error loading contact messages:", e);
    } finally {
      setIsMessagesLoading(false);
    }
  };

  const fetchNewsletterSubscribers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setNewsletterSubscribers(data);
      }
    } catch (e) {
      console.error("Failed to load newsletter subscribers:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGeneratedResumes = async () => {
    setIsResumesLoading(true);
    try {
      const { data, error } = await supabase
        .from('generated_resumes')
        .select('*')
        .order('generated_at', { ascending: false });
        
      if (error) throw error;
      if (data) {
        setGeneratedResumes(data);
      }
    } catch (e) {
      console.error("Error loading generated resumes:", e);
    } finally {
      setIsResumesLoading(false);
    }
  };

  const handleDeleteGeneratedResume = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce CV de l'historique ?")) {
      return;
    }
    try {
      const { error } = await supabase
        .from('generated_resumes')
        .delete()
        .eq('id', id);
        
      if (!error) {
        setGeneratedResumes(prev => prev.filter(r => r.id !== id));
        showStatus("Le CV archivé a été supprimé avec succès !", "success");
      } else {
        showStatus(`Erreur lors de la suppression : ${error.message}`, "err");
      }
    } catch (e) {
      showStatus("Erreur de suppression.", "err");
    }
  };

  const handleToggleMessageRead = async (id: string, currentRead: boolean) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ read: !currentRead })
        .eq('id', id);
        
      if (!error) {
        setContactMessages(prev => prev.map(m => m.id === id ? { ...m, read: !currentRead } : m));
        showStatus(currentRead ? "Message marqué comme non lu !" : "Message marqué comme lu !", "success");
      } else {
        throw error;
      }
    } catch (e) {
      showStatus("Erreur lors de la modification du statut.", "err");
    }
  };

  const handleDeleteContactMessage = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer définitivement ce message ?")) return;
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);
        
      if (!error) {
        setContactMessages(prev => prev.filter(m => m.id !== id));
        showStatus("Message de contact supprimé.", "success");
      } else {
        showStatus(`Impossible de supprimer le message. ${error.message}`, "err");
      }
    } catch (e) {
      showStatus("Erreur de suppression du message de contact.", "err");
    }
  };

  const handleToggleExcludeRepo = (repoName: string) => {
    const list = githubExcludedReposText
      .split(',')
      .map(r => r.trim())
      .filter(r => r.length > 0);
    
    let newList;
    if (list.includes(repoName)) {
      newList = list.filter(r => r !== repoName);
    } else {
      newList = [...list, repoName];
    }
    setGithubExcludedReposText(newList.join(', '));
  };

  const handleSaveGithubConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const excludedRepos = githubExcludedReposText
        .split(',')
        .map(r => r.trim())
        .filter(r => r.length > 0);

      const orgs = githubOrganizationsText
        .split(',')
        .map(o => o.trim())
        .filter(o => o.length > 0);

      const collabs = githubCollaboratorsText
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const phraseArr = homePhrasesText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const { error: genError } = await supabase.from('general_info').upsert({
        id: 1,
        owner_name: homeName,
        owner_title_prefix: homeTitlePrefix,
        owner_title_suffix: homeTitleSuffix,
        normal_phrases: phraseArr,
        profile_picture_url: homeProfilePic
      });

      const { error: gitError } = await supabase.from('github_config').upsert({
        id: 1,
        username: githubUsername.trim(),
        token: githubToken,
        sync_enabled: githubSyncEnabled,
        excluded_repos: excludedRepos,
        organizations: orgs,
        collaborators: collabs,
        only_contributed_collab: githubOnlyContributedCollab
      });

      if (!genError && !gitError) {
        showStatus("Configuration GitHub enregistrée avec succès !", "success");
        fetchHomeConfig();
      } else {
        const err = genError || gitError;
        showStatus(err?.message || "Une erreur est survenue lors de l'enregistrement.", "err");
      }
    } catch (e) {
      showStatus("Erreur réseau lors de l'enregistrement.", "err");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerGithubSync = async () => {
    setIsSyncingGithub(true);
    try {
      const response = await fetch('/api/admin/github/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGithubFetchedRepos(data.repos || []);
          showStatus(`Synchronisation réussie ! ${data.count} projets importés et mis en cache.`, "success");
        } else {
          showStatus("Erreur inconnue de synchronisation.", "err");
        }
      } else {
        const err = await response.json();
        showStatus(err.error || "La synchronisation GitHub a échoué. Vérifiez vos identifiants.", "err");
      }
    } catch (e) {
      showStatus("Erreur réseau lors de la synchronisation de l'API.", "err");
    } finally {
      setIsSyncingGithub(false);
    }
  };

  const handleUpdateHomeConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeName.trim() || !homeTitlePrefix.trim() || !homeTitleSuffix.trim()) {
      showStatus("Champs obligatoires manquants pour l'Accueil.", "err");
      return;
    }

    const phraseArr = homePhrasesText
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (phraseArr.length === 0) {
      showStatus("Veuillez saisir au moins une phrase d'accroche/description.", "err");
      return;
    }

    setIsLoading(true);
    try {
      const parentPhrases = homePhrasesText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const parentParagraphs = aboutParagraphsText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const parentCitations = aboutCitationsText
        .split('\n')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const res = await saveToSupabase({
          ownerName: homeName.trim(),
          ownerTitlePrefix: homeTitlePrefix.trim(),
          ownerTitleSuffix: homeTitleSuffix.trim(),
          profilePictureUrl: homeProfilePic.trim(),
          normalPhrases: parentPhrases,
          aboutTitle: aboutTitle.trim() || 'À propos de moi',
          aboutParagraphs: parentParagraphs.length > 0 ? parentParagraphs : undefined,
          aboutCitations: parentCitations.length > 0 ? parentCitations : undefined,
          services: services,
          skills: skills,
          projects: projects
        }) as any;

      if (res.ok) {
        showStatus("Informations de la page d'Accueil enregistrées et synchronisées !", "success");
        window.dispatchEvent(new Event('portfolio_config_updated'));
      } else {
        const errorData = await res.json();
        showStatus(`Erreur de modification: ${errorData.error || 'Statut inconnu'}`, "err");
      }
    } catch (err) {
      showStatus("Erreur réseau de mise à jour.", "err");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAboutConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aboutTitle.trim()) {
      showStatus("Le titre de la section 'À propos d' est obligatoire.", "err");
      return;
    }

    const paraArr = aboutParagraphsText
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (paraArr.length === 0) {
      showStatus("Veuillez saisir au moins un paragraphe d'explication.", "err");
      return;
    }

    const citeArr = aboutCitationsText
      .split('\n')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (citeArr.length === 0) {
      showStatus("Veuillez saisir au moins une citation.", "err");
      return;
    }

    setIsLoading(true);
    try {
      const parentPhrases = homePhrasesText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const res = await saveToSupabase({
          ownerName: homeName.trim(),
          ownerTitlePrefix: homeTitlePrefix.trim(),
          ownerTitleSuffix: homeTitleSuffix.trim(),
          profilePictureUrl: homeProfilePic.trim(),
          normalPhrases: parentPhrases,
          aboutTitle: aboutTitle.trim(),
          aboutParagraphs: paraArr,
          aboutCitations: citeArr,
          services: services,
          skills: skills,
          projects: projects
        }) as any;

      if (res.ok) {
        showStatus("Informations 'À propos' enregistrées et synchronisées !", "success");
        window.dispatchEvent(new Event('portfolio_config_updated'));
      } else {
        const errorData = await res.json();
        showStatus(`Erreur de modification: ${errorData.error || 'Statut inconnu'}`, "err");
      }
    } catch (err) {
      showStatus("Erreur réseau de mise à jour.", "err");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateContactConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const parentPhrases = homePhrasesText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const res = await saveToSupabase({
          ownerName: homeName.trim(),
          ownerTitlePrefix: homeTitlePrefix.trim(),
          ownerTitleSuffix: homeTitleSuffix.trim(),
          profilePictureUrl: homeProfilePic.trim(),
          normalPhrases: parentPhrases,
          ownerEmail: contactEmail.trim(),
          ownerPhone: contactPhone.trim(),
          ownerLocation: contactLocation.trim(),
          githubUrl: contactGithub.trim(),
          linkedinUrl: contactLinkedin.trim(),
          whatsappNumber: contactWhatsapp.trim()
        }) as any;

      if (res.ok) {
        showStatus("Informations de contact enregistrées et synchronisées !", "success");
        window.dispatchEvent(new Event('portfolio_config_updated'));
      } else {
        const errorData = await res.json();
        showStatus(`Erreur de modification: ${errorData.error || 'Statut inconnu'}`, "err");
      }
    } catch (err) {
      showStatus("Erreur réseau de mise à jour des contacts.", "err");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCVConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const parentPhrases = homePhrasesText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const res = await saveToSupabase({
          ownerName: homeName.trim(),
          ownerTitlePrefix: homeTitlePrefix.trim(),
          ownerTitleSuffix: homeTitleSuffix.trim(),
          profilePictureUrl: homeProfilePic.trim(),
          normalPhrases: parentPhrases,
          defaultResume: {
            fullName: cvFullName.trim(),
            jobTitle: cvJobTitle.trim(),
            avatarUrl: cvAvatarUrl.trim(),
            summary: cvSummary.trim(),
            email: cvEmail.trim(),
            phone: cvPhone.trim(),
            location: cvLocation.trim(),
            github: cvGithub.trim(),
            linkedin: cvLinkedin.trim(),
            website: cvWebsite.trim(),
            showWebsite: cvShowWebsite,
            languages: cvLanguages,
            template: cvTemplate,
            fontFamily: cvFontFamily,
            colorTheme: cvColorTheme,
            paperBg: cvPaperBg
          }
        }) as any;

      if (res.ok) {
        showStatus("Configuration par défaut du Générateur de CV enregistrée avec succès !", "success");
        window.dispatchEvent(new Event('portfolio_config_updated'));
      } else {
        const errorData = await res.json();
        showStatus(`Erreur de modification: ${errorData.error || 'Statut inconnu'}`, "err");
      }
    } catch (err) {
      showStatus("Erreur réseau de mise à jour du CV.", "err");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateServices = async (updatedServices: any[]) => {
    setIsLoading(true);
    try {
      const parentPhrases = homePhrasesText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const parentParagraphs = aboutParagraphsText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const parentCitations = aboutCitationsText
        .split('\n')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const res = await saveToSupabase({
          ownerName: homeName.trim(),
          ownerTitlePrefix: homeTitlePrefix.trim(),
          ownerTitleSuffix: homeTitleSuffix.trim(),
          profilePictureUrl: homeProfilePic.trim(),
          normalPhrases: parentPhrases,
          aboutTitle: aboutTitle.trim() || 'À propos de moi',
          aboutParagraphs: parentParagraphs.length > 0 ? parentParagraphs : undefined,
          aboutCitations: parentCitations.length > 0 ? parentCitations : undefined,
          services: updatedServices,
          skills: skills,
          projects: projects
        }) as any;

      if (res.ok) {
        setServices(updatedServices);
        showStatus("La liste des services a été enregistrée avec succès !", "success");
        window.dispatchEvent(new Event('portfolio_config_updated'));
      } else {
        const errorData = await res.json();
        showStatus(`Erreur de modification: ${errorData.error || 'Statut inconnu'}`, "err");
      }
    } catch (err) {
      showStatus("Erreur réseau de mise à jour des services.", "err");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateVoiceConfig = async (
    bgEnabled: boolean,
    triggerKws: string,
    stopKws: string,
    macros?: any[],
    history?: any[]
  ) => {
    try {
      const res = await saveToSupabase({
        voiceConfig: {
          bgTriggerEnabled: bgEnabled,
          triggerKeywords: triggerKws,
          stopKeywords: stopKws,
          macros: macros !== undefined ? macros : voiceMacros,
          history: history !== undefined ? history : voiceHistory
        }
      }) as any;
      if (res.ok) {
        showStatus("Paramètres vocaux synchronisés avec succès !", "success");
      }
    } catch (err) {
      console.error(err);
      showStatus("Erreur de sauvegarde des paramètres vocaux.", "err");
    }
  };

  const handleUpdateSkills = async (updatedSkills: any[]) => {
    setIsLoading(true);
    try {
      const parentPhrases = homePhrasesText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const parentParagraphs = aboutParagraphsText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const parentCitations = aboutCitationsText
        .split('\n')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const res = await saveToSupabase({
          ownerName: homeName.trim(),
          ownerTitlePrefix: homeTitlePrefix.trim(),
          ownerTitleSuffix: homeTitleSuffix.trim(),
          profilePictureUrl: homeProfilePic.trim(),
          normalPhrases: parentPhrases,
          aboutTitle: aboutTitle.trim() || 'À propos de moi',
          aboutParagraphs: parentParagraphs.length > 0 ? parentParagraphs : undefined,
          aboutCitations: parentCitations.length > 0 ? parentCitations : undefined,
          services: services,
          skills: updatedSkills,
          projects: projects
        }) as any;

      if (res.ok) {
        setSkills(updatedSkills);
        showStatus("La liste des compétences a été mise à jour !", "success");
        window.dispatchEvent(new Event('portfolio_config_updated'));
      } else {
        const errorData = await res.json();
        showStatus(`Erreur de modification: ${errorData.error || 'Statut inconnu'}`, "err");
      }
    } catch (err) {
      showStatus("Erreur réseau de mise à jour des compétences.", "err");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryTitle.trim()) return;
    const catId = newCategoryTitle.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    if (skills.some(c => c.id === catId)) {
      showStatus("Une catégorie avec cet identifiant existe déjà.", "err");
      return;
    }
    const updatedSkills = [
      ...skills,
      {
        id: catId,
        title: newCategoryTitle.trim(),
        skills: []
      }
    ];
    await handleUpdateSkills(updatedSkills);
    setNewCategoryTitle('');
    setSelectedCategoryId(catId);
  };

  const handleUpdateCategoryTitle = async (catId: string) => {
    if (!editingCategoryTitle.trim()) return;
    const updatedSkills = skills.map(c => {
      if (c.id === catId) {
        return { ...c, title: editingCategoryTitle.trim() };
      }
      return c;
    });
    await handleUpdateSkills(updatedSkills);
    setEditingCategoryId(null);
    setEditingCategoryTitle('');
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie et toutes ses compétences ?")) {
      return;
    }
    const updatedSkills = skills.filter(c => c.id !== catId);
    await handleUpdateSkills(updatedSkills);
    if (selectedCategoryId === catId) {
      setSelectedCategoryId(updatedSkills[0]?.id || '');
    }
  };

  const handleAddSkill = async () => {
    if (!selectedCategoryId) return;
    if (!newSkillName.trim()) {
      showStatus("Veuillez saisir le nom de la compétence.", "err");
      return;
    }
    const updatedSkills = skills.map(c => {
      if (c.id === selectedCategoryId) {
        return {
          ...c,
          skills: [
            ...c.skills,
            { name: newSkillName.trim(), level: Number(newSkillLevel) }
          ]
        };
      }
      return c;
    });
    await handleUpdateSkills(updatedSkills);
    setNewSkillName('');
    setNewSkillLevel(80);
  };

  const handleUpdateSkill = async (index: number) => {
    if (!selectedCategoryId) return;
    if (!editingSkillName.trim()) {
      showStatus("Le nom ne peut pas être vide.", "err");
      return;
    }
    const updatedSkills = skills.map(c => {
      if (c.id === selectedCategoryId) {
        const newSkills = [...c.skills];
        newSkills[index] = { name: editingSkillName.trim(), level: Number(editingSkillLevel) };
        return { ...c, skills: newSkills };
      }
      return c;
    });
    await handleUpdateSkills(updatedSkills);
    setEditingSkillIndex(null);
    setEditingSkillName('');
    setEditingSkillLevel(80);
  };

  const handleDeleteSkill = async (index: number) => {
    if (!selectedCategoryId) return;
    if (!window.confirm("Supprimer cette compétence ?")) {
      return;
    }
    const updatedSkills = skills.map(c => {
      if (c.id === selectedCategoryId) {
        return {
          ...c,
          skills: c.skills.filter((_: any, idx: number) => idx !== index)
        };
      }
      return c;
    });
    await handleUpdateSkills(updatedSkills);
  };

  const handleUpdateProjects = async (updatedProjects: any[], updatedCategories: string[] = projectCategories) => {
    setIsLoading(true);
    try {
      const parentPhrases = homePhrasesText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const parentParagraphs = aboutParagraphsText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const parentCitations = aboutCitationsText
        .split('\n')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const res = await saveToSupabase({
          ownerName: homeName.trim(),
          ownerTitlePrefix: homeTitlePrefix.trim(),
          ownerTitleSuffix: homeTitleSuffix.trim(),
          profilePictureUrl: homeProfilePic.trim(),
          normalPhrases: parentPhrases,
          aboutTitle: aboutTitle.trim() || 'À propos de moi',
          aboutParagraphs: parentParagraphs.length > 0 ? parentParagraphs : undefined,
          aboutCitations: parentCitations.length > 0 ? parentCitations : undefined,
          services: services,
          skills: skills,
          projects: updatedProjects,
          projectCategories: updatedCategories
        }) as any;

      if (res.ok) {
        setProjects(updatedProjects);
        setProjectCategories(updatedCategories);
        showStatus("La configuration des projets et catégories a été mise à jour !", "success");
        window.dispatchEvent(new Event('portfolio_config_updated'));
      } else {
        const errorData = await res.json();
        showStatus(`Erreur de modification: ${errorData.error || 'Statut inconnu'}`, "err");
      }
    } catch (err) {
      showStatus("Erreur réseau de mise à jour.", "err");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProjCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newProjCategoryInput.trim();
    if (!cleanName) {
      showStatus("Le nom de la catégorie ne peut pas être vide.", "err");
      return;
    }
    if (projectCategories.includes(cleanName)) {
      showStatus("Cette catégorie existe déjà.", "err");
      return;
    }
    const updated = [...projectCategories, cleanName];
    await handleUpdateProjects(projects, updated);
    setNewProjCategoryInput('');
  };

  const handleDeleteProjCategory = async (catName: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${catName}" ?`)) {
      return;
    }
    const associatedProjects = projects.filter(p => p.category === catName);
    if (associatedProjects.length > 0) {
      if (!window.confirm(`Attention: ${associatedProjects.length} projet(s) sont classés dans cette catégorie. Continuer ? (Ils seront réaffectés à une autre catégorie disponible ou "Autres")`)) {
        return;
      }
    }

    const remainingCats = projectCategories.filter(cat => cat !== catName);
    const fallbackCategory = remainingCats[0] || 'Autres';
    
    const updatedProjects = projects.map(p => {
      if (p.category === catName) {
        return { ...p, category: fallbackCategory };
      }
      return p;
    });

    await handleUpdateProjects(updatedProjects, remainingCats);
  };

  const resetProjForm = () => {
    setEditingProjectId(null);
    setIsAddingProject(false);
    setProjId('');
    setProjTitle('');
    setProjCategory(projectCategories[0] || 'Dev');
    setProjImage('');
    setProjTechsText('');
    setProjDescription('');
    setProjDetails('');
    setProjGithub('');
    setProjDemo('');
    setProjStatus('published');
  };

  const handleEditProjectSelect = (proj: any) => {
    setEditingProjectId(proj.id);
    setIsAddingProject(true); // show the form
    setProjId(proj.id);
    setProjTitle(proj.title || '');
    setProjCategory(proj.category || 'Dev');
    setProjImage(proj.image || '');
    setProjTechsText(Array.isArray(proj.techs) ? proj.techs.join(', ') : '');
    setProjDescription(proj.description || '');
    setProjDetails(proj.details || '');
    setProjGithub(proj.github || '');
    setProjDemo(proj.demo || '');
    setProjStatus(proj.status || 'published');
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) {
      showStatus("Le titre du projet est obligatoire.", "err");
      return;
    }
    if (!projDescription.trim()) {
      showStatus("La description courte est obligatoire.", "err");
      return;
    }

    const targetId = editingProjectId !== null ? editingProjectId : (projId || Date.now());
    const newProj = {
      id: typeof targetId === 'number' ? targetId : String(targetId).trim(),
      title: projTitle.trim(),
      category: projCategory.trim(),
      image: projImage.trim() || `https://picsum.photos/seed/${encodeURIComponent(projTitle)}/800/600`,
      techs: projTechsText.split(',').map(t => t.trim()).filter(Boolean),
      description: projDescription.trim(),
      details: projDetails.trim(),
      github: projGithub.trim() || '#',
      demo: projDemo.trim() || '#',
      status: projStatus
    };

    let updatedProjects;
    if (editingProjectId !== null) {
      updatedProjects = projects.map(p => p.id === editingProjectId ? newProj : p);
    } else {
      // Check if ID is unique
      if (projects.some(p => p.id === newProj.id)) {
        showStatus("Un projet avec cet identifiant existe déjà.", "err");
        return;
      }
      updatedProjects = [...projects, newProj];
    }

    await handleUpdateProjects(updatedProjects);
    resetProjForm();
  };

  const handleDeleteProject = async (id: string | number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        showStatus(`Erreur de suppression : ${error.message}`, "err");
      } else {
        const updatedProjects = projects.filter(p => p.id !== id);
        setProjects(updatedProjects);
        showStatus("Projet supprimé avec succès !", "success");
        window.dispatchEvent(new Event('portfolio_config_updated'));
      }
    } catch (err: any) {
      showStatus("Erreur réseau lors de la suppression.", "err");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateExperiences = async (updatedExperiences: any[]) => {
    setIsLoading(true);
    try {
      const parentPhrases = homePhrasesText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const parentParagraphs = aboutParagraphsText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const parentCitations = aboutCitationsText
        .split('\n')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const res = await saveToSupabase({
          ownerName: homeName.trim(),
          ownerTitlePrefix: homeTitlePrefix.trim(),
          ownerTitleSuffix: homeTitleSuffix.trim(),
          profilePictureUrl: homeProfilePic.trim(),
          normalPhrases: parentPhrases,
          aboutTitle: aboutTitle.trim() || 'À propos de moi',
          aboutParagraphs: parentParagraphs.length > 0 ? parentParagraphs : undefined,
          aboutCitations: parentCitations.length > 0 ? parentCitations : undefined,
          services: services,
          skills: skills,
          projects: projects,
          projectCategories: projectCategories,
          experiences: updatedExperiences
        }) as any;

      if (res.ok) {
        setExperiences(updatedExperiences);
        showStatus("La configuration des expériences a été mise à jour !", "success");
        window.dispatchEvent(new Event('portfolio_config_updated'));
      } else {
        const errorData = await res.json();
        showStatus(`Erreur de modification: ${errorData.error || 'Statut inconnu'}`, "err");
      }
    } catch (err) {
      showStatus("Erreur réseau de mise à jour des expériences.", "err");
    } finally {
      setIsLoading(false);
    }
  };

  const resetExperienceForm = () => {
    setEditingExperienceId(null);
    setIsAddingExperience(false);
    setExpId('');
    setExpRole('');
    setExpCompany('');
    setExpPeriod('');
    setExpDescriptionText('');
    setExpDetails('');
    setExpTechnologiesText('');
    setExpAchievementsText('');
    setExpStatus('published');
  };

  const handleEditExperienceSelect = (exp: any) => {
    setEditingExperienceId(exp.id);
    setIsAddingExperience(true);
    setExpId(exp.id || '');
    setExpRole(exp.role || '');
    setExpCompany(exp.company || '');
    setExpPeriod(exp.period || '');
    setExpDescriptionText(Array.isArray(exp.description) ? exp.description.join('\n') : '');
    setExpDetails(exp.details || '');
    setExpTechnologiesText(Array.isArray(exp.technologies) ? exp.technologies.join(', ') : '');
    setExpAchievementsText(Array.isArray(exp.achievements) ? exp.achievements.join('\n') : '');
    setExpStatus(exp.status || 'published');
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expRole.trim() || !expCompany.trim() || !expPeriod.trim()) {
      showStatus("Le rôle, l'entreprise et la période sont obligatoires.", "err");
      return;
    }

    const targetId = editingExperienceId !== null ? editingExperienceId : (expId || Date.now());
    const newExp = {
      id: typeof targetId === 'number' ? targetId : String(targetId).trim(),
      role: expRole.trim(),
      company: expCompany.trim(),
      period: expPeriod.trim(),
      description: expDescriptionText.split('\n').map(l => l.trim()).filter(Boolean),
      details: expDetails.trim(),
      technologies: expTechnologiesText.split(',').map(t => t.trim()).filter(Boolean),
      achievements: expAchievementsText.split('\n').map(a => a.trim()).filter(Boolean),
      status: expStatus
    };

    let updatedExperiences;
    if (editingExperienceId !== null) {
      updatedExperiences = experiences.map(e => e.id === editingExperienceId ? newExp : e);
    } else {
      updatedExperiences = [...experiences, newExp];
    }

    await handleUpdateExperiences(updatedExperiences);
    resetExperienceForm();
  };

  const handleDeleteExperience = async (id: string | number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette expérience ?")) {
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id);

      if (error) {
        showStatus(`Erreur de suppression : ${error.message}`, "err");
      } else {
        const updatedExperiences = experiences.filter(e => e.id !== id);
        setExperiences(updatedExperiences);
        showStatus("Expérience supprimée avec succès !", "success");
        window.dispatchEvent(new Event('portfolio_config_updated'));
      }
    } catch (err: any) {
      showStatus("Erreur réseau lors de la suppression.", "err");
    } finally {
      setIsLoading(false);
    }
  };

  const resetCertificationForm = () => {
    setCertId('');
    setCertTitle('');
    setCertIssuer('');
    setCertDate('');
    setCertCredentialId('');
    setCertCategory('cloud-data');
    setCertSkillsText('');
    setCertDescription('');
    setCertVerifyUrl('');
    setCertLogoColor('from-blue-600 via-blue-400 to-indigo-500');
    setCertStatus('published');
    setCertAttachmentUrl('');
    setCertAttachmentType('');
    setCertUploadError('');
    setEditingCertificationId(null);
    setIsAddingCertification(false);
  };

  const handleEditCertificationSelect = (cert: any) => {
    setEditingCertificationId(cert.id);
    setIsAddingCertification(true);
    setCertId(cert.id || '');
    setCertTitle(cert.title || '');
    setCertIssuer(cert.issuer || '');
    setCertDate(cert.date || '');
    setCertCredentialId(cert.credentialId || '');
    setCertCategory(cert.category || 'cloud-data');
    setCertSkillsText(Array.isArray(cert.skills) ? cert.skills.join(', ') : '');
    setCertDescription(cert.description || '');
    setCertVerifyUrl(cert.verifyUrl || '');
    setCertLogoColor(cert.logoColor || 'from-blue-600 via-blue-400 to-indigo-500');
    setCertStatus(cert.status || 'published');
    setCertAttachmentUrl(cert.attachmentUrl || '');
    setCertAttachmentType(cert.attachmentType || '');
    setCertUploadError('');
  };

  const handleUpdateCertifications = async (updatedCertifications: any[]) => {
    setIsLoading(true);
    try {
      const parentPhrases = homePhrasesText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const parentParagraphs = aboutParagraphsText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const parentCitations = aboutCitationsText
        .split('\n')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const res = await saveToSupabase({
          ownerName: homeName.trim(),
          ownerTitlePrefix: homeTitlePrefix.trim(),
          ownerTitleSuffix: homeTitleSuffix.trim(),
          profilePictureUrl: homeProfilePic.trim(),
          normalPhrases: parentPhrases,
          aboutTitle: aboutTitle.trim() || 'À propos de moi',
          aboutParagraphs: parentParagraphs.length > 0 ? parentParagraphs : undefined,
          aboutCitations: parentCitations.length > 0 ? parentCitations : undefined,
          services: services,
          skills: skills,
          projects: projects,
          projectCategories: projectCategories,
          experiences: experiences,
          certifications: updatedCertifications
        }) as any;

      if (res.ok) {
        setCertifications(updatedCertifications);
        showStatus("La configuration des certifications a été mise à jour !", "success");
        window.dispatchEvent(new Event('portfolio_config_updated'));
      } else {
        const errorData = await res.json();
        showStatus(`Erreur de modification: ${errorData.error || 'Statut inconnu'}`, "err");
      }
    } catch (err) {
      showStatus("Erreur réseau de mise à jour.", "err");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setCertUploadError("Le fichier est trop volumineux (max 5 Mo). Pour conserver de bonnes performances, de préférence compressez-le.");
      return;
    }
    
    setCertUploadError("");
    setCertIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCertAttachmentUrl(dataUrl);
        setCertAttachmentType(file.type.includes("pdf") ? "pdf" : "image");
      }
      setCertIsUploading(false);
    };
    reader.onerror = () => {
      setCertUploadError("Erreur lors de la lecture du fichier.");
      setCertIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certTitle.trim() || !certIssuer.trim() || !certDate.trim()) {
      showStatus("Le titre, l'émetteur et la date sont obligatoires.", "err");
      return;
    }

    const targetId = editingCertificationId !== null ? editingCertificationId : (certId.trim() || 'cert-' + Date.now());
    const newCert = {
      id: targetId,
      title: certTitle.trim(),
      issuer: certIssuer.trim(),
      date: certDate.trim(),
      credentialId: certCredentialId.trim() || 'N/A',
      category: certCategory,
      skills: certSkillsText.split(',').map(s => s.trim()).filter(Boolean),
      description: certDescription.trim(),
      verifyUrl: certVerifyUrl.trim() || '#',
      logoColor: certLogoColor.trim(),
      status: certStatus,
      attachmentUrl: certAttachmentUrl,
      attachmentType: certAttachmentType
    };

    let updatedCertifications;
    if (editingCertificationId !== null) {
      updatedCertifications = certifications.map(c => c.id === editingCertificationId ? newCert : c);
    } else {
      updatedCertifications = [...certifications, newCert];
    }

    await handleUpdateCertifications(updatedCertifications);
    resetCertificationForm();
  };

  const handleDeleteCertification = async (id: string | number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette certification ?")) {
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('certifications')
        .delete()
        .eq('id', id);

      if (error) {
        showStatus(`Erreur de suppression : ${error.message}`, "err");
      } else {
        const updatedCertifications = certifications.filter(c => c.id !== id);
        setCertifications(updatedCertifications);
        showStatus("Certification supprimée avec succès !", "success");
        window.dispatchEvent(new Event('portfolio_config_updated'));
      }
    } catch (err: any) {
      showStatus("Erreur réseau lors de la suppression.", "err");
    } finally {
      setIsLoading(false);
    }
  };

  const resetSrvForm = () => {
    setSrvId('');
    setSrvTitle('');
    setSrvDescription('');
    setSrvLongDescription('');
    setSrvIconName('chart');
    setSrvColor('bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400');
    setSrvDuration('');
    setSrvFeatures([]);
    setSrvAdvantages([]);
    setSrvUseCases([]);
    setSrvTechnologies([]);
    setSrvDeliverables([]);
    setNewFeature('');
    setNewAdvantage('');
    setNewUseCase('');
    setNewTech('');
    setNewDeliverable('');
    setEditingServiceId(null);
    setIsAddingService(false);
  };

  const startEditService = (srv: any) => {
    setSrvId(srv.id || '');
    setSrvTitle(srv.title || '');
    setSrvDescription(srv.description || '');
    setSrvLongDescription(srv.longDescription || '');
    setSrvIconName(srv.iconName || 'chart');
    setSrvColor(srv.color || 'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400');
    setSrvDuration(srv.duration || '');
    setSrvFeatures([...(srv.features || [])]);
    setSrvAdvantages([...(srv.advantages || [])]);
    setSrvUseCases([...(srv.useCases || [])]);
    setSrvTechnologies([...(srv.technologies || [])]);
    setSrvDeliverables([...(srv.deliverables || [])]);
    
    setEditingServiceId(srv.id);
    setIsAddingService(false);
  };

  const startAddService = () => {
    resetSrvForm();
    setSrvId('service-' + Date.now().toString(36));
    setIsAddingService(true);
  };

  const addListItem = (
    item: string, 
    setItem: React.Dispatch<React.SetStateAction<string>>, 
    list: string[], 
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (item.trim()) {
      setList([...list, item.trim()]);
      setItem('');
    }
  };

  const removeListItem = (
    index: number, 
    list: string[], 
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(list.filter((_, idx) => idx !== index));
  };

  const handleSaveServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvId.trim() || !srvTitle.trim() || !srvDescription.trim()) {
      showStatus("Veuillez remplir au moins l'ID, le Titre et la Description.", "err");
      return;
    }
    
    const newServiceObj = {
      id: srvId.trim(),
      title: srvTitle.trim(),
      description: srvDescription.trim(),
      longDescription: srvLongDescription.trim(),
      iconName: srvIconName,
      color: srvColor,
      duration: srvDuration.trim(),
      features: srvFeatures,
      advantages: srvAdvantages,
      useCases: srvUseCases,
      technologies: srvTechnologies,
      deliverables: srvDeliverables,
    };

    let updatedList = [];
    if (editingServiceId) {
      updatedList = services.map(s => s.id === editingServiceId ? newServiceObj : s);
    } else {
      if (services.some(s => s.id === newServiceObj.id)) {
        showStatus("Un service avec cet identifiant existe déjà.", "err");
        return;
      }
      updatedList = [...services, newServiceObj];
    }
    
    await handleUpdateServices(updatedList);
    resetSrvForm();
  };

  const handleDeleteService = async (idToDelete: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible.")) {
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', idToDelete);

      if (error) {
        showStatus(`Erreur de suppression : ${error.message}`, "err");
      } else {
        const updatedList = services.filter(s => s.id !== idToDelete);
        setServices(updatedList);
        showStatus("Service supprimé avec succès !", "success");
        window.dispatchEvent(new Event('portfolio_config_updated'));
      }
    } catch (err: any) {
      showStatus("Erreur réseau lors de la suppression.", "err");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    setIsTestimonialsLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        showStatus(`Erreur de chargement des témoignages: ${error.message}`, "err");
      } else {
        setTestimonials(data || []);
      }
    } catch (err: any) {
      showStatus("Erreur réseau de chargement des témoignages.", "err");
    } finally {
      setIsTestimonialsLoading(false);
    }
  };

  const resetTestimonialForm = () => {
    setEditingTestimonialId(null);
    setIsAddingTestimonial(false);
    setTestName('');
    setTestRole('');
    setTestMessage('');
    setTestAvatar('');
    setTestIsActive(true);
  };

  const handleEditTestimonialSelect = (t: any) => {
    setEditingTestimonialId(t.id);
    setIsAddingTestimonial(true);
    setTestName(t.name);
    setTestRole(t.role);
    setTestMessage(t.message);
    setTestAvatar(t.avatar);
    setTestIsActive(t.is_active !== false);
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) {
      showStatus("Le nom du témoin est obligatoire.", "err");
      return;
    }
    if (!testMessage.trim()) {
      showStatus("Le message est obligatoire.", "err");
      return;
    }

    setIsLoading(true);
    try {
      const finalAvatar = testAvatar.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(testName)}&background=f59e0b&color=fff&bold=true`;
      
      const payload: any = {
        name: testName.trim(),
        role: testRole.trim() || 'Client',
        message: testMessage.trim(),
        avatar: finalAvatar,
        is_active: testIsActive
      };

      if (editingTestimonialId !== null) {
        payload.id = editingTestimonialId;
      }

      const { error } = await supabase
        .from('testimonials')
        .upsert(payload);

      if (error) {
        showStatus(`Erreur d'enregistrement: ${error.message}`, "err");
      } else {
        showStatus("Témoignage enregistré avec succès !", "success");
        resetTestimonialForm();
        await fetchTestimonials();
        window.dispatchEvent(new Event('portfolio_config_updated'));
      }
    } catch (err: any) {
      showStatus("Erreur réseau d'enregistrement.", "err");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTestimonial = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce témoignage ? Cette action est irréversible.")) {
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
      
      if (error) {
        showStatus(`Erreur de suppression: ${error.message}`, "err");
      } else {
        showStatus("Témoignage supprimé avec succès !", "success");
        await fetchTestimonials();
        window.dispatchEvent(new Event('portfolio_config_updated'));
      }
    } catch (err) {
      showStatus("Erreur réseau de suppression.", "err");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActiveTestimonial = async (t: any) => {
    setIsLoading(true);
    try {
      const nextActiveState = t.is_active === false ? true : false;
      const { error } = await supabase
        .from('testimonials')
        .update({ is_active: nextActiveState })
        .eq('id', t.id);

      if (error) {
        showStatus(`Erreur de modération: ${error.message}`, "err");
      } else {
        showStatus(nextActiveState ? "Témoignage activé et visible !" : "Témoignage masqué !", "success");
        await fetchTestimonials();
        window.dispatchEvent(new Event('portfolio_config_updated'));
      }
    } catch (err) {
      showStatus("Erreur réseau de modération.", "err");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestimonialFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        showStatus("Veuillez sélectionner un fichier image valide.", "err");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showStatus("L'image est trop lourde. Choisissez une image de moins de 2 Mo.", "err");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTestAvatar(event.target.result as string);
          showStatus("Avatar chargé !", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (isAdminMode && isAuthenticated) {
      fetchAdminData();
      fetchHomeConfig();
      fetchMaintenanceSettings();
      loadIncidentLogs();
      
      // Setup live refresh interval for metrics & telemetry charts
      const interval = setInterval(() => {
        // Refresh metrics values subtly
        setMetrics(prev => {
          if (!prev) return null;
          return {
            ...prev,
            cpuUsage: (Math.random() * 15 + 4).toFixed(1) + "%",
            activeConnections: Math.max(1, prev.activeConnections + (Math.random() > 0.5 ? 1 : -1))
          };
        });

        // Add a new raw point to chart data to show real dynamics
        setChartData(prev => {
          const currentHour = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          const nextOps = Math.floor(Math.random() * 40) + 40;
          const nextLat = parseFloat((Math.random() * 0.6 + 1.0).toFixed(2));
          const updated = [...prev.slice(1), { name: currentHour, ops: nextOps, latency: nextLat }];
          return updated;
        });

      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isAdminMode, isAuthenticated]);

  // NOTE: admin_notifications real-time subscription is handled inside TelemetryPanel
  // to avoid duplicate channel conflicts with Supabase Realtime.

  const handleLogout = () => {
    setIsAdminMode(false);
    localStorage.removeItem("admin_token");
  };

  const showStatus = (text: string, type: 'success' | 'err') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage({ text: '', type: '' });
    }, 4000);
  };


  const filteredResumes = generatedResumes
    .filter(r => {
      const term = cvSearchTerm.toLowerCase();
      const matchesSearch = 
        (r.fullName || '').toLowerCase().includes(term) ||
        (r.jobTitle || '').toLowerCase().includes(term) ||
        (r.email || '').toLowerCase().includes(term) ||
        (r.summary || '').toLowerCase().includes(term);

      const matchesTemplate = cvTemplateFilter === 'all' || r.template === cvTemplateFilter;

      return matchesSearch && matchesTemplate;
    })
    .sort((a, b) => {
      let valA = a[cvSortField];
      let valB = b[cvSortField];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      let comparison = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else if (cvSortField === 'timestamp') {
        const dateA = new Date(valA).getTime() || 0;
        const dateB = new Date(valB).getTime() || 0;
        comparison = dateA - dateB;
      } else {
        comparison = String(valA).toLowerCase().localeCompare(String(valB).toLowerCase());
      }

      return cvSortOrder === 'asc' ? comparison : -comparison;
    });

  if (!isAdminMode) return null;

  if (!isAuthenticated) {
    const isEn = typeof window !== 'undefined' && (localStorage.getItem('voice_lang_preference') || 'fr').startsWith('en');
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:32px_32px] opacity-10 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden backdrop-blur-md"
          >
            <div className="flex flex-col items-center text-center gap-2 mb-5">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl animate-pulse">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black font-mono tracking-wider uppercase text-white">
                  {isEn ? "SECURE ADMIN AREA" : "ZONE ACCÈS COMPILATEUR"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-normal">
                  {isEn 
                    ? "Enter the secure administration password to unlock the core system dashboard."
                    : "Saisissez le mot de passe d’administration pour accéder aux commandes du système général."}
                </p>
              </div>
            </div>

            <form onSubmit={handleAuthenticate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  {isEn ? "SYSTEM PASSWORD" : "MOT DE PASSE SYSTEME"}
                </label>
                <input
                  type="password"
                  placeholder="Password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500/60 transition-colors font-mono"
                />
              </div>

              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] text-center font-medium font-sans"
                >
                  ⚠️ {authError}
                </motion.div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdminMode(false)}
                  className="flex-1 py-2 px-3 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition-all text-[11px] font-bold font-mono uppercase tracking-wider cursor-pointer"
                >
                  {isEn ? "Cancel" : "Annuler"}
                </button>
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition-all text-[11px] font-black font-mono uppercase tracking-wider shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/15 flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  {isAuthenticating ? (
                    <RefreshCw size={11} className="animate-spin" />
                  ) : (
                    <span>{isEn ? "Unlock" : "Déverrouiller"}</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const adminTabs = [
    { value: 'telemetry', label: 'TÉLÉMÉTRIE' },
    { value: 'stats', label: 'STATS VISITES', action: () => { fetchVisitStats(); } },
    { value: 'visibility', label: 'VISIBILITÉ SECTIONS' },
    { value: 'configAccess', label: 'ACCÈS & SÉCURITÉ' },
    { value: 'configHome', label: 'ACCUEIL' },
    { value: 'configAbout', label: 'À PROPOS' },
    { value: 'configServices', label: 'SERVICES' },
    { value: 'configSkills', label: 'SKILLS' },
    { value: 'configProjects', label: 'PROJETS' },
    { value: 'configExperiences', label: 'EXPÉRIENCES' },
    { value: 'configCertifications', label: 'CERTIFICATIONS' },
    { value: 'configContact', label: 'CONTACT & LIENS' },
    { value: 'configGithub', label: 'CONFIG GITHUB' },
    { value: 'configCV', label: 'CONFIG CV' },
    { value: 'configVoice', label: 'CONFIG AUDIO' },
    { value: 'contactMessages', label: 'MESSAGES REÇUS' },
    { value: 'newsletter', label: 'ABONNÉS NEWSLETTER', action: () => { fetchNewsletterSubscribers(); } },
    { value: 'agentChat', label: 'HISTORIQUE CHAT IA', action: () => { fetchAgentChatHistory(); } },
    { value: 'blog', label: 'BLOG & POSTS' },
    { value: 'configTestimonials', label: 'TÉMOIGNAGES', action: () => { fetchTestimonials(); } },
    { value: 'maintenance', label: 'MAINTENANCE', action: () => { fetchMaintenanceSettings(); } },
    { value: 'incidentLogs', label: 'ALERTES & LOGS', action: () => { loadIncidentLogs(); } }
  ];

  const currentTabObj = adminTabs.find(tab => tab.value === activeTab) || adminTabs[0];

  return (
    <>
      <AnimatePresence>
        <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
      >
        <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-6xl shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
          
          {/* Animated cosmic grid background decor */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none" />
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* 1. Dashboard Window Bar - Centered Navigation Menus */}
          <div className="relative border-b border-slate-850 bg-slate-950/90 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-20">
            
            {/* Hamburger controller for responsive navigation (shown everywhere now) */}
            <div className="flex items-center relative z-30 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                className="flex items-center gap-2.5 px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer shadow-md select-none"
              >
                <div className="text-emerald-400 flex items-center">
                  {isAdminMenuOpen ? <X size={15} /> : <Menu size={15} />}
                </div>
                
                <span className="font-mono text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5">
                  {currentTabObj.label}
                  {currentTabObj.value === 'contactMessages' && contactMessages.filter((m: any) => !m.read).length > 0 && (
                    <span className="bg-rose-500 text-white font-mono text-[8px] px-1.5 py-0.5 rounded-full">
                      {contactMessages.filter((m: any) => !m.read).length}
                    </span>
                  )}
                </span>
                
                <ChevronDown size={12} className={`text-slate-500 transition-transform duration-200 ${isAdminMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Overlay */}
              <AnimatePresence>
                {isAdminMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 flex flex-col gap-1 max-h-[60vh] overflow-y-auto"
                  >
                    <div className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase px-2 py-1 mb-1 border-b border-slate-900">
                      Menu d'Administration
                    </div>
                    {adminTabs.map((tab) => {
                      const isActive = activeTab === tab.value;
                      const isContactMessages = tab.value === 'contactMessages';
                      const unreadCount = isContactMessages ? contactMessages.filter((m: any) => !m.read).length : 0;
                      
                      return (
                        <button
                          key={tab.value}
                          type="button"
                          onClick={() => {
                            setActiveTab(tab.value as any);
                            if (tab.action) tab.action();
                            setIsAdminMenuOpen(false); // Close menu on click
                          }}
                          className={`flex items-center justify-between w-full px-3.5 py-2 font-mono text-[10.5px] font-bold tracking-wider uppercase rounded-xl transition-all cursor-pointer text-left ${
                            isActive
                              ? isContactMessages
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'text-slate-400 hover:text-slate-200 border border-transparent hover:bg-slate-900/50'
                          }`}
                        >
                          <span>{tab.label}</span>
                          {unreadCount > 0 && (
                            <span className="bg-rose-500 text-white font-mono text-[8px] font-normal px-1.5 py-0.5 rounded-full leading-none shrink-0 animate-pulse">
                              {unreadCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Actions (Refresh, Logout, Notify Sound & Popover) */}
            <div className="flex items-center gap-2 max-sm:justify-end relative">
              
              {/* Audio Mute Alert control */}
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isMuted 
                    ? 'bg-red-550/10 border-red-500/20 text-red-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
                title={isMuted ? "Activer les alertes sonores" : "Couper le son des alertes"}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>

              {/* Real-time alerts bell controller */}
              <button
                type="button"
                onClick={() => setIsNotifCenterOpen(!isNotifCenterOpen)}
                className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
                  isNotifCenterOpen 
                    ? 'bg-indigo-950/40 border-indigo-505/40 text-indigo-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
                title="Moniteur de notifications temps réel"
              >
                <Bell size={14} className={adminNotifications.some(n => !n.read) ? 'animate-bounce' : ''} />
                {adminNotifications.some(n => !n.read) && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-slate-950" />
                )}
              </button>

              <button
                type="button"
                onClick={fetchAdminData}
                disabled={isRefreshing}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer"
                title="Rafraîchir les données"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 font-mono font-black text-[10px] tracking-wider uppercase text-red-400 bg-red-950/20 hover:bg-red-500 hover:text-white border border-red-500/25 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <X size={12} />
                <span>QUITTER SESSION</span>
              </button>

              {/* Notification Center Popover */}
              <AnimatePresence>
                {isNotifCenterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 top-full mt-3 w-[340px] bg-slate-950/98 border border-slate-850 rounded-2xl shadow-2xl p-4 z-50 flex flex-col gap-3 font-sans"
                  >
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Bell size={12} className="text-indigo-400" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-250">
                          Alertes d'activité
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {adminNotifications.length > 0 && (
                          <button
                            onClick={async () => {
                              try {
                                await supabase.from('admin_notifications').update({ is_read: true }).neq('is_read', true);
                                setAdminNotifications(prev => prev.map(n => ({ ...n, read: true })));
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                            className="text-[9px] font-bold text-indigo-450 hover:text-indigo-350 hover:underline cursor-pointer uppercase"
                          >
                            Tout Lu
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            try {
                              await supabase.from('admin_notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                              setAdminNotifications([]);
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="text-[9px] font-bold text-rose-450 hover:text-rose-350 hover:underline cursor-pointer uppercase"
                        >
                          Vider
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {adminNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-1.5 text-center">
                          <ShieldCheck size={28} className="text-emerald-500/60" />
                          <div className="text-[10px] font-bold font-mono text-slate-400">STATUT DU PORTFOLIO SÉCURISÉ</div>
                          <p className="text-[10px] max-w-[200px] leading-relaxed select-none">
                            Aucune alerte suspecte ou événement récent détecté pour le moment.
                          </p>
                        </div>
                      ) : (
                        adminNotifications.map((notif) => {
                          const isSuspicious = notif.type === 'suspicious';
                          const isMsg = notif.type === 'new_message';
                          
                          return (
                            <div
                              key={notif.id}
                              className={`p-2.5 rounded-xl border transition-colors flex gap-2 relative overflow-hidden select-text cursor-pointer ${
                                !notif.read 
                                  ? isSuspicious
                                    ? 'bg-red-500/5 border-red-500/35'
                                    : 'bg-slate-900 border-slate-800'
                                  : 'bg-slate-950/60 border-slate-900/60 opacity-60'
                              }`}
                              onClick={async () => {
                                if (!notif.read) {
                                  try {
                                    await supabase.from('admin_notifications').update({ is_read: true }).eq('id', notif.id);
                                    setAdminNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }
                              }}
                            >
                              <div className="shrink-0 mt-0.5">
                                {isSuspicious ? (
                                  <ShieldAlert size={14} className="text-red-400" />
                                ) : isMsg ? (
                                  <Mail size={14} className="text-indigo-400" />
                                ) : (
                                  <Bell size={14} className="text-emerald-400" />
                                )}
                              </div>
                              <div className="flex-1 space-y-0.5">
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`text-[10px] font-bold uppercase transition-colors ${isSuspicious ? 'text-red-455' : 'text-slate-300'}`}>
                                    {notif.title}
                                  </span>
                                  <span className="text-[8px] font-mono text-slate-500">
                                    {new Date(notif.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-450 leading-relaxed whitespace-pre-wrap font-sans">
                                  {notif.message}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    
                    <div className="border-t border-slate-900 pt-2 flex items-center justify-between text-[8px] font-mono text-slate-500">
                      <span className="flex items-center gap-1 select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        MONITEUR EN DIRECT (6S)
                      </span>
                      <span>{adminNotifications.filter(n => !n.read).length} NON LUES</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

          {/* Status Bar banner */}
          {statusMessage.text && (
            <div className={`px-6 py-2 border-b text-[11px] font-mono leading-relaxed transition-all duration-300 flex items-center gap-2 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400' 
                : 'bg-red-950/30 border-red-800/50 text-red-400'
            }`}>
              {statusMessage.type === 'success' ? <Check size={12} /> : <ShieldAlert size={12} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* 2. Main content structure */}
          <div className="p-6 overflow-y-auto space-y-6 flex-grow relative z-10 custom-scrollbar">

            {activeTab === 'telemetry' && <TelemetryPanel />}
            {activeTab === 'stats' && <VisitStatsPanel />}
            {activeTab === 'visibility' && <VisibilityPanel />}
            {activeTab === 'blog' && <BlogPanel />}
            {activeTab === 'configAccess' && <ConfigAccessPanel />}
            {activeTab === 'configHome' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Formulaire de l'Accueil */}
                <form onSubmit={handleUpdateHomeConfig} className="lg:col-span-2 space-y-5 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5 mb-2">
                      <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
                      <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wide font-bold">
                        Paramètres de la section Accueil (Accueil Public)
                      </h3>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider mb-1.5">
                        Nom de l'Auteur / Propriétaire du site
                      </label>
                      <input 
                        type="text" 
                        required
                        value={homeName}
                        onChange={(e) => setHomeName(e.target.value)}
                        placeholder="e.g. Dels Dinla."
                        className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider mb-1.5">
                          Titre d'En-Tête - Partie Établie (ex: Dev Python)
                        </label>
                        <input 
                          type="text" 
                          required
                          value={homeTitlePrefix}
                          onChange={(e) => setHomeTitlePrefix(e.target.value)}
                          placeholder="e.g. Dev Python"
                          className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider mb-1.5">
                          Titre d'En-Tête - Spécialisation (ex: & Data Scientist)
                        </label>
                        <input 
                          type="text" 
                          required
                          value={homeTitleSuffix}
                          onChange={(e) => setHomeTitleSuffix(e.target.value)}
                          placeholder="e.g. & Data Scientist"
                          className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Photo de profil section */}
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider mb-1">
                        Photo de Profil de l'Accueil (Drag & Drop ou Clic)
                      </label>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        {/* Circle Preview resembling Hero display */}
                        <div className="relative w-20 h-20 rounded-full border-2 border-slate-700 bg-slate-900 overflow-hidden flex-shrink-0">
                          <img 
                            src={homeProfilePic || defaultProfileImg} 
                            alt="Aperçu Profil" 
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Interactive Dropzone zone */}
                        <div 
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`flex-grow w-full border border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                            isDragging 
                              ? "border-emerald-500 bg-emerald-500/5" 
                              : "border-slate-800 bg-slate-950 hover:bg-slate-900/50 hover:border-slate-700"
                          }`}
                          onClick={() => document.getElementById('profile-file-input')?.click()}
                        >
                          <Upload className={`w-5 h-5 mb-1.5 ${isDragging ? "text-emerald-400" : "text-slate-400"}`} />
                          <p className="text-[10px] text-slate-400 font-sans">
                            <span className="text-emerald-400 font-bold">Cliquez</span> ou glissez une image ici
                          </p>
                          <p className="text-[8px] text-slate-500 font-mono mt-0.5 uppercase">
                            PNG, JPG, WEBP, GIF (Max 5Mo)
                          </p>
                          <input 
                            id="profile-file-input"
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden" 
                          />
                        </div>
                      </div>

                      {/* Manual Image Link & Reset Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                        <div className="sm:col-span-3">
                          <label className="block text-[8px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                            Ou insérer l'URL exacte d'une image en ligne
                          </label>
                          <input 
                            type="text" 
                            value={homeProfilePic}
                            onChange={(e) => setHomeProfilePic(e.target.value)}
                            placeholder="https://example.com/ma-photo.jpg (ou base64 encodé)"
                            className="w-full py-1.5 px-3 bg-slate-950 border border-slate-850 rounded-lg text-slate-300 text-[10px] focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                        {homeProfilePic && (
                          <button
                            type="button"
                            onClick={() => {
                              setHomeProfilePic("");
                              showStatus("Photo réinitialisée à celle par défaut. Enregistrez pour valider.", "success");
                            }}
                            className="w-full py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[8px] font-bold font-mono tracking-wider uppercase rounded-lg cursor-pointer transition-colors h-[31px] flex items-center justify-center"
                          >
                            Rétablir défaut
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider mb-1.5">
                        Phrases de Description (une phrase par ligne - Carrousel d'Accueil)
                      </label>
                      <textarea 
                        required
                        rows={6}
                        value={homePhrasesText}
                        onChange={(e) => setHomePhrasesText(e.target.value)}
                        placeholder="Saisissez vos phrases de description ici..."
                        className="w-full p-4.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-sans leading-relaxed resize-none"
                      />
                      <p className="text-[9px] text-slate-500 font-mono mt-1 leading-normal">
                        *Chaque phrase définie sur une nouvelle ligne défilera automatiquement toutes les 5 secondes sur la page d'accueil.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 mt-5">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 text-xs font-black tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>SYNCHRONISATION CONFIG EN COURS...</span>
                        </>
                      ) : (
                        <>
                          <Check size={14} strokeWidth={3} />
                          <span>SAUVEGARDER CONFIGURATION ACCUEIL</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Inspecteur de configuration & Aperçu */}
                <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4 h-[432px]">
                  <div>
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5 mb-3.5">
                      <Server size={14} className="text-teal-400" />
                      <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wide">
                        Aperçu Réactif (Temps Réel)
                      </h3>
                    </div>
                    
                    <div className="space-y-3 font-sans text-xs text-slate-400 leading-relaxed">
                      <p>
                        Vos modifications sont enregistrées à la racine du serveur dans <code className="font-mono text-teal-400">portfolio_config.json</code> de façon permanente.
                      </p>
                      <p>
                        Un mécanisme <span className="text-emerald-400 font-semibold">d'émissions d'événements DOM réactifs</span> informe la page d'accueil d'actualiser son état instantanément sans perte de session ni clignotement de l'écran.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl font-mono text-[9px] text-slate-400 space-y-1.5 max-h-[200px] overflow-y-auto">
                    <p className="text-emerald-400 font-bold mb-1 border-b border-slate-850 pb-1"># CONFIG ACTIVE</p>
                    <p><span className="text-slate-500">ownerName:</span> "{homeName}"</p>
                    <p><span className="text-slate-500">ownerTitlePrefix:</span> "{homeTitlePrefix}"</p>
                    <p><span className="text-slate-500">ownerTitleSuffix:</span> "{homeTitleSuffix}"</p>
                    <p><span className="text-slate-500">phrasesCount:</span> {homePhrasesText.split('\n').filter(Boolean).length}</p>
                    <p><span className="text-slate-500">hasCustomPhoto:</span> {homeProfilePic ? `true (${homeProfilePic.startsWith('data:') ? 'base64 data' : 'URL link'})` : 'false (default)'}</p>
                  </div>
                </div>

              </motion.div>
            )}

            {activeTab === 'configAbout' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Formulaire de l'À Propos */}
                <form onSubmit={handleUpdateAboutConfig} className="lg:col-span-2 space-y-5 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5 mb-2">
                      <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
                      <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wide">
                        Paramètres de la section À propos (Normal Mode)
                      </h3>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider mb-1.5">
                        Titre de la section
                      </label>
                      <input 
                        type="text" 
                        required
                        value={aboutTitle}
                        onChange={(e) => setAboutTitle(e.target.value)}
                        placeholder="e.g. À propos de moi"
                        className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider mb-1.5">
                        Paragraphes d'explication (un paragraphe complet par ligne)
                      </label>
                      <textarea 
                        required
                        rows={7}
                        value={aboutParagraphsText}
                        onChange={(e) => setAboutParagraphsText(e.target.value)}
                        placeholder="Rédigez ou collez vos paragraphes d'explication..."
                        className="w-full p-4.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-sans leading-relaxed resize-none"
                      />
                      <p className="text-[9px] text-slate-500 font-mono mt-1 leading-normal">
                        *Indiquez chaque paragraphe sur une nouvelle ligne. Ils seront formatés et espacés automatiquement dans l'onglet public.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider mb-1.5">
                        Citations / Pensées du carrousel de citations (une par ligne)
                      </label>
                      <textarea 
                        required
                        rows={5}
                        value={aboutCitationsText}
                        onChange={(e) => setAboutCitationsText(e.target.value)}
                        placeholder="Configurez vos citations marquantes..."
                        className="w-full p-4.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-sans leading-relaxed resize-none"
                      />
                      <p className="text-[9px] text-slate-500 font-mono mt-1 leading-normal">
                        *Une citation par ligne. Elles défileront de gauche à droite de manière réactive sur la page.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 mt-5">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 text-xs font-black tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>SYNCHRONISATION CONFIG EN COURS...</span>
                        </>
                      ) : (
                        <>
                          <Check size={14} strokeWidth={3} />
                          <span>SAUVEGARDER CONFIGURATION À PROPOS</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Inspecteur de configuration À Propos & Aperçu */}
                <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4 h-[432px]">
                  <div>
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5 mb-3.5">
                      <Server size={14} className="text-teal-400" />
                      <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wide">
                        Aperçu Réactif (Temps Réel)
                      </h3>
                    </div>
                    
                    <div className="space-y-3 font-sans text-xs text-slate-400 leading-relaxed">
                      <p>
                        Vos informations sont rechargées de manière persistante.
                      </p>
                      <p>
                        Un événement d'émission de mise à jour synchronise instantanément la section <span className="text-emerald-400 font-semibold">"À propos de moi"</span> sans rechargement.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl font-mono text-[9px] text-slate-400 space-y-1.5 max-h-[200px] overflow-y-auto">
                    <p className="text-emerald-400 font-bold mb-1 border-b border-slate-850 pb-1"># CONFIG À PROPOS</p>
                    <p><span className="text-slate-500">aboutTitle:</span> "{aboutTitle}"</p>
                    <p><span className="text-slate-500">paragraphsCount:</span> {aboutParagraphsText.split('\n').filter(Boolean).length}</p>
                    <p><span className="text-slate-500">citationsCount:</span> {aboutCitationsText.split('\n').filter(Boolean).length}</p>
                  </div>
                </div>

              </motion.div>
            )}

            {activeTab === 'configServices' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Header banner with "+ Ajouter" */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/20 border border-slate-800 p-4 rounded-2xl">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wide">
                      Gestionnaire Intelligent de Services
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Configurez, éditez et supprimez vos offres de services. Les modifications sont persistantes et réactives.
                    </p>
                  </div>
                  {!isAddingService && !editingServiceId && (
                    <button
                      type="button"
                      onClick={startAddService}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                    >
                      <Plus size={14} strokeWidth={3} />
                      <span>NOUVEAU SERVICE</span>
                    </button>
                  )}
                </div>

                {!(isAddingService || editingServiceId) ? (
                  /* Current Services List View */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((srv) => (
                      <div
                        key={srv.id}
                        className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all group"
                      >
                        <div>
                          {/* Inner Header */}
                          <div className="flex items-center gap-3.5 mb-4">
                            <div className={`p-2.5 rounded-xl shrink-0 ${srv.color || 'bg-slate-800 text-slate-400'}`}>
                              {/* Small Inline preview icon */}
                              <span className="font-mono text-xs font-bold uppercase">{srv.iconName?.substring(0, 4)}</span>
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                                {srv.title}
                              </h4>
                              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wide">
                                ID: {srv.id} | {srv.duration || 'Durée non définie'}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4 font-sans">
                            {srv.description}
                          </p>

                          {/* Quick details */}
                          <div className="space-y-1 my-3 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                            <p className="text-[9px] font-mono text-slate-500">
                              ⚡ FEATURES: <span className="text-slate-300 font-sans font-medium">{srv.features?.length || 0} éléments</span>
                            </p>
                            <p className="text-[9px] font-mono text-slate-500">
                              💻 TECHNOLOGIES: <span className="text-slate-350 font-mono font-medium">{srv.technologies?.join(', ') || 'Aucune'}</span>
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800/60 font-mono">
                          <button
                            type="button"
                            onClick={() => startEditService(srv)}
                            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-755 text-slate-300 hover:text-white font-mono text-[9px] font-bold uppercase rounded-lg transition-all border border-slate-750 cursor-pointer text-center"
                          >
                            ÉDITER
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteService(srv.id)}
                            className="px-3 py-1.5 bg-red-950/20 hover:bg-red-900/30 text-red-400 hover:text-red-350 font-mono text-[9px] font-bold uppercase rounded-lg transition-all border border-red-900/20 cursor-pointer flex items-center justify-center"
                            title="Supprimer ce service"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {services.length === 0 && (
                      <div className="col-span-full py-12 text-center bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl">
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                          Aucun service enregistré. Cliquez sur "Nouveau Service" pour commencer à bâtir votre offre.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Create / Edit Form and Realtime Preview */
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Form Column */}
                    <form onSubmit={handleSaveServiceSubmit} className="lg:col-span-7 space-y-5 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5 mb-2 justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
                            <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wide">
                              {editingServiceId ? 'Modifier l\'offre de service' : 'Ajouter une nouvelle offre'}
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={resetSrvForm}
                            className="text-[10px] text-slate-400 hover:text-slate-100 font-mono font-black tracking-wider uppercase cursor-pointer"
                          >
                            × ANNULER
                          </button>
                        </div>

                        {/* Title & ID row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-wider mb-1">
                              ID Unique (Slug URL)
                            </label>
                            <input
                              type="text"
                              required
                              disabled={!!editingServiceId}
                              value={srvId}
                              onChange={(e) => setSrvId(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                              placeholder="e.g. data-science"
                              className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono uppercase disabled:opacity-50"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-wider mb-1">
                              Titre du Service
                            </label>
                            <input
                              type="text"
                              required
                              value={srvTitle}
                              onChange={(e) => setSrvTitle(e.target.value)}
                              placeholder="Analyse & Modélisation des Données"
                              className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-sans"
                            />
                          </div>
                        </div>

                        {/* Description & Long Description */}
                        <div>
                          <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-wider mb-1">
                            Description Courte (Aperçu de grille)
                          </label>
                          <textarea
                            required
                            rows={2}
                            value={srvDescription}
                            onChange={(e) => setSrvDescription(e.target.value)}
                            placeholder="Transformation de vos données brutes en insights stratégiques."
                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-sans resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-wider mb-1">
                            Description Détaillée (Page d'offre complète)
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={srvLongDescription}
                            onChange={(e) => setSrvLongDescription(e.target.value)}
                            placeholder="Je vous propose une prise en charge complète allant du nettoyage initial des bases de données à l'élaboration de visualisations complexes..."
                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-sans resize-none"
                          />
                        </div>

                        {/* Icon & Color selector */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-wider mb-1">
                              Icône Vectorielle
                            </label>
                            <select
                              value={srvIconName}
                              onChange={(e) => setSrvIconName(e.target.value)}
                              className="w-full py-2 px-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                            >
                              <option value="chart">📊 Graphique (chart)</option>
                              <option value="brain">🧠 IA / Machine Learning (brain)</option>
                              <option value="database">🗄️ Base de données (database)</option>
                              <option value="trending">📈 Croissance / Business (trending)</option>
                              <option value="code">💻 Dev / Algorithmique (code)</option>
                              <option value="lightbulb">💡 Idée / Conseil (lightbulb)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-wider mb-1">
                              Palette Graphique du Service
                            </label>
                            <select
                              value={srvColor}
                              onChange={(e) => setSrvColor(e.target.value)}
                              className="w-full py-2 px-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                            >
                              <option value="bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">🧡 Orange Fluide</option>
                              <option value="bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-orange-400">💜 Violet Mystique</option>
                              <option value="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">💚 Émeraude Tech</option>
                              <option value="bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">💙 Azur Standard</option>
                              <option value="bg-pink-100 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400">💗 Rose Intense</option>
                              <option value="bg-teal-100 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">🌐 Sarcelle Océan</option>
                            </select>
                          </div>
                        </div>

                        {/* Duration Row */}
                        <div>
                          <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-wider mb-1">
                            Durée Estimée de Réalisation
                          </label>
                          <input
                            type="text"
                            required
                            value={srvDuration}
                            onChange={(e) => setSrvDuration(e.target.value)}
                            placeholder="e.g. 2-4 semaines"
                            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-sans"
                          />
                        </div>

                        {/* List items configurations inside elegant subsections */}
                        <div className="space-y-3 pt-3 border-t border-slate-800/60 font-sans text-xs">
                          <h4 className="text-[10px] font-bold text-teal-400 font-mono uppercase tracking-wider">
                            Éléments, listes & fiches spécifiques
                          </h4>

                          {/* 1. Features list */}
                          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 space-y-2">
                            <label className="block text-[9px] font-mono text-slate-350 uppercase font-bold tracking-wide">
                              Features / Caractéristiques ({srvFeatures.length})
                            </label>
                            
                            <div className="flex flex-wrap gap-1.5 mb-1.5 max-h-[80px] overflow-y-auto custom-scrollbar">
                              {srvFeatures.map((feat, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 bg-slate-800/80 text-slate-200 px-2 py-0.5 rounded text-[10px] font-sans">
                                  {feat}
                                  <button type="button" onClick={() => removeListItem(idx, srvFeatures, setSrvFeatures)} className="text-red-400 hover:text-red-300 font-bold ml-0.5 cursor-pointer">×</button>
                                </span>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                placeholder="Nouvel avantage fonctionnel..."
                                className="flex-grow py-1 px-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-[11px] focus:outline-none focus:border-emerald-500"
                              />
                              <button
                                type="button"
                                onClick={() => addListItem(newFeature, setNewFeature, srvFeatures, setSrvFeatures)}
                                className="px-3 bg-slate-800 text-slate-200 hover:bg-slate-700 text-[10px] font-bold font-mono uppercase rounded-lg cursor-pointer"
                              >
                                AJOUTER
                              </button>
                            </div>
                          </div>

                          {/* 2. Key Advantages list */}
                          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 space-y-2">
                            <label className="block text-[9px] font-mono text-slate-355 uppercase font-bold tracking-wide">
                              Avantages Clés ({srvAdvantages.length})
                            </label>
                            
                            <div className="flex flex-wrap gap-1.5 mb-1.5 max-h-[80px] overflow-y-auto custom-scrollbar">
                              {srvAdvantages.map((adv, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 bg-slate-800/80 text-slate-200 px-2 py-0.5 rounded text-[10px] font-sans">
                                  {adv}
                                  <button type="button" onClick={() => removeListItem(idx, srvAdvantages, setSrvAdvantages)} className="text-red-400 hover:text-red-300 font-bold ml-0.5 cursor-pointer">×</button>
                                </span>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newAdvantage}
                                onChange={(e) => setNewAdvantage(e.target.value)}
                                placeholder="Nouvel avantage clé..."
                                className="flex-grow py-1 px-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-[11px] focus:outline-none focus:border-emerald-500"
                              />
                              <button
                                type="button"
                                onClick={() => addListItem(newAdvantage, setNewAdvantage, srvAdvantages, setSrvAdvantages)}
                                className="px-3 bg-slate-800 text-slate-200 hover:bg-slate-700 text-[10px] font-bold font-mono uppercase rounded-lg cursor-pointer"
                              >
                                AJOUTER
                              </button>
                            </div>
                          </div>

                          {/* 3. Technologies */}
                          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 space-y-2">
                            <label className="block text-[9px] font-mono text-slate-355 uppercase font-bold tracking-wide">
                              Harnais Technologique ({srvTechnologies.length})
                            </label>
                            
                            <div className="flex flex-wrap gap-1.5 mb-1.5 max-h-[80px] overflow-y-auto custom-scrollbar">
                              {srvTechnologies.map((tech, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 bg-slate-800/80 text-emerald-400 border border-emerald-950 text-[10px] px-2 py-0.5 rounded font-mono font-bold tracking-wider uppercase">
                                  {tech}
                                  <button type="button" onClick={() => removeListItem(idx, srvTechnologies, setSrvTechnologies)} className="text-red-400 hover:text-red-300 font-bold ml-0.5 cursor-pointer">×</button>
                                </span>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newTech}
                                onChange={(e) => setNewTech(e.target.value)}
                                placeholder="e.g. PyTorch, FastAPI, React..."
                                className="flex-grow py-1 px-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-[11px] focus:outline-none focus:border-emerald-500 font-mono uppercase"
                              />
                              <button
                                type="button"
                                onClick={() => addListItem(newTech.toUpperCase(), setNewTech, srvTechnologies, setSrvTechnologies)}
                                className="px-3 bg-slate-800 text-slate-200 hover:bg-slate-700 text-[10px] font-bold font-mono uppercase rounded-lg cursor-pointer"
                              >
                                AJOUTER
                              </button>
                            </div>
                          </div>

                          {/* 4. Use Cases */}
                          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 space-y-2">
                            <label className="block text-[9px] font-mono text-slate-355 uppercase font-bold tracking-wide">
                              Cas d'Usages Typiques ({srvUseCases.length})
                            </label>
                            
                            <div className="flex flex-wrap gap-1.5 mb-1.5 max-h-[80px] overflow-y-auto custom-scrollbar">
                              {srvUseCases.map((uc, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 bg-slate-800/80 text-slate-200 px-2 py-0.5 rounded text-[10px] font-sans">
                                  {uc}
                                  <button type="button" onClick={() => removeListItem(idx, srvUseCases, setSrvUseCases)} className="text-red-400 hover:text-red-300 font-bold ml-0.5 cursor-pointer">×</button>
                                </span>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newUseCase}
                                onChange={(e) => setNewUseCase(e.target.value)}
                                placeholder="e.g. Analyse comportementale clients..."
                                className="flex-grow py-1 px-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-[11px] focus:outline-none focus:border-emerald-500"
                              />
                              <button
                                type="button"
                                onClick={() => addListItem(newUseCase, setNewUseCase, srvUseCases, setSrvUseCases)}
                                className="px-3 bg-slate-800 text-slate-200 hover:bg-slate-700 text-[10px] font-bold font-mono uppercase rounded-lg cursor-pointer"
                              >
                                AJOUTER
                              </button>
                            </div>
                          </div>

                          {/* 5. Deliverables */}
                          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 space-y-2">
                            <label className="block text-[9px] font-mono text-slate-355 uppercase font-bold tracking-wide">
                              Livrables ({srvDeliverables.length})
                            </label>
                            
                            <div className="flex flex-wrap gap-1.5 mb-1.5 max-h-[80px] overflow-y-auto custom-scrollbar">
                              {srvDeliverables.map((del, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 bg-slate-800/80 text-slate-200 px-2 py-0.5 rounded text-[10px] font-sans">
                                  {del}
                                  <button type="button" onClick={() => removeListItem(idx, srvDeliverables, setSrvDeliverables)} className="text-red-400 hover:text-red-300 font-bold ml-0.5 cursor-pointer">×</button>
                                </span>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newDeliverable}
                                onChange={(e) => setNewDeliverable(e.target.value)}
                                placeholder="e.g. Rapport complet, Code source..."
                                className="flex-grow py-1 px-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-[11px] focus:outline-none focus:border-emerald-500"
                              />
                              <button
                                type="button"
                                onClick={() => addListItem(newDeliverable, setNewDeliverable, srvDeliverables, setSrvDeliverables)}
                                className="px-3 bg-slate-800 text-slate-200 hover:bg-slate-700 text-[10px] font-bold font-mono uppercase rounded-lg cursor-pointer"
                              >
                                AJOUTER
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800/80 mt-5 flex gap-3">
                        <button
                          type="button"
                          onClick={resetSrvForm}
                          className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-black tracking-wider uppercase rounded-xl transition-all cursor-pointer border border-slate-750 text-center"
                        >
                          ANNULER
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex-[2] py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 text-xs font-black tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isLoading ? (
                            <>
                              <RefreshCw size={13} className="animate-spin" />
                              <span>ENREGISTREMENT...</span>
                            </>
                          ) : (
                            <>
                              <Check size={14} strokeWidth={3} />
                              <span>SAUVEGARDER LE SERVICE</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Right Realtime Preview Column */}
                    <div className="lg:col-span-5 space-y-6">
                      <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-start">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5 mb-4">
                          <Server size={14} className="text-teal-400" />
                          <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wide">
                            Aperçu de la Grille Publique (Réel)
                          </h3>
                        </div>

                        {/* Interactive Dynamic representation of ServiceCard */}
                        <div className="w-full bg-slate-950 p-6 rounded-2xl border border-slate-850 hover:border-emerald-500 transition-all shadow-xl">
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-lg text-sm shrink-0 ${srvColor || 'bg-slate-800 text-slate-400'}`}>
                              <span className="font-mono text-xs font-black uppercase text-center block w-6">{srvIconName?.substring(0, 4)}</span>
                            </div>
                            <h3 className="text-base font-bold text-slate-100">
                              {srvTitle || "Nouveau Service"}
                            </h3>
                          </div>

                          <p className="text-xs text-slate-400 leading-relaxed mb-6">
                            {srvDescription || "Indiquez une description courte pour l'affichage de la carte."}
                          </p>

                          <div className="space-y-2 mb-6">
                            {(srvFeatures.length > 0 ? srvFeatures : ["Exemple d'avantage standard", "Garantie de qualité de code"]).map((feat, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <span className="text-slate-350">{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Detail Page Preview */}
                      <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-start max-h-[480px] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5 mb-4">
                          <Server size={14} className="text-pink-400" />
                          <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wide">
                            Aperçu de la Fiche Détaillée
                          </h3>
                        </div>

                        <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-850 text-xs">
                          <div>
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-slate-850 pb-1 mb-2"># DESCRIPTION DÉTAILLÉE:</p>
                            <p className="text-slate-350 leading-relaxed font-sans mt-1">
                              {srvLongDescription || "Saisissez la description complète de ce que vous proposez pour ce service."}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div>
                              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5"># AVANTAGES CLÉS:</p>
                              <ul className="space-y-1 text-slate-300 font-sans">
                                {srvAdvantages.map((adv, aIdx) => (
                                  <li key={aIdx}>• {adv}</li>
                                ))}
                                {srvAdvantages.length === 0 && <li className="text-slate-550 italic">Aucun avantage</li>}
                              </ul>
                            </div>
                            <div>
                              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5"># TECHS:</p>
                              <div className="flex flex-wrap gap-1">
                                {srvTechnologies.map((tech, tIdx) => (
                                  <span key={tIdx} className="bg-slate-900 text-emerald-400 font-mono text-[8.5px] px-1.5 py-0.5 rounded border border-emerald-950 font-bold uppercase tracking-wider">{tech}</span>
                                ))}
                                {srvTechnologies.length === 0 && <span className="text-slate-550 italic">Aucune tech</span>}
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-850">
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5"># DURÉE ESTIMÉE:</p>
                            <p className="font-bold text-emerald-400 text-sm font-mono mt-1">
                              {srvDuration || "Non définie"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'configSkills' && (
              <motion.div
                key="config-skills-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6"
              >
                <div>
                  <h2 className="text-lg font-black text-white font-mono uppercase tracking-wider mb-1 flex items-center gap-2">
                    🛠️ GESTION DES COMPÉTENCES (SKILLS)
                  </h2>
                  <p className="text-xs text-slate-400 font-sans">
                    Ajoutez, modifiez ou supprimez des catégories et des compétences techniques.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left panel: Categories List */}
                  <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl flex flex-col h-[520px]">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Activity size={14} className="text-emerald-400" />
                        <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wide">
                          Catégories
                        </h3>
                      </div>
                    </div>

                    {/* New Category Form */}
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Créer Catégorie (ex: Backend)"
                        value={newCategoryTitle}
                        onChange={(e) => setNewCategoryTitle(e.target.value)}
                        className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Categories Scroller */}
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                      {skills.length === 0 ? (
                        <p className="text-xs text-slate-500 italic text-center py-8">Aucune catégorie configurée.</p>
                      ) : (
                        skills.map((cat) => {
                          const isSelected = selectedCategoryId === cat.id;
                          const isEditing = editingCategoryId === cat.id;

                          return (
                            <div
                              key={cat.id}
                              onClick={() => {
                                if (!isEditing) setSelectedCategoryId(cat.id);
                              }}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                                isSelected
                                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-md'
                                  : 'bg-slate-950/40 border-slate-850/80 hover:bg-slate-900/60'
                              }`}
                            >
                              {isEditing ? (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={editingCategoryTitle}
                                    onChange={(e) => setEditingCategoryTitle(e.target.value)}
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateCategoryTitle(cat.id);
                                    }}
                                    className="p-1.5 bg-emerald-500 text-slate-950 rounded-lg hover:bg-emerald-600"
                                  >
                                    <Check size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingCategoryId(null);
                                    }}
                                    className="p-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <div className="font-bold text-xs text-slate-200 font-mono tracking-tight uppercase">
                                    {cat.title}
                                    <span className="ml-1.5 text-[10px] text-slate-500 lowercase font-medium">
                                      ({cat.skills?.length || 0})
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingCategoryId(cat.id);
                                        setEditingCategoryTitle(cat.title);
                                      }}
                                      className="p-1 text-slate-400 hover:text-white transition-colors"
                                      title="Renommer la catégorie"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCategory(cat.id);
                                      }}
                                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                                      title="Supprimer la catégorie"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right panel: Selected Category Skills */}
                  <div className="lg:col-span-2 bg-slate-900/40 border border-slate-850 p-5 rounded-2xl flex flex-col h-[520px]">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Server size={14} className="text-yellow-400" />
                        <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wide">
                          Compétences de{' '}
                          <span className="text-emerald-400">
                            {skills.find((c) => c.id === selectedCategoryId)?.title || '...'}
                          </span>
                        </h3>
                      </div>
                    </div>

                    {selectedCategoryId ? (
                      <>
                        {/* New Skill Entry Form */}
                        <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-2xl mb-4 space-y-3">
                          <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">
                            🍳 AJOUTER UNE NOUVELLE COMPÉTENCE :
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                            <div className="md:col-span-5">
                              <input
                                type="text"
                                placeholder="Nom (ex: Python)"
                                value={newSkillName}
                                onChange={(e) => setNewSkillName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div className="md:col-span-5 flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-mono w-6">Niveau:</span>
                              <input
                                type="range"
                                min="1"
                                max="100"
                                value={newSkillLevel}
                                onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                                className="flex-1 accent-emerald-500"
                              />
                              <span className="text-xs font-bold font-mono text-emerald-400 w-8 text-right">
                                {newSkillLevel}%
                              </span>
                            </div>
                            <div className="md:col-span-2">
                              <button
                                type="button"
                                onClick={handleAddSkill}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold p-1.5 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              >
                                <Plus size={12} />
                                <span>Ajouter</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Skills Scroller */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                          {(() => {
                            const selectedCat = skills.find((c) => c.id === selectedCategoryId);
                            const catSkills = selectedCat?.skills || [];

                            if (catSkills.length === 0) {
                              return (
                                <p className="text-xs text-slate-500 italic text-center py-12">
                                  Aucune compétence à l'intérieur de cette catégorie.
                                </p>
                              );
                            }

                            return catSkills.map((ski: any, idx: number) => {
                              const isEditingSkill = editingSkillIndex === idx;

                              return (
                                <div
                                  key={idx}
                                  className="p-3 bg-slate-950/40 border border-slate-850/80 rounded-xl flex items-center justify-between"
                                >
                                  {isEditingSkill ? (
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                                      <div className="md:col-span-5">
                                        <input
                                          type="text"
                                          value={editingSkillName}
                                          onChange={(e) => setEditingSkillName(e.target.value)}
                                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                                        />
                                      </div>
                                      <div className="md:col-span-5 flex items-center gap-2">
                                        <input
                                          type="range"
                                          min="1"
                                          max="100"
                                          value={editingSkillLevel}
                                          onChange={(e) => setEditingSkillLevel(Number(e.target.value))}
                                          className="flex-1 accent-emerald-500"
                                        />
                                        <span className="text-xs font-bold font-mono text-emerald-400 w-8 text-right">
                                          {editingSkillLevel}%
                                        </span>
                                      </div>
                                      <div className="md:col-span-2 flex gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateSkill(idx)}
                                          className="p-1 px-2 bg-emerald-500 text-slate-950 rounded-lg text-xs hover:bg-emerald-600"
                                        >
                                          <Check size={12} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingSkillIndex(null)}
                                          className="p-1 px-2 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700"
                                        >
                                          <X size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex-1 mr-4">
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-xs font-bold text-slate-200">{ski.name}</span>
                                          <span className="text-[10px] font-mono text-emerald-400 font-bold">
                                            {ski.level}%
                                          </span>
                                        </div>
                                        {/* Simple level progress bar display */}
                                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                          <div
                                            className="bg-emerald-500 h-full rounded-full"
                                            style={{ width: `${ski.level}%` }}
                                          />
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingSkillIndex(idx);
                                            setEditingSkillName(ski.name);
                                            setEditingSkillLevel(ski.level);
                                          }}
                                          className="p-1 text-slate-400 hover:text-white transition-colors"
                                          title="Modifier"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteSkill(idx)}
                                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                                          title="Supprimer"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500 italic text-center py-16">
                        Sélectionnez ou créez une catégorie à gauche pour configurer ses compétences techniques.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'configProjects' && (
              <motion.div
                key="config-projects-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-white font-mono uppercase tracking-wider mb-1 flex items-center gap-2">
                      📂 GESTION DES PROJETS (PORTFOLIO)
                    </h2>
                    <p className="text-xs text-slate-400 font-sans">
                      Ajoutez, mettez à jour ou supprimez les projets affichés dans la galerie publique de votre portfolio.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 self-start">
                    <button
                      type="button"
                      onClick={() => {
                        setIsManagingProjCategories(!isManagingProjCategories);
                        setIsAddingProject(false);
                      }}
                      className={`font-bold px-4 py-2 rounded-xl text-xs font-mono tracking-wide uppercase flex items-center gap-1.5 cursor-pointer transition-colors ${
                        isManagingProjCategories
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                      }`}
                    >
                      <span>📁 Gérer les Catégories</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetProjForm();
                        setIsAddingProject(true);
                        setIsManagingProjCategories(false);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs font-mono tracking-wide uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Plus size={14} />
                      <span>Nouveau Projet</span>
                    </button>
                  </div>
                </div>

                {isManagingProjCategories && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-slate-900/40 border border-emerald-500/10 p-6 rounded-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                      <h3 className="text-xs font-extrabold font-mono text-emerald-400 uppercase tracking-widest">
                        📁 GESTION DES CATÉGORIES DE PROJETS
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsManagingProjCategories(false)}
                        className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <form onSubmit={handleAddProjCategory} className="flex gap-2 max-w-md items-end">
                      <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Nouvelle Catégorie</label>
                        <input
                          type="text"
                          required
                          placeholder="ex: Machine Learning, Web3, Mobile..."
                          value={newProjCategoryInput}
                          onChange={(e) => setNewProjCategoryInput(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs font-mono tracking-wide uppercase cursor-pointer h-9 transition-colors flex items-center justify-center"
                      >
                        Ajouter
                      </button>
                    </form>

                    <div className="mt-4 pt-2">
                      <h4 className="text-[10px] font-mono font-bold text-slate-400 tracking-wider mb-2.5 uppercase">Catégories existantes :</h4>
                      <div className="flex flex-wrap gap-2">
                        {projectCategories.map((cat) => {
                          const count = projects.filter(p => p.category === cat).length;
                          return (
                            <div
                              key={cat}
                              className="bg-slate-950/90 border border-slate-800/80 px-3 py-1.5 rounded-xl flex items-center gap-2.5"
                            >
                              <div className="flex flex-col">
                                <span className="text-xs font-mono font-bold text-slate-200">{cat}</span>
                                <span className="text-[9px] font-mono text-slate-500">{count} projet(s)</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteProjCategory(cat)}
                                className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                                title="Supprimer la catégorie"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {isAddingProject && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-slate-900/40 border border-emerald-500/20 p-6 rounded-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-xs font-extrabold font-mono text-emerald-400 uppercase tracking-widest">
                        {editingProjectId !== null ? "📝 MODIFIER LE PROJET" : "➕ CRÉER UN NOUVEAU PROJET"}
                      </h3>
                      <button
                        type="button"
                        onClick={resetProjForm}
                        className="text-slate-500 hover:text-white transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <form onSubmit={handleSaveProject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">TITRE DU PROJET *</label>
                        <input
                          type="text"
                          required
                          placeholder="ex: Dashboard Analytique E-commerce"
                          value={projTitle}
                          onChange={(e) => setProjTitle(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">CATÉGORIE *</label>
                        <select
                          value={projCategory}
                          onChange={(e) => setProjCategory(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {projectCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">IMAGE URL (vide pour génération automatique)</label>
                        <input
                          type="text"
                          placeholder="ex: https://picsum.photos/seed/dashboard/800/600"
                          value={projImage}
                          onChange={(e) => setProjImage(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">TECHNOLOGIES (séparées par des virgules)*</label>
                        <input
                          type="text"
                          placeholder="ex: React, Python, FastAPI, Pandas"
                          value={projTechsText}
                          onChange={(e) => setProjTechsText(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">DESCRIPTION COURTE *</label>
                        <input
                          type="text"
                          required
                          placeholder="ex: Une plateforme interactive pour visualiser les ventes et prédire les tendances futures..."
                          value={projDescription}
                          onChange={(e) => setProjDescription(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">DÉTAILS COMPLÈTES (DESCRIPTION DÉTAILLÉE DU PROJET)</label>
                        <textarea
                          rows={3}
                          placeholder="ex: Ce projet combine un frontend React moderne avec un backend FastAPI performant..."
                          value={projDetails}
                          onChange={(e) => setProjDetails(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">LIEN GITHUB</label>
                        <input
                          type="text"
                          placeholder="ex: https://github.com/votre-user/votre-projet"
                          value={projGithub}
                          onChange={(e) => setProjGithub(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">LIEN DÉMO LIVE</label>
                        <input
                          type="text"
                          placeholder="ex: https://mon-projet.com"
                          value={projDemo}
                          onChange={(e) => setProjDemo(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">STATUT DE PUBLICATION</label>
                        <select
                          value={projStatus}
                          onChange={(e) => setProjStatus(e.target.value as 'published' | 'draft')}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          <option value="published">Publié (Affiché publiquement)</option>
                          <option value="draft">Brouillon (Masqué pour le public – Admin uniquement)</option>
                        </select>
                      </div>

                      <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={resetProjForm}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors"
                        >
                          {editingProjectId !== null ? "Enregistrer" : "Créer le projet"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.length === 0 ? (
                    <p className="col-span-full text-xs text-slate-500 italic text-center py-16">Aucun projet configuré.</p>
                  ) : (
                    projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="bg-slate-900/40 border border-slate-850/80 hover:border-slate-800 rounded-2xl overflow-hidden flex flex-col group relative transition-all"
                      >
                        {/* Project Header Thumbnail */}
                        <div className="h-40 w-full relative overflow-hidden bg-slate-950">
                          <img
                            src={proj.image || `https://picsum.photos/seed/${encodeURIComponent(proj.title)}/800/600`}
                            alt={proj.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-3 left-3 flex gap-1.5">
                            <div className="bg-slate-950/90 text-[10px] font-bold font-mono px-2 py-0.5 rounded-md border border-slate-800/50 text-emerald-400 uppercase tracking-wider">
                              {proj.category}
                            </div>
                            <div className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md border ${
                              proj.status === 'draft'
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            } uppercase tracking-wider`}>
                              {proj.status === 'draft' ? 'Brouillon' : 'Publié'}
                            </div>
                          </div>

                          <div className="absolute top-3 right-3 flex gap-1 bg-slate-950/95 p-1 rounded-xl border border-slate-800/80">
                            <button
                              type="button"
                              onClick={() => handleEditProjectSelect(proj)}
                              className="p-1 px-2 text-slate-300 hover:text-white transition-colors text-[10px] font-bold font-mono uppercase flex items-center gap-1"
                              title="Modifier"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(proj.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Project body info */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1.5">
                            <h4 className="text-xs font-black text-slate-100 uppercase tracking-wide font-mono line-clamp-1">
                              {proj.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">
                              {proj.description}
                            </p>
                          </div>

                          <div className="space-y-2.5">
                            {/* Techs display list */}
                            <div className="flex flex-wrap gap-1">
                              {(proj.techs || []).map((t: string) => (
                                <span
                                  key={t}
                                  className="text-[9px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded-md font-mono border border-slate-900"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>

                            {/* Links display rows */}
                            <div className="flex items-center gap-3 pt-2.5 border-t border-slate-850 text-[10px] font-mono text-slate-500">
                              <span className="truncate flex-1">
                                Code: <span className="text-slate-300">{proj.github || '#'}</span>
                              </span>
                              <span className="truncate flex-1">
                                Demo: <span className="text-slate-300">{proj.demo || '#'}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'configExperiences' && (
              <motion.div
                key="config-experiences-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-white font-mono uppercase tracking-wider mb-1 flex items-center gap-2">
                      🎓 Gestion des Expériences & Formations
                    </h2>
                    <p className="text-xs text-slate-400">
                      Ajoutez, mettez à jour ou supprimez vos parcours professionnels et académiques affichés sur votre portfolio public.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      resetExperienceForm();
                      setIsAddingExperience(true);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs font-mono tracking-wide uppercase flex items-center gap-1.5 self-start cursor-pointer transition-colors"
                  >
                    <Plus size={14} />
                    <span>Nouveau Parcours</span>
                  </button>
                </div>

                {isAddingExperience && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-slate-900/40 border border-emerald-500/20 p-6 rounded-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-xs font-extrabold font-mono text-emerald-400 uppercase tracking-widest">
                        {editingExperienceId !== null ? "📝 MODIFIER LE PARCOURS" : "➕ AJOUTER UN NOUVEAU PARCOURS"}
                      </h3>
                      <button
                        type="button"
                        onClick={resetExperienceForm}
                        className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <form onSubmit={handleSaveExperience} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">RÔLE / TITRE DU POSTE *</label>
                        <input
                          type="text"
                          required
                          placeholder="ex: Data Scientist Senior, Développeur Full-Stack"
                          value={expRole}
                          onChange={(e) => setExpRole(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">ENTREPRISE / INSTITUTION *</label>
                        <input
                          type="text"
                          required
                          placeholder="ex: Tech Innovators Inc., Université des Sciences"
                          value={expCompany}
                          onChange={(e) => setExpCompany(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">PÉRIODE *</label>
                        <input
                          type="text"
                          required
                          placeholder="ex: 2021 - Présent, 2018 - 2021"
                          value={expPeriod}
                          onChange={(e) => setExpPeriod(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">TECHNOLOGIES (séparées par des virgules)</label>
                        <input
                          type="text"
                          placeholder="ex: Python, Pandas, React, Docker, TensorFlow"
                          value={expTechnologiesText}
                          onChange={(e) => setExpTechnologiesText(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">DESCRIPTION (En puces libres, une par ligne) *</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="ex: Développement de modèles prédictifs augmentant le CA de 15%.&#10;Mentorat de développeurs juniors."
                          value={expDescriptionText}
                          onChange={(e) => setExpDescriptionText(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">DESCRIPTION DÉTAILLÉE (Pour la modale Détails)</label>
                        <textarea
                          rows={3}
                          placeholder="ex: Chez Tech Innovators Inc., je dirige l'implémentation d'algorithmes d'apprentissage automatique..."
                          value={expDetails}
                          onChange={(e) => setExpDetails(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">RÉALISATIONS CLÉS (Une par ligne, pour la modale Détails)</label>
                        <textarea
                          rows={3}
                          placeholder="ex: Conception d'un modèle de recommandation générant +15% de CA.&#10;Migration de pipelines de données réduisant de 35% les temps de traitement."
                          value={expAchievementsText}
                          onChange={(e) => setExpAchievementsText(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">STATUT DE PUBLICATION</label>
                        <select
                          value={expStatus}
                          onChange={(e) => setExpStatus(e.target.value as 'published' | 'draft')}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          <option value="published">Publié (Affiché publiquement)</option>
                          <option value="draft">Brouillon (Masqué pour le public – Admin uniquement)</option>
                        </select>
                      </div>

                      <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={resetExperienceForm}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors"
                        >
                          {editingExperienceId !== null ? "Enregistrer" : "Créer le parcours"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {experiences.length === 0 ? (
                    <p className="col-span-full text-xs text-slate-500 italic text-center py-16">Aucune expérience configurée.</p>
                  ) : (
                    experiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="bg-slate-900/40 border border-slate-850/80 hover:border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 relative transition-all"
                      >
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="text-sm font-black text-slate-100 uppercase tracking-wide font-mono">
                                {exp.role}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-emerald-400 font-bold">{exp.company}</p>
                                <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border ${
                                  exp.status === 'draft'
                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                } uppercase tracking-wider`}>
                                  {exp.status === 'draft' ? 'Brouillon' : 'Publié'}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                              {exp.period}
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-1.5">
                            <h5 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Principales missions :</h5>
                            <ul className="space-y-1 pl-1">
                              {(exp.description || []).slice(0, 3).map((desc: string, i: number) => (
                                <li key={i} className="text-[11px] text-slate-400 leading-relaxed font-sans flex items-start gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                  <span className="line-clamp-1">{desc}</span>
                                </li>
                              ))}
                              {(exp.description || []).length > 3 && (
                                <li className="text-[10px] text-slate-500 italic pl-3">
                                  + {(exp.description || []).length - 3} autre(s) mission(s)
                                </li>
                              )}
                            </ul>
                          </div>

                          {exp.technologies && exp.technologies.length > 0 && (
                            <div className="space-y-1.5">
                              <h5 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Technologies :</h5>
                              <div className="flex flex-wrap gap-1">
                                {exp.technologies.map((t: string) => (
                                  <span
                                    key={t}
                                    className="text-[9px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded-md font-mono border border-slate-900"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-850 text-[10px] font-mono text-slate-500">
                          <span className="text-[10px]">
                            {exp.achievements ? exp.achievements.length : 0} réalisation(s) clé(s)
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditExperienceSelect(exp)}
                              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-lg flex items-center gap-1 cursor-pointer transition-all text-[10px] font-mono uppercase font-bold"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExperience(exp.id)}
                              className="p-1 px-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                              title="Supprimer"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'configCertifications' && (
              <motion.div
                key="config-certifications-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-white font-mono uppercase tracking-wider mb-1 flex items-center gap-2">
                      🏆 Gestion des Certifications & Diplômes
                    </h2>
                    <p className="text-xs text-slate-400">
                      Ajoutez, mettez à jour ou supprimez vos titres professionnels et certifications affichent sur le site.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      resetCertificationForm();
                      setIsAddingCertification(true);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs font-mono tracking-wide uppercase flex items-center gap-1.5 self-start cursor-pointer transition-colors"
                  >
                    <Plus size={14} />
                    <span>Nouvelle Certification</span>
                  </button>
                </div>

                {isAddingCertification && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-slate-900/40 border border-emerald-500/20 p-6 rounded-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-xs font-extrabold font-mono text-emerald-400 uppercase tracking-widest">
                        {editingCertificationId !== null ? "📝 MODIFIER LA CERTIFICATION" : "➕ AJOUTER UNE NOUVELLE CERTIFICATION"}
                      </h3>
                      <button
                        type="button"
                        onClick={resetCertificationForm}
                        className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <form onSubmit={handleSaveCertification} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">TITRE DE LA CERTIFICATION *</label>
                        <input
                          type="text"
                          required
                          placeholder="ex: Google Cloud Professional Data Engineer"
                          value={certTitle}
                          onChange={(e) => setCertTitle(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">ORGANISME ÉMETTEUR *</label>
                        <input
                          type="text"
                          required
                          placeholder="ex: Google Cloud, AWS, Meta"
                          value={certIssuer}
                          onChange={(e) => setCertIssuer(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">DATE D'OBTENTION *</label>
                        <input
                          type="text"
                          required
                          placeholder="ex: Janvier 2025, Novembre 2024"
                          value={certDate}
                          onChange={(e) => setCertDate(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">IDENTIFIANT DE LA CERTIFICATION (CREDENTIAL ID)</label>
                        <input
                          type="text"
                          placeholder="ex: GCP-PDE-82910"
                          value={certCredentialId}
                          onChange={(e) => setCertCredentialId(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">CATÉGORIE *</label>
                        <select
                          required
                          value={certCategory}
                          onChange={(e) => setCertCategory(e.target.value as any)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          <option value="cloud-data">Cloud & Big Data</option>
                          <option value="ml-ai">Intelligence Artificielle</option>
                          <option value="dev">Web & Développement</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">URL DE VÉRIFICATION</label>
                        <input
                          type="text"
                          placeholder="ex: https://cloud.google.com/certification"
                          value={certVerifyUrl}
                          onChange={(e) => setCertVerifyUrl(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">THÈME COULEUR DU LOGO (Tailwind Gradient)</label>
                        <select
                          value={certLogoColor}
                          onChange={(e) => setCertLogoColor(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          <option value="from-blue-600 via-blue-400 to-indigo-500">Bleu GCP (Google)</option>
                          <option value="from-orange-500 via-amber-500 to-yellow-400">Orange AWS (Amazon)</option>
                          <option value="from-amber-600 via-orange-500 to-rose-550">Ambre/Rose (TensorFlow)</option>
                          <option value="from-blue-500 via-cyan-400 to-teal-500">Cyan/Teal (Meta)</option>
                          <option value="from-emerald-500 via-green-400 to-teal-600">Vert/Émeraude (NVIDIA)</option>
                          <option value="from-purple-600 via-pink-500 to-rose-500">Violet/Rose Dégradé</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">STATUT DE PUBLICATION</label>
                        <select
                          value={certStatus}
                          onChange={(e) => setCertStatus(e.target.value as 'published' | 'draft')}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          <option value="published">Publié (Affiché publiquement)</option>
                          <option value="draft">Brouillon (Masqué pour le public – Admin uniquement)</option>
                        </select>
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">COMPÉTENCES CERTIFIÉES (séparées par des virgules)</label>
                        <input
                          type="text"
                          placeholder="ex: BigQuery, Dataflow, Apache Airflow, Spark"
                          value={certSkillsText}
                          onChange={(e) => setCertSkillsText(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">DESCRIPTION / RÉSULTAT OBTENU *</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="ex: Conception et déploiement de modèles de Machine Learning scalables..."
                          value={certDescription}
                          onChange={(e) => setCertDescription(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wide">
                          Aperçu / Justificatif du Certificat (Image ou PDF)
                        </label>
                        
                        <div 
                          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all relative ${
                            certAttachmentUrl 
                              ? 'border-emerald-500/40 bg-emerald-500/5' 
                              : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                          }`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                setCertUploadError("Le fichier est trop volumineux (max 5 Mo). Pour conserver de bonnes performances, de préférence compressez-le.");
                                return;
                              }
                              setCertUploadError("");
                              setCertIsUploading(true);
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const dataUrl = ev.target?.result as string;
                                setCertAttachmentUrl(dataUrl);
                                setCertAttachmentType(file.type.includes("pdf") ? "pdf" : "image");
                                setCertIsUploading(false);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        >
                          {certIsUploading ? (
                            <div className="py-4 space-y-2">
                              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                              <p className="text-xs text-slate-400">Conversion et encodage du fichier en cours...</p>
                            </div>
                          ) : certAttachmentUrl ? (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-emerald-500/20 max-w-md mx-auto">
                                <div className="flex items-center gap-2 text-left">
                                  <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                                    {certAttachmentType === 'pdf' ? (
                                      <span className="font-bold text-[10px]">PDF</span>
                                    ) : (
                                      <ImageIcon size={14} />
                                    )}
                                  </div>
                                  <div className="truncate text-left">
                                    <p className="text-xs font-bold text-slate-200">Justificatif attaché</p>
                                    <p className="text-[10px] text-slate-400 font-mono">Format ({certAttachmentType === 'pdf' ? 'Document PDF' : 'Image'})</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCertAttachmentUrl('');
                                    setCertAttachmentType('');
                                  }}
                                  className="text-rose-400 hover:text-rose-350 px-2 py-1 text-[10px] font-mono hover:bg-rose-500/10 rounded transition-all cursor-pointer"
                                >
                                  Supprimer
                                </button>
                              </div>
                              
                              <div className="flex justify-center">
                                {certAttachmentType === 'pdf' ? (
                                  <div className="w-full max-w-sm h-36 border border-slate-800 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
                                    <embed src={`${certAttachmentUrl}#toolbar=0&navpanes=0`} type="application/pdf" className="w-full h-full" />
                                  </div>
                                ) : (
                                  <div className="max-w-xs max-h-36 border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                                    <img src={certAttachmentUrl} alt="Aperçu" className="max-w-full max-h-36 object-contain" referrerPolicy="no-referrer" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                              <div className="text-xs text-slate-400 font-medium">
                                <label className="text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer underline">
                                  Chargez un fichier
                                  <input 
                                    type="file" 
                                    accept="image/*,application/pdf" 
                                    onChange={handleCertFileChange} 
                                    className="hidden" 
                                  />
                                </label>
                                <span> ou glissez-déposez le document ici</span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-mono">Formats acceptés : PDF, PNG, JPG (Max 5 Mo)</p>
                            </div>
                          )}

                          {certUploadError && (
                            <p className="text-[10px] text-rose-400 mt-2 font-semibold font-mono">{certUploadError}</p>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={resetCertificationForm}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors"
                        >
                          {editingCertificationId !== null ? "Enregistrer" : "Créer la certification"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {certifications.length === 0 ? (
                    <p className="col-span-full text-xs text-slate-500 italic text-center py-16">Aucune certification configurée.</p>
                  ) : (
                    certifications.map((cert) => (
                      <div
                        key={cert.id}
                        className="bg-slate-900/40 border border-slate-850/80 hover:border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 relative transition-all"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${cert.logoColor || 'from-blue-600 via-blue-400 to-indigo-500'} flex items-center justify-center text-white shrink-0`}>
                                <Award className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-slate-100 uppercase tracking-wide font-sans">
                                  {cert.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-xs text-emerald-400 font-bold">{cert.issuer}</p>
                                  <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border ${
                                    cert.status === 'draft'
                                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  } uppercase tracking-wider`}>
                                    {cert.status === 'draft' ? 'Brouillon' : 'Publié'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0">
                              {cert.date}
                            </span>
                          </div>

                          <div className="space-y-2 pt-1 border-t border-slate-850">
                            {cert.description && cert.description.length > 150 ? (
                              <>
                                <MarkdownDescription 
                                  text={cert.description.slice(0, 150)} 
                                  className="inline [&>p]:inline [&>p]:mb-0 text-[11px] text-slate-400 leading-relaxed font-sans" 
                                />
                                <span className="text-[11px] text-slate-400 leading-relaxed font-sans">... </span>
                                <button
                                  type="button"
                                  onClick={() => setViewingDesc(cert)}
                                  className="inline text-accent hover:text-accent/85 hover:underline font-bold cursor-pointer transition-colors ml-0.5 text-[11px] leading-relaxed font-sans"
                                >
                                  lire la suite
                                </button>
                              </>
                            ) : (
                              <MarkdownDescription 
                                text={cert.description} 
                                className="text-[11px] text-slate-400 leading-relaxed font-sans"
                              />
                            )}
                            
                            <div className="text-[10px] font-mono text-slate-500">
                              <span>ID : </span>
                              <span className="text-slate-350">{cert.credentialId ? (cert.credentialId.length > 10 ? cert.credentialId.slice(0, 10) + '...' : cert.credentialId) : 'N/A'}</span>
                            </div>

                            {cert.skills && cert.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {cert.skills.map((s: string) => (
                                  <span
                                    key={s}
                                    className="text-[9px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded-md font-mono border border-slate-900"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-850 text-[10px] font-mono text-slate-500">
                          <span className="text-[9px] font-bold uppercase py-0.5 px-2 bg-slate-950 text-slate-400 rounded-md border border-slate-850">
                            {cert.category === 'cloud-data' ? 'Cloud & Data' : cert.category === 'ml-ai' ? 'ML & AI' : 'Web & Dev'}
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditCertificationSelect(cert)}
                              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-lg flex items-center gap-1 cursor-pointer transition-all text-[10px] font-mono uppercase font-bold"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCertification(cert.id)}
                              className="p-1 px-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                              title="Supprimer"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'configContact' && (
              <motion.div
                key="config-contact-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6"
              >
                <div>
                  <h2 className="text-lg font-black text-white font-mono uppercase tracking-wider mb-1 flex items-center gap-2">
                    ☎️ Infos de Contact & Réseaux Sociaux
                  </h2>
                  <p className="text-xs text-slate-400">
                    Modifiez vos adresses, numéros, coordonnées WhatsApp et vos profils sociaux (GitHub/LinkedIn) visibles sur le site.
                  </p>
                </div>

                <form onSubmit={handleUpdateContactConfig} className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-6 max-w-4xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Location */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                        📍 Localisation (Ville, Pays)
                      </label>
                      <input 
                        type="text" 
                        required
                        value={contactLocation}
                        onChange={(e) => setContactLocation(e.target.value)}
                        placeholder="e.g. Paris, France"
                        className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                        ✉️ Adresse Email de contact
                      </label>
                      <input 
                        type="email" 
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="e.g. contact@example.com"
                        className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                        📞 Numéro de Téléphone (Affiché)
                      </label>
                      <input 
                        type="text" 
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="e.g. +33 6 12 34 56 78"
                        className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    {/* WhatsApp Number */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-300 font-mono">
                        🟢 Numéro WhatsApp (Envoi direct - Format International)
                      </label>
                      <input 
                        type="text" 
                        required
                        value={contactWhatsapp}
                        onChange={(e) => setContactWhatsapp(e.target.value)}
                        placeholder="e.g. 33612345678 (sans + ni espaces)"
                        className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <p className="text-[10px] text-slate-500">Uniquement des chiffres (sans le "+" ni d'espace). Ex: 33612345678 pour le numéro +33 6 12 34 56 78.</p>
                    </div>

                    {/* GitHub */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                        🔗 Lien GitHub (URL complète)
                      </label>
                      <input 
                        type="url" 
                        required
                        value={contactGithub}
                        onChange={(e) => setContactGithub(e.target.value)}
                        placeholder="e.g. https://github.com/votre-user"
                        className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    {/* LinkedIn */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                        🔗 Lien LinkedIn (URL complète)
                      </label>
                      <input 
                        type="url" 
                        required
                        value={contactLinkedin}
                        onChange={(e) => setContactLinkedin(e.target.value)}
                        placeholder="e.g. https://www.linkedin.com/in/votre-nom"
                        className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-800">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs font-mono tracking-wide uppercase cursor-pointer transition-colors"
                    >
                      {isLoading ? "Envoi en cours..." : "Enregistrer les modifications"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'configCV' && <ConfigCVPanel {...{cvFullName, setCvFullName, cvJobTitle, setCvJobTitle, cvAvatarUrl, setCvAvatarUrl, cvSummary, setCvSummary, cvEmail, setCvEmail, cvPhone, setCvPhone, cvLocation, setCvLocation, cvGithub, setCvGithub, cvLinkedin, setCvLinkedin, cvWebsite, setCvWebsite, cvShowWebsite, setCvShowWebsite, cvLanguages, setCvLanguages, cvTemplate, setCvTemplate, cvFontFamily, setCvFontFamily, cvColorTheme, setCvColorTheme, handleUpdateCvConfig, isLoading, handleFileChange, cvAvatarFile, setCvAvatarFile, statusMessage, isDragging, handleDragOver, handleDragLeave, handleDrop}} />}

            {activeTab === 'configVoice' && (
              <motion.div
                key="config-voice-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6"
              >
                <div>
                  <h2 className="text-lg font-black text-white font-mono uppercase tracking-wider mb-1 flex items-center gap-2">
                    🎙️ Configuration des Commandes Audios
                  </h2>
                  <p className="text-xs text-slate-400">
                    Ajustez la sensibilité de détection vocale et la langue de synthèse et de commande pour le microphone du portfolio.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column wrapper */}
                  <div className="space-y-6">
                    {/* Settings Card */}
                    <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                    <h3 className="text-sm font-mono font-bold tracking-wide uppercase text-emerald-400 border-b border-slate-800 pb-3">
                      ⚙️ Préférences Système
                    </h3>

                    <div className="space-y-4">
                      {/* Language Selection */}
                      <div>
                        <label className="block text-xs font-bold text-slate-350 uppercase mb-2 font-mono">
                          Langue de reconnaissance & synthèse :
                        </label>
                        <select
                          value={localStorage.getItem('voice_lang_preference') || 'fr-FR'}
                          onChange={(e) => {
                            localStorage.setItem('voice_lang_preference', e.target.value);
                            showStatus(`Langue configurée sur ${e.target.value === 'fr-FR' ? 'Français' : 'English'} !`, 'success');
                            window.dispatchEvent(new Event('voice_settings_updated'));
                            // force re-render
                            setActiveTab('configVoice');
                          }}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono"
                        >
                          <option value="fr-FR">Français (fr-FR)</option>
                          <option value="en-US">English (en-US)</option>
                        </select>
                        <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                          Définit la langue écoutée par le micro et celle utilisée par Dels pour vous répondre.
                        </p>
                      </div>

                      {/* Voice Profile Selection */}
                      <div>
                        <label className="block text-xs font-bold text-slate-350 uppercase mb-2 font-mono">
                          Profil de Voix de Synthèse (TTS) :
                        </label>
                        {availableVoices.length === 0 ? (
                          <div className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-500 font-mono italic">
                            Aucune voix détectée ou chargement...
                          </div>
                        ) : (
                          <select
                            value={localStorage.getItem('voice_profile_preference') || ''}
                            onChange={(e) => {
                              localStorage.setItem('voice_profile_preference', e.target.value);
                              showStatus(`Profil de voix enregistré : ${e.target.value || 'Automatique'} !`, 'success');
                              window.dispatchEvent(new Event('voice_settings_updated'));
                              // force re-render
                              setActiveTab('configVoice');
                            }}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono"
                          >
                            <option value="">Sélection Automatique (Par défaut du système)</option>
                            {availableVoices
                              .slice()
                              .sort((a, b) => {
                                const prefLang = localStorage.getItem('voice_lang_preference') || 'fr-FR';
                                const aMatch = a.lang.toLowerCase().startsWith(prefLang.substring(0, 2).toLowerCase());
                                const bMatch = b.lang.toLowerCase().startsWith(prefLang.substring(0, 2).toLowerCase());
                                if (aMatch && !bMatch) return -1;
                                if (!aMatch && bMatch) return 1;
                                return a.name.localeCompare(b.name);
                              })
                              .map((voice) => (
                                <option key={voice.name} value={voice.name}>
                                  {voice.name} ({voice.lang}) {voice.localService ? '[Local]' : ''}
                                </option>
                              ))
                            }
                          </select>
                        )}
                        <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                          Sélectionnez le timbre, l'accent ou le genre du profil de voix à utiliser pour les réponses de Dels. Les voix correspondant à la langue sélectionnée apparaissent en haut de la liste.
                        </p>
                      </div>

                      {/* Threshold Sensitivity */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-bold text-slate-350 uppercase font-mono">
                            Seuil de Sensibilité Vocale :
                          </label>
                          <span className="font-mono text-xs font-bold text-emerald-400">
                            {Math.round((parseFloat(localStorage.getItem('voice_confidence_threshold') || '0.4')) * 100)} %
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="0.95"
                          step="0.05"
                          value={parseFloat(localStorage.getItem('voice_confidence_threshold') || '0.4')}
                          onChange={(e) => {
                            localStorage.setItem('voice_confidence_threshold', e.target.value);
                            window.dispatchEvent(new Event('voice_settings_updated'));
                            // force re-render
                            setActiveTab('configVoice');
                          }}
                          className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                          <span>0% (Très sensible)</span>
                          <span>95% (Strict / Prononciation parfaite)</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                          Ajustez le niveau de confiance requis pour valider une commande. Si les commandes ne se déclenchent pas, baissez ce seuil. Si des faux positifs se déclenchent, augmentez-le.
                        </p>
                      </div>

                      {/* Customize Wake Words / Trigger Keywords */}
                      <div className="border-t border-slate-800/60 pt-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-0.5" htmlFor="voiceBgTriggerCheckbox">
                              🎙️ Déclenchement vocal continu :
                            </label>
                            <p className="text-[10px] text-slate-500 leading-normal max-w-[280px]">
                              Écoute activement en arrière-plan pour lancer le contrôle vocal dès que vous prononcez un mot-clé.
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              id="voiceBgTriggerCheckbox"
                              checked={voiceBgTriggerEnabled}
                              onChange={async (e) => {
                                const val = e.target.checked;
                                setVoiceBgTriggerEnabled(val);
                                localStorage.setItem('voice_bg_trigger_enabled', val ? 'true' : 'false');
                                showStatus(
                                  val 
                                    ? "Écoute du déclencheur activée ! Dites l'un de vos mots-clés pour lancer le micro."
                                    : "Écoute continue désactivée.",
                                  "success"
                                );
                                window.dispatchEvent(new Event('voice_settings_updated'));
                                await handleUpdateVoiceConfig(val, voiceTriggerKeywords, voiceStopKeywords);
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950"></div>
                          </label>
                        </div>

                        {voiceBgTriggerEnabled && (
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase font-mono">
                              Mots-clés de déclenchement (virgules pour séparer) :
                            </label>
                            <input
                              type="text"
                              value={voiceTriggerKeywords}
                              onChange={(e) => {
                                setVoiceTriggerKeywords(e.target.value);
                                localStorage.setItem('voice_trigger_keywords', e.target.value);
                                window.dispatchEvent(new Event('voice_settings_updated'));
                              }}
                              onBlur={async () => {
                                await handleUpdateVoiceConfig(voiceBgTriggerEnabled, voiceTriggerKeywords, voiceStopKeywords);
                              }}
                              placeholder="ex: dels, bonjour dels, assistant"
                              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono"
                            />
                            <p className="text-[10px] text-slate-500 leading-normal">
                              Saisissez vos mots de réveil préférés. Dites par exemple <span className="text-emerald-400/80 font-mono">"dels"</span> ou <span className="text-emerald-400/80 font-mono">"bonjour dels"</span> pour déclencher automatiquement l'oreille attentive de l'application.
                            </p>
                          </div>
                        )}

                        {/* Customize Stop Keywords */}
                        <div className="border-t border-slate-800/40 pt-4 space-y-2">
                          <label className="block text-xs font-bold text-slate-300 uppercase font-mono">
                            🛑 Commandes vocales d'arrêt :
                          </label>
                          <input
                            type="text"
                            value={voiceStopKeywords}
                            onChange={(e) => {
                              setVoiceStopKeywords(e.target.value);
                              localStorage.setItem('voice_stop_keywords', e.target.value);
                              window.dispatchEvent(new Event('voice_settings_updated'));
                            }}
                            onBlur={async () => {
                              await handleUpdateVoiceConfig(voiceBgTriggerEnabled, voiceTriggerKeywords, voiceStopKeywords);
                            }}
                            placeholder="ex: c'est bon, arrête, attend, stop"
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono"
                          />
                          <p className="text-[10px] text-slate-500 leading-normal">
                            Saisissez les mots ou expressions (séparés par des virgules) qui doivent immédiatement couper la parole de l'assistant (ex: <span className="text-slate-400 font-mono">"c'est bon"</span>, <span className="text-slate-400 font-mono">"arrête"</span>, <span className="text-slate-400 font-mono">"stop"</span>).
                          </p>
                        </div>

                        {/* Mute AI Voice Toggle */}
                        <div className="border-t border-slate-800/40 pt-4 space-y-2">
                          <div className="flex items-center justify-between animate-fade-in">
                            <div>
                              <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-0.5" htmlFor="voiceMuteSpeakCheckbox">
                                🔇 Muet - Réponses écrites uniquement :
                              </label>
                              <p className="text-[10px] text-slate-500 leading-normal max-w-[280px]">
                                Permet de continuer à utiliser les commandes vocales, mais l'IA répondra uniquement par écrit (bulles de texte) sans parler à voix haute.
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input
                                type="checkbox"
                                id="voiceMuteSpeakCheckbox"
                                checked={voiceMuteSpeak}
                                onChange={(e) => {
                                  const val = e.target.checked;
                                  setVoiceMuteSpeak(val);
                                  localStorage.setItem('voice_mute_speak', val ? 'true' : 'false');
                                  showStatus(
                                    val 
                                      ? "Mode muet activé : réponses uniquement textuelles."
                                      : "Mode muet désactivé : Dels parlera à voix haute.",
                                    "success"
                                  );
                                  window.dispatchEvent(new Event('voice_settings_updated'));
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Custom Macros Card */}
                  <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-sm font-mono font-bold tracking-wide uppercase text-emerald-400">
                          ⚡ Macros Vocales Personnalisées
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Associez un mot de réveil unique à une suite ordonnée d'ouvertures de sections.
                        </p>
                      </div>
                    </div>

                    {/* Macro Manager Form */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 space-y-4">
                      <p className="text-xs font-bold text-slate-300 font-mono uppercase">
                        {editingMacroId ? "✏️ Modifier la macro" : "➕ Créer une nouvelle macro"}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-mono font-bold text-slate-400">
                            Nom de la Macro (ex: Ma visite guidée) :
                          </label>
                          <input
                            type="text"
                            value={newMacroName}
                            onChange={(e) => setNewMacroName(e.target.value)}
                            placeholder="ex: Mon Tour"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-mono font-bold text-slate-400">
                            Commande Vocale de Déclenchement :
                          </label>
                          <input
                            type="text"
                            value={newMacroTrigger}
                            onChange={(e) => setNewMacroTrigger(e.target.value)}
                            placeholder="ex: prepare my tour"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                      </div>

                      {/* compose sequence buttons */}
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-mono font-bold text-slate-400">
                          Étape par Étape - Cliquer pour ajouter à la séquence :
                        </label>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {allAvailableSections.map((sec) => (
                            <button
                              key={sec.value}
                              type="button"
                              onClick={() => {
                                setNewMacroActions([...newMacroActions, sec.value]);
                              }}
                              className="px-2 py-1 bg-slate-900 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 text-[10px] font-mono text-slate-400 rounded-md border border-slate-800 transition-all cursor-pointer"
                            >
                              + {sec.label.split(' / ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* composed sequence visual */}
                      <div className="space-y-2 border-t border-slate-800/40 pt-3">
                        <label className="block text-[10px] uppercase font-mono font-bold text-slate-400">
                          Séquence composée d'actions :
                        </label>
                        {newMacroActions.length === 0 ? (
                          <div className="text-[10px] italic text-slate-600 font-mono py-2 bg-slate-900/40 rounded-lg border border-dashed border-slate-800/50 text-center">
                            Cliquez sur les sections ci-dessus pour composer l'itinéraire !
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2 items-center p-2.5 bg-slate-900 rounded-lg border border-slate-850">
                            {newMacroActions.map((act, index) => {
                              const matchingDetails = allAvailableSections.find(s => s.value === act);
                              const label = matchingDetails ? matchingDetails.label.split(' / ')[0] : act;
                              return (
                                <React.Fragment key={index}>
                                  <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 text-[10px] font-mono font-bold text-slate-300">
                                    <span>{index + 1}. {label}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const actionsCopy = [...newMacroActions];
                                        actionsCopy.splice(index, 1);
                                        setNewMacroActions(actionsCopy);
                                      }}
                                      className="text-slate-500 hover:text-red-400 font-normal transition-colors ml-1.5 focus:outline-none"
                                      title="Enlever cette étape"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  {index < newMacroActions.length - 1 && <span className="text-slate-600 text-xs font-bold font-mono">➔</span>}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* save / clear buttons */}
                      <div className="flex justify-end gap-2 pt-1">
                        {editingMacroId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMacroId(null);
                              setNewMacroName('');
                              setNewMacroTrigger('');
                              setNewMacroActions([]);
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-[10px] font-mono uppercase font-bold transition-all cursor-pointer"
                          >
                            Annuler
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={async () => {
                            if (!newMacroName.trim()) {
                              showStatus("Le nom de la macro est obligatoire.", "err");
                              return;
                            }
                            if (!newMacroTrigger.trim()) {
                              showStatus("La commande de déclenchement vocale est obligatoire.", "err");
                              return;
                            }
                            if (newMacroActions.length === 0) {
                              showStatus("Veuillez ajouter au moins une étape à la séquence.", "err");
                              return;
                            }

                            const cleanTrigger = newMacroTrigger.toLowerCase().trim();
                            let updatedMacros = [...voiceMacros];

                            if (editingMacroId) {
                              // Editing existing
                              updatedMacros = updatedMacros.map(m => m.id === editingMacroId ? {
                                ...m,
                                name: newMacroName.trim(),
                                trigger: cleanTrigger,
                                actions: newMacroActions
                              } : m);
                              showStatus("Macro vocale mise à jour avec succès !", "success");
                            } else {
                              // Adding new
                              const newMacro = {
                                id: Math.random().toString(36).substring(2, 9),
                                name: newMacroName.trim(),
                                trigger: cleanTrigger,
                                actions: newMacroActions
                              };
                              updatedMacros.push(newMacro);
                              showStatus("Nouvelle macro vocale créée !", "success");
                            }

                            setVoiceMacros(updatedMacros);
                            localStorage.setItem('voice_macros', JSON.stringify(updatedMacros));
                            window.dispatchEvent(new Event('voice_settings_updated'));
                            await handleUpdateVoiceConfig(voiceBgTriggerEnabled, voiceTriggerKeywords, voiceStopKeywords, updatedMacros, voiceHistory);

                            // Reset form states
                            setEditingMacroId(null);
                            setNewMacroName('');
                            setNewMacroTrigger('');
                            setNewMacroActions([]);
                          }}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-mono uppercase font-bold shadow-md transition-all cursor-pointer"
                        >
                          {editingMacroId ? "Enregistrer" : "Créer la macro"}
                        </button>
                      </div>
                    </div>

                    {/* Macros List */}
                    <div className="space-y-2 pt-2">
                      <p className="text-[11px] uppercase font-mono font-black tracking-wider text-slate-400">
                        📋 Macros Actives ({voiceMacros.length}) :
                      </p>

                      {voiceMacros.length === 0 ? (
                        <p className="text-[10px] text-slate-500 italic font-mono py-2 bg-slate-950/20 text-center rounded-lg border border-slate-900">
                          Aucune macro personnalisée configurée.
                        </p>
                      ) : (
                        <div className="space-y-3.5">
                          {voiceMacros.map((macro) => (
                            <div key={macro.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 flex items-start justify-between gap-3 shadow hover:border-slate-800 transition-all">
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[11px] font-mono font-bold text-slate-200">
                                    {macro.name}
                                  </span>
                                  <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[9px] rounded-full uppercase font-bold">
                                    “{macro.trigger}”
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-1 items-center text-[10px] font-mono text-slate-450 leading-relaxed font-semibold">
                                  {(macro.actions || []).map((step: string, idx: number) => {
                                    const matchingDetails = allAvailableSections.find(s => s.value === step);
                                    const label = matchingDetails ? matchingDetails.label.split(' / ')[0] : step;
                                    return (
                                      <React.Fragment key={idx}>
                                        <span className="px-1.5 py-0.5 bg-slate-900 rounded text-[9px] text-slate-350 border border-slate-850 uppercase font-bold">
                                          {label}
                                        </span>
                                        {idx < (macro.actions || []).length - 1 && <span className="text-slate-600">➔</span>}
                                      </React.Fragment>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingMacroId(macro.id);
                                    setNewMacroName(macro.name || '');
                                    setNewMacroTrigger(macro.trigger || '');
                                    setNewMacroActions(macro.actions || []);
                                  }}
                                  className="p-1 px-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/10 hover:border-indigo-500/30 text-indigo-400 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-105 animate-fade-in"
                                  title="Modifier"
                                >
                                  ✏️
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const updated = voiceMacros.filter(m => m.id !== macro.id);
                                    setVoiceMacros(updated);
                                    localStorage.setItem('voice_macros', JSON.stringify(updated));
                                    window.dispatchEvent(new Event('voice_settings_updated'));
                                    showStatus("Macro vocale supprimée !", "success");
                                    await handleUpdateVoiceConfig(voiceBgTriggerEnabled, voiceTriggerKeywords, voiceStopKeywords, updated, voiceHistory);
                                  }}
                                  className="p-1 px-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                                  title="Supprimer"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sandbox playground to test your voice */}
                  <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between shadow-xl">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-mono font-bold tracking-wide uppercase text-emerald-400 border-b border-slate-800 pb-3 flex items-center gap-2">
                          🎙️ Banc d'Essai - Détection Micro (Entrée)
                        </h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
                          Testez votre voix directement en direct pour vérifier si les commandes de Dels sont bien décodées selon vos réglages actuels de sensibilité !
                        </p>
                        
                        {/* Active test log */}
                        <LiveVoiceTester showStatus={showStatus} />
                      </div>

                      <div className="border-t border-slate-800/60 pt-4">
                        <h3 className="text-sm font-mono font-bold tracking-wide uppercase text-emerald-400 border-b border-slate-800 pb-3 flex items-center gap-2">
                          🔊 Test d'Écoute de la Synthèse Vocale (Sortie)
                        </h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
                          Vérifiez la prononciation, le timbre et l'accent du profil de voix choisi pour les réponses orales de Dels.
                        </p>

                        {/* Audio play test */}
                        <LiveTtsTester voices={availableVoices} showStatus={showStatus} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Debug History Panel */}
                <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 mt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/40 pb-4">
                    <div>
                      <h3 className="text-sm font-mono font-bold tracking-wide uppercase text-emerald-400 flex items-center gap-2">
                        📋 Console de Débogage : Historique Vocal en Temps Réel
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Visualisez en temps réel les dernières expressions textuelles reconnues par l'API Web Speech, l'intention décodée et la réponse/action correspondante pour faciliter le réglage et l'analyse de l'expérience audio.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          if (typeof window !== 'undefined') {
                            localStorage.removeItem('voice_command_history');
                            setVoiceHistory([]);
                            showStatus("Historique vocal réinitialisé !", "success");
                            await handleUpdateVoiceConfig(voiceBgTriggerEnabled, voiceTriggerKeywords, voiceStopKeywords, voiceMacros, []);
                          }
                        }}
                        disabled={voiceHistory.length === 0}
                        className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 border border-rose-500/30 disabled:opacity-40 disabled:hover:bg-rose-500/10 transition-colors uppercase font-mono font-black text-[10px] text-rose-400 rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        🗑️ Clear logs
                      </button>
                    </div>
                  </div>

                  {voiceHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 bg-slate-950/40 rounded-xl border border-slate-850 border-dashed text-center space-y-2">
                      <span className="text-2xl text-slate-600">🎙️</span>
                      <p className="text-xs text-slate-400 font-medium">Aucun log disponible pour le moment.</p>
                      <p className="text-[10px] text-slate-500 max-w-md leading-normal font-sans">
                        Activez le microphone depuis le bouton de commande vocale du portfolio et prononcez une phrase (ex: <span className="text-emerald-450 font-mono">"Quelles sont tes compétences ?"</span> ou <span className="text-emerald-450 font-mono">"Go to Projects"</span>) pour voir la capture instantanée.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950/45 max-h-[380px] custom-scrollbar">
                      <table className="w-full text-left border-collapse text-[11px] font-sans">
                        <thead>
                          <tr className="bg-slate-950/90 border-b border-slate-850 sticky top-0 z-10">
                            <th className="py-2.5 px-4 font-mono font-bold text-slate-400 uppercase text-[9px] tracking-wider w-36">Horodatage</th>
                            <th className="py-2.5 px-4 font-mono font-bold text-slate-400 uppercase text-[9px] tracking-wider w-44">Saisie Détectée</th>
                            <th className="py-2.5 px-4 font-mono font-bold text-slate-400 uppercase text-[9px] tracking-wider w-32">Type Commande</th>
                            <th className="py-2.5 px-4 font-mono font-bold text-slate-400 uppercase text-[9px] tracking-wider">Action / Réponse Générée</th>
                            <th className="py-2.5 px-4 font-mono font-bold text-slate-400 uppercase text-[9px] tracking-wider w-20 text-center">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850/50">
                          {voiceHistory.map((item: any) => {
                            const date = new Date(item.timestamp);
                            const timeStr = date.toLocaleTimeString(navigator.language || 'fr-FR', {
                              hour: '2-digit', minute: '2-digit', second: '2-digit'
                            }) + '.' + String(date.getMilliseconds()).padStart(3, '0');

                            // Map badges
                            let intentBadgeClass = 'bg-slate-800 text-slate-300';
                            let intentLabel = 'Inconnu';
                            if (item.matchedIntent === 'stop') {
                              intentBadgeClass = 'bg-amber-500/10 border border-amber-500/30 text-amber-400';
                              intentLabel = 'ARRÊT';
                            } else if (item.matchedIntent === 'descriptive') {
                              intentBadgeClass = 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400';
                              intentLabel = 'DIALOGUE/IA';
                            } else if (item.matchedIntent === 'navigation') {
                              intentBadgeClass = 'bg-sky-500/10 border border-sky-500/30 text-sky-455';
                              intentLabel = 'NAVIGATION';
                            } else if (item.matchedIntent === 'unknown') {
                              intentBadgeClass = 'bg-rose-500/10 border border-rose-500/30 text-rose-400';
                              intentLabel = 'ÉCHEC';
                            }

                            let statusBadgeClass = 'bg-slate-800 text-slate-400';
                            if (item.status === 'success') {
                              statusBadgeClass = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
                            } else if (item.status === 'error') {
                              statusBadgeClass = 'bg-rose-500/20 text-rose-400 border border-rose-500/40';
                            } else if (item.status === 'info') {
                              statusBadgeClass = 'bg-blue-500/20 text-blue-400 border border-blue-500/40';
                            }

                            return (
                              <tr key={item.id} className="hover:bg-slate-900/30 transition-colors">
                                <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">{timeStr}</td>
                                <td className="py-2.5 px-4 font-semibold text-slate-200">
                                  “{item.transcript}”
                                </td>
                                <td className="py-2.5 px-4">
                                  <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-black tracking-wider uppercase font-mono ${intentBadgeClass}`}>
                                    {intentLabel}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 text-slate-350 leading-normal max-w-xs md:max-w-md break-words font-mono text-[10px]">
                                  {item.actionTaken}
                                </td>
                                <td className="py-2.5 px-4 text-center">
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase font-mono ${statusBadgeClass}`}>
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'configGithub' && (
              <motion.div
                key="config-github-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6"
              >
                <div>
                  <h2 className="text-lg font-black text-white font-mono uppercase tracking-wider mb-1 flex items-center gap-2">
                    🐱 Intégration & Paramètres GitHub Live
                  </h2>
                  <p className="text-xs text-slate-400">
                    Gérez et configurez l'extraction automatique de vos projets publics depuis l'API de GitHub. Configurez l'autorisation pour contourner les limitations de débit et personnaliser l'affichage.
                  </p>
                </div>

                <form onSubmit={handleSaveGithubConfig} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Left Column Settings */}
                    <div className="space-y-6">
                      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
                        <h3 className="text-sm font-mono font-bold tracking-wide uppercase text-emerald-400 border-b border-slate-800 pb-3 flex items-center gap-2">
                          ⚙️ Connexion de Profil
                        </h3>

                        {/* GitHub Username */}
                        <div>
                          <label className="block text-xs font-bold text-slate-350 uppercase mb-2 font-mono">
                            Pseudonyme GitHub :
                          </label>
                          <input
                            id="input_admin_github_user"
                            type="text"
                            value={githubUsername}
                            onChange={(e) => setGithubUsernameState(e.target.value)}
                            required
                            placeholder="ex: delsDin"
                            className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-hidden focus:border-emerald-500 transition-colors"
                          />
                        </div>

                        {/* GitHub Organizations */}
                        <div>
                          <label className="block text-xs font-bold text-slate-350 uppercase mb-2 font-mono">
                            🏢 Organisations rattachées (séparées par des virgules) :
                          </label>
                          <input
                            id="input_admin_github_orgs"
                            type="text"
                            value={githubOrganizationsText}
                            onChange={(e) => setGithubOrganizationsText(e.target.value)}
                            placeholder="ex: google, facebook, octocat-org"
                            className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-hidden focus:border-emerald-500 transition-colors"
                          />
                          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-mono">
                            Affiche tous les projets publics de ces organisations GitHub.
                          </p>
                        </div>

                        {/* GitHub Collaborators */}
                        <div>
                          <label className="block text-xs font-bold text-slate-350 uppercase mb-2 font-mono">
                            👥 Collaborateurs associés (séparés par des virgules) :
                          </label>
                          <input
                            id="input_admin_github_collabs"
                            type="text"
                            value={githubCollaboratorsText}
                            onChange={(e) => setGithubCollaboratorsText(e.target.value)}
                            placeholder="ex: torvalds, gaearon"
                            className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-hidden focus:border-emerald-500 transition-colors"
                          />
                          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-mono">
                            Associe les projets publics d'autres développeurs/collaborateurs sur votre espace.
                          </p>
                        </div>

                        {/* Only retrieve contributed projects */}
                        <div className="flex items-center justify-between p-3.5 bg-slate-950/45 rounded-xl border border-slate-800/60 transition-all">
                          <div className="text-left space-y-0.5 pr-2">
                            <label htmlFor="checkbox_admin_github_only_contrib" className="text-xs font-bold font-mono text-white block uppercase cursor-pointer">
                              💡 Filtrer par contribution
                            </label>
                            <span className="text-[10px] text-slate-400 block leading-normal">
                              Activer pour ne charger <b>uniquement</b> que les dépôts du collaborateur/organisation sur lesquels vous avez réellement poussé des commits (votre identifiant GitHub principal doit y correspondre).
                            </span>
                          </div>
                          <div>
                            <input
                              id="checkbox_admin_github_only_contrib"
                              type="checkbox"
                              checked={githubOnlyContributedCollab}
                              onChange={(e) => setGithubOnlyContributedCollab(e.target.checked)}
                              className="w-4 h-4 rounded-sm border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950 transition-all cursor-pointer accent-emerald-500"
                            />
                          </div>
                        </div>

                        {/* GitHub Personal Access Token */}
                        <div>
                          <label className="block text-xs font-bold text-slate-350 uppercase mb-2 font-mono flex justify-between">
                            <span>Jeton d'accès personnel (PAT) :</span>
                            {hasGithubToken && (
                              <span className="text-emerald-400 text-[9px] font-bold">● ACTIF & SÉCURISÉ</span>
                            )}
                          </label>
                          <input
                            id="input_admin_github_token"
                            type="password"
                            value={githubToken}
                            onChange={(e) => setGithubTokenState(e.target.value)}
                            placeholder={hasGithubToken ? "••••••••" : "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxx"}
                            className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-hidden focus:border-emerald-500 transition-colors"
                          />
                          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                            Optionnel mais vivement conseillé. Un jeton d'accès permet de s'affranchir de la limite de 60 appels/h de l'API publique de GitHub (portée à 5000 appels/h). Nous stockons ce jeton de façon sécurisée uniquement côté serveur. Enregistrez "REMOVE" pour effacer le jeton existant.
                          </p>
                        </div>

                        {/* Global Synchronize Switch */}
                        <div className="flex items-center justify-between p-3.5 bg-slate-950/45 rounded-xl border border-slate-800/60">
                          <div className="text-left space-y-0.5">
                            <span className="text-xs font-bold font-mono text-white block uppercase">
                              Activer l'affichage en direct
                            </span>
                            <span className="text-[10px] text-slate-400 block leading-tight">
                              Si désactivé, l'onglet GitHub affichera un message d'interruption.
                            </span>
                          </div>
                          <div>
                            <input
                              id="input_admin_github_sync_toggle"
                              type="checkbox"
                              checked={githubSyncEnabled}
                              onChange={(e) => setGithubSyncEnabled(e.target.checked)}
                              className="w-4 h-4 rounded-sm border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            />
                          </div>
                        </div>

                      </div>

                      {/* Manual synchronisation actions */}
                      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl select-none">
                        <h3 className="text-sm font-mono font-bold tracking-wide uppercase text-emerald-400 border-b border-slate-800 pb-3">
                          🔄 Actions de Synchronisation
                        </h3>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Les projets sont mis en cache localement pendant 10 minutes pour des raisons d'optimisation de chargement. Vous pouvez déclencher un import forcé en direct.
                        </p>
                        <button
                          id="btn_admin_github_force_sync"
                          type="button"
                          onClick={handleTriggerGithubSync}
                          disabled={isSyncingGithub || !githubUsername}
                          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-750 text-slate-200 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw size={14} className={isSyncingGithub ? "animate-spin" : ""} />
                          <span>
                            {isSyncingGithub ? "Synchronisation en cours..." : "Synchroniser & rafraîchir le cache"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Right Column - Repositories filter management (la gestion) */}
                    <div className="space-y-6">
                      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col h-full min-h-[400px] shadow-xl">
                        <div className="border-b border-slate-800 pb-3 mb-4">
                          <h3 className="text-sm font-mono font-bold tracking-wide uppercase text-emerald-400">
                            👁️ Sélection & Masquage de Dépôts
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                            Décochez un dépôt public pour l'exclure de l'affichage sur votre page GitHub publique.
                          </p>
                        </div>

                        {/* Search and list of fetched repos */}
                        {githubFetchedRepos.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono text-[11px]">
                            <span>Aucun dépôt dans le cache actuellement.</span>
                            <span className="text-[9px] text-slate-600 mt-1">Configurez votre pseudonyme puis lancez une Synchronisation.</span>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col gap-3">
                            {/* Manual exclusions CSV string editor */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-mono">
                                Liste brute des dépôts exclus (séparés par virgules) :
                              </label>
                              <input
                                id="input_admin_github_exclusions_text"
                                type="text"
                                value={githubExcludedReposText}
                                onChange={(e) => setGithubExcludedReposText(e.target.value)}
                                placeholder="aucun dépôt exclu"
                                className="w-full px-3 py-2 text-[10px] bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono focus:outline-hidden"
                              />
                            </div>

                            <div className="flex-1 overflow-y-auto max-h-[280px] pr-1.5 custom-scrollbar space-y-1.5 p-1 bg-slate-950/40 rounded-xl border border-slate-800">
                              {githubFetchedRepos.map((repo: any) => {
                                const isExcluded = githubExcludedReposText
                                  .split(',')
                                  .map(r => r.trim())
                                  .includes(repo.name);
                                const isChecked = !isExcluded;

                                return (
                                  <div 
                                    key={repo.id}
                                    onClick={() => handleToggleExcludeRepo(repo.name)}
                                    className={`flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer text-xs font-mono font-medium ${
                                      isChecked 
                                        ? 'bg-slate-900/40 border border-slate-800 hover:bg-slate-900 text-white' 
                                        : 'bg-slate-950 border border-transparent opacity-50 hover:opacity-75 text-slate-500'
                                    }`}
                                  >
                                    <div className="truncate flex items-center gap-2">
                                      <span className={`w-1.5 h-1.5 rounded-full ${isChecked ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                                      <span className="truncate">{repo.name}</span>
                                      {repo.language && (
                                        <span className="text-[9px] opacity-65 text-slate-400">({repo.language})</span>
                                      )}
                                    </div>
                                    <div className="shrink-0 flex items-center gap-1.5 select-none pl-2">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        readOnly
                                        className="w-3.5 h-3.5 rounded-sm border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Submission and saving actions */}
                  <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-left font-mono text-[9px] text-slate-500 select-none">
                      Modification en attente d'enregistrement local
                    </div>
                    <button
                      id="btn_admin_github_save_config"
                      type="submit"
                      disabled={isLoading}
                      className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 font-bold font-mono text-xs uppercase text-slate-950 rounded-xl transition-all w-full sm:w-auto text-center cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-95"
                    >
                      {isLoading ? "Enregistrement..." : "💾 Enregistrer la configuration"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'contactMessages' && (
              <motion.div
                key="config-contact-messages-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-white font-mono uppercase tracking-wider mb-1 flex items-center gap-2">
                      ✉️ Messagerie des Contacts Reçus
                    </h2>
                    <p className="text-xs text-slate-400 font-sans">
                      Consultez, lisez, filtrez et gérez les messages envoyés par les visiteurs via votre formulaire de contact.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchContactMessages}
                    className="self-start sm:self-center px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-[11px] font-bold uppercase rounded-xl border border-slate-800 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw size={12} className={isMessagesLoading ? "animate-spin" : ""} />
                    Rafraîchir
                  </button>
                </div>

                {/* Filter and stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                  <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 font-mono tracking-wider">Total Messages</p>
                      <p className="text-2xl font-black text-white font-mono mt-0.5">{contactMessages.length}</p>
                    </div>
                    <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
                      <Mail size={18} />
                    </div>
                  </div>
                  <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-xl flex items-center justify-between relative overflow-hidden">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 font-mono tracking-wider">Non-lus</p>
                      <p className="text-2xl font-black text-rose-500 font-mono mt-0.5">
                        {contactMessages.filter(m => !m.read).length}
                      </p>
                    </div>
                    <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-lg relative flex items-center justify-center">
                      {contactMessages.filter(m => !m.read).length > 0 && (
                        <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping block absolute text-center" />
                      )}
                      <span className={`w-2.5 h-2.5 rounded-full block ${contactMessages.filter(m => !m.read).length > 0 ? 'bg-rose-500' : 'bg-slate-600'}`} />
                    </div>
                  </div>
                  <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 font-mono tracking-wider">Déjà lus</p>
                      <p className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                        {contactMessages.filter(m => m.read).length}
                      </p>
                    </div>
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                      <Check size={18} />
                    </div>
                  </div>
                  
                  {/* Message filters switcher */}
                  <div className="bg-slate-900/30 border border-slate-905 p-2 rounded-xl flex flex-col justify-center gap-1.5">
                    <span className="text-[9px] font-black uppercase text-slate-500 font-mono px-1">Filtrer l'affichage:</span>
                    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-900 w-full justify-between gap-1">
                      {['all', 'unread', 'read'].map((f) => {
                        const count = f === 'all' 
                          ? contactMessages.length 
                          : f === 'unread' 
                            ? contactMessages.filter(m => !m.read).length 
                            : contactMessages.filter(m => m.read).length;
                        
                        return (
                          <button
                            key={f}
                            type="button"
                            onClick={() => {
                              (window as any)._msgFilter = f;
                              setContactMessages([...contactMessages]); // trigger re-render
                            }}
                            className={`flex-1 py-1 px-1 text-[9px] font-mono uppercase font-black rounded transition-colors cursor-pointer text-center ${
                              ((window as any)._msgFilter || 'all') === f
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'text-slate-500 hover:text-slate-350'
                            }`}
                          >
                            {f === 'all' ? 'Tous' : f === 'unread' ? 'Non-lu' : 'Lu'} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Messages list */}
                <div className="space-y-4">
                  {isMessagesLoading ? (
                    <div className="p-12 text-center bg-slate-900/20 border border-slate-900 rounded-2xl flex flex-col items-center justify-center gap-3">
                      <RefreshCw size={24} className="text-emerald-500 animate-spin" />
                      <p className="text-xs text-slate-450 font-mono font-bold tracking-wider uppercase">CHARGEMENT DES MESSAGES EN COURS...</p>
                    </div>
                  ) : (
                    (() => {
                      const filter = (window as any)._msgFilter || 'all';
                      const filtered = contactMessages.filter(m => {
                        if (filter === 'unread') return !m.read;
                        if (filter === 'read') return m.read;
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="p-16 text-center bg-slate-900/20 border border-slate-900 rounded-2xl">
                            <p className="text-xs text-slate-400 font-mono uppercase tracking-widest mb-1.5 font-bold">Aucun message trouvé</p>
                            <p className="text-[10px] text-slate-550 font-sans">
                              {filter === 'unread' 
                                ? "Félicitations, vous n'avez aucun message non lu !" 
                                : filter === 'read' 
                                  ? "Aucun message n'a été marqué comme lu pour l'instant." 
                                  : "Votre boîte de réception est vide."}
                            </p>
                          </div>
                        );
                      }

                      return filtered.map((m) => (
                        <div 
                          key={m.id}
                          className={`p-5 md:p-6 rounded-2xl border transition-all duration-300 flex flex-col gap-4 relative overflow-hidden ${
                            !m.read 
                              ? 'bg-slate-900/60 border-emerald-500/30 shadow-md shadow-emerald-500/5' 
                              : 'bg-slate-905/30 border-slate-800/80 hover:bg-slate-900/40'
                          }`}
                        >
                          {/* Accent highlight strip for unread messages */}
                          {!m.read && (
                            <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500" />
                          )}

                          {/* Message meta header */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
                            <div className="flex items-center gap-3.5">
                              {/* Status Indicator */}
                              <button 
                                type="button"
                                onClick={() => handleToggleMessageRead(m.id, m.read)}
                                className={`w-3.5 h-3.5 rounded-full cursor-pointer flex items-center justify-center transition-all ${
                                  !m.read 
                                    ? 'bg-emerald-500/20 border border-emerald-500 hover:scale-115' 
                                    : 'bg-slate-800/40 border border-slate-750 hover:bg-slate-800 hover:scale-115'
                                }`}
                                title={m.read ? "Marquer comme non lu" : "Marquer comme lu"}
                              >
                                {!m.read && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />}
                              </button>

                              <div>
                                <h3 className="text-xs font-black text-white font-mono uppercase tracking-wide">
                                  {m.name}
                                </h3>
                                <a 
                                  href={`mailto:${m.email}`} 
                                  className="text-[10px] text-emerald-400/80 hover:text-emerald-300 transition-colors font-mono font-bold flex items-center gap-1 mt-0.5"
                                >
                                  ✉️ {m.email}
                                </a>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 self-end md:self-center">
                              <span className="text-[10px] text-slate-500 font-mono">
                                📅 {new Date(m.timestamp).toLocaleDateString('fr-FR', {
                                  day: '2-digit', month: 'short', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit'
                                })}
                              </span>
                              
                              <span className={`px-2 py-0.5 rounded-md font-mono text-[8px] font-black uppercase tracking-wider ${
                                !m.read 
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' 
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                {!m.read ? 'NON LU' : 'LU'}
                              </span>
                            </div>
                          </div>

                          {/* Message Content */}
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-400 font-sans">
                              Sujet : <span className="text-emerald-400 font-bold">{m.subject}</span>
                            </p>
                            <div className="p-4 bg-slate-950/75 border border-slate-900 rounded-xl">
                              <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                                {m.message}
                              </p>
                            </div>
                          </div>

                          {/* Actions trigger line */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60 mt-1">
                            <div className="flex items-center gap-2">
                              {/* Reply via email */}
                              <a 
                                href={`mailto:${m.email}?subject=RE: ${encodeURIComponent(m.subject)}`}
                                className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-850 border border-slate-700/80 text-[10px] font-black text-slate-200 uppercase font-mono rounded-xl tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                ✉️ Répondre par Email
                              </a>

                              {/* Direct WhatsApp Response */}
                              <a
                                href={`https://wa.me/${contactWhatsapp}?text=${encodeURIComponent(`Bonjour, j'ai bien reçu votre message concernant "${m.subject}".`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase font-mono rounded-xl tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                🟢 WhatsApp
                              </a>
                            </div>
                <div className="flex items-center gap-2">
                              {/* Toggle Read/Unread State */}
                              <button
                                type="button"
                                onClick={() => handleToggleMessageRead(m.id, m.read)}
                                className="px-3 py-1.5 bg-slate-800/65 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-805 text-[10px] font-black uppercase font-mono rounded-xl transition-colors cursor-pointer"
                              >
                                {m.read ? "Marquer Non Lu" : "Marquer Lu"}
                              </button>

                              {/* Delete message */}
                              <button
                                type="button"
                                onClick={() => handleDeleteContactMessage(m.id)}
                                className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                                title="Supprimer définitivement"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ));
                    })()
                  )}
                </div>
              </motion.div>
            )}

            {/* VUE NEWSLETTER */}
            {activeTab === 'newsletter' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Mail className="text-emerald-500" /> Abonnés à la Newsletter
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Liste des utilisateurs ayant souscrit pour recevoir vos actualités.
                    </p>
                  </div>
                  <button
                    onClick={fetchNewsletterSubscribers}
                    className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <RefreshCw size={18} className="text-slate-400" />
                  </button>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider bg-slate-950/50">
                          <th className="p-4 font-medium">Email</th>
                          <th className="p-4 font-medium">Date d'inscription</th>
                          <th className="p-4 font-medium w-[100px] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {newsletterSubscribers.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="p-8 text-center text-slate-500 text-sm">
                              Aucun abonné pour le moment.
                            </td>
                          </tr>
                        ) : (
                          newsletterSubscribers.map((sub: any) => (
                            <tr key={sub.email} className="hover:bg-slate-800/30 transition-colors group">
                              <td className="p-4 text-sm text-slate-200">
                                {sub.email}
                              </td>
                              <td className="p-4 text-xs text-slate-400">
                                {new Date(sub.created_at).toLocaleDateString('fr-FR', {
                                  day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(sub.email);
                                    showStatus("Email copié !", "success");
                                  }}
                                  className="p-1.5 bg-slate-900 border border-slate-800 rounded hover:border-emerald-500 hover:text-emerald-400 text-slate-500 transition-colors"
                                  title="Copier l'email"
                                >
                                  <Copy size={14} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'agentChat' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Bot className="text-indigo-500" /> Historique du Chat IA
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Consultez les conversations entre les visiteurs et votre Agent IA.
                    </p>
                  </div>
                  <button
                    onClick={fetchAgentChatHistory}
                    className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <RefreshCw size={18} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  {isAgentChatLoading ? (
                    <div className="text-center p-8 text-slate-400">Chargement...</div>
                  ) : agentChatHistory.length === 0 ? (
                    <div className="text-center p-8 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-500">
                      Aucune conversation enregistrée.
                    </div>
                  ) : (
                    agentChatHistory.map((session: any) => (
                      <div key={session.session_id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                          <h3 className="text-sm font-mono text-slate-300">Session ID: {session.session_id}</h3>
                          <span className="text-xs text-slate-500">
                            {new Date(session.messages[0].created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {session.messages.map((msg: any) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] rounded-xl p-3 ${
                                msg.role === 'user' 
                                  ? 'bg-amber-600/20 border border-amber-600/30 text-amber-100' 
                                  : 'bg-slate-800 border border-slate-700 text-slate-300'
                              }`}>
                                <div className="text-[10px] uppercase font-bold mb-1 opacity-60">
                                  {msg.role === 'user' ? 'Visiteur' : 'Agent IA'}
                                </div>
                                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'configTestimonials' && (
              <motion.div
                key="config-testimonials-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-white font-mono uppercase tracking-wider mb-1 flex items-center gap-2">
                      💬 GESTION DES TÉMOIGNAGES
                    </h2>
                    <p className="text-xs text-slate-400 font-sans">
                      Modérez les avis soumis par vos visiteurs ou ajoutez-en manuellement pour les afficher dans la section Témoignages.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 self-start">
                    <button
                      type="button"
                      onClick={() => {
                        resetTestimonialForm();
                        setIsAddingTestimonial(true);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs font-mono tracking-wide uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Plus size={14} />
                      <span>Ajouter un témoignage</span>
                    </button>
                  </div>
                </div>

                {isAddingTestimonial && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-slate-900/40 border border-emerald-500/20 p-6 rounded-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-xs font-extrabold font-mono text-emerald-400 uppercase tracking-widest">
                        {editingTestimonialId !== null ? "📝 MODIFIER LE TÉMOIGNAGE" : "➕ NOUVEAU TÉMOIGNAGE"}
                      </h3>
                      <button
                        type="button"
                        onClick={resetTestimonialForm}
                        className="text-slate-500 hover:text-white transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <form onSubmit={handleSaveTestimonial} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">NOM DU TÉMOIN *</label>
                        <input
                          type="text"
                          required
                          placeholder="ex: Alice Dupont"
                          value={testName}
                          onChange={(e) => setTestName(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">RÔLE / ENTREPRISE</label>
                        <input
                          type="text"
                          placeholder="ex: CTO @ Tech Innovators"
                          value={testRole}
                          onChange={(e) => setTestRole(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">AVATAR URL (Généré si vide ou téléversé ci-dessous)</label>
                        <input
                          type="text"
                          placeholder="ex: https://picsum.photos/seed/alice/150/150"
                          value={testAvatar}
                          onChange={(e) => setTestAvatar(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>

                      {/* Dropzone for avatar upload */}
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">TÉLÉVERSER UN AVATAR</label>
                        <div className="border border-dashed border-slate-850 hover:border-slate-700 bg-slate-950/40 rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2">
                          {testAvatar ? (
                            <div className="flex items-center gap-4 w-full">
                              <img 
                                src={testAvatar} 
                                alt="Aperçu avatar" 
                                className="w-12 h-12 rounded-full object-cover border border-slate-800"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testName || 'T')}&background=f59e0b&color=fff&bold=true`;
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-mono text-slate-400 truncate">{testAvatar.startsWith('data:') ? 'Image chargée localement (Base64)' : testAvatar}</p>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => setTestAvatar('')}
                                className="text-xs font-mono text-rose-400 hover:underline cursor-pointer"
                              >
                                Supprimer
                              </button>
                            </div>
                          ) : (
                            <label className="cursor-pointer w-full flex flex-col items-center justify-center py-2">
                              <Upload size={20} className="text-slate-500 mb-1" />
                              <span className="text-[10px] font-sans text-slate-400">Glissez-déposez ou cliquez pour téléverser une image (JPG, PNG - Max 2Mo)</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleTestimonialFileChange} 
                                className="hidden" 
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">MESSAGE DU TÉMOIGNAGE *</label>
                        <textarea
                          required
                          rows={4}
                          placeholder="ex: Un développeur exceptionnel..."
                          value={testMessage}
                          onChange={(e) => setTestMessage(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 block">STATUT DE PUBLICATION</label>
                        <select
                          value={testIsActive ? "active" : "pending"}
                          onChange={(e) => setTestIsActive(e.target.value === "active")}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          <option value="active">Actif (Affiché sur le site public)</option>
                          <option value="pending">En attente (Masqué, nécessite modération)</option>
                        </select>
                      </div>

                      <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={resetTestimonialForm}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors"
                        >
                          {editingTestimonialId !== null ? "Enregistrer" : "Créer"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isTestimonialsLoading ? (
                    <p className="col-span-full text-xs text-slate-400 italic text-center py-16">Chargement des témoignages...</p>
                  ) : testimonials.length === 0 ? (
                    <p className="col-span-full text-xs text-slate-500 italic text-center py-16">Aucun témoignage configuré.</p>
                  ) : (
                    testimonials.map((t) => (
                      <div
                        key={t.id}
                        className="bg-slate-900/40 border border-slate-850/80 hover:border-slate-800 rounded-2xl p-6 flex flex-col justify-between group relative transition-all"
                      >
                        <div className="absolute top-4 right-4 flex gap-1.5">
                          <span className={`text-[8px] font-mono font-black tracking-widest uppercase px-2 py-0.5 rounded ${
                            t.is_active !== false 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                          }`}>
                            {t.is_active !== false ? "Visible" : "En attente"}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <img
                              src={t.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=f59e0b&color=fff&bold=true`}
                              alt={t.name}
                              className="w-12 h-12 rounded-full object-cover border border-slate-800 bg-slate-950"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=f59e0b&color=fff&bold=true`;
                              }}
                            />
                            <div>
                              <h4 className="text-sm font-bold text-slate-200">{t.name}</h4>
                              <p className="text-xs text-slate-500">{t.role}</p>
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 italic font-sans leading-relaxed mb-6">
                            "{t.message}"
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-850/60 mt-auto">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleActiveTestimonial(t)}
                              className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                                t.is_active !== false
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                              }`}
                            >
                              {t.is_active !== false ? "Masquer" : "Approuver"}
                            </button>
                          </div>

                          <div className="flex gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleEditTestimonialSelect(t)}
                              className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                              title="Modifier"
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTestimonial(t.id)}
                              className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Supprimer"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'maintenance' && (
              <motion.div
                key="config-maintenance-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6"
              >
                <div>
                  <h2 className="text-lg font-black text-white font-mono uppercase tracking-wider mb-1 flex items-center gap-2">
                    🛠️ GESTION DU MODE MAINTENANCE
                  </h2>
                  <p className="text-xs text-slate-400 font-sans">
                    Configurez le mode maintenance pour rendre le site temporairement indisponible pour les visiteurs publics.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Formulaire principal */}
                  <form onSubmit={handleUpdateMaintenanceConfig} className="lg:col-span-2 space-y-6 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                    <div className="space-y-5">
                      <div className="flex items-center justify-between p-4 bg-slate-950/80 rounded-xl border border-slate-850">
                        <div>
                          <span className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider mb-1">
                            État de la maintenance
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {maintIsActive 
                              ? "🔴 Le site est actuellement verrouillé pour le public." 
                              : "🟢 Le site est accessible au public."}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMaintIsActive(!maintIsActive)}
                          className={`w-14 h-7 rounded-full transition-colors relative focus:outline-none cursor-pointer border ${
                            maintIsActive 
                              ? 'bg-red-500/20 border-red-500 text-red-500' 
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          }`}
                        >
                          <span 
                            className={`absolute top-0.5 w-5.5 h-5.5 rounded-full bg-current transition-all shadow-md ${
                              maintIsActive ? 'right-1' : 'left-1'
                            }`} 
                          />
                        </button>
                      </div>

                      {maintIsActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-sans leading-relaxed space-y-1"
                        >
                          <p className="font-extrabold flex items-center gap-1.5 uppercase tracking-wide">
                            <AlertTriangle size={14} /> Attention : Mode maintenance activé
                          </p>
                          <p>
                            Tous les visiteurs publics seront redirigés vers l'écran d'indisponibilité. Seul le mode administrateur (via le bouton secret) permettra de naviguer sur le site et d'accéder au panneau de configuration.
                          </p>
                        </motion.div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider">
                            Date de début de maintenance
                          </label>
                          <input
                            type="datetime-local"
                            value={maintStartDate}
                            onChange={(e) => setMaintStartDate(e.target.value)}
                            className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider">
                            Date / Heure de réouverture prévue (Libre)
                          </label>
                          <input
                            type="text"
                            placeholder="ex: Lundi 23 Juin à 14h, Bientôt"
                            value={maintReopenDateText}
                            onChange={(e) => setMaintReopenDateText(e.target.value)}
                            className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider">
                          Raison de la maintenance / Panne (Affichée au public)
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Décrivez la raison de cette interruption de service..."
                          value={maintReason}
                          onChange={(e) => setMaintReason(e.target.value)}
                          className="w-full p-4.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-sans leading-relaxed resize-none"
                        />
                      </div>

                      {/* Options de réouverture automatique */}
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider mb-0.5">
                              Activer la Réouverture Automatique
                            </span>
                            <span className="text-[10px] text-slate-500 font-sans">
                              Le site redevient accessible dès que la date de fin est dépassée.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setMaintAutoReopen(!maintAutoReopen)}
                            className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer border ${
                              maintAutoReopen 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                : 'bg-slate-800 border-slate-700 text-slate-500'
                            }`}
                          >
                            <span 
                              className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-current transition-all shadow-md ${
                                maintAutoReopen ? 'right-1' : 'left-1'
                              }`} 
                            />
                          </button>
                        </div>

                        {maintAutoReopen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-1.5 pt-2 border-t border-slate-850"
                          >
                            <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider">
                              Date / Heure de réouverture automatique
                            </label>
                            <input
                              type="datetime-local"
                              required={maintAutoReopen}
                              value={maintAutoReopenDate}
                              onChange={(e) => setMaintAutoReopenDate(e.target.value)}
                              className="w-full py-2 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 mt-5">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 text-xs font-black tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>ENREGISTREMENT...</span>
                          </>
                        ) : (
                          <>
                            <Check size={14} strokeWidth={3} />
                            <span>SAUVEGARDER LA CONFIG MAINTENANCE</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Panel Historique & Informations */}
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                        <Clock size={14} className="text-teal-400" />
                        <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wide">
                          Statut et Historique
                        </h3>
                      </div>

                      <div className="space-y-3 font-sans text-xs text-slate-400">
                        <div>
                          <span className="block text-[10px] font-mono text-slate-500 uppercase">Dernière réouverture effective</span>
                          <span className="text-slate-300 font-mono">
                            {maintReopenedAt ? new Date(maintReopenedAt).toLocaleString('fr-FR') : "Aucun historique disponible."}
                          </span>
                        </div>

                        <div>
                          <span className="block text-[10px] font-mono text-slate-500 uppercase">Comment ça fonctionne ?</span>
                          <p className="mt-1 leading-relaxed">
                            Lorsque la maintenance est activée, la page indisponible intercepte toutes les requêtes des utilisateurs anonymes.
                          </p>
                          <p className="mt-2 leading-relaxed">
                            Si vous cochez l'option de réouverture automatique, dès qu'un utilisateur visitera le site après la date spécifiée, le mode maintenance se désactivera automatiquement en base de données et le site réapparaîtra normalement.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'incidentLogs' && (
              <motion.div
                key="incident-logs-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-white font-mono uppercase tracking-wider mb-1 flex items-center gap-2">
                      ⚠️ ALERTES & HISTORIQUE D'INCIDENTS
                    </h2>
                    <p className="text-xs text-slate-400 font-sans">
                      Suivez et analysez les exceptions de code, erreurs de données et requêtes échouées. Les pannes critiques basculent automatiquement le site en maintenance.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={loadIncidentLogs}
                      disabled={isLogsLoading}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4.5 py-2 rounded-xl text-xs font-bold font-mono tracking-wide uppercase cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <RefreshCw size={13} className={isLogsLoading ? "animate-spin" : ""} />
                      <span>Actualiser</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClearLogs}
                      disabled={incidentLogs.length === 0}
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-4.5 py-2 rounded-xl text-xs font-bold font-mono tracking-wide uppercase cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Trash2 size={13} />
                      <span>Vider les logs</span>
                    </button>
                  </div>
                </div>

                {/* Simulation de tests en haut */}
                <div className="p-4 bg-slate-900/20 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs font-medium text-slate-400 font-sans">
                    🧪 <span className="font-extrabold text-slate-300">Simulateur d'erreurs :</span> Générez une alerte test pour valider les comportements et les alertes visuelles.
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleSimulateIncident('info')}
                      className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono tracking-wide uppercase cursor-pointer transition-colors"
                    >
                      Simulation Info
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateIncident('warning')}
                      className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono tracking-wide uppercase cursor-pointer transition-colors"
                    >
                      Simulation Warning
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateIncident('critical')}
                      className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono tracking-wide uppercase cursor-pointer transition-colors animate-pulse"
                    >
                      Simulation Critique (Auto-Lock)
                    </button>
                  </div>
                </div>

                {/* Incident Log Feed */}
                {isLogsLoading ? (
                  <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-slate-900/10 rounded-2xl border border-slate-850">
                    <RefreshCw size={24} className="animate-spin text-teal-400" />
                    <span className="text-xs text-slate-400 font-mono">Chargement des logs d'incidents...</span>
                  </div>
                ) : incidentLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-16 text-center space-y-3 bg-slate-900/10 rounded-2xl border border-slate-850">
                    <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-450">
                      <ShieldCheck size={28} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-extrabold font-mono uppercase text-slate-200">Aucune alerte détectée</h3>
                      <p className="text-xs text-slate-500 font-sans max-w-sm text-center">
                        Le système fonctionne nominalement. Aucun bug, panne ou erreur de données n'a été signalé.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {incidentLogs.map((log) => {
                      const isCritical = log.severity === 'critical';
                      const isWarning = log.severity === 'warning';
                      const cardBorder = isCritical ? 'border-red-500/30 bg-red-500/[0.02]' : isWarning ? 'border-amber-500/25 bg-amber-500/[0.01]' : 'border-slate-850 bg-slate-900/[0.05]';
                      const severityBadge = isCritical 
                        ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' 
                        : isWarning 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20';

                      return (
                        <div key={log.id} className={`p-5 rounded-2xl border ${cardBorder} space-y-4 transition-all duration-200 text-left`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850/60 pb-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-black uppercase tracking-wider border ${severityBadge}`}>
                                {log.severity}
                              </span>
                              {log.settled ? (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-black uppercase tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
                                  <Check size={10} /> Réglé
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-black uppercase tracking-wider border bg-rose-500/10 text-rose-405 border-rose-500/20 flex items-center gap-1">
                                  <AlertTriangle size={10} /> Actif
                                </span>
                              )}
                              <span className="text-xs text-slate-300 font-mono font-extrabold">
                                Source : <code className="text-teal-400 bg-slate-950 px-1.5 py-0.5 rounded-md">{log.source}</code>
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleSettleIncident(log.id, !!log.settled)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono tracking-wide uppercase transition-colors cursor-pointer border flex items-center gap-1 ${
                                  log.settled 
                                    ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-400 hover:text-slate-200' 
                                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400 font-black'
                                }`}
                              >
                                {log.settled ? (
                                  <>
                                    <RotateCcw size={10} />
                                    <span>Activer</span>
                                  </>
                                ) : (
                                  <>
                                    <Check size={10} />
                                    <span>Réglé</span>
                                  </>
                                )}
                              </button>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(log.created_at).toLocaleString('fr-FR')}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-200 font-sans leading-relaxed">
                              {log.error_message}
                            </h4>

                            {log.error_stack && (
                              <details className="group border border-slate-850 bg-slate-950/80 rounded-xl overflow-hidden transition-all">
                                <summary className="px-4 py-2 text-[10px] font-mono text-slate-400 hover:text-white uppercase tracking-wider cursor-pointer list-none flex items-center justify-between select-none">
                                  <span>Afficher la Stack Trace</span>
                                  <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <pre className="p-4 text-[9px] font-mono text-slate-500 overflow-x-auto leading-relaxed border-t border-slate-900 bg-slate-950 max-h-[220px] overflow-y-auto">
                                  {log.error_stack}
                                </pre>
                              </details>
                            )}

                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <details className="group border border-slate-850 bg-slate-950/80 rounded-xl overflow-hidden transition-all">
                                <summary className="px-4 py-2 text-[10px] font-mono text-slate-400 hover:text-white uppercase tracking-wider cursor-pointer list-none flex items-center justify-between select-none">
                                  <span>Métadonnées d'exécution</span>
                                  <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <pre className="p-4 text-[9px] font-mono text-teal-450/80 overflow-x-auto leading-relaxed border-t border-slate-900 bg-slate-950">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            </div>

            {/* TOASTS NOTIFICATIONS FLOTTANTS */}
            <div className="absolute top-4 right-4 z-50 pointer-events-none flex flex-col gap-2.5 max-w-sm w-full">
              <AnimatePresence>
                {activeToasts.map((toast) => {
                  const isSuspicious = toast.type === 'suspicious';
                  const isMsg = toast.type === 'new_message';
                  
                  let iconEl = <Bell className="text-emerald-400 shrink-0" size={16} />;
                  let borderStyle = 'border-emerald-500/30';
                  let bgStyle = 'bg-slate-950/95 shadow-emerald-950/10';
                  
                  if (isSuspicious) {
                    iconEl = <ShieldAlert className="text-red-400 shrink-0 animate-bounce" size={16} />;
                    borderStyle = 'border-red-500/40 animate-pulse';
                    bgStyle = 'bg-slate-950/98 shadow-red-950/20';
                  } else if (isMsg) {
                    iconEl = <Mail className="text-indigo-400 shrink-0" size={16} />;
                    borderStyle = 'border-indigo-500/30';
                    bgStyle = 'bg-slate-950/95 shadow-indigo-950/10';
                  }
                  
                  return (
                    <motion.div
                      key={toast.id}
                      initial={{ opacity: 0, x: 200, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 200, scale: 0.9 }}
                      className={`pointer-events-auto p-4 rounded-xl border ${borderStyle} ${bgStyle} shadow-xl backdrop-blur-md flex items-start gap-3 select-none cursor-pointer relative overflow-hidden`}
                      onClick={() => setActiveToasts(prev => prev.filter(t => t.id !== toast.id))}
                    >
                      {/* Accent strip line indicator */}
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${isSuspicious ? 'bg-red-500' : isMsg ? 'bg-indigo-505' : 'bg-emerald-500'}`} />

                      <div className="p-1 rounded-lg bg-slate-900/60 border border-slate-800">
                        {iconEl}
                      </div>

                      <div className="flex-grow space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
                            {toast.title}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">
                            {new Date(toast.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed font-sans font-medium whitespace-pre-wrap">
                          {toast.message}
                        </p>
                      </div>

                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setActiveToasts(prev => prev.filter(t => t.id !== toast.id)); 
                        }}
                        className="text-slate-500 hover:text-slate-350 transition-colors p-0.5 cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="p-4 px-6 border-t border-slate-900 bg-slate-950/80 text-[10px] text-slate-500 font-mono flex items-center justify-between z-10 font-sans">
              <span>PROPRIÉTE DE DELS © TOUS DROITS RÉSERVÉS</span>
              <span>SYSTÈME ENTIÈREMENT PERSISTANT AVEC EXPRESS + VITE</span>
            </div>

          </div>
        </motion.div>
      </AnimatePresence>

      {/* Description Modal overlay inside AdminDashboard */}
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
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 cursor-default my-auto"
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
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight mt-0.5 font-sans">
                    {viewingDesc.title}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1.5">
                    <Calendar size={11} /> {viewingDesc.date}
                  </p>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 border-t border-slate-800 pt-4 scrollbar-thin scrollbar-thumb-slate-800">
                <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Description Complète
                </h4>
                <MarkdownDescription text={viewingDesc.description} className="text-xs text-slate-350 leading-relaxed font-sans" />

                {viewingDesc.skills && viewingDesc.skills.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Compétences Validées
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingDesc.skills.map((skill: string) => (
                        <span 
                          key={skill}
                          className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-200 border border-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer buttons */}
              <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 pt-5 mt-6">
                <a
                  href={viewingDesc.verifyUrl}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <span>Vérifier</span>
                  <ExternalLink size={11} />
                </a>
                <button
                  type="button"
                  onClick={() => setViewingDesc(null)}
                  className="ml-auto px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

import { fetchPortfolioConfig } from '../lib/config-api';
import React, { useState, useEffect } from 'react';
import { Menu, X, Linkedin, Mic, MicOff, ChevronDown, HelpCircle, Briefcase, Compass, MapPin, MessageSquare, VolumeX, Volume2, Share2, ShieldAlert, Shield, Target, Zap, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigation } from '../context/NavigationContext';
import { useData } from '../context/DataContext';

export const Header = () => {
  const { 
    activeSection, 
    setActiveSection, 
    isHopsonMode, 
    surprisesUnlocked,
    isAdminMode,
    setIsAdminMode,
    setIsHopsonMode,
    ownerName,
    showHopsonRemovedModal,
    setShowHopsonRemovedModal,
    hasSuspiciousAlert
  } = useNavigation();
  const { skills, projects, experiences, testimonials } = useData();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSubmenuOpen, setIsMobileSubmenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // States for Microphone-based Voice Control Feature
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState<string>('');
  const [voiceFeedback, setVoiceFeedback] = useState<{ text: string, type: 'success' | 'error' | 'info' | null }>({ text: '', type: null });
  const [isTtsSpeaking, setIsTtsSpeaking] = useState(false);
  const [isAudioHelpOpen, setIsAudioHelpOpen] = useState(false);
  const [voiceLang, setVoiceLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('voice_lang_preference') || 'fr-FR';
    }
    return 'fr-FR';
  });
  const isEn = voiceLang.toLowerCase().startsWith('en');

  const [voiceMuteSpeak, setVoiceMuteSpeak] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('voice_mute_speak') === 'true';
    }
    return false;
  });
  const [voiceTriggerKeywords, setVoiceTriggerKeywords] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('voice_trigger_keywords') || 'dels, bonjour dels';
    }
    return 'dels, bonjour dels';
  });
  const [voiceStopKeywords, setVoiceStopKeywords] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('voice_stop_keywords') || "c'est bon, arrête, attend, stop";
    }
    return "c'est bon, arrête, attend, stop";
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

  const macroCancelRef = React.useRef<boolean>(false);

  const recognitionRef = React.useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore unmount abort errors
        }
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        if (!(window as any).isSpeakingDescriptiveAnswer) {
          window.speechSynthesis.cancel();
        }
      }
    };
  }, []);

  const speakText = (textToSpeak: string, isDescriptive: boolean = false) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        const isMuted = localStorage.getItem('voice_mute_speak') === 'true';
        if (isMuted) {
          return;
        }

        window.speechSynthesis.cancel();
        if (isDescriptive) {
          (window as any).isSpeakingDescriptiveAnswer = true;
        } else {
          (window as any).isSpeakingDescriptiveAnswer = false;
        }
        
        const utterance = new SpeechSynthesisUtterance(textToSpeak);

        utterance.onstart = () => {
          setIsTtsSpeaking(true);
          if (isDescriptive) {
            (window as any).isSpeakingDescriptiveAnswer = true;
          }
        };
        utterance.onend = () => {
          setIsTtsSpeaking(false);
          (window as any).isSpeakingDescriptiveAnswer = false;
        };
        utterance.onerror = () => {
          setIsTtsSpeaking(false);
          (window as any).isSpeakingDescriptiveAnswer = false;
        };

        const storedLang = localStorage.getItem('voice_lang_preference') || 'fr-FR';
        const preferredVoiceName = localStorage.getItem('voice_profile_preference');
        utterance.lang = storedLang;
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;
        if (preferredVoiceName) {
          selectedVoice = voices.find(v => v.name === preferredVoiceName);
        }
        if (!selectedVoice) {
          const firstTwo = storedLang.substring(0, 2).toLowerCase();
          const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(firstTwo) || v.lang.toLowerCase().includes(storedLang.toLowerCase()));
          if (matchedVoice) {
            selectedVoice = matchedVoice;
          }
        }
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis failure:", err);
      }
    }
  };

  const logVoiceCommandToHistory = (
    transcript: string,
    matchedIntent: 'descriptive' | 'navigation' | 'stop' | 'unknown' | 'help',
    actionTaken: string,
    status: 'success' | 'error' | 'info'
  ) => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('voice_command_history') || '[]';
      let history = JSON.parse(raw);
      if (!Array.isArray(history)) {
        history = [];
      }
      const newEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        transcript,
        matchedIntent,
        actionTaken,
        status
      };
      history.unshift(newEntry);
      if (history.length > 50) {
        history = history.slice(0, 50);
      }
      localStorage.setItem('voice_command_history', JSON.stringify(history));
      window.dispatchEvent(new Event('voice_history_updated'));
    } catch (error) {
      console.warn("Could not log voice command to history:", error);
    }
  };

  const handleVoiceCommand = (transcript: string) => {
    const text = transcript.toLowerCase().trim();
    // Remove sentence-ending and trailing punctuation but preserve apostrophes (') and hyphens (-)
    const cleanedText = text.replace(/[.,\/#!$%\^&\*;:{}=\_`~()?¿¡"“”«»]/g, " ").replace(/\s+/g, " ").trim();
    setVoiceText(transcript);

    const storedLang = localStorage.getItem('voice_lang_preference') || 'fr-FR';
    const isEn = storedLang.toLowerCase().startsWith('en');

    // Ignore captured system feedback and ignore all other voice inputs when TTS is speaking to prevent microphone loopback
    const isSystemFeedback = cleanedText.includes("posez votre") || 
                             cleanedText.includes("ask your") || 
                             cleanedText.includes("please ask") || 
                             cleanedText.includes("oui pose") ||
                             cleanedText === "posez" ||
                             cleanedText === "votre" ||
                             cleanedText === "posez votre" ||
                             cleanedText === "posez votre question";

    if (isSystemFeedback) {
      console.info("Silently ignored system vocal feedback loop:", transcript);
      return;
    }

    // Check for configurable stop commands
    const storedStopKeywords = localStorage.getItem('voice_stop_keywords') || "c'est bon, arrête, attend, stop";
    const stopKeywords = storedStopKeywords
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(Boolean);

    const hasStopIntent = stopKeywords.some(keyword => cleanedText.includes(keyword));

    const isSpeaking = isTtsSpeaking || (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking);
    if (isSpeaking && !hasStopIntent) {
      console.info("Ignoring voice result while template speech is active to prevent feedback loop:", transcript);
      return;
    }

    // Check for "help" or "aide" commands to toggle the help overlay guide
    const helpKeywords = ['help', 'aide', 'guide', 'commands', 'commandes', 'aide-moi', 'aide moi', 'help me', 'cheat sheet', 'raccourci', 'raccourcis', 'shortcuts'];
    const hasHelpIntent = helpKeywords.some(kw => cleanedText === kw || cleanedText.startsWith(kw + ' ') || cleanedText.endsWith(' ' + kw) || cleanedText.includes(' ' + kw + ' '));

    if (hasHelpIntent) {
      setIsAudioHelpOpen(true);
      const helpMsg = isEn 
        ? "Opening voice commands cheat sheet." 
        : "Ouverture du guide des commandes vocales.";
      speakText(helpMsg);
      logVoiceCommandToHistory(
        transcript,
        'help',
        isEn ? "Opened voice commands user guide" : "Ouverture du guide de commande vocal",
        'success'
      );
      setVoiceFeedback({
        text: helpMsg,
        type: 'success'
      });
      setTimeout(() => setVoiceFeedback({ text: '', type: null }), 4000);
      return;
    }

    if (hasStopIntent) {
      macroCancelRef.current = true;
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsTtsSpeaking(false);
      (window as any).isSpeakingDescriptiveAnswer = false;
      
      logVoiceCommandToHistory(
        transcript,
        'stop',
        isEn ? "Stopped voice output via voice command" : "Arrêt forcé de la voix via commande vocale",
        'info'
      );

      setVoiceFeedback({
        text: isEn ? "Voice output stopped." : "Lecture vocale arrêtée.",
        type: 'info'
      });
      setTimeout(() => setVoiceFeedback({ text: '', type: null }), 4000);
      return;
    }

    // === SPECIAL ADMINISTRATOR VOICE COMMANDS ===
    const adminActivateKeywords = [
      'activer le mode administrateur', 'activer mode administrateur', 'connexion administrateur', 
      'activer admin', 'sudo admin', 'enable admin mode', 'active admin mode', 'admin login', 'accès administrateur', 'acces administrateur',
      'active le mode administrateur', 'active mode administrateur', 'active admin', 'surdo admin', 'surdo-admin', 'surdoadmin',
      'va dans admin', 'aller à l\'admin', 'aller a l\'admin', 'aller sur admin', 'admin', 'direction admin', 'ouvrir l\'admin', 'ouvrir admin',
      'accès admin', 'acces admin', 'accéder à l\'admin', 'acceder a l\'admin', 'connexion admin', 'connection admin', 'va en admin'
    ];
    const adminDeactivateKeywords = [
      'désactiver le mode administrateur', 'désactiver mode administrateur', 'quitter mode administrateur', 'deconnexion administrateur',
      'désactiver admin', 'disable admin mode', 'exit admin',
      'désactive le mode administrateur', 'desactive le mode administrateur', 'désactive mode administrateur', 'desactive mode administrateur',
      'désactive admin', 'desactive admin', 'quitter l\'admin', 'quitter admin', 'déconnexion admin', 'deconnexion admin'
    ];
    const hopsonActivateKeywords = [
      'activer le mode hopson', 'activer mode hopson', 'activer le mode reine', 'activer mode reine',
      'protocole romantique', 'enable hopson mode', 'love protocol', 'mode reine'
    ];
    const hopsonDeactivateKeywords = [
      'désactiver le mode hopson', 'désactiver mode hopson', 'désactiver le mode reine', 'désactiver mode reine',
      'disable hopson mode', 'quitter mode reine'
    ];
    const systemReportKeywords = [
      'rapport de performance', 'rapport de performance du système', 'rapport système', 'rapport systeme',
      'status système', 'status systeme', 'system report', 'system health report', 'diagnostic système', 'diagnostic systeme'
    ];

    if (adminActivateKeywords.some(kw => cleanedText === kw || cleanedText.includes(kw))) {
      setIsAdminMode(true);
      const msg = isEn
        ? "Administrator root privileges granted. Opening secure system control panel."
        : "Accès root administrateur validé. Lancement du pupitre de contrôle général sécurisé.";
      speakText(msg);
      logVoiceCommandToHistory(
        transcript,
        'navigation',
        isEn ? "Administrator mode enabled vocally" : "Mode administrateur activé par commande vocale",
        'success'
      );
      setVoiceFeedback({
        text: isEn ? "🔑 ROOT ADMIN ACCESS GRANTED & PANEL UNLOCKED" : "🔑 ACCÈS ADMIN ROOT VALIDÉ (PUPITRE DÉVERROUILLÉ)",
        type: 'success'
      });
      setTimeout(() => setVoiceFeedback({ text: '', type: null }), 6000);
      return;
    }

    if (adminDeactivateKeywords.some(kw => cleanedText === kw || cleanedText.includes(kw))) {
      setIsAdminMode(false);
      const msg = isEn
        ? "Administrator session closed. Restoring default navigation permissions."
        : "Session Root révoquée avec succès. Restauration des droits standard de visite.";
      speakText(msg);
      logVoiceCommandToHistory(
        transcript,
        'navigation',
        isEn ? "Administrator mode disabled vocally" : "Mode administrateur désactivé par commande vocale",
        'info'
      );
      setVoiceFeedback({
        text: isEn ? "🔒 ADMIN ACCESS REVOKED" : "🔒 SESSION ADMINISTRATEUR DÉCONNECTÉE",
        type: 'info'
      });
      setTimeout(() => setVoiceFeedback({ text: '', type: null }), 5000);
      return;
    }

    if (hopsonActivateKeywords.some(kw => cleanedText === kw || cleanedText.includes(kw))) {
      setIsHopsonMode(true);
      const msg = `Désolé ! Je suis l'assistant de ${ownerName || 'Dels'} et il m'a demandé de supprimer le mode Hopson...`;
      speakText(msg);
      logVoiceCommandToHistory(
        transcript,
        'navigation',
        isEn ? `Hopson mode requested but disabled by ${ownerName}` : `Mode Hopson requis mais désactivé par ${ownerName}`,
        'error'
      );
      setVoiceFeedback({
        text: `Désolé ! Je suis l'assistant de ${ownerName || 'Dels'} et il m'a demandé de supprimer le mode Hopson...`,
        type: 'error'
      });
      setTimeout(() => setVoiceFeedback({ text: '', type: null }), 6000);
      return;
    }

    if (hopsonDeactivateKeywords.some(kw => cleanedText === kw || cleanedText.includes(kw))) {
      setIsHopsonMode(false);
      const msg = isEn
        ? "Hopson mode is already permanently deactivated."
        : "Le mode Hopson est déjà désactivé de façon permanente.";
      speakText(msg);
      logVoiceCommandToHistory(
        transcript,
        'navigation',
        isEn ? "Hopson mode is already inactive" : "Le mode Hopson est déjà inactif",
        'info'
      );
      setVoiceFeedback({
        text: isEn ? "🔓 HOPSON MODE IS INACTIVE" : "🔓 LE MODE HOPSON EST INACTIF",
        type: 'info'
      });
      setTimeout(() => setVoiceFeedback({ text: '', type: null }), 5000);
      return;
    }

    if (systemReportKeywords.some(kw => cleanedText === kw || cleanedText.includes(kw))) {
      const dbLatency = "1.4 ms";
      const currentUptime = "100%";
      const memoryStr = `${Math.floor(Math.random() * 30 + 380)} Mo`;
      const msg = isEn
        ? `System Health Diagnostic Complete: Host online. Operational latency, 1.4 milliseconds. Dynamic virtual files initialized, memory usage secure. Current system uptime score, 100 percent.`
        : `Rapport de santé système : Plateforme en ligne. Latence base de données de 1,4 milliseconde. Système de fichier virtuel virtuel e f s monté à 100%. Consommation mémoire de ${memoryStr}. Tous les services fonctionnent parfaitement.`;
      speakText(msg, true);
      logVoiceCommandToHistory(
        transcript,
        'descriptive',
        isEn ? "Generated vocal system health status report" : "Rapport vocal d'intégrité et de performance système généré",
        'success'
      );
      setVoiceFeedback({
        text: isEn ? "🖥️ DIAGNOSTIC: 100% OPERATIONAL | Latency: 1.4ms" : "🖥️ DIAGNOSTIC SYSTEME : 100% OPÉRATIONNEL | Latence : 1.4 ms",
        type: 'success'
      });
      setTimeout(() => setVoiceFeedback({ text: '', type: null }), 8000);
      return;
    }

    // Intercept complete portfolio summary / presentation command
    const presentationKeywords = [
      'résumer', 'resumer', 
      'tout ce que je dois savoir', 'tout ce que tu dois savoir',
      'présentation complète', 'presentation complete', 'présentation globale', 'presentation globale',
      'summarize', 'summarise', 'who are you', 'tell me about yourself', 'complete presentation'
    ];
    const hasPresentationIntent = presentationKeywords.some(kw => cleanedText === kw || cleanedText.includes(kw));

    if (hasPresentationIntent) {
      const waitMsg = isEn 
        ? "Generating complete profile summary from active database..." 
        : "Génération de la présentation complète depuis la base de données...";
      setVoiceFeedback({
        text: waitMsg,
        type: 'info'
      });
      speakText(isEn ? "One moment, loading complete summary..." : "Un instant, chargement de ma présentation complète...");

      logVoiceCommandToHistory(
        transcript,
        'descriptive',
        isEn ? "Requested complete profile summary" : "Demande de présentation complète de profil",
        'info'
      );

      // Async retrieval in background to keep UI non-blocking
      (async () => {
        try {
          const data = await fetchPortfolioConfig();
        if (data) {
            const ownerName = data.ownerName || 'Dels';
            const ownerTitle = `${data.ownerTitlePrefix || (isEn ? 'Full-Stack Developer' : 'Développeur Full-Stack')} ${data.ownerTitleSuffix || (isEn ? '& Data Scientist' : '& Data Scientist')}`;
            
            let finalSpeech = '';
            let finalVisual = '';

            if (isEn) {
              finalSpeech = `Hello! Here is my complete live presentation. I am ${ownerName}, working as a ${ownerTitle}. `;
              
              if (data.aboutParagraphs && data.aboutParagraphs.length > 0) {
                finalSpeech += `${data.aboutParagraphs[0]} `;
                if (data.aboutParagraphs[1]) {
                  finalSpeech += `${data.aboutParagraphs[1]} `;
                }
              }

              if (data.skills && data.skills.length > 0) {
                const specSnip = data.skills.map((cat: any) => {
                  const sub = (cat.skills || []).slice(0, 3).map((s: any) => s.name).join(', ');
                  return `${cat.title || 'Skills'}: ${sub}`;
                }).join('. ');
                finalSpeech += `My core engineering competencies are: ${specSnip}. `;
              }

              if (data.experiences && data.experiences.length > 0) {
                const publicExps = data.experiences.filter((e: any) => e.status !== 'draft');
                if (publicExps.length > 0) {
                  const expSnip = publicExps.slice(0, 2).map((exp: any) => {
                    return `${exp.title || 'Role'} at ${exp.company || 'Company'} during ${exp.period || 'recent years'}`;
                  }).join(', and ');
                  finalSpeech += `My professional career spans roles such as: ${expSnip}. `;
                }
              }

              if (data.projects && data.projects.length > 0) {
                const projSnip = data.projects.slice(0, 2).map((p: any) => p.title || 'Project').join(', ');
                finalSpeech += `My standout portfolio projects include: ${projSnip}. `;
              }

              finalSpeech += "This is a full presentation of my profile. Feel free to download my complete CV or reach out via the contact form!";

              const topSkills = data.skills && data.skills.length > 0 ? data.skills.slice(0, 2).map((c: any) => c.title).join(', ') : 'Dev & Data';
              const latestRole = data.experiences && data.experiences.length > 0 ? (data.experiences[0]?.title + ' @ ' + data.experiences[0]?.company) : 'Senior Expert';
              finalVisual = `📋 Profile Summary:\n• Name: ${ownerName}\n• Role: ${ownerTitle}\n• Fields: ${topSkills}\n• Career: ${latestRole}\n\nPlease contact me in the form below!`;

            } else {
              finalSpeech = `Bonjour ! Voici ma présentation complète basée sur mes données réelles. Je m'appelle ${ownerName}, et je suis ${ownerTitle}. `;
              
              if (data.aboutParagraphs && data.aboutParagraphs.length > 0) {
                finalSpeech += `${data.aboutParagraphs[0]} `;
                if (data.aboutParagraphs[1]) {
                  finalSpeech += `${data.aboutParagraphs[1]} `;
                }
              }

              if (data.skills && data.skills.length > 0) {
                const specSnip = data.skills.map((cat: any) => {
                  const sub = (cat.skills || []).slice(0, 3).map((s: any) => s.name).join(', ');
                  return `${cat.title || 'Compétence'}: ${sub}`;
                }).join('. ');
                finalSpeech += `Mes compétences techniques majeures incluent : ${specSnip}. `;
              }

              if (data.experiences && data.experiences.length > 0) {
                const publicExps = data.experiences.filter((e: any) => e.status !== 'draft');
                if (publicExps.length > 0) {
                  const expSnip = publicExps.slice(0, 2).map((exp: any) => {
                    return `${exp.title || 'Poste'} chez ${exp.company || 'Société'} sur la période de ${exp.period || 'récurrente'}`;
                  }).join(', puis ');
                  finalSpeech += `Mon parcours comprend des opportunités clés en tant que : ${expSnip}. `;
                }
              }

              if (data.projects && data.projects.length > 0) {
                const projSnip = data.projects.slice(0, 2).map((p: any) => p.title || 'Projet').join(', ');
                finalSpeech += `Parmi mes créations et projets notables, on retrouve : ${projSnip}. `;
              }

              finalSpeech += "C'est un résumé complet de mes réalisations. Je me tiens à votre entière disposition pour échanger ou collaborer sur un futur projet !";

              const topSkills = data.skills && data.skills.length > 0 ? data.skills.slice(0, 2).map((c: any) => c.title).join(', ') : 'Dev & Data';
              const latestRole = data.experiences && data.experiences.length > 0 ? (data.experiences[0]?.title + ' @ ' + data.experiences[0]?.company) : 'Expert senior';
              finalVisual = `📋 Résumé du profil :\n• Nom : ${ownerName}\n• Titre : ${ownerTitle}\n• Domaines : ${topSkills}\n• Expérience : ${latestRole}\n\nN'hésitez pas à me joindre en bas de page !`;
            }

            // Speak the complete resolved speech text
            speakText(finalSpeech);

            setVoiceFeedback({
              text: finalVisual,
              type: 'success'
            });

            // Smooth scroll to intro section (About)
            setActiveSection('about');
            setIsMobileMenuOpen(false);
            const aboutEl = document.getElementById('about');
            if (aboutEl) {
              aboutEl.scrollIntoView({ behavior: 'smooth' });
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            logVoiceCommandToHistory(
              transcript,
              'descriptive',
              isEn ? "Successfully generated and read profile summary speech." : "Lecture et affichage réussis de la présentation complète.",
              'success'
            );

          } else {
            throw new Error("Could not fetch profile config source");
          }
        } catch (err) {
          console.warn("Complete presentation fallback:", err);
          const fallbackSpeech = isEn 
            ? "I am Dels, an expert in full-stack engineering and data science. I help clients build responsive, intelligent, and highly optimized platforms, with extensive expertise in Python, React, and Machine learning."
            : "Je suis Dels, développeur Full-Stack et Data Scientist passionné par la frontière entre le développement web et l'Intelligence Artificielle. J'aide les entreprises à transformer des données complexes en applications performantes, élégantes et intuitives.";
          
          speakText(fallbackSpeech);
          setVoiceFeedback({
            text: fallbackSpeech,
            type: 'success'
          });
          
          setActiveSection('about');
          const aboutEl = document.getElementById('about');
          if (aboutEl) aboutEl.scrollIntoView({ behavior: 'smooth' });
        }
      })();

      return;
    }

    // Custom voice macros matching and sequential execution
    let activeMacros = voiceMacros;
    if (!activeMacros || activeMacros.length === 0) {
      activeMacros = [
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
    }

    const matchedMacro = activeMacros.find((macro: any) => {
      const cleanTrigger = (macro.trigger || '').toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\_`~()?¿¡"“”«»]/g, " ").replace(/\s+/g, " ").trim();
      return cleanedText === cleanTrigger || cleanedText.includes(cleanTrigger);
    });

    if (matchedMacro) {
      const steps = matchedMacro.actions || [];
      if (steps.length > 0) {
        logVoiceCommandToHistory(
          transcript,
          'navigation',
          isEn 
            ? `Triggered macro sequence: "${matchedMacro.name}"`
            : `Lancement de la séquence macro : "${matchedMacro.name}"`,
          'success'
        );

        // Cancel previous macro before starting
        macroCancelRef.current = true;
        
        setTimeout(async () => {
          macroCancelRef.current = false;
          
          const startMsg = isEn 
            ? `Starting macro sequence "${matchedMacro.name}". Preparing ${steps.length} actions.`
            : `Démarrage de la macro-commande "${matchedMacro.name}". Préparation de ${steps.length} étapes.`;
          
          speakText(startMsg);
          setVoiceFeedback({
            text: startMsg,
            type: 'info'
          });
          
          // Wait briefly for initial intro speech
          await new Promise(resolve => setTimeout(resolve, 3800));
          
          for (let i = 0; i < steps.length; i++) {
            if (macroCancelRef.current) {
              break;
            }
            
            const stepSection = steps[i];
            
            // Execute navigation
            setActiveSection(stepSection);
            setIsMobileMenuOpen(false);
            const targetSecEl = document.getElementById(stepSection);
            if (targetSecEl) {
              targetSecEl.scrollIntoView({ behavior: 'smooth' });
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            
            // Speak transition description
            let stepMsg = '';
            if (isEn) {
              if (stepSection === 'home') stepMsg = "Going to start overview.";
              else if (stepSection === 'about') stepMsg = "Viewing the biography and intro.";
              else if (stepSection === 'skills') stepMsg = "Viewing the skills list.";
              else if (stepSection === 'services') stepMsg = "Viewing the services catalogue.";
              else if (stepSection === 'certifications') stepMsg = "Viewing the certificates.";
              else if (stepSection === 'projects') stepMsg = "Showing the projects gallery.";
              else if (stepSection === 'experience') stepMsg = "Viewing the timeline.";
              else if (stepSection === 'pipeline') stepMsg = "Viewing the pipeline diagram.";
              else if (stepSection === 'ml-playground') stepMsg = "Showing the machine learning playground.";
              else if (stepSection === 'cv-generator') stepMsg = "Showing the CV builder.";
              else if (stepSection === 'terminal') stepMsg = "Showing the interactive shell.";
              else if (stepSection === 'blog') stepMsg = "Showing the articles list.";
              else if (stepSection === 'contact') stepMsg = "Showing the email and contact form.";
              else stepMsg = `Showing the ${stepSection} section.`;
              
              stepMsg += ` Step ${i + 1} of ${steps.length}.`;
            } else {
              if (stepSection === 'home') stepMsg = "Retour vers l'accueil.";
              else if (stepSection === 'about') stepMsg = "Affichage de la présentation.";
              else if (stepSection === 'skills') stepMsg = "Affichage des compétences techniques.";
              else if (stepSection === 'services') stepMsg = "Voici les services proposés.";
              else if (stepSection === 'certifications') stepMsg = "Découverte des certifications.";
              else if (stepSection === 'projects') stepMsg = "Affichage du portfolio de projets.";
              else if (stepSection === 'experience') stepMsg = "Ouverture de l'historique de carrière.";
              else if (stepSection === 'pipeline') stepMsg = "Déploiement du pipeline analytique.";
              else if (stepSection === 'ml-playground') stepMsg = "Ouverture de l'espace intelligence artificielle.";
              else if (stepSection === 'cv-generator') stepMsg = "Lancement de l'éditeur de documents.";
              else if (stepSection === 'terminal') stepMsg = "Démarrage de la ligne de commande.";
              else if (stepSection === 'blog') stepMsg = "Voici les publications rédigées.";
              else if (stepSection === 'contact') stepMsg = "Rendez-vous sur le formulaire de messagerie.";
              else stepMsg = `Affichage de la section ${stepSection}.`;
              
              stepMsg += ` Étape ${i + 1} sur ${steps.length}.`;
            }
            
            speakText(stepMsg);
            setVoiceFeedback({
              text: isEn 
                ? `Macro Action: Navigating to ${stepSection.toUpperCase()} (${i+1}/${steps.length})`
                : `Action Macro : Navigation vers ${stepSection.toUpperCase()} (${i+1}/${steps.length})`,
              type: 'success'
            });
            
            // Wait 5.5 seconds per step so user gathers context
            await new Promise(resolve => setTimeout(resolve, 5500));
          }
          
          if (!macroCancelRef.current) {
            const finalMsg = isEn 
              ? `Completed macro: ${matchedMacro.name}.`
              : `Séquence macro terminée : ${matchedMacro.name}.`;
            speakText(finalMsg);
            setVoiceFeedback({
              text: finalMsg,
              type: 'success'
            });
            setTimeout(() => setVoiceFeedback({ text: '', type: null }), 4000);
          }
        }, 50);
        
        return;
      }
    }

    // Advanced Speech Conversational Answers (responds verbally without scrolling)
    let replySpeech = '';
    
    const navIndicators = [
      'aller dans', 'aller à', 'aller au', 'aller aux', 'aller sur', 'va dans', 'va à', 'va au', 'va aux', 'va sur',
      'visiter', 'visite', 'naviguer', 'naviguer vers', 'navigue vers', 'montre', 'montrer', 'afficher', 'affiche',
      'go to', 'visit', 'show', 'navigate to', 'take me to', 'open', 'ouvre', 'dirige-toi', 'dirige-toi vers', 'visualiser', 'visualise'
    ];
    const hasNavIntent = navIndicators.some(indicator => cleanedText.includes(indicator));

    if (!hasNavIntent) {
      if (isHopsonMode) {
        if (isEn) {
          if (cleanedText.includes('who') || cleanedText.includes('present') || cleanedText.includes('about') || cleanedText.includes('story') || cleanedText.includes('who are you')) {
            replySpeech = "We are Mike and Dels. This secret space celebrates our absolute connection and our unique love story.";
          } else if (cleanedText.includes('surprise') || cleanedText.includes('secret')) {
            replySpeech = "Shhh! It's a secret. Unlock the magic surprises to find out more.";
          } else if (cleanedText.includes('skill') || cleanedText.includes('succeed') || cleanedText.includes('expert')) {
            replySpeech = "Our main skills are infinite love, deep tenderness, absolute complicity, and mutual listening.";
          }
        } else {
          if (cleanedText.includes('qui') || cleanedText.includes('présente') || cleanedText.includes('propos') || cleanedText.includes('histoire') || cleanedText.includes('qui es-tu')) {
            replySpeech = "Nous sommes Mike et Dels. Cet espace secret célèbre notre complicité absolue et notre histoire unique d'amour.";
          } else if (cleanedText.includes('surprise') || cleanedText.includes('secret')) {
            replySpeech = "Chut ! C'est un secret. Débloque les surprises magiques pour en savoir plus.";
          } else if (cleanedText.includes('compétence') || cleanedText.includes('sait faire') || cleanedText.includes('skills')) {
            replySpeech = "Nos principales compétences sont l'amour infini, la tendresse, la complicité et l'écoute mutuelle.";
          }
        }
      } else {
        if (isEn) {
          if (cleanedText.includes('skill') || cleanedText.includes('know-how') || cleanedText.includes('know how') || cleanedText.includes('technologies') || cleanedText.includes('sais faire') || cleanedText.includes('capable of') || cleanedText.includes('do') || cleanedText.includes('competence') || cleanedText.includes('competences')) {
            replySpeech = "Dels is an expert in full-stack engineering and data science. His core skills include Python, React, Node.js, TypeScript, Tailwind CSS, and PostgreSQL. In data science, he is highly proficient in Pandas, Scikit-learn, TensorFlow, and machine learning models.";
          } else if (cleanedText.includes('who are you') || cleanedText.includes('present') || cleanedText.includes('who is dels') || cleanedText.includes('biography') || cleanedText.includes('tell me about you') || cleanedText.includes('introduce')) {
            replySpeech = "I am Dels, a full-stack developer and Data Scientist. I am absolutely passionate about the bridge between beautiful web products and artificial intelligence. I help clients build responsive, intelligent, and highly optimized platforms.";
          } else if (cleanedText.includes('project') || cleanedText.includes('creation') || cleanedText.includes('creations') || cleanedText.includes('projects')) {
            replySpeech = "Dels has designed spectacular projects, including a predictive sales and e-commerce analytics dashboard, an medical image classification scanner, and an interactive real-time sentiment analysis engine powered by BERT.";
          } else if (cleanedText.includes('experience') || cleanedText.includes('career') || cleanedText.includes('resume') || cleanedText.includes('cv') || cleanedText.includes('worked') || cleanedText.includes('background')) {
            replySpeech = "Dels has rich professional background including roles like Senior Data Scientist at Tech Innovators, building automated ETL lines, and Lead Full-Stack Coder at WebSolutions Agency.";
          } else if (cleanedText.includes('contact') || cleanedText.includes('write') || cleanedText.includes('reach') || cleanedText.includes('email') || cleanedText.includes('message')) {
            replySpeech = "You can easily contact Dels by filling out the form at the bottom of this portfolio page. He looks forward to cooperating with you.";
          }
        } else {
          if (cleanedText.includes('compétence') || cleanedText.includes('sait faire') || cleanedText.includes('savoir faire') || cleanedText.includes('skills') || cleanedText.includes('technologies') || cleanedText.includes('sais faire')) {
            replySpeech = "Dels est expert en développement full-stack et data science. Ses compétences majeures comprennent le langage Python, et les frameworks et librairies React, Node.js, TypeScript, Tailwind CSS et PostgreSQL. En data science, il maîtrise Pandas, Scikit-learn, TensorFlow et l'apprentissage automatique.";
          } else if (cleanedText.includes('qui es-tu') || cleanedText.includes('présente') || cleanedText.includes('qui est dels') || cleanedText.includes('biographie') || cleanedText.includes('qui est-il') || cleanedText.includes('présentation')) {
            replySpeech = "Je suis Dels, développeur Full-Stack et Data Scientist passionné par la frontière entre le développement web et l'Intelligence Artificielle. J'aide les entreprises à transformer des données complexes en applications performantes, élégantes et intuitives.";
          } else if (cleanedText.includes('projet') || cleanedText.includes('réalisation') || cleanedText.includes('création') || cleanedText.includes('projects')) {
            replySpeech = "Dels a conçu plusieurs projets remarquables, comme un tableau de bord analytique e-commerce prédictif utilisant le machine learning, un modèle de détection de maladies par classification d'images médicales, et un de nos favoris : l'analyseur de sentiments en temps réel basé sur BERT.";
          } else if (cleanedText.includes('expérience') || cleanedText.includes('parcours') || cleanedText.includes('cv') || cleanedText.includes('travaillé') || cleanedText.includes('work') || cleanedText.includes('carrière')) {
            replySpeech = "Le parcours de Dels comprend des rôles clés comme Data Scientist Senior chez Tech Innovators, où il a développé des pipelines de données automatisés, et comme Développeur Full-Stack chez WebSolutions Agency, spécialisé dans la conception d'interfaces réactives et l'intégration de paiements.";
          } else if (cleanedText.includes('contact') || cleanedText.includes('écrire') || cleanedText.includes('joindre') || cleanedText.includes('email') || cleanedText.includes('adresse')) {
            replySpeech = "Vous pouvez contacter Dels facilement en remplissant le formulaire de contact en bas de page. Il se fera une grande joie d'échanger avec vous.";
          }
        }
      }
    }

    if (replySpeech) {
      speakText(replySpeech, true);
      logVoiceCommandToHistory(
        transcript,
        'descriptive',
        replySpeech,
        'success'
      );
      const isMuted = localStorage.getItem('voice_mute_speak') === 'true';
      setVoiceFeedback({
        text: isMuted ? `IA : "${replySpeech}"` : `Audio : "${replySpeech}"`,
        type: 'success'
      });
      setTimeout(() => {
        setVoiceFeedback({ text: '', type: null });
      }, 9000);
      return;
    }
    
    const commands: Record<string, string> = isHopsonMode
      ? {
          'accueil': 'home',
          'home': 'home',
          'départ': 'home',
          'start': 'home',
          'propos': 'about',
          'about': 'about',
          'histoire': 'love-stories',
          'stories': 'love-stories',
          'story': 'love-stories',
          'surprise': 'surprises',
          'surprises': 'surprises',
          'elixir': 'elixir',
          'élixir': 'elixir',
          'roue': 'wheel',
          'wheel': 'wheel',
          'clic': 'clicker',
          'clicker': 'clicker',
          'code': 'romanticCoder',
          'coder': 'romanticCoder',
          'respi': 'breathing',
          'breathing': 'breathing',
          'terminal': 'terminal',
          'console': 'terminal',
        }
      : {
          'accueil': 'home',
          'home': 'home',
          'départ': 'home',
          'start': 'home',
          'début': 'home',
          'debut': 'home',
          'propos': 'about',
          'about': 'about',
          'présentation': 'about',
          'presentation': 'about',
          'qui es-tu': 'about',
          'qui est-il': 'about',
          'biographie': 'about',
          'profil': 'about',
          'profile': 'about',
          'service': 'services',
          'services': 'services',
          'prestations': 'services',
          'prestation': 'services',
          'catalogue': 'services',
          'offres': 'services',
          'offre': 'services',
          'compétence': 'skills',
          'compétences': 'skills',
          'skills': 'skills',
          'skill': 'skills',
          'technologie': 'skills',
          'technologies': 'skills',
          'savoir-faire': 'skills',
          'savoir faire': 'skills',
          'sais faire': 'skills',
          'certification': 'certifications',
          'certifications': 'certifications',
          'diplômes': 'certifications',
          'diplome': 'certifications',
          'certificats': 'certifications',
          'projet': 'projects',
          'projets': 'projects',
          'project': 'projects',
          'projects': 'projects',
          'réalisations': 'projects',
          'realisations': 'projects',
          'portfolio': 'projects',
          'création': 'projects',
          'créations': 'projects',
          'expérience': 'experience',
          'expériences': 'experience',
          'experience': 'experience',
          'experiences': 'experience',
          'parcours': 'experience',
          'carrière': 'experience',
          'carriere': 'experience',
          'cv': 'experience',
          'resume': 'cv-generator',
          'pipeline': 'pipeline',
          'data pipeline': 'pipeline',
          'visualiseur de pipeline': 'pipeline',
          'ml': 'ml-playground',
          'playground': 'ml-playground',
          'machine learning': 'ml-playground',
          'apprentissage automatique': 'ml-playground',
          'intelligence artificielle': 'ml-playground',
          'ia': 'ml-playground',
          'ai': 'ml-playground',
          'générateur cv': 'cv-generator',
          'générateur de cv': 'cv-generator',
          'resume builder': 'cv-generator',
          'cv builder': 'cv-generator',
          'generator': 'cv-generator',
          'terminal': 'terminal',
          'console': 'terminal',
          'shell': 'terminal',
          'invite de commande': 'terminal',
          'ligne de commande': 'terminal',
          'blog': 'blog',
          'articles': 'blog',
          'article': 'blog',
          'publications': 'blog',
          'publication': 'blog',
          'contact': 'contact',
          'adresse': 'contact',
          'écrire': 'contact',
          'écris': 'contact',
          'joindre': 'contact',
          'formulaire': 'contact',
        };

    let foundSection: string | null = null;
    const sortedKeys = Object.keys(commands).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (cleanedText.includes(key)) {
        foundSection = commands[key];
        break;
      }
    }

    if (foundSection) {
      setActiveSection(foundSection);
      setIsMobileMenuOpen(false);
      
      const targetSection = document.getElementById(foundSection);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      let navMsg = '';
      if (isEn) {
        if (foundSection === 'home') navMsg = "Navigating to home page.";
        else if (foundSection === 'about') navMsg = "Going to about page.";
        else if (foundSection === 'skills') navMsg = "Showing my skills and technical expertise.";
        else if (foundSection === 'services') navMsg = "Showing my services.";
        else if (foundSection === 'certifications') navMsg = "Opening certifications.";
        else if (foundSection === 'projects') navMsg = "Viewing my portfolio and projects.";
        else if (foundSection === 'experience') navMsg = "Opening my career experiences.";
        else if (foundSection === 'pipeline') navMsg = "Displaying the cloud data pipeline.";
        else if (foundSection === 'ml-playground') navMsg = "Welcome to the machine learning playground.";
        else if (foundSection === 'cv-generator') navMsg = "Opening the CV builder.";
        else if (foundSection === 'terminal') navMsg = "Launching the developer interactive terminal.";
        else if (foundSection === 'blog') navMsg = "Showing my blog publications.";
        else if (foundSection === 'contact') navMsg = "Opening the contact details and form.";
        else navMsg = `Directing you to ${foundSection}.`;
      } else {
        if (foundSection === 'home') navMsg = "Retour à l'accueil.";
        else if (foundSection === 'about') navMsg = "Direction la section de présentation.";
        else if (foundSection === 'skills') navMsg = "Voici mes compétences et mon expertise technique.";
        else if (foundSection === 'services') navMsg = "Affichage de la section de mes services.";
        else if (foundSection === 'certifications') navMsg = "Navigation vers mes certifications.";
        else if (foundSection === 'projects') navMsg = "Voici mon portfolio de projets.";
        else if (foundSection === 'experience') navMsg = "Ouverture de mon parcours d'expériences professionnelles.";
        else if (foundSection === 'pipeline') navMsg = "Voici le visualiseur de pipeline de données analytiques.";
        else if (foundSection === 'ml-playground') navMsg = "Bienvenue sur l'espace d'expérimentation d'intelligence artificielle.";
        else if (foundSection === 'cv-generator') navMsg = "Lancement de l'outil de conception de CV.";
        else if (foundSection === 'terminal') navMsg = "Initialisation de la console de commande.";
        else if (foundSection === 'blog') navMsg = "Voici mes publications et articles de blog.";
        else if (foundSection === 'contact') navMsg = "Je vous montre le formulaire de contact.";
        else navMsg = `Redirection vers la section ${foundSection}.`;
      }
      speakText(navMsg);
      logVoiceCommandToHistory(
        transcript,
        'navigation',
        isEn ? `Navigated to ${foundSection.toUpperCase()}. Audio: "${navMsg}"` : `Navigation vers la section ${foundSection.toUpperCase()}. Message audio : "${navMsg}"`,
        'success'
      );

      setVoiceFeedback({
        text: `Navigation vers : ${foundSection.toUpperCase()} ("${transcript}")`,
        type: 'success'
      });
      
      setTimeout(() => {
        setVoiceFeedback({ text: '', type: null });
      }, 4000);
    } else {
      logVoiceCommandToHistory(
        transcript,
        'unknown',
        isEn ? `Command not recognized. Tried: "${transcript}"` : `Commande non reconnue. Saisie : "${transcript}"`,
        'error'
      );

      setVoiceFeedback({
        text: `Commande non reconnue : "${transcript}". Essayez d'indiquer le nom d'une section.`,
        type: 'error'
      });
      setTimeout(() => {
        setVoiceFeedback({ text: '', type: null });
      }, 4500);
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setVoiceFeedback({
        text: "La reconnaissance vocale n'est pas supportée sur ce navigateur. Veuillez utiliser Chrome/Safari/Edge.",
        type: 'error'
      });
      setTimeout(() => setVoiceFeedback({ text: '', type: null }), 5000);
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // ignore abort issues
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      
      const storedLang = localStorage.getItem('voice_lang_preference') || 'fr-FR';
      recognition.lang = storedLang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceText('À l\'écoute...');
        
        const isEnglish = storedLang.toLowerCase().startsWith('en');
        const defaultPrompt = isEnglish 
          ? "Voice Command Active! Ask a question (e.g. 'What are your skills?') or say 'Go to Projects'" 
          : "Mode Commande Vocale Actif ! Posez une question (ex: 'Quelles sont tes compétences ?') ou dites 'Aller à Projets'";

        setVoiceFeedback({
          text: defaultPrompt,
          type: 'info'
        });
      };

      recognition.onerror = (event: any) => {
        const isBenign = event.error === 'no-speech' || event.error === 'aborted';
        if (isBenign) {
          console.info("Speech recognition info event:", event.error);
        } else {
          console.warn("Speech recognition warning/error event:", event.error);
        }
        setIsListening(false);
        let errorMsg = "Erreur de microphone ou d'autorisation.";
        let errType: 'error' | 'info' = 'error';

        if (event.error === 'not-allowed') {
          errorMsg = "Accès micro refusé. Veuillez accorder l'autorisation de microphone dans votre navigateur.";
        } else if (event.error === 'network') {
          errorMsg = "Erreur de connexion réseau lors de la reconnaissance vocale. Veuillez vérifier votre connexion.";
        } else if (event.error === 'no-speech') {
          errorMsg = "Aucune parole n'a été détectée. Veuillez vous exprimer clairement face au micro.";
          errType = 'info';
        } else if (event.error === 'aborted') {
          errorMsg = "L'écoute vocale a été annulée ou interrompue.";
          errType = 'info';
        }

        setVoiceFeedback({
          text: errorMsg,
          type: errType
        });
        setTimeout(() => setVoiceFeedback({ text: '', type: null }), 5000);
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.onresult = (event: any) => {
        const result = event.results[0][0];
        const transcript = result.transcript;
        const confidence = result.confidence || 0.8;

        const storedThreshold = localStorage.getItem('voice_confidence_threshold');
        const threshold = storedThreshold ? parseFloat(storedThreshold) : 0.4;

        if (confidence < threshold) {
          const isEnglish = storedLang.toLowerCase().startsWith('en');
          const warningMsg = isEnglish
            ? `Audio signal weak or unclear (confidence: ${Math.round(confidence * 100)}% < threshold: ${Math.round(threshold * 100)}%). Please speak clearly.`
            : `Signal trop faible ou incertain (confiance: ${Math.round(confidence * 100)}% < seuil: ${Math.round(threshold * 100)}%). Parlez plus clairement.`;
          
          setVoiceFeedback({
            text: warningMsg,
            type: 'error'
          });
          setTimeout(() => setVoiceFeedback({ text: '', type: null }), 5000);
          return;
        }

        handleVoiceCommand(transcript);
      };

      recognition.start();
    } catch (e) {
      console.warn("Speech recognition initialization caught error:", e);
      setIsListening(false);
      setVoiceFeedback({
        text: "Erreur d'initialisation de la reconnaissance vocale.",
        type: 'error'
      });
      setTimeout(() => setVoiceFeedback({ text: '', type: null }), 4000);
    }
  };

  const [isBgTriggerEnabled, setIsBgTriggerEnabled] = useState(false);
  const bgRecognitionRef = React.useRef<any>(null);

  useEffect(() => {
    const checkSettings = () => {
      const voiceTestingActive = localStorage.getItem('voice_testing_active') === 'true';
      const enabled = (localStorage.getItem('voice_bg_trigger_enabled') === 'true') && !voiceTestingActive;
      setIsBgTriggerEnabled(enabled);
      const lang = localStorage.getItem('voice_lang_preference') || 'fr-FR';
      setVoiceLang(lang);
      setVoiceMuteSpeak(localStorage.getItem('voice_mute_speak') === 'true');
      setVoiceTriggerKeywords(localStorage.getItem('voice_trigger_keywords') || 'dels, bonjour dels');
      setVoiceStopKeywords(localStorage.getItem('voice_stop_keywords') || "c'est bon, arrête, attend, stop");
      
      try {
        const raw = localStorage.getItem('voice_macros');
        if (raw) {
          setVoiceMacros(JSON.parse(raw));
        }
      } catch (e) {
        console.warn("Could not parse macros in Header checkSettings:", e);
      }
    };

    checkSettings();
    window.addEventListener('voice_settings_updated', checkSettings);
    return () => window.removeEventListener('voice_settings_updated', checkSettings);
  }, []);

  useEffect(() => {
    if (!isBgTriggerEnabled || isListening) {
      if (bgRecognitionRef.current) {
        try {
          bgRecognitionRef.current.abort();
        } catch (e) {}
        bgRecognitionRef.current = null;
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    let active = true;
    let bgRec: any = null;

    const startBg = () => {
      if (!active || isListening) return;
      try {
        bgRec = new SpeechRecognition();
        bgRecognitionRef.current = bgRec;
        bgRec.continuous = true;
        bgRec.interimResults = false;
        
        const storedLang = localStorage.getItem('voice_lang_preference') || 'fr-FR';
        bgRec.lang = storedLang;

        bgRec.onresult = (e: any) => {
          const lastResultIndex = e.resultIndex;
          const tr = e.results[lastResultIndex][0].transcript.toLowerCase().trim();
          
          const rawKw = localStorage.getItem('voice_trigger_keywords') || 'dels, bonjour dels';
          const keywords = rawKw.split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean);

          const matched = keywords.some((kw: string) => tr.includes(kw));
          if (matched) {
            // Heard trigger wake word!
            const language = localStorage.getItem('voice_lang_preference') || 'fr-FR';
            const speakWord = language.toLowerCase().startsWith('en') 
              ? "Yes, please ask your question." 
              : "Oui, posez votre question.";
            speakText(speakWord);
            
            // Abort bg listener so it can be re-run on stop
            try { bgRec.abort(); } catch (err){}
            
            // Wait slightly for voice feedback output to clear, then start active listen
            setTimeout(() => {
              if (active && !isListening) {
                startSpeechRecognition();
              }
            }, 800);
          }
        };

        bgRec.onerror = (evt: any) => {
          if (evt.error === 'not-allowed') {
            active = false;
          }
        };

        bgRec.onend = () => {
          if (active && !isListening) {
            setTimeout(() => {
              if (active && !isListening) {
                startBg();
              }
            }, 1000);
          }
        };

        bgRec.start();
      } catch (err) {
        console.warn("Bg speech start caught error:", err);
      }
    };

    const timer = setTimeout(startBg, 1200);

    return () => {
      active = false;
      clearTimeout(timer);
      if (bgRec) {
        try { bgRec.abort(); } catch (e){}
      }
      bgRecognitionRef.current = null;
    };
  }, [isBgTriggerEnabled, isListening]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Dynamic SEO metadata mapping
    const seoMeta: Record<string, { title: string; description: string }> = isHopsonMode 
      ? {
          'home': {
            title: "Accueil - Hopson Love Space",
            description: "Plongez dans l'espace romantique et interactif de Hopson. Découvrez nos histoires et des modules insolites conçus avec amour."
          },
          'about': {
            title: "Notre Histoire - Hopson Romantique",
            description: "Le parcours unique et les souvenirs partagés de notre complicité racontés à travers un design interactif et poétique."
          },
          'love-stories': {
            title: "Histoires d'Amour & Anecdotes - Hopson",
            description: "Laissez-vous charmer par nos récits, anecdotes romantiques et mélodies préférées partagées avec passion."
          },
          'surprises': {
            title: "Surprises Secrètes - Hopson Spécial",
            description: "Découvrez des secrets cachés et déverrouillez des fonctionnalités uniques de complicité."
          },
          'elixir': {
            title: "Mélangeur d'Élixirs Magiques - Hopson",
            description: "Amusez-vous à combiner diverses essences amoureuses pour concocter votre philtre d'amour idéal."
          },
          'wheel': {
            title: "Roue de la Complicité - Test Match",
            description: "Faites tourner la roue de la complicité pour évaluer votre compatibilité et rire de nos anecdotes de couple."
          },
          'clicker': {
            title: "Love Clicker - Jeu d'Amour Infini",
            description: "Cliquez pour générer des vagues de cœurs et débloquer des mots doux mignons."
          },
          'romanticCoder': {
            title: "Le Développeur Romantique - Code & Passion",
            description: "Découvrez comment un développeur intègre du code et des sentiments pour créer de la poésie technologique."
          },
          'breathing': {
            title: "Boîte Respiratoire de Sérénité - Hopson",
            description: "Un espace pour respirer, se détendre et se recentrer ensemble grâce à un guide visuel adapté."
          },
          'terminal': {
            title: "Console Romantique - Terminal Interactive",
            description: "Saisissez des commandes secrètes dans notre terminal romantique pour révéler de joyeux easter-eggs."
          }
        }
      : {
          'home': {
            title: "Portfolio de Développeur Full-Stack & Data Scientist",
            description: "Bienvenue sur mon portfolio professionnel. Spécialiste React, Node.js et Machine Learning. Découvrez mes créations et compétences."
          },
          'about': {
            title: "À Propos - Développeur Web & Data Scientist",
            description: "Découvrez mon parcours académique et professionnel, mes motivations et ma vision à la frontière du Web et de l'Intelligence Artificielle."
          },
          'services': {
            title: "Prestations & Services - Dev Full-Stack & IA",
            description: "De la création de pipelines de données complexes à la conception d'applications web modernes sous React, découvrez mes services sur-mesure."
          },
          'skills': {
            title: "Compétences Techniques - Front-End, Back-End, ML",
            description: "Découvrez l'étendue de mon expertise technologique : React, TypeScript, Python, TensorFlow, SQL et architectures Cloud."
          },
          'certifications': {
            title: "Certifications Officielles & Formations - Portfolio",
            description: "Mes accomplissements académiques et mes certifications professionnelles garantissant des standards d'ingénierie et d'analyse élevés."
          },
          'projects': {
            title: "Mes Réalisations - Showcase Projets Web & Data",
            description: "Explorez mes projets innovants incluant des modélisations prédictives d'intelligence artificielle et des applications interactives."
          },
          'experience': {
            title: "Expériences Professionnelles & Témoignages Clients",
            description: "Historique de mes missions, mes rôles de lead technique à data scientist, complété par les recommandations authentiques de mes collaborateurs."
          },
          'pipeline': {
            title: "Data Pipeline Connect - Simulateur de Flux",
            description: "Visualisez en temps réel l'ingestion, la transformation et le stockage de données grâce à un simulateur de pipeline interactif."
          },
          'ml-playground': {
            title: "ML Playground - Démo de Machine Learning IA",
            description: "Entraînez des modèles de classification en direct sur votre navigateur et observez les frontières de décision changer dynamiquement."
          },
          'cv-generator': {
            title: "Générateur de CV Professionnel Interactif",
            description: "Personnalisez, structurez et exportez en PDF de haute fidélité un CV adapté de mon profil professionnel en quelques instants."
          },
          'terminal': {
            title: "Terminal Cybernétique Interactif - Portfolio",
            description: "Pour de plus amples détails, pilotez mon site d'une série de lignes de commandes d'administration inspirées de UNIX."
          },
          'blog': {
            title: "Blog Technique - Actualités High-Tech & IA",
            description: "Découvrez les derniers articles, guides et actualités technologiques réels extraits via Google Search sur le Machine Learning, Python et React."
          },
          'contact': {
            title: "Me Contacter - Collaboration & Opportunités",
            description: "Un projet à réaliser ou besoin de renfort technique ? Écrivez-moi directement pour planifier un rendez-vous d'échange."
          }
        };

    const currentMeta = seoMeta[activeSection] || seoMeta['home'];
    if (currentMeta) {
      document.title = currentMeta.title;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', currentMeta.description);
    }
  }, [activeSection, isHopsonMode]);

  const hasSkills = skills && Object.values(skills).some((arr: any) => arr && arr.length > 0);
  const hasProjects = projects && projects.length > 0;
  const hasExperience = (experiences && experiences.length > 0) || (testimonials && testimonials.length > 0);

  const isCompactDesktop = windowWidth >= 1024 && windowWidth < 1320;

  const mainNavLinks = [
        { name: 'Accueil', id: 'home', show: true },
        { name: 'À propos', id: 'about', show: true },
        { name: 'Compétences', id: 'skills', show: hasSkills },
        { name: 'Projets', id: 'projects', show: hasProjects },
        { name: 'Expérience', id: 'experience', show: hasExperience && !isCompactDesktop },
        { name: 'Certifications', id: 'certifications', show: !isCompactDesktop },
        { name: 'Services', id: 'services', show: !isCompactDesktop },
        { name: 'Contact', id: 'contact', show: true },
      ].filter(link => link.show);

  const dropdownNavLinks = [
        { name: 'Projets GitHub', id: 'github', show: true, desktopOnly: false },
        { name: 'Blog', id: 'blog', show: true, desktopOnly: false },
        { name: 'Expérience', id: 'experience', show: hasExperience && isCompactDesktop, desktopOnly: false },
        { name: 'Certifications', id: 'certifications', show: isCompactDesktop, desktopOnly: false },
        { name: 'Services', id: 'services', show: isCompactDesktop, desktopOnly: false },
        { name: 'Data Pipeline', id: 'pipeline', show: true, desktopOnly: true },
        { name: 'ML Playground', id: 'ml-playground', show: true, desktopOnly: true },
        { name: 'Terminal AI', id: 'terminal', show: true, desktopOnly: true },
        { name: 'Générateur CV', id: 'cv-generator', show: true, desktopOnly: true },
      ].filter(link => link.show);

  const navLinks = [...mainNavLinks, ...dropdownNavLinks];

  const handleNavClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveSection(id);
    setIsMobileMenuOpen(false);
    
    const targetSection = document.getElementById(id);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isDropdownActive = dropdownNavLinks.some(link => activeSection === link.id);

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm py-2 border-b border-slate-100/30 dark:border-slate-800/30'
            : 'bg-transparent py-3.5'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          {/* Left Side: Brand Indicator */}
          <div className="flex items-center gap-2 select-none">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-white bg-slate-100/80 dark:bg-slate-800/70 px-2.5 py-1.5 rounded-xl border border-slate-200/20 shadow-sm flex items-center gap-1.5">
              <Briefcase size={11} className="text-emerald-500 shrink-0" />
              <span>PORTFOLIO</span>
            </span>
          </div>

          {/* Desktop Nav - Centered, Flat & Clean with Dropdown */}
          <nav className="hidden lg:flex items-center justify-center">
            <ul className="flex flex-wrap items-center justify-center gap-1 xl:gap-2">
              {mainNavLinks.map((link) => (
                <li key={link.name} className="relative">
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => handleNavClick(link.id, e)}
                    className={`text-[11px] xl:text-[12px] font-extrabold transition-all relative py-1.5 px-2.5 xl:px-3 block cursor-pointer select-none uppercase tracking-wider rounded-lg hover:bg-slate-100/40 dark:hover:bg-slate-800/30 ${
                      activeSection === link.id
                        ? 'text-accent bg-accent/5 font-black'
                        : 'text-slate-600 hover:text-accent dark:text-slate-300 dark:hover:text-accent'
                    }`}
                  >
                    {link.name}
                    {activeSection === link.id && (
                      <motion.div
                        layoutId="activeSectionUnderline"
                        className="absolute bottom-0 left-2.5 right-2.5 xl:left-3 xl:right-3 h-0.5 bg-accent rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </a>
                </li>
              ))}

              {/* Auxiliary dropdown section */}
              {dropdownNavLinks.length > 0 && (
                <li
                  className="relative flex items-center"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-label="Menu d'outils"
                    className={`p-2 transition-all relative flex items-center justify-center cursor-pointer select-none rounded-lg hover:bg-slate-100/45 dark:hover:bg-slate-800/30 ${
                      isDropdownActive
                        ? 'text-accent bg-accent/5 font-black'
                        : 'text-slate-600 hover:text-accent dark:text-slate-300 dark:hover:text-accent'
                    }`}
                  >
                    <Menu size={18} className="transition-transform duration-200 active:scale-95" />
                    {isDropdownActive && (
                      <motion.div
                        layoutId="activeSectionUnderline"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-3 w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-150/40 dark:border-slate-800/40 rounded-xl shadow-xl py-2 z-50 flex flex-col"
                      >
                        {dropdownNavLinks.map((subLink) => (
                          <a
                            key={subLink.name}
                            href={`#${subLink.id}`}
                            onClick={(e) => {
                              handleNavClick(subLink.id, e);
                              setIsDropdownOpen(false);
                            }}
                            className={`text-[11px] font-black uppercase tracking-wider px-4 py-2 text-left flex items-center justify-between cursor-pointer transition-all hover:bg-slate-100/60 dark:hover:bg-slate-800/60 ${
                              activeSection === subLink.id
                                ? 'text-accent bg-accent/5 font-black'
                                : 'text-slate-600 hover:text-accent dark:text-slate-300 dark:hover:text-accent'
                            }`}
                          >
                            <span>{subLink.name}</span>
                            {subLink.desktopOnly && (
                              <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded font-mono">
                                PC
                              </span>
                            )}
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              )}
            </ul>
          </nav>

          {/* Right Side: Social Share & Mic on Desktop & Mobile, plus Mobile Toggle */}
          <div className="flex items-center gap-2">
            <span className="hidden xl:inline text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">Partager :</span>
            
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:p-2 text-slate-500 hover:text-[#0077b5] dark:text-slate-400 dark:hover:text-[#0a66c2] bg-slate-100/80 hover:bg-slate-200/85 dark:bg-slate-800/60 dark:hover:bg-slate-800/90 rounded-xl border border-slate-200/20 transition-all flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              title="Partager sur LinkedIn"
            >
              <Linkedin size={13} />
            </a>
            


            {/* Microphone Voice Control Help Button */}
            <button
              onClick={() => setIsAudioHelpOpen(true)}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-100/80 hover:bg-slate-200/85 dark:bg-slate-800/60 dark:hover:bg-slate-800/90 rounded-xl border border-slate-200/20 transition-all flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              title="Aide Vocale & Lexique des commandes"
            >
              <HelpCircle size={13} className="text-slate-500 dark:text-slate-400" />
            </button>

            {/* Microphone Voice Control Button */}
            <button
              onClick={startSpeechRecognition}
              className={`p-1.5 sm:p-2 border transition-all flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95 rounded-xl ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 border-red-500/30 text-white animate-pulse'
                  : 'text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 bg-slate-100/80 hover:bg-slate-200/85 dark:bg-slate-800/60 dark:hover:bg-slate-800/90 border-slate-200/20'
              }`}
              title="Activer le contrôle vocal (Reconnaissance vocale de navigation)"
            >
              <Mic size={13} className={isListening ? 'text-white' : ''} />
            </button>

            {/* Admin Panel Toggle Button */}
            <button
              id="admin-header-btn"
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`p-1.5 sm:p-2 border transition-all flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95 rounded-xl relative ${
                isAdminMode
                  ? 'bg-emerald-550/20 border-emerald-500/40 text-emerald-400 font-bold'
                  : hasSuspiciousAlert
                    ? 'border-rose-500/40 bg-rose-500/10 text-rose-500 dark:text-rose-400'
                    : 'text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 bg-slate-100/80 hover:bg-slate-200/85 dark:bg-slate-800/60 dark:hover:bg-slate-800/90 border-slate-200/20'
              }`}
              title={
                hasSuspiciousAlert
                  ? (isEn ? "Admin panel (⚠️ Suspicious Activity Warning!)" : "Panneau d'administration (⚠️ Activité suspecte détectée !)")
                  : (isEn ? "Open Admin Panel" : "Ouvrir le panneau d'administration")
              }
            >
              {hasSuspiciousAlert ? (
                <ShieldAlert size={13} className="text-[#f43f5e] animate-pulse" />
              ) : (
                <Shield size={13} />
              )}
              {/* Flashing Red Notification Badge */}
              {hasSuspiciousAlert && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f43f5e] border border-slate-900"></span>
                </span>
              )}
            </button>

            {/* Mobile / Tablet Nav Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-slate-600 dark:text-slate-300 p-2 cursor-pointer flex items-center justify-center bg-slate-100/80 dark:bg-slate-800/70 backdrop-blur-md rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm"
            >
              {isMobileMenuOpen ? <X size={14} /> : <Menu size={14} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.15 }}
              className="lg:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg py-4 px-4 flex flex-col gap-2.5 border-b border-slate-150/40 dark:border-slate-800/40 max-h-[85vh] overflow-y-auto"
            >
              {mainNavLinks.map((link) => (
                <a
                  key={link.name}
                  href={`#${link.id}`}
                  onClick={(e) => handleNavClick(link.id, e)}
                  className={`text-[11px] font-bold uppercase tracking-wider py-2 px-3 rounded-lg transition-all ${
                    activeSection === link.id
                      ? 'text-accent bg-accent/5 font-extrabold shadow-sm'
                      : 'text-slate-600 hover:text-accent dark:text-slate-300 dark:hover:text-accent hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {link.name}
                </a>
              ))}

              {dropdownNavLinks.length > 0 && (
                <div className="flex flex-col gap-1 border-t border-slate-150/60 dark:border-slate-850/60 pt-2.5 mt-1">
                  <button
                    onClick={() => setIsMobileSubmenuOpen(!isMobileSubmenuOpen)}
                    className={`flex items-center justify-between text-[11px] font-bold uppercase tracking-wider py-2 px-3 rounded-lg transition-all text-slate-500 hover:text-accent dark:hover:text-accent ${
                      isDropdownActive ? 'text-accent bg-accent/5 font-extrabold shadow-sm' : ''
                    }`}
                  >
                    <span>Lab & Outils</span>
                    <ChevronDown size={12} className={`transition-transform duration-200 ${isMobileSubmenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isMobileSubmenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden flex flex-col gap-1 pl-4 py-1.5"
                      >
                        {dropdownNavLinks.map((link) => (
                          <a
                            key={link.name}
                            href={`#${link.id}`}
                            onClick={(e) => {
                              handleNavClick(link.id, e);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`text-[10.5px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg transition-all flex items-center justify-between ${
                              activeSection === link.id
                                ? 'text-accent font-extrabold bg-accent/5'
                                : 'text-slate-500 hover:text-accent dark:text-slate-400 dark:hover:text-accent hover:bg-slate-50 dark:hover:bg-slate-850/40'
                            }`}
                          >
                            <span>{link.name}</span>
                            {link.desktopOnly && (
                              <span className="text-[8px] tracking-normal font-black bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded font-mono">
                                ÉCRAN LARGE
                              </span>
                            )}
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Mobile Voice control */}
              <div className="mt-2 pt-3 border-t border-slate-150/60 dark:border-slate-855/60 flex flex-col gap-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-505 font-mono text-center flex items-center justify-center gap-1">
                  <Mic size={10} className="text-indigo-500 shrink-0" />
                  <span>Contrôle Vocal de Navigation</span>
                </span>
                <div className="grid grid-cols-5 gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      startSpeechRecognition();
                    }}
                    className={`col-span-4 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-[9.5px] font-bold uppercase font-mono tracking-wider transition-all cursor-pointer ${
                      isListening
                        ? 'bg-red-500 text-white border-red-500/30 animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-red-500 border-slate-200/20'
                    }`}
                  >
                    <Mic size={11.5} /> {isListening ? 'À l\'écoute active...' : 'Activer le Micro / Parler'}
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAudioHelpOpen(true);
                    }}
                    className="col-span-1 flex items-center justify-center py-2 px-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-550 dark:text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-all font-mono text-[9.5px] font-bold"
                    title="Aide vocabulaire"
                  >
                    <HelpCircle size={12} />
                  </button>
                </div>
              </div>



              {/* Mobile Share section */}
              <div className="mt-4 pt-4 border-t border-slate-150/60 dark:border-slate-855/60 flex flex-col gap-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-505 font-mono text-center flex items-center justify-center gap-1">
                  <Share2 size={10} className="text-emerald-500 shrink-0" />
                  <span>Partager ce Portfolio</span>
                </span>
                <div className="flex gap-2 justify-center">
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-[#0a66c2] dark:hover:text-[#0a66c2] rounded-lg border border-slate-200/20 text-[9px] font-bold uppercase font-mono tracking-wider transition-all"
                  >
                    <Linkedin size={11} /> LinkedIn
                  </a>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Voice Control Status/Feedback Banner */}
      <AnimatePresence>
        {voiceFeedback.type && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 right-4 z-50 p-3.5 rounded-2xl shadow-xl border w-72 backdrop-blur-md flex flex-col gap-1.5 transition-all ${
              voiceFeedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : voiceFeedback.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-800 dark:text-indigo-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {isListening && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isListening ? 'bg-red-500' : voiceFeedback.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest font-black">
                {isListening ? 'Contrôle vocal actif' : voiceFeedback.type === 'success' ? 'Command acceptée' : 'Microphone'}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed font-medium font-sans">
              {voiceFeedback.text}
            </p>
            {isListening && (
              <span className="text-[8.5px] font-mono text-slate-400 dark:text-slate-500 italic mt-0.5">
                Essayez : "Quelles sont tes compétences ?" ou "Présente-toi" ou "Aller aux projets"
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Voice Response Wave-form Indicator */}
      <AnimatePresence>
        {isTtsSpeaking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            className="fixed bottom-6 left-6 z-50 bg-slate-900/90 dark:bg-slate-950/95 border border-emerald-500/30 p-3.5 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col gap-2 min-w-56 backdrop-blur-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-mono tracking-widest font-black text-emerald-400">
                  DELS RÉPOND
                </span>
              </div>
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined' && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    setIsTtsSpeaking(false);
                  }
                }}
                className="text-[9px] font-mono text-slate-500 hover:text-rose-400 transition-colors uppercase font-bold tracking-wider"
              >
                Passer
              </button>
            </div>

            {/* Glowing wave-form animation lines */}
            <div className="flex items-center justify-center gap-1.5 h-10 px-2 bg-slate-950/50 rounded-xl border border-slate-850/60 overflow-hidden">
              <div className="flex items-end justify-center gap-[3px] h-6 w-full">
                <motion.div 
                  animate={{ height: ["10%", "60%", "20%", "90%", "10%"] }} 
                  transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }} 
                  className="w-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full" 
                />
                <motion.div 
                  animate={{ height: ["15%", "85%", "40%", "95%", "15%"] }} 
                  transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut", delay: 0.15 }} 
                  className="w-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full" 
                />
                <motion.div 
                  animate={{ height: ["20%", "45%", "10%", "70%", "20%"] }} 
                  transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut", delay: 0.3 }} 
                  className="w-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full" 
                />
                <motion.div 
                  animate={{ height: ["10%", "95%", "30%", "85%", "10%"] }} 
                  transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0.05 }} 
                  className="w-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full" 
                />
                <motion.div 
                  animate={{ height: ["25%", "70%", "45%", "90%", "25%"] }} 
                  transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut", delay: 0.25 }} 
                  className="w-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full" 
                />
                <motion.div 
                  animate={{ height: ["10%", "50%", "20%", "80%", "10%"] }} 
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.4 }} 
                  className="w-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full" 
                />
                <motion.div 
                  animate={{ height: ["30%", "90%", "15%", "95%", "30%"] }} 
                  transition={{ repeat: Infinity, duration: 0.95, ease: "easeInOut", delay: 0.2 }} 
                  className="w-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full" 
                />
                <motion.div 
                  animate={{ height: ["10%", "40%", "30%", "75%", "10%"] }} 
                  transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.1 }} 
                  className="w-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full" 
                />
                <motion.div 
                  animate={{ height: ["15%", "80%", "20%", "90%", "15%"] }} 
                  transition={{ repeat: Infinity, duration: 1.05, ease: "easeInOut", delay: 0.35 }} 
                  className="w-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full" 
                />
                <motion.div 
                  animate={{ height: ["10%", "55%", "15%", "65%", "10%"] }} 
                  transition={{ repeat: Infinity, duration: 1.25, ease: "easeInOut", delay: 0.0 }} 
                  className="w-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full" 
                />
              </div>
            </div>
            
            <p className="text-[10px] text-slate-400 font-sans italic truncate max-w-[210px] text-center mt-0.5">
              Lecture audio en cours...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio Help Overlay / Cheat Sheet Modal */}
      <AnimatePresence>
        {isAudioHelpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 backdrop-blur-md bg-slate-950/80 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsAudioHelpOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-3xl bg-slate-900/95 dark:bg-slate-950/95 border border-slate-850 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-800/60 pb-5">
                <div className="space-y-1.5 pr-8">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                      <Mic size={18} className="animate-pulse" />
                    </span>
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-white font-sans">
                      {isEn ? "Voice Assistant Cheat Sheet" : "Guide de Contrôle Vocal Interactif"}
                    </h3>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-sans max-w-2xl">
                    {isEn 
                      ? "Control navigation, trigger shortcuts, and converse directly with Dels using natural speech commands right from your browser."
                      : "Pilotez ce portfolio de manière fluide, déclenchez des raccourcis et dialoguez avec Dels grâce à une reconnaissance vocale avancée."}
                  </p>
                </div>
                <button
                  onClick={() => setIsAudioHelpOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 rounded-xl border border-slate-750 transition-colors cursor-pointer text-xs"
                  title={isEn ? "Close guide" : "Fermer le guide"}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Bento Grid Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Navigation shortcuts */}
                <div className="bg-slate-950/50 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-mono font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1.5">
                      <Compass size={11} className="shrink-0" />
                      <span>{isEn ? "Navigation & Scroll" : "Navigation & Déplacement"}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      {isEn
                        ? "Move effortlessly. Pair any navigation verb (such as \"Go to\", \"Visit\", \"Navigate to\", or \"Show\") with a section name."
                        : "Déplacez-vous instantanément. Employez un verbe d'action (\"Aller à\", \"Va au\", \"Affiche\", \"Ouvre\") suivi d'une section."}
                    </p>
                    <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-850/50 space-y-1">
                      <p className="text-[10px] text-slate-350 font-semibold font-mono">
                        {isEn ? "Examples:" : "Exemples :"}
                      </p>
                      <ul className="text-[10px] space-y-1 text-slate-400 list-disc list-inside font-mono">
                        <li>“{isEn ? "Go to projects" : "Aller aux projets"}”</li>
                        <li>“{isEn ? "Show resume" : "Affiche l'expérience"}”</li>
                        <li>“{isEn ? "Navigate to Contact" : "Ouvre le formulaire de contact"}”</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <p className="text-[9px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                      <MapPin size={9} className="shrink-0" />
                      <span>{isEn ? "Target Sections" : "Sections disponibles"}</span>
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {isHopsonMode ? (
                        ['home', 'about', 'love-stories', 'surprises', 'elixir', 'wheel', 'clicker', 'romanticCoder', 'breathing', 'terminal'].map(s => (
                          <span key={s} className="px-1.5 py-0.5 bg-slate-900 rounded text-[9px] text-slate-400 font-mono border border-slate-855">
                            {s}
                          </span>
                        ))
                      ) : (
                        ['home', 'about', 'services', 'skills', 'certifications', 'projects', 'experience', 'pipeline', 'ml-playground', 'cv-generator', 'terminal', 'blog', 'contact'].map(s => (
                          <span key={s} className="px-1.5 py-0.5 bg-slate-900 rounded text-[9px] text-slate-400 font-mono border border-slate-855">
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Chat with AI */}
                <div className="bg-slate-950/50 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-mono font-black tracking-widest text-indigo-400 uppercase flex items-center gap-1.5">
                      <MessageSquare size={11} className="shrink-0" />
                      <span>{isEn ? "AI Conversational Responses" : "Dialogue & Réponses Vocales"}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      {isEn
                        ? "Ask about Dels's background, technologies, or creations. The AI assistant responds in writing or speaks back directly."
                        : "Interrogez l'assistant sur le parcours de Dels, ses choix techniques ou projets. L'IA vous répondra à l'écrit et à l'oral."}
                    </p>
                    <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-855 space-y-1">
                      <p className="text-[10px] text-slate-350 font-semibold font-mono">
                        {isEn ? "Examples:" : "Exemples :"}
                      </p>
                      <ul className="text-[10px] space-y-1 text-slate-400 list-disc list-inside font-mono">
                        <li>“{isEn ? "Who are you?" : "Qui es-tu ?"}”</li>
                        <li>“{isEn ? "What are your skills?" : "Quelles sont tes compétences ?"}”</li>
                        <li>“{isEn ? "Tell me about your projects." : "Présente-moi tes projets"}”</li>
                        <li>“{isEn ? "Summarize / Complete presentation" : "Résumer / Présentation complète / Tout ce que je dois savoir"}”</li>
                        <li>“{isEn ? "How can I contact you?" : "Comment te contacter ?"}”</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-indigo-500/5 p-2 rounded-xl border border-indigo-500/10 text-[9px] text-indigo-300 font-sans italic text-center flex items-center justify-center gap-1 pr-2">
                    <Volume2 size={10} className="shrink-0" />
                    <span>{isEn ? "Supports English and French!" : "Reconnaissance bilingue Français et Anglais !"}</span>
                  </div>
                </div>

                {/* 3. Global Speech Controls */}
                <div className="bg-slate-950/50 border border-slate-850 p-5 rounded-2xl space-y-2">
                  <h4 className="text-[11px] font-mono font-black tracking-widest text-amber-450 uppercase flex items-center gap-1.5">
                    <VolumeX size={11} className="shrink-0" />
                    <span>{isEn ? "Audio Controls & Mute" : "Contrôle Audio & Mute"}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {isEn
                      ? "Stop response vocal outputs midway by speaking stop commands, or mute voice response completely."
                      : "Coupez instantanément la parole de l'IA en prononçant une expression d'interruption, ou configurez le mode silencieux."}
                  </p>
                  <div className="space-y-1.5 pt-1 text-[10px] font-mono">
                    <div className="flex justify-between border-b border-slate-850/60 pb-1 text-slate-455">
                      <span>{isEn ? "Stop Voice Output:" : "Interrompre l'audio :"}</span>
                      <span className="text-amber-450 font-semibold">
                        {voiceStopKeywords.split(',').map(k => `“${k.trim()}”`).join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850/60 pb-1 text-slate-455">
                      <span>{isEn ? "Close Guide:" : "Fermer le guide d'aide :"}</span>
                      <span className="text-amber-450 font-semibold">“Help”, “Aide”</span>
                    </div>
                    <div className="flex justify-between pt-0.5 text-slate-455">
                      <span>{isEn ? "Silence Assistant:" : "Mode Silence / Muet :"}</span>
                      <span className={`${voiceMuteSpeak ? 'text-amber-500' : 'text-emerald-400'} font-bold flex items-center gap-1`}>
                        {voiceMuteSpeak 
                          ? (isEn ? "Muted" : "Actif (Muet)") 
                          : (isEn ? "Active (Voice)" : "Désactivé (Voix active)")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Background Wake word */}
                <div className="bg-slate-950/50 border border-slate-855 p-5 rounded-2xl space-y-2 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-mono font-black tracking-widest text-rose-500 uppercase flex items-center gap-1.5">
                      <Mic size={11} className="shrink-0 animate-pulse" />
                      <span>{isEn ? "Hands-Free Wake Words" : "Mots de Réveil Mains Libres"}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      {isEn
                        ? "Want hands-free interaction? Enable background wake detection. Say one of the triggers to perk Dels up."
                        : "Interagissez sans toucher l'écran en activant le mot-clé d'arrière-plan. Dites simplement l'un des mots-clés d'éveil."}
                    </p>
                  </div>
                  <div className="space-y-1 pt-1.5 text-[10px] font-mono">
                    <div className="flex justify-between text-slate-455">
                      <span>{isEn ? "Wake Words:" : "Expressions d'éveil :"}</span>
                      <span className="text-rose-450 font-black">
                        {voiceTriggerKeywords.split(',').map(k => `“${k.trim()}”`).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Custom Voice Macros */}
                <div className="bg-slate-950/50 border border-slate-850 p-5 rounded-2xl md:col-span-2 space-y-3">
                  <h4 className="text-[11px] font-mono font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1.5">
                    <Zap size={11} className="shrink-0 animate-pulse text-emerald-400" />
                    <span>{isEn ? "Your Custom Voice Macros" : "Vos Macros Vocales Personnalisées"}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {isEn
                      ? "Custom multi-action shortcuts defined in Admin Settings. Say any trigger below to initiate the transition chain."
                      : "Séquences de raccourcis multi-actions configurées en Administration. Prononcez l'un des déclencheurs pour lancer le parcours."}
                  </p>
                  
                  {voiceMacros.length === 0 ? (
                    <div className="text-[10px] italic text-slate-500 font-mono py-1">
                      {isEn ? "(No custom voice macros saved yet)" : "(Aucune macro personnalisée pour l'instant)"}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {voiceMacros.map((macro) => (
                        <div key={macro.id} className="bg-slate-900/50 border border-slate-850 p-2.5 rounded-xl flex flex-col justify-between space-y-2">
                           <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono font-bold text-slate-300">
                              {macro.name}
                            </span>
                            <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[9px] rounded-md font-bold uppercase">
                              “{macro.trigger}”
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-1 text-[9px] font-mono text-slate-500">
                            {(macro.actions || []).map((act: string, idx: number) => (
                              <React.Fragment key={idx}>
                                <span className="bg-slate-950 px-1 rounded border border-slate-850 text-[9px] text-slate-400 uppercase font-bold">
                                  {act}
                                </span>
                                {idx < (macro.actions || []).length - 1 && <span>➔</span>}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 6. Admin Voice Commands (Special requests) */}
                <div className="bg-slate-950/50 border border-slate-850 p-5 rounded-2xl md:col-span-2 space-y-3">
                  <h4 className="text-[11px] font-mono font-black tracking-widest text-[#f43f5e] uppercase flex items-center gap-1.5 animate-pulse">
                    <Key size={11} className="shrink-0" />
                    <span>{isEn ? "Special Administrator Commands" : "Commandes Spéciales Administrateur"}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {isEn
                      ? "Exclusive voice options for the website administrator. Speak any trigger to manage server states or layouts."
                      : "Privilèges vocaux exclusifs pour l'administrateur du site. Dites une commande pour modifier les permissions à la volée."}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                    <div className="bg-slate-900 shadow-sm border border-slate-850/60 p-2.5 rounded-xl space-y-1">
                      <span className="text-[#f43f5e] font-black">{isEn ? "Activate Admin Mode:" : "Activer l'administration :"}</span>
                      <ul className="text-slate-400 space-y-0.5 list-disc list-inside">
                        <li>“{isEn ? "enable admin mode" : "activer le mode administrateur"}”</li>
                        <li>“{isEn ? "sudo admin" : "sudo admin"}”</li>
                      </ul>
                    </div>
                    <div className="bg-slate-900 shadow-sm border border-slate-850/60 p-2.5 rounded-xl space-y-1">
                      <span className="text-[#f43f5e] font-black">{isEn ? "Disable Admin Mode:" : "Résilier l'administration :"}</span>
                      <ul className="text-slate-400 space-y-0.5 list-disc list-inside">
                        <li>“{isEn ? "disable admin mode" : "désactiver le mode administrateur"}”</li>
                        <li>“{isEn ? "exit admin" : "quitter mode administrateur"}”</li>
                      </ul>
                    </div>
                    <div className="bg-slate-900 shadow-sm border border-slate-850/60 p-2.5 rounded-xl space-y-1">
                      <span className="text-[#f43f5e] font-black">{isEn ? "Toggle Hopson Mode:" : "Protocole Hopson (Reine) :"}</span>
                      <ul className="text-slate-400 space-y-0.5 list-disc list-inside">
                        <li>“{isEn ? "love protocol" : "activer le mode reine"}”</li>
                        <li>“{isEn ? "disable hopson mode" : "désactiver le mode reine"}”</li>
                      </ul>
                    </div>
                    <div className="bg-slate-900 shadow-sm border border-slate-850/60 p-2.5 rounded-xl space-y-1">
                      <span className="text-[#f43f5e] font-black">{isEn ? "Diagnostics Report:" : "Rapport d'intégrité système :"}</span>
                      <ul className="text-slate-400 space-y-0.5 list-disc list-inside">
                        <li>“{isEn ? "system report" : "rapport système"}”</li>
                        <li>“{isEn ? "system health report" : "rapport de performance"}”</li>
                      </ul>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Quick-actions details */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-semibold text-white flex items-center gap-1.5">
                    <Target size={11} className="text-emerald-500 shrink-0" />
                    <span>{isEn ? "Try a voice run!" : "Lancez un test !"}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    {isEn
                      ? "Close this help menu and click the Microphone, then say 'Who are you?' to hear an intelligent oral briefing."
                      : "Fermez ce guide, cliquez sur l'icône du micro, puis demandez 'Qui es-tu ?' pour écouter la présentation générée."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAudioHelpOpen(false)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shrink-0 select-none"
                >
                  {isEn ? "Let's Go!" : "C'est parti !"}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

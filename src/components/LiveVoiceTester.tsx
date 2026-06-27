import React, { useState, useRef, useEffect } from 'react';
import { Mic, CheckCircle2, XCircle } from 'lucide-react';
import { useData } from '../context/DataContext';

interface LiveVoiceTesterProps {
  showStatus?: (msg: string, type: 'success' | 'err' | 'prompt') => void;
}

export const LiveVoiceTester: React.FC<LiveVoiceTesterProps> = ({ showStatus }) => {
  const { generalInfo, experiences, services, skills, projects } = useData();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [statusText, setStatusText] = useState('Cliquez sur le micro pour faire un test');
  const [statusType, setStatusType] = useState<'idle' | 'listening' | 'success' | 'error'>('idle');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      localStorage.removeItem('voice_testing_active');
      window.dispatchEvent(new Event('voice_settings_updated'));
    };
  }, []);

  const toggleTest = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setStatusText("Reconnaissance vocale non supportée sur ce navigateur.");
      setStatusType('error');
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      setIsListening(false);
      setStatusText('Test annulé.');
      setStatusType('idle');
      
      localStorage.removeItem('voice_testing_active');
      window.dispatchEvent(new Event('voice_settings_updated'));
      return;
    }

    try {
      // 1. Tell background/global speech recognition engines to release mic
      localStorage.setItem('voice_testing_active', 'true');
      window.dispatchEvent(new Event('voice_settings_updated'));

      setStatusText('Préparation du micro...');
      setStatusType('listening');

      // 2. Delay slightly to give other recognition engines time to abort and release hardware
      setTimeout(() => {
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
            setStatusText('Parlez maintenant... (Dites "Compétences" ou "Projets")');
            setStatusType('listening');
            setTranscript('');
            setConfidence(null);
          };

          recognition.onerror = (evt: any) => {
            const isBenign = evt.error === 'no-speech' || evt.error === 'aborted';
            if (isBenign) {
              console.info("Test recognition info event:", evt.error);
            } else {
              console.warn("Test recognition error:", evt);
            }
            setIsListening(false);
            
            let errMsg = `Erreur : ${evt.error || 'Inconnue'}`;
            if (evt.error === 'not-allowed') {
              errMsg = "Microphone bloqué ! Veuillez autoriser l'accès au micro dans votre navigateur.";
            } else if (evt.error === 'aborted') {
              errMsg = "Reconnaissance vocale interrompue ou micro déjà utilisé.";
            } else if (evt.error === 'network') {
              errMsg = "Erreur réseau. Une connexion internet est requise pour la reconnaissance vocale.";
            } else if (evt.error === 'no-speech') {
              errMsg = "Aucune parole détectée. Parlez plus fort ou rapprochez-vous du micro.";
            }
            
            setStatusText(errMsg);
            setStatusType('error');
          };

          recognition.onend = () => {
            setIsListening(false);
            setStatusType(currentType => {
              if (currentType === 'listening') {
                setStatusText("Écoute coupée sans résultat détecté (silence ou micro indisponible).");
                return 'error';
              }
              return currentType;
            });
            
            // Clean up and restore background trigger
            localStorage.removeItem('voice_testing_active');
            window.dispatchEvent(new Event('voice_settings_updated'));
          };

          recognition.onresult = (evt: any) => {
            const result = evt.results[0][0];
            const text = result.transcript;
            const conf = result.confidence || 0.85;

            setTranscript(text);
            setConfidence(conf);

            const storedThreshold = localStorage.getItem('voice_confidence_threshold');
            const threshold = storedThreshold ? parseFloat(storedThreshold) : 0.4;

            if (conf < threshold) {
              setStatusText(`Seuil non atteint ! Confiance : ${Math.round(conf * 100)}% (Seuil requis : ${Math.round(threshold * 100)}%)`);
              setStatusType('error');
            } else {
              setStatusText(`Traitement de la demande : "${text}"...`);
              setStatusType('success');

              (async () => {
                try {
                  const ownerName = generalInfo?.owner_name || "le propriétaire de ce portfolio";
                  let expText = "";
                  if (experiences && experiences.length > 0) {
                    expText = experiences.map((e: any) => `- ${e.role} chez "${e.company}" (${e.period}).`).join(' ');
                  }
                  let servicesText = "";
                  if (services && services.length > 0) {
                    servicesText = services.map((s: any) => `- ${s.title}`).join(' ');
                  }

                  let projectsText = "";
                  if (projects && projects.length > 0) {
                    projectsText = projects.map((p: any) => `- ${p.title}`).join(' ');
                  }
                  let skillsText = "";
                  if (skills) {
                    const allSkills = [
                      ...(skills.development || []),
                      ...(skills.dataScience || []),
                      ...(skills.autres || [])
                    ];
                    if (allSkills.length > 0) {
                      skillsText = allSkills.map((s: any) => s.title || s.name).join(', ');
                    }
                  }

                  const contextMessage = `Tu es l'assistant vocal de ${ownerName}.
Voici ses infos:
Expériences: ${expText}
Services: ${servicesText}
Projets: ${projectsText}
Compétences: ${skillsText}
Sois très concis et réponds à l'utilisateur.`;

                  const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      history: [
                        { role: 'user', content: contextMessage },
                        { role: 'assistant', content: 'Compris. Je répondrai de manière très concise en me basant uniquement sur ces informations.' },
                        { role: 'user', content: text }
                      ] 
                    })
                  });
                  
                  if (!res.ok) throw new Error('API erreur');
                  const data = await res.json();
                  const replyText = data.response || "Désolé, je n'ai pas de réponse.";
                  const uiText = replyText.replace(/[*_#`~[\]]/g, '');

                  setStatusText(`Réponse : ${uiText}`);

                  // Lecture audio (TTS)
                  const cleanedForSpeech = uiText
                    .replace(/[*_#`~[\]]/g, '')
                    .replace(/\bM\./g, 'M');

                  const synth = window.speechSynthesis;
                  const utterance = new SpeechSynthesisUtterance(cleanedForSpeech);
                  
                  const storedLang = localStorage.getItem('voice_lang_preference') || 'fr-FR';
                  utterance.lang = storedLang;
                  
                  const preferredVoiceName = localStorage.getItem('voice_profile_preference');
                  let voices = synth.getVoices();
                  let selectedVoice = null;
                  
                  const applyVoice = () => {
                    voices = synth.getVoices();
                    if (preferredVoiceName) {
                      selectedVoice = voices.find(v => v.name === preferredVoiceName);
                    }
                    if (!selectedVoice) {
                      const firstTwo = storedLang.substring(0, 2).toLowerCase();
                      selectedVoice = voices.find(v => v.lang.toLowerCase().startsWith(firstTwo) || v.lang.toLowerCase().includes(storedLang.toLowerCase()));
                    }
                    if (selectedVoice) {
                      utterance.voice = selectedVoice;
                    }
                    synth.speak(utterance);
                  };

                  if (voices.length === 0) {
                    synth.onvoiceschanged = () => {
                      applyVoice();
                      synth.onvoiceschanged = null;
                    };
                  } else {
                    applyVoice();
                  }

                } catch (e) {
                  console.error(e);
                  setStatusText("Erreur lors de la communication avec l'assistant.");
                  setStatusType('error');
                }
              })();
            }
          };

          recognition.start();
        } catch (err) {
          console.warn("Failed starting speech test in timeout:", err);
          setStatusText("Impossible de démarrer le micro de test.");
          setStatusType('error');
          localStorage.removeItem('voice_testing_active');
          window.dispatchEvent(new Event('voice_settings_updated'));
        }
      }, 350);

    } catch (err) {
      console.warn("Failed starting speech test:", err);
      setStatusText("Impossible de démarrer le micro de test.");
      setStatusType('error');
      localStorage.removeItem('voice_testing_active');
      window.dispatchEvent(new Event('voice_settings_updated'));
    }
  };

  const storedThresholdVal = parseFloat(localStorage.getItem('voice_confidence_threshold') || '0.4');

  return (
    <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-500">
          Statut du test
        </span>
        <span className={`h-2 w-2 rounded-full ${
          isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-700'
        }`} />
      </div>

      <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-850">
        <button
          type="button"
          onClick={toggleTest}
          className={`h-10 w-10 shrink-0 border transition-all rounded-xl flex items-center justify-center cursor-pointer ${
            isListening 
              ? 'bg-red-500 hover:bg-red-650 border-red-500/20 text-white animate-pulse'
              : 'bg-slate-950 hover:bg-slate-900 hover:scale-105 active:scale-95 text-emerald-400 border-slate-800'
          }`}
          title="Démarrer / Arrêter le test vocal"
        >
          <Mic size={16} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-mono text-slate-300 transition-all font-medium">
            {statusText}
          </p>
          {transcript && (
            <p className="text-[10px] text-slate-500 italic mt-0.5 truncate bg-slate-950 py-0.5 px-1.5 rounded inline-block font-mono max-w-full">
              Reçu : "{transcript}"
            </p>
          )}
        </div>
      </div>

      {confidence !== null && (
        <div className="p-2.5 rounded-lg border bg-slate-900/40 border-slate-850 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Score de confiance :</span>
            <span className={confidence >= storedThresholdVal ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {Math.round(confidence * 100)} %
            </span>
          </div>

          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                confidence >= storedThresholdVal ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, confidence * 100))}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5 text-[9.5px] font-mono pt-1">
            {confidence >= storedThresholdVal ? (
              <>
                <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                <span className="text-emerald-500 font-bold">Valide (Supérieur au seuil de {Math.round(storedThresholdVal * 100)}%)</span>
              </>
            ) : (
              <>
                <XCircle size={11} className="text-rose-400 shrink-0" />
                <span className="text-rose-400 font-bold">Rejeté (Inférieur au seuil de {Math.round(storedThresholdVal * 100)}%)</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

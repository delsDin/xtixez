import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Volume2, HelpCircle } from 'lucide-react';

interface LiveTtsTesterProps {
  voices: any[];
  showStatus?: (msg: string, type: 'success' | 'err') => void;
}

export const LiveTtsTester: React.FC<LiveTtsTesterProps> = ({ voices, showStatus }) => {
  const [testText, setTestText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Auto-set test phrase when language preference changes
  useEffect(() => {
    const handleLangUpdate = () => {
      const lang = localStorage.getItem('voice_lang_preference') || 'fr-FR';
      const isEnglish = lang.toLowerCase().startsWith('en');
      setTestText(
        isEnglish
          ? "Hello there! I am Dels, your voice companion. The Text-to-Speech service configuration is loaded successfully."
          : "Bonjour ! Je suis Dels, votre compagnon vocal. Votre configuration de synthèse vocale est maintenant entièrement opérationnelle."
      );
    };

    handleLangUpdate();
    window.addEventListener('voice_settings_updated', handleLangUpdate);
    return () => {
      window.removeEventListener('voice_settings_updated', handleLangUpdate);
    };
  }, []);

  const handleStop = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const handlePlay = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (showStatus) showStatus("La synthèse vocale n'est pas prise en charge sur ce navigateur.", "err");
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop anything current

      const storedLang = localStorage.getItem('voice_lang_preference') || 'fr-FR';
      const preferredVoiceName = localStorage.getItem('voice_profile_preference');

      const utterance = new SpeechSynthesisUtterance(testText || "Test de voix");
      utteranceRef.current = utterance;
      utterance.lang = storedLang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Match voice
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

      utterance.onstart = () => {
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = (e) => {
        console.warn("TTS test playback error:", e);
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("TTS failure on play:", err);
      setIsPlaying(false);
      if (showStatus) showStatus("Erreur de lecture audio.", "err");
    }
  };

  // Clean play state on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        if (!(window as any).isSpeakingDescriptiveAnswer) {
          window.speechSynthesis.cancel();
        }
      }
    };
  }, []);

  return (
    <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-500">
          Générateur audio de test
        </span>
        {isPlaying && (
          <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 font-black animate-pulse">
            <Volume2 size={11} /> LECTURE EN COURS...
          </span>
        )}
      </div>

      <div className="space-y-2">
        <textarea
          rows={3}
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          className="w-full p-2.5 bg-slate-900 border border-slate-850 rounded-lg text-xs font-sans text-slate-200 outline-none focus:border-emerald-500/50 resize-none leading-relaxed"
          placeholder="Écrivez le message que vous souhaitez faire lire à haute voix par la synthèse d'entraînement..."
        />
        <p className="text-[9.5px] text-slate-500 italic font-sans flex items-center gap-1">
          <HelpCircle size={10} className="text-slate-500 shrink-0" />
          Écrit à la main ou utilisez la phrase type traduite par vos préférences de langue.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePlay}
          disabled={isPlaying}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg border text-xs font-bold font-mono tracking-wide uppercase transition-all cursor-pointer ${
            isPlaying
              ? 'bg-emerald-950/20 text-emerald-600 border-emerald-900/40 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-650 text-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/10 active:scale-95'
          }`}
        >
          <Play size={12} fill="currentColor" /> {isPlaying ? 'Écoute active' : 'Écouter la Voix'}
        </button>

        {isPlaying && (
          <button
            type="button"
            onClick={handleStop}
            className="flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold font-mono tracking-wide uppercase transition-all cursor-pointer active:scale-95 hover:scale-105"
            title="Arrêter la lecture"
          >
            <Square size={12} fill="currentColor" /> Stop
          </button>
        )}
      </div>

      {isPlaying && (
        <div className="pt-1.5 flex items-center justify-center gap-0.5 h-6">
          <span className="w-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0s]" style={{ height: '70%' }}></span>
          <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.1s]" style={{ height: '40%' }}></span>
          <span className="w-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" style={{ height: '85%' }}></span>
          <span className="w-1 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.15s]" style={{ height: '55%' }}></span>
          <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" style={{ height: '90%' }}></span>
          <span className="w-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.05s]" style={{ height: '35%' }}></span>
          <span className="w-1 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.25s]" style={{ height: '60%' }}></span>
        </div>
      )}
    </div>
  );
};

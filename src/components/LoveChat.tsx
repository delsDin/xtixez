import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigation } from '../context/NavigationContext';
import { 
  MessageSquare, 
  Send, 
  X, 
  Heart, 
  Sparkles, 
  Check, 
  Loader2,
  TrendingUp
} from 'lucide-react';

export interface LoveMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  emoji: string;
  bubbleColor: string;
  x: number;
  y: number;
  scale: number;
  speed: number;
}

interface ColorOption {
  name: string;
  classes: string;
  preview: string;
}

const COLOR_PRESETS: ColorOption[] = [
  {
    name: "Rose Tendresse",
    classes: "from-pink-500/15 via-rose-500/10 to-purple-500/5 text-pink-600 dark:text-pink-400 border-pink-200/50 dark:border-pink-900/40 shadow-pink-500/5",
    preview: "bg-gradient-to-r from-pink-400 to-rose-400"
  },
  {
    name: "Mauve Cosmique",
    classes: "from-purple-500/15 via-indigo-500/10 to-pink-500/5 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/40 shadow-purple-500/5",
    preview: "bg-gradient-to-r from-purple-400 to-indigo-400"
  },
  {
    name: "Or Étincelant",
    classes: "from-amber-500/15 via-yellow-500/10 to-orange-500/5 text-amber-600 dark:text-yellow-400 border-amber-200/50 dark:border-amber-900/40 shadow-amber-500/5",
    preview: "bg-gradient-to-r from-amber-400 to-yellow-400"
  },
  {
    name: "Menthe Complice",
    classes: "from-emerald-500/15 via-teal-500/10 to-cyan-500/5 text-emerald-600 dark:text-teal-400 border-emerald-200/50 dark:border-emerald-900/40 shadow-emerald-500/5",
    preview: "bg-gradient-to-r from-emerald-400 to-teal-400"
  }
];

const EMOJI_OPTIONS = [ "💖", "💻", "👑", "♾️", "🌹", "✨", "🧸", "🚴‍♂️", "🍿", "🍕" ];

// Primary floating layer of animated love speech bubbles
export const LoveChatBubbleLayer = ({ messages }: { messages: LoveMessage[] }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Return a readable relative time or simple time
  const formatTime = (ts: number) => {
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden h-full w-full">
      <AnimatePresence>
        {messages.map((msg) => {
          // Adjust coordinates dynamically to prevent overlapping the central area (buttons, text)
          // safe screen rails are left side (2% - 22%) and right side (74% - 94%)
          let safeX = msg.x;
          let safeY = msg.y;
          
          const charSum = msg.id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
          const useLeftRail = charSum % 2 === 0;

          if (msg.x >= 20 && msg.x <= 78) {
            if (useLeftRail) {
              safeX = 2 + (charSum % 18);
            } else {
              safeX = 78 + (charSum % 16);
            }
          }

          if (msg.y < 8) safeY = 8 + (charSum % 8);
          if (msg.y > 88) safeY = 80 + (charSum % 8);

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ 
                opacity: hoveredId === msg.id ? 1 : 0.35,
                scale: msg.scale * (hoveredId === msg.id ? 1.08 : 1),
                // Beautiful wavy wandering animation
                y: [0, -18, 0, 16, 0],
                x: [0, 12, -10, 8, 0],
              }}
              exit={{ opacity: 0, scale: 0.2, y: -40 }}
              transition={{
                opacity: { duration: 0.4 },
                scale: { duration: 0.3 },
                y: {
                  duration: msg.speed,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                x: {
                  duration: msg.speed * 1.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="absolute pointer-events-auto cursor-pointer select-none transition-opacity duration-300"
              style={{
                left: `${safeX}%`,
                top: `${safeY}%`,
              }}
              onMouseEnter={() => setHoveredId(msg.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className={`relative px-4 py-2.5 rounded-2xl bg-gradient-to-br ${msg.bubbleColor} border shadow-lg backdrop-blur-[2px] hover:backdrop-blur-[12px] max-w-[240px] break-words transition-all duration-300 group`}>
                {/* Pulsing glow under bubble on hover */}
                <div className="absolute -inset-1 rounded-2xl bg-white/20 dark:bg-pink-500/10 blur opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative flex items-start gap-2">
                  <span className="text-sm shrink-0 self-start mt-0.5">{msg.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-sans font-medium leading-relaxed dark:text-white/95">
                      {msg.text}
                    </p>
                    
                    {/* Subtle hover details: Sender & Time */}
                    <div className="h-0 group-hover:h-4 overflow-hidden transition-all duration-300 mt-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 select-none">
                      <span className="text-[9px] font-mono font-bold text-pink-500 uppercase tracking-wider truncate">
                        {msg.sender}
                      </span>
                      <span className="text-[8px] font-mono text-slate-400">
                        • {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export const LoveChat = ({ onMessagesUpdated }: { onMessagesUpdated?: (msgs: LoveMessage[]) => void }) => {
  const { isHopsonMode } = useNavigation();
  const [messages, setMessages] = useState<LoveMessage[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [sender, setSender] = useState<string>('Mike Gouthon');
  const [text, setText] = useState<string>('');
  const [selectedEmoji, setSelectedEmoji] = useState<string>('💖');
  const [selectedColor, setSelectedColor] = useState<ColorOption>(COLOR_PRESETS[0]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSent, setIsSent] = useState<boolean>(false);

  // Load messages from backend
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        if (onMessagesUpdated) onMessagesUpdated(data);
      }
    } catch (e) {
      console.error("Could not fetch love messages:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isHopsonMode) {
      fetchMessages();

      // Poll for new messages every 15 seconds to simulate collaborative sweet notes
      const interval = setInterval(fetchMessages, 15000);
      return () => clearInterval(interval);
    }
  }, [isHopsonMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender.trim() || !text.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: sender.trim(),
          text: text.trim(),
          emoji: selectedEmoji,
          bubbleColor: selectedColor.classes
        }),
      });

      if (res.ok) {
        setText('');
        setIsSent(true);
        await fetchMessages(); // reload instantly
        setTimeout(() => setIsSent(false), 2400);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isHopsonMode) return null;

  return (
    <>
      {/* Absolute layer rendered statically at body-level, App.tsx handles insertion */}
      
      {/* Floating control trigger button */}
      <div className="fixed bottom-40 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 flex items-center justify-center bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-600 hover:text-white dark:hover:from-pink-600 dark:hover:to-rose-700 hover:shadow-pink-500/20 text-slate-705 dark:text-slate-300 rounded-full shadow-lg border border-slate-200/50 dark:border-slate-850/80 transition-all select-none cursor-pointer duration-300 hover:scale-105 active:scale-95 group"
          title="Mur d'Expression d'Amour"
        >
          <MessageSquare 
            size={18} 
            className="text-pink-500 group-hover:text-white transition-transform duration-300 group-hover:rotate-6" 
          />
          {/* Dynamic counter dot */}
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 border-2 border-white dark:border-slate-900 text-[9px] font-mono font-bold text-white flex items-center justify-center animate-pulse">
              {messages.length}
            </span>
          )}
        </button>
      </div>

      {/* Love expression panel Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />

            {/* Sidebar drawer panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border-l border-pink-100 dark:border-pink-950/35 shadow-2xl flex flex-col pt-6 z-10"
            >
              {/* Header */}
              <div className="px-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Heart size={16} fill="currentColor" className="text-pink-500 animate-pulse" />
                    <span>Mur d'Expression d'Amour</span>
                  </h3>
                  <p className="text-[10px] text-slate-405 dark:text-slate-400 font-mono tracking-widest uppercase">
                    Bulles persistantes de complicité
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-pink-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Message timeline list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isLoading && messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Loader2 size={24} className="animate-spin text-pink-500" />
                    <span className="text-xs font-medium">Chargement des mots doux...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2 p-6">
                    <span className="text-3xl">🌸</span>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Aucune bulle d'amour active</p>
                    <p className="text-[10px] text-slate-400 max-w-xs">Inscrivez le tout premier message à Dels dans le formulaire ci-dessous !</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <TrendingUp size={11} className="text-pink-500" />
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                        Fil des expressions ({messages.length})
                      </span>
                    </div>

                    {messages.map((msg) => (
                      <div 
                        key={msg.id}
                        className="group bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl p-3.5 transition-all hover:bg-pink-50/10 dark:hover:bg-pink-950/5 hover:border-pink-200/30 dark:hover:border-pink-905/20"
                      >
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs leading-none">{msg.emoji}</span>
                            <span className="text-xs font-black text-slate-850 dark:text-white capitalize">
                              {msg.sender}
                            </span>
                          </div>
                          <span className="text-[8.5px] font-mono text-slate-400 shrink-0">
                            {new Date(msg.timestamp).toLocaleDateString('fr-FR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-sans">
                          {msg.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form panel to submit a sweet note */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/10">
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Surnom sender field */}
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                        Qui écrit ? 👑
                      </label>
                      <input
                        type="text"
                        maxLength={25}
                        required
                        value={sender}
                        onChange={(e) => setSender(e.target.value)}
                        placeholder="Votre prénom..."
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-pink-400 transition-colors font-medium"
                      />
                    </div>

                    {/* Emoji Select list */}
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                        Humeur complice 🌸
                      </label>
                      <div className="relative">
                        <select
                          value={selectedEmoji}
                          onChange={(e) => setSelectedEmoji(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-pink-400 transition-colors font-medium appearance-none cursor-pointer"
                        >
                          {EMOJI_OPTIONS.map(em => (
                            <option key={em} value={em}>{em} Symbole</option>
                          ))}
                        </select>
                        <span className="absolute right-3 top-2.5 text-[10px] pointer-events-none text-slate-400">▼</span>
                      </div>
                    </div>
                  </div>

                  {/* Gradient Style list selector */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                      Thème visuel de la Bulle 🎨
                    </label>
                    <div className="flex gap-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          type="button"
                          key={preset.name}
                          onClick={() => setSelectedColor(preset)}
                          title={preset.name}
                          className={`flex-1 h-6 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                            selectedColor.name === preset.name
                              ? 'border-pink-500 scale-103 shadow-sm ring-1 ring-pink-100 dark:ring-pink-900/30'
                              : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full ${preset.preview}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text sweet message input */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                      Message précieux 💌
                    </label>
                    <div className="relative">
                      <textarea
                        required
                        maxLength={180}
                        rows={2}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Programmer de la tendresse..."
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-pink-400 transition-colors resize-none placeholder:text-slate-400 dark:placeholder:text-slate-650"
                      />
                      <span className="absolute bottom-1 right-2.5 text-[8px] font-mono text-slate-400">
                        {text.length}/180
                      </span>
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSending || text.length === 0}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-black tracking-wide uppercase flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/10 cursor-pointer transition-all active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Création de la bulle...</span>
                      </>
                    ) : isSent ? (
                      <>
                        <Check size={12} className="stroke-[3px]" />
                        <span>Bulle envoyée ! ✨</span>
                      </>
                    ) : (
                      <>
                        <Send size={11} fill="currentColor" />
                        <span>Infiltrer sur l'écran !</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

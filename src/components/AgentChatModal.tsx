import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useData } from '../context/DataContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AgentChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STARTER_QUESTIONS = [
  "Quels sont tes services principaux ?",
  "Es-tu disponible pour une mission ?",
  "Quelles technologies utilises-tu ?"
];

export const AgentChatModal: React.FC<AgentChatModalProps> = ({ isOpen, onClose }) => {
  const { generalInfo } = useData();
  const ownerName = generalInfo?.owner_name || "Dels Dinla";
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Bonjour ! Je suis Hermie, l'Agent IA de ${ownerName}. Je connais parfaitement ses compétences, son expérience et ses projets. Pose-moi n'importe quelle question et je te répondrai à sa place !`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

  const saveMessageToSupabase = async (role: 'user' | 'assistant', content: string) => {
    try {
      await supabase.from('agent_chat_history').insert({
        session_id: sessionId.current,
        role,
        content
      });
    } catch (err) {
      console.warn("Failed to log chat history:", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    };

    setMessages(prev => [...prev, userMsg]);
    saveMessageToSupabase('user', text);
    setInputValue('');
    setIsLoading(true);
    setErrorText(null);

    try {
      // Send message along with history to server API
      // We map our messages to the format the server expects (role + content)
      const apiHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/chat?stream=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ history: apiHistory })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Une erreur s'est produite lors de la connexion à l'Agent.");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      if (!reader) throw new Error("Stream non supporté par le navigateur");

      let assistantMessageId = (Date.now() + 1).toString();
      let fullResponse = "";

      // Ajouter le message vide de l'assistant
      setMessages(prev => [
        ...prev,
        { id: assistantMessageId, role: 'assistant', content: '' }
      ]);

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Garde la ligne incomplète

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.text) {
                fullResponse += parsed.text;
                // Mettre à jour l'interface au fur et à mesure
                setMessages(prev => prev.map(m => 
                  m.id === assistantMessageId ? { ...m, content: fullResponse } : m
                ));
              }
            } catch (e) {
              // Ignore invalid JSON from stream chunks
            }
          }
        }
      }
      
      saveMessageToSupabase('assistant', fullResponse);
    } catch (err: any) {
      console.error("Chat request failed:", err);
      // Message fallback sympa en cas d'indisponibilité de l'API
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Oups ! 😅 Mes circuits neuronaux sont un peu surchargés en ce moment (l'IA est temporairement indisponible).\n\nMais pas d'inquiétude, vous pouvez toujours explorer le reste de mon portfolio ou envoyer un message direct à ${ownerName} via la section Contact !`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop background overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-2xl h-[550px] sm:h-[600px] bg-slate-50/85 dark:bg-slate-900/65 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800/80 z-10 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200/45 dark:border-slate-800/85 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-accent-light text-accent rounded-2xl border border-accent/20">
                <Bot size={24} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                    Agent IA de Dels
                  </h3>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans flex items-center gap-1">
                  <Sparkles size={11} className="text-accent shrink-0" />
                  Actif • Répond instantanément
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-grow p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold ${
                    msg.role === 'user'
                      ? 'bg-accent text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/20'
                  }`}
                >
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                <div
                  className={`p-3.5 sm:p-4 rounded-2xl leading-relaxed text-sm ${
                    msg.role === 'user'
                      ? 'bg-accent text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800 shadow-xs rounded-tl-none'
                  }`}
                >
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <div className="space-y-1.5">
                      {msg.content.split('\n').map((line, i) => {
                        if (!line.trim() && msg.content.split('\n').length > 1) return <br key={i} />;
                        
                        const isListItem = line.trim().startsWith('- ') || line.trim().startsWith('* ');
                        const content = isListItem ? line.trim().substring(2) : line;

                        // Parse **bold** markdown
                        const parts = content.split(/(\*\*.*?\*\*)/g);
                        
                        const renderParts = () => parts.map((part, j) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>;
                          }
                          return <span key={j}>{part}</span>;
                        });

                        return (
                          <div key={i} className={isListItem ? "pl-4 relative flex items-start" : "mb-1"}>
                            {isListItem && (
                              <span className="absolute left-0 top-[0.4em] w-1.5 h-1.5 bg-accent/60 rounded-full" />
                            )}
                            <p className={`${isListItem ? "m-0" : ""}`}>
                              {renderParts()}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Error Message */}
            {errorText && (
              <div className="flex gap-2 items-center justify-center p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs border border-red-100 dark:border-red-900/50">
                <AlertCircle size={14} className="shrink-0" />
                {errorText}
              </div>
            )}

            {/* Message loading indicator */}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%] mr-auto">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/20">
                  <Bot size={14} />
                </div>
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800 shadow-xs rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starters & Input Board */}
          <div className="p-4 sm:p-5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-t border-slate-200/40 dark:border-slate-800/80 shrink-0 space-y-4">
            {/* Quick Starters Chips (only visible when we have initial welcome + no other user messages, or as tiny pill chips) */}
            {messages.length === 1 && !isLoading && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans">
                  Suggestions de questions :
                </p>
                <div className="flex flex-wrap gap-2">
                  {STARTER_QUESTIONS.map((question, qIdx) => (
                    <button
                      key={qIdx}
                      type="button"
                      onClick={() => handleSendMessage(question)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-accent-light text-slate-700 dark:text-slate-300 hover:text-accent border border-slate-200 dark:border-slate-650 hover:border-accent/30 rounded-xl text-xs font-medium cursor-pointer transition select-none"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main input form */}
            <form onSubmit={handleFormSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Pose ta question à mon Agent..."
                disabled={isLoading}
                className="flex-grow px-4 py-3 rounded-xl border border-slate-250 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition text-sm sm:text-base"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="p-3 rounded-xl bg-accent hover:bg-accent-hover disabled:bg-slate-200 disabled:dark:bg-slate-800 text-white disabled:text-slate-400 dark:disabled:text-slate-600 transition shadow-md hover:shadow-lg flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

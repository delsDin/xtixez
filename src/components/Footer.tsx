import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Send, Github, Linkedin, Twitter, ArrowUp, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useData } from '../context/DataContext';
import { supabase } from '../lib/supabase';

export const Footer: React.FC = () => {
  const { activeSection, setActiveSection } = useNavigation();
  const { generalInfo } = useData();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (activeSection === 'home') {
    return null;
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (status !== 'idle') {
      setStatus('idle');
      setMessage('');
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setStatus('error');
      setMessage("Veuillez saisir votre adresse email.");
      return;
    }

    // High performance RFC-compliant regex for immediate client-side feedback
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(cleanEmail)) {
      setStatus('error');
      setMessage("Le format de l'adresse email est incorrect (ex: nom@domaine.com).");
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');
    setMessage('');

    try {
      const { error } = await supabase.from('newsletter_subscribers').insert([{ email: cleanEmail }]);

      if (error) {
        if (error.code === '23505') { // Code d'erreur unique constraint pour PostgreSQL
          setStatus('success');
          setMessage("Vous êtes déjà abonné avec cette adresse email !");
        } else {
          setStatus('error');
          setMessage("Une erreur est survenue lors de l'inscription.");
        }
      } else {
        setStatus('success');
        setMessage("Abonnement réussi ! Bienvenue !");
        
        // Enregistrer une notification pour l'administrateur
        await supabase.from('admin_notifications').insert({
          type: 'success',
          title: "✨ Nouvel abonné Newsletter",
          message: `${cleanEmail} vient de s'inscrire à la newsletter.`
        });
        
        setEmail('');
      }
    } catch (err) {
      console.error("Newsletter error:", err);
      setStatus('error');
      setMessage("Impossible de contacter le serveur de messagerie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveSection('home');
  };

  return (
    <footer className="relative mt-auto border-t border-slate-200/50 dark:border-slate-800/60 bg-white/70 dark:bg-[#080c14]/80 backdrop-blur-md transition-colors duration-300 w-full z-10 overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      <div className="absolute bottom-[-100px] left-1/4 w-[300px] h-[300px] bg-amber-500/5 dark:bg-amber-500/2 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Block / Branding & Info */}
          <div className={`${activeSection === 'home' ? 'lg:col-span-12' : 'lg:col-span-5'} space-y-4`}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black uppercase tracking-widest font-mono text-slate-900 dark:text-white">
                {generalInfo?.owner_name || 'Dels Dinla Marcel'}
              </span>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded">
                Veille Pro
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-550 dark:text-slate-400 font-medium leading-relaxed max-w-md">
              Restez informé des dernières synthèses réalisées par mon IA sur l'écosystème Python, Data et Machine Learning.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 pt-2 select-none">
              <a
                href={generalInfo?.github_url || "https://github.com/delsDin"}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-amber-500/10 text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 rounded-xl transition-all duration-300 border border-transparent dark:border-slate-800/40"
              >
                <Github size={16} />
              </a>
              <a
                href={generalInfo?.linkedin_url || "https://www.linkedin.com/in/dels-dinla"}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-amber-500/10 text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 rounded-xl transition-all duration-300 border border-transparent dark:border-slate-800/40"
              >
                <Linkedin size={16} />
              </a>
              <a
                href={`mailto:${generalInfo?.owner_email || "delsmarceldinla@gmail.com"}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-amber-500/10 text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 rounded-xl transition-all duration-300 border border-transparent dark:border-slate-800/40"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Right Block / Newsletter Form */}
          {activeSection !== 'home' && (
            <div className="lg:col-span-7 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-150/50 dark:border-slate-800/50 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm">
              {/* Soft backdrop radial */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1.5">
                  <Sparkles size={11} className="animate-pulse text-amber-500" />
                  <span>Rapports Techniques Exclusifs</span>
                </div>

                <h4 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase mb-2">
                  Abonnez-vous à notre Newsletter
                </h4>

                <p className="text-xs text-slate-550 dark:text-slate-400 font-medium leading-relaxed mb-6 max-w-xl">
                  Soyez alerté de l'actualité critique avec nos articles de veille extraits en temps réel via Google Search Grounding. Pas de spam, désinscription en un clic.
                </p>

                {/* Input section */}
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-stretch gap-2">
                  <div className="relative flex-grow">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550" size={15} />
                    <input
                      type="email"
                      required
                      placeholder="Saisissez votre email..."
                      value={email}
                      onChange={handleEmailChange}
                      disabled={isSubmitting}
                      className={`w-full text-xs font-bold pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white border focus:outline-none focus:ring-1 transition-all font-sans ${
                        status === 'error'
                          ? 'border-red-550/80 dark:border-red-500/50 focus:ring-red-500 focus:border-red-500'
                          : status === 'success'
                          ? 'border-green-550/80 dark:border-green-500/50 focus:ring-green-500 focus:border-green-500'
                          : 'border-slate-200 dark:border-slate-800 focus:ring-amber-500 focus:border-amber-500'
                      } disabled:opacity-60`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !email.trim()}
                    className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed select-none shadow-md shadow-amber-600/10 active:scale-98"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Inscription...</span>
                    ) : (
                      <>
                        <span>S'abonner</span>
                        <Send size={12} />
                      </>
                    )}
                  </button>
                </form>

                {/* Status Alerting messages */}
                <div className="min-h-[20px] mt-3">
                  {status === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-green-600 dark:text-green-400"
                    >
                      <Check size={13} className="shrink-0" />
                      <span>{message}</span>
                    </motion.div>
                  )}
                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-red-650 dark:text-rose-400"
                    >
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{message}</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Line / Copyrights */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-250/20 dark:border-slate-800/40 pt-8 mt-12 gap-4">
          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-mono">
            &copy; {new Date().getFullYear()} {generalInfo?.owner_name || 'Dels Dinla Marcel'}. TOUS DROITS RÉSERVÉS.
          </div>

          <div className="flex items-center gap-6 select-none">
            <button
              onClick={() => setActiveSection('blog')}
              className="text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 transition-colors cursor-pointer"
            >
              Le Blog
            </button>
            <button
              onClick={() => setActiveSection('contact')}
              className="text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 transition-colors cursor-pointer"
            >
              Contact
            </button>
            <button
              onClick={scrollToTop}
              title="Retourner en haut"
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-amber-500/20 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 duration-200 transition-all cursor-pointer border border-transparent dark:border-slate-800/40"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

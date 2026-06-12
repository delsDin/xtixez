import { useForm } from 'react-hook-form';
import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { Mail, Phone, MapPin, Send, Bot } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { useState } from 'react';
import { AgentChatModal } from './AgentChatModal';
import { api } from '../api';

export const Contact = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      await api.postContactMessage({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        created_at: Date.now()
      });
      
      setSubmitStatus('success');
      reset();
    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center">
            Contactez-moi
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Discutons de votre projet</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                  Je suis actuellement disponible pour de nouvelles opportunités. N'hésitez pas à me contacter pour discuter de vos besoins en développement ou en data science.
                </p>
              </div>

              <div className="space-y-6">
                <motion.a 
                  href="mailto:hello@example.com" 
                  whileHover={{ x: 6, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="flex items-center gap-4 group cursor-pointer"
                >
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg group-hover:bg-amber-250 dark:group-hover:bg-amber-900/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Email</p>
                    <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">hello@example.com</p>
                  </div>
                </motion.a>
                
                <motion.a 
                  href="tel:+33612345678" 
                  whileHover={{ x: 6, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="flex items-center gap-4 group cursor-pointer"
                >
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg group-hover:bg-amber-250 dark:group-hover:bg-amber-900/50 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Téléphone</p>
                    <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{`+33 6 12 34 56 78`}</p>
                  </div>
                </motion.a>
                
                <motion.a 
                  href="https://maps.google.com/?q=Paris,+France" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  whileHover={{ x: 6, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="flex items-center gap-4 group cursor-pointer"
                >
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg group-hover:bg-amber-250 dark:group-hover:bg-amber-900/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Localisation</p>
                    <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Paris, France</p>
                  </div>
                </motion.a>
              </div>
            </div>

            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit(onSubmit)} className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-slate-100/60 dark:border-slate-800/80 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom complet</label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Jean Dupont"
                      {...register('name', { required: 'Le nom est requis' })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-950 transition-all outline-none shadow-xs focus:shadow-md"
                    />
                    {errors.name && <span className="text-red-500 text-sm mt-1 block">{errors.name.message as string}</span>}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="jean@example.com"
                      {...register('email', { 
                        required: 'L\'email est requis',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Adresse email invalide'
                        }
                      })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-950 transition-all outline-none shadow-xs focus:shadow-md"
                    />
                    {errors.email && <span className="text-red-500 text-sm mt-1 block">{errors.email.message as string}</span>}
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Sujet</label>
                  <input
                    id="subject"
                    type="text"
                    placeholder="Proposition de projet"
                    {...register('subject', { required: 'Le sujet est requis' })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-950 transition-all outline-none shadow-xs focus:shadow-md"
                  />
                  {errors.subject && <span className="text-red-500 text-sm mt-1 block">{errors.subject.message as string}</span>}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Message</label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Votre message ici..."
                    {...register('message', { required: 'Le message est requis' })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-950 transition-all outline-none resize-none shadow-xs focus:shadow-md"
                  />
                  {errors.message && <span className="text-red-500 text-sm mt-1 block">{errors.message.message as string}</span>}
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 px-6 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-md hover:shadow-lg hover:shadow-amber-600/10"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Envoi en cours...</span>
                  ) : (
                    <>
                      Envoyer le message
                      <Send size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </>
                  )}
                </motion.button>

                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-center font-medium">
                    Votre message a été envoyé avec succès !
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-center font-medium">
                    Une erreur est survenue. Veuillez réessayer.
                  </div>
                )}
              </form>

              {/* Chat with AI agent button */}
              <div className="flex flex-col items-center mt-6">
                <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                  OU
                </span>
                <motion.button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 w-full py-4 px-6 rounded-lg bg-slate-950 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer duration-200"
                >
                  Discuter avec mon agent IA
                  <Bot size={18} className="animate-bounce" style={{ animationDuration: '3s' }} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AgentChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </section>
  );
};

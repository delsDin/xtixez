import { fetchPortfolioConfig } from '../lib/config-api';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [serviceId, setServiceId] = useState('analytics');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await fetchPortfolioConfig();
        if (data) {
          if (Array.isArray(data.services) && data.services.length > 0) {
            setServicesList(data.services);
            setServiceId(data.services[0]?.id || 'analytics');
          }
        }
      } catch (e) {
        console.error("Error loaded services for review dropdown:", e);
      }
    };
    fetchServices();

    window.addEventListener('portfolio_config_updated', fetchServices);
    return () => window.removeEventListener('portfolio_config_updated', fetchServices);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;

    try {
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f59e0b&color=fff&bold=true`;
      
      const { error } = await supabase.from('testimonials').insert({
        name: name.trim(),
        role: role.trim() || 'Client',
        message: message.trim(),
        avatar: avatarUrl,
        is_active: false // default false for moderation
      });

      if (error) {
        console.error("Error inserting testimonial:", error);
        alert("Erreur lors de la soumission de l'avis.");
      } else {
        setSubmitted(true);
        window.dispatchEvent(new Event('portfolio_config_updated'));
      }
    } catch (err) {
      console.error("Submit review error:", err);
    }
  };

  const handleReset = () => {
    setRating(5);
    setName('');
    setRole('');
    setServiceId(servicesList[0]?.id || 'analytics');
    setMessage('');
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleReset}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-lg bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100/60 dark:border-slate-800/80 z-10 overflow-hidden"
        >
          {/* Close Button Button */}
          <button
            onClick={handleReset}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X size={20} />
          </button>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Laisser un avis
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Votre retour d'expérience me permet d'améliorer constamment la qualité de mes services.
                </p>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Service concerné
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none transition"
                >
                  {servicesList.map((choice) => (
                    <option key={choice.id} value={choice.id}>
                      {choice.title}
                    </option>
                  ))}
                <option key="autre" value="aucune">
                  Autre
                </option>
                </select>
              </div>

              {/* Rating Star Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Votre note
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(null)}
                      className="p-1 focus:outline-none transition-transform active:scale-95"
                    >
                      <Star
                        size={28}
                        className={`${
                          star <= (hoveredRating ?? rating)
                            ? 'fill-accent text-accent'
                            : 'text-slate-300 dark:text-slate-600'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Identity Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Votre prénom & nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Claire Dubois"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Rôle / Entreprise
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="E.g. Directrice @ InnoData"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none transition"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Votre commentaire *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez en quelques mots votre expérience de collaboration..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none transition resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gradient-from to-gradient-to text-white font-semibold shadow-md opacity-90 hover:opacity-100 transition"
                >
                  Soumettre l'avis
                </button>
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center"
            >
              <CheckCircle size={64} className="text-emerald-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Avis enregistré !
              </h3>
              <p className="text-slate-600 dark:text-slate-300 max-w-sm mx-auto mb-8">
                Merci d'avoir pris le temps de me faire part de votre avis. Votre message a bien été pris en compte.
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-md transition"
              >
                Fermer
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

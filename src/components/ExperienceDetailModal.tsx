import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Briefcase, Award, Cpu, CheckCircle } from 'lucide-react';

interface ExperienceItem {
  id: number;
  role: string;
  company: string;
  period: string;
  description: string[];
  details: string;
  technologies: string[];
  achievements: string[];
}

interface ExperienceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  experience: ExperienceItem | null;
}

export const ExperienceDetailModal: React.FC<ExperienceDetailModalProps> = ({ isOpen, onClose, experience }) => {
  if (!isOpen || !experience) return null;

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
          className="relative w-full max-w-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100/60 dark:border-slate-800/85 z-10 overflow-y-auto max-h-[90vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-light text-accent text-xs font-semibold rounded-full mb-3 border border-accent/20">
              <Calendar size={12} />
              {experience.period}
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
              {experience.role}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-slate-600 dark:text-slate-400 font-medium">
              <Briefcase size={16} className="text-accent" />
              <span className="text-base sm:text-lg">{experience.company}</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Context & Long details */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 font-sans">
                DESCRIPTION DU POSTE
              </h4>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-light">
                {experience.details}
              </p>
            </div>

            {/* Key Achievements */}
            {experience.achievements && experience.achievements.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 font-sans flex items-center gap-1.5 flex-wrap">
                  <Award size={14} className="text-accent" />
                  RÉALISATIONS MAJEURES
                </h4>
                <ul className="space-y-3.5">
                  {experience.achievements.map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-sm">
                      <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans font-medium">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technologies Grid */}
            {experience.technologies && experience.technologies.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 font-sans flex items-center gap-1.5 flex-wrap">
                  <Cpu size={14} className="text-accent" />
                  COMPÉTENCES & OUTILS MOBILISÉS
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {experience.technologies.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-700/60 hover:bg-accent-light text-slate-700 dark:text-slate-300 hover:text-accent border border-slate-200/50 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold tracking-wide cursor-default transition duration-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prompt close */}
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl transition shadow-md cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

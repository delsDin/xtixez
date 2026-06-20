import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Key, Mail, Cpu } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useData } from '../context/DataContext';

export const Maintenance: React.FC = () => {
  const { setIsAdminMode } = useNavigation();
  const { maintenanceConfig } = useData();

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background visual effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-lg w-full text-center space-y-8 p-8 sm:p-12 rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl shadow-2xl flex flex-col items-center">
        
        {/* Animated logo/icons */}
        <div className="relative flex items-center justify-center w-24 h-24 mb-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="absolute w-24 h-24 rounded-full border border-dashed border-accent/40"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            className="absolute w-20 h-20 rounded-full border border-dashed border-purple-500/30"
          />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center text-white shadow-lg shadow-accent/25 z-10">
            <Cpu size={32} className="animate-pulse" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest font-extrabold uppercase bg-accent/10 text-accent border border-accent/20">
            <ShieldAlert size={12} />
            Système Indisponible
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Maintenance en Cours
          </h1>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            {maintenanceConfig?.reason || "Mon portfolio et mes services font l'objet d'une mise à jour ou d'une maintenance technique planifiée afin d'améliorer l'expérience utilisateur et les performances globales."}
          </p>
          {maintenanceConfig?.reopenDate && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Réouverture prévue : {maintenanceConfig.reopenDate}</span>
            </div>
          )}
        </div>

        {/* Action / Contact Card */}
        <div className="w-full border-t border-slate-800/80 pt-6 mt-4 flex flex-col items-center gap-4">
          <p className="text-xs text-slate-500 font-mono">
            Besoin de me contacter en urgence ?
          </p>
          <a
            href="mailto:delsmarceldinla@gmail.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-350 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/85 transition-colors"
          >
            <Mail size={14} />
            <span>Envoyer un e-mail</span>
          </a>
        </div>
      </div>

      {/* Hidden/Subtle Admin Backdoor Button */}
      <button
        onClick={() => setIsAdminMode(true)}
        className="absolute bottom-6 right-6 p-2 text-slate-700 hover:text-slate-500 dark:text-slate-800 dark:hover:text-slate-650 transition-colors rounded-xl cursor-pointer"
        title="Connexion Administrateur"
      >
        <Key size={18} />
      </button>
    </div>
  );
};


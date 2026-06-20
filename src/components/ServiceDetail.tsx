import { fetchPortfolioConfig } from '../lib/config-api';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Check, 
  Zap, 
  Target, 
  Code, 
  Clock, 
  Package,
  BarChart3,
  Brain,
  Database,
  TrendingUp,
  Code2,
  Lightbulb
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

const getIconForService = (iconName: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    chart: <BarChart3 size={36} />,
    brain: <Brain size={36} />,
    database: <Database size={36} />,
    trending: <TrendingUp size={36} />,
    code: <Code2 size={36} />,
    lightbulb: <Lightbulb size={36} />,
  };
  return iconMap[iconName] || <BarChart3 size={36} />;
};

export const ServiceDetail = () => {
  const { activeServiceId, setActiveSection } = useNavigation();
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await fetchPortfolioConfig();
        if (data) {
          if (Array.isArray(data.services) && data.services.length > 0) {
            setServicesList(data.services);
          }
        }
      } catch (e) {
        console.error("Error fetching services in Detail:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();

    window.addEventListener('portfolio_config_updated', fetchServices);
    return () => window.removeEventListener('portfolio_config_updated', fetchServices);
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Chargement des détails du service...</p>
      </div>
    );
  }

  const service = servicesList.find((s) => s.id === activeServiceId) || servicesList[0];

  if (!service) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-600 dark:text-slate-400">Service non trouvé.</p>
        <button 
          onClick={() => setActiveSection('services')}
          className="text-accent underline mt-4 cursor-pointer"
        >
          Retour aux services
        </button>
      </div>
    );
  }

  const advantages = Array.isArray(service.advantages) ? service.advantages : [];
  const useCases = Array.isArray(service.useCases) ? service.useCases : (Array.isArray(service.use_cases) ? service.use_cases : []);
  const technologies = Array.isArray(service.technologies) ? service.technologies : [];
  const deliverables = Array.isArray(service.deliverables) ? service.deliverables : [];

  const handleBack = () => {
    setActiveSection('services');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleContact = () => {
    setActiveSection('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="service-detail" className="py-12 min-h-[calc(100vh-5rem)] flex flex-col justify-start">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl flex-grow">
        {/* Back Button */}
        <motion.button
          onClick={handleBack}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-dark transition-colors mb-8 focus:outline-none group cursor-pointer"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          Retour aux services
        </motion.button>

        {/* Main Header / Banner Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-50 dark:bg-slate-800/20 border border-slate-150 dark:border-slate-800/85 rounded-3xl p-6 sm:p-10 mb-12 shadow-sm relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center mb-6">
            <div className={`p-4 rounded-2xl ${service.color} shrink-0`}>
              {getIconForService(service.icon_name || service.iconName)}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {service.title}
            </h2>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-light">
            {service.longDescription || service.long_description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left Columns - Features, Use cases, Tech */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3 space-y-12"
          >
            {/* Key Advantages */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <Zap className="text-accent" size={20} />
                Avantages clés
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {advantages.map((adv: string, aIdx: number) => (
                  <div 
                    key={aIdx} 
                    className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 p-4 rounded-2xl flex items-start gap-3 hover:shadow-xs transition-shadow"
                  >
                    <Check className="text-accent shrink-0 mt-0.5" size={18} />
                    <span className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                      {adv}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Typical Use Cases */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <Target className="text-purple-500" size={20} />
                Cas d'usage typiques
              </h3>
              <div className="flex flex-wrap gap-3">
                {useCases.map((uc: string, uIdx: number) => (
                  <div 
                    key={uIdx} 
                    className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 px-4 py-2.5 rounded-2xl text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium hover:border-purple-500/20 hover:bg-purple-500/5 dark:hover:bg-purple-500/5 transition-all"
                  >
                    {uc}
                  </div>
                ))}
              </div>
            </div>

            {/* Technologies Used */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <Code className="text-emerald-500" size={20} />
                Technologies utilisées
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {technologies.map((tech: string, tIdx: number) => (
                  <span 
                    key={tIdx} 
                    className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase hover:scale-105 transition-transform"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Columns - Timeframe, Deliverables */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Estimated Duration */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2.5">
                <Clock className="text-blue-500" size={18} />
                Durée estimée
              </h3>
              <p className="text-2xl font-black text-accent">
                {service.duration}
              </p>
            </div>

            {/* Deliverables */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2.5">
                <Package className="text-emerald-505" size={18} />
                Livrables
              </h3>
              <ul className="space-y-3">
                {deliverables.map((del: string, dIdx: number) => (
                  <li key={dIdx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                    <Check className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={16} />
                    <span className="text-slate-700 dark:text-slate-300">
                      {del}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Call To Action Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-gradient-from to-gradient-to text-white rounded-3xl p-8 sm:p-12 text-center mt-16 shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />
          
          <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-4 relative z-10">
            Prêt à démarrer ?
          </h3>
          <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-2xl mx-auto mb-8 relative z-10 leading-relaxed font-light font-sans">
            Contactez-moi pour discuter de comment ce service peut transformer votre projet. Je serai ravi d'adapter une solution sur mesure à vos besoins.
          </p>
          <button
            onClick={handleContact}
            className="relative z-10 inline-block bg-white text-accent hover:bg-slate-50 font-bold px-8 py-3.5 rounded-xl shadow-md transition-all hover:scale-105 duration-200 focus:outline-none cursor-pointer"
          >
            Me contacter
          </button>
        </motion.div>
      </div>
    </section>
  );
};

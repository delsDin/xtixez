import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { 
  Check, 
  ArrowRight, 
  BarChart3, 
  Brain, 
  Database, 
  TrendingUp, 
  Code2, 
  Lightbulb 
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { servicesData as mockServices } from '../data/mockData';
import { ReviewModal } from './ReviewModal';
import { TiltCard } from './TiltCard';
import { api } from '../api';

const getIconForService = (iconName: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    chart: <BarChart3 size={28} />,
    brain: <Brain size={28} />,
    database: <Database size={28} />,
    trending: <TrendingUp size={28} />,
    code: <Code2 size={28} />,
    lightbulb: <Lightbulb size={28} />,
  };
  return iconMap[iconName] || <BarChart3 size={28} />;
};

const ServiceCard: React.FC<{ service: any; index: number }> = ({ service, index }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { setActiveServiceId, setActiveSection } = useNavigation();

  const handleLearnMore = () => {
    setActiveServiceId(service.id);
    setActiveSection('service-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="w-full flex"
    >
      <TiltCard maxTilt={11} scaleOnHover={1.03} className="w-full flex">
        <div className="w-full flex flex-col h-full p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800 hover:border-accent bg-white/80 dark:bg-slate-900/60 backdrop-blur-md transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-lg ${service.color}`}>
              {getIconForService(service.iconName)}
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {service.title}
            </h3>
          </div>

          <p className="text-slate-600 dark:text-slate-300 mb-6 flex-grow">
            {service.description}
          </p>

          <div className="space-y-2 mb-6">
            {service.features.map((feature: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3">
                <Check size={18} className="text-accent flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
              </div>
            ))}
          </div>

          <motion.button
            onClick={handleLearnMore}
            whileHover={{ x: 5 }}
            className="flex items-center gap-2 text-accent font-medium text-sm hover:gap-3 transition-all cursor-pointer mt-auto"
          >
            En savoir plus <ArrowRight size={16} />
          </motion.button>
        </div>
      </TiltCard>
    </motion.div>
  );
};

export const Services = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { setActiveSection } = useNavigation();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [servicesData, setServicesData] = useState<any[]>(mockServices);

  useEffect(() => {
    api.getServices()
      .then(data => {
        if (data && data.length > 0) setServicesData(data);
      })
      .catch(err => console.error("Impossible de récupérer les services:", err));
  }, []);

  const handleContact = () => {
    setActiveSection('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="services" className="py-20">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Mes Services
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Découvrez les solutions que je propose pour transformer vos données en valeur et accélérer votre transformation digitale.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 p-8 md:p-12 bg-gradient-to-r from-gradient-from to-gradient-to rounded-2xl text-center text-white"
        >
          <h3 className="text-2xl font-bold mb-4">Travaillons ensemble</h3>
          <p className="mb-6 opacity-90">
            Intéressé par l'un de ces services ? Contactez-moi pour discuter de comment je peux vous aider à atteindre vos objectifs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <motion.button
              onClick={handleContact}
              whileHover={{ scale: 1.05, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="relative px-8 py-3 bg-white text-accent font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group overflow-hidden w-full sm:w-auto"
            >
              {/* Animated background effect */}
              <motion.div
                className="absolute inset-0 bg-accent-light rounded-lg opacity-40 group-hover:opacity-100 transition-opacity"
                initial={{ x: -100, opacity: 0 }}
                whileHover={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
              
              {/* Button content */}
              <motion.span 
                className="relative flex items-center gap-2 justify-center"
                whileHover={{ gap: 8 }}
                transition={{ duration: 0.3 }}
              >
                Contactez-moi
                <motion.span
                  whileHover={{ x: 3 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <ArrowRight size={18} />
                </motion.span>
              </motion.span>
            </motion.button>
            
            <motion.button
              onClick={() => setIsReviewModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors cursor-pointer w-full sm:w-auto"
            >
              Laisser un avis
            </motion.button>
          </div>
        </motion.div>
      </div>

      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
      />
    </section>
  );
};

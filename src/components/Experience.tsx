import { useState } from 'react';
import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { experienceData } from '../data/mockData';
import { Briefcase } from 'lucide-react';
import { ExperienceDetailModal } from './ExperienceDetailModal';

export const Experience = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [selectedExperience, setSelectedExperience] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDetails = (experience: any) => {
    setSelectedExperience(experience);
    setIsModalOpen(true);
  };

  return (
    <section id="experience" className="py-20">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center">
            Expérience & Formation
          </h2>

          <div className="relative border-l-2 border-accent/20 dark:border-accent/15 ml-3 md:ml-6">
            {experienceData.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="mb-10 ml-8 md:ml-12 relative"
              >
                <div className="absolute -left-[41px] md:-left-[57px] top-1 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 border-4 border-accent-light dark:border-accent/25 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                </div>
                
                <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100/65 dark:border-slate-800/80">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{item.role}</h3>
                      <div className="flex items-center gap-2 text-accent font-medium mt-1">
                        <Briefcase size={16} />
                        <span>{item.company}</span>
                      </div>
                    </div>
                    <span className="inline-block px-3 py-1 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 text-sm font-medium rounded-full w-fit">
                      {item.period}
                    </span>
                  </div>
                  
                  <ul className="space-y-2 mt-4 mb-6">
                    {item.description.map((desc, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0 opacity-80" />
                        <span>{desc}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 border-t border-slate-100/55 dark:border-slate-800/60 flex justify-end">
                    <button
                      onClick={() => handleOpenDetails(item)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-accent hover:text-accent-dark bg-accent-light hover:bg-accent/20 rounded-xl transition duration-200 cursor-pointer"
                    >
                      Détails <span>→</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <ExperienceDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          experience={selectedExperience}
        />
      </div>
    </section>
  );
};

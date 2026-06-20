import { useState } from 'react';
import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { useData } from '../context/DataContext';
import { Quote } from 'lucide-react';
import { ReviewModal } from './ReviewModal';

export const Testimonials = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { testimonials: testimonialsData } = useData();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  if (!testimonialsData || testimonialsData.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center">
            Témoignages
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonialsData.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-slate-100/60 dark:border-slate-800/80 relative"
              >
                <Quote className="absolute top-6 right-6 text-amber-100 dark:text-amber-900/30" size={48} />
                
                <p className="text-slate-600 dark:text-slate-300 text-lg italic mb-8 relative z-10">
                  "{testimonial.message}"
                </p>
                
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="w-14 h-14 rounded-full object-cover border-2 border-amber-100 dark:border-slate-700"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Button to give a testimony */}
          <div className="mt-12 flex justify-center">
            <motion.button
              onClick={() => setIsReviewModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Donner un témoignage
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

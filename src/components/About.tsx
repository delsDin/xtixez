import { fetchPortfolioConfig } from '../lib/config-api';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { useNavigation } from '../context/NavigationContext';

export const About = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  const [config, setConfig] = useState({
    aboutTitle: "",
    aboutParagraphs: [] as string[],
    aboutCitations: [] as string[]
  });
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Load configuration dynamically
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await fetchPortfolioConfig();
        if (data) {
          setConfig({
            aboutTitle: data.aboutTitle || "À propos de moi",
            aboutParagraphs: Array.isArray(data.aboutParagraphs) && data.aboutParagraphs.length > 0 
              ? data.aboutParagraphs 
              : [],
            aboutCitations: Array.isArray(data.aboutCitations) && data.aboutCitations.length > 0 
              ? data.aboutCitations 
              : []
          });
        }
      } catch (e) {
        console.error("Error loaded About config:", e);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchConfig();

    const handleConfigUpdate = () => {
      fetchConfig();
    };

    window.addEventListener('portfolio_config_updated', handleConfigUpdate);
    return () => window.removeEventListener('portfolio_config_updated', handleConfigUpdate);
  }, []);

  const citations = config.aboutCitations;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (citations.length === 0) return;
    let timeoutId: NodeJS.Timeout;
    const intervalId = setInterval(() => {
      setIsVisible(false);
      
      timeoutId = setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % citations.length);
        setIsVisible(true);
      }, 1800); // Wait for the letter-by-letter dissolution animation to complete
    }, 10000); // 10 seconds total cycle per quote

    return () => {
      clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [citations.length]);

  const citationText = citations[currentIdx] || '';
  const words = citationText.split(" ");

  // Framer Motion variants
  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.02,
      }
    },
    hidden: {
      transition: {
        staggerChildren: 0.012,
        staggerDirection: -1 as const, // Dissolve from the end to start
      }
    }
  };

  const charVariants = {
    hidden: { 
      opacity: 0, 
      y: 8,
      filter: 'blur(3px)',
      scale: 0.8,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: 'blur(0px)',
      scale: 1,
      transition: {
        type: 'spring',
        damping: 14,
        stiffness: 140
      }
    }
  };

  return (
    <section id="about" className="py-20 bg-transparent">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <AnimatePresence mode="wait">
          {isDataLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="text-center max-w-xl mx-auto">
                <div className="h-9 w-48 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl mx-auto animate-pulse" />
              </div>
              <div className="bg-white/85 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-sm border border-slate-100/60 dark:border-slate-800/85 space-y-6">
                <div className="space-y-3.5">
                  <div className="h-4 w-full bg-slate-200/60 dark:bg-slate-800/60 rounded-lg animate-pulse" />
                  <div className="h-4 w-11/12 bg-slate-200/60 dark:bg-slate-800/60 rounded-lg animate-pulse" />
                  <div className="h-4 w-full bg-slate-200/60 dark:bg-slate-800/60 rounded-lg animate-pulse" />
                  <div className="h-4 w-4/5 bg-slate-200/60 dark:bg-slate-800/60 rounded-lg animate-pulse" />
                </div>
                <div className="border-l-4 pl-6 border-slate-200 dark:border-slate-800/60 space-y-2 pt-4">
                  <div className="h-3 w-2/3 bg-slate-200/40 dark:bg-slate-800/40 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-slate-200/40 dark:bg-slate-800/40 rounded animate-pulse" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              ref={ref}
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-8 text-center text-slate-900 dark:text-white">
                {config.aboutTitle}
              </h2>
              
              <div className="bg-white/85 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-sm border border-slate-100/60 dark:border-slate-800/85">
                <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                  <>
                    {config.aboutParagraphs.map((paragraph, index) => (
                      <p key={index} className={index === config.aboutParagraphs.length - 1 ? "mb-8" : "mb-6"}>
                        {paragraph}
                      </p>
                    ))}
                  </>
                  
                  {citations.length > 0 && (
                    <blockquote className="border-l-4 pl-6 italic text-xl font-medium my-8 min-h-[7.5rem] sm:min-h-[5.5rem] flex items-center border-accent text-slate-700 dark:text-slate-200">
                      <span className="sr-only">{citationText}</span>
                      <motion.span
                        key={currentIdx}
                        aria-hidden="true"
                        variants={containerVariants}
                        initial="hidden"
                        animate={isVisible && inView ? "visible" : "hidden"}
                        className="flex flex-wrap gap-x-1.5 leading-relaxed"
                      >
                        {words.map((word, wordIdx) => (
                          <span key={wordIdx} className="inline-block whitespace-nowrap">
                            {Array.from(word).map((char, charIdx) => (
                              <motion.span
                                key={charIdx}
                                variants={charVariants}
                                className="inline-block"
                              >
                                {char}
                              </motion.span>
                            ))}
                          </span>
                        ))}
                      </motion.span>
                    </blockquote>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

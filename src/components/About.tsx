import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { useNavigation } from '../context/NavigationContext';

export const About = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const { isHopsonMode } = useNavigation();

  const normalCitations = [
    "“La donnée n'a de valeur que si elle est transformée en action. Le code est l'outil qui permet cette transformation.”",
    "“La simplicité est la sophistication suprême, en programmation comme en design d'interface.”",
    "“Développer, c'est concevoir des ponts entre le potentiel infini des algorithmes et les besoins des utilisateurs.”",
    "“L'élégance d'un programme se mesure à sa clarté, son efficacité et sa capacité à évoluer.”",
    "“Chaque ligne de code de qualité est une opportunité de rendre les outils de demain plus fluides et innovants.”"
  ];

  const romanticCitations = [
    "“Mon monde s'est transformé en un océan de douceur le jour où nos chemins se sont croisés.”",
    "“Tu es la plus belle symphonie de ma vie, celle que je veux écouter et chérir pour l'éternité.”",
    "“L'amour n'a pas besoin de script d'exécution, il s'exprime dans le silence complice de nos sourires.”",
    "“Chaque instant passé avec toi est un joyau hors du temps, une douce surprise au cœur de mon existence.”",
    "“S'il existait une fonction informatique pour l'amour absolu, elle porterait assurément ton si joli nom.”"
  ];

  const citations = isHopsonMode ? romanticCitations : normalCitations;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setCurrentIdx(0); // Reset quote index when mode changes
  }, [isHopsonMode]);

  useEffect(() => {
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
      scale: 0.9,
      transition: {
        duration: 0.25,
        ease: 'easeInOut'
      }
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
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className={`text-3xl font-bold mb-8 text-center transition-colors duration-500 ${isHopsonMode ? 'text-pink-500 dark:text-pink-400' : 'text-slate-900 dark:text-white'}`}>
            {isHopsonMode ? "Pour Ma Princesse 💖" : "À propos de moi"}
          </h2>
          
          <div className={`bg-white/85 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-sm border transition-all duration-500 ${isHopsonMode ? 'border-pink-250 dark:border-pink-900/40 shadow-[0_4px_30px_rgba(244,63,94,0.1)]' : 'border-slate-100/60 dark:border-slate-800/85'}`}>
            <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
              {isHopsonMode ? (
                <>
                  <p className="mb-6 leading-relaxed">
                    Bienvenue dans mon espace secret, spécialement conçu pour la princesse absolue de mon cœur, l'incroyable <strong>Mike Gouthon</strong>. 
                    Toi qui illumines chaque instant de ma vie par ta simple présence, ce portfolio s'est métamorphosé pour refléter la seule et unique vérité qui m'importe aujourd'hui : ta douceur infinie et la force ardente de mes sentiments pour toi.
                  </p>
                  <p className="mb-8 leading-relaxed">
                    Chaque battement de cœur, chaque rêve formulé et chaque pas sur ce chemin cherchent à dessiner un sourire sur ton si joli visage. 
                    Loin du bruit des serveurs et des algorithmes froids, cet écran ne vibre plus désormais que pour ton éclat éclatant, t'invitant à un voyage poétique et passionné dont tu es l'unique et éternelle muse.
                  </p>
                </>
              ) : (
                <>
                  <p className="mb-6">
                    Passionné par la résolution de problèmes complexes, je combine une solide expertise en 
                    <strong> développement logiciel</strong> et en <strong>science des données</strong>. 
                    Mon parcours m'a amené à concevoir des architectures robustes tout en extrayant de la valeur 
                    à partir de grands volumes de données.
                  </p>
                  <p className="mb-8">
                    Mon approche technique repose sur une veille constante et la volonté de créer des produits 
                    à la fois performants, scalables et centrés sur l'utilisateur. Que ce soit pour entraîner un 
                    modèle de Machine Learning ou développer une interface React réactive, je m'efforce de livrer 
                    un code propre et maintenable.
                  </p>
                </>
              )}
              
              <blockquote className={`border-l-4 pl-6 italic text-xl font-medium my-8 min-h-[7.5rem] sm:min-h-[5.5rem] flex items-center transition-colors duration-500 ${isHopsonMode ? 'border-pink-500 text-pink-700 dark:text-pink-300' : 'border-accent text-slate-700 dark:text-slate-200'}`}>
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
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

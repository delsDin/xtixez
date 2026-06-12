/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemeProvider } from './context/ThemeContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { Projects } from './components/Projects';
import { Experience } from './components/Experience';
import { Testimonials } from './components/Testimonials';
import { Contact } from './components/Contact';
import { Services } from './components/Services';
import { ServiceDetail } from './components/ServiceDetail';
import { TechBackground } from './components/TechBackground';
import { CustomCursor } from './components/CustomCursor';
import { TerminalPlayground } from './components/TerminalPlayground';
import { DataPipeline } from './components/DataPipeline';
import { ThemeSelector } from './components/ThemeSelector';
import { LoveStories } from './components/LoveStories';
import { ElixirMixer } from './components/ElixirMixer';
import { ComplicityWheel } from './components/ComplicityWheel';
import { LoveClicker } from './components/LoveClicker';
import { RomanticCoder } from './components/RomanticCoder';
import { BreathingBox } from './components/BreathingBox';
import { HopsonMusicPlayer } from './components/HopsonMusicPlayer';
import { LoveChat } from './components/LoveChat';
import { SurprisesPresentation } from './components/SurprisesPresentation';
import { Certifications } from './components/Certifications';
import { motion, AnimatePresence } from 'motion/react';

const MainContent = () => {
  const { activeSection, isHopsonMode } = useNavigation();

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <Hero />;
      case 'about':
        return <About />;
      case 'love-stories':
        return <LoveStories />;
      case 'surprises':
        return <SurprisesPresentation />;
      case 'elixir':
        return <ElixirMixer />;
      case 'wheel':
        return <ComplicityWheel />;
      case 'clicker':
        return <LoveClicker />;
      case 'romanticCoder':
        return <RomanticCoder />;
      case 'breathing':
        return <BreathingBox />;
      case 'services':
        return !isHopsonMode ? <Services /> : <Hero />;
      case 'service-detail':
        return !isHopsonMode ? <ServiceDetail /> : <Hero />;
      case 'terminal':
        return <TerminalPlayground />;
      case 'pipeline':
        return !isHopsonMode ? <DataPipeline /> : <Hero />;
      case 'skills':
        return !isHopsonMode ? <Skills /> : <Hero />;
      case 'certifications':
        return !isHopsonMode ? <Certifications /> : <Hero />;
      case 'projects':
        return !isHopsonMode ? <Projects /> : <Hero />;
      case 'experience':
        return !isHopsonMode ? (
          <>
            <Experience />
            <Testimonials />
          </>
        ) : <Hero />;
      case 'contact':
        return !isHopsonMode ? <Contact /> : <Hero />;
      default:
        return <Hero />;
    }
  };

  return (
    <main className="flex-grow pt-20 flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-grow flex flex-col"
        >
          {renderSection()}
        </motion.div>
      </AnimatePresence>
    </main>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <div className="min-h-screen bg-slate-50/20 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300 flex flex-col relative overflow-hidden">
          <TechBackground />
          <CustomCursor />
          <ThemeSelector variant="floating" />
          <HopsonMusicPlayer />
          <LoveChat />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Header />
            <MainContent />
          </div>
        </div>
      </NavigationProvider>
    </ThemeProvider>
  );
}

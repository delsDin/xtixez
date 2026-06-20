/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
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
import { MLPlayground } from './components/MLPlayground';
import { ResumeGenerator } from './components/ResumeGenerator';
import { ThemeSelector } from './components/ThemeSelector';
import { BreathingBox } from './components/BreathingBox';
import { Certifications } from './components/Certifications';
import { AdminDashboard } from './components/AdminDashboard';
import { Maintenance } from './components/Maintenance';
import { DesktopOnlyWrapper } from './components/DesktopOnlyWrapper';
import { Blog } from './components/Blog';
import { Footer } from './components/Footer';
import { GithubProjects } from './components/GithubProjects';
import { HopsonRemovedModal } from './components/HopsonRemovedModal';
import { SectionSkeleton } from './components/SectionSkeleton';
import { motion, AnimatePresence } from 'motion/react';
import { reportIncident } from './lib/incident-logger';

const MainContent = () => {
  const { activeSection } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450); // Fluid 450ms transition/loading feedback for a hyper-responsive yet visually premium feel

    return () => clearTimeout(timer);
  }, [activeSection]);

  const renderSection = () => {
    if (isLoading) {
      return <SectionSkeleton section={activeSection} />;
    }

    switch (activeSection) {
      case 'home':
        return <Hero />;
      case 'about':
        return <About />;
      case 'breathing':
        return <BreathingBox />;
      case 'services':
        return <Services />;
      case 'service-detail':
        return <ServiceDetail />;
      case 'terminal':
        return (
          <DesktopOnlyWrapper moduleName="Terminal AI">
            <TerminalPlayground />
          </DesktopOnlyWrapper>
        );
      case 'pipeline':
        return (
          <DesktopOnlyWrapper moduleName="Data Pipeline">
            <DataPipeline />
          </DesktopOnlyWrapper>
        );
      case 'ml-playground':
        return (
          <DesktopOnlyWrapper moduleName="ML Playground">
            <MLPlayground />
          </DesktopOnlyWrapper>
        );
      case 'cv-generator':
        return (
          <DesktopOnlyWrapper moduleName="Générateur de CV">
            <ResumeGenerator />
          </DesktopOnlyWrapper>
        );
      case 'skills':
        return <Skills />;
      case 'certifications':
        return <Certifications />;
      case 'projects':
        return <Projects />;
      case 'github':
        return <GithubProjects />;
      case 'blog':
        return <Blog />;
      case 'experience':
        return (
          <>
            <Experience />
            <Testimonials />
          </>
        );
      case 'contact':
        return <Contact />;
      default:
        return <Hero />;
    }
  };

  return (
    <main className="flex-grow pt-20 flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeSection}-${isLoading ? 'loading' : 'ready'}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="flex-grow flex flex-col"
        >
          {renderSection()}
        </motion.div>
      </AnimatePresence>
    </main>
  );
};

import { DataProvider, useData } from './context/DataContext';
import { supabase } from './lib/supabase';

function getDeviceType() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("ipad") || ua.includes("tablet")) return "Tablet";
  if (ua.includes("mobi") || ua.includes("iphone") || ua.includes("android")) return "Mobile";
  return "Desktop";
}

function getBrowserName() {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("SamsungBrowser")) return "Samsung Browser";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  if (ua.includes("Trident")) return "Internet Explorer";
  if (ua.includes("Edge")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Unknown";
}



function AppContent() {
  const { maintenanceConfig } = useData();
  const { isAdminMode } = useNavigation();

  if (maintenanceConfig?.isActive && !isAdminMode) {
    return <Maintenance />;
  }

  return (
    <div className="min-h-screen bg-slate-50/20 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300 flex flex-col relative overflow-hidden">
      <TechBackground />
      <CustomCursor />
      <ThemeSelector variant="floating" />
      <AdminDashboard />
      <HopsonRemovedModal />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <MainContent />
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const handleGlobalError = (
      message: string | Event,
      source?: string,
      lineno?: number,
      colno?: number,
      error?: Error
    ) => {
      const msg = typeof message === 'string' ? message : message.type;
      
      // Filter out browser extensions or layout noise
      if (
        msg.includes('Extension') || 
        msg.includes('chrome-extension') || 
        msg.includes('ResizeObserver')
      ) {
        return false;
      }

      reportIncident({
        source: 'frontend_global_uncaught',
        errorMessage: msg,
        errorStack: error?.stack || `Error at ${source}:${lineno}:${colno}`,
        severity: 'warning',
        metadata: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          line: lineno,
          column: colno
        }
      });
      return false; // Let browser process it normally
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const err = event.reason;
      
      reportIncident({
        source: 'frontend_promise_rejection',
        errorMessage: err?.message || String(err),
        errorStack: err?.stack || 'Unhandled Promise Rejection',
        severity: 'warning',
        metadata: {
          url: window.location.href,
          userAgent: navigator.userAgent
        }
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    const trackVisit = async () => {
      if (sessionStorage.getItem('tracked_visit')) return;
      sessionStorage.setItem('tracked_visit', 'true');

      let ip = 'Unknown';
      let country = 'Unknown';
      let city = 'Unknown';

      try {
        const geoRes = await fetch('https://ipapi.co/json/');
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          ip = geoData.ip || 'Unknown';
          country = geoData.country_name || 'Unknown';
          city = geoData.city || 'Unknown';
        }
      } catch (e) {
        console.warn("Could not fetch geo-location details:", e);
      }

      try {
        const userAgent = navigator.userAgent;
        const path = window.location.pathname + window.location.hash;
        const device = getDeviceType();
        const browser = getBrowserName();
        const id = 'visit_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();

        await supabase.from('visits_stats').insert({
          id,
          ip,
          user_agent: userAgent,
          path,
          country,
          city,
          device,
          browser
        });
      } catch (err) {
        console.error("Error tracking visit:", err);
      }
    };

    trackVisit();
  }, []);

  return (
    <ThemeProvider>
      <NavigationProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </NavigationProvider>
    </ThemeProvider>
  );
}

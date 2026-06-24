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
  const { activeSection, setActiveSection } = useNavigation();
  const { sectionVisibility } = useData();

  const renderSection = () => {
    // Redirect if section is hidden
    if (sectionVisibility && activeSection !== 'home' && (sectionVisibility as any)[activeSection] === false) {
      setTimeout(() => setActiveSection('home'), 0);
      return <Hero />;
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
          key={activeSection}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
  const { maintenanceConfig, loading } = useData();
  const { isAdminMode } = useNavigation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col items-center justify-center relative overflow-hidden font-sans">
        {/* Background Visual Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative flex flex-col items-center space-y-6">
          {/* Concentric spinning loaders */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-slate-800/60" />
            <div className="absolute inset-0 rounded-full border-4 border-t-accent animate-spin" />
            <div className="absolute w-10 h-10 rounded-full border-4 border-slate-900/80" />
            <div className="absolute w-10 h-10 rounded-full border-4 border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }} />
          </div>
          <span className="text-xs font-mono tracking-widest font-extrabold uppercase bg-accent/10 text-accent px-3.5 py-1.5 rounded-full border border-accent/20 animate-pulse">
            Chargement des données...
          </span>
        </div>
      </div>
    );
  }

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

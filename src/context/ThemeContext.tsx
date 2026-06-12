import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface ThemeScheme {
  id: string;
  name: string;
  primary: string;       // main accent hex for canvas/js
  primaryDark: string;   // hover or dark text hex
  primaryLight: string;  // background highlights (badge)
  accentHover: string;   // hover state
  gradientFrom: string;  // gradient start color hex or class equivalent
  gradientTo: string;    // gradient end color hex or class equivalent
  vibe: string;          // professional tech description
}

export const schemes: ThemeScheme[] = [
  {
    id: 'amber',
    name: 'Industrial Amber',
    primary: '#f59e0b', // Amber 500
    primaryDark: '#d97706', // Amber 600
    primaryLight: 'rgba(245, 158, 11, 0.12)',
    accentHover: '#b45309', // Amber 700
    gradientFrom: '#f97316', // Orange 500
    gradientTo: '#eab308', // Yellow 500
    vibe: 'Data Science & Machine Learning'
  },
  {
    id: 'indigo',
    name: 'Cosmic Indigo AI',
    primary: '#6366f1', // Indigo 500
    primaryDark: '#4f46e5', // Indigo 600
    primaryLight: 'rgba(99, 102, 241, 0.12)',
    accentHover: '#4338ca', // Indigo 700
    gradientFrom: '#6366f1',
    gradientTo: '#ec4899', // Pink 500
    vibe: 'Neural Networks & Deep Learning'
  },
  {
    id: 'emerald',
    name: 'Cyber Mint & Sage',
    primary: '#10b981', // Emerald 500
    primaryDark: '#059669', // Emerald 600
    primaryLight: 'rgba(16, 185, 129, 0.12)',
    accentHover: '#047857', // Emerald 700
    gradientFrom: '#10b981',
    gradientTo: '#06b6d4', // Cyan 500
    vibe: 'Algorithmique & Optimisation'
  },
  {
    id: 'cyan',
    name: 'Polar Ice & Cloud',
    primary: '#06b6d4', // Cyan 500
    primaryDark: '#0891b2', // Cyan 600
    primaryLight: 'rgba(6, 182, 212, 0.12)',
    accentHover: '#0369a1', // Sky 700
    gradientFrom: '#06b6d4',
    gradientTo: '#3b82f6', // Blue 500
    vibe: 'Cloud-Native & Architectures API'
  },
  {
    id: 'rose',
    name: 'Sunset Crimson UX',
    primary: '#f43f5e', // Rose 500
    primaryDark: '#e11d48', // Rose 600
    primaryLight: 'rgba(244, 63, 94, 0.12)',
    accentHover: '#be123c', // Rose 700
    gradientFrom: '#f43f5e',
    gradientTo: '#8b5cf6', // Violet 500
    vibe: 'Interfaces & Expérience Utilisateur'
  }
];

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentSchemeIndex: number;
  currentScheme: ThemeScheme;
  setSchemeIndex: (index: number) => void;
  cycleScheme: () => void;
  isThemeLocked: boolean;
  enableAutoSync: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getHourlySchemeIndex = (): number => {
  const currentHour = new Date().getHours();
  // Map 24 hours into 5 schemes cleanly
  return currentHour % schemes.length;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isThemeLocked, setIsThemeLocked] = useState(() => {
    return sessionStorage.getItem('theme-accent-locked') === 'true';
  });

  // Default to the correct scheme for the current hour
  const [currentSchemeIndex, setCurrentSchemeIndex] = useState(() => {
    const savedIndex = localStorage.getItem('theme-accent-idx');
    return savedIndex !== null ? parseInt(savedIndex, 10) : getHourlySchemeIndex();
  });

  // Dark mode side-effects
  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Hourly scheme side-effects & auto updates
  useEffect(() => {
    const handleHourlyCheck = () => {
      // Only auto-update if the user has not explicitly locked/saved their own preference in this session
      const userHasLockedPreference = sessionStorage.getItem('theme-accent-locked') === 'true';
      if (!userHasLockedPreference) {
        const accurateIndex = getHourlySchemeIndex();
        setCurrentSchemeIndex(accurateIndex);
      }
    };

    // Check every 10 seconds to respond immediately when a new hour is reached
    const checkTimer = setInterval(handleHourlyCheck, 10000);
    return () => clearInterval(checkTimer);
  }, []);

  // Update root CSS custom properties when theme changes
  useEffect(() => {
    const scheme = schemes[currentSchemeIndex];
    const root = document.documentElement;
    root.style.setProperty('--color-accent', scheme.primary);
    root.style.setProperty('--color-accent-dark', scheme.primaryDark);
    root.style.setProperty('--color-accent-light', scheme.primaryLight);
    root.style.setProperty('--color-accent-hover', scheme.accentHover);
    root.style.setProperty('--color-gradient-from', scheme.gradientFrom);
    root.style.setProperty('--color-gradient-to', scheme.gradientTo);
    
    localStorage.setItem('theme-accent-idx', currentSchemeIndex.toString());
  }, [currentSchemeIndex]);

  const setSchemeIndex = (idx: number) => {
    const cleanIdx = Math.max(0, Math.min(idx, schemes.length - 1));
    setCurrentSchemeIndex(cleanIdx);
    sessionStorage.setItem('theme-accent-locked', 'true');
    setIsThemeLocked(true);
  };

  const cycleScheme = () => {
    const nextIdx = (currentSchemeIndex + 1) % schemes.length;
    setCurrentSchemeIndex(nextIdx);
    sessionStorage.setItem('theme-accent-locked', 'true');
    setIsThemeLocked(true);
  };

  const enableAutoSync = () => {
    sessionStorage.removeItem('theme-accent-locked');
    setIsThemeLocked(false);
    const accurateIdx = getHourlySchemeIndex();
    setCurrentSchemeIndex(accurateIdx);
  };

  const currentScheme = schemes[currentSchemeIndex];

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleDarkMode: () => setDarkMode(!darkMode),
        currentSchemeIndex,
        currentScheme,
        setSchemeIndex,
        cycleScheme,
        isThemeLocked,
        enableAutoSync
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

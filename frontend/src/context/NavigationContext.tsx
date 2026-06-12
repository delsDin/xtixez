import { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  activeSection: string;
  setActiveSection: (section: string) => void;
  activeServiceId: string | null;
  setActiveServiceId: (id: string | null) => void;
  isHopsonMode: boolean;
  setIsHopsonMode: (value: boolean) => void;
  surprisesUnlocked: boolean;
  setSurprisesUnlocked: (value: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const [isHopsonMode, setIsHopsonMode] = useState(false);
  const [surprisesUnlocked, setSurprisesUnlockedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hopson_surprises_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const setSurprisesUnlocked = (value: boolean) => {
    setSurprisesUnlockedState(value);
    try {
      localStorage.setItem('hopson_surprises_unlocked', String(value));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <NavigationContext.Provider value={{ 
      activeSection, 
      setActiveSection, 
      activeServiceId, 
      setActiveServiceId,
      isHopsonMode,
      setIsHopsonMode,
      surprisesUnlocked,
      setSurprisesUnlocked
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};


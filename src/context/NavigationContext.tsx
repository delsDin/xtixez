import { fetchPortfolioConfig } from '../lib/config-api';
import { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  activeSection: string;
  setActiveSection: (section: string) => void;
  activeServiceId: string | null;
  setActiveServiceId: (id: string | null) => void;
  isHopsonMode: boolean;
  setIsHopsonMode: (value: boolean) => void;
  isAdminMode: boolean;
  setIsAdminMode: (value: boolean) => void;
  surprisesUnlocked: boolean;
  setSurprisesUnlocked: (value: boolean) => void;
  ownerName: string;
  showHopsonRemovedModal: boolean;
  setShowHopsonRemovedModal: (value: boolean) => void;
  hasSuspiciousAlert: boolean;
  setHasSuspiciousAlert: (value: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [activeSection, setActiveSectionState] = useState<string>(() => {
    try {
      return localStorage.getItem('active_section') || 'home';
    } catch {
      return 'home';
    }
  });

  const [activeServiceId, setActiveServiceIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('active_service_id');
    } catch {
      return null;
    }
  });

  // Hopson mode is permanently disabled (always false)
  const [isHopsonMode] = useState<boolean>(false);

  const [isAdminMode, setIsAdminModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('is_admin_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [surprisesUnlocked, setSurprisesUnlockedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hopson_surprises_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const [ownerName, setOwnerName] = useState<string>('Dels Dinla');
  const [showHopsonRemovedModal, setShowHopsonRemovedModal] = useState<boolean>(false);
  const [hasSuspiciousAlert, setHasSuspiciousAlert] = useState<boolean>(false);

  // Dynamically load the owner's real name from the API
  useState(() => {
    try {
      fetchPortfolioConfig()
        .then(data => {
          if (data) {
            if (data.ownerName) setOwnerName(data.ownerName);
            if (data.voiceMacros) localStorage.setItem('voice_macros', JSON.stringify(data.voiceMacros));
            if (data.voiceHistory) localStorage.setItem('voice_command_history', JSON.stringify(data.voiceHistory));
            window.dispatchEvent(new Event('voice_settings_updated'));
            window.dispatchEvent(new Event('voice_history_updated'));
          }
        })
        .catch(() => {
          // Fallback to local storage if available
          const stored = localStorage.getItem('owner_name');
          if (stored) setOwnerName(stored);
        });
    } catch (e) {
      console.error(e);
    }
  });

  const setActiveSection = (section: string) => {
    setActiveSectionState(section);
    try {
      localStorage.setItem('active_section', section);
    } catch (e) {
      console.error(e);
    }
  };

  const setActiveServiceId = (id: string | null) => {
    setActiveServiceIdState(id);
    try {
      if (id === null) {
        localStorage.removeItem('active_service_id');
      } else {
        localStorage.setItem('active_service_id', id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Intercept setter - trigger removal notification modal instead of toggling State
  const setIsHopsonMode = (value: boolean) => {
    try {
      localStorage.setItem('is_hopson_mode', 'false');
    } catch {}
    if (value) {
      setShowHopsonRemovedModal(true);
    }
  };

  const setIsAdminMode = (value: boolean) => {
    setIsAdminModeState(value);
    try {
      localStorage.setItem('is_admin_mode', String(value));
    } catch (e) {
      console.error(e);
    }
  };

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
      isAdminMode,
      setIsAdminMode,
      surprisesUnlocked,
      setSurprisesUnlocked,
      ownerName,
      showHopsonRemovedModal,
      setShowHopsonRemovedModal,
      hasSuspiciousAlert,
      setHasSuspiciousAlert
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


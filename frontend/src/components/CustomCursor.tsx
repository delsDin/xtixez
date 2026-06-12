import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

export const CustomCursor: React.FC = () => {
  const { currentScheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [hoveredElType, setHoveredElType] = useState<string | null>(null);
  
  // Track actual mouse coords
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Springs for buttery smooth orbital ring movement
  const springConfig = { damping: 30, stiffness: 220, mass: 0.6 };
  const ringX = useSpring(mouseX, springConfig);
  const ringY = useSpring(mouseY, springConfig);

  useEffect(() => {
    let hasMoved = false;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!hasMoved) {
        hasMoved = true;
        setIsVisible(true);
      }
    };

    const handleMouseLeaveWindow = () => {
      setIsVisible(false);
    };

    const handleMouseEnterWindow = () => {
      setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleTouchStart = () => setIsVisible(false);

    // Dynamic hover listeners for links, buttons, and custom triggers
    const addListeners = () => {
      const interactiveElements = document.querySelectorAll(
        'a, button, [role="button"], input, select, textarea, .cursor-pointer, [data-magnetic]'
      );

      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', handleMouseEnterEl);
        el.addEventListener('mouseleave', handleMouseLeaveEl);
      });
    };

    const handleMouseEnterEl = (e: Event) => {
      setIsHovered(true);
      const target = e.currentTarget as HTMLElement;
      setHoveredElType(target.tagName.toLowerCase());
    };

    const handleMouseLeaveEl = () => {
      setIsHovered(false);
      setHoveredElType(null);
    };

    // Listen to changes in the DOM to attach hovering states on routing/updating
    const observer = new MutationObserver(() => {
      addListeners();
    });

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.addEventListener('mouseenter', handleMouseEnterWindow);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    // Initial bindings
    addListeners();
    
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      document.removeEventListener('mouseenter', handleMouseEnterWindow);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      observer.disconnect();
      
      const interactiveElements = document.querySelectorAll(
        'a, button, [role="button"], input, select, textarea, .cursor-pointer'
      );
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnterEl);
        el.removeEventListener('mouseleave', handleMouseLeaveEl);
      });
    };
  }, [mouseX, mouseY]);

  if (!isVisible) return null;

  // Adapt styles based on interactions
  const ringVariants = {
    default: {
      width: 32,
      height: 32,
      borderWidth: '1.5px',
      borderColor: currentScheme.primary,
      backgroundColor: `${currentScheme.primary}00`,
    },
    hovered: {
      width: 52,
      height: 52,
      borderWidth: '1.5px',
      borderColor: currentScheme.primary,
      backgroundColor: `${currentScheme.primary}12`, // very light alpha accent
    },
    clicked: {
      width: 24,
      height: 24,
      borderWidth: '2px',
      borderColor: currentScheme.primaryDark,
      backgroundColor: `${currentScheme.primary}25`,
    }
  };

  const dotVariants = {
    default: {
      scale: 1,
      backgroundColor: currentScheme.primary,
    },
    hovered: {
      scale: 1.5,
      backgroundColor: currentScheme.primaryDark,
    },
    clicked: {
      scale: 0.7,
      backgroundColor: currentScheme.accentHover,
    }
  };

  const currentVariant = isClicked ? 'clicked' : isHovered ? 'hovered' : 'default';

  return (
    <>
      {/* Hide the system cursor globally using a standard React utility style injected on desktop */}
      <style>{`
        @media (min-width: 1024px) {
          body, a, button, input, select, textarea, .cursor-pointer {
            cursor: none !important;
          }
        }
      `}</style>

      {/* Primary Outer Interactive Orbital Ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 rounded-full z-[99999] -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center transition-colors duration-200"
        style={{
          x: ringX,
          y: ringY,
        }}
        animate={currentVariant}
        variants={ringVariants}
        transition={{ type: 'spring', stiffness: 350, damping: 25, mass: 0.2 }}
      >
        {/* Subtle dynamic rotating orbital accent inside the outer ring */}
        {isHovered && (
          <motion.div 
            className="absolute inset-0 border border-dashed rounded-full"
            style={{ borderColor: `${currentScheme.primary}40` }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          />
        )}
      </motion.div>

      {/* Internal Core Fast Snap Point Dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 w-2 h-2 rounded-full z-[100000] -translate-x-1/2 -translate-y-1/2 hidden lg:block"
        style={{
          x: mouseX,
          y: mouseY,
        }}
        animate={currentVariant}
        variants={dotVariants}
        transition={{ duration: 0.1 }}
      />
    </>
  );
};

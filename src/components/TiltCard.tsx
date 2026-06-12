import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // In degrees
  perspective?: number; // 3D perspective depth
  scaleOnHover?: number; // subtle scale change
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTilt = 15,
  perspective = 1000,
  scaleOnHover = 1.02,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for element coordinate space tracking
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Create smooth springs for coordinates
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Map coordinate [0, 1] to rotation angles [-maxTilt, maxTilt]
  // Note: Tilting is inverted to feel like physical pressure tilting the object
  const rotateX = useTransform(springY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(springX, [0, 1], [-maxTilt, maxTilt]);

  // Map to background glow position offsets
  const glowX = useTransform(springX, [0, 1], ['0%', '100%']);
  const glowY = useTransform(springY, [0, 1], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Mouse position relative to the element (from 0 to 1)
    const mouseX = (e.clientX - rect.left) / width;
    const mouseY = (e.clientY - rect.top) / height;

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Smoothly spring back to center
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        perspective: perspective,
        rotateX: rotateX,
        rotateY: rotateY,
      }}
      animate={{
        scale: isHovered ? scaleOnHover : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative group ${className}`}
    >
      {/* 3D dynamic lighting/reflector glare effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-[inherit] z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-350 mix-blend-overlay"
        style={{
          background: `radial-gradient(circle 180px at ${glowX} ${glowY}, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 100%)`,
        }}
      />

      {/* Embedded 3D child components wrap */}
      <div 
        className="w-full h-full"
        style={{ transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}
      >
        {children}
      </div>
    </motion.div>
  );
};

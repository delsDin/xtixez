import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: 'node' | 'binary' | 'symbol';
  text: string;
  alpha: number;
  targetAlpha: number;
  speedMultiplier: number;
}

export const TechBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { darkMode, currentScheme } = useTheme();

  // Keep mouse position in a ref to avoid triggering unnecessary re-renders
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const maxParticles = 100;
    const connectionDistance = 20;
    const mouseRadius = 150;

    const symbols = ['{ }', '< >', '01', '10', 'f(x)', 'dy/dx', '[]', '&&', '||', '=>', '++', 'py', 'x', '<dels>', '</dels>', '-', '*', '+', '/', '//', '++'];

    // Resize handler
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    // Initialize particles
    const initParticles = () => {
      particles = [];
      const width = canvas.width;
      const height = canvas.height;

      for (let i = 0; i < maxParticles; i++) {
        const rand = Math.random();
        let type: 'node' | 'binary' | 'symbol' = 'node';
        let text = '';
        let radius = Math.random() * 1.5 + 1;

        if (rand > 0.85) {
          type = 'symbol';
          text = symbols[Math.floor(Math.random() * symbols.length)];
          radius = 1; // Used for text sizing multiplier if needed
        } else if (rand > 0.6) {
          type = 'binary';
          text = Math.random() > 0.5 ? '1' : '0';
          radius = 1;
        }

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius,
          type,
          text,
          alpha: Math.random() * 0.5 + 0.1,
          targetAlpha: Math.random() * 0.5 + 0.2,
          speedMultiplier: Math.random() * 0.4 + 0.8
        });
      }
    };

    // Listeners for mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Initial trigger
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();

    // Hex to Rgba converter
    const hexToRgba = (hex: string, alpha: number) => {
      const cleanHex = hex.replace('#', '');
      const num = parseInt(cleanHex, 16);
      const r = (num >> 16) & 255;
      const g = (num >> 8) & 255;
      const b = num & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Color definitions based on Dark/Light theme
    const getColors = () => {
      const accent = currentScheme.primary;
      const accentDark = currentScheme.primaryDark;
      if (darkMode) {
        return {
          bg: '#0f172a', // Slate 900
          gridLine: 'rgba(51, 65, 85, 0.1)', // Slate 700 with very low opacity
          gridCross: 'rgba(51, 65, 85, 0.25)', // Grid dots
          nodeColor: hexToRgba(accent, 0.45),
          lineColor: (alpha: number) => hexToRgba(accent, alpha * 0.15),
          textColor: (alpha: number) => hexToRgba(accent, alpha * 0.35),
          fontFamily: 'JetBrains Mono, Fira Code, monospace'
        };
      } else {
        return {
          bg: '#f8fafc', // Slate 50
          gridLine: 'rgba(226, 232, 240, 0.4)', // Slate 200
          gridCross: 'rgba(203, 213, 225, 0.4)', // Slate 300
          nodeColor: hexToRgba(accent, 0.35),
          lineColor: (alpha: number) => hexToRgba(accent, alpha * 0.1),
          textColor: (alpha: number) => hexToRgba(accentDark, alpha * 0.25),
          fontFamily: 'JetBrains Mono, Fira Code, monospace'
        };
      }
    };

    // Draw tech background grid overlay
    const drawGrid = (colors: ReturnType<typeof getColors>) => {
      const gSize = 100; // grid block size
      const width = canvas.width;
      const height = canvas.height;

      ctx.beginPath();
      ctx.strokeStyle = colors.gridLine;
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x < width; x += gSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }

      // Horizontal lines
      for (let y = 0; y < height; y += gSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Intersection nodes (crosses or dots)
      ctx.fillStyle = colors.gridCross;
      for (let x = 0; x < width; x += gSize) {
        for (let y = 0; y < height; y += gSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const colors = getColors();

      // Draw background design grid
      drawGrid(colors);

      const mouse = mouseRef.current;

      // Update and Draw Particles
      particles.forEach((p) => {
        // Softly hover alpha values for pulsing
        p.alpha += (p.targetAlpha - p.alpha) * 0.02;
        if (Math.abs(p.alpha - p.targetAlpha) < 0.05) {
          p.targetAlpha = Math.random() * 0.5 + (p.type === 'node' ? 0.2 : 0.1);
        }

        // Particle Movement
        p.x += p.vx * p.speedMultiplier;
        p.y += p.vy * p.speedMultiplier;

        // Mouse Gravitational Soft Pull
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseRadius) {
            // Apply a gentle force towards mouse
            const force = (mouseRadius - dist) / mouseRadius;
            p.x += (dx / dist) * force * 0.5;
            p.y += (dy / dist) * force * 0.5;
          }
        }

        // Window Boundary checks
        if (p.x < 0) p.x = canvas.width;
        else if (p.x > canvas.width) p.x = 0;

        if (p.y < 0) p.y = canvas.height;
        else if (p.y > canvas.height) p.y = 0;

        // Render Particle
        if (p.type === 'node') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = colors.nodeColor;
          ctx.fill();
        } else {
          ctx.fillStyle = colors.textColor(p.alpha);
          ctx.font = p.type === 'symbol' 
            ? `bold 10px ${colors.fontFamily}` 
            : `11px ${colors.fontFamily}`;
          ctx.fillText(p.text, p.x, p.y);
        }
      });

      // Draw Node Connection lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.type !== 'node') continue;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          if (p2.type !== 'node') continue;

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const fraction = 1 - dist / connectionDistance;
            const alpha = Math.min(p1.alpha, p2.alpha) * fraction;

            ctx.beginPath();
            ctx.strokeStyle = colors.lineColor(alpha);
            ctx.lineWidth = fraction * 0.9;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Check connection to Cursor/Mouse if close using a warm line
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseRadius) {
            const fraction = 1 - dist / mouseRadius;
            ctx.beginPath();
            ctx.strokeStyle = colors.lineColor(fraction * p1.alpha * 1.5);
            ctx.lineWidth = fraction * 1.4;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();

            // Tiny orbit ripple at mouse location
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = darkMode ? 'rgba(245, 158, 11, 0.5)' : 'rgba(217, 119, 6, 0.4)';
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanups
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [darkMode, currentScheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 transition-colors duration-300"
      style={{ opacity: 0.85 }}
    />
  );
};

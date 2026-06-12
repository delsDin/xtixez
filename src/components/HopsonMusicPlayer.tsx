import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigation } from '../context/NavigationContext';
import { 
  Music, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Sliders, 
  Sparkles, 
  Heart,
  ChevronDown,
  Disc
} from 'lucide-react';

interface Track {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  tempo: number; // Interval in ms
  color: string;
}

const HOP_TRACKS: Track[] = [
  {
    id: 'lofi',
    name: 'Chalet Lofi Complice',
    emoji: '🌸',
    desc: 'Accords chauds de piano électrique lofi, bruits doux et mélodie tranquille',
    tempo: 800, // 800ms per beat
    color: 'from-pink-500 to-purple-500'
  },
  {
    id: 'space_pad',
    name: 'Gravité Intriquée',
    emoji: '🌌',
    desc: 'Nappes de synthé amples et profondes avec pulsations cosmiques lentes',
    tempo: 1200,
    color: 'from-indigo-500 to-pink-500'
  },
  {
    id: 'retro_code',
    name: 'Arpèges de Cœur',
    emoji: '💻',
    desc: 'Mélodie électronique espiègle imitant un vieil ordinateur amoureux',
    tempo: 400,
    color: 'from-fuchsia-500 to-amber-500'
  }
];

// Chord Frequencies (Fmaj7, G6, Em7, Am7)
const CHORDS_LOFI = [
  [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
  [196.00, 246.94, 293.66, 392.00], // G6 (G3, B3, D4, G4)
  [164.81, 196.00, 246.94, 329.63], // Em7 (E3, G3, B3, E4)
  [220.00, 261.63, 329.63, 392.00]  // Am7 (A3, C4, E4, G4)
];

// Chord Frequencies Cosmic (Am9, Fmaj7, Cmaj9, Em7)
const CHORDS_COSMIC = [
  [110.00, 220.00, 261.63, 329.63, 440.00], // Am9
  [174.61, 261.63, 329.63, 392.00, 440.00], // Fmaj7
  [130.81, 261.63, 293.66, 329.63, 392.00], // Cmaj9
  [165.81, 246.94, 293.66, 329.63, 392.00]  // Em7
];

// Chord Frequencies Retro Code (Cmaj7, Am7, Fmaj7, G7)
const CHORDS_RETRO = [
  [130.81, 196.00, 261.63, 329.63], // Cmaj7
  [110.00, 196.00, 220.00, 261.63], // Am7
  [87.31, 174.61, 220.00, 261.63],  // Fmaj7
  [98.00, 196.00, 246.94, 293.66]   // G7
];

// Pentatonic melody drops (C, D, E, G, A, C)
const MELODY_FREQS = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

export const HopsonMusicPlayer = () => {
  const { isHopsonMode } = useNavigation();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTrackId, setActiveTrackId] = useState<string>('lofi');
  const [volume, setVolume] = useState<number>(0.25); // 0 to 1
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Audio web API references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const pulseNodeRef = useRef<OscillatorNode | null>(null);
  const sequencerIntervalRef = useRef<number | null>(null);
  const beatCounterRef = useRef<number>(0);

  const activeTrack = HOP_TRACKS.find(t => t.id === activeTrackId) || HOP_TRACKS[0];

  // Stop synthesis immediately
  const stopMusic = () => {
    if (sequencerIntervalRef.current) {
      clearInterval(sequencerIntervalRef.current);
      sequencerIntervalRef.current = null;
    }
    beatCounterRef.current = 0;
    setIsPlaying(false);
  };

  // Safe sound trigger helper
  const triggerTone = (
    freq: number, 
    type: OscillatorType, 
    startTime: number, 
    duration: number, 
    volumeFactor: number
  ) => {
    const ctx = audioCtxRef.current;
    const filter = filterRef.current;
    if (!ctx || !filter || isMuted) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      // Envelope: nice soft attack and exponential release
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volumeFactor, startTime + 0.05);
      gain.gain.setValueAtTime(volumeFactor, startTime + duration - 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch {}
  };

  // Initialize Audio Context Nodes
  const initAudioNodes = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      // Master gain
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
      gainNode.connect(ctx.destination);
      masterGainRef.current = gainNode;

      // Warm lowpass filter to emulate lofi/cozy felt sound
      const biquadFilter = ctx.createBiquadFilter();
      biquadFilter.type = 'lowpass';
      biquadFilter.frequency.setValueAtTime(750, ctx.currentTime); // warmth
      biquadFilter.connect(gainNode);
      filterRef.current = biquadFilter;

      // Background drone/ambient engine
      const pulseOsc = ctx.createOscillator();
      const pulseGain = ctx.createGain();
      pulseOsc.type = 'sine';
      pulseOsc.frequency.setValueAtTime(55, ctx.currentTime); // Low A hum
      pulseGain.gain.setValueAtTime(0.04, ctx.currentTime);
      pulseOsc.connect(pulseGain);
      pulseGain.connect(gainNode);
      pulseOsc.start();
      pulseNodeRef.current = pulseOsc;

    } catch (e) {
      console.warn("Could not start Web Audio context nodes:", e);
    }
  };

  // Adjust master gain whenever volume or mute state changes
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      try {
        const targetGain = isMuted ? 0 : volume;
        masterGainRef.current.gain.linearRampToValueAtTime(targetGain, audioCtxRef.current.currentTime + 0.15);
      } catch {}
    }
  }, [volume, isMuted]);

  // Main Sequencer Tick Loop Scheduler
  const startSequencer = () => {
    if (sequencerIntervalRef.current) clearInterval(sequencerIntervalRef.current);
    
    initAudioNodes();

    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    setIsPlaying(true);

    const stepInterval = activeTrack.tempo;

    sequencerIntervalRef.current = setInterval(() => {
      const innerCtx = audioCtxRef.current;
      if (!innerCtx || innerCtx.state === 'suspended' || isMuted) return;

      const scheduleTime = innerCtx.currentTime + 0.05;
      const beat = beatCounterRef.current;

      const chordChangeFreq = activeTrackId === 'space_pad' ? 16 : 8; // slow cosmic chords
      const activeChordIndex = Math.floor(beat / chordChangeFreq) % 4;

      let targetChords = CHORDS_LOFI;
      if (activeTrackId === 'space_pad') targetChords = CHORDS_COSMIC;
      else if (activeTrackId === 'retro_code') targetChords = CHORDS_RETRO;

      const chordFreqs = targetChords[activeChordIndex];

      // Play soft ambient chords
      if (beat % 8 === 0) {
        // Trigger pad chords
        chordFreqs.forEach((freq, idx) => {
          // Play chords gently
          const vol = activeTrackId === 'space_pad' ? 0.12 : 0.08;
          triggerTone(
            freq, 
            activeTrackId === 'space_pad' ? 'sine' : 'triangle', 
            scheduleTime, 
            stepInterval * (activeTrackId === 'space_pad' ? 7.8 : 7.2) / 1000, 
            vol
          );
        });
      }

      // Add lovely melodies depending on track context
      if (activeTrackId === 'lofi') {
        // Lofi key drops (piano drops on beats 1, 3, 4, 6)
        if (beat % 4 === 1 || beat % 4 === 3) {
          if (Math.random() > 0.3) {
            const randomMelodyNote = MELODY_FREQS[Math.floor(Math.random() * MELODY_FREQS.length)];
            triggerTone(randomMelodyNote, 'sine', scheduleTime, 0.6, 0.07);
          }
        }
        // Imitate soft vinyl crackle sounds (clicks)
        if (Math.random() > 0.5) {
          triggerTone(3500 + Math.random() * 2000, 'triangle', scheduleTime + Math.random() * 0.4, 0.005, 0.01);
        }
      } else if (activeTrackId === 'space_pad') {
        // Rare beautiful cosmic drops
        if (beat % 8 === 3 || beat % 8 === 6) {
          if (Math.random() > 0.4) {
            const randomAmbientNote = MELODY_FREQS[Math.floor(Math.random() * 5) + 3]; // high cosmic tones
            triggerTone(randomAmbientNote, 'sine', scheduleTime, 1.8, 0.06);
          }
        }
      } else if (activeTrackId === 'retro_code') {
        // Arpeggiators on beat (8th-note style arps)
        const noteIndex = beat % chordFreqs.length;
        const baseFreq = chordFreqs[noteIndex] * 2.0; // Play high notes arp
        triggerTone(baseFreq, 'triangle', scheduleTime, 0.16, 0.06);
        
        // Counter melody drops
        if (beat % 8 === 4 && Math.random() > 0.2) {
          triggerTone(MELODY_FREQS[2] * 2, 'sine', scheduleTime + 0.1, 0.3, 0.04);
        }
      }

      beatCounterRef.current = (beat + 1) % 128;
    }, stepInterval) as any;
  };

  // Automate playing music on Hopson mode entry
  useEffect(() => {
    if (isHopsonMode) {
      // Try to initialize nodes silently
      initAudioNodes();
      // Browsers strictly block auto playback unless triggered by direct user click
      // but if the context is already active we can launch it.
      if (isPlaying) {
        startSequencer();
      }
    } else {
      stopMusic();
    }

    return () => {
      // Clear audio on component destruction
      if (sequencerIntervalRef.current) {
        clearInterval(sequencerIntervalRef.current);
      }
    };
  }, [isHopsonMode, activeTrackId]);

  // Adjust lowpass filters or oscillators when changing tracks
  useEffect(() => {
    if (isPlaying) {
      startSequencer();
    }
  }, [activeTrackId]);

  const togglePlayState = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      startSequencer();
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  // If Hopson mode is disabled, render nothing
  if (!isHopsonMode) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-80 bg-white/95 dark:bg-slate-900/95 border border-pink-100 dark:border-pink-950/40 rounded-[2rem] p-4 shadow-2xl relative overflow-hidden text-left"
          >
            {/* Ambient Background Glow lines */}
            <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${activeTrack.color} opacity-80`} />

            {/* Header Title wrapper component */}
            <div className="flex items-center justify-between mb-3 pt-1">
              <div className="flex items-center gap-1.5">
                <Music size={14} className="text-pink-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-500 font-mono">
                  Playlist Hopson Complice
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-950/50 px-1.5 py-0.5 rounded border border-slate-150 dark:border-slate-850">
                  WEB AUDIO SYNTH
                </span>
              </div>
            </div>

            {/* Active Sound Track Showcase box */}
            <div className="bg-gradient-to-br from-pink-50/40 dark:from-pink-950/20 to-purple-50/20 dark:to-purple-950/10 border border-pink-100/40 dark:border-pink-950/20 rounded-2xl p-3 mb-3 relative overflow-hidden flex items-center gap-3">
              <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${activeTrack.color} shadow-sm shrink-0 flex items-center justify-center relative overflow-hidden`}>
                <AnimatePresence mode="wait">
                  {isPlaying ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                      className="text-white relative z-10"
                    >
                      <Disc size={18} className="animate-pulse" />
                    </motion.div>
                  ) : (
                    <span className="text-lg select-none relative z-10">{activeTrack.emoji}</span>
                  )}
                </AnimatePresence>
                {/* Dynamic mini sound bars */}
                {isPlaying && !isMuted && (
                  <div className="absolute inset-0 bg-black/10 flex items-end justify-center gap-0.5 pb-2">
                    <span className="w-0.5 h-3 bg-white/70 animate-[pulse_0.4s_infinite]" />
                    <span className="w-0.5 h-5 bg-white/70 animate-[pulse_0.7s_infinite_delay-100]" />
                    <span className="w-0.5 h-2 bg-white/70 animate-[pulse_0.5s_infinite_delay-200]" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-slate-800 dark:text-white truncate">
                  {activeTrack.name}
                </h4>
                <p className="text-[9.5px] leading-snug text-slate-450 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {activeTrack.desc}
                </p>
              </div>
            </div>

            {/* Main Interactive Controls Row */}
            <div className="flex items-center gap-2 mb-3">
              {/* Play / Stop trigger button */}
              <button
                onClick={togglePlayState}
                className={`py-2 px-3 rounded-xl font-bold text-xs tracking-wide uppercase flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-97 ${
                  isPlaying 
                    ? 'bg-slate-800 dark:bg-slate-250 text-white dark:text-slate-900 border border-transparent shadow hover:opacity-90' 
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/10 hover:opacity-95'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause size={12} fill="currentColor" />
                    Mettre en pause
                  </>
                ) : (
                  <>
                    <Play size={12} fill="currentColor" />
                    Lancer la musique
                  </>
                )}
              </button>

              {/* Mute button toggler */}
              <button
                onClick={handleMuteToggle}
                className={`p-2 rounded-xl border cursor-pointer transition-colors ${
                  isMuted 
                    ? 'text-pink-600 border-pink-200 bg-pink-100/40 dark:border-pink-900/40 dark:bg-pink-950/20' 
                    : 'text-slate-500 dark:text-slate-400 border-slate-150 hover:border-pink-200 dark:border-slate-850 dark:hover:border-pink-900 bg-slate-5/20'
                }`}
                title={isMuted ? "Réactiver le son" : "Couper le son"}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>

              {/* Custom Selector Dropdown trigger button */}
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="ml-auto p-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-150 dark:border-slate-850 hover:bg-slate-50/60 dark:hover:bg-slate-850/40 flex items-center gap-1 cursor-pointer"
              >
                <span>Track</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Dropdown Options List */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80 mb-3 pt-2.5 space-y-1"
                >
                  {HOP_TRACKS.map((track) => {
                    const isSelected = track.id === activeTrackId;
                    return (
                      <button
                        key={track.id}
                        onClick={() => {
                          setActiveTrackId(track.id);
                          setShowDropdown(false);
                          // Auto trigger play when track selected
                          if (!isPlaying) startSequencer();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-pink-500/10 border-pink-300 dark:border-pink-900 border text-pink-600 dark:text-pink-400 font-bold'
                            : 'bg-transparent border-transparent text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/30'
                        }`}
                      >
                        <span className="text-xs flex items-center gap-2">
                          <span>{track.emoji}</span>
                          <span>{track.name}</span>
                        </span>
                        {isSelected && <Heart size={10} fill="currentColor" className="text-pink-500" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Linear Volume controller Slider */}
            <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-450 dark:text-slate-500">
              <Sliders size={11} className="shrink-0" />
              <span>Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-full h-1 bg-slate-150 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <span className="font-mono text-[9px] shrink-0 w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>

            {/* Quiet instructions helper card */}
            {!isPlaying && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3.5 bg-pink-100/30 dark:bg-pink-950/10 border border-pink-200/20 dark:border-pink-900/15 rounded-xl p-2.5 text-center"
              >
                <p className="text-[9.5px] leading-relaxed text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                  <Sparkles size={10} className="text-purple-500" />
                  <span>Mélodies zen compilées en direct. Cliquez sur <b>Lancer la musique</b></span>
                </p>
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Floating Trigger Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 hover:bg-pink-500 hover:text-white dark:hover:bg-pink-600 hover:shadow-pink-500/20 text-slate-705 dark:text-slate-300 rounded-full shadow-lg border border-slate-200 dark:border-slate-850 transition-all select-none cursor-pointer duration-300 hover:scale-105 active:scale-95 group"
        title="Musique de Fond Hopson"
      >
        <Music 
          size={18} 
          className={`text-pink-500 group-hover:text-white transition-transform ${
            isExpanded ? 'scale-110 rotate-12' : 'scale-100 rotate-0'
          } ${isPlaying && !isMuted ? 'animate-[bounce_1.5s_infinite]' : ''}`} 
        />
      </button>
    </div>
  );
};

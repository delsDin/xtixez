/**
 * Utility to trigger an audible diagnostic/error signal on connection or auth failure.
 * Plays a double alarm pulse using the Web Audio API and falls back/enhances with French speech synthesis.
 */
export const playErrorSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Pulse 1: Low-mid alarming sawtooth buzzer tone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode1 = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.linearRampToValueAtTime(100, now + 0.35);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(145, now);
    osc2.frequency.linearRampToValueAtTime(105, now + 0.35);

    gainNode1.gain.setValueAtTime(0.25, now);
    gainNode1.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc1.connect(gainNode1);
    osc2.connect(gainNode1);
    gainNode1.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);

    // Pulse 2: Slightly offset in time and pitched higher to simulate a warning notification
    const nextPulseTime = now + 0.18;
    const osc3 = ctx.createOscillator();
    const osc4 = ctx.createOscillator();
    const gainNode2 = ctx.createGain();

    osc3.type = 'sawtooth';
    osc3.frequency.setValueAtTime(160, nextPulseTime);
    osc3.frequency.linearRampToValueAtTime(120, nextPulseTime + 0.4);

    osc4.type = 'sine';
    osc4.frequency.setValueAtTime(165, nextPulseTime);
    osc4.frequency.linearRampToValueAtTime(125, nextPulseTime + 0.4);

    gainNode2.gain.setValueAtTime(0.25, nextPulseTime);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, nextPulseTime + 0.4);

    osc3.connect(gainNode2);
    osc4.connect(gainNode2);
    gainNode2.connect(ctx.destination);

    osc3.start(nextPulseTime);
    osc4.start(nextPulseTime);
    osc3.stop(nextPulseTime + 0.4);
    osc4.stop(nextPulseTime + 0.4);

    // Complementary speech alert feedback in French
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Clears any lingering queue
      const utterance = new SpeechSynthesisUtterance("Accès refusé. Mot de passe incorrect.");
      utterance.lang = "fr-FR";
      utterance.rate = 1.15;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  } catch (err) {
    console.warn("Unable to emit audio connection alert:", err);
  }
};

/**
 * Fun retro sound when the snake eats an item.
 * Short upward frequency sweep for a rewarding bleep.
 */
export const playGameEatSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  } catch (err) {
    console.warn("Audio Context blocked or failed:", err);
  }
};

/**
 * Classic retro gameover descending sound effect.
 */
export const playGameOverSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // We play 3 descending notes with sawtooth oscillators for a standard retro 8-bit vibe
    const duration = 0.15;
    const notes = [300, 240, 180];

    notes.forEach((freq, index) => {
      const time = now + index * (duration * 1.1);
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.linearRampToValueAtTime(freq - 40, time + duration);

      gainNode.gain.setValueAtTime(0.12, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
    });

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Partie terminée.");
      utterance.lang = "fr-FR";
      utterance.rate = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  } catch (err) {
    console.warn("Audio Context blocked or failed:", err);
  }
};

/**
 * Upbeat arpeggio sound effect for cyber-hack and general game successes.
 */
export const playGameSuccessSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const stepDuration = 0.08;

    frequencies.forEach((freq, idx) => {
      const time = now + idx * stepDuration;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gainNode.gain.setValueAtTime(0.15, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.18);
    });

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Succès de l'opération.");
      utterance.lang = "fr-FR";
      utterance.rate = 1.25;
      window.speechSynthesis.speak(utterance);
    }
  } catch (err) {
    console.warn("Audio Context blocked or failed:", err);
  }
};

/**
 * Severe buzzer failure cue for game-specific non-auth failures.
 */
export const playGameFailSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.35);

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Échec.");
      utterance.lang = "fr-FR";
      utterance.rate = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  } catch (err) {
    console.warn("Audio Context blocked or failed:", err);
  }
};


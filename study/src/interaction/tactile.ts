type TactileFeedback = "press" | "tick";

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined" || !window.AudioContext) return null;
  audioContext ??= new window.AudioContext();
  return audioContext;
}

function playTone(kind: TactileFeedback) {
  const context = getAudioContext();
  if (!context) return;

  const play = () => {
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const duration = kind === "press" ? 0.065 : 0.038;

    oscillator.type = kind === "press" ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(kind === "press" ? 168 : 420, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      kind === "press" ? 118 : 310,
      now + duration,
    );

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(kind === "press" ? 0.07 : 0.032, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  };

  if (context.state === "suspended") {
    void context.resume().then(play).catch(() => {});
  } else {
    play();
  }
}

/**
 * Small, user-initiated feedback for direct manipulation.
 * Vibration is supported mostly on Android; the tiny Web Audio tone makes the
 * control legible everywhere else without shipping a sound asset.
 */
export function tactileFeedback(kind: TactileFeedback) {
  if (typeof navigator !== "undefined") {
    navigator.vibrate?.(kind === "press" ? 12 : 5);
  }
  playTone(kind);
}

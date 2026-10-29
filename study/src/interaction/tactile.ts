type TactileFeedback = "press" | "tick";

let audioContext: AudioContext | null = null;
let lastTickAt = -Infinity;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const legacyWindow = window as typeof window & {
    webkitAudioContext?: typeof AudioContext;
  };
  const AudioContextConstructor = window.AudioContext ?? legacyWindow.webkitAudioContext;
  if (!AudioContextConstructor) return null;
  audioContext ??= new AudioContextConstructor();
  return audioContext;
}

function noiseBuffer(context: AudioContext, seconds: number) {
  const frameCount = Math.max(1, Math.ceil(context.sampleRate * seconds));
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < frameCount; index += 1) {
    // A tiny random transient is more believable than a repeated pure tone.
    data[index] = (Math.random() * 2 - 1) * (1 - index / frameCount);
  }
  return buffer;
}

function disconnectWhenFinished(node: AudioScheduledSourceNode, ...nodes: AudioNode[]) {
  node.onended = () => nodes.forEach((current) => current.disconnect());
}

function schedulePress(context: AudioContext) {
  const now = context.currentTime;
  const thump = context.createOscillator();
  const thumpGain = context.createGain();
  const contact = context.createBufferSource();
  const contactFilter = context.createBiquadFilter();
  const contactGain = context.createGain();

  // A restrained low mechanical stop plus a very short dry metal transient.
  thump.type = "triangle";
  thump.frequency.setValueAtTime(178, now);
  thump.frequency.exponentialRampToValueAtTime(92, now + 0.034);
  thumpGain.gain.setValueAtTime(0.0001, now);
  thumpGain.gain.exponentialRampToValueAtTime(0.028, now + 0.003);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

  contact.buffer = noiseBuffer(context, 0.024);
  contactFilter.type = "bandpass";
  contactFilter.frequency.setValueAtTime(2450, now);
  contactFilter.Q.setValueAtTime(1.4, now);
  contactGain.gain.setValueAtTime(0.0001, now);
  contactGain.gain.exponentialRampToValueAtTime(0.014, now + 0.0015);
  contactGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

  thump.connect(thumpGain).connect(context.destination);
  contact.connect(contactFilter).connect(contactGain).connect(context.destination);
  disconnectWhenFinished(thump, thump, thumpGain);
  disconnectWhenFinished(contact, contact, contactFilter, contactGain);
  thump.start(now);
  thump.stop(now + 0.05);
  contact.start(now);
  contact.stop(now + 0.025);
}

function scheduleTick(context: AudioContext) {
  const now = context.currentTime;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = noiseBuffer(context, 0.015);
  filter.type = "highpass";
  filter.frequency.setValueAtTime(1500 + Math.random() * 280, now);
  filter.Q.setValueAtTime(0.7, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.0065, now + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);

  source.connect(filter).connect(gain).connect(context.destination);
  disconnectWhenFinished(source, source, filter, gain);
  source.start(now);
  source.stop(now + 0.016);
}

function playMechanicalFeedback(kind: TactileFeedback) {
  const context = getAudioContext();
  if (!context) return;

  const schedule = () => {
    if (kind === "press") schedulePress(context);
    else scheduleTick(context);
  };

  if (context.state === "suspended") {
    void context.resume().then(schedule).catch(() => {});
    return;
  }
  schedule();
}

/**
 * User-gesture-only feedback. Android may expose a real vibration motor;
 * other browsers keep the interaction legible through motion and quiet sound.
 */
export function tactileFeedback(kind: TactileFeedback, muted: boolean) {
  if (muted) return;

  const now = typeof performance === "undefined" ? Date.now() : performance.now();
  if (kind === "tick") {
    // A rapid sweep can cross several detents in one frame. Merge them instead
    // of building an unpleasant audio queue and repeated vibration requests.
    if (now - lastTickAt < 34) return;
    lastTickAt = now;
  }

  if (typeof navigator !== "undefined") {
    navigator.vibrate?.(kind === "press" ? 9 : 3);
  }
  playMechanicalFeedback(kind);
}

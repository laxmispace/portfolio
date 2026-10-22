// Sound sources for the lab's listening pieces: the microphone, or a small synth "voice"
// for anyone who'd rather not share a mic. Both feed an AnalyserNode to read from.

// Vowel formants (F1, F2) the synth voice wanders between, a syllable at a time.
const VOWELS: [number, number][] = [
  [730, 1090], [530, 1840], [270, 2290], [570, 840], [300, 870], [660, 1720], [440, 1020],
];

export interface AudioRig {
  ctx: AudioContext;
  analyser: AnalyserNode;
  stop: () => void;
}

function makeAnalyser(ctx: AudioContext) {
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.78;
  return analyser;
}

export async function startMic(): Promise<AudioRig> {
  // Make the context first, while the click that started this still counts as a user
  // gesture - made after the permission prompt it starts suspended and hears nothing.
  const ctx = new AudioContext();
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  } catch (err) {
    ctx.close();
    throw err;
  }
  if (ctx.state === "suspended") await ctx.resume().catch(() => {});
  const analyser = makeAnalyser(ctx);
  ctx.createMediaStreamSource(stream).connect(analyser); // listened to, never played back
  return {
    ctx,
    analyser,
    stop: () => {
      stream.getTracks().forEach((t) => t.stop());
      ctx.close();
    },
  };
}

// A murmuring, wordless voice: a buzzy source through two moving formant filters, shaped
// into syllables and little pauses. Quiet by design.
/** `onWord` fires as each new "word" (a run of syllables) begins - for a live transcript. */
export function startVoice(onWord?: () => void): AudioRig {
  const ctx = new AudioContext();
  const analyser = makeAnalyser(ctx);
  const out = ctx.createGain();
  out.gain.value = 0.18;
  analyser.connect(out).connect(ctx.destination);

  const src = ctx.createOscillator();
  src.type = "sawtooth";
  src.frequency.value = 190;
  const vibrato = ctx.createOscillator();
  const vibratoDepth = ctx.createGain();
  vibrato.frequency.value = 5.2;
  vibratoDepth.gain.value = 4;
  vibrato.connect(vibratoDepth).connect(src.frequency);

  const env = ctx.createGain();
  env.gain.value = 0;
  const f1 = ctx.createBiquadFilter();
  const f2 = ctx.createBiquadFilter();
  [f1, f2].forEach((f) => {
    f.type = "bandpass";
    f.Q.value = 9;
  });
  const mix = ctx.createGain();
  src.connect(f1).connect(mix);
  src.connect(f2).connect(mix);
  mix.connect(env).connect(analyser);
  src.start();
  vibrato.start();

  let timer = 0;
  let left = 0; // syllables left in the current word
  let wordStart = true;
  const syllable = () => {
    const now = ctx.currentTime;
    if (left <= 0) {
      left = 2 + Math.floor(Math.random() * 4);
      wordStart = true;
      env.gain.setTargetAtTime(0, now, 0.05);
      timer = window.setTimeout(syllable, 220 + Math.random() * 380); // a pause between words
      return;
    }
    if (wordStart) {
      wordStart = false;
      onWord?.();
    }
    left--;
    const [a, b] = VOWELS[Math.floor(Math.random() * VOWELS.length)];
    const len = 0.12 + Math.random() * 0.14;
    f1.frequency.setTargetAtTime(a, now, 0.03);
    f2.frequency.setTargetAtTime(b, now, 0.03);
    src.frequency.setTargetAtTime(150 + Math.random() * 110, now, 0.06);
    env.gain.setTargetAtTime(0.6 + Math.random() * 0.4, now, 0.02);
    env.gain.setTargetAtTime(0.25, now + len * 0.6, 0.04);
    timer = window.setTimeout(syllable, len * 1000);
  };
  syllable();

  return {
    ctx,
    analyser,
    stop: () => {
      window.clearTimeout(timer);
      ctx.close();
    },
  };
}

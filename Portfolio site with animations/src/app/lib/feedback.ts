// Tiny self-contained feedback for scroll interactions - a haptic tap (where the
// platform supports it) and a soft synthesised blip (no audio asset needed).

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch { return null; }
  }
  return ctx;
}

export function haptic(ms = 8) {
  try { navigator.vibrate?.(ms); } catch { /* unsupported (e.g. iOS Safari) */ }
}

// A short, low, lowpass-filtered blip. `gain` keeps it soft - ~0.03 for a scroll
// whisper, ~0.06 for a ruler notch.
export function softTick(gain = 0.05) {
  const ac = audio();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume().catch(() => {});
  const t = ac.currentTime;

  const osc = ac.createOscillator();
  const g = ac.createGain();
  const lp = ac.createBiquadFilter();

  lp.type = "lowpass";
  lp.frequency.value = 820;
  osc.type = "sine";
  osc.frequency.setValueAtTime(210, t);
  osc.frequency.exponentialRampToValueAtTime(130, t + 0.05);

  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

  osc.connect(lp).connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.09);
}

// The old Windows click: two tiny, bright noise ticks a few ms apart - a dry
// "tk-tk" like XP's navigation click.
export function windowsClick(gain = 0.22) {
  const ac = audio();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume().catch(() => {});
  const t = ac.currentTime;
  const len = Math.floor(ac.sampleRate * 0.012);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);

  const tick = (at: number, level: number, freq: number) => {
    const src = ac.createBufferSource();
    src.buffer = buf;
    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = freq;
    bp.Q.value = 1.4;
    const g = ac.createGain();
    g.gain.value = level;
    src.connect(bp).connect(g).connect(ac.destination);
    src.start(at);
  };
  tick(t, gain, 3200);
  tick(t + 0.028, gain * 0.55, 2400);
}

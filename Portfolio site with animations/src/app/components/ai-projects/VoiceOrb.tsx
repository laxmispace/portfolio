import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { motion } from "motion/react";
import { Pause, Play, Square } from "lucide-react";
import { startMic, startSpeech, type AudioRig } from "@/app/lib/labAudio";
import { colors, withAlpha } from "@/app/theme/tokens";
import { pillStyle, watchVisible } from "./LabFrames";

// A voice agent, seen on the bottom half of a phone. The orb, in the spirit of ElevenLabs',
// is a soft sphere of drifting blue drawn in a three.js shader; when it hears something
// (your mic, or a spoken voice) the colours churn faster, the rim ripples and it
// swells. What's said is typed out underneath: each new phrase lands at the top left in
// the orb's blue and pushes everything before it along and down.

export const VOICE_ORB_SIZE = { w: 400, h: 410 };


const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uLevel;
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uC;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    float ang = atan(p.y, p.x);

    // the rim: perfectly round when quiet, rippling when it hears something
    float rim = 0.94 + uLevel * 0.035 * snoise(vec3(cos(ang) * 1.6, sin(ang) * 1.6, uTime * 1.8));
    float mask = 1.0 - smoothstep(rim - 0.012, rim, r);

    // a sphere-ish warp so the flow seems to wrap round a ball
    vec2 q = p / max(0.35, sqrt(max(0.0, 1.0 - r * r * 0.55)));

    // big, soft washes of colour - low frequencies, gently folded, wide blends
    float warp = 0.35 + uLevel * 1.1;
    float n1 = snoise(vec3(q * 0.45, uTime * 0.16));
    float n2 = snoise(vec3(q * 0.7 + vec2(n1, -n1) * warp, uTime * 0.22 + 4.0));
    float n3 = snoise(vec3(q * 0.95 - vec2(n2) * warp * 0.7, uTime * 0.28 + 9.0));

    vec3 col = mix(uA, uB, smoothstep(-0.9, 0.9, n2));
    col = mix(col, uC, smoothstep(-0.1, 1.0, n3) * 0.6);

    // soft key light from the upper left, a darker underside, a thin bright rim
    col += 0.22 * (1.0 - smoothstep(0.0, 1.15, length(p - vec2(-0.38, 0.42))));
    col *= 1.0 - 0.16 * smoothstep(0.1, 1.0, -p.y * 0.9 + r * 0.4);
    col += 0.10 * smoothstep(rim - 0.09, rim - 0.01, r);

    gl_FragColor = vec4(col, mask);
  }
`;

const ORB = 176;

export const ORB_TINT = "#4F7FD8";

function Orb({ rigRef }: { rigRef: React.MutableRefObject<AudioRig | null> }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2) * 1.5);
    renderer.setSize(ORB, ORB, false);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
    host.appendChild(renderer.domElement);

    const uniforms = {
      uTime: { value: 0 },
      uLevel: { value: 0 },
      uA: { value: new THREE.Color("#9CC3F0") },
      uB: { value: new THREE.Color("#E8EEF9") },
      uC: { value: new THREE.Color(ORB_TINT) },
    };
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const material = new THREE.ShaderMaterial({ vertexShader: VERTEX, fragmentShader: FRAGMENT, uniforms, transparent: true });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    let level = 0;
    let wave = new Uint8Array(1024);
    const scaleTo = gsap.quickTo(host, "scale", { duration: 0.25, ease: "power2.out" });

    let visible = true;
    const unwatch = watchVisible(host, (v) => (visible = v));

    const tick = (_t: number, dt: number) => {
      if (!visible) return;
      const a = rigRef.current?.analyser;
      let target = 0;
      if (a) {
        if (wave.length !== a.fftSize) wave = new Uint8Array(a.fftSize);
        a.getByteTimeDomainData(wave);
        let sum = 0;
        for (let i = 0; i < wave.length; i++) {
          const v = (wave[i] - 128) / 128;
          sum += v * v;
        }
        target = Math.min(1, Math.sqrt(sum / wave.length) * 6.5);
      }
      level += (target - level) * (target > level ? 0.3 : 0.07);
      uniforms.uLevel.value = level;
      uniforms.uTime.value += (dt / 1000) * (0.55 + level * 2.6);
      scaleTo(1 + level * 0.12 + Math.sin(uniforms.uTime.value * 1.4) * 0.012);
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      unwatch();
      gsap.killTweensOf(host);
      quad.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [rigRef]);

  return <div ref={hostRef} style={{ width: ORB, height: ORB, filter: `drop-shadow(0 18px 28px ${withAlpha(ORB_TINT, 0.28)})` }} />;
}

// What the voice says - read aloud by the browser, typed out a word at a time as it speaks.
const SCRIPT = [
  "hi, i'm laxmi's lab assistant",
  "she designs things that feel calm",
  "and builds the little ones herself",
  "this orb is listening to you",
  "it changes colour as it hears",
  "try the mic and say hello",
];

type Source = "idle" | "mic" | "voice";
type Run = "stopped" | "running" | "paused";
interface Phrase {
  id: number;
  words: string[];
}
const MAX_WORDS = 24;

type SpeechRec = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e?: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function VoiceOrb() {
  const rigRef = useRef<AudioRig | null>(null);
  const recRef = useRef<SpeechRec | null>(null);
  const [source, setSource] = useState<Source>("idle");
  const [run, setRun] = useState<Run>("stopped");
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const idRef = useRef(0);
  const scriptPos = useRef({ line: 0, word: 0 });
  const session = useRef(0); // bumps on every stop, so a late mic grant can't revive an old run

  const tint = ORB_TINT;

  // newest phrase first; trim the oldest words once there are too many
  const writePhrase = useCallback((update: (list: Phrase[]) => Phrase[]) => {
    setPhrases((list) => {
      let next = update(list);
      let count = next.reduce((n, p) => n + p.words.length, 0);
      while (count > MAX_WORDS && next.length > 1) {
        count -= next[next.length - 1].words.length;
        next = next.slice(0, -1);
      }
      return next;
    });
  }, []);
  const pushWord = (word: string, newPhrase: boolean) =>
    writePhrase((list) => (newPhrase || !list.length ? [{ id: idRef.current++, words: [word] }, ...list] : [{ ...list[0], words: [...list[0].words, word] }, ...list.slice(1)]));
  const setCurrentPhrase = (words: string[], newPhrase: boolean) =>
    words.length && writePhrase((list) => (newPhrase || !list.length ? [{ id: idRef.current++, words }, ...list] : [{ ...list[0], words }, ...list.slice(1)]));

  const end = useCallback(() => {
    session.current++;
    if (recRef.current) {
      recRef.current.onend = null;
      recRef.current.onerror = null;
      try {
        recRef.current.stop();
      } catch {
        /* already stopped */
      }
      recRef.current = null;
    }
    rigRef.current?.stop();
    rigRef.current = null;
  }, []);
  useEffect(() => end, [end]);

  // started straight from the click, so the browser lets the audio (and the mic prompt) through
  const begin = (src: Source) => {
    end();
    setNote(null);
    if (src === "idle") return;
    const mine = session.current;

    if (src === "voice") {
      // a paused line starts over, so it's heard whole
      rigRef.current = startSpeech(SCRIPT, scriptPos.current.line, (line, word) => {
        scriptPos.current = { line, word };
        pushWord(SCRIPT[line].split(" ")[word], word === 0);
      });
      if (!rigRef.current) setNote("this browser can't speak here - try the mic");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setNote("this browser can't open a mic here");
      return;
    }
    startMic()
      .then((rig) => {
        if (session.current !== mine) return rig.stop();
        rigRef.current = rig;
      })
      .catch((err: { name?: string }) => {
        if (session.current !== mine) return;
        setNote(err?.name === "NotAllowedError" ? "mic is blocked - allow it from the address bar" : err?.name === "NotFoundError" ? "no mic found" : "couldn't open the mic");
      });

    const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setNote("speech-to-text isn't available in this browser - the orb still listens");
      return;
    }
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    let fresh = true;
    let fatal = false;
    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        setCurrentPhrase(res[0].transcript.trim().split(/\s+/).filter(Boolean), fresh);
        fresh = res.isFinal;
      }
    };
    rec.onerror = (e?: { error?: string }) => {
      if (e?.error === "not-allowed" || e?.error === "service-not-allowed" || e?.error === "network") {
        fatal = true;
        setNote("speech-to-text isn't available here - the orb still listens");
      }
    };
    // it stops itself after a silence; keep it going for as long as we're listening
    rec.onend = () => {
      if (!fatal && session.current === mine) {
        try {
          rec.start();
        } catch {
          /* already running */
        }
      }
    };
    try {
      rec.start();
      recRef.current = rec;
    } catch {
      /* ignore */
    }
  };

  const start = () => {
    if (source === "idle" || run === "running") return;
    begin(source);
    setRun("running");
  };
  const pause = () => {
    if (run !== "running") return;
    end();
    setRun("paused");
  };
  const stop = () => {
    end();
    setRun("stopped");
    setPhrases([]);
    setNote(null);
    scriptPos.current = { line: 0, word: 0 };
  };
  // choosing mic or voice starts it right away
  const pick = (s: Source) => {
    setSource(s);
    if (s === "idle") {
      end();
      setRun("stopped");
      return;
    }
    begin(s);
    setRun("running");
  };

  const hint =
    note ??
    (source === "idle" ? "pick mic or voice to begin" : run === "running" ? (source === "mic" ? "listening…" : "speaking…") : run === "paused" ? "paused" : "press start");

  // round icon buttons - big enough to hit with a thumb even when the card is scaled down
  const control = (label: string, Icon: typeof Play, onClick: () => void, enabled: boolean) => (
    <button
      onClick={onClick}
      disabled={!enabled}
      aria-label={label}
      title={label}
      style={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        border: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: enabled ? colors.ink : withAlpha(colors.ink, 0.08),
        color: enabled ? colors.sand : withAlpha(colors.ink, 0.3),
        cursor: enabled ? "pointer" : "default",
        transition: "background 0.2s ease, color 0.2s ease",
      }}
    >
      <Icon size={20} fill="currentColor" strokeWidth={0} />
    </button>
  );

  return (
    <div className="lab-own" style={{ position: "relative", width: VOICE_ORB_SIZE.w, height: VOICE_ORB_SIZE.h }}>
      {/* the bottom of a phone, rising out of the top of the card */}
      <div
        style={{
          position: "absolute",
          left: 52,
          right: 52,
          // runs well past the top of the card, so only its bottom half shows
          top: -240,
          height: 530,
          borderRadius: "0 0 44px 44px",
          border: "8px solid #141410",
          borderTop: "none",
          background: "#F4F1EC",
          overflow: "hidden",
          boxShadow: `0 18px 36px ${withAlpha(colors.ink, 0.14)}`,
        }}
      >
        <div style={{ position: "absolute", left: "50%", top: 250, marginLeft: -ORB / 2 }}>
          <Orb rigRef={rigRef} />
        </div>

        <div
          style={{
            position: "absolute",
            left: 22,
            right: 22,
            top: 438,
            height: 66,
            overflow: "hidden",
            textAlign: "center",
            fontSize: 13,
            lineHeight: "22px",
            fontWeight: 500,
            color: withAlpha(colors.ink, 0.72),
          }}
        >
          {phrases.length === 0 ? (
            <span style={{ color: withAlpha(colors.ink, 0.4), fontWeight: 400 }}>{hint}</span>
          ) : (
            phrases.map((ph, pi) => (
              <span key={ph.id}>
                {ph.words.map((w, wi) => (
                  <motion.span
                    key={`${ph.id}-${wi}`}
                    initial={{ opacity: 0, filter: "blur(4px)", y: 3 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0, color: pi === 0 ? tint : withAlpha(colors.ink, 0.72) }}
                    transition={{ duration: 0.35, ease: "easeOut", color: { duration: 0.6 } }}
                    style={{ display: "inline-block", marginRight: 4 }}
                  >
                    {w}
                  </motion.span>
                ))}
              </span>
            ))
          )}
        </div>
      </div>

      {/* source */}
      {/* source - large pills, so they're still easy to tap on a phone */}
      <div role="tablist" style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", gap: 10 }}>
        {(["idle", "mic", "voice"] as Source[]).map((s) => (
          <button key={s} role="tab" aria-selected={source === s} onClick={() => pick(s)} style={{ ...pillStyle(source === s), fontSize: 16, lineHeight: "20px", padding: "10px 22px" }}>
            {s}
          </button>
        ))}
      </div>

      {/* transport, along the bottom - only once there's something to play */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "center", gap: 18, opacity: source === "idle" ? 0.35 : 1, transition: "opacity 0.2s ease" }}>
        {run === "running"
          ? control("Pause", Pause, pause, true)
          : control(run === "paused" ? "Resume" : "Start", Play, start, source !== "idle")}
        {control("Stop", Square, stop, run !== "stopped" || phrases.length > 0)}
      </div>

    </div>
  );
}

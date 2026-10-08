// "Post-its for me" - a small, quiet section at the end of the page. Visitors write
// a note (name, company, optional LinkedIn, message); posting emails it to me and
// pins it to a thread where everyone's notes hang, swaying, and scroll sideways.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import gsap from "gsap";
import { Linkedin } from "lucide-react";
import {
  cooldownRemaining, fetchNotes, isGuestbookConfigured, LIMITS, postNote, validate,
  type DraftErrors, type GuestbookDraft, type GuestbookNote,
} from "@/app/lib/guestbook";
import { haptic } from "@/app/lib/feedback";
import { colors, fonts, motionTokens, withAlpha } from "@/app/theme/tokens";

const NOTE_COLORS = [colors.pinkLight, colors.oliveLight, colors.orangeLight, colors.sandLight];
const EMPTY_DRAFT: GuestbookDraft = { name: "", company: "", linkedin: "", message: "" };

// Stable "random" tilt and colour per note, so a note never jumps between renders.
function hash(value: string | number) {
  let h = 0;
  for (const ch of String(value)) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

const handInput: React.CSSProperties = {
  width: "100%", background: "none", border: "none", outline: "none", padding: "2px 0",
  fontFamily: fonts.hand, fontSize: 20, lineHeight: "26px", color: colors.ink,
  borderBottom: `1.5px solid ${withAlpha(colors.ink, 0.18)}`,
};

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
      <span className="font-inclusive-sans" style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: withAlpha(colors.ink, 0.5) }}>{label}</span>
      {children}
      {error && <span style={{ fontFamily: fonts.hand, fontSize: 17, color: colors.error }}>{error}</span>}
    </label>
  );
}

function Composer({ isMobile, onPosted }: { isMobile: boolean; onPosted: (note: GuestbookNote) => void }) {
  const [draft, setDraft] = useState<GuestbookDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [trap, setTrap] = useState(""); // honeypot: real people never fill this in
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const set = (key: keyof GuestbookDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDraft((d) => ({ ...d, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isGuestbookConfigured || status === "sending") return;
    const found = validate(draft);
    setErrors(found);
    if (Object.keys(found).length) return;
    if (trap) { setStatus("sent"); return; }
    const wait = cooldownRemaining();
    if (wait) { setStatus("error"); setMessage(`give it ${Math.ceil(wait / 1000)}s before pinning another one`); return; }

    setStatus("sending");
    try {
      const note = await postNote(draft);
      haptic(14);
      onPosted(note);
      setDraft(EMPTY_DRAFT);
      setStatus("sent");
      setMessage("pinned! it's on the wall, and in my inbox 💌");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "something went wrong - try again?");
    }
  };

  return (
    <form
      onSubmit={submit}
      style={{
        position: "relative", padding: isMobile ? "16px 16px 14px" : "18px 22px 16px",
        maxWidth: 520,
        backgroundColor: colors.oliveLight,
        boxShadow: `0 1px 2px ${withAlpha(colors.ink, 0.08)}, 0 10px 22px ${withAlpha(colors.ink, 0.1)}`,
        borderRadius: "2px 2px 14px 2px", display: "flex", flexDirection: "column", gap: 10,
      }}
    >
      <span style={{ fontFamily: fonts.hand, fontSize: 24, color: colors.ink }}>dear laxmi,</span>

      <Field label="your note" error={errors.message}>
        <textarea
          value={draft.message}
          onChange={set("message")}
          maxLength={LIMITS.message}
          rows={3}
          placeholder="say hi, share feedback, tell me about your work…"
          style={{
            ...handInput, resize: "none", borderBottom: "none", lineHeight: "28px",
            backgroundImage: `repeating-linear-gradient(180deg, transparent 0 27px, ${withAlpha(colors.ink, 0.14)} 27px 28px)`,
          }}
        />
        <span className="font-inclusive-sans" style={{ alignSelf: "flex-end", fontSize: 10, color: withAlpha(colors.ink, 0.4) }}>{draft.message.length}/{LIMITS.message}</span>
      </Field>

      <div style={{ display: "flex", gap: 14, flexDirection: isMobile ? "column" : "row" }}>
        <Field label="name" error={errors.name}>
          <input value={draft.name} onChange={set("name")} maxLength={LIMITS.name} autoComplete="name" style={handInput} />
        </Field>
        <Field label="company" error={errors.company}>
          <input value={draft.company} onChange={set("company")} maxLength={LIMITS.company} autoComplete="organization" style={handInput} />
        </Field>
      </div>
      <Field label="linkedin (optional)" error={errors.linkedin}>
        <input value={draft.linkedin} onChange={set("linkedin")} inputMode="url" placeholder="linkedin.com/in/…" style={{ ...handInput, fontSize: 18 }} />
      </Field>

      {/* honeypot - hidden from people, irresistible to bots */}
      <input
        value={trap}
        onChange={(e) => setTrap(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        name="website"
        style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
        <AnimatePresence mode="wait">
          {(status === "sent" || status === "error") && message ? (
            <motion.span
              key={message}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ fontFamily: fonts.hand, fontSize: 17, color: status === "error" ? colors.error : colors.oliveDeep }}
            >
              {message}
            </motion.span>
          ) : (
            <span style={{ fontFamily: fonts.hand, fontSize: 17, color: withAlpha(colors.ink, 0.5) }}>
              {isGuestbookConfigured ? "lands straight in my inbox" : "the post-it wall opens soon ✍️"}
            </span>
          )}
        </AnimatePresence>
        <motion.button
          type="submit"
          disabled={!isGuestbookConfigured || status === "sending"}
          whileHover={isGuestbookConfigured ? { y: -2, rotate: -1 } : undefined}
          whileTap={isGuestbookConfigured ? { scale: 0.96 } : undefined}
          className="font-inclusive-sans font-medium"
          style={{
            border: "none", borderRadius: 999, padding: "9px 16px", fontSize: 12,
            backgroundColor: colors.ink, color: colors.sand,
            cursor: isGuestbookConfigured ? "pointer" : "not-allowed", opacity: isGuestbookConfigured ? 1 : 0.45,
            boxShadow: `0 4px 0 ${withAlpha(colors.ink, 0.25)}`,
          }}
        >
          {status === "sending" ? "pinning…" : "pin it 📌"}
        </motion.button>
      </div>
    </form>
  );
}


// ── The thread ────────────────────────────────────────────────────────────────
// Notes hang from clothes pegs on a sagging thread and scroll sideways. Each note
// is a little pendulum (gsap's ticker drives it): a breeze nudges them, scrolling
// the thread swings them, brushing past one with the pointer pushes it, and a
// freshly pinned note drops in and bounces on its peg.
const PROMPTS: GuestbookNote[] = [
  { id: "prompt-1", created_at: "", name: "laxmi", company: "this wall", linkedin: null, message: "your note could hang right here ✨" },
  { id: "prompt-2", created_at: "", name: "laxmi", company: "this wall", linkedin: null, message: "say hi, share feedback, or tell me what you're building 👋" },
  { id: "prompt-3", created_at: "", name: "laxmi", company: "this wall", linkedin: null, message: "recruiters, designers, curious humans - all welcome 💌" },
];

interface Swing { angle: number; vel: number; phase: number; enteredAt: number }

function Peg() {
  return (
    <svg width="12" height="26" viewBox="0 0 12 26" aria-hidden="true" style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", overflow: "visible" }}>
      <rect x="1" y="0" width="4.5" height="26" rx="2" fill={colors.orangeLight} stroke={withAlpha(colors.ink, 0.55)} strokeWidth="0.8" />
      <rect x="6.5" y="0" width="4.5" height="26" rx="2" fill={colors.orangeLight} stroke={withAlpha(colors.ink, 0.55)} strokeWidth="0.8" />
      <circle cx="6" cy="9" r="2.2" fill="none" stroke={withAlpha(colors.ink, 0.6)} strokeWidth="1" />
    </svg>
  );
}

function HangingNote({ note, width, prompt }: { note: GuestbookNote; width: number; prompt: boolean }) {
  const h = hash(note.id);
  return (
    <div
      style={{
        position: "relative",
        width,
        minHeight: width * 0.92,
        padding: "16px 12px 10px",
        backgroundColor: NOTE_COLORS[h % NOTE_COLORS.length],
        backgroundImage: `linear-gradient(180deg, ${withAlpha(colors.white, 0.22)}, transparent 45%)`,
        boxShadow: `0 1px 2px ${withAlpha(colors.ink, 0.1)}, 0 10px 16px ${withAlpha(colors.ink, 0.12)}`,
        borderRadius: "2px 2px 12px 2px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        opacity: prompt ? 0.85 : 1,
      }}
    >
      <Peg />
      <p
        style={{
          fontFamily: fonts.hand,
          fontSize: 17,
          lineHeight: "20px",
          color: colors.ink,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          display: "-webkit-box",
          WebkitLineClamp: 6,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {note.message}
      </p>
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <p className="font-inclusive-sans" style={{ fontSize: 10, lineHeight: "13px", color: withAlpha(colors.ink, 0.65), minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          - {note.name}, <span style={{ color: withAlpha(colors.ink, 0.45) }}>{note.company}</span>
        </p>
        {note.linkedin && (
          <a href={note.linkedin} target="_blank" rel="noopener noreferrer nofollow" aria-label={`${note.name} on LinkedIn`} style={{ flexShrink: 0, display: "inline-flex", color: colors.oliveDeep }}>
            <Linkedin size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

function Thread({ notes, isMobile, freshId, prompts }: { notes: GuestbookNote[]; isMobile: boolean; freshId: GuestbookNote["id"] | null; prompts: boolean }) {
  const W = isMobile ? 128 : 150;
  const GAP = isMobile ? 22 : 30;
  const PAD = isMobile ? 24 : 40;
  const PEG_Y = 26; // resting height of the pegs on the thread
  const trackW = PAD * 2 + notes.length * W + Math.max(0, notes.length - 1) * GAP;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const noteRefs = useRef<(HTMLDivElement | null)[]>([]);
  const swings = useRef(new Map<GuestbookNote["id"], Swing>());
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const now = gsap.ticker.time; // same clock the swing loop runs on
    notes.forEach((n, i) => {
      if (!swings.current.has(n.id)) {
        swings.current.set(n.id, { angle: 0, vel: n.id === freshId ? 160 : 0, phase: (hash(n.id) % 100) / 15 + i, enteredAt: n.id === freshId ? now : -1 });
      }
    });
  }, [notes, freshId]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let lastScroll = scroller.scrollLeft;
    let visible = true;

    const pegX = (i: number) => PAD + i * (W + GAP) + W / 2;
    const draw = (t: number, dt: number) => {
      // scrolling swings the notes the other way, like a jolt on the line
      const sv = (scroller.scrollLeft - lastScroll) / Math.max(dt, 1 / 120);
      lastScroll = scroller.scrollLeft;
      const ys: number[] = [];
      notes.forEach((n, i) => {
        const s = swings.current.get(n.id);
        const el = noteRefs.current[i];
        if (!s || !el) return;
        const breeze = 2.4 * Math.sin(t * 0.9 + s.phase) + 1.2 * Math.sin(t * 1.7 + s.phase * 2.1);
        s.vel += (-26 * (s.angle - breeze) - 2.6 * s.vel - Math.max(-900, Math.min(900, sv)) * 0.05) * dt;
        s.angle = Math.max(-28, Math.min(28, s.angle + s.vel * dt));
        const bob = 2.2 * Math.sin(t * 1.1 + i * 0.8);
        let drop = 0;
        if (s.enteredAt > 0) {
          const p = Math.min(1, (t - s.enteredAt) / 0.7);
          const c = 1.7; // ease-out-back
          drop = -90 * (1 - (1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2)));
          el.style.opacity = String(Math.min(1, p * 2));
          if (p >= 1) s.enteredAt = -1;
        }
        const y = PEG_Y + bob;
        ys[i] = y;
        el.style.transform = `translate(${pegX(i) - W / 2}px, ${y + drop}px) rotate(${s.angle.toFixed(2)}deg)`;
      });
      // the thread: tied off at both ends, dipping between pegs and pulled down at each one
      let d = `M0 ${PEG_Y - 14}`;
      let px = 0, py = PEG_Y - 14;
      const pts = notes.map((_, i) => [pegX(i), ys[i] ?? PEG_Y] as const).concat([[trackW, PEG_Y - 14] as const]);
      for (const [x, y] of pts) {
        d += ` Q ${((px + x) / 2).toFixed(1)} ${(Math.max(py, y) + 10).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
        px = x; py = y;
      }
      pathRef.current?.setAttribute("d", d);
    };

    if (reduceMotion) { draw(0, 1 / 60); return; }
    const tick = (time: number, deltaMs: number) => { if (visible) draw(time, Math.min(deltaMs / 1000, 0.05)); };
    gsap.ticker.add(tick);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(scroller);
    return () => { gsap.ticker.remove(tick); io.disconnect(); };
  }, [notes, W, GAP, PAD, trackW, reduceMotion]);

  // brushing past a note pushes it
  const push = (id: GuestbookNote["id"]) => (e: React.PointerEvent) => {
    const s = swings.current.get(id);
    if (s && e.pointerType === "mouse") s.vel += e.movementX * 2.2;
  };

  // drag the thread sideways with a mouse (touch scrolls natively)
  const drag = useRef<{ x: number; left: number } | null>(null);

  return (
    <div
      ref={scrollerRef}
      onPointerDown={(e) => { if (e.pointerType === "mouse" && !(e.target as HTMLElement).closest("a")) drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft }; }}
      onPointerMove={(e) => { if (drag.current) e.currentTarget.scrollLeft = drag.current.left - (e.clientX - drag.current.x); }}
      onPointerUp={() => { drag.current = null; }}
      onPointerLeave={() => { drag.current = null; }}
      style={{
        overflowX: "auto",
        overflowY: "hidden",
        scrollbarWidth: "none",
        cursor: "grab",
        maskImage: "linear-gradient(90deg, transparent, black 24px, black calc(100% - 24px), transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, black 24px, black calc(100% - 24px), transparent)",
      }}
    >
      <div style={{ position: "relative", width: Math.max(trackW, 1), minWidth: "100%", height: W * 1.25 + 70 }}>
        <svg width={trackW} height="80" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} aria-hidden="true">
          <path ref={pathRef} fill="none" stroke={withAlpha(colors.ink, 0.55)} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        {notes.map((note, i) => (
          <div
            key={note.id}
            ref={(el) => { noteRefs.current[i] = el; }}
            onPointerMove={push(note.id)}
            style={{ position: "absolute", left: 0, top: 0, transformOrigin: `${W / 2}px -6px`, willChange: "transform" }}
          >
            <HangingNote note={note} width={W} prompt={prompts} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GuestbookSection({ isMobile }: { isMobile: boolean }) {
  const [notes, setNotes] = useState<GuestbookNote[]>([]);
  const [loading, setLoading] = useState(isGuestbookConfigured);
  const [freshId, setFreshId] = useState<GuestbookNote["id"] | null>(null);
  const [writing, setWriting] = useState(false);

  useEffect(() => {
    if (!isGuestbookConfigured) return;
    fetchNotes().then(setNotes).catch(() => setNotes([])).finally(() => setLoading(false));
  }, []);

  const pin = (note: GuestbookNote) => {
    setFreshId(note.id);
    setNotes((all) => [note, ...all]);
  };

  const showPrompts = !loading && notes.length === 0;
  const inset = isMobile ? 16 : 36;

  return (
    <section style={{ padding: isMobile ? "24px 0 16px" : "32px 0 24px" }}>
      <div style={{ padding: `0 ${inset}px`, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <p className="font-inclusive-sans font-medium uppercase" style={{ fontSize: 11, letterSpacing: "0.48px", color: colors.oliveDeep, marginBottom: 4 }}>
            leave a note
          </p>
          <p className="font-caslon not-italic" style={{ fontSize: isMobile ? 22 : 24, lineHeight: "28px", color: colors.ink, fontWeight: 600 }}>
            post-its for me
          </p>
        </div>
        <motion.button
          type="button"
          onClick={() => setWriting((w) => !w)}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="font-inclusive-sans font-medium"
          style={{ border: `1px solid ${withAlpha(colors.ink, 0.2)}`, borderRadius: 999, padding: "8px 14px", fontSize: 12, background: writing ? colors.ink : "transparent", color: writing ? colors.sand : colors.ink, cursor: "pointer" }}
        >
          {writing ? "close ✕" : "post a message for me 📌"}
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {writing && (
          <motion.div
            key="composer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: motionTokens.slow, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: `16px ${inset}px 4px` }}>
              <Composer isMobile={isMobile} onPosted={(n) => { pin(n); setWriting(false); }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginTop: 18 }}>
        {loading ? (
          <p style={{ padding: `0 ${inset}px`, fontFamily: fonts.hand, fontSize: 18, color: withAlpha(colors.ink, 0.45) }}>untangling the thread…</p>
        ) : (
          <Thread notes={showPrompts ? PROMPTS : notes} isMobile={isMobile} freshId={freshId} prompts={showPrompts} />
        )}
      </div>
    </section>
  );
}

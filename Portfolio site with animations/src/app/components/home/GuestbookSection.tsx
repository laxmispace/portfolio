// "Post-its for me" — visitors write a note on a sticky note (name, company, optional
// LinkedIn, message). Posting emails it to me and pins it to the wall below, where
// everyone else's notes hang too.
import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
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
  fontFamily: fonts.hand, fontSize: 22, lineHeight: "28px", color: colors.ink,
  borderBottom: `1.5px solid ${withAlpha(colors.ink, 0.18)}`,
};

function Tape({ rotate = -3 }: { rotate?: number }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", top: -11, left: "50%", width: 84, height: 24, transform: `translateX(-50%) rotate(${rotate}deg)`, backgroundColor: withAlpha(colors.white, 0.5), boxShadow: `0 1px 2px ${withAlpha(colors.ink, 0.08)}` }} />
  );
}

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
      setMessage(err instanceof Error ? err.message : "something went wrong — try again?");
    }
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 24, rotate: -4 }}
      whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 160, damping: 18 }}
      style={{
        position: "relative", padding: isMobile ? "28px 20px 22px" : "34px 28px 26px",
        backgroundColor: colors.oliveLight,
        backgroundImage: `linear-gradient(180deg, ${withAlpha(colors.white, 0.25)}, transparent 40%)`,
        boxShadow: `0 2px 3px ${withAlpha(colors.ink, 0.1)}, 0 18px 34px ${withAlpha(colors.ink, 0.16)}`,
        borderRadius: "2px 2px 16px 2px", display: "flex", flexDirection: "column", gap: 14,
      }}
    >
      <Tape />
      <span style={{ fontFamily: fonts.hand, fontSize: 28, color: colors.ink }}>dear laxmi,</span>

      <Field label="your note" error={errors.message}>
        <textarea
          value={draft.message}
          onChange={set("message")}
          maxLength={LIMITS.message}
          rows={5}
          placeholder="say hi, share feedback, tell me about your work…"
          style={{
            ...handInput, resize: "none", borderBottom: "none", lineHeight: "30px",
            backgroundImage: `repeating-linear-gradient(180deg, transparent 0 29px, ${withAlpha(colors.ink, 0.14)} 29px 30px)`,
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
        <input value={draft.linkedin} onChange={set("linkedin")} inputMode="url" placeholder="linkedin.com/in/…" style={{ ...handInput, fontSize: 19 }} />
      </Field>

      {/* honeypot — hidden from people, irresistible to bots */}
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
              style={{ fontFamily: fonts.hand, fontSize: 19, color: status === "error" ? colors.error : colors.oliveDeep }}
            >
              {message}
            </motion.span>
          ) : (
            <span style={{ fontFamily: fonts.hand, fontSize: 19, color: withAlpha(colors.ink, 0.5) }}>
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
            border: "none", borderRadius: 999, padding: "11px 18px", fontSize: 13,
            backgroundColor: colors.ink, color: colors.sand,
            cursor: isGuestbookConfigured ? "pointer" : "not-allowed", opacity: isGuestbookConfigured ? 1 : 0.45,
            boxShadow: `0 4px 0 ${withAlpha(colors.ink, 0.25)}`,
          }}
        >
          {status === "sending" ? "pinning…" : "post a message for me 📌"}
        </motion.button>
      </div>
    </motion.form>
  );
}

function PostIt({ note, fresh }: { note: GuestbookNote; fresh: boolean }) {
  const h = hash(note.id);
  const tilt = (h % 9) - 4;
  return (
    <motion.article
      layout
      initial={fresh ? { opacity: 0, scale: 0.4, y: -60, rotate: -24 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotate: tilt }}
      whileHover={{ rotate: 0, scale: 1.05, zIndex: 2 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      style={{
        position: "relative", width: "100%", minHeight: 170, padding: "26px 18px 16px",
        backgroundColor: NOTE_COLORS[h % NOTE_COLORS.length],
        backgroundImage: `linear-gradient(180deg, ${withAlpha(colors.white, 0.22)}, transparent 45%)`,
        boxShadow: `0 1px 2px ${withAlpha(colors.ink, 0.1)}, 0 12px 22px ${withAlpha(colors.ink, 0.13)}`,
        borderRadius: "2px 2px 12px 2px", display: "flex", flexDirection: "column", gap: 12,
      }}
    >
      <Tape rotate={(h % 7) - 3} />
      <p style={{ fontFamily: fonts.hand, fontSize: 21, lineHeight: "25px", color: colors.ink, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{note.message}</p>
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <p className="font-inclusive-sans" style={{ fontSize: 12, lineHeight: "16px", color: withAlpha(colors.ink, 0.7), minWidth: 0 }}>
          — {note.name}, <span style={{ color: withAlpha(colors.ink, 0.5) }}>{note.company}</span>
        </p>
        {note.linkedin && (
          <a href={note.linkedin} target="_blank" rel="noopener noreferrer nofollow" aria-label={`${note.name} on LinkedIn`} style={{ flexShrink: 0, display: "inline-flex", color: colors.oliveDeep }}>
            <Linkedin size={15} />
          </a>
        )}
      </div>
    </motion.article>
  );
}

export function GuestbookSection({ isMobile }: { isMobile: boolean }) {
  const [notes, setNotes] = useState<GuestbookNote[]>([]);
  const [loading, setLoading] = useState(isGuestbookConfigured);
  const [freshId, setFreshId] = useState<GuestbookNote["id"] | null>(null);

  useEffect(() => {
    if (!isGuestbookConfigured) return;
    fetchNotes().then(setNotes).catch(() => setNotes([])).finally(() => setLoading(false));
  }, []);

  const pin = (note: GuestbookNote) => {
    setFreshId(note.id);
    setNotes((all) => [note, ...all]);
  };

  return (
    <section style={{ padding: isMobile ? "40px 16px 56px" : "64px 36px 80px" }}>
      <div style={{ marginBottom: isMobile ? 24 : 32, maxWidth: 640 }}>
        <p className="font-inclusive-sans font-medium uppercase" style={{ fontSize: 12, letterSpacing: "0.48px", color: colors.oliveDeep, marginBottom: 8 }}>
          leave a note
        </p>
        <p className="font-caslon not-italic" style={{ fontSize: isMobile ? 30 : 36, lineHeight: isMobile ? "36px" : "44px", color: colors.ink, fontWeight: 600 }}>
          post-its for me
        </p>
        <p className="font-inclusive-sans" style={{ fontSize: isMobile ? 14 : 15, lineHeight: "22px", fontWeight: 300, color: withAlpha(colors.ink, 0.7), marginTop: 8 }}>
          Say hi, share feedback, or tell me what you're building. Your note lands in my inbox and gets pinned to the wall.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(300px, 380px) 1fr", gap: isMobile ? 40 : 48, alignItems: "start" }}>
        <Composer isMobile={isMobile} onPosted={pin} />

        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 150 : 190}px, 1fr))`, gap: isMobile ? 20 : 26, paddingTop: 12 }}>
          {loading &&
            [0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.35, 0.6, 0.35] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
                style={{ height: 170, backgroundColor: withAlpha(colors.ink, 0.06), borderRadius: "2px 2px 12px 2px", transform: `rotate(${i - 1}deg)` }}
              />
            ))}
          <AnimatePresence>
            {notes.map((note) => (
              <PostIt key={note.id} note={note} fresh={note.id === freshId} />
            ))}
          </AnimatePresence>
          {!loading && notes.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: motionTokens.slow }}
              style={{ fontFamily: fonts.hand, fontSize: 24, color: withAlpha(colors.ink, 0.45), alignSelf: "center" }}
            >
              the wall is empty — be the first to pin a note 📌
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}

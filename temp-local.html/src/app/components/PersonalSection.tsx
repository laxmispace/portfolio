import { useRef, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { ExternalLink } from "lucide-react";
import { useIsMobile } from "../useIsMobile";

// Photos not used in the hero intro's loading animation, reused here for the
// "beyond pixels" personal photo stack — resized/compressed the same way
// (originals were 20-28MB camera-resolution files).
import photo1 from "../../assets/stack images /optimized/2.jpg";
import photo2 from "../../assets/stack images /optimized/4.jpg";
import photo3 from "../../assets/stack images /optimized/20260425_203032 1.jpg";
import photo4 from "../../assets/stack images /optimized/20260525_163747 1.jpg";
import photo5 from "../../assets/stack images /optimized/20260613_184245(0) 1.jpg";

// ── Data ──────────────────────────────────────────────────────────────────────

const PHOTO_CARDS = [
  { image: photo1, label: "sketchbook", idx: "01" },
  { image: photo2, label: "bali 2023",  idx: "02" },
  { image: photo3, label: "wood carving", idx: "03" },
  { image: photo4, label: "badminton",  idx: "04" },
  { image: photo5, label: "coffee walks", idx: "05" },
];

const N = PHOTO_CARDS.length;

const BOOKS = [
  { title: "Master of the Game",        author: "Sidney Sheldon" },
  { title: "Rage of Angels",            author: "Sidney Sheldon" },
  { title: "The Other Side of Midnight",author: "Sidney Sheldon" },
  { title: "The Design of Everyday Things", author: "Don Norman" },
  { title: "Show Your Work!",           author: "Austin Kleon"   },
];

const MUSIC = [
  { name: "Aditya Rikhari",       url: "#" },
  { name: "Prateek Kuhad",        url: "#" },
  { name: "Rex Orange County",    url: "#" },
  { name: "Tesher",               url: "#" },
  { name: "Mali",                 url: "#" },
  { name: "Cigarettes After Sex", url: "#" },
];

const FOLLOWING = [
  { name: "Dense Discovery",   platform: "Newsletter", url: "#" },
  { name: "Lenny's Newsletter",platform: "Substack",   url: "#" },
  { name: "MKBHD",             platform: "YouTube",    url: "#" },
  { name: "Better Ideas",      platform: "YouTube",    url: "#" },
  { name: "Pablo Stanley",     platform: "Twitter",    url: "#" },
  { name: "Design Details",    platform: "Podcast",    url: "#" },
];

const BLR: { place: string; cat: "eat" | "explore" | "hangout" }[] = [
  { place: "Koshy's",           cat: "eat"     },
  { place: "Matteo Coffea",     cat: "eat"     },
  { place: "Cubbon Park",       cat: "explore" },
  { place: "NGMA Bangalore",    cat: "explore" },
  { place: "Blossoms Book House",cat:"explore" },
  { place: "Church Street Social",cat:"hangout"},
  { place: "Toit Brewpub",      cat: "hangout" },
];

// fan spread positions — desktop (stack pos 0=bottom → 4=top)
const FAN = [
  { x: -110, y: 18, rot: -16 },
  { x: -56,  y: -6, rot: -8  },
  { x:   0,  y:  0, rot:  0  },
  { x:  58,  y: -6, rot:  8  },
  { x: 112,  y: 18, rot: 16  },
];

// fan spread for mobile (smaller cards, tighter spread)
const FAN_MOBILE = [
  { x: -72, y: 14, rot: -14 },
  { x: -36, y: -4, rot: -7  },
  { x:   0, y:  0, rot:  0  },
  { x:  38, y: -4, rot:  7  },
  { x:  74, y: 14, rot: 14  },
];

// ── GSAP photo stack ───────────────────────────────────────────────────────────

function PhotoStack({ mobile = false }: { mobile?: boolean }) {
  const cardW = mobile ? 200 : 260;
  const cardH = mobile ? 261 : 340;
  const containerW = mobile ? 370 : 500;
  const containerH = mobile ? 330 : 420;
  const fanSpread = mobile ? FAN_MOBILE : FAN;

  const cardRefs   = useRef<Array<HTMLDivElement | null>>([]);
  const orderRef   = useRef<number[]>([0, 1, 2, 3, 4]);
  const hovRef     = useRef(false);
  const tapping    = useRef(false);
  const idleTweens = useRef<gsap.core.Tween[]>([]);
  const [hint, setHint] = useState(mobile ? "tap to cycle" : "hover to fan · click to cycle");

  function els() { return cardRefs.current.filter(Boolean) as HTMLDivElement[]; }

  function stackAll(animate: boolean) {
    orderRef.current.forEach((ci, pos) => {
      const el = els()[ci];
      if (!el) return;
      const props = { x: pos * 3, y: -pos * 1.8, rotation: (pos - 2) * 2, scale: 1 - (N - 1 - pos) * 0.018, zIndex: pos + 1 };
      animate ? gsap.to(el, { ...props, duration: 0.42, ease: "power3.out" }) : gsap.set(el, props);
    });
  }

  function fanAll() {
    orderRef.current.forEach((ci, pos) => {
      const el = els()[ci];
      if (!el) return;
      const f = fanSpread[pos];
      gsap.to(el, { x: f.x, y: f.y, rotation: f.rot, scale: 1, zIndex: pos + 1, duration: 0.46, ease: "power3.out" });
    });
  }

  function startIdle() {
    stopIdle();
    els().forEach((el, i) => {
      idleTweens.current.push(
        gsap.to(el, { y: `+=${5 + i * 1.2}`, duration: 1.9 + i * 0.28, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.22 })
      );
    });
  }

  function stopIdle() {
    idleTweens.current.forEach((t) => t.kill());
    idleTweens.current = [];
  }

  function cycleTop() {
    if (tapping.current) return;
    tapping.current = true;
    const order = orderRef.current;
    const topCi = order[N - 1];
    const el = els()[topCi];
    if (!el) { tapping.current = false; return; }
    stopIdle();
    const exitX = mobile ? 160 : 220;
    gsap.to(el, {
      x: exitX, y: -60, rotation: 24, opacity: 0, scale: 0.8, duration: 0.32, ease: "power2.in",
      onComplete: () => {
        orderRef.current = [topCi, ...order.slice(0, N - 1)];
        gsap.set(el, { x: -50, y: 50, rotation: -18, opacity: 0, scale: 0.8, zIndex: 0 });
        gsap.to(el, { opacity: 1, duration: 0.18, delay: 0.06 });
        if (mobile) {
          fanAll();
        } else {
          stackAll(true);
          if (!hovRef.current) setTimeout(startIdle, 520);
        }
        tapping.current = false;
      },
    });
  }

  useEffect(() => {
    if (mobile) {
      // on mobile: start stacked, fan in after a short delay for a nice reveal
      stackAll(false);
      const t = setTimeout(() => fanAll(), 400);
      return () => clearTimeout(t);
    } else {
      stackAll(false);
      startIdle();
      return () => { stopIdle(); };
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div
        style={{ width: containerW, height: containerH, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
        {...(!mobile && {
          onMouseEnter: () => { hovRef.current = true; stopIdle(); fanAll(); setHint("click any card to cycle"); },
          onMouseLeave: () => { hovRef.current = false; stackAll(true); setTimeout(startIdle, 520); setHint("hover to fan · click to cycle"); },
        })}
      >
        {PHOTO_CARDS.map((p, i) => (
          <div
            key={i}
            ref={(el) => { cardRefs.current[i] = el; }}
            onClick={cycleTop}
            style={{ position: "absolute", width: cardW, height: cardH, borderRadius: 16, border: "3px solid rgba(255,255,255,0.68)", boxShadow: "0 8px 36px rgba(33,32,18,0.16)", cursor: "pointer", overflow: "hidden", willChange: "transform" }}
          >
            <img
              src={p.image}
              alt={p.label}
              decoding="async"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(33,32,18,0.55), rgba(33,32,18,0) 45%)" }} />
            <p className="font-caslon" style={{ position: "absolute", bottom: 14, left: 14, fontSize: mobile ? 11 : 13, color: "#fff", fontStyle: "italic", opacity: 0.9 }}>{p.label}</p>
            <p className="font-spline" style={{ position: "absolute", top: 12, right: 14, fontSize: 10, color: "#fff", opacity: 0.75 }}>{p.idx}</p>
          </div>
        ))}
      </div>
      <p className="font-jakarta" style={{ fontSize: 12, color: "#625e37", opacity: 0.38, textAlign: "center" }}>{hint}</p>
    </div>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

function CardShell({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ flex: 1, minWidth: 200, borderRadius: 16, border: "1px solid rgba(33,32,18,0.08)", padding: "20px 18px 18px", backgroundColor: "rgba(33,32,18,0.015)" }}
    >
      {children}
    </motion.div>
  );
}

function CardHead({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <span style={{ fontSize: 16 }}>{emoji}</span>
      <p className="font-caslon not-italic" style={{ fontSize: 15, color: "#212012", fontWeight: 600 }}>{title}</p>
    </div>
  );
}

function HoverRowDiv({ children, isLast }: { children: ReactNode; isLast?: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ padding: "8px 6px", borderBottom: isLast ? "none" : "1px solid rgba(33,32,18,0.06)", backgroundColor: hov ? "rgba(33,32,18,0.03)" : "transparent", borderRadius: 6, transition: "background 0.12s" }}
    >
      {children}
    </div>
  );
}

function HoverRowLink({ children, href, isLast }: { children: ReactNode; href: string; isLast?: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: "block", padding: "8px 6px", borderBottom: isLast ? "none" : "1px solid rgba(33,32,18,0.06)", textDecoration: "none", cursor: "pointer", backgroundColor: hov ? "rgba(33,32,18,0.03)" : "transparent", borderRadius: 6, transition: "background 0.12s" }}
    >
      {children}
    </a>
  );
}

// ── Interest cards ─────────────────────────────────────────────────────────────

function BookCard() {
  const spineColors = ["#c3be6f", "#dda1ae", "#c67d39", "#d2ce93", "#ebc7cf"];
  return (
    <CardShell delay={0.05}>
      <CardHead emoji="📚" title="reading" />
      <div style={{ display: "flex", flexDirection: "column" }}>
        {BOOKS.map((book, i) => (
          <HoverRowDiv key={book.title} isLast={i === BOOKS.length - 1}>
            <div style={{ display: "flex", alignItems: "stretch", gap: 10 }}>
              <div style={{ width: 4, borderRadius: 4, backgroundColor: spineColors[i % spineColors.length], flexShrink: 0, alignSelf: "stretch", minHeight: 36 }} />
              <div style={{ paddingTop: 2, paddingBottom: 2 }}>
                <p className="font-jakarta font-medium" style={{ fontSize: 13, color: "#212012", lineHeight: "17px" }}>{book.title}</p>
                <p className="font-jakarta" style={{ fontSize: 11, color: "#625e37", opacity: 0.6, marginTop: 1 }}>{book.author}</p>
              </div>
            </div>
          </HoverRowDiv>
        ))}
      </div>
    </CardShell>
  );
}

function MusicCard() {
  const [playing, setPlaying] = useState<string | null>(null);
  return (
    <CardShell delay={0.1}>
      <CardHead emoji="🎵" title="on repeat" />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {MUSIC.map((artist) => {
          const isPlaying = playing === artist.name;
          return (
            <motion.div
              key={artist.name}
              onClick={() => setPlaying(isPlaying ? null : artist.name)}
              whileHover={{ x: 3 }}
              transition={{ duration: 0.15 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", borderRadius: 8, cursor: "pointer", backgroundColor: isPlaying ? "rgba(98,94,55,0.1)" : "transparent", transition: "background 0.15s" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {isPlaying ? (
                  <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 12 }}>
                    {[4, 8, 5, 10, 6].map((h, j) => (
                      <motion.div
                        key={j}
                        animate={{ height: [h, h * 2, h] }}
                        transition={{ duration: 0.5 + j * 0.08, repeat: Infinity, ease: "easeInOut", delay: j * 0.09 }}
                        style={{ width: 2, borderRadius: 2, backgroundColor: "#c67d39", transformOrigin: "bottom" }}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ width: 12, height: 12, borderRadius: "50%", border: "1.5px solid rgba(98,94,55,0.22)", flexShrink: 0 }} />
                )}
                <p className="font-jakarta font-medium" style={{ fontSize: 13, color: isPlaying ? "#212012" : "#625e37" }}>{artist.name}</p>
              </div>
              <ExternalLink size={10} color="rgba(98,94,55,0.3)" />
            </motion.div>
          );
        })}
      </div>
      <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(33,32,18,0.06)" }}>
        <p className="font-jakarta" style={{ fontSize: 11, color: "#c67d39", opacity: 0.75, cursor: "pointer" }}>connect spotify →</p>
      </div>
    </CardShell>
  );
}

function FollowCard() {
  return (
    <CardShell delay={0.15}>
      <CardHead emoji="🔗" title="who i follow" />
      <div style={{ display: "flex", flexDirection: "column" }}>
        {FOLLOWING.map((item, i) => (
          <HoverRowLink key={item.name} href={item.url} isLast={i === FOLLOWING.length - 1}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <p className="font-jakarta font-medium" style={{ fontSize: 13, color: "#212012" }}>{item.name}</p>
                <ExternalLink size={9} color="rgba(33,32,18,0.2)" />
              </div>
              <span className="font-jakarta" style={{ fontSize: 9, color: "#c67d39", backgroundColor: "rgba(198,125,57,0.1)", padding: "2px 8px", borderRadius: 10, letterSpacing: "0.3px" }}>
                {item.platform}
              </span>
            </div>
          </HoverRowLink>
        ))}
      </div>
    </CardShell>
  );
}

function BLRCard() {
  const cats = ["eat", "explore", "hangout"] as const;
  const catColor: Record<string, string> = { eat: "#c67d39", explore: "#c3be6f", hangout: "#dda1ae" };
  const catBg:    Record<string, string> = { eat: "rgba(198,125,57,0.09)", explore: "rgba(195,190,111,0.1)", hangout: "rgba(221,161,174,0.12)" };

  return (
    <CardShell delay={0.2}>
      <CardHead emoji="📍" title="blr favorites" />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {cats.map((cat) => (
          <div key={cat}>
            <p className="font-jakarta font-medium uppercase" style={{ fontSize: 9, letterSpacing: "0.5px", color: catColor[cat], marginBottom: 6 }}>{cat}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {BLR.filter((b) => b.cat === cat).map((item) => (
                <motion.span
                  key={item.place}
                  whileHover={{ scale: 1.05, backgroundColor: catColor[item.cat] }}
                  transition={{ duration: 0.14 }}
                  className="font-jakarta font-medium"
                  style={{ fontSize: 12, color: "#212012", backgroundColor: catBg[item.cat], padding: "4px 10px", borderRadius: 20, border: `1px solid ${catColor[item.cat]}30`, cursor: "pointer" }}
                >
                  {item.place}
                </motion.span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

interface PersonalSectionProps {
  onAboutOpen?: () => void;
}

export function PersonalSection({ onAboutOpen }: PersonalSectionProps) {
  const isMobile = useIsMobile();
  const [hovAbout, setHovAbout] = useState(false);

  return (
    <section style={{ padding: isMobile ? "60px 16px 80px" : "80px 40px 100px" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: "center", marginBottom: 56 }}
      >
        <p className="font-jakarta font-medium uppercase" style={{ fontSize: 12, letterSpacing: "0.48px", color: "#625e37", marginBottom: 12 }}>
          beyond pixels
        </p>
        <p className="font-caslon not-italic" style={{ fontSize: isMobile ? 32 : 40, lineHeight: isMobile ? "40px" : "48px", color: "#212012", fontWeight: 600 }}>
          i have a life outside of figma
        </p>
        <p className="font-jakarta" style={{ fontSize: 16, color: "#625e37", opacity: 0.7, marginTop: 12 }}>
          sketches, wood carving, badminton, and opinions on too many things
        </p>

        {/* About me CTA — shown below tagline */}
        {onAboutOpen && (
          <motion.button
            onClick={onAboutOpen}
            onMouseEnter={() => setHovAbout(true)}
            onMouseLeave={() => setHovAbout(false)}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 20, padding: 0 }}
          >
            <p className="font-caslon" style={{ fontSize: 15, color: "#212012", fontStyle: "italic", textDecoration: hovAbout ? "underline" : "none", textUnderlineOffset: 3, transition: "text-decoration 0.1s" }}>
              about me
            </p>
            <motion.p
              animate={{ x: hovAbout ? 4 : 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-caslon"
              style={{ fontSize: 16, color: "#212012", lineHeight: 1 }}
            >
              →
            </motion.p>
          </motion.button>
        )}
      </motion.div>

      <div style={{ marginBottom: isMobile ? 48 : 72, display: "flex", justifyContent: "center", overflow: "hidden" }}>
        <PhotoStack mobile={isMobile} />
      </div>

      <div style={{ display: "flex", gap: 14, flexDirection: isMobile ? "column" : "row", flexWrap: "wrap" }}>
        <BookCard />
        <MusicCard />
        <FollowCard />
        <BLRCard />
      </div>
    </section>
  );
}

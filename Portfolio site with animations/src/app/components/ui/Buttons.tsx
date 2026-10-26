// The site's buttons, so every one looks like it belongs:
//   SquiggleLink  - orange serif words over a hand-drawn wavy underline, like the footer's
//                   "Book a call"; on hover the line refills darker, or a scribbled oval
//                   loops around the words ("view all ai projects", "work experience").
//   PrimaryButton - the chunky pill with a hard ink shadow ("post it").
//   TextLink      - a SquiggleLink at body size ("read case study") - same type, colour and
//                   underline as the footer's "Book a call"; only the size changes. No italics.
//   ICON_BUTTON   - the size for round icon-only buttons (close, play), 36 desktop / 32 phone.
import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";
import { colors, fonts } from "@/app/theme/tokens";

export const ICON_BUTTON = { desktop: 36, mobile: 32 } as const;

const EASE = [0.16, 1, 0.3, 1] as const;

const WAVE = "M1 6 C 6 1, 10 1, 14 6 S 22 11, 27 6 S 35 1, 40 6 S 48 11, 53 6 S 61 1, 66 6 S 74 11, 79 6 S 87 1, 92 6 S 97 9, 99 7";
// a loose loop that overshoots where it started, like a pen circling a word
const OVAL = "M14 30 C 4 18, 22 5, 52 4 S 99 9, 97 22 S 72 39, 46 38 S 1 33, 4 20 S 28 3, 60 5";

/** Words with a wavy underline, in the footer's "Book a call" type (serif, 500, -0.01em);
 *  the font size is inherited unless `style` sets it. `hover="refill"` redraws the line in
 *  `deep`; `hover="oval"` keeps the line and scribbles an oval around the words instead. */
export function SquiggleLink({
  children, onClick, href, color = colors.orange, deep = colors.orangeDeep, hover: mode = "refill", hovered, as = "button", style,
}: {
  children: ReactNode; onClick?: () => void; href?: string; color?: string; deep?: string;
  hover?: "refill" | "oval";
  /** Lets a parent (a whole card) drive the hover. */
  hovered?: boolean;
  /** "span" when it sits inside something that's already clickable. */
  as?: "button" | "span";
  style?: CSSProperties;
}) {
  const [own, setOn] = useState(false);
  const on = hovered ?? own;
  // The line keeps the footer's weight relative to its words: 3px at the footer's 32px,
  // thinning in step with smaller sizes (never under 1px). Inherited size = footer weight.
  const size = typeof style?.fontSize === "number" ? style.fontSize : 32;
  const stroke = Math.min(3, Math.max(1, (size * 3) / 32));
  const id = useId().replace(/:/g, "");
  // The visible strokes keep a fixed screen width (non-scaling), which throws off a dash-based
  // draw-on; so each one is revealed through a mask: a fat copy of the same path drawn in
  // the svg's own units, which does reach the very end.
  const reveal = (d: string, maskId: string) => (
    <mask id={maskId} maskUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="90">
      <motion.path
        d={d} fill="none" stroke="white" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
        // the round cap leaves a dot at length 0, so the mask also fades out once it's undrawn
        transition={{ pathLength: { duration: on ? 0.5 : 0.3, ease: EASE }, opacity: on ? { duration: 0 } : { duration: 0, delay: 0.3 } }}
      />
    </mask>
  );
  const body = (
    <>
      {children}
      <svg aria-hidden="true" viewBox="0 0 100 12" preserveAspectRatio="none" style={{ position: "absolute", left: "-2%", width: "104%", top: "88%", height: "0.34em", overflow: "visible", pointerEvents: "none" }}>
        <path d={WAVE} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {mode === "refill" && (
          <>
            <defs>{reveal(WAVE, `${id}-line`)}</defs>
            <path d={WAVE} fill="none" stroke={deep} strokeWidth={stroke} strokeLinecap="round" vectorEffect="non-scaling-stroke" mask={`url(#${id}-line)`} />
          </>
        )}
      </svg>
      {mode === "oval" && (
        <svg aria-hidden="true" viewBox="0 0 100 42" preserveAspectRatio="none" style={{ position: "absolute", left: "-14%", width: "128%", top: "-45%", height: "190%", overflow: "visible", pointerEvents: "none" }}>
          <defs>{reveal(OVAL, `${id}-oval`)}</defs>
          <path d={OVAL} fill="none" stroke={deep} strokeWidth={(stroke * 2) / 3} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" mask={`url(#${id}-oval)`} />
        </svg>
      )}
    </>
  );
  const look: CSSProperties = {
    position: "relative", display: "inline-block", whiteSpace: "nowrap", textDecoration: "none",
    fontFamily: fonts.serif, fontWeight: 500, letterSpacing: "-0.01em",
    color: on ? deep : color, transition: "color 0.25s", ...style,
  };
  const events = { onMouseEnter: () => setOn(true), onMouseLeave: () => setOn(false), onFocus: () => setOn(true), onBlur: () => setOn(false) };
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" style={look} {...events}>{body}</a>;
  if (as === "span") return <span style={look} {...events}>{body}</span>;
  return (
    <button type="button" onClick={onClick} style={{ fontSize: "inherit", lineHeight: "inherit", background: "none", border: "none", padding: 0, cursor: "pointer", ...look }} {...events}>
      {body}
    </button>
  );
}

/** The pill. Pass `href` (and `download`) to make it a link; `icon` sits before the words. */
export function PrimaryButton({
  children, onClick, type = "button", disabled, color = colors.pink, ink = colors.ink, arrow = true, icon, href, download, className, style, ariaLabel,
}: {
  children: ReactNode; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean;
  color?: string; ink?: string; arrow?: boolean; icon?: ReactNode; href?: string; download?: boolean;
  className?: string; style?: CSSProperties; ariaLabel?: string;
}) {
  const Tag = href ? motion.a : motion.button;
  return (
    <Tag
      {...(href ? { href, download, target: download ? undefined : "_blank", rel: "noreferrer" } : { type, disabled })}
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
      initial={{ x: 0, y: 0, boxShadow: `4px 4px 0 ${ink}` }}
      whileHover={disabled ? undefined : { x: -1, y: -1, boxShadow: `5px 5px 0 ${ink}` }}
      whileTap={disabled ? undefined : { x: 3, y: 3, boxShadow: `1px 1px 0 ${ink}` }}
      transition={{ duration: 0.12 }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", whiteSpace: "nowrap",
        backgroundColor: color, color: ink, border: `2px solid ${ink}`, borderRadius: 999,
        fontFamily: fonts.serif, fontWeight: 600, fontSize: 16, lineHeight: "20px", textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, textDecoration: "none",
        ...style,
      }}
    >
      {icon}
      {children}
      {arrow && <span aria-hidden="true">→</span>}
    </Tag>
  );
}

/** The footer's text button at body size. `hovered` lets a parent (a whole card) drive the hover. */
export function TextLink({
  children, onClick, hovered, as = "button", style,
}: {
  children: ReactNode; onClick?: () => void; hovered?: boolean; as?: "button" | "span"; style?: CSSProperties;
}) {
  return (
    <SquiggleLink onClick={onClick} hovered={hovered} as={as} style={{ fontSize: 16, lineHeight: "20px", flexShrink: 0, ...style }}>
      {children}
    </SquiggleLink>
  );
}

// The site's button style: "[ TEXT -> ]" in Inclusive Sans caps. On hover the
// brackets open up by one extra space. Clicks play the old-Windows click (wired
// globally in App for every button and link).
import { useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";

const SPACE = 0.3; // em - roughly one space in Inclusive Sans

/** Just the label - for places where the parent element owns the hover. */
export function BracketLabel({
  children, open = false, color, size = 14, arrow = true, style,
}: { children: ReactNode; open?: boolean; color: string; size?: number; arrow?: boolean; style?: CSSProperties }) {
  const gap = { marginLeft: `${open ? SPACE * 2 : SPACE}em` };
  const transition = { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const };
  return (
    <span
      className="font-inclusive-sans"
      style={{
        display: "inline-flex", alignItems: "baseline", whiteSpace: "nowrap",
        fontWeight: 400, fontSize: size, lineHeight: 1.2, textTransform: "uppercase",
        letterSpacing: "0.02em", color, ...style,
      }}
    >
      <span>[</span>
      <motion.span animate={gap} initial={false} transition={transition}>{children}</motion.span>
      {arrow && <span style={{ marginLeft: `${SPACE}em` }}>-&gt;</span>}
      <motion.span animate={gap} initial={false} transition={transition}>]</motion.span>
    </span>
  );
}

type Common = { children: ReactNode; color: string; size?: number; arrow?: boolean; style?: CSSProperties; disabled?: boolean };

/** A bracket button (or link when given `href`). */
export function BracketButton({
  children, color, size, arrow, style, disabled, onClick, href, target, type = "button", download,
}: Common & { onClick?: () => void; href?: string; target?: string; type?: "button" | "submit"; download?: boolean }) {
  const [open, setOpen] = useState(false);
  const hover = {
    onMouseEnter: () => !disabled && setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => !disabled && setOpen(true),
    onBlur: () => setOpen(false),
  };
  const base: CSSProperties = {
    background: "none", border: "none", padding: 0, textDecoration: "none",
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1,
    display: "inline-flex", ...style,
  };
  const label = <BracketLabel open={open} color={color} size={size} arrow={arrow}>{children}</BracketLabel>;
  if (href) {
    return (
      <a href={href} target={target} rel={target ? "noopener noreferrer" : undefined} download={download} style={base} {...hover}>
        {label}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={base} {...hover}>
      {label}
    </button>
  );
}

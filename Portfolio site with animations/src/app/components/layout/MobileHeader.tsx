import svgPaths from "./mobileHeaderPaths";
import { colors } from "@/app/theme/tokens";
import { RESUME_URL } from "@/app/lib/links";

// Logo SVG — mirrors Frame26 > Group3 from the Figma import (56.761 × 40)
function MobileLogo() {
  return (
    <svg
      fill="none"
      height="40"
      viewBox="0 0 56.761 40"
      width="56.761"
      style={{ display: "block", flexShrink: 0 }}
    >
      <path d={svgPaths.p25cc5f00} fill={colors.ink} />
      <path d={svgPaths.pda886f0}   fill={colors.ink} />
      <path d={svgPaths.p2536cf20}  fill={colors.ink} />
      <path d={svgPaths.p3d08ce00}  fill={colors.ink} />
      <path d={svgPaths.p3cfbca80}  fill={colors.ink} />
      <path d={svgPaths.p20172780}  fill={colors.ink} />
      <path d={svgPaths.p28095380}  fill={colors.ink} />
      <path d={svgPaths.p14beeb00}  fill={colors.ink} />
      <path d={svgPaths.p1aa69e00}  fill={colors.ink} />
      <path d={svgPaths.p3aa64600}  fill={colors.ink} />
      <path d={svgPaths.p17d745f1}  fill={colors.ink} />
      <path d={svgPaths.p13db8500}  fill={colors.ink} />
      <path d={svgPaths.p8051700}   fill={colors.ink} />
      <path d={svgPaths.p2a51fb80}  fill={colors.ink} />
      <path d={svgPaths.p1b547ac0}  fill={colors.oliveDeep} />
      <path d={svgPaths.p14eea070}  fill={colors.ink} />
      <path d={svgPaths.p3bc77f80}  fill={colors.oliveDeep} />
      <path d={svgPaths.p1e1ad900}  fill={colors.ink} />
      <path d={svgPaths.p191a2e00}  fill={colors.ink} />
      <path d={svgPaths.p3ef901c0}  fill="#D9D9D9" />
      <path d={svgPaths.p37072200}  fill="#D9D9D9" />
    </svg>
  );
}

// Social icons row — mirrors Frame27 + separator + Frame25 from the Figma import
function MobileSocialIcons() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {/* LinkedIn + dot + email @ — each independently linked */}
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        <a
          href="https://in.linkedin.com/in/laxmi-mahajan"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center" }}
        >
          <svg fill="none" height="20" viewBox="0 0 28 20" width="28" style={{ display: "block" }}>
            <path d={svgPaths.p4d05d00} fill={colors.oliveDeep} />
          </svg>
        </a>
        <svg fill="none" height="20" viewBox="0 0 4 20" width="4" style={{ display: "block" }}>
          <circle cx="2" cy="10" fill={colors.olive} r="2" />
        </svg>
        <a
          href="mailto:laxmimahajanwork@gmail.com"
          style={{ display: "flex", alignItems: "center" }}
        >
          {/* path coords are centered ~x=50, so shift viewBox to match */}
          <svg fill="none" height="20" viewBox="40 0 20 20" width="20" style={{ display: "block" }}>
            <path d={svgPaths.pb4cc400} fill={colors.oliveDeep} />
          </svg>
        </a>
      </div>

      {/* Vertical separator */}
      <div style={{ width: 1, height: 16, backgroundColor: colors.olive, flexShrink: 0 }} />

      {/* Download button — Frame25 */}
      <a
        href={RESUME_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 6,
          borderRadius: 8,
          border: `1px solid ${colors.orange}`,
          flexShrink: 0,
          textDecoration: "none",
        }}
      >
        <svg fill="none" height="16" viewBox="0 0 16 16" width="16" style={{ display: "block" }}>
          <path d={svgPaths.p2510840} fill={colors.orange} />
        </svg>
      </a>
    </div>
  );
}

// Full mobile header — logo left, social right
export function MobileHeader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 10px 0",
      }}
    >
      <MobileLogo />
      <MobileSocialIcons />
    </div>
  );
}

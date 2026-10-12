import svgPaths from "@/imports/IPhone1415Pro3/svg-p1axtwzys3";

// Logo SVG — mirrors Frame26 > Group3 from the Figma import (56.761 × 40)
export function MobileLogo() {
  return (
    <svg
      fill="none"
      height="40"
      viewBox="0 0 56.761 40"
      width="56.761"
      style={{ display: "block", flexShrink: 0 }}
    >
      <path d={svgPaths.p25cc5f00} fill="#212012" />
      <path d={svgPaths.pda886f0}   fill="#212012" />
      <path d={svgPaths.p2536cf20}  fill="#212012" />
      <path d={svgPaths.p3d08ce00}  fill="#212012" />
      <path d={svgPaths.p3cfbca80}  fill="#212012" />
      <path d={svgPaths.p20172780}  fill="#212012" />
      <path d={svgPaths.p28095380}  fill="#212012" />
      <path d={svgPaths.p14beeb00}  fill="#212012" />
      <path d={svgPaths.p1aa69e00}  fill="#212012" />
      <path d={svgPaths.p3aa64600}  fill="#212012" />
      <path d={svgPaths.p17d745f1}  fill="#212012" />
      <path d={svgPaths.p13db8500}  fill="#212012" />
      <path d={svgPaths.p8051700}   fill="#212012" />
      <path d={svgPaths.p2a51fb80}  fill="#212012" />
      <path d={svgPaths.p1b547ac0}  fill="#625E37" />
      <path d={svgPaths.p14eea070}  fill="#212012" />
      <path d={svgPaths.p3bc77f80}  fill="#625E37" />
      <path d={svgPaths.p1e1ad900}  fill="#1E1E1E" />
      <path d={svgPaths.p191a2e00}  fill="#1E1E1E" />
      <path d={svgPaths.p3ef901c0}  fill="#D9D9D9" />
      <path d={svgPaths.p37072200}  fill="#D9D9D9" />
    </svg>
  );
}

// Social icons row — mirrors Frame27 + separator + Frame25 from the Figma import
export function MobileSocialIcons() {
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
            <path d={svgPaths.p4d05d00} fill="#625E37" />
          </svg>
        </a>
        <svg fill="none" height="20" viewBox="0 0 4 20" width="4" style={{ display: "block" }}>
          <circle cx="2" cy="10" fill="#C3BE6F" r="2" />
        </svg>
        <a
          href="mailto:laxmimahajanwork@gmail.com"
          style={{ display: "flex", alignItems: "center" }}
        >
          {/* path coords are centered ~x=50, so shift viewBox to match */}
          <svg fill="none" height="20" viewBox="40 0 20 20" width="20" style={{ display: "block" }}>
            <path d={svgPaths.pb4cc400} fill="#625E37" />
          </svg>
        </a>
      </div>

      {/* Vertical separator */}
      <div style={{ width: 1, height: 16, backgroundColor: "#C3BE6F", flexShrink: 0 }} />

      {/* Download button — Frame25 */}
      <a
        href="https://drive.google.com/file/d/1cm1x-y31ugOERxl7MaLuoOYGnNq0r1p0/view?usp=sharing"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 6,
          borderRadius: 8,
          border: "1px solid #c67d39",
          flexShrink: 0,
          textDecoration: "none",
        }}
      >
        <svg fill="none" height="16" viewBox="0 0 16 16" width="16" style={{ display: "block" }}>
          <path d={svgPaths.p2510840} fill="#C67D39" />
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
        padding: "24px 16px 0",
      }}
    >
      <MobileLogo />
      <MobileSocialIcons />
    </div>
  );
}

// The "laxmi mahajan" logo, used in the side nav, the mobile header and the loader.
// The artwork lives in src/assets/logo/laxmi-mahajan-logo.svg — swap that file to
// update the logo everywhere. Until it has content, the name shows in handwriting.
import type { CSSProperties } from "react";
import logoSvg from "@/assets/logo/laxmi-mahajan-logo.svg?raw";
import { colors, fonts } from "@/app/theme/tokens";

const hasArtwork = logoSvg.trim().startsWith("<svg");

export function Logo({ height, style }: { height: number; style?: CSSProperties }) {
  if (hasArtwork) {
    return (
      <span
        role="img"
        aria-label="Laxmi Mahajan"
        className="site-logo"
        style={{ display: "inline-block", height, lineHeight: 0, ...style }}
        dangerouslySetInnerHTML={{ __html: logoSvg }}
      />
    );
  }
  return (
    <span
      aria-label="Laxmi Mahajan"
      style={{ display: "inline-block", fontFamily: fonts.hand, fontWeight: 600, fontSize: height * 0.62, lineHeight: `${height}px`, color: colors.ink, whiteSpace: "nowrap", ...style }}
    >
      laxmi mahajan
    </span>
  );
}

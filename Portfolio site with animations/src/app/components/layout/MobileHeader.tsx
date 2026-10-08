import { Logo } from "./Logo";

// Mobile header: just the logo. LinkedIn, email and the resume live in the FAB
// menu in the sticky bottom nav.
export function MobileHeader() {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "20px 16px 0" }}>
      <Logo height={44} />
    </div>
  );
}

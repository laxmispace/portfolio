import type { NavSection } from "./SideNav";

const TRIANGLE =
  "M1.70796 0.5C2.05998 -0.166667 2.94002 -0.166666 3.29204 0.5L4.87611 3.5C5.22812 4.16667 4.7881 5 4.08407 5H0.915928C0.211896 5 -0.228123 4.16667 0.123893 3.5L1.70796 0.5Z";

const NAV_ITEMS: { id: NavSection; label: string }[] = [
  { id: "home",         label: "home" },
  { id: "projects",     label: "projects" },
  { id: "ai-playground",label: "ai playground" },
  { id: "tinkering",    label: "tinkering" },
];

export function MobileBottomNav({
  activeSection,
  onNavigate,
}: {
  activeSection: NavSection;
  onNavigate: (s: NavSection) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
        backgroundColor: "rgba(236,230,223,0.8)",
        borderRadius: 16,
        display: "flex",
        gap: 16,
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 12px",
        width: "calc(100% - 32px)",
        maxWidth: 369,
      }}
    >
      {NAV_ITEMS.map(({ id, label }) =>
        id === activeSection ? (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <svg width={5} height={5} viewBox="0 0 5 5" fill="none">
              <path d={TRIANGLE} fill="#625E37" />
            </svg>
            <span
              style={{
                fontFamily: "'Libre Caslon Condensed', serif",
                fontSize: 12,
                letterSpacing: "-0.24px",
                color: "#625e37",
                whiteSpace: "nowrap",
                lineHeight: "normal",
              }}
            >
              {label}
            </span>
          </button>
        ) : (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 500,
              fontSize: 10,
              letterSpacing: "0.4px",
              color: "#c67d39",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              lineHeight: "normal",
            }}
          >
            {label}
          </button>
        )
      )}
    </div>
  );
}

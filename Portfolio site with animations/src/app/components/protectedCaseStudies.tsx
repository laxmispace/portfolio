// Password-protected case study content (CS1 ICICI iTravel, CS2 ICICI FASTag).
// Never imported statically: production builds emit this module as its own chunk,
// encrypt it (vite.config.ts → protectCaseStudies) and load it only after unlock.
import {
  Spacer, SectionBlock, SectionHeading, BodyText, SubHeading, ImageCarousel,
  LandingComparisonPanel, IterationLabel, IterationThumbnailRow, StateTreatmentTable,
  ImageGrid2x2, JTBDColumnDivider,
} from "./caseStudyShared";

// ─── CS1 image assets (ICICI Bank iTravel) ────────────────────────────────────
import imgEntryHasCard from "../../assets/Cards - CS/1/has cc.png";
import imgEntryNoCard1 from "../../assets/Cards - CS/1/has no cc - 1.png";
import imgEntryNoCard2 from "../../assets/Cards - CS/1/has no cc - 2.png";
import imgTripSingleEmpty from "../../assets/Cards - CS/2/image 2928.png";
import imgTripSingleFilled from "../../assets/Cards - CS/2/image 2929.png";
import imgTripMultiEmpty from "../../assets/Cards - CS/2/Step 1 - 1.png";
import imgTripMultiAdded from "../../assets/Cards - CS/2/Step 1 - 2.png";
import imgTripMultiFilled from "../../assets/Cards - CS/2/Step 1 - 3.png";
import imgPrefsDefault from "../../assets/Cards - CS/3/3 -1.png";
import imgPrefsEditing from "../../assets/Cards - CS/3/3 - 2.png";
import imgPrefsFilled from "../../assets/Cards - CS/3/3 - 3.png";
import imgAutoExpiry from "../../assets/Cards - CS/3/image 2969.png";

// ─── CS2 image assets (ICICI FASTag) ──────────────────────────────────────────
import imgFastagNonIcici from "../../assets/FASTag/My FASTag/LP/1. NON UB FT.png";
import imgFastagAutoOff from "../../assets/FASTag/My FASTag/LP/2. UB + NAR.png";
import imgFastagAutoOn from "../../assets/FASTag/My FASTag/LP/3. UB + AR.png";

// Landing page — section 1 (user/landing states)
import imgLandingEmpty from "../../assets/FASTag/Landing page/Landing - Section 1/Landing-empty.png";
import imgLandingExisting from "../../assets/FASTag/Landing page/Landing - Section 1/Landing - E.png";
import imgLandingScrolled from "../../assets/FASTag/Landing page/Landing - Section 1/LPE - Scrolled.png";
import imgLandingMenuOpen from "../../assets/FASTag/Landing page/Landing - Section 1/LPE - menu open.png";

// Landing page — section 2 (the TAB decision)
import imgTabOld from "../../assets/FASTag/Landing page/TAB - Section 2/Old FT.png";
import imgTabMyFastag from "../../assets/FASTag/Landing page/TAB - Section 2/My bank FT.png";
import imgTabOtherFastag from "../../assets/FASTag/Landing page/TAB - Section 2/Other F T.png";

// Card exploration — iteration thumbnail rows
import imgIter1_1 from "../../assets/FASTag/Card exploration/Iteration - 1/1.png";
import imgIter1_2 from "../../assets/FASTag/Card exploration/Iteration - 1/2.png";
import imgIter1_3 from "../../assets/FASTag/Card exploration/Iteration - 1/3.png";
import imgIter1_4 from "../../assets/FASTag/Card exploration/Iteration - 1/4.png";
import imgIter1_5 from "../../assets/FASTag/Card exploration/Iteration - 1/5.png";
import imgIter1_6 from "../../assets/FASTag/Card exploration/Iteration - 1/6.png";
import imgIter2_1 from "../../assets/FASTag/Card exploration/Iteration - 2/1.png";
import imgIter2_2 from "../../assets/FASTag/Card exploration/Iteration - 2/2.png";
import imgIter2_3 from "../../assets/FASTag/Card exploration/Iteration - 2/3.png";
import imgIter2_4 from "../../assets/FASTag/Card exploration/Iteration - 2/4.png";
import imgIter2_5 from "../../assets/FASTag/Card exploration/Iteration - 2/5.png";
import imgIter2_6 from "../../assets/FASTag/Card exploration/Iteration - 2/6.png";
import imgIter3_1 from "../../assets/FASTag/Card exploration/Iteration - 3/1.png";
import imgIter3_2 from "../../assets/FASTag/Card exploration/Iteration - 3/2.png";
import imgIter3_3 from "../../assets/FASTag/Card exploration/Iteration - 3/3.png";
import imgIter3_4 from "../../assets/FASTag/Card exploration/Iteration - 3/4.png";
import imgIter3_5 from "../../assets/FASTag/Card exploration/Iteration - 3/5.png";

// All FASTag details — "All states"
import imgStateDownload from "../../assets/FASTag/My FASTag/All states/1. Download.png";
import imgStateFleetDropdown from "../../assets/FASTag/My FASTag/All states/2. Hover on dd multiple fts.png";
import imgStateHoverServices from "../../assets/FASTag/My FASTag/All states/3. Hover on services.png";

// Filter and email FASTag history
import imgFilterDefault from "../../assets/FASTag/My FASTag/Filter-history/1 Filter.png";
import imgFilterFilled from "../../assets/FASTag/My FASTag/Filter-history/2 Filtered.png";
import imgEmailDefault from "../../assets/FASTag/My FASTag/Email/1 default .png";
import imgEmailCalendar from "../../assets/FASTag/My FASTag/Email/2. date open.png";
import imgEmailChips from "../../assets/FASTag/My FASTag/Email/3 chip selection .png";
import imgEmailFilled from "../../assets/FASTag/My FASTag/Email/4 filled.png";
import imgEmailToast from "../../assets/FASTag/My FASTag/Email/5. Toast.png";

// FASTag recharge
import imgRechargeOld1 from "../../assets/FASTag/Recharge/OLD/1.png";
import imgRechargeOld2 from "../../assets/FASTag/Recharge/OLD/2.png";
import imgRechargeOld3 from "../../assets/FASTag/Recharge/OLD/3.png";
import imgRechargeOld4 from "../../assets/FASTag/Recharge/OLD/4.png";
import imgRechargeNew1 from "../../assets/FASTag/Recharge/NEW/1.png";
import imgRechargeNew2 from "../../assets/FASTag/Recharge/NEW/2.png";
import imgRechargeNew3 from "../../assets/FASTag/Recharge/NEW/3.png";
import imgRechargeNew4 from "../../assets/FASTag/Recharge/NEW/4.png";
import imgRechargeNew5 from "../../assets/FASTag/Recharge/NEW/5.png";


// ─── JTBD table (CS2 "Users and JTBD") — matches Figma "Frame 1597884686" 1:1 ──
interface JTBDRow { job: string; context: string; }
interface JTBDGroup { label: string; rows: JTBDRow[]; }

const JTBD_GROUPS: JTBDGroup[] = [
  {
    label: "FREQUENT + TIME-SENSITIVE + SURFACED ON CARD",
    rows: [
      { job: "Recharge an existing FASTag", context: "Often urgent — user may be driving toward a toll gate" },
      { job: "Check available balance", context: "Often urgent — user may be driving toward a toll gate" },
    ],
  },
  {
    label: "OCCASIONAL + DELIBERATE + LIVES DEEPER",
    rows: [
      { job: "Link or buy a new FASTag", context: "Considered action, done once, needs guidance" },
      { job: "Check recharge or transaction history", context: "Review mode — user is looking back, not forward" },
    ],
  },
];

function JTBDTable({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className="cs-img" style={{
      display: "flex", flexDirection: "column",
      width: "100%",
      border: "1px solid #DACCBE", borderRadius: 12, overflow: "hidden",
    }}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, width: "100%", backgroundColor: "#E3D9CE" }}>
        <p className="font-inclusive-sans font-medium" style={{
          flex: 1, padding: mobile ? "12px 0 12px 12px" : "12px 0 12px 16px",
          fontSize: 12, lineHeight: "20px", letterSpacing: "0.5px", textTransform: "uppercase", color: "#444444",
        }}>
          JTBD
        </p>
        <JTBDColumnDivider />
        <p className="font-inclusive-sans font-medium" style={{
          flex: 1, textAlign: "left", padding: mobile ? "12px 12px 12px 0" : "12px 16px 12px 0",
          fontSize: 12, lineHeight: "20px", letterSpacing: "0.5px", textTransform: "uppercase", color: "#444444",
        }}>
          Context
        </p>
      </div>

      {JTBD_GROUPS.map((group, gi) => (
        <div key={gi} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <div style={{
            display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12,
            width: "100%", padding: mobile ? "6px 12px" : "6px 16px",
            backgroundColor: "#E3D9CE",
          }}>
            <div style={{ boxSizing: "border-box", width: 1, height: 0, border: "1px solid #735933", flexShrink: 0 }} />
            <p className="font-inclusive-sans font-normal" style={{
              height: 12, fontSize: 10, lineHeight: "12px", display: "flex", alignItems: "flex-end", justifyContent: "center",
              textAlign: "center", letterSpacing: "1px", textTransform: "uppercase", color: "#735933", flexShrink: 0,
            }}>
              {group.label}
            </p>
            <div style={{ boxSizing: "border-box", width: 1, height: 0, border: "1px solid #735933", flexShrink: 0 }} />
          </div>
          <div style={{
            display: "flex", flexDirection: "column",
            width: "100%", backgroundColor: "#E7DED5",
            padding: mobile ? "10px 14px" : "12px 16px", gap: 12,
          }}>
            {group.rows.map((row, ri) => (
              <div key={ri} style={{ display: "flex", flexDirection: "row", gap: 12 }}>
                <p className="font-inclusive-sans font-medium" style={{ flex: 1, fontSize: 12, lineHeight: "16px", letterSpacing: "0.25px", color: "#444444" }}>
                  {row.job}
                </p>
                <JTBDColumnDivider />
                <p className="font-inclusive-sans font-normal" style={{ flex: 1, fontSize: 12, lineHeight: "20px", letterSpacing: "0.25px", color: "#444444" }}>
                  {row.context}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CS1 content (ICICI Bank iTravel) — Figma "Frame 38" (584px column) ───────
// Its own type scale, tighter than the shared helpers: 20/26 Caslon headings,
// 14/20 Inclusive Sans body, 12px rhythm inside a section, 52px between sections.
const CS1_ACCENT = "#C67D39";

function CS1Heading({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-caslon not-italic" style={{ fontSize: 20, lineHeight: "26px", fontWeight: 600, color: "#212012" }}>
      {children}
    </p>
  );
}

function CS1Text({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-inclusive-sans font-normal" style={{ fontSize: 14, lineHeight: "20px", color: "#444444" }}>
      {children}
    </p>
  );
}

function CS1Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <SectionBlock id={id}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </SectionBlock>
  );
}

function CS1Caption({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6 }}>
      <div style={{ width: 3, height: 13, borderRadius: 4, backgroundColor: CS1_ACCENT, flexShrink: 0 }} />
      <p className="font-jakarta font-medium" style={{ fontSize: 10, lineHeight: "13px", letterSpacing: "0.01em", color: "rgba(33,32,18,0.5)" }}>
        {children}
      </p>
    </div>
  );
}

// A phone screen, 150px wide at design size, 1px white stroke. It shrinks with its row
// (never grows past 150px) and keeps its aspect ratio, so a row always fits its panel.
function CS1Phone({ src, alt = "" }: { src: string; alt?: string }) {
  return (
    <div style={{ flex: "1 1 0", minWidth: 0, maxWidth: 150 }}>
      <img
        src={src}
        alt={alt}
        style={{ display: "block", width: "100%", height: "auto", border: "1px solid #FFFFFF", borderRadius: 5, boxSizing: "border-box" }}
      />
    </div>
  );
}

// Row of CS1Phones. `gap` is a share of the row's width so spacing shrinks with the phones.
function CS1PhoneRow({ children, gap }: { children: React.ReactNode; gap: string }) {
  return <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap, width: "100%" }}>{children}</div>;
}

// Tan panel that holds phone screens.
function CS1Panel({ children, padding }: { children: React.ReactNode; padding: string }) {
  return (
    <div className="cs-img" style={{ width: "100%", backgroundColor: "#E7DED5", borderRadius: 8, overflow: "hidden", padding, boxSizing: "border-box" }}>
      {children}
    </div>
  );
}

function CS1HMWBox() {
  const items = [
    "Make activation easy and confidence-building",
    "Get genuine transactions approved seamlessly",
    "Give users one view for all international travel issues",
  ];
  return (
    <div style={{
      display: "flex", flexDirection: "row", alignItems: "stretch", gap: 12,
      paddingRight: 16, overflow: "hidden",
      backgroundColor: "rgba(198,125,57,0.1)", border: "1px solid rgba(198,125,57,0.3)", borderRadius: 8,
    }}>
      <div style={{ width: 3, backgroundColor: CS1_ACCENT, flexShrink: 0 }} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, padding: "8px 0", flex: 1 }}>
        {items.map((text, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, padding: "8px 0" }}>
            <div style={{ width: 20, height: 20, borderRadius: 16, backgroundColor: CS1_ACCENT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <p className="font-jakarta" style={{ fontWeight: 700, fontSize: 12, lineHeight: "16px", letterSpacing: "0.01em", color: "#FFFFFF" }}>{i + 1}</p>
            </div>
            <p className="font-inclusive-sans font-medium" style={{ flex: 1, fontSize: 13, lineHeight: "16px", color: "#444444" }}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CS1Layer({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
        <span aria-hidden="true" style={{ fontSize: 16, lineHeight: "20px" }}>{icon}</span>
        <p className="font-inclusive-sans" style={{ fontWeight: 600, fontSize: 16, lineHeight: "20px", color: "#735933" }}>{title}</p>
      </div>
      <CS1Text>{children}</CS1Text>
    </div>
  );
}

function CS1StateTable({ mobile }: { mobile: boolean }) {
  const rows = [
    ["App installed, has CC", "Auth → iTravel activation drawer"],
    ["App installed, has no CC", "Auth → card application drawer — iTravel becomes the acquisition hook"],
    ["App installed, session expired", "Re-auth → routes into above"],
    ["App not installed", "Web promo page, both audiences"],
  ];
  const pad = mobile ? 12 : 16;
  const head = { fontWeight: 600, fontSize: 12, lineHeight: "20px", textTransform: "uppercase" as const, color: "#444444" };
  return (
    <div className="cs-img" style={{ width: "100%", border: "1px solid #DACCBE", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "row", gap: 16, backgroundColor: "#E3D9CE", padding: `8px ${pad}px` }}>
        <p className="font-jakarta" style={{ ...head, flex: 1 }}>State</p>
        <p className="font-inclusive-sans" style={{ ...head, flex: 1 }}>Outcome</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, backgroundColor: "#E7DED5", padding: `12px ${pad}px` }}>
        {rows.map(([state, outcome], i) => (
          <div key={i} style={{ display: "flex", flexDirection: "row", gap: 16 }}>
            <p className="font-jakarta" style={{ flex: 1, fontWeight: 600, fontSize: 12, lineHeight: "16px", color: "#444444" }}>{i + 1}. {state}</p>
            <p className="font-inclusive-sans font-normal" style={{ flex: 1, fontSize: 12, lineHeight: "20px", color: "#444444" }}>{outcome}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CS1EntryPanel() {
  return (
    <div className="cs-img" style={{ width: "100%", backgroundColor: "#E7DED5", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", backgroundColor: "#ECE5DF", borderBottom: "1px solid #E3D9CE" }}>
        <p className="font-inclusive-sans font-normal" style={{ fontSize: 12, lineHeight: "16px", color: "rgba(33,32,18,0.8)" }}>
          The drawer is a forced interstitial - the user clicked an ad specifically about iTravel, so making them navigate a dashboard first would be the actual friction.
        </p>
      </div>
      <div style={{ padding: "17px 4% 16px" }}>
        {/* 150 : 320 split with a 66px gap at design width — all proportional so it fits any width */}
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: "7%" }}>
          <div style={{ flex: "150 1 0", minWidth: 0, maxWidth: 150, display: "flex", flexDirection: "column", gap: 12 }}>
            <CS1PhoneRow gap="0">
              <CS1Phone src={imgEntryHasCard} alt="iTravel activation drawer" />
            </CS1PhoneRow>
            <CS1Caption>State 1 - Has a credit card</CS1Caption>
          </div>
          <div style={{ flex: "320 1 0", minWidth: 0, maxWidth: 320, display: "flex", flexDirection: "column", gap: 9 }}>
            <CS1PhoneRow gap="6.25%">
              <CS1Phone src={imgEntryNoCard1} alt="Card application drawer" />
              <CS1Phone src={imgEntryNoCard2} alt="Card application drawer, iTravel slide" />
            </CS1PhoneRow>
            <CS1Caption>State 2, 3, 4 - Does not have a credit card</CS1Caption>
          </div>
        </div>
      </div>
    </div>
  );
}

function CS1CroppedShot() {
  return (
    <div className="cs-img" style={{ width: "100%", height: 123, backgroundColor: "#E7DED5", borderRadius: 8, overflow: "hidden", display: "flex", justifyContent: "center", paddingTop: 16, boxSizing: "border-box" }}>
      <img src={imgAutoExpiry} alt="Additional preferences — auto-disable after trip" style={{ width: 150, height: "auto", alignSelf: "flex-start", display: "block" }} />
    </div>
  );
}

export function CS1Content({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 52 }}>
      <SectionBlock id="cs-problem">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CS1Heading>THE PROBLEM</CS1Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <CS1Text>
              30% of ICICI Bank international transactions were declining. The obvious fix - surface the toggle - would have helped. But I started from a different question: why does the decline happen at all, and what would actually prevent it?
            </CS1Text>
            <CS1Text>
              The answer wasn't in the UI. It was in how RBI mandates work, how fraud engines evaluate transactions, and how travelers actually use their phones abroad. Every decision in iTravel came from reasoning through those layers first, then designing backward to the screen.
            </CS1Text>
            <p className="font-inclusive-sans font-normal" style={{ fontSize: 14, lineHeight: "20px", letterSpacing: "0.01em", color: "#444444" }}>The PM briefed...</p>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "stretch", gap: 8 }}>
              <div style={{ width: 3, borderRadius: 4, backgroundColor: CS1_ACCENT, flexShrink: 0 }} />
              <p className="font-caslon not-italic" style={{ flex: 1, padding: "8px 0", fontSize: 16, lineHeight: "20px", fontWeight: 600, color: "#212012" }}>
                Build <em>iTravel</em>, a single, unified hub where customers declare their travel plans and the bank automatically aligns card usage and fraud monitoring to that profile.
              </p>
            </div>
            <p className="font-inclusive-sans font-medium" style={{ fontSize: 14, lineHeight: "20px", color: "#444444" }}>Three HMWs:</p>
            <CS1HMWBox />
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="cs-why">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <CS1Heading>Why the obvious fix wasn't enough</CS1Heading>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <CS1Layer icon="📜" title="Layer 1 - RBI compliance">
                Separate switches for POS, ATM, and e-commerce. Enabling one doesn't enable the others. A user who turns on POS can still get silently declined buying online.
              </CS1Layer>
              <CS1Layer icon="🚨" title="Layer 2 - Fraud engine logic">
                The system doesn't just check if the toggle is on. It checks if the transaction looks geographically plausible for that cardholder.
              </CS1Layer>
              <CS1Layer icon="🔇" title="Layer 3 - Information gap">
                The bank has no signal a customer is traveling until they're already declined.
              </CS1Layer>
            </div>
          </div>
          <CS1Text>
            iTravel was built to close Layer 3. Once the bank knows the trip in advance, Layers 1 and 2 can be handled automatically.
          </CS1Text>
        </div>
      </SectionBlock>

      <CS1Section id="cs-entry">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CS1Heading>1. Getting users in before they need it</CS1Heading>
          <CS1Text>
            Most ICICI cardholders barely open iMobile - bill payments increasingly happen through CRED, PhonePe or other 3rd party apps. An in-app-only entry point reaches almost nobody.
          </CS1Text>
        </div>
        <CS1StateTable mobile={isMobile} />
        <Spacer size={40} />
        <CS1EntryPanel />
      </CS1Section>

      <CS1Section id="cs-trip">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CS1Heading>2. Declaring the trip</CS1Heading>
          <CS1Text>
            User declares destination, layover stops, travel dates, purpose, and multiple trips. The layover field wasn't in the brief - I proposed it.
          </CS1Text>
          <CS1Text>
            Fraud engines check travel plausibility, not just whether a country is blocked. A card quiet for months, then swiping in Tokyo, looks like fraud. A declared trip -{" "}
            <span className="font-caslon" style={{ color: CS1_ACCENT, fontSize: 16 }}>India → Singapore (layover) → Japan</span>{" "}
            - gives the engine a trail. The Tokyo swipe stops looking anomalous.
          </CS1Text>
          <ImageCarousel
            mobile={isMobile}
            slides={[
              { images: [imgTripSingleEmpty, imgTripSingleFilled], caption: "Travelling to a single country with no layover" },
              { images: [imgTripMultiEmpty, imgTripMultiAdded, imgTripMultiFilled], caption: "Travelling to multiple countries, with a layover" },
            ]}
          />
        </div>
      </CS1Section>

      <CS1Section id="cs-limits">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CS1Heading>3. Setting limits without currency math</CS1Heading>
          <CS1Text>
            Card control limits shown as a slider with a live conversion-rate label for the destination currency.
          </CS1Text>
          <CS1Text>
            Three problems solved at once: no mental currency math, prevents under-setting a limit that looks fine in INR but causes a mid-trip decline, and surfaces a natural credit-limit-increase prompt when intended spend exceeds the current limit.
          </CS1Text>
          <CS1Panel padding="16px 6%">
            <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 512, margin: "0 auto" }}>
              <CS1Caption>All states of preferences</CS1Caption>
              <CS1PhoneRow gap="6%">
                <CS1Phone src={imgPrefsDefault} alt="Preferences — default" />
                <CS1Phone src={imgPrefsEditing} alt="Preferences — editing a limit" />
                <CS1Phone src={imgPrefsFilled} alt="Preferences — filled" />
              </CS1PhoneRow>
            </div>
          </CS1Panel>
        </div>
      </CS1Section>

      <CS1Section id="cs-expiry">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CS1Heading>4. Auto-expiring controls</CS1Heading>
          <CS1Text>
            RBI mandates manual activation but says nothing about deactivation. Left on indefinitely, the fraud exposure window stays open long after the trip ends.
          </CS1Text>
          <CS1Text>
            Proposed auto-expiry tied to the declared travel dates - not RBI-required, my proposal. Shrinks the fraud window to exactly the trip and removes the hesitation of feeling like you're committing to this forever.
          </CS1Text>
          <CS1CroppedShot />
        </div>
      </CS1Section>

      <CS1Section id="cs-wrapup">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <CS1Heading>5. Travel wrap-up</CS1Heading>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <CS1Text>
              After the trip: a fun summary - total spend, category breakdown, top merchants, country stamp added to a collection.
            </CS1Text>
            <CS1Text>
              The data already exists in the bank's transaction records. iTravel provides the trigger - declared dates and destination tell the system which transactions to aggregate and when to surface the summary.
            </CS1Text>
            <CS1Text>
              The stamp collection scales without manual asset creation. Each sticker uses dynamic fields - country code, currency, year visited - with one SVG illustration per country as the only per-country asset.
            </CS1Text>
          </div>
        </div>
        <CS1CroppedShot />
      </CS1Section>
    </div>
  );
}

// ─── CS2 content (ICICI FASTag) ───────────────────────────────────────────────
export function CS2Content({ isMobile }: { isMobile: boolean }) {
  const m = isMobile;
  return (
    <div className="cs-sections" style={{ display: "flex", flexDirection: "column" }}>
      <SectionBlock id="cs-intro">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionHeading mobile={m}>Introduction</SectionHeading>
          <div className="cs-flow " style={{ display: "flex", flexDirection: "column"  }}>
            <BodyText mobile={m}>
              FASTag is mandatory for all four-wheelers on Indian highways, and ICICI Bank commands nearly 29% of the national FASTag market. Before this project, every one of those customers relied solely on iMobile or a third-party app to manage their tag.
            </BodyText>
            <BodyText mobile={m}>
              I designed the entire FASTag experience for RIB from scratch. No brief. No precedent. Just iMobile's existing flows as reference, a fixed two-week deadline, and three distinct user types that needed to coexist on the same platform.
            </BodyText>
            <Spacer size={isMobile ? 24 : 40} />
            <SectionHeading mobile={m}>Users and JTBD</SectionHeading>
            <BodyText mobile={m}>
              With the reference I had, before designing the screens, I mapped four core jobs users come to FASTag to do. These drove every layout and hierarchy decision that followed.
            </BodyText>
            <JTBDTable mobile={m} />

            <SectionHeading mobile={m}>It's 11pm on the highway, and the toll is ahead</SectionHeading>

            <BodyText mobile={m}>
              Think about Job 1 for a second — someone's checking their FASTag balance while driving toward a toll plaza. They're not relaxed, they're not browsing. They need an answer in a glance. Urgent, quick, no room for hunting.
            </BodyText>
            <SubHeading mobile={m}>
              That's exactly why the card works the way it does:
            </SubHeading>
            <ul className="font-inclusive-sans font-normal cs-bullets cs-bullets-accent" style={{ fontSize: 16, lineHeight: "24px", color: "#444", letterSpacing: "0.15px", paddingLeft: m ? 12 : 16, paddingRight: m ? 12 : 16 }}>
              <li>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <strong style={{ color: "#735933" }}>Vehicle number and model</strong>
                  <span>You can scan it in under 2-seconds, no reading needed.</span>
                </div>
              </li>
              <li>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <strong style={{ color: "#735933" }}>Balance</strong>
                  <span>It's the biggest thing on the card, impossible to miss.</span>
                </div>
              </li>
              <li>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <strong style={{ color: "#735933" }}>Recharge</strong>
                  <span>One tap, always there, always in the same spot no matter the card state.</span>
                </div>
              </li>
              <li>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <strong style={{ color: "#735933" }}>Everything else</strong>
                  <span>Tucked behind the three-dot menu or the detail page, out of the way until you actually need it.</span>
                </div>
              </li>
            </ul>
            <BodyText mobile={m}>
              The secondary stuff (tag replacement, KYC, close tag, raise a query) — sure, it matters. But it's not why someone opens FASTag at 11pm on the highway. Keeping it secondary isn't a compromise. That's the whole point.
            </BodyText>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="cs-landing">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionHeading mobile={m}>1. Landing page</SectionHeading>
          <div className="cs-flow" style={{ display: "flex", flexDirection: "column" }}>
            <BodyText mobile={m}>
              One landing page. Three user types. Multiple card states. Everything had to be readable at a glance — including for fleet owners managing 20+ FASTags simultaneously.
            </BodyText>
            <SubHeading mobile={m}>
              There are 3 user types:
            </SubHeading>
            <ul className="font-inclusive-sans font-normal cs-bullets" style={{ fontSize: 14, lineHeight: "20px", color: "#444", letterSpacing: "0.14px", paddingLeft: m ? 12 : 16, paddingRight: m ? 12 : 16 }}>
              <li>New user</li>
              <li>Existing users (ICICI Bank and non-ICICI Bank)</li>
              <li>Fleet owners (ICICI Bank and non-ICICI Bank)</li>
            </ul>

            <ImageCarousel
              mobile={m}
              slides={[
                {
                  embed: "https://embed.figma.com/proto/zhkgGHFZUiEiSgc7WO4FQ6/Laxmi-s-portfolio---only-for-recruiters?node-id=105-28114&scaling=min-zoom&content-scaling=fixed&page-id=71%3A2831&embed-host=share",
                  caption: "Interactive prototype — walk through the landing flow",
                },
                { src: imgLandingEmpty, caption: "New user with no FASTags" },
                { src: imgLandingExisting, caption: "Existing user with ICICI Bank and other bank FASTag" },
                { src: imgLandingScrolled, caption: "Critical usecase, scrolled state — callout for critical action" },
                { src: imgLandingMenuOpen, caption: "Three-dot menu open state" },
              ]}
            />

            <SectionHeading mobile={m}>The TAB decision</SectionHeading>
            <BodyText mobile={m}>
              Early versions showed all FASTags in one mixed list — ICICI and non-ICICI together, sorted by recency. The problem: a just-linked third-party FASTag would float to the top, pushing the user's ICICI card down the scroll. Wrong for the user. Wrong for the bank.
            </BodyText>
            <BodyText mobile={m}>
              Splitting into two tabs — My FASTag and Other bank FASTag — solved both at once. ICICI cards always surface first. The tab structure tells the user what service level to expect before they open a single card.
            </BodyText>

            <LandingComparisonPanel
              before={imgTabOld}
              beforeCaption="Old design - all cards stacked by recency"
              after={[imgTabMyFastag, imgTabOtherFastag]}
              afterCaption="Tabs created to seperate the FASTags"
            />
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="cs-card">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionHeading mobile={m}>2. FASTag card exploration</SectionHeading>
          <div className="cs-flow" style={{ display: "flex", flexDirection: "column" }}>
            <SubHeading mobile={m}>
              The problem
            </SubHeading>
            <BodyText mobile={m}>
              The card had to do five jobs: identify the vehicle, show balance, trigger recharge, flag errors, and indicate auto-recharge status. New edge cases kept arriving after the first drop — RC rejected, KYV pending, low balance, inactive — and each new state changed the layout.
            </BodyText>
            <BodyText mobile={m}>
              I went through multiple rounds before the card resolved.
            </BodyText>

            <IterationLabel mobile={m}>Iteration 1 — Started simple</IterationLabel>
            <IterationThumbnailRow
              mobile={m}
              caption="Iteration - 1"
              aspectRatio="166 / 73"
              images={[imgIter1_1, imgIter1_2, imgIter1_3, imgIter1_4, imgIter1_5, imgIter1_6]}
            />
            <BodyText mobile={m}>
              This card was the gateway to everything — all details, services, history. Get it wrong and the whole page falls apart. The first drop focused on the essentials: vehicle number, model, balance, recharge, overflow menu. The client liked it, then added to it. Urgency signals, auto-recharge status, and other bank FASTag callouts all needed to live here too.
            </BodyText>

            <IterationLabel mobile={m}>Iteration 2 — Absorbed the feedback</IterationLabel>
            <IterationThumbnailRow
              mobile={m}
              caption="Iteration - 2"
              aspectRatio="198 / 96"
              images={[imgIter2_1, imgIter2_2, imgIter2_3, imgIter2_4, imgIter2_5, imgIter2_6]}
            />
            <BodyText mobile={m}>
              It held for simple cases. Then an edge case surfaced: what if a user has low balance and a rejected RC simultaneously? Two unrelated error states, both needing attention, both fighting for the same space. They couldn't be merged — they were different problems requiring different actions. The card broke under the combination.
            </BodyText>

            <IterationLabel mobile={m}>Iteration 3 — Give errors room</IterationLabel>
            <BodyText mobile={m}>
              The fix was giving urgency signals their own space rather than forcing them into the card body. A few more variants, shown to the client, and this was approved, yayy!
            </BodyText>
            <IterationThumbnailRow
              mobile={m}
              caption="Iteration - 3"
              images={[imgIter3_1, imgIter3_2, imgIter3_3, imgIter3_4, imgIter3_5]}
            />
            <StateTreatmentTable
              mobile={m}
              rows={[
                { state: "Auto-recharge ON", treatment: "Gradient orange footer" },
                { state: "Auto-recharge OFF", treatment: "Pastel footer with CTA" },
                { state: "Low balance", treatment: "Inline peach pill with an icon" },
                { state: "RC/KYC/KYV rejected/pending", treatment: "Inline warning red pill" },
                { state: "Non-ICICI tag", treatment: "Solid grey footer, separate tab" },
              ]}
            />
            <BodyText mobile={m}>
              The anchor across all states: vehicle number, balance, recharge — always visible, always in the same position.
            </BodyText>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="cs-details">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionHeading mobile={m}>3. All FASTag details</SectionHeading>
          <div className="cs-flow" style={{ display: "flex", flexDirection: "column" }}>
            <SubHeading mobile={m}>Three card types, one layout</SubHeading>
            <BodyText mobile={m}>
              The detail page is structurally identical across all three FASTag types. What changes is the right column — the service set available to that specific tag.
            </BodyText>
            <BodyText mobile={m}>
              For an ICICI FASTag this is the full service suite: Recharge, Auto recharge, Tag replacement, Update RC, Know Your Vehicle, Close FASTag, Raise a query, View tag details.
            </BodyText>
            <BodyText mobile={m}>
              For a non-ICICI FASTag the right column reduces to three options: Recharge, Remove, and Buy ICICI FASTag.
            </BodyText>
            <ImageCarousel
              mobile={m}
              slides={[
                { src: imgFastagNonIcici, caption: "Non-ICICI Bank FASTag" },
                { src: imgFastagAutoOff, caption: "ICICI Bank FASTag — Auto-recharge off" },
                { src: imgFastagAutoOn, caption: "ICICI Bank FASTag — Auto-recharge on" },
              ]}
            />

            <SubHeading mobile={m}>All states</SubHeading>
            <BodyText mobile={m}>
              There have been various states and micro-interactions added to multiple sections of the landing. Scroll to view all the interactions.
            </BodyText>
            <ImageCarousel
              mobile={m}
              slides={[
                { src: imgStateDownload, caption: "Download history - button has a dropdown on hover" },
                { src: imgStateFleetDropdown, caption: "For fleet owners - more than 4 will appear inside a dropdown" },
                { src: imgStateHoverServices, caption: "Hovering on services will open a tooltip" },
              ]}
            />

            <SubHeading mobile={m}>Filter and email FASTag history</SubHeading>
            <BodyText mobile={m}>
              <strong>Filter history</strong> — Chips were added for easily filtering of the history. For customized dates, the user can filter by start and end date.
            </BodyText>
            <ImageCarousel
              mobile={m}
              slides={[
                { src: imgFilterDefault, caption: "Filter history - default" },
                { src: imgFilterFilled, caption: "Filter history - filled" },
              ]}
            />
            <BodyText mobile={m}>
              <strong>Email statement</strong> — After the 1st drop, there was an additional requirement from the client that the user can only fetch the history for up to 90 days on the interface, and payments older than that would be emailed to their registered email ID.
            </BodyText>
            <ImageCarousel
              mobile={m}
              slides={[
                { src: imgEmailDefault, caption: "Email statement - default state" },
                { src: imgEmailCalendar, caption: "Email statement - selecting through the calendar" },
                { src: imgEmailChips, caption: "Email statement - selecting through chips" },
                { src: imgEmailFilled, caption: "Email statement - filled" },
                { src: imgEmailToast, caption: "Email statement - a toast appears on success" },
              ]}
            />
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="cs-recharge">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionHeading mobile={m}>4. FASTag recharge</SectionHeading>
          <div className="cs-flow" style={{ display: "flex", flexDirection: "column" }}>
            <SubHeading mobile={m}>The problem with the first version</SubHeading>
            <BodyText mobile={m}>
              The mobile reference flows had three separate recharge experiences depending on where the user came from — ICICI FASTag, linked non-ICICI, and first-time non-linked. Some were modals, some full-page, each with different data points. The same action looked different every time and the client pushed for an experience of keeping them as is. It was unsustainable to maintain, and expensive to build.
            </BodyText>
            <ImageGrid2x2 images={[imgRechargeOld1, imgRechargeOld2, imgRechargeOld3, imgRechargeOld4]} />

            <IterationLabel mobile={m}>The fix</IterationLabel>
            <BodyText mobile={m}>
              One standard recharge flow. Regardless of entry point — dashboard card, detail page, quick action panel — the user lands on the same experience with the same data points.
            </BodyText>
            <SubHeading mobile={m}>
              The vehicle type determines what's shown within that standard flow:
            </SubHeading>
            <ul className="font-inclusive-sans font-normal cs-bullets" style={{ fontSize: 14, lineHeight: "20px", color: "#444", letterSpacing: "0.14px", paddingLeft: m ? 12 : 16, paddingRight: m ? 12 : 16 }}>
              <li>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <strong>For a linked vehicle</strong>
                  <span>Registration number pre-filled, balance visible, straight to amount.</span>
                </div>
              </li>
              <li>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <strong>For a non-linked vehicle (first time)</strong>
                  <span>Registration number entry required, then the same flow.</span>
                </div>
              </li>
            </ul>
            <BodyText mobile={m}>
              The entry point context is resolved before the user enters the flow. Inside the flow, it is always the same.
            </BodyText>
            <ImageCarousel
              mobile={m}
              slides={[
                { src: imgRechargeNew1, caption: "Recharge - for a user coming from the dashboard or all details page" },
                { src: imgRechargeNew2, caption: "Recharge - for a user coming from the dashboard from the ancillary details" },
                { src: imgRechargeNew3, caption: "Recharge - to set up AutoRecharge, the user would see use the modal" },
                { src: imgRechargeNew4, caption: "Recharge - enters from ancillary section of the dashboard with search-as-you-type input" },
                { src: imgRechargeNew5, caption: "Recharge - Success for both vehicle types with contextual upgrades" },
              ]}
            />
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="cs-reflection">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionHeading mobile={m}>Currently <em>in-development</em>, but what I took away...</SectionHeading>
          <div className="cs-flow" style={{ display: "flex", flexDirection: "column" }}>
            <BodyText mobile={m}>
              The requirements were half-baked and the timeline was too short for the volume. The biggest thing I learned: negotiate on scope or timeline upfront, not after you're already deep in it.
            </BodyText>
            <BodyText mobile={m}>
              Working solo on something this large taught me what I'm actually capable of under pressure. Every interaction, every click path — I was the only one deciding. That's a different kind of responsibility than working in a team, and I didn't fully appreciate it until I was in it.
            </BodyText>
            <BodyText mobile={m}>
              Redesigning an entire flow midway, defending the decision to stakeholders, and still handing off on time gave me a confidence I didn't have going in. This project showed me I can hold complexity and ship.
            </BodyText>
          </div>
        </div>
      </SectionBlock>
    </div>
  );
}


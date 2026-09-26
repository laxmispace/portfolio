// Password-protected case study content (CS1 ICICI iTravel, CS2 ICICI FASTag).
// Never imported statically: production builds emit this module as its own chunk,
// encrypt it (vite.config.ts → protectCaseStudies) and load it only after unlock.
import {
  Spacer, SectionBlock, SectionHeading, BodyText, SubHeading, ImageCarousel,
  LandingComparisonPanel, IterationLabel, IterationThumbnailRow, StateTreatmentTable,
  ImageGrid2x2, TableColumnDivider, MediaCaption, PhoneScreen, PhoneRow, MediaPanel, PullQuote,
  NumberedCallout, LayerItem, DataTable,
} from "./CaseStudyPrimitives";

// ─── CS1 image assets (ICICI Bank iTravel) ────────────────────────────────────
import imgEntryHasCard from "@/assets/case-studies/itravel/entry-points/has-card.png";
import imgEntryNoCard1 from "@/assets/case-studies/itravel/entry-points/no-card-1.png";
import imgEntryNoCard2 from "@/assets/case-studies/itravel/entry-points/no-card-2.png";
import imgTripSingleEmpty from "@/assets/case-studies/itravel/trip/single-country-empty.png";
import imgTripSingleFilled from "@/assets/case-studies/itravel/trip/single-country-filled.png";
import imgTripMultiEmpty from "@/assets/case-studies/itravel/trip/multi-country-empty.png";
import imgTripMultiAdded from "@/assets/case-studies/itravel/trip/multi-country-stop-added.png";
import imgTripMultiFilled from "@/assets/case-studies/itravel/trip/multi-country-filled.png";
import imgPrefsDefault from "@/assets/case-studies/itravel/preferences/default.png";
import imgPrefsEditing from "@/assets/case-studies/itravel/preferences/editing-limit.png";
import imgPrefsFilled from "@/assets/case-studies/itravel/preferences/filled.png";
import imgAutoExpiry from "@/assets/case-studies/itravel/preferences/auto-expiry.png";

// ─── CS2 image assets (ICICI FASTag) ──────────────────────────────────────────
import imgFastagNonIcici from "@/assets/case-studies/fastag/my-fastag/lp/1-non-ub-ft.png";
import imgFastagAutoOff from "@/assets/case-studies/fastag/my-fastag/lp/2-ub-nar.png";
import imgFastagAutoOn from "@/assets/case-studies/fastag/my-fastag/lp/3-ub-ar.png";

// Landing page — section 1 (user/landing states)
import imgLandingEmpty from "@/assets/case-studies/fastag/landing-page/landing-section-1/landing-empty.png";
import imgLandingExisting from "@/assets/case-studies/fastag/landing-page/landing-section-1/landing-e.png";
import imgLandingScrolled from "@/assets/case-studies/fastag/landing-page/landing-section-1/lpe-scrolled.png";
import imgLandingMenuOpen from "@/assets/case-studies/fastag/landing-page/landing-section-1/lpe-menu-open.png";

// Landing page — section 2 (the TAB decision)
import imgTabOld from "@/assets/case-studies/fastag/landing-page/tab-section-2/old-ft.png";
import imgTabMyFastag from "@/assets/case-studies/fastag/landing-page/tab-section-2/my-bank-ft.png";
import imgTabOtherFastag from "@/assets/case-studies/fastag/landing-page/tab-section-2/other-f-t.png";

// Card exploration — iteration thumbnail rows
import imgIter1_1 from "@/assets/case-studies/fastag/card-exploration/iteration-1/1.png";
import imgIter1_2 from "@/assets/case-studies/fastag/card-exploration/iteration-1/2.png";
import imgIter1_3 from "@/assets/case-studies/fastag/card-exploration/iteration-1/3.png";
import imgIter1_4 from "@/assets/case-studies/fastag/card-exploration/iteration-1/4.png";
import imgIter1_5 from "@/assets/case-studies/fastag/card-exploration/iteration-1/5.png";
import imgIter1_6 from "@/assets/case-studies/fastag/card-exploration/iteration-1/6.png";
import imgIter2_1 from "@/assets/case-studies/fastag/card-exploration/iteration-2/1.png";
import imgIter2_2 from "@/assets/case-studies/fastag/card-exploration/iteration-2/2.png";
import imgIter2_3 from "@/assets/case-studies/fastag/card-exploration/iteration-2/3.png";
import imgIter2_4 from "@/assets/case-studies/fastag/card-exploration/iteration-2/4.png";
import imgIter2_5 from "@/assets/case-studies/fastag/card-exploration/iteration-2/5.png";
import imgIter2_6 from "@/assets/case-studies/fastag/card-exploration/iteration-2/6.png";
import imgIter3_1 from "@/assets/case-studies/fastag/card-exploration/iteration-3/1.png";
import imgIter3_2 from "@/assets/case-studies/fastag/card-exploration/iteration-3/2.png";
import imgIter3_3 from "@/assets/case-studies/fastag/card-exploration/iteration-3/3.png";
import imgIter3_4 from "@/assets/case-studies/fastag/card-exploration/iteration-3/4.png";
import imgIter3_5 from "@/assets/case-studies/fastag/card-exploration/iteration-3/5.png";

// All FASTag details — "All states"
import imgStateDownload from "@/assets/case-studies/fastag/my-fastag/all-states/1-download.png";
import imgStateFleetDropdown from "@/assets/case-studies/fastag/my-fastag/all-states/2-hover-on-dd-multiple-fts.png";
import imgStateHoverServices from "@/assets/case-studies/fastag/my-fastag/all-states/3-hover-on-services.png";

// Filter and email FASTag history
import imgFilterDefault from "@/assets/case-studies/fastag/my-fastag/filter-history/1-filter.png";
import imgFilterFilled from "@/assets/case-studies/fastag/my-fastag/filter-history/2-filtered.png";
import imgEmailDefault from "@/assets/case-studies/fastag/my-fastag/email/1-default.png";
import imgEmailCalendar from "@/assets/case-studies/fastag/my-fastag/email/2-date-open.png";
import imgEmailChips from "@/assets/case-studies/fastag/my-fastag/email/3-chip-selection.png";
import imgEmailFilled from "@/assets/case-studies/fastag/my-fastag/email/4-filled.png";
import imgEmailToast from "@/assets/case-studies/fastag/my-fastag/email/5-toast.png";

// FASTag recharge
import imgRechargeOld1 from "@/assets/case-studies/fastag/recharge/old/1.png";
import imgRechargeOld2 from "@/assets/case-studies/fastag/recharge/old/2.png";
import imgRechargeOld3 from "@/assets/case-studies/fastag/recharge/old/3.png";
import imgRechargeOld4 from "@/assets/case-studies/fastag/recharge/old/4.png";
import imgRechargeNew1 from "@/assets/case-studies/fastag/recharge/new/1.png";
import imgRechargeNew2 from "@/assets/case-studies/fastag/recharge/new/2.png";
import imgRechargeNew3 from "@/assets/case-studies/fastag/recharge/new/3.png";
import imgRechargeNew4 from "@/assets/case-studies/fastag/recharge/new/4.png";
import imgRechargeNew5 from "@/assets/case-studies/fastag/recharge/new/5.png";
import { colors, withAlpha } from "@/app/theme/tokens";


// ─── JTBD table (CS2 "Users and JTBD") — matches Figma "Frame 1597884686" 1:1 ──
interface JtbdRow { job: string; context: string; }
interface JtbdGroup { label: string; rows: JtbdRow[]; }

const JTBD_GROUPS: JtbdGroup[] = [
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

function JtbdTable({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="case-study-media" style={{
      display: "flex", flexDirection: "column",
      width: "100%",
      border: `1px solid ${colors.sandBorder}`, borderRadius: 12, overflow: "hidden",
    }}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, width: "100%", backgroundColor: colors.sand }}>
        <p className="font-inclusive-sans font-medium" style={{
          flex: 1, padding: isMobile ? "12px 0 12px 12px" : "12px 0 12px 16px",
          fontSize: 12, lineHeight: "20px", letterSpacing: "0.5px", textTransform: "uppercase", color: colors.body,
        }}>
          JTBD
        </p>
        <TableColumnDivider />
        <p className="font-inclusive-sans font-medium" style={{
          flex: 1, textAlign: "left", padding: isMobile ? "12px 12px 12px 0" : "12px 16px 12px 0",
          fontSize: 12, lineHeight: "20px", letterSpacing: "0.5px", textTransform: "uppercase", color: colors.body,
        }}>
          Context
        </p>
      </div>

      {JTBD_GROUPS.map((group, gi) => (
        <div key={gi} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <div style={{
            display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12,
            width: "100%", padding: isMobile ? "6px 12px" : "6px 16px",
            backgroundColor: colors.sand,
          }}>
            <div style={{ boxSizing: "border-box", width: 1, height: 0, border: `1px solid ${colors.brown}`, flexShrink: 0 }} />
            <p className="font-inclusive-sans font-normal" style={{
              height: 12, fontSize: 10, lineHeight: "12px", display: "flex", alignItems: "flex-end", justifyContent: "center",
              textAlign: "center", letterSpacing: "1px", textTransform: "uppercase", color: colors.brown, flexShrink: 0,
            }}>
              {group.label}
            </p>
            <div style={{ boxSizing: "border-box", width: 1, height: 0, border: `1px solid ${colors.brown}`, flexShrink: 0 }} />
          </div>
          <div style={{
            display: "flex", flexDirection: "column",
            width: "100%", backgroundColor: colors.sandPanel,
            padding: isMobile ? "10px 14px" : "12px 16px", gap: 12,
          }}>
            {group.rows.map((row, ri) => (
              <div key={ri} style={{ display: "flex", flexDirection: "row", gap: 12 }}>
                <p className="font-inclusive-sans font-medium" style={{ flex: 1, fontSize: 12, lineHeight: "16px", letterSpacing: "0.25px", color: colors.body }}>
                  {row.job}
                </p>
                <TableColumnDivider />
                <p className="font-inclusive-sans font-normal" style={{ flex: 1, fontSize: 12, lineHeight: "20px", letterSpacing: "0.25px", color: colors.body }}>
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

function ItravelHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-caslon not-italic" style={{ fontSize: 20, lineHeight: "26px", fontWeight: 600, color: colors.ink }}>
      {children}
    </p>
  );
}

function ItravelText({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-inclusive-sans font-normal" style={{ fontSize: 14, lineHeight: "20px", color: colors.body }}>
      {children}
    </p>
  );
}

function ItravelSection({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <SectionBlock id={id}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </SectionBlock>
  );
}

const ITRAVEL_HMWS = [
  "Make activation easy and confidence-building",
  "Get genuine transactions approved seamlessly",
  "Give users one view for all international travel issues",
];

const ITRAVEL_ENTRY_STATES: [string, string][] = [
  ["App installed, has CC", "Auth → iTravel activation drawer"],
  ["App installed, has no CC", "Auth → card application drawer — iTravel becomes the acquisition hook"],
  ["App installed, session expired", "Re-auth → routes into above"],
  ["App not installed", "Web promo page, both audiences"],
];

function ItravelEntryPanel() {
  return (
    <div className="case-study-media" style={{ width: "100%", backgroundColor: colors.sandPanel, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", backgroundColor: colors.sandLight, borderBottom: `1px solid ${colors.sand}` }}>
        <p className="font-inclusive-sans font-normal" style={{ fontSize: 12, lineHeight: "16px", color: withAlpha(colors.ink, 0.8) }}>
          The drawer is a forced interstitial - the user clicked an ad specifically about iTravel, so making them navigate a dashboard first would be the actual friction.
        </p>
      </div>
      <div style={{ padding: "17px 4% 16px" }}>
        {/* 150 : 320 split with a 66px gap at design width — all proportional so it fits any width */}
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: "7%" }}>
          <div style={{ flex: "150 1 0", minWidth: 0, maxWidth: 150, display: "flex", flexDirection: "column", gap: 12 }}>
            <PhoneRow gap="0">
              <PhoneScreen src={imgEntryHasCard} alt="iTravel activation drawer" />
            </PhoneRow>
            <MediaCaption>State 1 - Has a credit card</MediaCaption>
          </div>
          <div style={{ flex: "320 1 0", minWidth: 0, maxWidth: 320, display: "flex", flexDirection: "column", gap: 9 }}>
            <PhoneRow gap="6.25%">
              <PhoneScreen src={imgEntryNoCard1} alt="Card application drawer" />
              <PhoneScreen src={imgEntryNoCard2} alt="Card application drawer, iTravel slide" />
            </PhoneRow>
            <MediaCaption>State 2, 3, 4 - Does not have a credit card</MediaCaption>
          </div>
        </div>
      </div>
    </div>
  );
}

function ItravelCroppedShot() {
  return (
    <div className="case-study-media" style={{ width: "100%", height: 123, backgroundColor: colors.sandPanel, borderRadius: 8, overflow: "hidden", display: "flex", justifyContent: "center", paddingTop: 16, boxSizing: "border-box" }}>
      <img src={imgAutoExpiry} alt="Additional preferences — auto-disable after trip" style={{ width: 150, height: "auto", alignSelf: "flex-start", display: "block" }} />
    </div>
  );
}

export function ItravelCaseStudy({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 52 }}>
      <SectionBlock id="cs-problem">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ItravelHeading>THE PROBLEM</ItravelHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ItravelText>
              30% of ICICI Bank international transactions were declining. The obvious fix - surface the toggle - would have helped. But I started from a different question: why does the decline happen at all, and what would actually prevent it?
            </ItravelText>
            <ItravelText>
              The answer wasn't in the UI. It was in how RBI mandates work, how fraud engines evaluate transactions, and how travelers actually use their phones abroad. Every decision in iTravel came from reasoning through those layers first, then designing backward to the screen.
            </ItravelText>
            <p className="font-inclusive-sans font-normal" style={{ fontSize: 14, lineHeight: "20px", letterSpacing: "0.01em", color: colors.body }}>The PM briefed...</p>
            <PullQuote>
              Build <em>iTravel</em>, a single, unified hub where customers declare their travel plans and the bank automatically aligns card usage and fraud monitoring to that profile.
            </PullQuote>
            <p className="font-inclusive-sans font-medium" style={{ fontSize: 14, lineHeight: "20px", color: colors.body }}>Three HMWs:</p>
            <NumberedCallout items={ITRAVEL_HMWS} />
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="cs-why">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ItravelHeading>Why the obvious fix wasn't enough</ItravelHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <LayerItem icon="📜" title="Layer 1 - RBI compliance">
                Separate switches for POS, ATM, and e-commerce. Enabling one doesn't enable the others. A user who turns on POS can still get silently declined buying online.
              </LayerItem>
              <LayerItem icon="🚨" title="Layer 2 - Fraud engine logic">
                The system doesn't just check if the toggle is on. It checks if the transaction looks geographically plausible for that cardholder.
              </LayerItem>
              <LayerItem icon="🔇" title="Layer 3 - Information gap">
                The bank has no signal a customer is traveling until they're already declined.
              </LayerItem>
            </div>
          </div>
          <ItravelText>
            iTravel was built to close Layer 3. Once the bank knows the trip in advance, Layers 1 and 2 can be handled automatically.
          </ItravelText>
        </div>
      </SectionBlock>

      <ItravelSection id="cs-entry">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ItravelHeading>1. Getting users in before they need it</ItravelHeading>
          <ItravelText>
            Most ICICI cardholders barely open iMobile - bill payments increasingly happen through CRED, PhonePe or other 3rd party apps. An in-app-only entry point reaches almost nobody.
          </ItravelText>
        </div>
        <DataTable headers={["State", "Outcome"]} rows={ITRAVEL_ENTRY_STATES} isMobile={isMobile} />
        <Spacer size={40} />
        <ItravelEntryPanel />
      </ItravelSection>

      <ItravelSection id="cs-trip">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ItravelHeading>2. Declaring the trip</ItravelHeading>
          <ItravelText>
            User declares destination, layover stops, travel dates, purpose, and multiple trips. The layover field wasn't in the brief - I proposed it.
          </ItravelText>
          <ItravelText>
            Fraud engines check travel plausibility, not just whether a country is blocked. A card quiet for months, then swiping in Tokyo, looks like fraud. A declared trip -{" "}
            <span className="font-caslon" style={{ color: colors.orange, fontSize: 16 }}>India → Singapore (layover) → Japan</span>{" "}
            - gives the engine a trail. The Tokyo swipe stops looking anomalous.
          </ItravelText>
          <ImageCarousel
            isMobile={isMobile}
            slides={[
              { images: [imgTripSingleEmpty, imgTripSingleFilled], caption: "Travelling to a single country with no layover" },
              { images: [imgTripMultiEmpty, imgTripMultiAdded, imgTripMultiFilled], caption: "Travelling to multiple countries, with a layover" },
            ]}
          />
        </div>
      </ItravelSection>

      <ItravelSection id="cs-limits">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ItravelHeading>3. Setting limits without currency math</ItravelHeading>
          <ItravelText>
            Card control limits shown as a slider with a live conversion-rate label for the destination currency.
          </ItravelText>
          <ItravelText>
            Three problems solved at once: no mental currency math, prevents under-setting a limit that looks fine in INR but causes a mid-trip decline, and surfaces a natural credit-limit-increase prompt when intended spend exceeds the current limit.
          </ItravelText>
          <MediaPanel padding="16px 6%">
            <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 512, margin: "0 auto" }}>
              <MediaCaption>All states of preferences</MediaCaption>
              <PhoneRow gap="6%">
                <PhoneScreen src={imgPrefsDefault} alt="Preferences — default" />
                <PhoneScreen src={imgPrefsEditing} alt="Preferences — editing a limit" />
                <PhoneScreen src={imgPrefsFilled} alt="Preferences — filled" />
              </PhoneRow>
            </div>
          </MediaPanel>
        </div>
      </ItravelSection>

      <ItravelSection id="cs-expiry">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ItravelHeading>4. Auto-expiring controls</ItravelHeading>
          <ItravelText>
            RBI mandates manual activation but says nothing about deactivation. Left on indefinitely, the fraud exposure window stays open long after the trip ends.
          </ItravelText>
          <ItravelText>
            Proposed auto-expiry tied to the declared travel dates - not RBI-required, my proposal. Shrinks the fraud window to exactly the trip and removes the hesitation of feeling like you're committing to this forever.
          </ItravelText>
          <ItravelCroppedShot />
        </div>
      </ItravelSection>

      <ItravelSection id="cs-wrapup">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <ItravelHeading>5. Travel wrap-up</ItravelHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ItravelText>
              After the trip: a fun summary - total spend, category breakdown, top merchants, country stamp added to a collection.
            </ItravelText>
            <ItravelText>
              The data already exists in the bank's transaction records. iTravel provides the trigger - declared dates and destination tell the system which transactions to aggregate and when to surface the summary.
            </ItravelText>
            <ItravelText>
              The stamp collection scales without manual asset creation. Each sticker uses dynamic fields - country code, currency, year visited - with one SVG illustration per country as the only per-country asset.
            </ItravelText>
          </div>
        </div>
        <ItravelCroppedShot />
      </ItravelSection>
    </div>
  );
}

// ─── CS2 content (ICICI FASTag) ───────────────────────────────────────────────
export function FastagCaseStudy({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="case-study-sections" style={{ display: "flex", flexDirection: "column" }}>
      <SectionBlock id="cs-intro">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionHeading isMobile={isMobile}>Introduction</SectionHeading>
          <div className="case-study-flow " style={{ display: "flex", flexDirection: "column"  }}>
            <BodyText isMobile={isMobile}>
              FASTag is mandatory for all four-wheelers on Indian highways, and ICICI Bank commands nearly 29% of the national FASTag market. Before this project, every one of those customers relied solely on iMobile or a third-party app to manage their tag.
            </BodyText>
            <BodyText isMobile={isMobile}>
              I designed the entire FASTag experience for RIB from scratch. No brief. No precedent. Just iMobile's existing flows as reference, a fixed two-week deadline, and three distinct user types that needed to coexist on the same platform.
            </BodyText>
            <Spacer size={isMobile ? 24 : 40} />
            <SectionHeading isMobile={isMobile}>Users and JTBD</SectionHeading>
            <BodyText isMobile={isMobile}>
              With the reference I had, before designing the screens, I mapped four core jobs users come to FASTag to do. These drove every layout and hierarchy decision that followed.
            </BodyText>
            <JtbdTable isMobile={isMobile} />

            <SectionHeading isMobile={isMobile}>It's 11pm on the highway, and the toll is ahead</SectionHeading>

            <BodyText isMobile={isMobile}>
              Think about Job 1 for a second — someone's checking their FASTag balance while driving toward a toll plaza. They're not relaxed, they're not browsing. They need an answer in a glance. Urgent, quick, no room for hunting.
            </BodyText>
            <SubHeading isMobile={isMobile}>
              That's exactly why the card works the way it does:
            </SubHeading>
            <ul className="font-inclusive-sans font-normal case-study-bullets case-study-bullets--accent" style={{ fontSize: 16, lineHeight: "24px", color: colors.body, letterSpacing: "0.15px", paddingLeft: isMobile ? 12 : 16, paddingRight: isMobile ? 12 : 16 }}>
              <li>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <strong style={{ color: colors.brown }}>Vehicle number and model</strong>
                  <span>You can scan it in under 2-seconds, no reading needed.</span>
                </div>
              </li>
              <li>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <strong style={{ color: colors.brown }}>Balance</strong>
                  <span>It's the biggest thing on the card, impossible to miss.</span>
                </div>
              </li>
              <li>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <strong style={{ color: colors.brown }}>Recharge</strong>
                  <span>One tap, always there, always in the same spot no matter the card state.</span>
                </div>
              </li>
              <li>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <strong style={{ color: colors.brown }}>Everything else</strong>
                  <span>Tucked behind the three-dot menu or the detail page, out of the way until you actually need it.</span>
                </div>
              </li>
            </ul>
            <BodyText isMobile={isMobile}>
              The secondary stuff (tag replacement, KYC, close tag, raise a query) — sure, it matters. But it's not why someone opens FASTag at 11pm on the highway. Keeping it secondary isn't a compromise. That's the whole point.
            </BodyText>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="cs-landing">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionHeading isMobile={isMobile}>1. Landing page</SectionHeading>
          <div className="case-study-flow" style={{ display: "flex", flexDirection: "column" }}>
            <BodyText isMobile={isMobile}>
              One landing page. Three user types. Multiple card states. Everything had to be readable at a glance — including for fleet owners managing 20+ FASTags simultaneously.
            </BodyText>
            <SubHeading isMobile={isMobile}>
              There are 3 user types:
            </SubHeading>
            <ul className="font-inclusive-sans font-normal case-study-bullets" style={{ fontSize: 14, lineHeight: "20px", color: colors.body, letterSpacing: "0.14px", paddingLeft: isMobile ? 12 : 16, paddingRight: isMobile ? 12 : 16 }}>
              <li>New user</li>
              <li>Existing users (ICICI Bank and non-ICICI Bank)</li>
              <li>Fleet owners (ICICI Bank and non-ICICI Bank)</li>
            </ul>

            <ImageCarousel
              isMobile={isMobile}
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

            <SectionHeading isMobile={isMobile}>The TAB decision</SectionHeading>
            <BodyText isMobile={isMobile}>
              Early versions showed all FASTags in one mixed list — ICICI and non-ICICI together, sorted by recency. The problem: a just-linked third-party FASTag would float to the top, pushing the user's ICICI card down the scroll. Wrong for the user. Wrong for the bank.
            </BodyText>
            <BodyText isMobile={isMobile}>
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
          <SectionHeading isMobile={isMobile}>2. FASTag card exploration</SectionHeading>
          <div className="case-study-flow" style={{ display: "flex", flexDirection: "column" }}>
            <SubHeading isMobile={isMobile}>
              The problem
            </SubHeading>
            <BodyText isMobile={isMobile}>
              The card had to do five jobs: identify the vehicle, show balance, trigger recharge, flag errors, and indicate auto-recharge status. New edge cases kept arriving after the first drop — RC rejected, KYV pending, low balance, inactive — and each new state changed the layout.
            </BodyText>
            <BodyText isMobile={isMobile}>
              I went through multiple rounds before the card resolved.
            </BodyText>

            <IterationLabel isMobile={isMobile}>Iteration 1 — Started simple</IterationLabel>
            <IterationThumbnailRow
              isMobile={isMobile}
              caption="Iteration - 1"
              aspectRatio="166 / 73"
              images={[imgIter1_1, imgIter1_2, imgIter1_3, imgIter1_4, imgIter1_5, imgIter1_6]}
            />
            <BodyText isMobile={isMobile}>
              This card was the gateway to everything — all details, services, history. Get it wrong and the whole page falls apart. The first drop focused on the essentials: vehicle number, model, balance, recharge, overflow menu. The client liked it, then added to it. Urgency signals, auto-recharge status, and other bank FASTag callouts all needed to live here too.
            </BodyText>

            <IterationLabel isMobile={isMobile}>Iteration 2 — Absorbed the feedback</IterationLabel>
            <IterationThumbnailRow
              isMobile={isMobile}
              caption="Iteration - 2"
              aspectRatio="198 / 96"
              images={[imgIter2_1, imgIter2_2, imgIter2_3, imgIter2_4, imgIter2_5, imgIter2_6]}
            />
            <BodyText isMobile={isMobile}>
              It held for simple cases. Then an edge case surfaced: what if a user has low balance and a rejected RC simultaneously? Two unrelated error states, both needing attention, both fighting for the same space. They couldn't be merged — they were different problems requiring different actions. The card broke under the combination.
            </BodyText>

            <IterationLabel isMobile={isMobile}>Iteration 3 — Give errors room</IterationLabel>
            <BodyText isMobile={isMobile}>
              The fix was giving urgency signals their own space rather than forcing them into the card body. A few more variants, shown to the client, and this was approved, yayy!
            </BodyText>
            <IterationThumbnailRow
              isMobile={isMobile}
              caption="Iteration - 3"
              images={[imgIter3_1, imgIter3_2, imgIter3_3, imgIter3_4, imgIter3_5]}
            />
            <StateTreatmentTable
              isMobile={isMobile}
              rows={[
                { state: "Auto-recharge ON", treatment: "Gradient orange footer" },
                { state: "Auto-recharge OFF", treatment: "Pastel footer with CTA" },
                { state: "Low balance", treatment: "Inline peach pill with an icon" },
                { state: "RC/KYC/KYV rejected/pending", treatment: "Inline warning red pill" },
                { state: "Non-ICICI tag", treatment: "Solid grey footer, separate tab" },
              ]}
            />
            <BodyText isMobile={isMobile}>
              The anchor across all states: vehicle number, balance, recharge — always visible, always in the same position.
            </BodyText>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="cs-details">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionHeading isMobile={isMobile}>3. All FASTag details</SectionHeading>
          <div className="case-study-flow" style={{ display: "flex", flexDirection: "column" }}>
            <SubHeading isMobile={isMobile}>Three card types, one layout</SubHeading>
            <BodyText isMobile={isMobile}>
              The detail page is structurally identical across all three FASTag types. What changes is the right column — the service set available to that specific tag.
            </BodyText>
            <BodyText isMobile={isMobile}>
              For an ICICI FASTag this is the full service suite: Recharge, Auto recharge, Tag replacement, Update RC, Know Your Vehicle, Close FASTag, Raise a query, View tag details.
            </BodyText>
            <BodyText isMobile={isMobile}>
              For a non-ICICI FASTag the right column reduces to three options: Recharge, Remove, and Buy ICICI FASTag.
            </BodyText>
            <ImageCarousel
              isMobile={isMobile}
              slides={[
                { src: imgFastagNonIcici, caption: "Non-ICICI Bank FASTag" },
                { src: imgFastagAutoOff, caption: "ICICI Bank FASTag — Auto-recharge off" },
                { src: imgFastagAutoOn, caption: "ICICI Bank FASTag — Auto-recharge on" },
              ]}
            />

            <SubHeading isMobile={isMobile}>All states</SubHeading>
            <BodyText isMobile={isMobile}>
              There have been various states and micro-interactions added to multiple sections of the landing. Scroll to view all the interactions.
            </BodyText>
            <ImageCarousel
              isMobile={isMobile}
              slides={[
                { src: imgStateDownload, caption: "Download history - button has a dropdown on hover" },
                { src: imgStateFleetDropdown, caption: "For fleet owners - more than 4 will appear inside a dropdown" },
                { src: imgStateHoverServices, caption: "Hovering on services will open a tooltip" },
              ]}
            />

            <SubHeading isMobile={isMobile}>Filter and email FASTag history</SubHeading>
            <BodyText isMobile={isMobile}>
              <strong>Filter history</strong> — Chips were added for easily filtering of the history. For customized dates, the user can filter by start and end date.
            </BodyText>
            <ImageCarousel
              isMobile={isMobile}
              slides={[
                { src: imgFilterDefault, caption: "Filter history - default" },
                { src: imgFilterFilled, caption: "Filter history - filled" },
              ]}
            />
            <BodyText isMobile={isMobile}>
              <strong>Email statement</strong> — After the 1st drop, there was an additional requirement from the client that the user can only fetch the history for up to 90 days on the interface, and payments older than that would be emailed to their registered email ID.
            </BodyText>
            <ImageCarousel
              isMobile={isMobile}
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
          <SectionHeading isMobile={isMobile}>4. FASTag recharge</SectionHeading>
          <div className="case-study-flow" style={{ display: "flex", flexDirection: "column" }}>
            <SubHeading isMobile={isMobile}>The problem with the first version</SubHeading>
            <BodyText isMobile={isMobile}>
              The mobile reference flows had three separate recharge experiences depending on where the user came from — ICICI FASTag, linked non-ICICI, and first-time non-linked. Some were modals, some full-page, each with different data points. The same action looked different every time and the client pushed for an experience of keeping them as is. It was unsustainable to maintain, and expensive to build.
            </BodyText>
            <ImageGrid2x2 images={[imgRechargeOld1, imgRechargeOld2, imgRechargeOld3, imgRechargeOld4]} />

            <IterationLabel isMobile={isMobile}>The fix</IterationLabel>
            <BodyText isMobile={isMobile}>
              One standard recharge flow. Regardless of entry point — dashboard card, detail page, quick action panel — the user lands on the same experience with the same data points.
            </BodyText>
            <SubHeading isMobile={isMobile}>
              The vehicle type determines what's shown within that standard flow:
            </SubHeading>
            <ul className="font-inclusive-sans font-normal case-study-bullets" style={{ fontSize: 14, lineHeight: "20px", color: colors.body, letterSpacing: "0.14px", paddingLeft: isMobile ? 12 : 16, paddingRight: isMobile ? 12 : 16 }}>
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
            <BodyText isMobile={isMobile}>
              The entry point context is resolved before the user enters the flow. Inside the flow, it is always the same.
            </BodyText>
            <ImageCarousel
              isMobile={isMobile}
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
          <SectionHeading isMobile={isMobile}>Currently <em>in-development</em>, but what I took away...</SectionHeading>
          <div className="case-study-flow" style={{ display: "flex", flexDirection: "column" }}>
            <BodyText isMobile={isMobile}>
              The requirements were half-baked and the timeline was too short for the volume. The biggest thing I learned: negotiate on scope or timeline upfront, not after you're already deep in it.
            </BodyText>
            <BodyText isMobile={isMobile}>
              Working solo on something this large taught me what I'm actually capable of under pressure. Every interaction, every click path — I was the only one deciding. That's a different kind of responsibility than working in a team, and I didn't fully appreciate it until I was in it.
            </BodyText>
            <BodyText isMobile={isMobile}>
              Redesigning an entire flow midway, defending the decision to stakeholders, and still handing off on time gave me a confidence I didn't have going in. This project showed me I can hold complexity and ship.
            </BodyText>
          </div>
        </div>
      </SectionBlock>
    </div>
  );
}


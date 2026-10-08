// Guestbook: post-it notes visitors leave for me. Each note is emailed to me
// (Web3Forms) and stored in Supabase, which serves the approved ones back to the wall.
import { GUESTBOOK_TABLE, SUPABASE_ANON_KEY, SUPABASE_URL, WEB3FORMS_ACCESS_KEY } from "@/app/config/guestbook";

export interface GuestbookNote {
  id: number | string;
  created_at: string;
  name: string;
  company: string;
  linkedin: string | null;
  message: string;
}

export interface GuestbookDraft {
  name: string;
  company: string;
  linkedin: string;
  message: string;
}

export const LIMITS = { name: 60, company: 80, message: 500 } as const;
const COOLDOWN_MS = 60_000;
const LAST_POST_KEY = "guestbook-last-post";

export const isGuestbookConfigured = Boolean(WEB3FORMS_ACCESS_KEY && SUPABASE_URL && SUPABASE_ANON_KEY);

// Accepts "linkedin.com/in/x", "www.linkedin.com/in/x" or a full https URL; anything
// that isn't a LinkedIn address is rejected so the wall can't link elsewhere.
export function normaliseLinkedIn(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (!/(^|\.)linkedin\.com$/i.test(url.hostname)) return null;
    url.protocol = "https:";
    return url.toString();
  } catch {
    return null;
  }
}

export type DraftErrors = Partial<Record<keyof GuestbookDraft, string>>;

export function validate(draft: GuestbookDraft): DraftErrors {
  const errors: DraftErrors = {};
  if (!draft.name.trim()) errors.name = "who's writing?";
  if (!draft.company.trim()) errors.company = "where do you work?";
  if (!draft.message.trim()) errors.message = "write me something!";
  if (draft.linkedin.trim() && !normaliseLinkedIn(draft.linkedin)) errors.linkedin = "that doesn't look like a LinkedIn link";
  return errors;
}

export function cooldownRemaining(): number {
  try {
    const last = Number(localStorage.getItem(LAST_POST_KEY) || 0);
    return Math.max(0, last + COOLDOWN_MS - Date.now());
  } catch {
    return 0;
  }
}

const supabaseHeaders = () => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
});

export async function fetchNotes(): Promise<GuestbookNote[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${GUESTBOOK_TABLE}?select=id,created_at,name,company,linkedin,message&approved=eq.true&order=created_at.desc&limit=60`,
    { headers: supabaseHeaders() },
  );
  if (!res.ok) throw new Error(`Couldn't load notes (${res.status})`);
  return res.json();
}

// Stores the note and emails it to me. Succeeds if it was stored (email is best-effort).
export async function postNote(draft: GuestbookDraft): Promise<GuestbookNote> {
  const note = {
    name: draft.name.trim().slice(0, LIMITS.name),
    company: draft.company.trim().slice(0, LIMITS.company),
    linkedin: normaliseLinkedIn(draft.linkedin),
    message: draft.message.trim().slice(0, LIMITS.message),
  };

  const store = fetch(`${SUPABASE_URL}/rest/v1/${GUESTBOOK_TABLE}`, {
    method: "POST",
    headers: { ...supabaseHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify(note),
  });
  const email = fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `📌 New post-it from ${note.name} (${note.company})`,
      from_name: "Portfolio guestbook",
      name: note.name,
      company: note.company,
      linkedin: note.linkedin ?? "-",
      message: note.message,
    }),
  }).catch(() => null);

  const [stored] = await Promise.all([store, email]);
  if (!stored.ok) throw new Error(`Couldn't pin your note (${stored.status})`);
  try { localStorage.setItem(LAST_POST_KEY, String(Date.now())); } catch { /* storage blocked */ }
  return { ...note, id: `local-${Date.now()}`, created_at: new Date().toISOString() };
}

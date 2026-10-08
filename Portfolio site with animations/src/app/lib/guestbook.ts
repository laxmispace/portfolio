// Guestbook: post-it notes visitors stick on the board for me. Each note is emailed
// to me (Web3Forms) and stored in Supabase - including where on the board it was
// stuck - which serves the approved ones back so every visitor sees the same board.
import { GUESTBOOK_TABLE, SUPABASE_ANON_KEY, SUPABASE_URL, WEB3FORMS_ACCESS_KEY } from "@/app/config/guestbook";

export const AVATARS = ["panda", "cow", "frog", "koala", "cat"] as const;
export const NOTE_COLORS = ["orange", "pink", "green"] as const;
export type Avatar = (typeof AVATARS)[number];
export type NoteColor = (typeof NOTE_COLORS)[number];

export interface GuestbookNote {
  id: number | string;
  created_at: string;
  name: string;
  company: string;
  role: string;
  message: string;
  avatar: Avatar | null;
  sticker: NoteColor | null;
  color: NoteColor;
  /** 0-1 across the board, and down it as a fraction of the board's resting height
   *  (above 1 once the board has grown taller to fit more notes) */
  pos_x: number;
  pos_y: number;
  /** degrees */
  tilt: number;
}

export interface GuestbookDraft {
  name: string;
  company: string;
  role: string;
  message: string;
  avatar: Avatar | null;
  sticker: NoteColor | null;
  color: NoteColor;
}

export interface Placement {
  pos_x: number;
  pos_y: number;
  tilt: number;
}

export const LIMITS = { name: 60, company: 80, role: 80, message: 280 } as const;
const COOLDOWN_MS = 60_000;
const LAST_POST_KEY = "guestbook-last-post";
const DEV_NOTES_KEY = "guestbook-dev-notes";

const hasBackend = Boolean(WEB3FORMS_ACCESS_KEY && SUPABASE_URL && SUPABASE_ANON_KEY);
// Without keys, `npm run dev` keeps notes in this browser so the board can be tried
// out; a production build without keys shows "opens soon" instead.
const useDevStore = !hasBackend && import.meta.env.DEV;
export const isGuestbookConfigured = hasBackend || useDevStore;

export type DraftErrors = Partial<Record<keyof GuestbookDraft, string>>;

export function validate(draft: GuestbookDraft): DraftErrors {
  const errors: DraftErrors = {};
  if (!draft.name.trim()) errors.name = "who's writing?";
  if (!draft.message.trim()) errors.message = "write me something!";
  return errors;
}

export function cooldownRemaining(): number {
  if (useDevStore) return 0;
  try {
    const last = Number(localStorage.getItem(LAST_POST_KEY) || 0);
    return Math.max(0, last + COOLDOWN_MS - Date.now());
  } catch {
    return 0;
  }
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0.5));
const clampDown = (n: number) => Math.min(50, Math.max(0, Number.isFinite(n) ? n : 0.5));

// Rows come from a public table, so anything unexpected falls back to a safe value.
function sanitise(row: Partial<GuestbookNote>): GuestbookNote {
  return {
    id: row.id ?? `row-${Math.random()}`,
    created_at: row.created_at ?? "",
    name: String(row.name ?? ""),
    company: String(row.company ?? ""),
    role: String(row.role ?? ""),
    message: String(row.message ?? ""),
    avatar: AVATARS.includes(row.avatar as Avatar) ? (row.avatar as Avatar) : null,
    sticker: NOTE_COLORS.includes(row.sticker as NoteColor) ? (row.sticker as NoteColor) : null,
    color: NOTE_COLORS.includes(row.color as NoteColor) ? (row.color as NoteColor) : "pink",
    pos_x: clamp01(Number(row.pos_x)),
    pos_y: clampDown(Number(row.pos_y)),
    tilt: Math.max(-15, Math.min(15, Number(row.tilt) || 0)),
  };
}

function readDevNotes(): GuestbookNote[] {
  try { return JSON.parse(localStorage.getItem(DEV_NOTES_KEY) || "[]"); } catch { return []; }
}

const supabaseHeaders = () => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
});

/** Oldest first, so later notes are stuck on top of earlier ones. */
export async function fetchNotes(): Promise<GuestbookNote[]> {
  if (useDevStore) return readDevNotes().map(sanitise);
  if (!hasBackend) return [];
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${GUESTBOOK_TABLE}?select=id,created_at,name,company,role,message,avatar,sticker,color,pos_x,pos_y,tilt&approved=eq.true&order=created_at.desc&limit=120`,
    { headers: supabaseHeaders() },
  );
  if (!res.ok) throw new Error(`Couldn't load notes (${res.status})`);
  const rows: Partial<GuestbookNote>[] = await res.json();
  return rows.map(sanitise).reverse();
}

// Stores the note where it was stuck and emails it to me. Succeeds if it was
// stored (the email is best-effort).
export async function postNote(draft: GuestbookDraft, at: Placement): Promise<GuestbookNote> {
  const note = {
    name: draft.name.trim().slice(0, LIMITS.name),
    company: draft.company.trim().slice(0, LIMITS.company),
    role: draft.role.trim().slice(0, LIMITS.role),
    message: draft.message.trim().slice(0, LIMITS.message),
    avatar: draft.avatar,
    sticker: draft.sticker,
    color: draft.color,
    pos_x: clamp01(at.pos_x),
    pos_y: clampDown(at.pos_y),
    tilt: Math.round(at.tilt * 100) / 100,
  };
  const local: GuestbookNote = { ...note, id: `local-${Date.now()}`, created_at: new Date().toISOString() };

  if (useDevStore) {
    try { localStorage.setItem(DEV_NOTES_KEY, JSON.stringify([...readDevNotes(), local])); } catch { /* storage blocked */ }
    return local;
  }

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
      subject: `📌 New post-it from ${note.name}${note.company ? ` (${note.company})` : ""}`,
      from_name: "Portfolio guestbook",
      name: note.name,
      company: note.company || "-",
      role: note.role || "-",
      message: note.message,
    }),
  }).catch(() => null);

  const [stored] = await Promise.all([store, email]);
  if (!stored.ok) throw new Error(`Couldn't stick your note (${stored.status})`);
  try { localStorage.setItem(LAST_POST_KEY, String(Date.now())); } catch { /* storage blocked */ }
  return local;
}

// Anyone can move a note around the board; the new spot is saved for the next visitor.
// Notes posted in this visit only have a temporary id, so their moves last until reload.
export async function moveNote(id: GuestbookNote["id"], at: Pick<Placement, "pos_x" | "pos_y">): Promise<void> {
  const pos = { pos_x: clamp01(at.pos_x), pos_y: clampDown(at.pos_y) };
  if (useDevStore) {
    try {
      localStorage.setItem(DEV_NOTES_KEY, JSON.stringify(readDevNotes().map((n) => (n.id === id ? { ...n, ...pos } : n))));
    } catch { /* storage blocked */ }
    return;
  }
  if (!hasBackend || typeof id !== "number") return;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${GUESTBOOK_TABLE}?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...supabaseHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify(pos),
  });
  if (!res.ok) throw new Error(`Couldn't move the note (${res.status})`);
}

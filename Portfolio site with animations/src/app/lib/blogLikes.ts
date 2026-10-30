// Like counts for blog posts, kept in the guestbook's Supabase project
// (run docs/blog-likes.sql there once). Each browser remembers whether it has
// liked a post, so a like can be taken back but not repeated.
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/app/config/guestbook";

const hasBackend = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const headers = () => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
});

/** The post's like count, or null when it can't be loaded (no backend, offline, table not set up yet). */
export async function fetchLikes(slug: string): Promise<number | null> {
  if (!hasBackend) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_likes?select=count&slug=eq.${encodeURIComponent(slug)}`, { headers: headers() });
    if (!res.ok) return null;
    const rows: { count: number }[] = await res.json();
    return rows[0]?.count ?? 0;
  } catch {
    return null;
  }
}

/** +1 to like, -1 to take it back. Resolves to the new count, or null if it didn't go through. */
export async function sendLike(slug: string, delta: 1 | -1): Promise<number | null> {
  if (!hasBackend) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/like_blog_post`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ p_slug: slug, p_delta: delta }),
    });
    if (!res.ok) return null;
    return Number(await res.json());
  } catch {
    return null;
  }
}

const likedKey = (slug: string) => `blog-liked:${slug}`;

export function hasLiked(slug: string): boolean {
  try { return localStorage.getItem(likedKey(slug)) === "1"; } catch { return false; }
}

export function rememberLiked(slug: string, liked: boolean) {
  try {
    if (liked) localStorage.setItem(likedKey(slug), "1");
    else localStorage.removeItem(likedKey(slug));
  } catch { /* private mode - the like still counts, it just isn't remembered */ }
}

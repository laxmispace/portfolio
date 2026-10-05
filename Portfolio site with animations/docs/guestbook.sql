-- Guestbook table for the portfolio's post-it wall.
-- Run once in Supabase → SQL editor. Visitors can add notes and read approved ones;
-- nobody but you (in the Supabase dashboard) can edit or delete them.
-- New notes appear on the wall straight away (approved = true). To hide one, untick
-- "approved" for it in Table editor → guestbook_notes. To review notes before they
-- appear, change the default below to false.

create table if not exists public.guestbook_notes (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 1 and 60),
  company     text not null check (char_length(company) between 1 and 80),
  linkedin    text check (linkedin is null or linkedin ~* '^https://([a-z0-9-]+\.)*linkedin\.com/'),
  message     text not null check (char_length(message) between 1 and 500),
  approved    boolean not null default true
);

alter table public.guestbook_notes enable row level security;

-- Visitors may only fill in the four note fields; "approved" always takes its default.
revoke all on public.guestbook_notes from anon;
grant select on public.guestbook_notes to anon;
grant insert (name, company, linkedin, message) on public.guestbook_notes to anon;

create policy "anyone can leave a note"
  on public.guestbook_notes for insert to anon
  with check (true);

create policy "approved notes are public"
  on public.guestbook_notes for select to anon
  using (approved);

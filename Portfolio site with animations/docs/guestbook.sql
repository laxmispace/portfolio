-- Guestbook table for the portfolio's post-it board.
-- Run once in Supabase → SQL editor. Visitors can add notes and read approved ones;
-- they can also drag notes to a new spot. Only you (in the Supabase dashboard) can
-- edit or delete them.
-- New notes appear on the board straight away (approved = true). To hide one, untick
-- "approved" for it in Table editor → guestbook_notes. To review notes before they
-- appear, change the default below to false.
--
-- Each note remembers where it was stuck: pos_x is 0-1 across the board, pos_y is
-- down it as a fraction of its resting height (above 1 once the board grows to fit
-- more notes), and tilt is its rotation in degrees. Visitors can drag notes around,
-- which updates pos_x / pos_y only. Edit them in the Table editor to tidy the board.
-- Safe to re-run: every statement below can be run again on an existing table.

create table if not exists public.guestbook_notes (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 1 and 60),
  company     text not null default '' check (char_length(company) <= 80),
  role        text not null default '' check (char_length(role) <= 80),
  message     text not null check (char_length(message) between 1 and 280),
  avatar      text check (avatar is null or avatar in ('panda', 'cow', 'frog', 'koala', 'cat')),
  sticker     text check (sticker is null or sticker in ('pink', 'orange', 'green')),
  color       text not null default 'pink' check (color in ('pink', 'orange', 'green')),
  pos_x       real not null default 0.5 check (pos_x between 0 and 1),
  pos_y       real not null default 0.5 check (pos_y between 0 and 50),
  tilt        real not null default 0 check (tilt between -15 and 15),
  approved    boolean not null default true
);

-- Already created the table from the earlier version of this file? This upgrades it
-- in place (safe to run on a fresh table too).
alter table public.guestbook_notes drop constraint if exists guestbook_notes_company_check;
alter table public.guestbook_notes alter column company set default '';
alter table public.guestbook_notes add constraint guestbook_notes_company_check check (char_length(company) <= 80);
alter table public.guestbook_notes add column if not exists role    text not null default '' check (char_length(role) <= 80);
alter table public.guestbook_notes add column if not exists avatar  text check (avatar is null or avatar in ('panda', 'cow', 'frog', 'koala', 'cat'));
alter table public.guestbook_notes add column if not exists sticker text check (sticker is null or sticker in ('pink', 'orange', 'green'));
alter table public.guestbook_notes add column if not exists color   text not null default 'pink' check (color in ('pink', 'orange', 'green'));
alter table public.guestbook_notes add column if not exists pos_x   real not null default 0.5 check (pos_x between 0 and 1);
alter table public.guestbook_notes add column if not exists pos_y   real not null default 0.5;
alter table public.guestbook_notes drop constraint if exists guestbook_notes_pos_y_check;
alter table public.guestbook_notes add constraint guestbook_notes_pos_y_check check (pos_y between 0 and 50);
alter table public.guestbook_notes add column if not exists tilt    real not null default 0 check (tilt between -15 and 15);

alter table public.guestbook_notes enable row level security;

-- Visitors may only fill in the note fields; "approved" always takes its default.
revoke all on public.guestbook_notes from anon;
grant select on public.guestbook_notes to anon;
grant insert (name, company, role, message, avatar, sticker, color, pos_x, pos_y, tilt) on public.guestbook_notes to anon;
-- ...and may move any visible note (its position only - never its words).
grant update (pos_x, pos_y) on public.guestbook_notes to anon;

drop policy if exists "anyone can leave a note" on public.guestbook_notes;
create policy "anyone can leave a note"
  on public.guestbook_notes for insert to anon
  with check (true);

drop policy if exists "approved notes are public" on public.guestbook_notes;
create policy "approved notes are public"
  on public.guestbook_notes for select to anon
  using (approved);

drop policy if exists "anyone can move a note" on public.guestbook_notes;
create policy "anyone can move a note"
  on public.guestbook_notes for update to anon
  using (approved)
  with check (approved);

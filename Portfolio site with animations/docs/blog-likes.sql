-- Like counts for blog posts (the heart at the bottom of each post).
-- Run once in Supabase → SQL editor (same project as the guestbook).
-- Visitors can read the counts and add or take back one like through like_blog_post;
-- they can't write to the table directly. Edit counts in Table editor → blog_likes.
-- Safe to re-run.

create table if not exists public.blog_likes (
  slug   text primary key check (char_length(slug) between 1 and 120),
  count  integer not null default 0 check (count >= 0)
);

alter table public.blog_likes enable row level security;

drop policy if exists "anyone can read like counts" on public.blog_likes;
create policy "anyone can read like counts" on public.blog_likes
  for select using (true);

-- +1 for a like, -1 to take it back. Returns the new count.
create or replace function public.like_blog_post(p_slug text, p_delta integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  if p_delta not in (-1, 1) then
    raise exception 'delta must be 1 or -1';
  end if;
  insert into public.blog_likes as b (slug, count)
  values (p_slug, greatest(0, p_delta))
  on conflict (slug) do update set count = greatest(0, b.count + p_delta)
  returning b.count into new_count;
  return new_count;
end;
$$;

revoke all on function public.like_blog_post(text, integer) from public;
grant execute on function public.like_blog_post(text, integer) to anon, authenticated;

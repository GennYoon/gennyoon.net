-- categories 테이블 (public 스키마)
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  color text default '#6366f1',
  emoji text default '📝',
  created_at timestamptz default now()
);

alter table public.categories enable row level security;

create policy "categories are public"
  on public.categories for select
  using (true);

create policy "auth users manage categories"
  on public.categories for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

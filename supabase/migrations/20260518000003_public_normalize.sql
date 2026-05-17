-- Normalize: gennyoon schema → public schema for prod
-- Local: gennyoon schema tables still exist for local dev separation
-- Prod: all tables must be in public schema

-- Tables
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

create table if not exists public.tags (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null
);

create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  content text,
  content_markdown text,
  cover_image text,
  category_id uuid references public.categories(id) on delete set null,
  lang text default 'ko' check (lang in ('ko', 'en')),
  status text default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  seo_title text,
  seo_description text,
  og_image text,
  view_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.post_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create table if not exists public.cross_posts (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade,
  platform text not null check (platform in ('devto', 'medium', 'linkedin')),
  external_id text,
  external_url text,
  posted_at timestamptz default now()
);

create table if not exists public.ai_prompts (
  id uuid default gen_random_uuid() primary key,
  category_slug text not null unique,
  category_name text not null,
  system_prompt text not null,
  updated_at timestamptz default now()
);

create table if not exists public.drafts (
  id uuid default gen_random_uuid() primary key,
  raw_input text,
  images jsonb default '[]'::jsonb,
  generated_draft text,
  final_post_id uuid references public.posts(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.linkedin_tokens (
  id uuid default gen_random_uuid() primary key,
  access_token text not null,
  person_urn text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.handle_updated_at();

drop trigger if exists ai_prompts_updated_at on public.ai_prompts;
create trigger ai_prompts_updated_at
  before update on public.ai_prompts
  for each row execute function public.handle_updated_at();

-- View count function
create or replace function public.increment_view_count(post_slug text)
returns void as $$
  update public.posts
  set view_count = view_count + 1
  where slug = post_slug and status = 'published';
$$ language sql security definer;

-- Copy data from gennyoon if it exists and public tables are empty
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'gennyoon' and table_name = 'categories')
     and not exists (select 1 from public.categories limit 1) then
    insert into public.categories (id, name, slug, created_at)
    select id, name, slug, created_at from gennyoon.categories
    on conflict (id) do nothing;
  end if;

  if exists (select 1 from information_schema.tables where table_schema = 'gennyoon' and table_name = 'tags')
     and not exists (select 1 from public.tags limit 1) then
    insert into public.tags (id, name, slug)
    select id, name, slug from gennyoon.tags
    on conflict (id) do nothing;
  end if;

  if exists (select 1 from information_schema.tables where table_schema = 'gennyoon' and table_name = 'posts')
     and not exists (select 1 from public.posts limit 1) then
    insert into public.posts (id, title, slug, content, content_markdown, cover_image, category_id, lang, status, published_at, seo_title, seo_description, og_image, view_count, created_at, updated_at)
    select id, title, slug, content, content_markdown, cover_image, category_id, lang, status, published_at, seo_title, seo_description, og_image, view_count, created_at, updated_at
    from gennyoon.posts
    on conflict (id) do nothing;
  end if;

  if exists (select 1 from information_schema.tables where table_schema = 'gennyoon' and table_name = 'post_tags')
     and not exists (select 1 from public.post_tags limit 1) then
    insert into public.post_tags (post_id, tag_id)
    select post_id, tag_id from gennyoon.post_tags
    on conflict do nothing;
  end if;

  if exists (select 1 from information_schema.tables where table_schema = 'gennyoon' and table_name = 'cross_posts')
     and not exists (select 1 from public.cross_posts limit 1) then
    insert into public.cross_posts (id, post_id, platform, external_id, external_url, posted_at)
    select id, post_id, platform, external_id, external_url, posted_at from gennyoon.cross_posts
    on conflict (id) do nothing;
  end if;

  if exists (select 1 from information_schema.tables where table_schema = 'gennyoon' and table_name = 'ai_prompts')
     and not exists (select 1 from public.ai_prompts limit 1) then
    insert into public.ai_prompts (id, category_slug, category_name, system_prompt, updated_at)
    select id, category_slug, category_name, system_prompt, updated_at from gennyoon.ai_prompts
    on conflict (id) do nothing;
  end if;

  if exists (select 1 from information_schema.tables where table_schema = 'gennyoon' and table_name = 'linkedin_tokens')
     and not exists (select 1 from public.linkedin_tokens limit 1) then
    insert into public.linkedin_tokens (id, access_token, person_urn, expires_at, created_at)
    select id, access_token, person_urn, expires_at, created_at from gennyoon.linkedin_tokens
    on conflict (id) do nothing;
  end if;
end $$;

-- Seed categories if still empty
insert into public.categories (id, name, slug) values
  ('e4d8cfde-dd37-46b3-9f7a-96ff5070ed73', 'AI 개발',  'ai-dev'),
  ('ec3d323e-37ea-42f9-966e-c6122ddada24', '노마드',   'nomad'),
  ('79dbd5f0-0dc5-45e7-b3b1-2c9092ff5a2e', '비즈니스', 'business'),
  ('1c135a02-5acf-4da4-9173-15382bdbe5b0', '에세이',   'essay')
on conflict (id) do update
  set name = excluded.name,
      slug = excluded.slug;

-- RLS
alter table public.posts enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;
alter table public.cross_posts enable row level security;
alter table public.ai_prompts enable row level security;
alter table public.drafts enable row level security;
alter table public.linkedin_tokens enable row level security;

-- RLS policies (drop first to avoid conflict on re-run)
drop policy if exists "published posts are public" on public.posts;
create policy "published posts are public"
  on public.posts for select
  using (status = 'published');

drop policy if exists "categories are public" on public.categories;
create policy "categories are public"
  on public.categories for select
  using (true);

drop policy if exists "tags are public" on public.tags;
create policy "tags are public"
  on public.tags for select
  using (true);

drop policy if exists "post_tags are public" on public.post_tags;
create policy "post_tags are public"
  on public.post_tags for select
  using (true);

drop policy if exists "auth users manage posts" on public.posts;
create policy "auth users manage posts"
  on public.posts for all
  using (auth.role() = 'authenticated');

drop policy if exists "auth users manage categories" on public.categories;
create policy "auth users manage categories"
  on public.categories for all
  using (auth.role() = 'authenticated');

drop policy if exists "auth users manage tags" on public.tags;
create policy "auth users manage tags"
  on public.tags for all
  using (auth.role() = 'authenticated');

drop policy if exists "auth users manage ai_prompts" on public.ai_prompts;
create policy "auth users manage ai_prompts"
  on public.ai_prompts for all
  using (auth.role() = 'authenticated');

drop policy if exists "auth users manage drafts" on public.drafts;
create policy "auth users manage drafts"
  on public.drafts for all
  using (auth.role() = 'authenticated');

drop policy if exists "auth users manage cross_posts" on public.cross_posts;
create policy "auth users manage cross_posts"
  on public.cross_posts for all
  using (auth.role() = 'authenticated');

drop policy if exists "auth users manage linkedin_tokens" on public.linkedin_tokens;
create policy "auth users manage linkedin_tokens"
  on public.linkedin_tokens for all
  using (auth.role() = 'authenticated');

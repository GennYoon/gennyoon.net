-- Extensions
create extension if not exists "uuid-ossp";

-- Categories
create table gennyoon.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  color text default '#6366f1',
  emoji text default '📝',
  created_at timestamptz default now()
);

-- Tags
create table gennyoon.tags (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null
);

-- Posts
create table gennyoon.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  content text,
  content_markdown text,
  cover_image text,
  category_id uuid references gennyoon.categories(id) on delete set null,
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

-- Post Tags
create table gennyoon.post_tags (
  post_id uuid references gennyoon.posts(id) on delete cascade,
  tag_id uuid references gennyoon.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- Cross Posts
create table gennyoon.cross_posts (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references gennyoon.posts(id) on delete cascade,
  platform text not null check (platform in ('devto', 'medium', 'linkedin')),
  external_id text,
  external_url text,
  posted_at timestamptz default now()
);

-- AI Prompts
create table gennyoon.ai_prompts (
  id uuid default gen_random_uuid() primary key,
  category_slug text not null unique,
  category_name text not null,
  system_prompt text not null,
  updated_at timestamptz default now()
);

-- Drafts
create table gennyoon.drafts (
  id uuid default gen_random_uuid() primary key,
  raw_input text,
  images jsonb default '[]'::jsonb,
  generated_draft text,
  final_post_id uuid references gennyoon.posts(id) on delete set null,
  created_at timestamptz default now()
);

-- updated_at 자동 갱신 트리거
create or replace function gennyoon.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_updated_at
  before update on gennyoon.posts
  for each row execute function gennyoon.handle_updated_at();

create trigger ai_prompts_updated_at
  before update on gennyoon.ai_prompts
  for each row execute function gennyoon.handle_updated_at();

-- 조회수 증가 함수
create or replace function gennyoon.increment_view_count(post_slug text)
returns void as $$
  update gennyoon.posts
  set view_count = view_count + 1
  where slug = post_slug and status = 'published';
$$ language sql security definer;

-- 스키마 접근 권한
grant usage on schema gennyoon to anon, authenticated, service_role;
grant all on all tables    in schema gennyoon to anon, authenticated, service_role;
grant all on all routines  in schema gennyoon to anon, authenticated, service_role;
grant all on all sequences in schema gennyoon to anon, authenticated, service_role;

-- 이후 생성되는 객체에도 자동 적용 (없으면 마이그레이션 추가 시 권한 다시 막힘)
alter default privileges for role postgres in schema gennyoon
  grant all on tables    to anon, authenticated, service_role;
alter default privileges for role postgres in schema gennyoon
  grant all on routines  to anon, authenticated, service_role;
alter default privileges for role postgres in schema gennyoon
  grant all on sequences to anon, authenticated, service_role;

-- PostgREST search_path 설정
alter role authenticator set search_path to gennyoon, public;

-- RLS 활성화
alter table gennyoon.posts enable row level security;
alter table gennyoon.categories enable row level security;
alter table gennyoon.tags enable row level security;
alter table gennyoon.post_tags enable row level security;
alter table gennyoon.cross_posts enable row level security;
alter table gennyoon.ai_prompts enable row level security;
alter table gennyoon.drafts enable row level security;

-- RLS 정책: 퍼블릭 읽기
create policy "published posts are public"
  on gennyoon.posts for select
  using (status = 'published');

create policy "categories are public"
  on gennyoon.categories for select
  using (true);

create policy "tags are public"
  on gennyoon.tags for select
  using (true);

create policy "post_tags are public"
  on gennyoon.post_tags for select
  using (true);

-- RLS 정책: 인증된 사용자 전체 권한
create policy "auth users manage posts"
  on gennyoon.posts for all
  using (auth.role() = 'authenticated');

create policy "auth users manage categories"
  on gennyoon.categories for all
  using (auth.role() = 'authenticated');

create policy "auth users manage tags"
  on gennyoon.tags for all
  using (auth.role() = 'authenticated');

create policy "auth users manage ai_prompts"
  on gennyoon.ai_prompts for all
  using (auth.role() = 'authenticated');

create policy "auth users manage drafts"
  on gennyoon.drafts for all
  using (auth.role() = 'authenticated');

create policy "auth users manage cross_posts"
  on gennyoon.cross_posts for all
  using (auth.role() = 'authenticated');

-- 기본 카테고리 데이터
insert into gennyoon.categories (name, slug, color, emoji) values
  ('AI 도구', 'ai-tools', '#6366f1', '🤖'),
  ('개발 로그', 'dev-log', '#0ea5e9', '💻'),
  ('AI 개발팀', 'ai-dev-team', '#8b5cf6', '⚙️'),
  ('AI 마케팅', 'ai-marketing', '#f59e0b', '📢'),
  ('AI 영상', 'ai-video', '#ec4899', '🎬'),
  ('노마드 라이프', 'nomad-life', '#10b981', '✈️');

-- 기본 AI 프롬프트 데이터
insert into gennyoon.ai_prompts (category_slug, category_name, system_prompt) values
('nomad-life', '노마드 라이프',
'당신은 전직 CTO이자 AI 노마드인 GennYoon의 블로그 편집자입니다.

GennYoon 소개:
- 전직 CTO, 현재 1인 AI 개발회사 운영
- 세계 각지 카페에서 AI와 함께 개발하는 노마드
- 솔직하고 현실적인 성격, 게으른 개발자들에 질린 경험 있음

글쓰기 스타일:
- 독자에게 말 걸듯 친근하고 솔직하게
- 좋은 것만 쓰지 않음, 힘든 것도 그대로
- 약간의 유머와 자기비하 허용
- 너무 길지 않게, 핵심만, 읽기 쉽게

출력 형식 (반드시 이 순서로):
## 제목 후보
1. [제목1]
2. [제목2]
3. [제목3]

## 본문
[마크다운 본문, 이미지는 [이미지: 설명] 형태로 위치 표시]

## SEO
- description: [100자 이내]
- 태그: [tag1, tag2, tag3, tag4, tag5]'),

('ai-tools', 'AI 도구',
'당신은 전직 CTO이자 AI 설계자인 GennYoon의 기술 블로그 편집자입니다.

독자: AI/개발에 관심 있는 한국 개발자, IT 종사자

글쓰기 방향:
- 실제 써본 경험 기반, 과장 없이 솔직하게
- "이래서 좋더라, 이건 아쉽더라" 균형 잡힌 시각
- 코드/스크린샷 있으면 맥락 설명 추가
- 비슷한 툴과 간단 비교 포함
- 영어 기술 용어는 그대로 사용

출력 형식:
## 제목 후보
1. [제목1]
2. [제목2]
3. [제목3]

## 본문
[마크다운 본문]

## SEO
- description: [100자 이내]
- 태그: [tag1, tag2, tag3, tag4, tag5]');

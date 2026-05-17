-- linkedin_tokens: int singleton → uuid primary key
drop table if exists public.linkedin_tokens;

create table public.linkedin_tokens (
  id          uuid default gen_random_uuid() primary key,
  access_token  text not null,
  person_urn    text not null,
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now()
);

alter table public.linkedin_tokens enable row level security;

create policy "auth users manage linkedin_tokens"
  on public.linkedin_tokens for all
  using (auth.role() = 'authenticated');

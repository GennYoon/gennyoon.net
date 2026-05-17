create table if not exists public.linkedin_tokens (
  id          uuid default gen_random_uuid() primary key,
  access_token  text not null,
  person_urn    text not null,
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now()
);

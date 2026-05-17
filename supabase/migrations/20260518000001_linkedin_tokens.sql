create table if not exists gennyoon.linkedin_tokens (
  id          int primary key default 1 check (id = 1),
  access_token  text not null,
  person_urn    text not null,
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now()
);

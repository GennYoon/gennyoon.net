-- Superseded: all tables moved to gennyoon schema (see 20260321000000_init.sql)
DROP TABLE IF EXISTS public.drafts CASCADE;
DROP TABLE IF EXISTS public.cross_posts CASCADE;
DROP TABLE IF EXISTS public.post_tags CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.ai_prompts CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.increment_view_count(text) CASCADE;

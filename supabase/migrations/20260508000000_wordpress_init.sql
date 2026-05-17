-- Wordpress-Blogs (Webchemist Core) — wordpress schema 초기화.
--
-- 5개 niche 양산 수익형 블로그 자동화 — 키워드 누적, 글 초안 큐, 사이트 메타.
-- Blog (gennyoon.net) prod Supabase 프로젝트 (qvqkgoujawzhlaageswd) 의 별도 schema.
-- public 과 격리. RLS 활성 (authenticated 만 접근).

CREATE SCHEMA IF NOT EXISTS wordpress;

-- ── sites — 5개 사이트 메타 ────────────────────────────────
-- 각 사이트의 niche, 도메인, WP REST API 정보, AdSense 상태, 누적 수익 추적.
CREATE TABLE IF NOT EXISTS wordpress.sites (
    id                  TEXT PRIMARY KEY,                  -- 'site1' .. 'site5'
    niche               TEXT NOT NULL,                     -- 'anyang-local' 등
    name                TEXT NOT NULL,                     -- '안양 로컬 가이드'
    domain              TEXT,                              -- 도메인 발급 후 채움
    wp_url              TEXT,                              -- WP REST API base (https://.../wp-json)
    wp_user             TEXT,                              -- WP user
    wp_app_password     TEXT,                              -- WP application password (서버 측만 사용)
    adsense_pub_id      TEXT,                              -- ca-pub-XXXX
    adsense_status      TEXT NOT NULL DEFAULT 'not_applied',  -- not_applied | pending | approved | rejected
    post_count          BIGINT NOT NULL DEFAULT 0,
    monthly_revenue_krw NUMERIC(12, 0) NOT NULL DEFAULT 0,
    enabled             BOOLEAN NOT NULL DEFAULT TRUE,
    metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wp_sites_niche
    ON wordpress.sites(niche) WHERE enabled = TRUE;

-- ── keywords — 트렌드 키워드 큐 ───────────────────────────────
-- GLM web_search 또는 네이버 데이터랩 fetch 결과. 사용자가 priority 부여 후 generate 큐로.
CREATE TABLE IF NOT EXISTS wordpress.keywords (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    niche                 TEXT NOT NULL,
    keyword               TEXT NOT NULL,
    intent                TEXT,                            -- 'visit' | 'plan' | 'event' | 'admin' | 'compare' | 'how-to'
    estimated_volume      INTEGER,                         -- 월간 검색량 추정
    estimated_competition TEXT,                            -- 'low' | 'mid' | 'high'
    source                TEXT NOT NULL,                   -- 'glm-trend' | 'naver-datalab' | 'manual'
    status                TEXT NOT NULL DEFAULT 'pending', -- pending | queued | used | archived
    priority              INTEGER NOT NULL DEFAULT 0,      -- 사용자 부여 (높을수록 먼저 generate)
    metadata              JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(niche, keyword)
);

CREATE INDEX IF NOT EXISTS idx_wp_keywords_niche_status
    ON wordpress.keywords(niche, status);
CREATE INDEX IF NOT EXISTS idx_wp_keywords_priority
    ON wordpress.keywords(status, priority DESC, created_at ASC) WHERE status = 'queued';

-- ── drafts — 글 초안 + 검수 + 게시 추적 ─────────────────────
CREATE TABLE IF NOT EXISTS wordpress.drafts (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    niche                 TEXT NOT NULL,
    site_id               TEXT REFERENCES wordpress.sites(id) ON DELETE SET NULL,
    keyword_id            UUID REFERENCES wordpress.keywords(id) ON DELETE SET NULL,
    title                 TEXT NOT NULL,
    body_md               TEXT NOT NULL,                   -- markdown 본문
    seo_description       TEXT,
    seo_title             TEXT,
    tags                  JSONB NOT NULL DEFAULT '[]'::jsonb,  -- string array
    status                TEXT NOT NULL DEFAULT 'draft',   -- draft | review | approved | published | rejected
    llm_model             TEXT,                            -- 'glm-4-plus' 등
    llm_cost_usd          NUMERIC(10, 6),                  -- API 비용 추적
    review_notes          TEXT,                            -- 검수자 메모
    wp_post_id            BIGINT,                          -- WP 게시 후 ID
    wp_url                TEXT,                            -- 게시된 URL
    published_at          TIMESTAMPTZ,
    metadata              JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wp_drafts_niche_status
    ON wordpress.drafts(niche, status);
CREATE INDEX IF NOT EXISTS idx_wp_drafts_site
    ON wordpress.drafts(site_id, status);
CREATE INDEX IF NOT EXISTS idx_wp_drafts_review_queue
    ON wordpress.drafts(status, created_at ASC) WHERE status IN ('draft', 'review');

-- ── revenue_log — 일별 사이트별 수익 누적 ───────────────────
-- AdSense 일일 estimated earnings. seo-tracker 가 매일 1회 sync.
CREATE TABLE IF NOT EXISTS wordpress.revenue_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id             TEXT NOT NULL REFERENCES wordpress.sites(id) ON DELETE CASCADE,
    date                DATE NOT NULL,
    page_views          BIGINT NOT NULL DEFAULT 0,
    clicks              BIGINT NOT NULL DEFAULT 0,
    estimated_usd       NUMERIC(10, 4),
    estimated_krw       NUMERIC(12, 0),
    raw_response        JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(site_id, date)
);

CREATE INDEX IF NOT EXISTS idx_wp_revenue_site_date
    ON wordpress.revenue_log(site_id, date DESC);

-- ── 권한 + RLS ────────────────────────────────────────────
GRANT USAGE ON SCHEMA wordpress TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA wordpress TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA wordpress TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA wordpress
    GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA wordpress
    GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- RLS — authenticated 사용자만 (Blog 의 public 정책과 동일 패턴)
ALTER TABLE wordpress.sites       ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordpress.keywords    ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordpress.drafts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordpress.revenue_log ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['sites', 'keywords', 'drafts', 'revenue_log']
    LOOP
        EXECUTE format($f$
            DROP POLICY IF EXISTS "authenticated all" ON wordpress.%1$I;
            CREATE POLICY "authenticated all"
                ON wordpress.%1$I
                FOR ALL
                TO authenticated
                USING (true)
                WITH CHECK (true);
        $f$, t);
    END LOOP;
END $$;

-- ── updated_at 자동 갱신 트리거 ────────────────────────────
CREATE OR REPLACE FUNCTION wordpress.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wp_sites_updated_at
    BEFORE UPDATE ON wordpress.sites
    FOR EACH ROW EXECUTE FUNCTION wordpress.handle_updated_at();
CREATE TRIGGER wp_keywords_updated_at
    BEFORE UPDATE ON wordpress.keywords
    FOR EACH ROW EXECUTE FUNCTION wordpress.handle_updated_at();
CREATE TRIGGER wp_drafts_updated_at
    BEFORE UPDATE ON wordpress.drafts
    FOR EACH ROW EXECUTE FUNCTION wordpress.handle_updated_at();

-- ── 5개 사이트 시드 ────────────────────────────────────────
-- 도메인은 발급 후 UPDATE. wp_url / wp_app_password 는 WP install 후 채움.
INSERT INTO wordpress.sites (id, niche, name) VALUES
    ('site1', 'location',         '안양/의왕 로컬 가이드'),
    ('site2', 'stocks',           '주식 정보 (양산형)'),
    ('site3', 'real-estate',      '부동산 정보 (양산형)'),
    ('site4', 'gov-benefits',     '정부지원 / 혜택'),
    ('site5', 'parenting-gov',    '자녀/육아 정부지원')
ON CONFLICT (id) DO NOTHING;

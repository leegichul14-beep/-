-- ============================================================
-- 컨텐츠 대시보드 - Supabase DDL v1.0
-- 이랜드리테일 상품본부 여성부문
-- ============================================================

-- UUID 확장
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. 유통사 (distributors)
-- ============================================================
CREATE TABLE distributors (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,           -- 현대, 롯데, 신세계, AK, 갤러리아
  type        TEXT NOT NULL DEFAULT 'offline' CHECK (type IN ('offline', 'online')),
  short_code  TEXT UNIQUE,                    -- HY, LT, SS, AK, GA, MS, ZZ, 29, WC
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. 점포 (stores)
-- ============================================================
CREATE TABLE stores (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  distributor_id  UUID NOT NULL REFERENCES distributors(id) ON DELETE RESTRICT,
  name            TEXT NOT NULL,              -- 판교점, 본점, 강남점
  full_name       TEXT NOT NULL,              -- 현대 판교점
  region          TEXT,                       -- 서울, 경기, 부산 등
  store_type      TEXT CHECK (store_type IN ('백화점', '아울렛', '몰', '온라인')),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (distributor_id, name)
);

-- ============================================================
-- 3. 카테고리 (categories) - BCD 기준
-- ============================================================
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,           -- 영여성, 여성, 잡화, 스포츠/아웃도어 등
  group_name  TEXT,                           -- 상위 그룹 (여성, 남성, 공용 등)
  sort_order  INT DEFAULT 0,
  color_hex   TEXT DEFAULT '#6B7280',         -- 대시보드 차트 색상
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. 브랜드/컨텐츠 (brands)
-- ============================================================
CREATE TABLE brands (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL UNIQUE,       -- 마뗑킴, 마르디메크르디 등
  category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand_grade     TEXT CHECK (brand_grade IN ('A', 'B', 'C', 'D', 'Unknown')),
  origin          TEXT DEFAULT 'domestic' CHECK (origin IN ('domestic', 'foreign')),
  -- 온라인 채널 URL (입점 확인용)
  url_musinsa     TEXT,                       -- 무신사 브랜드 페이지 URL
  url_zigzag      TEXT,                       -- 지그재그 브랜드 페이지 URL
  url_29cm        TEXT,                       -- 29CM 브랜드 페이지 URL
  url_wconcept    TEXT,                       -- W컨셉 브랜드 페이지 URL
  -- 온라인 입점 여부 (URL 존재 기반으로 자동 계산 가능하나 명시적 관리)
  on_musinsa      BOOLEAN DEFAULT FALSE,
  on_zigzag       BOOLEAN DEFAULT FALSE,
  on_29cm         BOOLEAN DEFAULT FALSE,
  on_wconcept     BOOLEAN DEFAULT FALSE,
  memo            TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. 입점 현황 (listings) - 핵심 테이블
-- start_date / end_date → 기간별 분석의 근거
-- ============================================================
CREATE TABLE listings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
  brand_id        UUID NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
  start_date      DATE NOT NULL,              -- 입점일
  end_date        DATE,                       -- 철수일 (NULL = 현재 운영 중)
  floor           TEXT,                       -- B1, 1F, 2F 등
  zone            TEXT,                       -- 존 정보
  area_sqm        NUMERIC(8,2),              -- 매장 면적 (㎡)
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'closed', 'planned', 'unmapped')),
  source          TEXT DEFAULT 'manual',      -- manual / excel_import / crawl
  memo            TEXT,
  mapped_by       UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  -- 동일 점포에 동일 브랜드가 동시에 두 개의 active 행이 생기지 않도록
  EXCLUDE USING gist (
    store_id WITH =,
    brand_id WITH =,
    daterange(start_date, COALESCE(end_date, '9999-12-31'::date)) WITH &&
  ) WHERE (status = 'active')
);

-- ============================================================
-- 6. 사용자 프로필 (profiles) - Supabase Auth 연동
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'md' CHECK (role IN ('leader', 'md')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. 변경 이력 (listing_history) - 감사 로그
-- ============================================================
CREATE TABLE listing_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  changed_by  UUID REFERENCES auth.users(id),
  action      TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
  old_data    JSONB,
  new_data    JSONB,
  changed_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 인덱스
-- ============================================================
CREATE INDEX idx_listings_store      ON listings(store_id);
CREATE INDEX idx_listings_brand      ON listings(brand_id);
CREATE INDEX idx_listings_status     ON listings(status);
CREATE INDEX idx_listings_start_date ON listings(start_date);
CREATE INDEX idx_listings_end_date   ON listings(end_date);
CREATE INDEX idx_brands_category     ON brands(category_id);
CREATE INDEX idx_stores_distributor  ON stores(distributor_id);

-- ============================================================
-- updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- listing_history 자동 기록 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION log_listing_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO listing_history(listing_id, changed_by, action, new_data)
    VALUES (NEW.id, auth.uid(), 'insert', to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO listing_history(listing_id, changed_by, action, old_data, new_data)
    VALUES (NEW.id, auth.uid(), 'update', to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO listing_history(listing_id, changed_by, action, old_data)
    VALUES (OLD.id, auth.uid(), 'delete', to_jsonb(OLD));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_listings_history
  AFTER INSERT OR UPDATE OR DELETE ON listings
  FOR EACH ROW EXECUTE FUNCTION log_listing_change();

-- ============================================================
-- 프로필 자동 생성 (신규 auth.users 등록 시)
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles(id, name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 'md');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE distributors     ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands           ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_history  ENABLE ROW LEVEL SECURITY;

-- 전체 조회: 로그인한 모든 사용자
CREATE POLICY "authenticated_read_all" ON distributors  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "authenticated_read_all" ON stores        FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "authenticated_read_all" ON categories    FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "authenticated_read_all" ON brands        FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "authenticated_read_all" ON listings      FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "authenticated_read_all" ON listing_history FOR SELECT TO authenticated USING (TRUE);

-- 본인 프로필만 조회
CREATE POLICY "own_profile_read" ON profiles FOR SELECT TO authenticated USING (id = auth.uid());

-- 데이터 수정: leader만
CREATE POLICY "leader_insert_brands"   ON brands    FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'leader')
);
CREATE POLICY "leader_update_brands"   ON brands    FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'leader')
);
CREATE POLICY "leader_insert_listings" ON listings  FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'leader')
);
CREATE POLICY "leader_update_listings" ON listings  FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'leader')
);

-- ============================================================
-- 기준 데이터 (마스터 데이터)
-- ============================================================

-- 오프라인 유통사
INSERT INTO distributors (name, type, short_code, sort_order) VALUES
  ('현대',   'offline', 'HY', 1),
  ('롯데',   'offline', 'LT', 2),
  ('신세계', 'offline', 'SS', 3),
  ('AK',     'offline', 'AK', 4),
  ('갤러리아','offline','GA', 5);

-- 온라인 플랫폼 (stores 테이블에 단일 점포로 등록)
INSERT INTO distributors (name, type, short_code, sort_order) VALUES
  ('무신사',   'online', 'MS', 10),
  ('지그재그', 'online', 'ZZ', 11),
  ('29CM',     'online', '29', 12),
  ('W컨셉',   'online', 'WC', 13);

-- BCD 카테고리 (여성부문 중심)
INSERT INTO categories (name, group_name, sort_order, color_hex) VALUES
  ('영여성',         '여성', 1,  '#EC4899'),
  ('여성',           '여성', 2,  '#F97316'),
  ('컨템포러리',     '여성', 3,  '#8B5CF6'),
  ('잡화',           '잡화', 4,  '#06B6D4'),
  ('슈즈',           '잡화', 5,  '#84CC16'),
  ('스포츠/아웃도어','스포츠',6, '#10B981'),
  ('남성',           '남성', 7,  '#3B82F6'),
  ('아동',           '아동', 8,  '#F59E0B'),
  ('라이프/홈',      '라이프',9, '#6B7280'),
  ('F&B',            'F&B', 10, '#EF4444'),
  ('기타',           '기타', 11, '#9CA3AF');

-- ============================================================
-- 유용한 뷰 (View)
-- ============================================================

-- 현재 활성 입점 현황 (현재 날짜 기준)
CREATE VIEW v_active_listings AS
SELECT
  l.id,
  d.name        AS distributor_name,
  d.type        AS channel_type,
  s.full_name   AS store_name,
  s.region,
  s.store_type,
  b.name        AS brand_name,
  b.brand_grade,
  c.name        AS category_name,
  c.group_name  AS category_group,
  l.start_date,
  l.floor,
  l.area_sqm,
  l.status,
  -- 온라인 채널 입점 현황
  b.on_musinsa,
  b.on_zigzag,
  b.on_29cm,
  b.on_wconcept
FROM listings l
JOIN stores     s ON l.store_id = s.id
JOIN distributors d ON s.distributor_id = d.id
JOIN brands     b ON l.brand_id = b.id
LEFT JOIN categories c ON b.category_id = c.id
WHERE l.status = 'active'
  AND l.start_date <= CURRENT_DATE
  AND (l.end_date IS NULL OR l.end_date >= CURRENT_DATE);

-- 점포별 카테고리 비중 집계
CREATE VIEW v_store_category_ratio AS
SELECT
  s.id          AS store_id,
  s.full_name   AS store_name,
  d.name        AS distributor_name,
  c.name        AS category_name,
  COUNT(*)      AS brand_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY s.id), 1) AS ratio_pct
FROM listings l
JOIN stores      s ON l.store_id = s.id
JOIN distributors d ON s.distributor_id = d.id
JOIN brands      b ON l.brand_id = b.id
LEFT JOIN categories c ON b.category_id = c.id
WHERE l.status = 'active'
  AND (l.end_date IS NULL OR l.end_date >= CURRENT_DATE)
GROUP BY s.id, s.full_name, d.name, c.name;

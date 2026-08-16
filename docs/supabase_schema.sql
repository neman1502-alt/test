-- ==========================================================================
-- 🗄️ 초등부 교회학교 새신자 등록 시스템 - Supabase SQL Schema
-- Supabase 대시보드 -> SQL Editor -> New Query에 붙여넣고 [Run]을 누르세요.
-- ==========================================================================

-- 1. 새신자 등록 테이블 생성
CREATE TABLE IF NOT EXISTS public.newcomers (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    child_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    grade TEXT NOT NULL,
    school_name TEXT,
    avatar TEXT DEFAULT '🦁',
    parent_name TEXT NOT NULL,
    parent_relation TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    child_phone TEXT,
    address TEXT,
    bus_usage TEXT DEFAULT '직접 등교',
    guide_person TEXT,
    church_exp TEXT DEFAULT '처음 교회에 옴',
    baptism TEXT DEFAULT '미세례',
    talents TEXT[] DEFAULT '{}',
    prayer_request TEXT,
    signature TEXT
);

-- 2. 검색 및 정렬 성능을 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_newcomers_created_at ON public.newcomers (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newcomers_grade ON public.newcomers (grade);
CREATE INDEX IF NOT EXISTS idx_newcomers_child_name ON public.newcomers (child_name);

-- 3. Row Level Security (RLS) 활성화
ALTER TABLE public.newcomers ENABLE ROW LEVEL SECURITY;

-- 4. 보안 정책 (Policies) 설정
-- (1) 누구나(익명 포함) 새신자 등록카드 제출 가능 (INSERT)
CREATE POLICY "Allow public insert to newcomers"
ON public.newcomers
FOR INSERT
TO public
WITH CHECK (true);

-- (2) 누구나(익명 포함) 등록 명단 조회 가능 (SELECT)
CREATE POLICY "Allow public read to newcomers"
ON public.newcomers
FOR SELECT
TO public
USING (true);

-- (3) 누구나(익명 포함) 등록 명단 삭제 가능 (DELETE)
CREATE POLICY "Allow public delete to newcomers"
ON public.newcomers
FOR DELETE
TO public
USING (true);

-- 5. 실시간 동기화(Realtime) 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.newcomers;

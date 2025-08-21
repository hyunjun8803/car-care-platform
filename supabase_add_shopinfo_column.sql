-- Supabase users 테이블에 shopInfo 컬럼 추가
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1. shopInfo 컬럼 추가 (JSONB 타입)
ALTER TABLE users ADD COLUMN IF NOT EXISTS "shopInfo" JSONB;

-- 2. shopInfo 상태 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_users_shop_status ON users(("shopInfo"->>'status'));

-- 3. 추가된 컬럼 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'shopInfo';

-- 4. 현재 테이블 구조 확인
\d users;
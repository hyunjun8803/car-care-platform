-- Supabase에서 실행할 사용자 테이블 생성 SQL

-- 기존 테이블이 있다면 삭제 (주의: 데이터 손실)
-- DROP TABLE IF EXISTS users CASCADE;

-- 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  phone VARCHAR,
  "userType" VARCHAR NOT NULL DEFAULT 'CUSTOMER',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users("createdAt");
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users("userType");

-- RLS (Row Level Security) 정책 설정 (보안)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 사용자가 자신의 데이터만 볼 수 있도록 하는 정책 (필요시 사용)
-- CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id);
-- CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id);

-- 테이블이 성공적으로 생성되었는지 확인
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
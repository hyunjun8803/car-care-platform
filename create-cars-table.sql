-- Supabase cars 테이블 생성 SQL
-- 이 SQL을 Supabase 대시보드의 SQL Editor에서 실행하세요

-- cars 테이블 생성
CREATE TABLE IF NOT EXISTS public.cars (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    "licensePlate" TEXT NOT NULL UNIQUE,
    mileage INTEGER NOT NULL DEFAULT 0,
    "fuelType" TEXT NOT NULL,
    "engineSize" TEXT,
    color TEXT,
    "lastMaintenance" TEXT,
    "nextMaintenance" TEXT,
    "totalCost" INTEGER NOT NULL DEFAULT 0,
    "maintenanceCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_cars_user_id ON public.cars("userId");
CREATE INDEX IF NOT EXISTS idx_cars_license_plate ON public.cars("licensePlate");
CREATE INDEX IF NOT EXISTS idx_cars_created_at ON public.cars("createdAt");

-- 트리거 함수 생성 (updatedAt 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 적용
DROP TRIGGER IF EXISTS update_cars_updated_at ON public.cars;
CREATE TRIGGER update_cars_updated_at
    BEFORE UPDATE ON public.cars
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 정책 설정 (옵션)
-- ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

-- 사용자별 데이터 접근 정책 (필요시 사용)
-- CREATE POLICY "Users can view own cars" ON public.cars
--     FOR SELECT USING (auth.uid()::text = "userId");

-- CREATE POLICY "Users can insert own cars" ON public.cars
--     FOR INSERT WITH CHECK (auth.uid()::text = "userId");

-- CREATE POLICY "Users can update own cars" ON public.cars
--     FOR UPDATE USING (auth.uid()::text = "userId");

-- CREATE POLICY "Users can delete own cars" ON public.cars
--     FOR DELETE USING (auth.uid()::text = "userId");

-- 테이블 생성 완료 확인
SELECT 'cars 테이블 생성 완료' AS status;
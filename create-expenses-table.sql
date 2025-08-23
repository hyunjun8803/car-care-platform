-- Supabase expenses 테이블 생성 SQL
-- 이 SQL을 Supabase 대시보드의 SQL Editor에서 실행하세요

-- expenses 테이블 생성
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    mileage INTEGER,
    "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
    "receiptImageUrl" TEXT,
    tags TEXT,
    notes TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses("userId");
CREATE INDEX IF NOT EXISTS idx_expenses_car_id ON public.expenses("carId");
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses("createdAt");

-- 트리거 함수 생성 (updatedAt 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 적용
DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 정책 설정 (옵션)
-- ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 사용자별 데이터 접근 정책 (필요시 사용)
-- CREATE POLICY "Users can view own expenses" ON public.expenses
--     FOR SELECT USING (auth.uid()::text = "userId");

-- CREATE POLICY "Users can insert own expenses" ON public.expenses
--     FOR INSERT WITH CHECK (auth.uid()::text = "userId");

-- CREATE POLICY "Users can update own expenses" ON public.expenses
--     FOR UPDATE USING (auth.uid()::text = "userId");

-- CREATE POLICY "Users can delete own expenses" ON public.expenses
--     FOR DELETE USING (auth.uid()::text = "userId");

-- 테이블 생성 완료 확인
SELECT 'expenses 테이블 생성 완료' AS status;
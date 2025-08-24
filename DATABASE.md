# 데이터베이스 스키마

현재 Supabase에서 사용 중인 테이블들과 설정 방법

## 🗄 테이블 구조

### 1. Cars 테이블
사용자의 차량 정보를 저장하는 테이블

```sql
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
```

**인덱스:**
- `idx_cars_user_id` on `"userId"`
- `idx_cars_license_plate` on `"licensePlate"`
- `idx_cars_created_at` on `"createdAt"`

### 2. Expenses 테이블
차량 관련 지출을 기록하는 테이블

```sql
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
```

**인덱스:**
- `idx_expenses_user_id` on `"userId"`
- `idx_expenses_car_id` on `"carId"`
- `idx_expenses_category` on `category`
- `idx_expenses_date` on `date`
- `idx_expenses_created_at` on `"createdAt"`

## 🚀 테이블 생성 방법

### 1. Supabase 대시보드에서 생성 (권장)

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. **New query** 버튼 클릭
5. 해당 SQL 파일 내용 복사하여 실행

### 2. API를 통한 자동 생성

프로젝트에 포함된 관리자 API를 사용할 수 있습니다:

```bash
# 차량 테이블 생성
curl -X POST http://localhost:3000/api/admin/create-cars-table

# 차계부 테이블 생성  
curl -X POST http://localhost:3000/api/admin/create-expenses-table
```

## 📊 지원하는 데이터 타입

### 차량 연료 타입
- `GASOLINE` - 휘발유
- `DIESEL` - 경유
- `HYBRID` - 하이브리드
- `ELECTRIC` - 전기
- `LPG` - LPG

### 지출 카테고리
- `FUEL` - 연료
- `MAINTENANCE` - 정비/수리
- `INSURANCE` - 보험
- `TAX` - 세금/등록비
- `PARKING` - 주차비
- `TOLL` - 통행료
- `CARWASH` - 세차
- `ACCESSORIES` - 용품/액세서리
- `RENTAL` - 렌트/리스
- `OTHER` - 기타

### 결제 방법
- `CASH` - 현금
- `CARD` - 카드
- `BANK_TRANSFER` - 계좌이체
- `MOBILE_PAY` - 모바일페이
- `OTHER` - 기타

## 🔒 보안 설정

### Row Level Security (RLS)
현재는 비활성화되어 있지만, 필요시 다음과 같이 설정할 수 있습니다:

```sql
-- RLS 활성화
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 사용자별 데이터 접근 정책
CREATE POLICY "Users can view own cars" ON public.cars
    FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can view own expenses" ON public.expenses  
    FOR SELECT USING (auth.uid()::text = "userId");
```

## 🔄 데이터 마이그레이션

기존 시스템에서 데이터를 가져오는 경우:

1. 기존 데이터를 JSON/CSV 형식으로 내보내기
2. Supabase 대시보드에서 **Table Editor** 사용하여 수동 입력
3. 또는 API를 통한 대량 데이터 입력

## 🧪 테스트 데이터

개발/테스트용 샘플 데이터는 메모리 스토리지에 포함되어 있습니다:

- `src/lib/car-storage.ts` - 차량 테스트 데이터
- `src/lib/expense-storage.ts` - 지출 테스트 데이터

## 📋 백업 및 복원

### 백업
```sql
-- 테이블 데이터 백업
COPY (SELECT * FROM public.cars) TO '/path/to/cars_backup.csv' WITH CSV HEADER;
COPY (SELECT * FROM public.expenses) TO '/path/to/expenses_backup.csv' WITH CSV HEADER;
```

### 복원
Supabase 대시보드의 **Table Editor**에서 CSV 파일을 직접 import 할 수 있습니다.
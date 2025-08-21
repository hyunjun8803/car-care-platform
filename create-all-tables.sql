-- Supabase에서 실행할 전체 테이블 생성 SQL
-- 사용자와 차량 관리를 위한 테이블들

-- 1. 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  phone VARCHAR,
  "userType" VARCHAR NOT NULL DEFAULT 'CUSTOMER',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. 차량 테이블 생성
CREATE TABLE IF NOT EXISTS cars (
  id VARCHAR PRIMARY KEY,
  "userId" VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  brand VARCHAR NOT NULL,
  model VARCHAR NOT NULL,
  year INTEGER NOT NULL,
  "licensePlate" VARCHAR NOT NULL,
  mileage INTEGER NOT NULL DEFAULT 0,
  "fuelType" VARCHAR NOT NULL,
  "engineSize" VARCHAR,
  color VARCHAR,
  "lastMaintenance" TIMESTAMP WITH TIME ZONE,
  "nextMaintenance" TIMESTAMP WITH TIME ZONE,
  "totalCost" INTEGER NOT NULL DEFAULT 0,
  "maintenanceCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- 외래키 제약조건
  CONSTRAINT fk_cars_user_id FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- 3. 인덱스 생성 (성능 향상)
-- Users 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users("createdAt");
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users("userType");

-- Cars 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_cars_user_id ON cars("userId");
CREATE INDEX IF NOT EXISTS idx_cars_license_plate ON cars("licensePlate");
CREATE INDEX IF NOT EXISTS idx_cars_created_at ON cars("createdAt");
CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_fuel_type ON cars("fuelType");

-- 4. 고유 제약조건 추가
CREATE UNIQUE INDEX IF NOT EXISTS idx_cars_license_plate_unique ON cars("licensePlate");

-- 5. 정비 예약 테이블 (미래 사용을 위한 준비)
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR PRIMARY KEY,
  "userId" VARCHAR NOT NULL,
  "carId" VARCHAR NOT NULL,
  "serviceType" VARCHAR NOT NULL,
  "scheduledDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'PENDING',
  "totalCost" INTEGER DEFAULT 0,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- 외래키 제약조건
  CONSTRAINT fk_bookings_user_id FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_car_id FOREIGN KEY ("carId") REFERENCES cars(id) ON DELETE CASCADE
);

-- Bookings 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings("userId");
CREATE INDEX IF NOT EXISTS idx_bookings_car_id ON bookings("carId");
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date ON bookings("scheduledDate");
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings("createdAt");

-- 6. 정비 기록 테이블 (미래 사용을 위한 준비)
CREATE TABLE IF NOT EXISTS maintenance_records (
  id VARCHAR PRIMARY KEY,
  "userId" VARCHAR NOT NULL,
  "carId" VARCHAR NOT NULL,
  "bookingId" VARCHAR,
  "serviceType" VARCHAR NOT NULL,
  "serviceDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  cost INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  "nextServiceMileage" INTEGER,
  "nextServiceDate" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- 외래키 제약조건
  CONSTRAINT fk_maintenance_user_id FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_maintenance_car_id FOREIGN KEY ("carId") REFERENCES cars(id) ON DELETE CASCADE,
  CONSTRAINT fk_maintenance_booking_id FOREIGN KEY ("bookingId") REFERENCES bookings(id) ON DELETE SET NULL
);

-- Maintenance records 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_maintenance_user_id ON maintenance_records("userId");
CREATE INDEX IF NOT EXISTS idx_maintenance_car_id ON maintenance_records("carId");
CREATE INDEX IF NOT EXISTS idx_maintenance_service_date ON maintenance_records("serviceDate");
CREATE INDEX IF NOT EXISTS idx_maintenance_created_at ON maintenance_records("createdAt");

-- 7. 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON maintenance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. 테이블 생성 확인 쿼리
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('users', 'cars', 'bookings', 'maintenance_records')
ORDER BY table_name, ordinal_position;

-- 10. 제약조건 확인 쿼리
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('users', 'cars', 'bookings', 'maintenance_records')
ORDER BY tc.table_name, tc.constraint_type;
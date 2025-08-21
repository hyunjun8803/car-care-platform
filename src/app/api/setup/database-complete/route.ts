import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase가 설정되지 않았습니다. 환경변수를 확인해주세요.',
        message: 'Supabase 연결 정보가 없어 데이터베이스 설정을 확인할 수 없습니다.'
      }, { status: 500 });
    }

    console.log('🔗 전체 데이터베이스 설정 시작...');

    // 현재 테이블 존재 확인
    const { data: existingTables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['users', 'cars', 'bookings', 'maintenance_records']);

    if (checkError) {
      console.error('테이블 확인 중 오류:', checkError);
    }

    return NextResponse.json({
      success: false,
      message: '테이블 생성은 Supabase 대시보드의 SQL Editor에서 수동으로 실행해야 합니다.',
      instruction: 'Supabase 대시보드 → SQL Editor에서 다음 SQL을 실행해주세요.',
      sqlFile: '/create-all-tables.sql',
      sql: `
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

-- 3. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users("createdAt");
CREATE INDEX IF NOT EXISTS idx_cars_user_id ON cars("userId");
CREATE INDEX IF NOT EXISTS idx_cars_license_plate ON cars("licensePlate");
CREATE INDEX IF NOT EXISTS idx_cars_created_at ON cars("createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS idx_cars_license_plate_unique ON cars("licensePlate");

-- 4. 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `,
      existingTables: existingTables || [],
      note: '테이블 생성 후 다시 API를 호출하여 확인해주세요.'
    }, { status: 400 });

  } catch (error) {
    console.error('데이터베이스 설정 오류:', error);
    return NextResponse.json({
      success: false,
      error: '데이터베이스 설정 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase가 설정되지 않았습니다. 환경변수를 확인해주세요.',
        tables: [],
        ready: false
      }, { status: 500 });
    }

    // 모든 테이블 상태 확인
    console.log('📊 데이터베이스 상태 확인 시작...');

    const tableChecks = [];

    // Users 테이블 확인
    try {
      const { count: userCount, error: userError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      tableChecks.push({
        table: 'users',
        exists: !userError,
        count: userCount || 0,
        error: userError?.message
      });
    } catch (error) {
      tableChecks.push({
        table: 'users',
        exists: false,
        count: 0,
        error: error instanceof Error ? error.message : '확인 실패'
      });
    }

    // Cars 테이블 확인
    try {
      const { count: carCount, error: carError } = await supabase
        .from('cars')
        .select('*', { count: 'exact', head: true });
      
      tableChecks.push({
        table: 'cars',
        exists: !carError,
        count: carCount || 0,
        error: carError?.message
      });
    } catch (error) {
      tableChecks.push({
        table: 'cars',
        exists: false,
        count: 0,
        error: error instanceof Error ? error.message : '확인 실패'
      });
    }

    const allTablesExist = tableChecks.every(check => check.exists);

    return NextResponse.json({
      success: allTablesExist,
      message: allTablesExist 
        ? '모든 테이블이 정상적으로 작동합니다.' 
        : '일부 테이블이 누락되었습니다. POST /api/setup/database-complete를 호출하여 SQL을 확인하세요.',
      tables: tableChecks,
      totalUsers: tableChecks.find(t => t.table === 'users')?.count || 0,
      totalCars: tableChecks.find(t => t.table === 'cars')?.count || 0,
      ready: allTablesExist
    });

  } catch (error) {
    console.error('데이터베이스 상태 확인 오류:', error);
    return NextResponse.json({
      success: false,
      error: '데이터베이스 상태 확인 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}
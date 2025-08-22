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
        error: 'Supabase 설정이 누락되었습니다.',
        instructions: 'NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY 환경변수를 확인하세요.'
      }, { status: 500 });
    }

    console.log('=== Supabase cars 테이블 생성 시작 ===');

    // cars 테이블 생성 SQL
    const createTableSQL = `
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
    `;

    // 인덱스 생성 SQL
    const createIndexesSQL = `
      -- 인덱스 추가
      CREATE INDEX IF NOT EXISTS idx_cars_user_id ON public.cars("userId");
      CREATE INDEX IF NOT EXISTS idx_cars_license_plate ON public.cars("licensePlate");
      CREATE INDEX IF NOT EXISTS idx_cars_created_at ON public.cars("createdAt");
    `;

    // 트리거 함수 생성 SQL
    const createTriggerSQL = `
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
    `;

    const results = [];

    // 1. 테이블 생성
    try {
      const { error: tableError } = await supabase.rpc('sql', { query: createTableSQL });
      if (tableError) {
        console.error('테이블 생성 오류:', tableError);
        results.push({ step: 'create_table', success: false, error: tableError.message });
      } else {
        console.log('cars 테이블 생성 성공');
        results.push({ step: 'create_table', success: true });
      }
    } catch (error) {
      console.error('테이블 생성 실패:', error);
      results.push({ step: 'create_table', success: false, error: error instanceof Error ? error.message : String(error) });
    }

    // 2. 인덱스 생성
    try {
      const { error: indexError } = await supabase.rpc('sql', { query: createIndexesSQL });
      if (indexError) {
        console.error('인덱스 생성 오류:', indexError);
        results.push({ step: 'create_indexes', success: false, error: indexError.message });
      } else {
        console.log('인덱스 생성 성공');
        results.push({ step: 'create_indexes', success: true });
      }
    } catch (error) {
      console.error('인덱스 생성 실패:', error);
      results.push({ step: 'create_indexes', success: false, error: error instanceof Error ? error.message : String(error) });
    }

    // 3. 트리거 생성
    try {
      const { error: triggerError } = await supabase.rpc('sql', { query: createTriggerSQL });
      if (triggerError) {
        console.error('트리거 생성 오류:', triggerError);
        results.push({ step: 'create_trigger', success: false, error: triggerError.message });
      } else {
        console.log('트리거 생성 성공');
        results.push({ step: 'create_trigger', success: true });
      }
    } catch (error) {
      console.error('트리거 생성 실패:', error);
      results.push({ step: 'create_trigger', success: false, error: error instanceof Error ? error.message : String(error) });
    }

    // 4. 테이블 생성 확인
    let tableExists = false;
    try {
      const { error: testError } = await supabase
        .from('cars')
        .select('count')
        .limit(1);
      
      tableExists = !testError;
      results.push({ step: 'verify_table', success: tableExists, error: testError?.message });
    } catch (error) {
      results.push({ step: 'verify_table', success: false, error: error instanceof Error ? error.message : String(error) });
    }

    const allSuccessful = results.every(r => r.success);

    return NextResponse.json({
      success: allSuccessful,
      message: allSuccessful ? 'cars 테이블이 성공적으로 생성되었습니다!' : 'cars 테이블 생성 중 일부 오류가 발생했습니다.',
      results,
      tableExists,
      nextStep: allSuccessful ? '이제 차량 등록이 Supabase에 영구 저장됩니다.' : 'Supabase 대시보드에서 수동으로 create-cars-table.sql을 실행하세요.',
      manualSQL: allSuccessful ? null : 'create-cars-table.sql 파일을 확인하세요.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('cars 테이블 생성 실패:', error);
    return NextResponse.json({
      success: false,
      error: 'cars 테이블 생성 실패',
      details: error instanceof Error ? error.message : String(error),
      suggestion: 'Supabase 대시보드에서 create-cars-table.sql 파일의 SQL을 수동으로 실행하세요.'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase 설정이 누락되었습니다.'
      }, { status: 500 });
    }

    // cars 테이블 존재 확인
    let tableExists = false;
    let tableError = null;
    
    try {
      const { error } = await supabase
        .from('cars')
        .select('count')
        .limit(1);
      
      tableExists = !error;
      if (error) {
        tableError = error.message;
      }
    } catch (error) {
      tableError = error instanceof Error ? error.message : String(error);
    }

    return NextResponse.json({
      success: true,
      tableExists,
      tableError,
      message: tableExists ? 'cars 테이블이 존재합니다.' : 'cars 테이블이 존재하지 않습니다.',
      action: tableExists ? '정상적으로 차량 데이터를 저장할 수 있습니다.' : 'POST 요청으로 테이블을 생성하거나 Supabase 대시보드에서 수동 생성하세요.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('테이블 확인 오류:', error);
    return NextResponse.json({
      success: false,
      error: '테이블 확인 실패',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
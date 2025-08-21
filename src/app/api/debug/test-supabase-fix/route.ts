import { NextRequest, NextResponse } from 'next/server';
import { supabaseUserStorage } from '@/lib/supabase-storage';

export async function GET(request: NextRequest) {
  try {
    // Supabase 테이블 구조 확인 시도
    console.log('Supabase 테이블 구조 확인 중...');
    
    const testResult = await supabaseUserStorage.createTable();
    
    return NextResponse.json({
      success: true,
      message: 'Supabase 테이블 구조 확인 완료',
      tableExists: testResult,
      instructions: {
        step1: 'Supabase 대시보드 → SQL Editor로 이동',
        step2: 'supabase_add_shopinfo_column.sql 파일의 SQL 실행',
        step3: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS "shopInfo" JSONB;',
        step4: 'CREATE INDEX IF NOT EXISTS idx_users_shop_status ON users(("shopInfo"->>\'status\'));',
        step5: '테스트 정비소 다시 등록하여 확인'
      },
      nextTest: '/api/debug/test-shop-register'
    });
    
  } catch (error) {
    console.error('Supabase 테이블 확인 오류:', error);
    return NextResponse.json({
      success: false,
      error: '테이블 확인 실패',
      details: error instanceof Error ? error.message : String(error),
      sqlToRun: {
        addColumn: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS "shopInfo" JSONB;',
        addIndex: 'CREATE INDEX IF NOT EXISTS idx_users_shop_status ON users(("shopInfo"->>\'status\'));'
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // shopInfo 컬럼이 추가된 후 테스트 정비소 생성
    const testShopData = {
      name: 'Supabase 테스트 정비소',
      email: `supabase-test-${Date.now()}@example.com`,
      password: 'hashedPassword123',
      phone: '010-1234-5678',
      userType: 'SHOP_OWNER',
      shopInfo: {
        shopName: 'Supabase 테스트 정비소',
        businessNumber: '123-45-67890',
        address: '서울시 강남구 테스트로 123',
        description: 'Supabase 연동 테스트용 정비소입니다',
        businessLicenseUrl: 'test-license.jpg',
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }
    };

    console.log('Supabase에 테스트 정비소 생성 시도...');
    const newShop = await supabaseUserStorage.create(testShopData);

    return NextResponse.json({
      success: true,
      message: 'Supabase에 정비소 생성 성공!',
      shop: {
        id: newShop.id,
        email: newShop.email,
        shopName: newShop.shopInfo?.shopName,
        status: newShop.shopInfo?.status
      },
      next: '이제 /admin 페이지에서 승인 대기 정비소 1개가 표시되어야 합니다.'
    });

  } catch (error) {
    console.error('Supabase 정비소 생성 오류:', error);
    return NextResponse.json({
      success: false,
      error: 'Supabase 정비소 생성 실패',
      details: error instanceof Error ? error.message : String(error),
      suggestion: 'shopInfo 컬럼이 아직 추가되지 않았을 수 있습니다. GET 요청으로 SQL을 확인하세요.'
    }, { status: 500 });
  }
}
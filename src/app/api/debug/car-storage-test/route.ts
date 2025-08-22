import { NextRequest, NextResponse } from 'next/server';
import { supabaseCarStorage } from '@/lib/supabase-car-storage';
import { carMemoryStorage } from '@/lib/car-storage';

export async function GET(request: NextRequest) {
  try {
    console.log('=== 차량 저장소 테스트 시작 ===');

    // Supabase 연결 테스트
    const supabaseConnected = await supabaseCarStorage.testConnection();
    console.log('Supabase 연결 상태:', supabaseConnected);

    // 테스트 사용자 ID
    const testUserId = 'user_1755512211196_jo3bano3rmi'; // hyunjun2@naver.com

    // Supabase에서 차량 조회
    let supabaseCars = [];
    let supabaseError = null;
    try {
      supabaseCars = await supabaseCarStorage.findByUserId(testUserId);
      console.log('Supabase 차량 조회 성공:', supabaseCars.length, '대');
    } catch (error) {
      supabaseError = error instanceof Error ? error.message : String(error);
      console.error('Supabase 차량 조회 실패:', supabaseError);
    }

    // 메모리에서 차량 조회
    let memoryCars = [];
    let memoryError = null;
    try {
      memoryCars = await carMemoryStorage.findByUserId(testUserId);
      console.log('메모리 차량 조회 성공:', memoryCars.length, '대');
    } catch (error) {
      memoryError = error instanceof Error ? error.message : String(error);
      console.error('메모리 차량 조회 실패:', memoryError);
    }

    // 전체 차량 데이터 조회 (디버그용)
    let allSupabaseCars = [];
    let allMemoryCars = [];
    
    try {
      allSupabaseCars = await supabaseCarStorage.getAll();
    } catch (error) {
      console.error('전체 Supabase 차량 조회 실패:', error);
    }

    try {
      allMemoryCars = await carMemoryStorage.getAll();
    } catch (error) {
      console.error('전체 메모리 차량 조회 실패:', error);
    }

    return NextResponse.json({
      success: true,
      message: '차량 저장소 테스트 완료',
      testUserId,
      results: {
        supabase: {
          connected: supabaseConnected,
          userCars: supabaseCars,
          userCarCount: supabaseCars.length,
          allCars: allSupabaseCars,
          totalCount: allSupabaseCars.length,
          error: supabaseError
        },
        memory: {
          userCars: memoryCars,
          userCarCount: memoryCars.length,
          allCars: allMemoryCars,
          totalCount: allMemoryCars.length,
          error: memoryError
        }
      },
      diagnosis: {
        problem: supabaseCars.length === 0 && memoryCars.length > 0 ? 'Supabase에 차량 데이터가 없고 메모리에만 있음' : null,
        solution: supabaseCars.length === 0 && memoryCars.length > 0 ? '메모리 데이터를 Supabase로 마이그레이션 필요' : null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('차량 저장소 테스트 오류:', error);
    return NextResponse.json({
      success: false,
      error: '차량 저장소 테스트 실패',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== 테스트 차량 생성 시작 ===');
    
    const testUserId = 'user_1755512211196_jo3bano3rmi'; // hyunjun2@naver.com
    
    const testCar = {
      userId: testUserId,
      name: '테스트 차량',
      brand: '테스트',
      model: '모델',
      year: 2023,
      licensePlate: `TEST${Date.now()}`,
      mileage: 10000,
      fuelType: '가솔린',
      engineSize: '2.0L',
      color: '흰색',
      lastMaintenance: undefined,
      nextMaintenance: undefined,
      totalCost: 0,
      maintenanceCount: 0,
    };

    // Supabase에 차량 생성 시도
    let supabaseResult = null;
    let supabaseError = null;
    try {
      supabaseResult = await supabaseCarStorage.create(testCar);
      console.log('Supabase 차량 생성 성공:', supabaseResult.id);
    } catch (error) {
      supabaseError = error instanceof Error ? error.message : String(error);
      console.error('Supabase 차량 생성 실패:', supabaseError);
    }

    // 메모리에 차량 생성 시도
    let memoryResult = null;
    let memoryError = null;
    try {
      memoryResult = await carMemoryStorage.create(testCar);
      console.log('메모리 차량 생성 성공:', memoryResult.id);
    } catch (error) {
      memoryError = error instanceof Error ? error.message : String(error);
      console.error('메모리 차량 생성 실패:', memoryError);
    }

    return NextResponse.json({
      success: true,
      message: '테스트 차량 생성 완료',
      results: {
        supabase: {
          success: !!supabaseResult,
          data: supabaseResult,
          error: supabaseError
        },
        memory: {
          success: !!memoryResult,
          data: memoryResult,
          error: memoryError
        }
      },
      nextStep: 'GET 요청으로 차량 조회 테스트',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('테스트 차량 생성 오류:', error);
    return NextResponse.json({
      success: false,
      error: '테스트 차량 생성 실패',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
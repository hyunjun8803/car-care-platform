import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseCarStorage } from '@/lib/supabase-car-storage';
import { carMemoryStorage } from '@/lib/car-storage';
// import { prisma } from '@/lib/prisma';

interface CarCreateRequest {
  name: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  mileage: number;
  fuelType: string;
  engineSize?: string;
  color?: string;
}

// GET /api/cars - 사용자의 모든 차량 조회
export async function GET() {
  try {
    // 실제 사용자 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    try {
      // Supabase 우선 시도
      const userCars = await supabaseCarStorage.findByUserId(userId);
      
      return NextResponse.json({
        success: true,
        data: userCars,
        count: userCars.length,
        source: 'supabase'
      });
    } catch (supabaseError) {
      console.log('Supabase 차량 조회 실패, 메모리 저장소 사용:', supabaseError);
      
      // 메모리 저장소 폴백
      const userCars = await carMemoryStorage.findByUserId(userId);
      
      return NextResponse.json({
        success: true,
        data: userCars,
        count: userCars.length,
        source: 'memory',
        warning: 'Supabase 연결 실패로 임시 저장소 사용 중'
      });
    }

  } catch (error) {
    console.error('차량 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/cars - 새 차량 등록
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body: CarCreateRequest = await request.json();

    // 입력 데이터 검증
    const requiredFields = ['name', 'brand', 'model', 'year', 'licensePlate', 'fuelType'];
    for (const field of requiredFields) {
      if (!body[field as keyof CarCreateRequest]) {
        return NextResponse.json(
          { error: `${field} 필드는 필수입니다.` },
          { status: 400 }
        );
      }
    }

    // 연도 검증
    const currentYear = new Date().getFullYear();
    if (body.year < 1990 || body.year > currentYear + 1) {
      return NextResponse.json(
        { error: '올바른 연도를 입력하세요.' },
        { status: 400 }
      );
    }

    // 주행거리 검증
    if (body.mileage < 0) {
      return NextResponse.json(
        { error: '주행거리는 0 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    try {
      // Supabase 우선 시도
      // 차량번호 중복 확인
      const existingCar = await supabaseCarStorage.findByLicensePlate(body.licensePlate);
      if (existingCar) {
        return NextResponse.json(
          { error: '이미 등록된 차량번호입니다.' },
          { status: 400 }
        );
      }

      // 사용자의 차량 수 확인 (최대 10대)
      const userCarCount = await supabaseCarStorage.countByUserId(userId);
      if (userCarCount >= 10) {
        return NextResponse.json(
          { error: '최대 10대까지 등록 가능합니다.' },
          { status: 400 }
        );
      }

      // Supabase에 차량 등록
      const newCar = await supabaseCarStorage.create({
        userId,
        name: body.name,
        brand: body.brand,
        model: body.model,
        year: body.year,
        licensePlate: body.licensePlate,
        mileage: body.mileage,
        fuelType: body.fuelType,
        engineSize: body.engineSize,
        color: body.color,
        lastMaintenance: undefined,
        nextMaintenance: undefined,
        totalCost: 0,
        maintenanceCount: 0,
      });
      
      // 메모리 저장소에도 백업 저장
      try {
        await carMemoryStorage.create({
          userId,
          name: body.name,
          brand: body.brand,
          model: body.model,
          year: body.year,
          licensePlate: body.licensePlate,
          mileage: body.mileage,
          fuelType: body.fuelType,
          engineSize: body.engineSize,
          color: body.color,
          lastMaintenance: undefined,
          nextMaintenance: undefined,
          totalCost: 0,
          maintenanceCount: 0,
        });
      } catch (memoryError) {
        console.log('메모리 저장소 백업 실패:', memoryError);
      }
      
      return NextResponse.json({
        success: true,
        data: newCar,
        message: '차량이 성공적으로 등록되었습니다.',
        source: 'supabase'
      }, { status: 201 });
      
    } catch (supabaseError) {
      console.log('Supabase 차량 등록 실패, 메모리 저장소 사용:', supabaseError);
      
      // 메모리 저장소 폴백
      // 차량번호 중복 확인
      const existingCar = await carMemoryStorage.findByLicensePlate(body.licensePlate);
      if (existingCar) {
        return NextResponse.json(
          { error: '이미 등록된 차량번호입니다.' },
          { status: 400 }
        );
      }

      // 사용자의 차량 수 확인 (최대 10대)
      const userCarCount = await carMemoryStorage.countByUserId(userId);
      if (userCarCount >= 10) {
        return NextResponse.json(
          { error: '최대 10대까지 등록 가능합니다.' },
          { status: 400 }
        );
      }

      // 메모리 저장소에 차량 등록
      const newCar = await carMemoryStorage.create({
        userId,
        name: body.name,
        brand: body.brand,
        model: body.model,
        year: body.year,
        licensePlate: body.licensePlate,
        mileage: body.mileage,
        fuelType: body.fuelType,
        engineSize: body.engineSize,
        color: body.color,
        lastMaintenance: undefined,
        nextMaintenance: undefined,
        totalCost: 0,
        maintenanceCount: 0,
      });
      
      return NextResponse.json({
        success: true,
        data: newCar,
        message: '차량이 성공적으로 등록되었습니다.',
        source: 'memory',
        warning: 'Supabase 연결 실패로 임시 저장소 사용 중'
      }, { status: 201 });
    }

  } catch (error) {
    console.error('차량 등록 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
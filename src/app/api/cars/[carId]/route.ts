import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseCarStorage } from '@/lib/supabase-car-storage';
import { carMemoryStorage } from '@/lib/car-storage';

// GET /api/cars/[carId] - 특정 차량 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { carId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const carId = params.carId;
    
    try {
      // Supabase 우선 시도
      const car = await supabaseCarStorage.findById(carId);
      
      if (!car) {
        return NextResponse.json(
          { error: '차량을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      // 소유자 확인
      if (car.userId !== session.user.id) {
        return NextResponse.json(
          { error: '접근 권한이 없습니다.' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        data: car,
        source: 'supabase'
      });
      
    } catch (supabaseError) {
      console.log('Supabase 차량 조회 실패, 메모리 저장소 사용:', supabaseError);
      
      // 메모리 저장소 폴백
      const car = await carMemoryStorage.findById(carId);
      
      if (!car) {
        return NextResponse.json(
          { error: '차량을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      // 소유자 확인
      if (car.userId !== session.user.id) {
        return NextResponse.json(
          { error: '접근 권한이 없습니다.' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        data: car,
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

// PUT /api/cars/[carId] - 차량 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { carId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const carId = params.carId;
    
    try {
      // Supabase 우선 시도
      const car = await supabaseCarStorage.findById(carId);
      
      if (!car) {
        return NextResponse.json(
          { error: '차량을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      // 소유자 확인
      if (car.userId !== session.user.id) {
        return NextResponse.json(
          { error: '접근 권한이 없습니다.' },
          { status: 403 }
        );
      }

      const body = await request.json();

      // 차량번호 중복 확인 (본인 차량 제외)
      if (body.licensePlate && body.licensePlate !== car.licensePlate) {
        const existingCar = await supabaseCarStorage.findByLicensePlate(body.licensePlate, carId);
        if (existingCar) {
          return NextResponse.json(
            { error: '이미 등록된 차량번호입니다.' },
            { status: 400 }
          );
        }
      }

      // 연도 검증
      if (body.year) {
        const currentYear = new Date().getFullYear();
        if (body.year < 1990 || body.year > currentYear + 1) {
          return NextResponse.json(
            { error: '올바른 연도를 입력하세요.' },
            { status: 400 }
          );
        }
      }

      // 주행거리 검증
      if (body.mileage !== undefined && body.mileage < 0) {
        return NextResponse.json(
          { error: '주행거리는 0 이상이어야 합니다.' },
          { status: 400 }
        );
      }

      const updatedCar = await supabaseCarStorage.update(carId, body);
      
      // 메모리 저장소도 업데이트
      try {
        await carMemoryStorage.update(carId, body);
      } catch (memoryError) {
        console.log('메모리 저장소 업데이트 실패:', memoryError);
      }

      return NextResponse.json({
        success: true,
        data: updatedCar,
        message: '차량 정보가 수정되었습니다.',
        source: 'supabase'
      });
      
    } catch (supabaseError) {
      console.log('Supabase 차량 수정 실패, 메모리 저장소 사용:', supabaseError);
      
      // 메모리 저장소 폴백
      const car = await carMemoryStorage.findById(carId);
      
      if (!car) {
        return NextResponse.json(
          { error: '차량을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      // 소유자 확인
      if (car.userId !== session.user.id) {
        return NextResponse.json(
          { error: '접근 권한이 없습니다.' },
          { status: 403 }
        );
      }

      const body = await request.json();

      // 차량번호 중복 확인 (본인 차량 제외)
      if (body.licensePlate && body.licensePlate !== car.licensePlate) {
        const existingCar = await carMemoryStorage.findByLicensePlate(body.licensePlate, carId);
        if (existingCar) {
          return NextResponse.json(
            { error: '이미 등록된 차량번호입니다.' },
            { status: 400 }
          );
        }
      }

      // 연도 검증
      if (body.year) {
        const currentYear = new Date().getFullYear();
        if (body.year < 1990 || body.year > currentYear + 1) {
          return NextResponse.json(
            { error: '올바른 연도를 입력하세요.' },
            { status: 400 }
          );
        }
      }

      // 주행거리 검증
      if (body.mileage !== undefined && body.mileage < 0) {
        return NextResponse.json(
          { error: '주행거리는 0 이상이어야 합니다.' },
          { status: 400 }
        );
      }

      const updatedCar = await carMemoryStorage.update(carId, body);

      return NextResponse.json({
        success: true,
        data: updatedCar,
        message: '차량 정보가 수정되었습니다.',
        source: 'memory',
        warning: 'Supabase 연결 실패로 임시 저장소 사용 중'
      });
    }

  } catch (error) {
    console.error('차량 수정 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/cars/[carId] - 차량 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { carId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const carId = params.carId;
    
    try {
      // Supabase 우선 시도
      const car = await supabaseCarStorage.findById(carId);
      
      if (!car) {
        return NextResponse.json(
          { error: '차량을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      // 소유자 확인
      if (car.userId !== session.user.id) {
        return NextResponse.json(
          { error: '접근 권한이 없습니다.' },
          { status: 403 }
        );
      }

      const deleted = await supabaseCarStorage.delete(carId);

      if (!deleted) {
        return NextResponse.json(
          { error: '차량 삭제에 실패했습니다.' },
          { status: 500 }
        );
      }
      
      // 메모리 저장소에서도 삭제
      try {
        await carMemoryStorage.delete(carId);
      } catch (memoryError) {
        console.log('메모리 저장소 삭제 실패:', memoryError);
      }

      return NextResponse.json({
        success: true,
        message: '차량이 삭제되었습니다.',
        source: 'supabase'
      });
      
    } catch (supabaseError) {
      console.log('Supabase 차량 삭제 실패, 메모리 저장소 사용:', supabaseError);
      
      // 메모리 저장소 폴백
      const car = await carMemoryStorage.findById(carId);
      
      if (!car) {
        return NextResponse.json(
          { error: '차량을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      // 소유자 확인
      if (car.userId !== session.user.id) {
        return NextResponse.json(
          { error: '접근 권한이 없습니다.' },
          { status: 403 }
        );
      }

      const deleted = await carMemoryStorage.delete(carId);

      if (!deleted) {
        return NextResponse.json(
          { error: '차량 삭제에 실패했습니다.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: '차량이 삭제되었습니다.',
        source: 'memory',
        warning: 'Supabase 연결 실패로 임시 저장소 사용 중'
      });
    }

  } catch (error) {
    console.error('차량 삭제 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
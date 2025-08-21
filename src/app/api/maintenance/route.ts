import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface MaintenanceCreateRequest {
  carId: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  mileage: number;
  shopName: string;
  shopAddress?: string;
  parts?: string;
  notes?: string;
}

// GET /api/maintenance - 정비 기록 조회 (쿼리 파라미터로 차량 필터링 가능)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const carId = searchParams.get('carId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    // Prisma 쿼리 조건 설정
    const whereConditions: any = {
      userId: userId
    };

    // 차량 필터링
    if (carId) {
      whereConditions.carId = carId;
    }

    // 검색 필터링 (SQLite의 경우 contains만 사용)
    if (search) {
      whereConditions.OR = [
        { description: { contains: search } },
        { type: { contains: search } },
        { shopName: { contains: search } }
      ];
    }

    // 총 개수 조회
    const total = await prisma.maintenanceLog.count({
      where: whereConditions
    });

    // 페이지네이션과 정렬을 적용한 데이터 조회
    const maintenanceRecords = await prisma.maintenanceLog.findMany({
      where: whereConditions,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // API 응답에 맞게 데이터 변환
    const transformedRecords = maintenanceRecords.map(record => ({
      id: record.id,
      carId: record.carId,
      userId: record.userId,
      date: record.date.toISOString().split('T')[0],
      type: record.type,
      description: record.description,
      cost: record.cost,
      mileage: record.mileage,
      shopName: record.shopName,
      shopAddress: record.shopAddress,
      parts: record.parts,
      notes: record.notes,
      createdAt: record.createdAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: transformedRecords,
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('정비 기록 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/maintenance - 새 정비 기록 추가
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
    const body: MaintenanceCreateRequest = await request.json();

    // 입력 데이터 검증
    const requiredFields = ['carId', 'date', 'type', 'description', 'cost', 'mileage', 'shopName'];
    for (const field of requiredFields) {
      if (!body[field as keyof MaintenanceCreateRequest] && body[field as keyof MaintenanceCreateRequest] !== 0) {
        return NextResponse.json(
          { error: `${field} 필드는 필수입니다.` },
          { status: 400 }
        );
      }
    }

    // 차량 소유권 확인
    const car = await prisma.car.findFirst({
      where: {
        id: body.carId,
        userId: userId
      }
    });
    
    if (!car) {
      return NextResponse.json(
        { error: '해당 차량에 접근할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 비용 검증
    if (body.cost < 0) {
      return NextResponse.json(
        { error: '비용은 0 이상이어야 합니다.' },
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

    // 날짜 검증
    const maintenanceDate = new Date(body.date);
    const now = new Date();
    if (maintenanceDate > now) {
      return NextResponse.json(
        { error: '정비 날짜는 미래일 수 없습니다.' },
        { status: 400 }
      );
    }

    // 새 정비 기록 생성
    const newMaintenance = await prisma.maintenanceLog.create({
      data: {
        userId,
        carId: body.carId,
        date: new Date(body.date),
        type: body.type,
        description: body.description,
        cost: body.cost,
        mileage: body.mileage,
        shopName: body.shopName,
        shopAddress: body.shopAddress,
        parts: body.parts,
        notes: body.notes
      }
    });

    // 차량의 정비 정보 업데이트
    const totalCost = await prisma.maintenanceLog.aggregate({
      where: { carId: body.carId },
      _sum: { cost: true },
      _count: { id: true }
    });

    await prisma.car.update({
      where: { id: body.carId },
      data: {
        totalCost: totalCost._sum.cost || 0,
        maintenanceCount: totalCost._count.id,
        lastMaintenance: new Date(body.date),
        mileage: Math.max(car.mileage || 0, body.mileage)
      }
    });

    // API 응답에 맞게 데이터 변환
    const responseData = {
      id: newMaintenance.id,
      carId: newMaintenance.carId,
      userId: newMaintenance.userId,
      date: newMaintenance.date.toISOString().split('T')[0],
      type: newMaintenance.type,
      description: newMaintenance.description,
      cost: newMaintenance.cost,
      mileage: newMaintenance.mileage,
      shopName: newMaintenance.shopName,
      shopAddress: newMaintenance.shopAddress,
      parts: newMaintenance.parts,
      notes: newMaintenance.notes,
      createdAt: newMaintenance.createdAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      message: '정비 기록이 성공적으로 추가되었습니다.'
    }, { status: 201 });

  } catch (error) {
    console.error('정비 기록 추가 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
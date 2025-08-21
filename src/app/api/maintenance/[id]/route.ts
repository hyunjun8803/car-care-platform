import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface MaintenanceUpdateRequest {
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

// GET /api/maintenance/[id] - 특정 정비 기록 조회
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const maintenanceId = params.id;

    // 정비 기록 조회 및 소유권 확인
    const maintenance = await prisma.maintenanceLog.findFirst({
      where: {
        id: maintenanceId,
        userId: userId
      }
    });

    if (!maintenance) {
      return NextResponse.json(
        { error: '정비 기록을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // API 응답에 맞게 데이터 변환
    const responseData = {
      id: maintenance.id,
      carId: maintenance.carId,
      userId: maintenance.userId,
      date: maintenance.date.toISOString().split('T')[0],
      type: maintenance.type,
      description: maintenance.description,
      cost: maintenance.cost,
      mileage: maintenance.mileage,
      shopName: maintenance.shopName,
      shopAddress: maintenance.shopAddress,
      parts: maintenance.parts,
      notes: maintenance.notes,
      createdAt: maintenance.createdAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('정비 기록 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/maintenance/[id] - 정비 기록 수정
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const maintenanceId = params.id;
    const body: MaintenanceUpdateRequest = await request.json();

    // 정비 기록 존재 및 소유권 확인
    const existingMaintenance = await prisma.maintenanceLog.findFirst({
      where: {
        id: maintenanceId,
        userId: userId
      }
    });

    if (!existingMaintenance) {
      return NextResponse.json(
        { error: '정비 기록을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 입력 데이터 검증
    const requiredFields = ['carId', 'date', 'type', 'description', 'cost', 'mileage', 'shopName'];
    for (const field of requiredFields) {
      if (!body[field as keyof MaintenanceUpdateRequest] && body[field as keyof MaintenanceUpdateRequest] !== 0) {
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

    // 정비 기록 수정
    const updatedMaintenance = await prisma.maintenanceLog.update({
      where: { id: maintenanceId },
      data: {
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

    // 최근 정비일 조회
    const latestMaintenance = await prisma.maintenanceLog.findFirst({
      where: { carId: body.carId },
      orderBy: { date: 'desc' }
    });

    await prisma.car.update({
      where: { id: body.carId },
      data: {
        totalCost: totalCost._sum.cost || 0,
        maintenanceCount: totalCost._count.id,
        lastMaintenance: latestMaintenance?.date || null,
        mileage: Math.max(car.mileage || 0, body.mileage)
      }
    });

    // API 응답에 맞게 데이터 변환
    const responseData = {
      id: updatedMaintenance.id,
      carId: updatedMaintenance.carId,
      userId: updatedMaintenance.userId,
      date: updatedMaintenance.date.toISOString().split('T')[0],
      type: updatedMaintenance.type,
      description: updatedMaintenance.description,
      cost: updatedMaintenance.cost,
      mileage: updatedMaintenance.mileage,
      shopName: updatedMaintenance.shopName,
      shopAddress: updatedMaintenance.shopAddress,
      parts: updatedMaintenance.parts,
      notes: updatedMaintenance.notes,
      createdAt: updatedMaintenance.createdAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      message: '정비 기록이 성공적으로 수정되었습니다.'
    });

  } catch (error) {
    console.error('정비 기록 수정 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/maintenance/[id] - 정비 기록 삭제
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const maintenanceId = params.id;

    // 정비 기록 존재 및 소유권 확인
    const existingMaintenance = await prisma.maintenanceLog.findFirst({
      where: {
        id: maintenanceId,
        userId: userId
      }
    });

    if (!existingMaintenance) {
      return NextResponse.json(
        { error: '정비 기록을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const carId = existingMaintenance.carId;

    // 정비 기록 삭제
    await prisma.maintenanceLog.delete({
      where: { id: maintenanceId }
    });

    // 차량의 정비 정보 업데이트
    const totalCost = await prisma.maintenanceLog.aggregate({
      where: { carId: carId },
      _sum: { cost: true },
      _count: { id: true }
    });

    // 최근 정비일 조회
    const latestMaintenance = await prisma.maintenanceLog.findFirst({
      where: { carId: carId },
      orderBy: { date: 'desc' }
    });

    await prisma.car.update({
      where: { id: carId },
      data: {
        totalCost: totalCost._sum.cost || 0,
        maintenanceCount: totalCost._count.id,
        lastMaintenance: latestMaintenance?.date || null
      }
    });

    return NextResponse.json({
      success: true,
      message: '정비 기록이 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('정비 기록 삭제 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
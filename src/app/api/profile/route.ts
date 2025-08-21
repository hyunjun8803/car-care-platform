import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ProfileUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  preferences?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    maintenanceReminders?: boolean;
    marketingEmails?: boolean;
  };
}

// GET /api/profile - 사용자 프로필 조회
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

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        preferences: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사용자 통계 데이터
    const totalCars = await prisma.car.count({
      where: { userId }
    });

    const totalMaintenanceRecords = await prisma.maintenanceLog.count({
      where: { userId }
    });

    const totalMaintenanceCost = await prisma.maintenanceLog.aggregate({
      where: { userId },
      _sum: { cost: true }
    });

    const totalBookings = await prisma.booking.count({
      where: { userId }
    });

    // 첫 번째 차량 등록일
    const firstCar = await prisma.car.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true }
    });

    // 최근 활동일 (가장 최근 정비 기록 또는 예약)
    const lastMaintenance = await prisma.maintenanceLog.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });

    const lastBooking = await prisma.booking.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });

    const lastActivity = lastMaintenance && lastBooking 
      ? (lastMaintenance.createdAt > lastBooking.createdAt ? lastMaintenance.createdAt : lastBooking.createdAt)
      : lastMaintenance?.createdAt || lastBooking?.createdAt;

    const responseData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        preferences: user.preferences ? JSON.parse(user.preferences) : {
          emailNotifications: true,
          smsNotifications: true,
          maintenanceReminders: true,
          marketingEmails: false
        },
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      },
      stats: {
        totalCars,
        totalMaintenanceRecords,
        totalMaintenanceCost: totalMaintenanceCost._sum.cost || 0,
        totalBookings,
        memberSince: user.createdAt.toISOString(),
        firstCarRegistered: firstCar?.createdAt.toISOString() || null,
        lastActivity: lastActivity?.toISOString() || null
      }
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('프로필 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/profile - 사용자 프로필 업데이트
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body: ProfileUpdateRequest = await request.json();

    // 입력 데이터 검증
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: '올바른 이메일 형식이 아닙니다.' },
          { status: 400 }
        );
      }

      // 이메일 중복 확인 (자신 제외)
      const existingUser = await prisma.user.findFirst({
        where: {
          email: body.email,
          id: { not: userId }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: '이미 사용 중인 이메일입니다.' },
          { status: 400 }
        );
      }
    }

    if (body.phone) {
      const phoneRegex = /^[0-9-+\s()]+$/;
      if (!phoneRegex.test(body.phone)) {
        return NextResponse.json(
          { error: '올바른 전화번호 형식이 아닙니다.' },
          { status: 400 }
        );
      }
    }

    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.name && { name: body.name.trim() }),
        ...(body.email && { email: body.email.toLowerCase().trim() }),
        ...(body.phone && { phone: body.phone.trim() }),
        ...(body.address && { address: body.address.trim() }),
        ...(body.preferences && { preferences: JSON.stringify(body.preferences) })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        preferences: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address,
          preferences: updatedUser.preferences ? JSON.parse(updatedUser.preferences) : null,
          createdAt: updatedUser.createdAt.toISOString(),
          updatedAt: updatedUser.updatedAt.toISOString()
        }
      },
      message: '프로필이 성공적으로 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
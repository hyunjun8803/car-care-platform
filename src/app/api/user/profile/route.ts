import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

interface ProfileUpdateRequest {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  userType?: 'CUSTOMER' | 'SHOP_OWNER';
}

// GET /api/user/profile - 사용자 프로필 조회
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
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        // 비밀번호는 제외
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사용자 통계 조회
    const carCount = await prisma.car.count({
      where: { userId: userId, isActive: true }
    });

    const maintenanceCount = await prisma.maintenanceLog.count({
      where: { userId: userId }
    });

    const totalMaintenanceCost = await prisma.maintenanceLog.aggregate({
      where: { userId: userId },
      _sum: { cost: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        stats: {
          carCount,
          maintenanceCount,
          totalMaintenanceCost: totalMaintenanceCost._sum.cost || 0
        }
      }
    });

  } catch (error) {
    console.error('프로필 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - 사용자 프로필 수정
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

    // 현재 사용자 정보 조회
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이메일 중복 검사 (자신 제외)
    if (body.email && body.email !== currentUser.email) {
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

    // 비밀번호 변경 요청 시 현재 비밀번호 확인
    let hashedNewPassword: string | undefined;
    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json(
          { error: '현재 비밀번호를 입력해주세요.' },
          { status: 400 }
        );
      }

      // OAuth로 가입한 사용자는 비밀번호가 없을 수 있음
      if (currentUser.password) {
        const isValidPassword = await bcrypt.compare(body.currentPassword, currentUser.password);
        if (!isValidPassword) {
          return NextResponse.json(
            { error: '현재 비밀번호가 올바르지 않습니다.' },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'OAuth로 가입한 계정은 비밀번호를 설정할 수 없습니다.' },
          { status: 400 }
        );
      }

      // 새 비밀번호 검증
      if (body.newPassword.length < 6) {
        return NextResponse.json(
          { error: '비밀번호는 최소 6자 이상이어야 합니다.' },
          { status: 400 }
        );
      }

      hashedNewPassword = await bcrypt.hash(body.newPassword, 10);
    }

    // 업데이트할 데이터 준비
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.userType) updateData.userType = body.userType;
    if (hashedNewPassword) updateData.password = hashedNewPassword;

    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
      message: '프로필이 성공적으로 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('프로필 수정 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
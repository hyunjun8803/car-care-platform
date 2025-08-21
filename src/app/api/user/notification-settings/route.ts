import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/user/notification-settings - 알림 설정 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        notificationSettings: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 기본 설정
    const defaultSettings = {
      emailNotifications: {
        bookingConfirmed: true,
        bookingCancelled: true,
        bookingCompleted: true,
        bookingReminder: true
      },
      smsNotifications: {
        bookingConfirmed: false,
        bookingCancelled: false,
        bookingCompleted: false,
        bookingReminder: true
      },
      reminderTiming: 24 // 24시간 전
    };

    const settings = user.notificationSettings ? 
      JSON.parse(user.notificationSettings) : 
      defaultSettings;

    return NextResponse.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('알림 설정 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/user/notification-settings - 알림 설정 업데이트
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { emailNotifications, smsNotifications, reminderTiming } = body;

    // 설정 검증
    if (!emailNotifications || !smsNotifications || reminderTiming === undefined) {
      return NextResponse.json(
        { error: '필수 설정 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const settings = {
      emailNotifications,
      smsNotifications,
      reminderTiming: parseInt(reminderTiming)
    };

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        notificationSettings: JSON.stringify(settings)
      }
    });

    return NextResponse.json({
      success: true,
      message: '알림 설정이 업데이트되었습니다.',
      data: settings
    });

  } catch (error) {
    console.error('알림 설정 업데이트 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
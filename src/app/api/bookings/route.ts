import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
// import { prisma } from '@/lib/prisma';
// import { BookingStatus } from '@prisma/client';
// import { sendNotification, NotificationData } from '@/lib/notifications';

// GET /api/bookings - 예약 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming') === 'true';
    
    // 임시 더미 데이터 (Prisma 연결 전까지)
    const bookings: any[] = [];

    return NextResponse.json({
      success: true,
      data: bookings,
      count: bookings.length,
      totalPages: 1,
      currentPage: 1
    });

  } catch (error) {
    console.error('예약 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
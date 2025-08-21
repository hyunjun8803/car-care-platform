import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/shop-owner/dashboard-simple - 정비소 운영자 대시보드 (간단 버전)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    console.log('정비소 대시보드 요청:', {
      userId: session.user.id,
      email: session.user.email,
      environment: process.env.NODE_ENV
    });

    // 기본 더미 데이터 제공
    const fallbackData = {
      success: true,
      data: {
        // 기본 통계
        stats: {
          todayBookings: 0,
          weekBookings: 0,
          monthBookings: 0,
          totalBookings: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
          inProgressBookings: 0,
          completedBookings: 0,
          monthlyRevenue: 0,
          totalRevenue: 0
        },
        
        // 오늘의 일정
        todaySchedule: [],
        
        // 최근 예약
        recentBookings: [],
        
        // 인기 서비스
        popularServices: [],
        
        // 예약 트렌드 (최근 7일)
        bookingTrends: [],
        
        // 정비소 정보
        shops: [{
          id: 'temp-shop-1',
          businessName: '내 정비소',
          address: '정비소 주소',
          phone: '정비소 전화번호',
          rating: 4.5,
          totalReviews: 0,
          isVerified: true
        }],
        
        // 시스템 정보
        systemInfo: {
          environment: process.env.NODE_ENV,
          userId: session.user.id,
          userEmail: session.user.email,
          message: '정비소 대시보드 기본 정보입니다. 데이터베이스 연결 후 실제 데이터가 표시됩니다.'
        }
      }
    };

    console.log('정비소 대시보드 응답 준비 완료');
    return NextResponse.json(fallbackData);

  } catch (error) {
    console.error('정비소 대시보드 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '서버 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error),
        systemInfo: {
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}
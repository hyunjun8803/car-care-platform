import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/shop-owner/dashboard - 정비소 운영자 대시보드 통계 (안전한 버전)
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

    // 안전한 fallback 데이터 제공
    const safeData = {
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
        popularServices: [
          {
            id: 'service-1',
            name: '엔진오일 교환',
            category: '정기점검',
            bookingCount: 0,
            basePrice: 50000
          },
          {
            id: 'service-2', 
            name: '브레이크 패드 교체',
            category: '소모품교체',
            bookingCount: 0,
            basePrice: 120000
          }
        ],
        
        // 예약 트렌드 (최근 7일)
        bookingTrends: Array.from({length: 7}, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: 0
        })).reverse(),
        
        // 정비소 정보
        shops: [{
          id: 'shop-' + session.user.id,
          businessName: '내 정비소',
          address: '서울시 강남구',
          phone: '02-0000-0000',
          rating: 4.5,
          totalReviews: 0,
          isVerified: true
        }],
        
        // 시스템 정보
        systemInfo: {
          environment: process.env.NODE_ENV,
          userId: session.user.id,
          userEmail: session.user.email,
          message: '정비소 대시보드에 오신 것을 환영합니다. 실제 예약 데이터는 데이터베이스 연결 후 표시됩니다.',
          note: 'Prisma 대신 기본 데이터를 제공하고 있습니다.'
        }
      }
    };

    console.log('정비소 대시보드 안전 모드 응답 준비 완료');
    return NextResponse.json(safeData);

  } catch (error) {
    console.error('정비소 대시보드 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '서버 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error),
        systemInfo: {
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString(),
          fallbackMode: true
        }
      },
      { status: 500 }
    );
  }
}
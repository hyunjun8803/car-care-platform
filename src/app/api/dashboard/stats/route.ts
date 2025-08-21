import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseCarStorage } from '@/lib/supabase-car-storage';
import { carMemoryStorage } from '@/lib/car-storage';
// import { prisma } from '@/lib/prisma';

// GET /api/dashboard/stats - 대시보드 통계 데이터 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 실제 차량 수 조회 (Supabase 우선, 실패 시 메모리 저장소)
    let totalCars = 0;
    try {
      totalCars = await supabaseCarStorage.countByUserId(userId);
    } catch (supabaseError) {
      console.log('Supabase 차량 수 조회 실패, 메모리 저장소 사용:', supabaseError);
      totalCars = await carMemoryStorage.countByUserId(userId);
    }

    // 임시 더미 데이터 (실제 데이터베이스 연결 전까지)
    const thisMonthMaintenanceCost = 0;
    const thisMonthMaintenanceCount = 0;
    const upcomingBookings = 0;
    const maintenanceAlerts = 0;
    const recentMaintenanceRecords: any[] = [];
    const recentBookings: any[] = [];
    
    // 월별 정비 비용 데이터 (더미)
    const monthlyStats = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const targetYear = now.getFullYear();
      const targetMonth = now.getMonth() - i + 1;
      
      let actualYear = targetYear;
      let actualMonth = targetMonth;
      if (actualMonth <= 0) {
        actualYear = targetYear - 1;
        actualMonth = 12 + actualMonth;
      }
      
      const monthDate = new Date(actualYear, actualMonth - 1, 1);
      monthlyStats.push({
        month: monthDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' }),
        cost: 0,
        count: 0
      });
    }

    // 응답 데이터 구성
    const responseData = {
      overview: {
        totalCars,
        thisMonthMaintenanceCost,
        thisMonthMaintenanceCount,
        upcomingBookings,
        maintenanceAlerts
      },
      recentActivity: {
        maintenanceRecords: recentMaintenanceRecords,
        bookings: recentBookings
      },
      monthlyStats
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('대시보드 통계 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
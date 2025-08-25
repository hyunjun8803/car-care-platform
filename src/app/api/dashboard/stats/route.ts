import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseCarStorage } from '@/lib/supabase-car-storage';
import { carMemoryStorage } from '@/lib/car-storage';
import { supabaseExpenseStorage } from '@/lib/supabase-expense-storage';
import { expenseMemoryStorage } from '@/lib/expense-storage';
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

    // 실제 차계부 데이터 조회 (이번 달 지출)
    let expenseStats;
    let expenseSource: string;
    let thisMonthMaintenanceCost = 0;
    let thisMonthExpenseTotal = 0;
    let expensesByCategory: any = {};
    let recentExpenses: any[] = [];

    try {
      // Supabase에서 이번 달 지출 통계 조회
      expenseStats = await supabaseExpenseStorage.getStats(userId, { period: 'month' });
      expenseSource = 'supabase';
      
      thisMonthExpenseTotal = expenseStats.summary.totalAmount || 0;
      thisMonthMaintenanceCost = expenseStats.categoryStats
        ?.find((cat: any) => cat.category === 'MAINTENANCE')?.amount || 0;
      
      // 카테고리별 지출 구성 (모든 차계부 카테고리)
      expensesByCategory = {
        fuel: expenseStats.categoryStats?.find((cat: any) => cat.category === 'FUEL')?.amount || 0,
        maintenance: expenseStats.categoryStats?.find((cat: any) => cat.category === 'MAINTENANCE')?.amount || 0,
        insurance: expenseStats.categoryStats?.find((cat: any) => cat.category === 'INSURANCE')?.amount || 0,
        tax: expenseStats.categoryStats?.find((cat: any) => cat.category === 'TAX')?.amount || 0,
        parking: expenseStats.categoryStats?.find((cat: any) => cat.category === 'PARKING')?.amount || 0,
        toll: expenseStats.categoryStats?.find((cat: any) => cat.category === 'TOLL')?.amount || 0,
        carWash: expenseStats.categoryStats?.find((cat: any) => cat.category === 'CARWASH')?.amount || 0,
        accessories: expenseStats.categoryStats?.find((cat: any) => cat.category === 'ACCESSORIES')?.amount || 0,
        rental: expenseStats.categoryStats?.find((cat: any) => cat.category === 'RENTAL')?.amount || 0,
        other: expenseStats.categoryStats?.find((cat: any) => cat.category === 'OTHER')?.amount || 0
      };
      
      // 최근 지출 기록
      recentExpenses = expenseStats.recentExpenses || [];
      
    } catch (supabaseError) {
      console.log('Supabase 차계부 통계 조회 실패, 메모리 저장소 사용:', supabaseError);
      
      try {
        // 메모리 저장소 폴백
        expenseStats = await expenseMemoryStorage.getStats(userId, { period: 'month' });
        expenseSource = 'memory';
        
        thisMonthExpenseTotal = expenseStats.summary.totalAmount || 0;
        thisMonthMaintenanceCost = expenseStats.categoryStats
          ?.find((cat: any) => cat.category === 'MAINTENANCE')?.amount || 0;
        
        expensesByCategory = {
          fuel: expenseStats.categoryStats?.find((cat: any) => cat.category === 'FUEL')?.amount || 0,
          maintenance: expenseStats.categoryStats?.find((cat: any) => cat.category === 'MAINTENANCE')?.amount || 0,
          insurance: expenseStats.categoryStats?.find((cat: any) => cat.category === 'INSURANCE')?.amount || 0,
          tax: expenseStats.categoryStats?.find((cat: any) => cat.category === 'TAX')?.amount || 0,
          parking: expenseStats.categoryStats?.find((cat: any) => cat.category === 'PARKING')?.amount || 0,
          toll: expenseStats.categoryStats?.find((cat: any) => cat.category === 'TOLL')?.amount || 0,
          carWash: expenseStats.categoryStats?.find((cat: any) => cat.category === 'CARWASH')?.amount || 0,
          accessories: expenseStats.categoryStats?.find((cat: any) => cat.category === 'ACCESSORIES')?.amount || 0,
          rental: expenseStats.categoryStats?.find((cat: any) => cat.category === 'RENTAL')?.amount || 0,
          other: expenseStats.categoryStats?.find((cat: any) => cat.category === 'OTHER')?.amount || 0
        };
        
        recentExpenses = expenseStats.recentExpenses || [];
        
      } catch (memoryError) {
        console.log('메모리 저장소 차계부 통계 조회 실패:', memoryError);
        expenseSource = 'none';
      }
    }

    // 기타 데이터 (임시 더미 데이터)
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
        thisMonthExpenseTotal,
        thisMonthMaintenanceCount,
        upcomingBookings,
        maintenanceAlerts
      },
      expenseSnapshot: {
        thisMonthTotal: thisMonthExpenseTotal,
        categories: expensesByCategory,
        recentExpenses: recentExpenses.map((expense: any) => ({
          id: expense.id,
          date: new Date(expense.date).toLocaleDateString('ko-KR'),
          category: expense.category,
          amount: expense.amount,
          description: expense.description
        }))
      },
      recentActivity: {
        maintenanceRecords: recentMaintenanceRecords,
        bookings: recentBookings
      },
      monthlyStats,
      sources: {
        expenses: expenseSource || 'none'
      }
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
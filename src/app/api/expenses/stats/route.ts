import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { expenseMemoryStorage } from '@/lib/expense-storage';
import { supabaseExpenseStorage } from '@/lib/supabase-expense-storage';

// GET /api/expenses/stats - 차계부 통계 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const carId = searchParams.get('carId') || undefined;
    const period = searchParams.get('period') as 'month' | 'year' || 'month';

    // 다중 저장소에서 통계 조회 (Supabase 우선, 실패 시 메모리)
    let stats;
    let source: string;

    try {
      // Supabase 우선 시도
      stats = await supabaseExpenseStorage.getStats(session.user.id, {
        carId,
        period
      });
      source = 'supabase';
    } catch (supabaseError) {
      console.log('Supabase 차계부 통계 조회 실패, 메모리 저장소 사용:', supabaseError);
      
      // 메모리 저장소 폴백
      stats = await expenseMemoryStorage.getStats(session.user.id, {
        carId,
        period
      });
      source = 'memory';
    }

    return NextResponse.json({
      success: true,
      data: stats,
      source: source
    });

  } catch (error) {
    console.error('차계부 통계 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
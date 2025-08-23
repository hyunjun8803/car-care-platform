import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { expenseMemoryStorage } from '@/lib/expense-storage';

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

    // 메모리 저장소에서 통계 조회
    const stats = await expenseMemoryStorage.getStats(session.user.id, {
      carId,
      period
    });

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('차계부 통계 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
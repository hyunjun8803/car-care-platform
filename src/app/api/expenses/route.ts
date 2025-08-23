import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { expenseMemoryStorage } from '@/lib/expense-storage';

// GET /api/expenses - 차계부 목록 조회
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
    const category = searchParams.get('category') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 데이터 조회
    const { expenses, total } = await expenseMemoryStorage.findByUserId(session.user.id, {
      carId,
      category,
      startDate,
      endDate,
      page,
      limit
    });

    return NextResponse.json({
      success: true,
      data: {
        expenses,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalCount: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('차계부 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '차계부 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/expenses - 새로운 지출 기록 추가
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      carId,
      category,
      subcategory,
      amount,
      description,
      date,
      location,
      mileage,
      paymentMethod,
      receiptImageUrl,
      tags,
      notes,
      isRecurring
    } = body;

    // 필수 필드 검증
    if (!carId || !category || !amount || !description) {
      return NextResponse.json(
        { success: false, error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 지출 기록 생성 (차량 확인 생략 - 메모리 저장소에서는 유연하게 처리)
    const expense = await expenseMemoryStorage.create({
      userId: session.user.id,
      carId: carId || 'default_car',
      category,
      subcategory,
      amount: parseFloat(amount),
      description,
      date: date || new Date().toISOString(),
      location,
      mileage: mileage ? parseInt(mileage) : undefined,
      paymentMethod: paymentMethod || 'CASH',
      receiptImageUrl,
      tags: tags ? JSON.stringify(tags) : undefined,
      notes,
      isRecurring: isRecurring || false
    });

    return NextResponse.json({
      success: true,
      data: expense
    });

  } catch (error) {
    console.error('지출 기록 추가 오류:', error);
    return NextResponse.json(
      { success: false, error: '지출 기록 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { expenseMemoryStorage } from '@/lib/expense-storage';
import { supabaseExpenseStorage } from '@/lib/supabase-expense-storage';
import { supabaseCarStorage } from '@/lib/supabase-car-storage';
import { carMemoryStorage } from '@/lib/car-storage';

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

    // 다중 저장소에서 차계부 조회 (Supabase + 메모리)
    let allExpenses: any[] = [];
    let totalCount = 0;
    let sources: string[] = [];
    
    // Supabase에서 차계부 조회 시도
    try {
      const supabaseResult = await supabaseExpenseStorage.findByUserId(session.user.id, {
        carId,
        category,
        startDate,
        endDate,
        page,
        limit
      });
      if (supabaseResult.expenses.length > 0) {
        allExpenses = supabaseResult.expenses;
        totalCount = supabaseResult.total;
        sources.push('supabase');
      }
    } catch (supabaseError) {
      console.log('Supabase 차계부 조회 실패:', supabaseError);
    }
    
    // Supabase에 데이터가 없으면 메모리 저장소에서 조회
    if (allExpenses.length === 0) {
      try {
        const memoryResult = await expenseMemoryStorage.findByUserId(session.user.id, {
          carId,
          category,
          startDate,
          endDate,
          page,
          limit
        });
        if (memoryResult.expenses.length > 0) {
          allExpenses = memoryResult.expenses;
          totalCount = memoryResult.total;
          sources.push('memory');
        }
      } catch (memoryError) {
        console.log('메모리 저장소 차계부 조회 실패:', memoryError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        expenses: allExpenses,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount: totalCount,
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        }
      },
      sources: sources,
      message: sources.length === 0 ? '등록된 차계부가 없습니다.' : 
               sources.includes('memory') && !sources.includes('supabase') ? 
               'Supabase expenses 테이블을 생성해야 데이터가 영구 저장됩니다.' : 
               '정상적으로 조회되었습니다.'
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

    // 다중 저장소에 차계부 생성 (Supabase 우선, 실패 시 메모리)
    const expenseData = {
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
    };

    let expense;
    let source: string;

    try {
      // Supabase 우선 시도
      expense = await supabaseExpenseStorage.create(expenseData);
      source = 'supabase';
      
      // 메모리 저장소에도 백업 저장
      try {
        await expenseMemoryStorage.create(expenseData);
      } catch (memoryError) {
        console.log('메모리 저장소 백업 실패:', memoryError);
      }
    } catch (supabaseError) {
      console.log('Supabase 차계부 생성 실패, 메모리 저장소 사용:', supabaseError);
      
      // 메모리 저장소 폴백
      expense = await expenseMemoryStorage.create(expenseData);
      source = 'memory';
    }

    // 주행거리가 있으면 차량의 주행거리 업데이트
    if (mileage && typeof mileage === 'number' && mileage > 0) {
      try {
        // 현재 차량 정보 조회
        let currentCar;
        try {
          currentCar = await supabaseCarStorage.findById(carId);
        } catch (supabaseCarError) {
          console.log('Supabase 차량 조회 실패, 메모리 저장소 사용:', supabaseCarError);
          currentCar = await carMemoryStorage.findById(carId);
        }

        if (currentCar) {
          const currentMileage = currentCar.mileage || 0;
          
          // 새 주행거리가 현재 주행거리보다 높을 때만 업데이트
          if (mileage > currentMileage) {
            try {
              await supabaseCarStorage.update(carId, { mileage });
              console.log(`차량 ${carId}의 주행거리를 ${currentMileage}에서 ${mileage}로 업데이트했습니다.`);
            } catch (supabaseCarUpdateError) {
              console.log('Supabase 차량 주행거리 업데이트 실패, 메모리 저장소 사용:', supabaseCarUpdateError);
              await carMemoryStorage.update(carId, { mileage });
              console.log(`차량 ${carId}의 주행거리를 ${currentMileage}에서 ${mileage}로 업데이트했습니다. (메모리 저장소)`);
            }
          }
        }
      } catch (carUpdateError) {
        console.error('차량 주행거리 업데이트 실패:', carUpdateError);
        // 에러가 발생해도 차계부 생성은 성공했으므로 계속 진행
      }
    }

    return NextResponse.json({
      success: true,
      data: expense,
      source: source,
      message: source === 'supabase' ? '차계부가 성공적으로 저장되었습니다.' : 
               'Supabase 연결 실패로 임시 저장소에 저장되었습니다. expenses 테이블을 생성하세요.'
    });

  } catch (error) {
    console.error('지출 기록 추가 오류:', error);
    return NextResponse.json(
      { success: false, error: '지출 기록 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const carId = searchParams.get('carId');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 필터 조건 구성
    const where: {
      userId: string;
      carId?: string;
      category?: string;
      date?: {
        gte: Date;
        lte: Date;
      };
    } = {
      userId: session.user.id
    };

    if (carId) {
      where.carId = carId;
    }

    if (category) {
      where.category = category;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // 데이터 조회
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          car: {
            select: {
              name: true,
              brand: true,
              model: true,
              licensePlate: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.expense.count({ where })
    ]);

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

    // 차량 소유권 확인
    const car = await prisma.car.findFirst({
      where: {
        id: carId,
        userId: session.user.id
      }
    });

    if (!car) {
      return NextResponse.json(
        { success: false, error: '해당 차량을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 지출 기록 생성
    const expense = await prisma.expense.create({
      data: {
        userId: session.user.id,
        carId,
        category,
        subcategory,
        amount: parseFloat(amount),
        description,
        date: new Date(date || new Date()),
        location,
        mileage: mileage ? parseInt(mileage) : null,
        paymentMethod: paymentMethod || 'CASH',
        receiptImageUrl,
        tags: tags ? JSON.stringify(tags) : null,
        notes,
        isRecurring: isRecurring || false
      },
      include: {
        car: {
          select: {
            name: true,
            brand: true,
            model: true,
            licensePlate: true
          }
        }
      }
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
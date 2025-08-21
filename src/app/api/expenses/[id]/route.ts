import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/expenses/[id] - 특정 지출 기록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const expense = await prisma.expense.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
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

    if (!expense) {
      return NextResponse.json(
        { success: false, error: '지출 기록을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: expense
    });

  } catch (error) {
    console.error('지출 기록 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '지출 기록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/expenses/[id] - 지출 기록 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 기존 기록 확인
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!existingExpense) {
      return NextResponse.json(
        { success: false, error: '지출 기록을 찾을 수 없습니다.' },
        { status: 404 }
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

    // 차량 소유권 확인 (차량이 변경된 경우)
    if (carId && carId !== existingExpense.carId) {
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
    }

    // 지출 기록 수정
    const updatedExpense = await prisma.expense.update({
      where: {
        id: params.id
      },
      data: {
        ...(carId && { carId }),
        ...(category && { category }),
        ...(subcategory !== undefined && { subcategory }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(description && { description }),
        ...(date && { date: new Date(date) }),
        ...(location !== undefined && { location }),
        ...(mileage !== undefined && { mileage: mileage ? parseInt(mileage) : null }),
        ...(paymentMethod && { paymentMethod }),
        ...(receiptImageUrl !== undefined && { receiptImageUrl }),
        ...(tags !== undefined && { tags: tags ? JSON.stringify(tags) : null }),
        ...(notes !== undefined && { notes }),
        ...(isRecurring !== undefined && { isRecurring })
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
      data: updatedExpense
    });

  } catch (error) {
    console.error('지출 기록 수정 오류:', error);
    return NextResponse.json(
      { success: false, error: '지출 기록 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id] - 지출 기록 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 기존 기록 확인
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!existingExpense) {
      return NextResponse.json(
        { success: false, error: '지출 기록을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 지출 기록 삭제
    await prisma.expense.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({
      success: true,
      message: '지출 기록이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('지출 기록 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '지출 기록 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
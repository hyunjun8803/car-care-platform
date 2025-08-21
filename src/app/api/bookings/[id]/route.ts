import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BookingStatus, PaymentStatus } from '@prisma/client';

// GET /api/bookings/[id] - 특정 예약 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        car: {
          select: {
            id: true,
            name: true,
            brand: true,
            model: true,
            licensePlate: true,
            year: true
          }
        },
        shop: {
          select: {
            id: true,
            businessName: true,
            businessNumber: true,
            address: true,
            phone: true,
            email: true,
            operatingHours: true,
            rating: true,
            totalReviews: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            basePrice: true,
            estimatedDuration: true,
            category: {
              select: {
                name: true,
                description: true,
                icon: true
              }
            }
          }
        },
        review: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const transformedBooking = {
      id: booking.id,
      bookingDate: booking.bookingDate.toISOString(),
      bookingTime: booking.bookingTime,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      notes: booking.notes,
      estimatedCost: booking.estimatedCost,
      finalCost: booking.finalCost,
      car: booking.car,
      shop: booking.shop,
      service: {
        ...booking.service,
        category: booking.service.category
      },
      review: booking.review ? {
        ...booking.review,
        createdAt: booking.review.createdAt.toISOString()
      } : null,
      createdAt: booking.createdAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: transformedBooking
    });

  } catch (error) {
    console.error('예약 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id] - 예약 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingDate, bookingTime, notes } = body;

    // 기존 예약 확인
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 수정 가능한 상태인지 확인
    if (!['PENDING', 'CONFIRMED'].includes(existingBooking.status)) {
      return NextResponse.json(
        { error: '현재 상태에서는 예약을 수정할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 업데이트할 데이터 준비
    const updateData: {
      bookingDate?: Date;
      bookingTime?: string;
      notes?: string | null;
    } = {};
    
    if (bookingDate) {
      updateData.bookingDate = new Date(bookingDate);
    }
    
    if (bookingTime) {
      updateData.bookingTime = bookingTime;
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // 날짜나 시간이 변경되는 경우 중복 확인
    if (bookingDate || bookingTime) {
      const checkDate = bookingDate ? new Date(bookingDate) : existingBooking.bookingDate;
      const checkTime = bookingTime || existingBooking.bookingTime;

      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          shopId: existingBooking.shopId,
          bookingDate: checkDate,
          bookingTime: checkTime,
          status: {
            not: 'CANCELLED'
          },
          id: {
            not: params.id
          }
        }
      });

      if (conflictingBooking) {
        return NextResponse.json(
          { error: '해당 시간은 이미 예약되어 있습니다.' },
          { status: 409 }
        );
      }
    }

    // 예약 업데이트
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: updateData,
      include: {
        car: {
          select: {
            name: true,
            brand: true,
            model: true,
            licensePlate: true
          }
        },
        shop: {
          select: {
            businessName: true,
            address: true,
            phone: true
          }
        },
        service: {
          select: {
            name: true,
            description: true,
            basePrice: true,
            estimatedDuration: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: '예약이 성공적으로 수정되었습니다.',
      data: {
        id: updatedBooking.id,
        bookingDate: updatedBooking.bookingDate.toISOString(),
        bookingTime: updatedBooking.bookingTime,
        status: updatedBooking.status,
        notes: updatedBooking.notes,
        estimatedCost: updatedBooking.estimatedCost,
        car: updatedBooking.car,
        shop: updatedBooking.shop,
        service: updatedBooking.service
      }
    });

  } catch (error) {
    console.error('예약 수정 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] - 예약 취소
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 기존 예약 확인
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 취소 가능한 상태인지 확인
    if (['COMPLETED', 'CANCELLED'].includes(existingBooking.status)) {
      return NextResponse.json(
        { error: '이미 완료되었거나 취소된 예약입니다.' },
        { status: 400 }
      );
    }

    // 예약 24시간 전까지만 취소 가능 (비즈니스 규칙)
    const bookingDateTime = new Date(existingBooking.bookingDate);
    const now = new Date();
    const timeDiff = bookingDateTime.getTime() - now.getTime();
    const hoursUntilBooking = timeDiff / (1000 * 3600);

    if (hoursUntilBooking < 24 && existingBooking.status === 'CONFIRMED') {
      return NextResponse.json(
        { error: '예약 24시간 전까지만 취소할 수 있습니다.' },
        { status: 400 }
      );
    }

    // 예약 상태를 취소로 변경
    const cancelledBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        paymentStatus: existingBooking.paymentStatus === 'PAID' ? 'REFUNDED' : existingBooking.paymentStatus
      },
      include: {
        shop: {
          select: {
            businessName: true
          }
        },
        service: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: '예약이 성공적으로 취소되었습니다.',
      data: {
        id: cancelledBooking.id,
        status: cancelledBooking.status,
        paymentStatus: cancelledBooking.paymentStatus,
        shop: cancelledBooking.shop,
        service: cancelledBooking.service
      }
    });

  } catch (error) {
    console.error('예약 취소 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
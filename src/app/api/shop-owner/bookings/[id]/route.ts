import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { sendNotification, NotificationData } from '@/lib/notifications';

// PUT /api/shop-owner/bookings/[id] - 예약 상태 업데이트
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

    // 사용자가 정비소 운영자인지 확인
    const user = await prisma.user.findFirst({
      where: {
        id: session.user.id,
        userType: 'SHOP_OWNER'
      },
      include: {
        shops: {
          where: { isActive: true },
          select: { id: true }
        }
      }
    });

    if (!user || user.shops.length === 0) {
      return NextResponse.json(
        { error: '정비소 운영자 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, finalCost, paymentStatus, notes } = body;

    // 기존 예약 확인 및 권한 검증
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        shopId: {
          in: user.shops.map(shop => shop.id)
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
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

    if (!existingBooking) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없거나 권한이 없습니다.' },
        { status: 404 }
      );
    }

    // 상태 업데이트 유효성 검증
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [], // 완료된 예약은 변경 불가
      CANCELLED: [] // 취소된 예약은 변경 불가
    };

    if (status && !validTransitions[existingBooking.status].includes(status)) {
      return NextResponse.json(
        { error: `현재 상태(${existingBooking.status})에서 ${status}로 변경할 수 없습니다.` },
        { status: 400 }
      );
    }

    // 업데이트할 데이터 준비
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      
      // 상태별 추가 로직
      if (status === 'COMPLETED' && finalCost !== undefined) {
        updateData.finalCost = parseFloat(finalCost);
      }
    }
    
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // 예약 업데이트
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
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
            phone: true,
            address: true
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

    // 상태 변경에 따른 알림 전송 (백그라운드)
    if (status && status !== existingBooking.status) {
      const notificationData: NotificationData = {
        booking: {
          id: updatedBooking.id,
          bookingDate: existingBooking.bookingDate.toISOString(),
          bookingTime: existingBooking.bookingTime,
          status: updatedBooking.status,
          finalCost: updatedBooking.finalCost || undefined,
          estimatedCost: existingBooking.estimatedCost || undefined
        },
        customer: updatedBooking.user,
        shop: updatedBooking.shop,
        service: updatedBooking.service,
        car: updatedBooking.car
      };

      // 백그라운드에서 알림 전송
      setImmediate(async () => {
        try {
          let notificationType: 'booking_confirmed' | 'booking_cancelled' | 'booking_completed';
          
          switch (status) {
            case 'CONFIRMED':
              notificationType = 'booking_confirmed';
              break;
            case 'CANCELLED':
              notificationType = 'booking_cancelled';
              break;
            case 'COMPLETED':
              notificationType = 'booking_completed';
              break;
            default:
              return; // 다른 상태 변경에는 알림 전송하지 않음
          }

          await sendNotification(notificationData, notificationType, ['email', 'sms']);
          console.log(`예약 상태 변경 알림 전송 완료: ${updatedBooking.id} -> ${status}`);
        } catch (error) {
          console.error('예약 상태 변경 알림 전송 오류:', error);
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: '예약 상태가 성공적으로 업데이트되었습니다.',
      data: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        paymentStatus: updatedBooking.paymentStatus,
        finalCost: updatedBooking.finalCost,
        notes: updatedBooking.notes,
        customer: updatedBooking.user,
        car: updatedBooking.car,
        shop: updatedBooking.shop,
        service: updatedBooking.service
      }
    });

  } catch (error) {
    console.error('예약 상태 업데이트 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// GET /api/shop-owner/bookings/[id] - 특정 예약 상세 조회
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

    // 사용자가 정비소 운영자인지 확인
    const user = await prisma.user.findFirst({
      where: {
        id: session.user.id,
        userType: 'SHOP_OWNER'
      },
      include: {
        shops: {
          where: { isActive: true },
          select: { id: true }
        }
      }
    });

    if (!user || user.shops.length === 0) {
      return NextResponse.json(
        { error: '정비소 운영자 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        shopId: {
          in: user.shops.map(shop => shop.id)
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        car: {
          select: {
            id: true,
            name: true,
            brand: true,
            model: true,
            year: true,
            licensePlate: true,
            mileage: true,
            fuelType: true
          }
        },
        shop: {
          select: {
            id: true,
            businessName: true,
            businessNumber: true,
            address: true,
            phone: true
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
                description: true
              }
            }
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없거나 권한이 없습니다.' },
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
      customer: booking.user,
      car: booking.car,
      shop: booking.shop,
      service: {
        ...booking.service,
        category: booking.service.category
      },
      createdAt: booking.createdAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: transformedBooking
    });

  } catch (error) {
    console.error('예약 상세 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
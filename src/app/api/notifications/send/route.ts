import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendNotification, NotificationData } from '@/lib/notifications';

// POST /api/notifications/send - 알림 전송
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId, type, channels = ['email'] } = body;

    // 예약 정보 조회
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        OR: [
          { userId: session.user.id }, // 고객 본인
          { 
            shop: { 
              ownerId: session.user.id,
              owner: { userType: 'SHOP_OWNER' }
            }
          } // 정비소 운영자
        ]
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
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
            basePrice: true
          }
        },
        car: {
          select: {
            name: true,
            licensePlate: true
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

    // 알림 데이터 준비
    const notificationData: NotificationData = {
      booking: {
        id: booking.id,
        bookingDate: booking.bookingDate.toISOString(),
        bookingTime: booking.bookingTime,
        status: booking.status,
        finalCost: booking.finalCost || undefined,
        estimatedCost: booking.estimatedCost || undefined
      },
      customer: booking.user,
      shop: booking.shop,
      service: booking.service,
      car: booking.car
    };

    // 알림 전송
    const results = await sendNotification(notificationData, type, channels);

    return NextResponse.json({
      success: true,
      message: '알림이 전송되었습니다.',
      data: {
        bookingId,
        type,
        channels,
        results
      }
    });

  } catch (error) {
    console.error('알림 전송 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
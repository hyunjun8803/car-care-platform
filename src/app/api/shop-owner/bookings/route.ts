import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';

// GET /api/shop-owner/bookings - 정비소 운영자의 예약 목록 조회
export async function GET(request: NextRequest) {
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
          where: { isActive: true }
        }
      }
    });

    if (!user || user.shops.length === 0) {
      return NextResponse.json(
        { error: '정비소 운영자 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') as BookingStatus | null;
    const shopId = searchParams.get('shopId');
    const date = searchParams.get('date'); // YYYY-MM-DD 형식

    // 운영자의 정비소들
    const shopIds = user.shops.map(shop => shop.id);
    
    // 쿼리 조건 설정
    const whereConditions: any = {
      shopId: {
        in: shopId ? [shopId] : shopIds // 특정 정비소 또는 운영자의 모든 정비소
      }
    };

    if (status) {
      whereConditions.status = status;
    }

    if (date) {
      const targetDate = new Date(date);
      const nextDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);
      
      whereConditions.bookingDate = {
        gte: targetDate,
        lt: nextDate
      };
    }

    // 총 개수 조회
    const total = await prisma.booking.count({
      where: whereConditions
    });

    // 예약 목록 조회
    const bookings = await prisma.booking.findMany({
      where: whereConditions,
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
            licensePlate: true,
            year: true
          }
        },
        shop: {
          select: {
            id: true,
            businessName: true
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
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { bookingDate: 'asc' },
        { bookingTime: 'asc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    const transformedBookings = bookings.map(booking => ({
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
      service: booking.service,
      createdAt: booking.createdAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: transformedBookings,
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('운영자 예약 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
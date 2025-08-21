import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/bookings/[id]/review - 특정 예약의 리뷰 조회
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

    // 예약 확인 (사용자 소유인지)
    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 리뷰 조회
    const review = await prisma.review.findFirst({
      where: {
        bookingId: params.id,
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        shop: {
          select: {
            id: true,
            businessName: true
          }
        }
      }
    });

    if (!review) {
      return NextResponse.json({
        success: true,
        data: null,
        message: '작성된 리뷰가 없습니다.'
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        user: review.user,
        shop: review.shop
      }
    });

  } catch (error) {
    console.error('예약 리뷰 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/reviews - 리뷰 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 쿼리 조건 설정
    const whereConditions: any = {};
    
    if (shopId) {
      whereConditions.shopId = shopId;
    }

    // 총 개수 조회
    const total = await prisma.review.count({
      where: whereConditions
    });

    // 리뷰 목록 조회
    const reviews = await prisma.review.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        booking: {
          select: {
            id: true,
            bookingDate: true,
            service: {
              select: {
                name: true,
                category: {
                  select: {
                    name: true
                  }
                }
              }
            },
            car: {
              select: {
                name: true,
                brand: true,
                model: true
              }
            }
          }
        },
        shop: {
          select: {
            id: true,
            businessName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const transformedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      user: review.user,
      shop: review.shop,
      booking: {
        ...review.booking,
        bookingDate: review.booking.bookingDate.toISOString()
      }
    }));

    return NextResponse.json({
      success: true,
      data: transformedReviews,
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('리뷰 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - 새 리뷰 생성
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
    const { bookingId, rating, comment } = body;

    // 필수 필드 검증
    if (!bookingId || !rating) {
      return NextResponse.json(
        { error: '예약 ID와 평점은 필수입니다.' },
        { status: 400 }
      );
    }

    // 평점 범위 검증
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '평점은 1~5 사이의 값이어야 합니다.' },
        { status: 400 }
      );
    }

    // 예약 확인 (사용자 소유, 완료 상태)
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: session.user.id,
        status: 'COMPLETED'
      },
      include: {
        shop: {
          select: {
            id: true,
            businessName: true
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: '완료된 예약만 리뷰를 작성할 수 있습니다.' },
        { status: 404 }
      );
    }

    // 이미 리뷰가 있는지 확인
    const existingReview = await prisma.review.findFirst({
      where: {
        bookingId,
        userId: session.user.id
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: '이미 리뷰를 작성한 예약입니다.' },
        { status: 409 }
      );
    }

    // 트랜잭션으로 리뷰 생성 및 정비소 평점 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 리뷰 생성
      const review = await tx.review.create({
        data: {
          userId: session.user.id,
          bookingId,
          shopId: booking.shopId,
          rating,
          comment: comment || ''
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

      // 정비소의 평균 평점 및 총 리뷰 수 업데이트
      const avgRating = await tx.review.aggregate({
        where: { shopId: booking.shopId },
        _avg: { rating: true },
        _count: { id: true }
      });

      await tx.shop.update({
        where: { id: booking.shopId },
        data: {
          rating: avgRating._avg.rating || 0,
          totalReviews: avgRating._count.id
        }
      });

      return review;
    });

    return NextResponse.json({
      success: true,
      message: '리뷰가 성공적으로 작성되었습니다.',
      data: {
        id: result.id,
        rating: result.rating,
        comment: result.comment,
        createdAt: result.createdAt.toISOString(),
        user: result.user,
        shop: result.shop
      }
    }, { status: 201 });

  } catch (error) {
    console.error('리뷰 생성 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
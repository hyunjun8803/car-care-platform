import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/reviews/[id] - 리뷰 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await prisma.review.findUnique({
      where: { id: params.id },
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
            bookingTime: true,
            finalCost: true,
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
                model: true,
                licensePlate: true
              }
            }
          }
        },
        shop: {
          select: {
            id: true,
            businessName: true,
            address: true,
            phone: true
          }
        }
      }
    });

    if (!review) {
      return NextResponse.json(
        { error: '리뷰를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
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
      }
    });

  } catch (error) {
    console.error('리뷰 상세 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/reviews/[id] - 리뷰 수정
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
    const { rating, comment } = body;

    // 필수 필드 검증
    if (!rating) {
      return NextResponse.json(
        { error: '평점은 필수입니다.' },
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

    // 기존 리뷰 확인 (작성자 본인인지)
    const existingReview = await prisma.review.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: '리뷰를 찾을 수 없거나 수정 권한이 없습니다.' },
        { status: 404 }
      );
    }

    // 리뷰가 작성된 지 7일 이내인지 확인
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    if (existingReview.createdAt < sevenDaysAgo) {
      return NextResponse.json(
        { error: '리뷰는 작성 후 7일 이내에만 수정할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 트랜잭션으로 리뷰 수정 및 정비소 평점 재계산
    const result = await prisma.$transaction(async (tx) => {
      // 리뷰 수정
      const updatedReview = await tx.review.update({
        where: { id: params.id },
        data: {
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

      // 정비소의 평균 평점 재계산
      const avgRating = await tx.review.aggregate({
        where: { shopId: existingReview.shopId },
        _avg: { rating: true },
        _count: { id: true }
      });

      await tx.shop.update({
        where: { id: existingReview.shopId },
        data: {
          rating: avgRating._avg.rating || 0,
          totalReviews: avgRating._count.id
        }
      });

      return updatedReview;
    });

    return NextResponse.json({
      success: true,
      message: '리뷰가 성공적으로 수정되었습니다.',
      data: {
        id: result.id,
        rating: result.rating,
        comment: result.comment,
        createdAt: result.createdAt.toISOString(),
        user: result.user,
        shop: result.shop
      }
    });

  } catch (error) {
    console.error('리뷰 수정 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - 리뷰 삭제
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

    // 기존 리뷰 확인 (작성자 본인인지)
    const existingReview = await prisma.review.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: '리뷰를 찾을 수 없거나 삭제 권한이 없습니다.' },
        { status: 404 }
      );
    }

    // 리뷰가 작성된 지 7일 이내인지 확인
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    if (existingReview.createdAt < sevenDaysAgo) {
      return NextResponse.json(
        { error: '리뷰는 작성 후 7일 이내에만 삭제할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 트랜잭션으로 리뷰 삭제 및 정비소 평점 재계산
    await prisma.$transaction(async (tx) => {
      // 리뷰 삭제
      await tx.review.delete({
        where: { id: params.id }
      });

      // 정비소의 평균 평점 재계산
      const avgRating = await tx.review.aggregate({
        where: { shopId: existingReview.shopId },
        _avg: { rating: true },
        _count: { id: true }
      });

      await tx.shop.update({
        where: { id: existingReview.shopId },
        data: {
          rating: avgRating._avg.rating || 0,
          totalReviews: avgRating._count.id
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: '리뷰가 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('리뷰 삭제 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
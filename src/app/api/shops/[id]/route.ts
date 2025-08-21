import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/shops/[id] - 특정 정비소 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');

    const shop = await prisma.shop.findFirst({
      where: { 
        id: params.id, 
        isActive: true,
        isVerified: true
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        services: {
          include: {
            category: true
          },
          where: { isAvailable: true },
          orderBy: { category: { name: 'asc' } }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            },
            booking: {
              include: {
                service: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10 // 최근 10개 리뷰
        },
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      }
    });

    if (!shop) {
      return NextResponse.json(
        { error: '정비소를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 거리 계산
    let distance = null;
    if (latitude && longitude && shop.latitude && shop.longitude) {
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      distance = calculateDistance(
        parseFloat(latitude), 
        parseFloat(longitude), 
        shop.latitude, 
        shop.longitude
      );
    }

    // 서비스를 카테고리별로 그룹화
    const servicesByCategory = shop.services.reduce((acc, service) => {
      const categoryName = service.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = {
          category: service.category.name,
          services: []
        };
      }
      acc[categoryName].services.push({
        id: service.id,
        name: service.name,
        description: service.description,
        basePrice: service.basePrice,
        estimatedDuration: service.estimatedDuration
      });
      return acc;
    }, {} as Record<string, any>);

    const transformedShop = {
      id: shop.id,
      businessName: shop.businessName,
      businessNumber: shop.businessNumber,
      address: shop.address,
      latitude: shop.latitude,
      longitude: shop.longitude,
      phone: shop.phone,
      email: shop.email,
      operatingHours: shop.operatingHours,
      rating: shop.rating,
      totalReviews: shop.totalReviews,
      distance: distance ? Math.round(distance * 10) / 10 : null,
      isVerified: shop.isVerified,
      owner: shop.owner,
      serviceCategories: Object.values(servicesByCategory),
      reviews: shop.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        serviceName: review.booking.service.name,
        userName: review.user.name,
        createdAt: review.createdAt.toISOString()
      })),
      stats: {
        totalBookings: shop._count.bookings,
        totalReviews: shop._count.reviews,
        averageRating: shop.rating,
        totalServices: shop.services.length
      },
      createdAt: shop.createdAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: transformedShop
    });

  } catch (error) {
    console.error('정비소 상세 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// GET /api/shops/[id]/services - 정비소의 서비스 목록 조회
export async function POST(
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

    const services = await prisma.service.findMany({
      where: { 
        shopId: params.id,
        isAvailable: true
      },
      include: {
        category: true
      },
      orderBy: [
        { category: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    const servicesByCategory = services.reduce((acc, service) => {
      const categoryName = service.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = {
          category: service.category.name,
          description: service.category.description,
          icon: service.category.icon,
          services: []
        };
      }
      acc[categoryName].services.push({
        id: service.id,
        name: service.name,
        description: service.description,
        basePrice: service.basePrice,
        estimatedDuration: service.estimatedDuration
      });
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      data: Object.values(servicesByCategory)
    });

  } catch (error) {
    console.error('정비소 서비스 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
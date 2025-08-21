import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/expenses/stats - 차계부 통계 조회
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
    const period = searchParams.get('period') || 'month'; // month, year
    
    // 기간 설정
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now.getFullYear(), now.getMonth() + 1, 0); // 이번 달 마지막 날

    if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1); // 올해 첫날
      endDate = new Date(now.getFullYear(), 11, 31); // 올해 마지막 날
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1); // 이번 달 첫날
    }

    // 기본 필터
    const baseWhere: {
      userId: string;
      carId?: string;
      date: {
        gte: Date;
        lte: Date;
      };
    } = {
      userId: session.user.id,
      date: {
        gte: startDate,
        lte: endDate
      }
    };

    if (carId) {
      baseWhere.carId = carId;
    }

    // 1. 총 지출액
    const totalExpense = await prisma.expense.aggregate({
      where: baseWhere,
      _sum: {
        amount: true
      }
    });

    // 2. 카테고리별 지출
    const categoryStats = await prisma.expense.groupBy({
      by: ['category'],
      where: baseWhere,
      _sum: {
        amount: true
      },
      _count: {
        _all: true
      }
    });

    // 3. 월별 지출 추이 (연간 통계인 경우)
    let monthlyStats = null;
    if (period === 'year') {
      monthlyStats = await prisma.$queryRaw`
        SELECT 
          strftime('%m', date) as month,
          SUM(amount) as total,
          COUNT(*) as count
        FROM Expense 
        WHERE userId = ${session.user.id}
          AND date >= ${startDate.toISOString()}
          AND date <= ${endDate.toISOString()}
          ${carId ? `AND carId = '${carId}'` : ''}
        GROUP BY strftime('%m', date)
        ORDER BY month
      `;
    }

    // 4. 결제 방법별 통계
    const paymentMethodStats = await prisma.expense.groupBy({
      by: ['paymentMethod'],
      where: baseWhere,
      _sum: {
        amount: true
      },
      _count: {
        _all: true
      }
    });

    // 5. 최근 지출 트렌드 (최근 7일)
    const recentStartDate = new Date();
    recentStartDate.setDate(recentStartDate.getDate() - 6);
    
    const recentTrend = await prisma.$queryRaw`
      SELECT 
        DATE(date) as date,
        SUM(amount) as total,
        COUNT(*) as count
      FROM Expense 
      WHERE userId = ${session.user.id}
        AND date >= ${recentStartDate.toISOString()}
        AND date <= ${new Date().toISOString()}
        ${carId ? `AND carId = '${carId}'` : ''}
      GROUP BY DATE(date)
      ORDER BY date
    `;

    // 6. 평균 지출
    const avgExpense = totalExpense._sum.amount 
      ? totalExpense._sum.amount / categoryStats.reduce((sum, cat) => sum + cat._count._all, 0)
      : 0;

    // 7. 가장 많이 사용한 장소
    const topLocations = await prisma.expense.groupBy({
      by: ['location'],
      where: {
        ...baseWhere,
        location: {
          not: null
        }
      },
      _sum: {
        amount: true
      },
      _count: {
        _all: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      },
      take: 5
    });

    // 차량별 통계 (carId가 지정되지 않은 경우)
    let carStats = null;
    if (!carId) {
      carStats = await prisma.expense.groupBy({
        by: ['carId'],
        where: {
          userId: session.user.id,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          amount: true
        },
        _count: {
          _all: true
        }
      });

      // 차량 정보 추가
      if (carStats.length > 0) {
        const carIds = carStats.map(stat => stat.carId);
        const cars = await prisma.car.findMany({
          where: {
            id: {
              in: carIds
            }
          },
          select: {
            id: true,
            name: true,
            brand: true,
            model: true,
            licensePlate: true
          }
        });

        carStats = carStats.map(stat => ({
          ...stat,
          car: cars.find(car => car.id === stat.carId)
        }));
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        period,
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        summary: {
          totalAmount: totalExpense._sum.amount || 0,
          averageAmount: avgExpense,
          totalTransactions: categoryStats.reduce((sum, cat) => sum + cat._count._all, 0)
        },
        categoryStats: categoryStats.map(stat => ({
          category: stat.category,
          amount: stat._sum.amount || 0,
          count: stat._count._all,
          percentage: totalExpense._sum.amount 
            ? ((stat._sum.amount || 0) / totalExpense._sum.amount * 100)
            : 0
        })),
        paymentMethodStats: paymentMethodStats.map(stat => ({
          method: stat.paymentMethod,
          amount: stat._sum.amount || 0,
          count: stat._count._all
        })),
        monthlyStats,
        recentTrend,
        topLocations: topLocations.map(loc => ({
          location: loc.location,
          amount: loc._sum.amount || 0,
          count: loc._count._all
        })),
        carStats
      }
    });

  } catch (error) {
    console.error('차계부 통계 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
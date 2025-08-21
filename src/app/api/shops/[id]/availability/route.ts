import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/shops/[id]/availability - 정비소 예약 가능 시간 조회
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

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD 형식
    const serviceId = searchParams.get('serviceId');

    if (!date) {
      return NextResponse.json(
        { error: '날짜를 지정해주세요.' },
        { status: 400 }
      );
    }

    // 정비소 확인
    const shop = await prisma.shop.findFirst({
      where: {
        id: params.id,
        isActive: true,
        isVerified: true
      },
      select: {
        id: true,
        businessName: true,
        operatingHours: true
      }
    });

    if (!shop) {
      return NextResponse.json(
        { error: '정비소를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 해당 날짜의 기존 예약 조회
    const existingBookings = await prisma.booking.findMany({
      where: {
        shopId: params.id,
        bookingDate: new Date(date),
        status: {
          not: 'CANCELLED'
        }
      },
      select: {
        bookingTime: true,
        service: {
          select: {
            estimatedDuration: true
          }
        }
      }
    });

    // 서비스 정보 조회 (특정 서비스가 지정된 경우)
    let selectedService = null;
    if (serviceId) {
      selectedService = await prisma.service.findFirst({
        where: {
          id: serviceId,
          shopId: params.id,
          isAvailable: true
        },
        select: {
          id: true,
          name: true,
          estimatedDuration: true
        }
      });

      if (!selectedService) {
        return NextResponse.json(
          { error: '서비스를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
    }

    // 기본 운영 시간 (9:00 - 18:00, 1시간 간격)
    const timeSlots = [
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
    ];

    // 예약된 시간대 계산
    const bookedSlots = new Set<string>();
    
    existingBookings.forEach(booking => {
      const bookingTime = booking.bookingTime;
      const duration = booking.service.estimatedDuration;
      
      // 예약 시간부터 duration만큼 시간대를 블록
      const startHour = parseInt(bookingTime.split(':')[0]);
      const blockedHours = Math.ceil(duration / 60);
      
      for (let i = 0; i < blockedHours; i++) {
        const blockedHour = startHour + i;
        if (blockedHour < 24) {
          const blockedTime = `${blockedHour.toString().padStart(2, '0')}:00`;
          bookedSlots.add(blockedTime);
        }
      }
    });

    // 현재 시간 이후만 예약 가능 (당일인 경우)
    const now = new Date();
    const requestDate = new Date(date);
    const isToday = now.toDateString() === requestDate.toDateString();

    const availableSlots = timeSlots.map(timeSlot => {
      const isBooked = bookedSlots.has(timeSlot);
      
      let isPastTime = false;
      if (isToday) {
        const slotTime = new Date(date + 'T' + timeSlot + ':00');
        isPastTime = slotTime <= now;
      }

      // 서비스 duration을 고려한 마감 시간 체크
      let isTooLate = false;
      if (selectedService) {
        const slotHour = parseInt(timeSlot.split(':')[0]);
        const serviceDurationHours = Math.ceil(selectedService.estimatedDuration / 60);
        const endHour = slotHour + serviceDurationHours;
        
        // 18시까지 운영이므로 서비스가 18시 전에 끝나야 함
        if (endHour > 18) {
          isTooLate = true;
        }
      }

      return {
        time: timeSlot,
        available: !isBooked && !isPastTime && !isTooLate,
        reason: isBooked ? '이미 예약됨' : 
                isPastTime ? '지난 시간' : 
                isTooLate ? '서비스 시간 부족' : null
      };
    });

    // 주말/휴일 체크 (간단한 구현 - 실제로는 더 복잡한 로직 필요)
    const dayOfWeek = requestDate.getDay(); // 0: 일요일, 6: 토요일
    const isWeekend = dayOfWeek === 0; // 일요일은 휴무

    if (isWeekend) {
      availableSlots.forEach(slot => {
        slot.available = false;
        slot.reason = '휴무일';
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        shopId: params.id,
        shopName: shop.businessName,
        date: date,
        operatingHours: shop.operatingHours,
        selectedService: selectedService,
        timeSlots: availableSlots,
        summary: {
          totalSlots: timeSlots.length,
          availableSlots: availableSlots.filter(slot => slot.available).length,
          bookedSlots: availableSlots.filter(slot => slot.reason === '이미 예약됨').length
        }
      }
    });

  } catch (error) {
    console.error('예약 가능 시간 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { checkAndSendReminders } from '@/lib/notifications';

// GET /api/notifications/reminder - 예약 리마인더 전송 (cron job용)
export async function GET(request: NextRequest) {
  try {
    // API 키 검증 (보안을 위해)
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.CRON_SECRET_KEY || 'your-cron-secret-key';
    
    if (authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    console.log('예약 리마인더 전송 시작...');
    const results = await checkAndSendReminders();

    return NextResponse.json({
      success: true,
      message: `리마인더 전송 완료: ${results.length}건`,
      data: {
        processedCount: results.length,
        results: results.map(r => ({
          bookingId: r.bookingId,
          emailSuccess: r.result.find(res => res.channel === 'email')?.success || false,
          smsSuccess: r.result.find(res => res.channel === 'sms')?.success || false
        }))
      }
    });

  } catch (error) {
    console.error('리마인더 전송 오류:', error);
    return NextResponse.json(
      { 
        error: '리마인더 전송 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/notifications/reminder - 수동 리마인더 전송
export async function POST(request: NextRequest) {
  try {
    console.log('수동 리마인더 전송 시작...');
    const results = await checkAndSendReminders();

    return NextResponse.json({
      success: true,
      message: `수동 리마인더 전송 완료: ${results.length}건`,
      data: {
        processedCount: results.length,
        results
      }
    });

  } catch (error) {
    console.error('수동 리마인더 전송 오류:', error);
    return NextResponse.json(
      { 
        error: '리마인더 전송 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
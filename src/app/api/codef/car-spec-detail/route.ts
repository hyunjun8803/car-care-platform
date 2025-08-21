import { NextRequest, NextResponse } from 'next/server';
import { callCodefApiWithRetry, CarSpecParams } from '@/lib/codef';

/**
 * CODEF "자동차 제원 상세 정보" API 호출
 * POST /api/codef/car-spec-detail
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[API] CODEF 자동차 제원 상세 정보 요청 시작');

    // 요청 본문 파싱
    const body: CarSpecParams = await request.json();
    
    // 필수 파라미터 검증
    if (!body.makerCode || !body.modelName || !body.year) {
      console.error('[API] 필수 파라미터 누락:', body);
      return NextResponse.json(
        { 
          error: '필수 파라미터가 누락되었습니다.',
          required: ['makerCode', 'modelName', 'year'],
          received: body
        },
        { status: 400 }
      );
    }

    console.log('[API] 요청 파라미터:', {
      makerCode: body.makerCode,
      modelName: body.modelName,
      year: body.year,
      trim: body.trim || 'N/A',
      fuel: body.fuel || 'N/A',
      transmission: body.transmission || 'N/A'
    });

    // CODEF API 호출 (토큰 만료 시 자동 재시도)
    const result = await callCodefApiWithRetry(body);

    console.log('[API] CODEF API 응답 성공:', {
      result_code: result.result?.code,
      result_message: result.result?.message,
      data_count: result.data?.length || 0,
      transaction_id: result.result?.transactionId
    });

    // CODEF API 응답 그대로 반환
    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('[API] CODEF API 호출 중 오류:', error);

    // 인증 오류 (401/403)
    if (error.message.includes('401') || error.message.includes('403')) {
      return NextResponse.json(
        { 
          error: 'CODEF API 인증 실패',
          message: 'API 인증 정보를 확인해주세요.',
          details: error.message
        },
        { status: 401 }
      );
    }

    // 기타 오류
    return NextResponse.json(
      { 
        error: 'CODEF API 호출 실패',
        message: error.message || '알 수 없는 오류가 발생했습니다.',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET 요청은 허용하지 않음
 */
export async function GET() {
  return NextResponse.json(
    { 
      error: 'Method Not Allowed',
      message: 'POST 요청만 허용됩니다.',
      usage: {
        method: 'POST',
        endpoint: '/api/codef/car-spec-detail',
        headers: { 'Content-Type': 'application/json' },
        body: {
          makerCode: '현대',
          modelName: '그랜저',
          year: '2021',
          trim: 'HG300 하이브리드',
          fuel: '하이브리드',
          transmission: 'AT'
        }
      }
    },
    { status: 405 }
  );
}

/**
 * 기타 HTTP 메서드는 허용하지 않음
 */
export async function PUT() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
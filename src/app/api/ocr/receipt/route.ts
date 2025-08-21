import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// OCR 결과 타입 정의
interface OCRResult {
  amount?: number;
  date?: string;
  location?: string;
  category?: string;
  subcategory?: string;
  paymentMethod?: string;
  description?: string;
  confidence: number;
  extractedText: string;
}

// POST /api/ocr/receipt - 영수증 OCR 처리
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // multipart/form-data로 이미지 받기
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { success: false, error: '이미지가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 이미지 검증
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: '이미지 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (10MB)
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: '이미지 크기는 10MB 이하여야 합니다.' },
        { status: 400 }
      );
    }

    // OCR 처리 (현재는 시뮬레이션)
    const ocrResult = await processReceiptOCR(image);

    return NextResponse.json({
      success: true,
      data: ocrResult
    });

  } catch (error) {
    console.error('OCR 처리 오류:', error);
    return NextResponse.json(
      { success: false, error: 'OCR 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// OCR 처리 함수 (시뮬레이션)
async function processReceiptOCR(image: File): Promise<OCRResult> {
  // 실제 구현에서는 Google Vision API, Tesseract.js, 또는 다른 OCR 서비스 사용
  // 현재는 데모용 시뮬레이션
  
  const demoTexts = [
    // 주유소 영수증 시뮬레이션
    {
      text: `
        GS칼텍스 강남역점
        서울시 강남구 테헤란로 123
        2024-08-12 14:30:25
        휘발유(91) 65.5L
        단가: 1,580원/L
        합계: 103,490원
        신용카드 결제
      `,
      amount: 103490,
      date: '2024-08-12',
      location: 'GS칼텍스 강남역점',
      category: 'FUEL',
      subcategory: '휘발유',
      paymentMethod: 'CARD',
      description: '주유 (65.5L)',
      confidence: 0.92
    },
    // 정비소 영수증 시뮬레이션
    {
      text: `
        현대 블루핸즈 강남점
        서울시 강남구 논현로 456
        2024-08-10 10:15:00
        엔진오일 교환
        부품비: 85,000원
        공임비: 35,000원
        합계: 120,000원
        카드결제
      `,
      amount: 120000,
      date: '2024-08-10',
      location: '현대 블루핸즈 강남점',
      category: 'MAINTENANCE',
      subcategory: '엔진오일',
      paymentMethod: 'CARD',
      description: '정기점검 및 엔진오일 교환',
      confidence: 0.88
    }
  ];

  // 랜덤하게 하나의 시뮬레이션 결과 선택
  const randomResult = demoTexts[Math.floor(Math.random() * demoTexts.length)];

  // 실제 OCR 처리 시뮬레이션 (1-2초 대기)
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000));

  return {
    amount: randomResult.amount,
    date: randomResult.date,
    location: randomResult.location,
    category: randomResult.category,
    subcategory: randomResult.subcategory,
    paymentMethod: randomResult.paymentMethod,
    description: randomResult.description,
    confidence: randomResult.confidence,
    extractedText: randomResult.text.trim()
  };
}

// 실제 OCR API 구현 예시 (Google Vision API)
/*
import { ImageAnnotatorClient } from '@google-cloud/vision';

async function processReceiptOCRReal(image: File): Promise<OCRResult> {
  const client = new ImageAnnotatorClient({
    keyFilename: 'path/to/service-account-key.json'
  });

  // 이미지를 버퍼로 변환
  const imageBuffer = await image.arrayBuffer();
  const buffer = Buffer.from(imageBuffer);

  // OCR 실행
  const [result] = await client.textDetection(buffer);
  const detections = result.textAnnotations;
  
  if (!detections || detections.length === 0) {
    throw new Error('텍스트를 찾을 수 없습니다.');
  }

  const extractedText = detections[0].description || '';
  
  // 텍스트에서 정보 추출
  const parsedData = parseReceiptText(extractedText);
  
  return {
    ...parsedData,
    extractedText,
    confidence: 0.85
  };
}

function parseReceiptText(text: string): Partial<OCRResult> {
  const result: Partial<OCRResult> = {};
  
  // 금액 추출 (예: 123,456원, ￦123,456)
  const amountMatch = text.match(/[￦₩]?\s?([0-9,]+)\s?원/);
  if (amountMatch) {
    result.amount = parseInt(amountMatch[1].replace(/,/g, ''));
  }
  
  // 날짜 추출 (예: 2024-08-12, 2024/08/12)
  const dateMatch = text.match(/(\d{4})[-\/](\d{2})[-\/](\d{2})/);
  if (dateMatch) {
    result.date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
  }
  
  // 주유소/정비소 패턴 인식
  if (text.includes('주유') || text.includes('휘발유') || text.includes('경유')) {
    result.category = 'FUEL';
    if (text.includes('휘발유')) result.subcategory = '휘발유';
    if (text.includes('경유')) result.subcategory = '경유';
  } else if (text.includes('정비') || text.includes('수리') || text.includes('오일')) {
    result.category = 'MAINTENANCE';
    if (text.includes('오일')) result.subcategory = '엔진오일';
  }
  
  // 결제방법 추출
  if (text.includes('카드') || text.includes('신용카드')) {
    result.paymentMethod = 'CARD';
  } else if (text.includes('현금')) {
    result.paymentMethod = 'CASH';
  }
  
  return result;
}
*/
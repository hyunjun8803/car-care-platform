// CODEF API 연동 유틸리티
interface CodefTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface CodefError {
  result: {
    code: string;
    extraMessage: string;
    message: string;
    transactionId: string;
  };
}

/**
 * CODEF OAuth2 Client Credentials 방식으로 access_token 발급
 */
export async function getCodefAccessToken(): Promise<string> {
  const clientId = process.env.CODEF_CLIENT_ID;
  const clientSecret = process.env.CODEF_CLIENT_SECRET;
  const oauthUrl = process.env.CODEF_OAUTH_URL || 'https://oauth.codef.io/oauth/token';

  if (!clientId || !clientSecret) {
    throw new Error('CODEF_CLIENT_ID 또는 CODEF_CLIENT_SECRET 환경변수가 설정되지 않았습니다.');
  }

  try {
    console.log('[CODEF] Access Token 발급 요청 시작');
    
    const response = await fetch(oauthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'read'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CODEF] Token 발급 실패:', response.status, errorText);
      throw new Error(`CODEF 토큰 발급 실패: ${response.status} ${errorText}`);
    }

    const tokenData: CodefTokenResponse = await response.json();
    console.log('[CODEF] Access Token 발급 성공:', {
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      scope: tokenData.scope,
      token_preview: tokenData.access_token.substring(0, 20) + '...'
    });

    return tokenData.access_token;
  } catch (error) {
    console.error('[CODEF] Access Token 발급 중 오류:', error);
    throw error;
  }
}

/**
 * CODEF "자동차 제원 상세 정보" API 호출
 */
export async function getCarSpecDetail(accessToken: string, params: CarSpecParams): Promise<any> {
  const apiBase = process.env.CODEF_API_BASE || 'https://development.codef.io';
  const apiUrl = `${apiBase}/v1/kr/public/mw/car-general-regist/used-car-common-info-detail`;

  try {
    console.log('[CODEF] 자동차 제원 상세 정보 API 호출:', {
      url: apiUrl,
      params: params
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    // CODEF API는 때때로 URL-encoded 응답을 반환할 수 있음
    const responseText = await response.text();
    
    let responseData;
    try {
      // JSON 파싱 시도
      responseData = JSON.parse(responseText);
    } catch (e) {
      // URL-encoded 응답인 경우 디코딩 후 JSON 파싱
      console.log('[CODEF] URL-encoded 응답 감지, 디코딩 시도');
      try {
        const decodedText = decodeURIComponent(responseText);
        responseData = JSON.parse(decodedText);
      } catch (e2) {
        console.error('[CODEF] 응답 파싱 실패:', { responseText: responseText.substring(0, 200) });
        throw new Error(`CODEF API 응답 파싱 실패: ${e2.message}`);
      }
    }

    if (!response.ok) {
      console.error('[CODEF] API 호출 실패:', response.status, responseData);
      throw new Error(`CODEF API 호출 실패: ${response.status}`);
    }

    console.log('[CODEF] API 호출 성공:', {
      result_code: responseData.result?.code,
      data_count: responseData.data?.length || 0
    });

    return responseData;
  } catch (error) {
    console.error('[CODEF] API 호출 중 오류:', error);
    throw error;
  }
}

/**
 * 토큰 만료 확인 및 재발급 후 재시도
 */
export async function callCodefApiWithRetry(params: CarSpecParams): Promise<any> {
  try {
    // 첫 번째 시도
    let accessToken = await getCodefAccessToken();
    let result = await getCarSpecDetail(accessToken, params);
    
    return result;
  } catch (error: any) {
    console.log('[CODEF] 첫 번째 시도 실패, 토큰 재발급 후 재시도');
    
    // 토큰 만료 등의 인증 오류 시 재시도
    if (error.message.includes('401') || error.message.includes('403')) {
      try {
        // 토큰 재발급 후 재시도
        const newAccessToken = await getCodefAccessToken();
        const retryResult = await getCarSpecDetail(newAccessToken, params);
        
        console.log('[CODEF] 재시도 성공');
        return retryResult;
      } catch (retryError) {
        console.error('[CODEF] 재시도도 실패:', retryError);
        throw retryError;
      }
    }
    
    throw error;
  }
}

// 자동차 제원 정보 파라미터 인터페이스
export interface CarSpecParams {
  makerCode: string;      // 제조사 코드 (예: "현대", "기아", "쌍용" 등)
  modelName: string;      // 모델명 (예: "그랜저", "쏘나타" 등)
  year: string;          // 연식 (예: "2021")
  trim?: string;         // 트림 (예: "HG300 하이브리드")
  fuel?: string;         // 연료 (예: "가솔린", "디젤", "LPG", "하이브리드" 등)
  transmission?: string; // 변속기 (예: "AT", "MT", "CVT" 등)
  displacement?: string; // 배기량 (예: "2000")
  grade?: string;        // 등급 (예: "고급형")
}

// CODEF API 응답 타입
export interface CodefApiResponse {
  result: {
    code: string;
    extraMessage: string;
    message: string;
    transactionId: string;
  };
  data: CarSpecData[];
}

export interface CarSpecData {
  resCarName: string;          // 차량명
  resCarCode: string;          // 차량코드
  resMakerName: string;        // 제조사명
  resModelName: string;        // 모델명
  resYear: string;             // 연식
  resTrim: string;             // 트림
  resFuel: string;             // 연료
  resTransmission: string;     // 변속기
  resDisplacement: string;     // 배기량
  resGrade: string;            // 등급
  resEngine: string;           // 엔진형식
  resPower: string;            // 최고출력
  resTorque: string;           // 최대토크
  resFuelEfficiency: string;   // 연비
  resLength: string;           // 전장
  resWidth: string;            // 전폭
  resHeight: string;           // 전고
  resWheelbase: string;        // 축거
  resWeight: string;           // 공차중량
  resSeating: string;          // 승차정원
  resDriveType: string;        // 구동방식
}
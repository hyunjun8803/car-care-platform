import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// API 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationInfo {
  current: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: PaginationInfo;
}

// 성공 응답 생성
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message })
  };
  
  return NextResponse.json(response, { status });
}

// 페이지네이션된 성공 응답 생성
export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationInfo,
  message?: string
): NextResponse {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination,
    ...(message && { message })
  };
  
  return NextResponse.json(response);
}

// 에러 응답 생성
export function createErrorResponse(
  error: string,
  status: number = 400
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error
  };
  
  return NextResponse.json(response, { status });
}

// 인증 확인 미들웨어
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new ApiError('인증이 필요합니다.', 401);
  }
  
  return {
    userId: 'user1', // 실제로는 session.user.id 사용
    session
  };
}

// API 에러 클래스
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 에러 핸들러
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    return createErrorResponse(error.message, error.status);
  }
  
  if (error instanceof Error) {
    return createErrorResponse(error.message, 500);
  }
  
  return createErrorResponse('서버 오류가 발생했습니다.', 500);
}

// 데이터 검증 유틸리티
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): void {
  for (const field of requiredFields) {
    if (!data[field] && data[field] !== 0 && data[field] !== false) {
      throw new ApiError(`${field} 필드는 필수입니다.`);
    }
  }
}

// 차량 데이터 검증
export function validateCarData(data: Record<string, unknown>): void {
  // 연도 검증
  if (data.year !== undefined) {
    const currentYear = new Date().getFullYear();
    if (data.year < 1990 || data.year > currentYear + 1) {
      throw new ApiError('올바른 연도를 입력하세요.');
    }
  }
  
  // 주행거리 검증
  if (data.mileage !== undefined && data.mileage < 0) {
    throw new ApiError('주행거리는 0 이상이어야 합니다.');
  }
}

// 정비 기록 데이터 검증
export function validateMaintenanceData(data: Record<string, unknown>): void {
  // 비용 검증
  if (data.cost !== undefined && data.cost < 0) {
    throw new ApiError('비용은 0 이상이어야 합니다.');
  }
  
  // 주행거리 검증
  if (data.mileage !== undefined && data.mileage < 0) {
    throw new ApiError('주행거리는 0 이상이어야 합니다.');
  }
  
  // 날짜 검증
  if (data.date) {
    const maintenanceDate = new Date(data.date);
    const now = new Date();
    if (maintenanceDate > now) {
      throw new ApiError('정비 날짜는 미래일 수 없습니다.');
    }
    
    // 유효한 날짜인지 확인
    if (isNaN(maintenanceDate.getTime())) {
      throw new ApiError('올바른 날짜 형식을 입력하세요.');
    }
  }
}

// 페이지네이션 파라미터 파싱
export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  
  return { page, limit };
}

// 검색 파라미터 파싱
export function parseSearchParams(searchParams: URLSearchParams) {
  const search = searchParams.get('search')?.trim() || '';
  const carId = searchParams.get('carId') || '';
  
  return { search, carId };
}

// 배열 페이지네이션
export function paginateArray<T>(
  array: T[],
  page: number,
  limit: number
): { data: T[]; pagination: PaginationInfo } {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const data = array.slice(startIndex, endIndex);
  
  const pagination: PaginationInfo = {
    current: page,
    limit,
    total: array.length,
    pages: Math.ceil(array.length / limit)
  };
  
  return { data, pagination };
}

// 데이터 정렬
export function sortByDate<T extends { date: string }>(
  array: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return array.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}

// 검색 필터
export function filterBySearch<T>(
  array: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchTerm) return array;
  
  const searchLower = searchTerm.toLowerCase();
  return array.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      return typeof value === 'string' && 
             value.toLowerCase().includes(searchLower);
    })
  );
}

// CORS 헤더 설정
export function setCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  
  return response;
}
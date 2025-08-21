import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export type UserType = 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  userType: UserType;
}

// 서버 컴포넌트용 인증 확인
export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name || undefined,
    userType: session.user.userType as UserType
  };
}

// API 라우트용 인증 확인
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  
  return user;
}

// 특정 사용자 타입 확인
export async function requireUserType(...allowedTypes: UserType[]): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (!allowedTypes.includes(user.userType)) {
    throw new Error('FORBIDDEN');
  }
  
  return user;
}

// 관리자 권한 확인
export async function requireAdmin(): Promise<AuthUser> {
  return await requireUserType('ADMIN');
}

// 정비소 운영자 권한 확인
export async function requireShopOwner(): Promise<AuthUser> {
  return await requireUserType('SHOP_OWNER', 'ADMIN');
}

// 일반 고객 권한 확인
export async function requireCustomer(): Promise<AuthUser> {
  return await requireUserType('CUSTOMER', 'ADMIN');
}

// API 에러 응답 헬퍼
export function createAuthErrorResponse(error: unknown): NextResponse {
  if (error instanceof Error) {
    switch (error.message) {
      case 'UNAUTHORIZED':
        return NextResponse.json(
          { error: '로그인이 필요합니다.' },
          { status: 401 }
        );
      case 'FORBIDDEN':
        return NextResponse.json(
          { error: '접근 권한이 없습니다.' },
          { status: 403 }
        );
    }
  }
  
  return NextResponse.json(
    { error: '서버 오류가 발생했습니다.' },
    { status: 500 }
  );
}

// 권한별 리다이렉션 경로
export function getRedirectPath(userType: UserType): string {
  switch (userType) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'SHOP_OWNER':
      return '/shop-owner/dashboard';
    case 'CUSTOMER':
    default:
      return '/dashboard';
  }
}

// 권한 확인 미들웨어 헬퍼
export function hasPermission(userType: UserType, requiredTypes: UserType[]): boolean {
  // ADMIN은 모든 권한을 가짐
  if (userType === 'ADMIN') {
    return true;
  }
  
  return requiredTypes.includes(userType);
}

// 페이지별 필요 권한 매핑
export const pagePermissions: Record<string, UserType[]> = {
  '/dashboard': ['CUSTOMER', 'SHOP_OWNER', 'ADMIN'],
  '/cars': ['CUSTOMER', 'ADMIN'],
  '/bookings': ['CUSTOMER', 'ADMIN'],
  '/expenses': ['CUSTOMER', 'ADMIN'],
  '/maintenance': ['CUSTOMER', 'ADMIN'],
  '/shop-owner': ['SHOP_OWNER', 'ADMIN'],
  '/shop-owner/dashboard': ['SHOP_OWNER', 'ADMIN'],
  '/shop-owner/bookings': ['SHOP_OWNER', 'ADMIN'],
  '/admin': ['ADMIN'],
  '/profile': ['CUSTOMER', 'SHOP_OWNER', 'ADMIN'],
  '/settings': ['CUSTOMER', 'SHOP_OWNER', 'ADMIN'],
};

// 페이지 접근 권한 확인
export function canAccessPage(path: string, userType: UserType): boolean {
  const requiredTypes = pagePermissions[path];
  
  if (!requiredTypes) {
    // 권한이 정의되지 않은 페이지는 기본적으로 접근 허용
    return true;
  }
  
  return hasPermission(userType, requiredTypes);
}
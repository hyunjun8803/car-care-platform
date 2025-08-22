import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

type UserType = 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN';

// 페이지별 필요 권한 매핑 (auth-utils에서 복사)
const pagePermissions: Record<string, UserType[]> = {
  '/dashboard': ['CUSTOMER', 'SHOP_OWNER', 'ADMIN'],
  '/cars': ['CUSTOMER', 'ADMIN'],
  '/booking': ['CUSTOMER', 'ADMIN'],
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

// 권한 확인 함수 (auth-utils에서 복사)
function hasPermission(userType: UserType, requiredTypes: UserType[]): boolean {
  // ADMIN은 모든 권한을 가짐
  if (userType === 'ADMIN') {
    return true;
  }
  
  return requiredTypes.includes(userType);
}

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // API routes (except /api/auth) are always public
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // 공개 경로들 (인증 불필요)
  const publicPaths = ['/', '/auth', '/shops']
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // /api/auth routes are handled by NextAuth
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Get token for protected routes
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // 인증이 필요한 경로
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  const userType = token.userType as string

  // 사용자 타입별 기본 대시보드로 리다이렉션
  if (pathname === '/dashboard') {
    if (userType === 'SHOP_OWNER') {
      return NextResponse.redirect(new URL('/shop-owner/dashboard', req.url))
    }
  }

  // 관리자 페이지 접근 제한
  if (pathname.startsWith('/admin') && userType !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // 정비소 운영자 페이지 접근 제한  
  if (pathname.startsWith('/shop-owner') && 
      !hasPermission(userType as UserType, ['SHOP_OWNER', 'ADMIN'])) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // 페이지별 권한 확인
  const requiredTypes = pagePermissions[pathname]
  if (requiredTypes) {
    if (!hasPermission(userType as UserType, requiredTypes)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
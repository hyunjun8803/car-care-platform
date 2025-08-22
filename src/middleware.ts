import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

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

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // 인증된 사용자의 권한 기반 라우팅
    if (token) {
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
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        
        // 공개 경로들 (인증 불필요)
        const publicPaths = ['/', '/auth', '/shops', '/api/auth']
        if (publicPaths.some(path => pathname.startsWith(path))) {
          return true
        }

        // 인증이 필요한 경로
        if (!token) {
          return false
        }

        // 페이지별 권한 확인
        const requiredTypes = pagePermissions[pathname]
        if (requiredTypes) {
          const userType = token.userType as UserType
          return hasPermission(userType, requiredTypes)
        }

        // 기본적으로 인증된 사용자는 접근 허용
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * 미들웨어를 적용할 경로들:
     * - /api/auth/* (인증 관련 API)  
     * - 모든 페이지 경로 (단, 정적 파일 제외)
     * - API routes는 /api/auth를 제외하고 모두 제외
     */
    '/api/auth/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
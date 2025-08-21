"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/ui/mobile-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Car, User, LogOut, Settings, Calendar } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CarCare
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {session && (
              <Link 
                href="/dashboard" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group"
              >
                대시보드
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></div>
              </Link>
            )}
            
            {/* 고객용 메뉴 */}
            {session?.user?.userType === 'CUSTOMER' && (
              <>
                <Link 
                  href="/cars" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group"
                >
                  내 차량
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></div>
                </Link>
                <Link 
                  href="/bookings" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group"
                >
                  예약 관리
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></div>
                </Link>
                <Link 
                  href="/expenses" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group"
                >
                  차계부
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></div>
                </Link>
              </>
            )}

            {/* 정비소 운영자용 메뉴 */}
            {session?.user?.userType === 'SHOP_OWNER' && (
              <>
                <Link 
                  href="/shop-owner/bookings" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group"
                >
                  예약 관리
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></div>
                </Link>
              </>
            )}

            {/* 공통 메뉴 */}
            <Link 
              href="/shops" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group"
            >
              정비소 찾기
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></div>
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {/* Desktop Auth */}
            {session ? (
              <div className="hidden md:flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors duration-200">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold">
                        {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-700">{session.user?.name}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>내 계정</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center space-x-2 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        <span>프로필 관리</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center space-x-2 cursor-pointer">
                        <Calendar className="h-4 w-4" />
                        <span>대시보드</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                      onClick={() => signOut()}
                    >
                      <div className="flex items-center space-x-2">
                        <LogOut className="h-4 w-4" />
                        <span>로그아웃</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/auth/signin">
                  <Button variant="outline" size="sm" className="border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200">
                    로그인
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200">
                    회원가입
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Mobile Menu */}
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
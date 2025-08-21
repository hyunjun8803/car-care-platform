"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X, Car, User, LogOut, Home, Calendar, MapPin } from "lucide-react";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="md:hidden">
      {/* Menu Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleMenu}
        className="border-gray-200 text-gray-600"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={toggleMenu}>
          <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-2xl transform transition-transform duration-300">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Car className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    CarCare
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={toggleMenu}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="space-y-4 mb-8">
                <Link 
                  href="/dashboard" 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={toggleMenu}
                >
                  <Home className="h-5 w-5" />
                  <span className="font-medium">대시보드</span>
                </Link>
                <Link 
                  href="/cars" 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={toggleMenu}
                >
                  <Car className="h-5 w-5" />
                  <span className="font-medium">내 차량</span>
                </Link>
                <Link 
                  href="/shops" 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={toggleMenu}
                >
                  <MapPin className="h-5 w-5" />
                  <span className="font-medium">정비소 찾기</span>
                </Link>
                <Link 
                  href="/bookings" 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={toggleMenu}
                >
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">예약 관리</span>
                </Link>
              </nav>

              {/* Auth Section */}
              <div className="border-t pt-6">
                {session ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-700">{session.user?.name}</span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        signOut();
                        toggleMenu();
                      }}
                      className="w-full flex items-center justify-center space-x-2 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>로그아웃</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link href="/auth/signin" onClick={toggleMenu}>
                      <Button variant="outline" className="w-full">
                        로그인
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={toggleMenu}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                        회원가입
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
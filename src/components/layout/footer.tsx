import Link from "next/link";
import { Car, Mail, Phone, MapPin, Calendar } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Car className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CarCare
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              대한민국 최고의 스마트 차량 관리 플랫폼으로<br />
              10만+ 운전자가 신뢰하는 서비스입니다.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center text-gray-300 text-sm">
                <Mail className="h-4 w-4 mr-2" />
                help@carcare.kr
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">서비스</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/cars" className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center">
                  <Car className="h-4 w-4 mr-2" />
                  차계부 관리
                </Link>
              </li>
              <li>
                <Link href="/shops" className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  정비소 찾기
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  예약 관리
                </Link>
              </li>
            </ul>
          </div>

          {/* Business */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">정비소 사업자</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/auth/signup/shop" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                  정비소 등록
                </Link>
              </li>
              <li>
                <Link href="/shop-owner/dashboard" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                  정비소 관리
                </Link>
              </li>
              <li>
                <Link href="/shop-owner/bookings" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                  예약 관리
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">고객센터</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                  대시보드
                </Link>
              </li>
              <li>
                <Link href="/cars" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                  차량 관리
                </Link>
              </li>
              <li>
                <Link href="/shops" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                  정비소 찾기
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                  예약 관리
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm">
              © 2024 CarCare. All rights reserved. | Made with ❤️ in Korea
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="flex items-center text-gray-400 text-sm">
                <Phone className="h-4 w-4 mr-2" />
                1588-0000
              </div>
              <div className="text-gray-400">|</div>
              <div className="text-gray-400 text-sm">
                평일 09:00-18:00
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
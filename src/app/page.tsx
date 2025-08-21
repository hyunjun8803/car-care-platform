import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Car, Calendar, MapPin, Shield, TrendingUp, Users } from "lucide-react";

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-24 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
                <Car className="h-4 w-4 mr-2" />
                대한민국 1위 차량 관리 플랫폼
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
                자동차 정비,<br />
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  이제 스마트하게
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto leading-relaxed">
                차계부 관리부터 정비소 예약까지,<br className="hidden sm:block" />
                모든 것을 한 곳에서 쉽고 편리하게
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                <Link href="/auth/signup">
                  <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto">
                    <Calendar className="h-5 w-5 mr-2" />
                    무료로 시작하기
                  </Button>
                </Link>
                <Link href="/shops">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold border-2 border-white/30 text-white hover:bg-white hover:text-blue-600 backdrop-blur-sm w-full sm:w-auto">
                    <MapPin className="h-5 w-5 mr-2" />
                    정비소 찾기
                  </Button>
                </Link>
              </div>
              
              {/* Stats */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-white/80">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">10,000+</div>
                  <div className="text-sm">등록된 차량</div>
                </div>
                <div className="hidden sm:block h-8 w-px bg-white/30"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">500+</div>
                  <div className="text-sm">파트너 정비소</div>
                </div>
                <div className="hidden sm:block h-8 w-px bg-white/30"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">50,000+</div>
                  <div className="text-sm">완료된 예약</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-50/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                왜 CarCare를 선택해야 할까요?
              </h2>
              <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
                체계적인 차량 관리와 편리한 정비 예약을 통해<br className="hidden sm:block" />
                더 안전하고 경제적인 드라이빙을 경험하세요
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Car className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">스마트 차계부</CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    AI가 도움을 주는 정비 이력과 비용 관리
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      정비 기록 자동 저장 및 분류
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      실시간 비용 분석 및 절약 팁
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      스마트 정비 일정 추천
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-50">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">정비소 검색</CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    내 주변 검증된 정비소를 한 번에
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                      GPS 기반 실시간 위치 검색
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                      실제 이용자 리뷰 및 평점
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                      투명한 서비스 가격 비교
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">간편 예약</CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    3분만에 완료하는 정비 예약
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      실시간 예약 가능 시간 확인
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      카카오톡 예약 상태 알림
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      원터치 일정 변경 및 취소
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">안전한 거래</CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    믿을 수 있는 정비소와 안심 결제
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      3단계 정비소 검증 시스템
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      PG사 연동 안전 결제
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      24시간 고객센터 지원
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">데이터 분석</CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    차량 관리 비용 최적화 솔루션
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></div>
                      월별/연별 정비 비용 분석
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></div>
                      차량별 성능 저하 예측
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></div>
                      맞춤형 정비 주기 제안
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-pink-50 to-rose-50">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">커뮤니티</CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    차량 관리 노하우 공유 플랫폼
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                      실제 정비 후기 및 팁 공유
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                      전문가 Q&A 및 상담 서비스
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                      차종별 관리법 아카이브
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 py-24 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-yellow-400/20 rounded-full blur-2xl"></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white leading-tight">
                지금 바로 시작해보세요
              </h2>
              <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-2xl mx-auto leading-relaxed">
                10만+ 운전자가 선택한 스마트 차량 관리<br className="hidden sm:block" />
                무료로 모든 기능을 경험해보세요
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                <Link href="/auth/signup">
                  <Button size="lg" className="h-16 px-10 text-lg font-semibold bg-white text-purple-600 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto">
                    <Car className="h-6 w-6 mr-3" />
                    지금 무료로 시작하기
                  </Button>
                </Link>
                <Link href="/shops">
                  <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-semibold border-2 border-white/40 text-white hover:bg-white/10 backdrop-blur-sm w-full sm:w-auto">
                    데모 체험해보기
                  </Button>
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-white/80">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-400" />
                  <span>100% 무료 회원가입</span>
                </div>
                <div className="hidden sm:block h-4 w-px bg-white/30"></div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-400" />
                  <span>10만+ 이용자 신뢰</span>
                </div>
                <div className="hidden sm:block h-4 w-px bg-white/30"></div>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-yellow-400" />
                  <span>평균 30% 정비비 절약</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  User, 
  Building2, 
  Clock, 
  DollarSign,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle,
  CalendarDays,
  TrendingUp
} from 'lucide-react';

// 임시 데이터 (실제로는 데이터베이스에서 가져와야 함)
const sampleBookings = [
  {
    id: 1,
    customerName: '김철수',
    customerEmail: 'kim@example.com',
    shopName: '서울정비소',
    serviceName: '엔진오일 교환',
    bookingDate: '2025-08-20',
    bookingTime: '10:00',
    price: 45000,
    status: 'confirmed',
    createdAt: '2025-08-19T10:30:00Z',
    carModel: '현대 아반떼',
    notes: '정기점검도 함께 부탁드립니다.'
  },
  {
    id: 2,
    customerName: '이영희',
    customerEmail: 'lee@example.com',
    shopName: '부산정비센터',
    serviceName: '브레이크 패드 교체',
    bookingDate: '2025-08-21',
    bookingTime: '14:00',
    price: 180000,
    status: 'pending',
    createdAt: '2025-08-19T09:15:00Z',
    carModel: '기아 K5',
    notes: '급하게 필요합니다.'
  },
  {
    id: 3,
    customerName: '박민수',
    customerEmail: 'park@example.com',
    shopName: '대구자동차정비',
    serviceName: '종합점검',
    bookingDate: '2025-08-19',
    bookingTime: '09:00',
    price: 120000,
    status: 'completed',
    createdAt: '2025-08-18T16:45:00Z',
    carModel: '현대 투싼',
    notes: ''
  },
  {
    id: 4,
    customerName: '최지은',
    customerEmail: 'choi@example.com',
    shopName: '인천자동차서비스',
    serviceName: '에어컨 점검',
    bookingDate: '2025-08-22',
    bookingTime: '11:00',
    price: 80000,
    status: 'cancelled',
    createdAt: '2025-08-19T08:20:00Z',
    carModel: '쌍용 티볼리',
    notes: '일정 변경으로 취소'
  },
  {
    id: 5,
    customerName: '장현우',
    customerEmail: 'jang@example.com',
    shopName: '서울정비소',
    serviceName: '타이어 교체',
    bookingDate: '2025-08-23',
    bookingTime: '15:30',
    price: 320000,
    status: 'confirmed',
    createdAt: '2025-08-19T11:10:00Z',
    carModel: 'BMW 320i',
    notes: '4개 타이어 모두 교체'
  }
];

export default async function BookingsPage() {
  const adminUser = await getAdminSession();
  
  if (!adminUser) {
    redirect('/auth/signin?callbackUrl=/admin/bookings');
  }

  const confirmedBookings = sampleBookings.filter(booking => booking.status === 'confirmed');
  const pendingBookings = sampleBookings.filter(booking => booking.status === 'pending');
  const completedBookings = sampleBookings.filter(booking => booking.status === 'completed');
  const cancelledBookings = sampleBookings.filter(booking => booking.status === 'cancelled');
  
  const totalRevenue = completedBookings.reduce((sum, booking) => sum + booking.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <a href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  대시보드로
                </a>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">예약 모니터링</h1>
                <p className="text-gray-600">전체 정비 예약 현황을 모니터링합니다</p>
              </div>
            </div>
            <Badge variant="secondary">
              총 {sampleBookings.length}건 예약
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {sampleBookings.length}
              </div>
              <p className="text-sm text-gray-600">전체 예약</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {confirmedBookings.length}
              </div>
              <p className="text-sm text-gray-600">확정 예약</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <AlertCircle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-600">
                {pendingBookings.length}
              </div>
              <p className="text-sm text-gray-600">대기중</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {completedBookings.length}
              </div>
              <p className="text-sm text-gray-600">완료</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-600">
                {(totalRevenue / 1000).toFixed(0)}K
              </div>
              <p className="text-sm text-gray-600">완료 매출 (원)</p>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="고객명, 이메일, 정비소, 서비스명으로 검색..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                필터
              </Button>
              <Button variant="outline" size="sm">
                <CalendarDays className="h-4 w-4 mr-2" />
                날짜별
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 상태별 탭 */}
        <div className="flex space-x-2 mb-6">
          <Button variant="default" size="sm">전체</Button>
          <Button variant="outline" size="sm">확정</Button>
          <Button variant="outline" size="sm">대기중</Button>
          <Button variant="outline" size="sm">완료</Button>
          <Button variant="outline" size="sm">취소</Button>
        </div>

        {/* 예약 목록 */}
        <div className="space-y-4">
          {sampleBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      booking.status === 'confirmed' ? 'bg-green-100' :
                      booking.status === 'pending' ? 'bg-amber-100' :
                      booking.status === 'completed' ? 'bg-blue-100' :
                      'bg-red-100'
                    }`}>
                      <Calendar className={`h-6 w-6 ${
                        booking.status === 'confirmed' ? 'text-green-600' :
                        booking.status === 'pending' ? 'text-amber-600' :
                        booking.status === 'completed' ? 'text-blue-600' :
                        'text-red-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.serviceName}
                        </h3>
                        <Badge variant={
                          booking.status === 'confirmed' ? 'default' :
                          booking.status === 'pending' ? 'secondary' :
                          booking.status === 'completed' ? 'outline' :
                          'destructive'
                        }>
                          {booking.status === 'confirmed' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              확정
                            </>
                          ) : booking.status === 'pending' ? (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              대기중
                            </>
                          ) : booking.status === 'completed' ? (
                            <>
                              <TrendingUp className="h-3 w-3 mr-1" />
                              완료
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              취소
                            </>
                          )}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {booking.customerName}
                        </div>
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2" />
                          {booking.shopName}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {booking.bookingDate} {booking.bookingTime}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          {booking.price.toLocaleString()}원
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
                        <div>
                          차량: {booking.carModel}
                        </div>
                        <div>
                          예약일시: {new Date(booking.createdAt).toLocaleDateString('ko-KR')} {new Date(booking.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div>
                          이메일: {booking.customerEmail}
                        </div>
                      </div>
                      
                      {booking.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                          💬 {booking.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      상세보기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 오늘의 예약 현황 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDays className="h-5 w-5 mr-2" />
                오늘의 예약 현황
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sampleBookings
                  .filter(booking => booking.bookingDate === '2025-08-19')
                  .map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{booking.bookingTime}</p>
                        <p className="text-sm text-gray-600">{booking.serviceName}</p>
                        <p className="text-xs text-gray-500">{booking.customerName} - {booking.shopName}</p>
                      </div>
                      <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                        {booking.status === 'completed' ? '완료' : '진행중'}
                      </Badge>
                    </div>
                  ))}
                {sampleBookings.filter(booking => booking.bookingDate === '2025-08-19').length === 0 && (
                  <p className="text-center text-gray-500 py-4">오늘 예약이 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                인기 정비소
              </CardTitle>
              <CardDescription>예약 건수 기준</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(
                  sampleBookings.reduce((acc, booking) => {
                    acc[booking.shopName] = (acc[booking.shopName] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                )
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([shopName, count], index) => (
                    <div key={shopName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <p className="font-medium text-gray-900">{shopName}</p>
                      </div>
                      <p className="font-medium text-gray-900">{count}건</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
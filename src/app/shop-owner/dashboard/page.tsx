'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  Users, 
  TrendingUp, 
  Car,
  Phone,
  CheckCircle,
  AlertCircle,
  XCircle,
  Settings,
  BarChart3,
  Activity,
  UserCheck,
  Wrench
} from 'lucide-react';

interface DashboardStats {
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  inProgressBookings: number;
  completedBookings: number;
  monthlyRevenue: number;
  totalRevenue: number;
}

interface TodaySchedule {
  id: string;
  time: string;
  status: string;
  customer: string;
  customerPhone: string;
  car: string;
  service: string;
  duration: number;
  shop: string;
}

interface RecentBooking {
  id: string;
  customer: string;
  car: string;
  service: string;
  shop: string;
  status: string;
  bookingDate: string;
  createdAt: string;
}

interface PopularService {
  id: string;
  name: string;
  category: string;
  bookingCount: number;
  basePrice: number;
}

interface Shop {
  id: string;
  businessName: string;
  address: string;
  phone: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
}

interface DashboardData {
  stats: DashboardStats;
  todaySchedule: TodaySchedule[];
  recentBookings: RecentBooking[];
  popularServices: PopularService[];
  bookingTrends: any[];
  shops: Shop[];
}

export default function ShopOwnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedShop, setSelectedShop] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  // 인증 확인
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // 대시보드 데이터 조회
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      let response = await fetch('/api/shop-owner/dashboard');
      
      // 원본 API가 실패하면 simple API로 fallback
      if (!response.ok) {
        console.warn('원본 dashboard API 실패, simple API로 fallback 시도');
        response = await fetch('/api/shop-owner/dashboard-simple');
      }
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '대시보드 데이터를 불러오는데 실패했습니다.');
      }

      setDashboardData(data.data);
      
      // 첫 번째 정비소를 기본 선택
      if (data.data.shops.length > 0 && !selectedShop) {
        setSelectedShop(data.data.shops[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status]);

  // 새로고침
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // 상태 아이콘
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDING':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'IN_PROGRESS':
        return <Activity className="h-4 w-4 text-blue-600" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return '예약 확정';
      case 'PENDING': return '승인 대기';
      case 'IN_PROGRESS': return '진행 중';
      case 'COMPLETED': return '완료';
      case 'CANCELLED': return '취소';
      default: return status;
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // 로딩 상태
  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="flex justify-center items-center min-h-screen">데이터를 불러오는 중...</div>;
  }

  const stats = dashboardData.stats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                운영자 대시보드
              </h1>
              <p className="text-gray-600 mt-1">
                정비소 예약 현황과 운영 통계를 확인하세요
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* 정비소 선택 */}
            {dashboardData.shops.length > 1 && (
              <Select value={selectedShop} onValueChange={setSelectedShop}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="정비소 선택" />
                </SelectTrigger>
                <SelectContent>
                  {dashboardData.shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
            >
              {refreshing ? '새로고침 중...' : '새로고침'}
            </Button>
            
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => router.push('/shop-owner/bookings')}
            >
              예약 관리
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">오늘 예약</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.todayBookings}</div>
              <p className="text-xs text-gray-500 mt-1">진행 중: {stats.inProgressBookings}건</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">대기 중 예약</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</div>
              <p className="text-xs text-gray-500 mt-1">확정: {stats.confirmedBookings}건</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">이번 달 매출</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.monthlyRevenue.toLocaleString()}원
              </div>
              <p className="text-xs text-gray-500 mt-1">완료: {stats.completedBookings}건</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">총 예약</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalBookings}</div>
              <p className="text-xs text-gray-500 mt-1">총 매출: {stats.totalRevenue.toLocaleString()}원</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 오늘의 일정 */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span>오늘의 일정</span>
                  </CardTitle>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    {dashboardData.todaySchedule.length}건
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.todaySchedule.length > 0 ? (
                    dashboardData.todaySchedule.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="text-lg font-semibold text-blue-600">
                              {schedule.time}
                            </div>
                            <Badge className={getStatusBadgeStyle(schedule.status)}>
                              {getStatusIcon(schedule.status)}
                              <span className="ml-1">{getStatusText(schedule.status)}</span>
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {schedule.duration}분 소요
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <UserCheck className="h-4 w-4 mr-2" />
                              {schedule.customer}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Car className="h-4 w-4 mr-2" />
                              {schedule.car}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <Wrench className="h-4 w-4 mr-2" />
                              {schedule.service}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              {schedule.customerPhone}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/shop-owner/bookings/${schedule.id}`)}
                          >
                            상세보기
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(`tel:${schedule.customerPhone}`)}
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            연락하기
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      오늘 예정된 일정이 없습니다.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 인기 서비스 */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span>인기 서비스</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.popularServices.map((service, index) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{service.name}</div>
                        <div className="text-sm text-gray-500">{service.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-600">
                          {service.bookingCount}건
                        </div>
                        <div className="text-xs text-gray-500">
                          {service.basePrice.toLocaleString()}원
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 최근 예약 */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span>최근 예약</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.recentBookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/shop-owner/bookings/${booking.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">{booking.customer}</div>
                        <Badge className={getStatusBadgeStyle(booking.status)}>
                          {getStatusText(booking.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">{booking.service}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(booking.bookingDate).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => router.push('/shop-owner/bookings')}
                >
                  모든 예약 보기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
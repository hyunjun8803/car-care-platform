'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar,
  Search,
  Filter,
  Phone,
  Car,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity,
  UserCheck,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  BarChart3
} from 'lucide-react';

interface Booking {
  id: string;
  bookingDate: string;
  bookingTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  notes?: string;
  estimatedCost?: number;
  finalCost?: number;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  car: {
    id: string;
    name: string;
    brand: string;
    model: string;
    licensePlate: string;
    year: number;
  };
  shop: {
    id: string;
    businessName: string;
  };
  service: {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    estimatedDuration: number;
    category: {
      name: string;
    };
  };
  createdAt: string;
}

interface Shop {
  id: string;
  businessName: string;
}

export default function ShopOwnerBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // 인증 확인
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // 예약 목록 조회
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '10');
      
      if (statusFilter) params.set('status', statusFilter);
      if (selectedShop) params.set('shopId', selectedShop);
      if (dateFilter) params.set('date', dateFilter);

      const response = await fetch(`/api/shop-owner/bookings?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '예약 목록을 불러오는데 실패했습니다.');
      }

      setBookings(data.data);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.pages);

    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 운영자 정비소 목록 조회
  const fetchShops = async () => {
    try {
      const response = await fetch('/api/shop-owner/dashboard');
      const data = await response.json();

      if (response.ok) {
        setShops(data.data.shops);
      }
    } catch (err) {
      console.error('정비소 목록 조회 오류:', err);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchShops();
    }
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status, currentPage, statusFilter, selectedShop, dateFilter]);

  // 예약 상태 업데이트
  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/shop-owner/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '상태 업데이트에 실패했습니다.');
      }

      // 예약 목록 새로고침
      fetchBookings();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '상태 업데이트 중 오류가 발생했습니다.');
    }
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

  // 필터링된 예약 목록
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.car.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // 로딩 상태
  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                예약 관리
              </h1>
              <p className="text-gray-600 mt-1">
                정비소 예약을 관리하고 상태를 업데이트하세요
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push('/shop-owner/dashboard')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              대시보드
            </Button>
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        {/* 필터 및 검색 */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* 검색 */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="고객명, 서비스, 차량번호 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* 상태 필터 */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체 상태</SelectItem>
                  <SelectItem value="PENDING">승인 대기</SelectItem>
                  <SelectItem value="CONFIRMED">예약 확정</SelectItem>
                  <SelectItem value="IN_PROGRESS">진행 중</SelectItem>
                  <SelectItem value="COMPLETED">완료</SelectItem>
                  <SelectItem value="CANCELLED">취소</SelectItem>
                </SelectContent>
              </Select>

              {/* 정비소 선택 */}
              {shops.length > 1 && (
                <Select value={selectedShop} onValueChange={setSelectedShop}>
                  <SelectTrigger>
                    <SelectValue placeholder="정비소 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">전체 정비소</SelectItem>
                    {shops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>
                        {shop.businessName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* 날짜 필터 */}
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="날짜 선택"
              />

              {/* 필터 초기화 */}
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setSelectedShop('');
                  setDateFilter('');
                  setCurrentPage(1);
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                초기화
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 예약 목록 */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card 
              key={booking.id}
              className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-200"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* 왼쪽: 예약 정보 */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-800">
                            {booking.customer.name}
                          </h3>
                          <Badge className={getStatusBadgeStyle(booking.status)}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1">{getStatusText(booking.status)}</span>
                          </Badge>
                        </div>
                        <p className="text-gray-600">{booking.service.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                        <p className="text-sm text-gray-500">예약생성</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <UserCheck className="h-4 w-4 mr-2 text-gray-400" />
                          {booking.customer.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Car className="h-4 w-4 mr-2 text-gray-400" />
                          {booking.car.name} ({booking.car.licensePlate})
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Wrench className="h-4 w-4 mr-2 text-gray-400" />
                          {booking.service.category.name}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {new Date(booking.bookingDate).toLocaleDateString('ko-KR')} {booking.bookingTime}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          약 {booking.service.estimatedDuration}분 소요
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                          {(booking.finalCost || booking.estimatedCost || booking.service.basePrice).toLocaleString()}원
                        </div>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>요청사항:</strong> {booking.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 오른쪽: 액션 버튼 */}
                  <div className="lg:w-64 flex lg:flex-col gap-3">
                    {/* 상태별 액션 버튼 */}
                    {booking.status === 'PENDING' && (
                      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          승인
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          취소
                        </Button>
                      </div>
                    )}

                    {booking.status === 'CONFIRMED' && (
                      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => updateBookingStatus(booking.id, 'IN_PROGRESS')}
                        >
                          <Activity className="h-4 w-4 mr-1" />
                          시작
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                        >
                          취소
                        </Button>
                      </div>
                    )}

                    {booking.status === 'IN_PROGRESS' && (
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        완료
                      </Button>
                    )}

                    {/* 공통 액션 버튼 */}
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/shop-owner/bookings/${booking.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        상세보기
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`tel:${booking.customer.phone}`)}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        고객연락
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredBookings.length === 0 && !loading && (
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">예약이 없습니다</h3>
                <p className="text-gray-500">
                  현재 조건에 맞는 예약이 없습니다.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-gray-600">
              페이지 {currentPage} / {totalPages} (총 {total}건)
            </span>
            
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
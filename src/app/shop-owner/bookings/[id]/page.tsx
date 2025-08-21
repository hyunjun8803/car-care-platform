'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Phone,
  Car,
  User,
  Wrench,
  MapPin,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity,
  Save,
  Edit3
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
    year: number;
    licensePlate: string;
    mileage: number;
    fuelType: string;
  };
  shop: {
    id: string;
    businessName: string;
    businessNumber: string;
    address: string;
    phone: string;
  };
  service: {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    estimatedDuration: number;
    category: {
      name: string;
      description: string;
    };
  };
  createdAt: string;
}

export default function BookingDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // 편집 폼 상태
  const [editForm, setEditForm] = useState({
    notes: '',
    finalCost: '',
    paymentStatus: 'UNPAID'
  });

  // 인증 확인
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // 예약 상세 정보 조회
  const fetchBookingDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/shop-owner/bookings/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '예약 정보를 불러오는데 실패했습니다.');
      }

      setBooking(data.data);
      setEditForm({
        notes: data.data.notes || '',
        finalCost: data.data.finalCost?.toString() || '',
        paymentStatus: data.data.paymentStatus
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && params.id) {
      fetchBookingDetail();
    }
  }, [status, params.id]);

  // 예약 상태 업데이트
  const updateBookingStatus = async (newStatus: string) => {
    if (!booking) return;

    try {
      setUpdating(true);
      setError(null);

      const response = await fetch(`/api/shop-owner/bookings/${booking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          finalCost: editForm.finalCost ? parseFloat(editForm.finalCost) : undefined,
          paymentStatus: editForm.paymentStatus,
          notes: editForm.notes
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '상태 업데이트에 실패했습니다.');
      }

      // 예약 정보 새로고침
      await fetchBookingDetail();
      setIsEditing(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '상태 업데이트 중 오류가 발생했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  // 예약 정보 업데이트 (메모, 최종 비용만)
  const updateBookingInfo = async () => {
    if (!booking) return;

    try {
      setUpdating(true);
      setError(null);

      const response = await fetch(`/api/shop-owner/bookings/${booking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          finalCost: editForm.finalCost ? parseFloat(editForm.finalCost) : undefined,
          paymentStatus: editForm.paymentStatus,
          notes: editForm.notes
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '정보 업데이트에 실패했습니다.');
      }

      // 예약 정보 새로고침
      await fetchBookingDetail();
      setIsEditing(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '정보 업데이트 중 오류가 발생했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  // 상태 아이콘
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'PENDING':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'IN_PROGRESS':
        return <Activity className="h-5 w-5 text-blue-600" />;
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-600" />;
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

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">
            {error || '예약 정보를 찾을 수 없습니다.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/shop-owner/bookings')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                예약 상세 정보
              </h1>
              <p className="text-gray-600">
                예약 ID: {booking.id}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                편집
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  취소
                </Button>
                <Button
                  onClick={updateBookingInfo}
                  disabled={updating}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 예약 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 예약 상태 */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>예약 상태</span>
                  <Badge className={getStatusBadgeStyle(booking.status)}>
                    {getStatusIcon(booking.status)}
                    <span className="ml-2">{getStatusText(booking.status)}</span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">예약 날짜</Label>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{new Date(booking.bookingDate).toLocaleDateString('ko-KR')} {booking.bookingTime}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">예상 소요시간</Label>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span>약 {booking.service.estimatedDuration}분</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">예상 비용</Label>
                    <div className="flex items-center mt-1">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{booking.service.basePrice.toLocaleString()}원</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">결제 상태</Label>
                    <div className="mt-1">
                      {isEditing ? (
                        <select
                          value={editForm.paymentStatus}
                          onChange={(e) => setEditForm({...editForm, paymentStatus: e.target.value})}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="UNPAID">미결제</option>
                          <option value="PAID">결제완료</option>
                          <option value="REFUNDED">환불</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs ${
                          booking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                          booking.paymentStatus === 'REFUNDED' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.paymentStatus === 'PAID' ? '결제완료' : 
                           booking.paymentStatus === 'REFUNDED' ? '환불' : '미결제'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 상태별 액션 버튼 */}
                <div className="mt-6 flex gap-2">
                  {booking.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => updateBookingStatus('CONFIRMED')}
                        disabled={updating}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        승인
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => updateBookingStatus('CANCELLED')}
                        disabled={updating}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        취소
                      </Button>
                    </>
                  )}

                  {booking.status === 'CONFIRMED' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => updateBookingStatus('IN_PROGRESS')}
                        disabled={updating}
                      >
                        <Activity className="h-4 w-4 mr-1" />
                        시작
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => updateBookingStatus('CANCELLED')}
                        disabled={updating}
                      >
                        취소
                      </Button>
                    </>
                  )}

                  {booking.status === 'IN_PROGRESS' && (
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => updateBookingStatus('COMPLETED')}
                      disabled={updating}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      완료
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 서비스 정보 */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-blue-600" />
                  서비스 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-500">서비스명</Label>
                    <p className="font-medium">{booking.service.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">카테고리</Label>
                    <p>{booking.service.category.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">서비스 설명</Label>
                    <p className="text-gray-600">{booking.service.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 고객 요청사항 및 메모 */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>요청사항 및 메모</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-500">고객 요청사항</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">
                      {booking.notes || '특별한 요청사항이 없습니다.'}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-500">작업 메모</Label>
                  {isEditing ? (
                    <Textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                      placeholder="작업 관련 메모를 입력하세요..."
                      rows={4}
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                      <p className="text-blue-800">
                        {editForm.notes || '작업 메모가 없습니다.'}
                      </p>
                    </div>
                  )}
                </div>

                {(booking.status === 'COMPLETED' || isEditing) && (
                  <div>
                    <Label className="text-sm text-gray-500">최종 비용</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editForm.finalCost}
                        onChange={(e) => setEditForm({...editForm, finalCost: e.target.value})}
                        placeholder="최종 비용을 입력하세요"
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-green-50 rounded-lg">
                        <p className="text-green-800 font-medium">
                          {booking.finalCost?.toLocaleString() || booking.service.basePrice.toLocaleString()}원
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽: 고객 및 차량 정보 */}
          <div className="space-y-6">
            {/* 고객 정보 */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-green-600" />
                  고객 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm text-gray-500">이름</Label>
                  <p className="font-medium">{booking.customer.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">전화번호</Label>
                  <div className="flex items-center justify-between">
                    <p>{booking.customer.phone}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`tel:${booking.customer.phone}`)}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">이메일</Label>
                  <p className="text-gray-600">{booking.customer.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* 차량 정보 */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="h-5 w-5 mr-2 text-purple-600" />
                  차량 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm text-gray-500">차량명</Label>
                  <p className="font-medium">{booking.car.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">브랜드/모델</Label>
                  <p>{booking.car.brand} {booking.car.model}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">연식</Label>
                  <p>{booking.car.year}년</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">차량번호</Label>
                  <p className="font-mono">{booking.car.licensePlate}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">주행거리</Label>
                  <p>{booking.car.mileage?.toLocaleString()}km</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">연료타입</Label>
                  <p>{booking.car.fuelType}</p>
                </div>
              </CardContent>
            </Card>

            {/* 정비소 정보 */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-orange-600" />
                  정비소 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm text-gray-500">정비소명</Label>
                  <p className="font-medium">{booking.shop.businessName}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">사업자번호</Label>
                  <p>{booking.shop.businessNumber}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">주소</Label>
                  <p className="text-gray-600">{booking.shop.address}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">전화번호</Label>
                  <p>{booking.shop.phone}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Search, MapPin, Clock, DollarSign, Car, Phone, CheckCircle, XCircle, AlertCircle, Filter, Plus } from "lucide-react";

interface Booking {
  id: string;
  bookingDate: string;
  bookingTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  notes?: string;
  estimatedCost?: number;
  finalCost?: number;
  car: {
    id: string;
    name: string;
    brand: string;
    model: string;
    licensePlate: string;
  };
  shop: {
    id: string;
    businessName: string;
    address: string;
    phone: string;
    rating: number;
  };
  service: {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    estimatedDuration: number;
    category: {
      name: string;
      icon: string;
    };
  };
  review?: {
    id: string;
    rating: number;
    comment: string;
  } | null;
  createdAt: string;
}

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const successMessage = searchParams.get('success');
  const bookingId = searchParams.get('bookingId');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("전체");

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
      
      const response = await fetch(`/api/bookings?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '예약 목록을 불러오는데 실패했습니다.');
      }

      setBookings(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status]);

  // 예약 취소 함수
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('정말로 예약을 취소하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        // 예약 목록 새로고침
        fetchBookings();
      } else {
        alert(data.error || '예약 취소에 실패했습니다.');
      }
    } catch (error) {
      alert('예약 취소 중 오류가 발생했습니다.');
    }
  };

  const statusOptions = ["전체", "확정", "대기", "완료", "취소"];
  const statusMapping = {
    "전체": null,
    "확정": "CONFIRMED",
    "대기": "PENDING", 
    "완료": "COMPLETED",
    "취소": "CANCELLED"
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "PENDING":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "예약 확정";
      case "PENDING": return "승인 대기";
      case "IN_PROGRESS": return "진행 중";
      case "COMPLETED": return "서비스 완료";
      case "CANCELLED": return "예약 취소";
      default: return status;
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800 border-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.shop.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.car.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "전체" || 
                         booking.status === statusMapping[statusFilter as keyof typeof statusMapping];
    
    return matchesSearch && matchesStatus;
  });

  const upcomingBookings = bookings.filter(booking => 
    booking.status === "CONFIRMED" || booking.status === "PENDING"
  ).length;

  const completedBookings = bookings.filter(booking => 
    booking.status === "COMPLETED"
  ).length;

  const totalSpent = bookings
    .filter(booking => booking.status === "COMPLETED")
    .reduce((sum, booking) => sum + (booking.finalCost || booking.estimatedCost || 0), 0);

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  예약 관리
                </h1>
                <p className="text-gray-600 mt-1">
                  정비소 예약 현황을 확인하고 관리하세요
                </p>
              </div>
            </div>
            
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              onClick={() => router.push('/shops')}
            >
              <Plus className="h-4 w-4 mr-2" />
              새 예약
            </Button>
          </div>

          {/* 성공 메시지 */}
          {successMessage && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                예약이 성공적으로 완료되었습니다! 예약 확인은 정비소에서 연락드릴 예정입니다.
              </AlertDescription>
            </Alert>
          )}

          {/* 오류 메시지 */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-800">{upcomingBookings}</p>
                <p className="text-sm text-gray-600">예정된 예약</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-800">{completedBookings}</p>
                <p className="text-sm text-gray-600">완료된 서비스</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6 text-center">
                <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-800">{totalSpent.toLocaleString()}원</p>
                <p className="text-sm text-gray-600">총 이용금액</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="예약을 검색하세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-white/70 border-gray-200 focus:border-blue-500 shadow-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className={statusFilter === status ? 
                      "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" : 
                      "border-gray-200 text-gray-600 hover:bg-blue-50"
                    }
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.map((booking) => (
            <Card 
              key={booking.id}
              className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-200"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Section - Main Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{booking.shop.businessName}</h3>
                          <Badge variant="outline" className={getStatusBadgeStyle(booking.status)}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1">{getStatusText(booking.status)}</span>
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-1">{booking.service.name}</p>
                        <p className="text-sm text-gray-500">{booking.service.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Car className="h-4 w-4 mr-2 text-gray-400" />
                          {booking.car.name} ({booking.car.brand} {booking.car.model}, {booking.car.licensePlate})
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          {booking.shop.address}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {booking.shop.phone}
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
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                        <p className="text-sm text-blue-800">
                          <strong>요청사항:</strong> {booking.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Section - Actions */}
                  <div className="lg:w-48 flex lg:flex-col gap-3">
                    {booking.status === "CONFIRMED" && (
                      <>
                        <Button 
                          variant="outline" 
                          className="flex-1 lg:w-full border-gray-200 text-gray-600 hover:bg-blue-50"
                          onClick={() => router.push(`/bookings/${booking.id}/edit`)}
                        >
                          수정
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 lg:w-full text-red-600 hover:bg-red-50 border-red-200"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          취소
                        </Button>
                        <Button 
                          className="flex-1 lg:w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                          onClick={() => window.open(`tel:${booking.shop.phone}`)}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          연락
                        </Button>
                      </>
                    )}
                    {booking.status === "PENDING" && (
                      <>
                        <Button 
                          variant="outline" 
                          className="flex-1 lg:w-full border-gray-200 text-gray-600 hover:bg-blue-50"
                          onClick={() => router.push(`/bookings/${booking.id}/edit`)}
                        >
                          수정
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 lg:w-full text-red-600 hover:bg-red-50 border-red-200"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          취소
                        </Button>
                        <Button 
                          className="flex-1 lg:w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg"
                          onClick={() => window.open(`tel:${booking.shop.phone}`)}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          확인 요청
                        </Button>
                      </>
                    )}
                    {booking.status === "COMPLETED" && (
                      <>
                        <Button 
                          variant="outline" 
                          className="flex-1 lg:w-full border-gray-200 text-gray-600 hover:bg-blue-50"
                          onClick={() => router.push(`/bookings/${booking.id}`)}
                        >
                          영수증
                        </Button>
                        {!booking.review && (
                          <Button 
                            variant="outline" 
                            className="flex-1 lg:w-full border-gray-200 text-gray-600 hover:bg-blue-50"
                            onClick={() => router.push(`/bookings/${booking.id}/review`)}
                          >
                            리뷰 작성
                          </Button>
                        )}
                        <Button 
                          className="flex-1 lg:w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                          onClick={() => router.push(`/booking/new?shopId=${booking.shop.id}`)}
                        >
                          재예약
                        </Button>
                      </>
                    )}
                    {(booking.status === "CANCELLED" || booking.status === "IN_PROGRESS") && (
                      <Button 
                        className="flex-1 lg:w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                        onClick={() => router.push(`/booking/new?shopId=${booking.shop.id}`)}
                      >
                        재예약
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredBookings.length === 0 && (
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">예약이 없습니다</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || statusFilter !== "전체" 
                    ? "검색 조건에 맞는 예약이 없습니다." 
                    : "아직 예약하신 서비스가 없습니다."
                  }
                </p>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                  onClick={() => router.push('/shops')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  정비소 찾기
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
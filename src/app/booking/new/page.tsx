'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Star, Phone, Car, CreditCard, AlertCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Shop {
  id: string;
  businessName: string;
  address: string;
  phone: string;
  operatingHours?: string;
  rating: number;
  totalReviews: number;
}

interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  estimatedDuration: number;
  category: {
    name: string;
    icon: string;
  };
}

interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
}

interface AvailableTimeSlot {
  time: string;
  available: boolean;
  reason?: string | null;
}

export default function NewBookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const shopId = searchParams.get('shopId');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: 정비소/서비스 선택, 2: 차량/날짜 선택, 3: 확인
  
  // 데이터 상태
  const [shop, setShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableTimeSlot[]>([]);

  // 폼 데이터
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // 선택된 데이터
  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedCar = cars.find(c => c.id === selectedCarId);

  // 인증 확인
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // 초기 데이터 로드
  useEffect(() => {
    if (status === 'authenticated') {
      Promise.all([
        fetchShopAndServices(),
        fetchUserCars()
      ]).then(() => {
        setLoading(false);
      }).catch((err) => {
        setError(err.message);
        setLoading(false);
      });
    }
  }, [status, shopId]);

  // 정비소 및 서비스 정보 조회
  const fetchShopAndServices = async () => {
    if (!shopId) {
      throw new Error('정비소를 선택해주세요.');
    }

    const response = await fetch(`/api/shops/${shopId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '정비소 정보를 불러오는데 실패했습니다.');
    }

    setShop({
      id: data.data.id,
      businessName: data.data.businessName,
      address: data.data.address,
      phone: data.data.phone,
      operatingHours: data.data.operatingHours,
      rating: data.data.rating,
      totalReviews: data.data.totalReviews
    });

    // 서비스 카테고리별로 정리
    const allServices: Service[] = [];
    data.data.serviceCategories.forEach((category: any) => {
      category.services.forEach((service: any) => {
        allServices.push({
          ...service,
          category: {
            name: category.category,
            icon: 'Wrench' // 기본 아이콘
          }
        });
      });
    });

    setServices(allServices);
  };

  // 사용자 차량 목록 조회
  const fetchUserCars = async () => {
    const response = await fetch('/api/cars');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '차량 목록을 불러오는데 실패했습니다.');
    }

    setCars(data.data);
  };

  // 예약 가능 시간 조회
  const fetchAvailableSlots = async (date: string, serviceId: string) => {
    if (!shopId || !date || !serviceId) return;

    try {
      const params = new URLSearchParams({
        date,
        serviceId
      });

      const response = await fetch(`/api/shops/${shopId}/availability?${params}`);
      const data = await response.json();

      if (response.ok) {
        setAvailableSlots(data.data.timeSlots);
      } else {
        console.error('예약 가능 시간 조회 실패:', data.error);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('예약 가능 시간 조회 오류:', error);
      setAvailableSlots([]);
    }
  };

  // 날짜나 서비스 변경 시 가능 시간 재조회
  useEffect(() => {
    if (selectedDate && selectedServiceId) {
      fetchAvailableSlots(selectedDate, selectedServiceId);
      setSelectedTime(''); // 시간 선택 초기화
    }
  }, [selectedDate, selectedServiceId]);

  // 예약 생성
  const handleBookingSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (!selectedServiceId || !selectedCarId || !selectedDate || !selectedTime) {
        throw new Error('모든 필수 정보를 입력해주세요.');
      }

      const bookingData = {
        carId: selectedCarId,
        shopId: shopId,
        serviceId: selectedServiceId,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        notes: notes.trim() || undefined
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '예약 생성에 실패했습니다.');
      }

      // 예약 성공 - 예약 목록 페이지로 이동
      router.push(`/bookings?success=true&bookingId=${data.data.id}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 로딩 상태
  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (!shopId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>정비소를 선택해주세요.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // 오늘 날짜 이후만 선택 가능하도록
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30일 후까지

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 */}
        <div className="flex items-center space-x-3 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            돌아가기
          </Button>
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              정비 예약하기
            </h1>
            <p className="text-gray-600 mt-1">
              차량 정비 서비스를 간편하게 예약하세요
            </p>
          </div>
        </div>

        {/* 단계 표시 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        {/* 정비소 정보 카드 */}
        {shop && (
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>{shop.businessName}</span>
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>{shop.address}</span>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                    <span>{shop.rating.toFixed(1)} ({shop.totalReviews} 리뷰)</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    <span>{shop.phone}</span>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* 단계별 컨텐츠 */}
        {step === 1 && (
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>서비스 선택</CardTitle>
              <CardDescription>받으실 정비 서비스를 선택해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedServiceId === service.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedServiceId(service.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">{service.name}</h4>
                    <Badge variant="outline" className="ml-2">
                      {service.category.name}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-1" />
                        {service.basePrice.toLocaleString()}원
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.estimatedDuration}분
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedServiceId}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  다음 단계
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* 차량 선택 */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>차량 선택</CardTitle>
                <CardDescription>정비받을 차량을 선택해주세요</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedCarId} onValueChange={setSelectedCarId}>
                  <SelectTrigger>
                    <SelectValue placeholder="차량을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {cars.map((car) => (
                      <SelectItem key={car.id} value={car.id}>
                        <div className="flex items-center space-x-2">
                          <Car className="h-4 w-4" />
                          <span>{car.name} ({car.brand} {car.model}, {car.licensePlate})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {cars.length === 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      등록된 차량이 없습니다. 
                      <Button variant="link" className="p-0 h-auto text-yellow-800 underline ml-1">
                        차량을 등록하시겠습니까?
                      </Button>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 날짜 및 시간 선택 */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>예약 날짜 및 시간</CardTitle>
                <CardDescription>예약하실 날짜와 시간을 선택해주세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="date">예약 날짜</Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={minDate}
                      max={maxDate}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="time">예약 시간</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime} disabled={!selectedDate}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="시간을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSlots.map((slot) => (
                          <SelectItem 
                            key={slot.time} 
                            value={slot.time} 
                            disabled={!slot.available}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{slot.time}</span>
                              {!slot.available && (
                                <span className="text-xs text-red-500 ml-2">
                                  {slot.reason}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 추가 요청사항 */}
                <div>
                  <Label htmlFor="notes">추가 요청사항 (선택)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="추가로 요청하실 내용이 있으시면 입력해주세요..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                이전 단계
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedCarId || !selectedDate || !selectedTime}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                예약 확인
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && selectedService && selectedCar && (
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>예약 확인</CardTitle>
              <CardDescription>예약 내용을 확인하고 예약을 완료하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 예약 요약 */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">정비소:</span>
                  <span>{shop?.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">서비스:</span>
                  <span>{selectedService.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">차량:</span>
                  <span>{selectedCar.name} ({selectedCar.licensePlate})</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">예약 일시:</span>
                  <span>{selectedDate} {selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">예상 소요시간:</span>
                  <span>{selectedService.estimatedDuration}분</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>예상 비용:</span>
                  <span className="text-blue-600">{selectedService.basePrice.toLocaleString()}원</span>
                </div>
                {notes && (
                  <div>
                    <span className="font-medium">추가 요청사항:</span>
                    <p className="mt-1 text-gray-600">{notes}</p>
                  </div>
                )}
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  예약 확정 후 24시간 전까지만 취소가 가능합니다. 
                  예상 비용은 실제 작업 후 달라질 수 있습니다.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  이전 단계
                </Button>
                <Button
                  onClick={handleBookingSubmit}
                  disabled={submitting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {submitting ? '예약 중...' : '예약 완료'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
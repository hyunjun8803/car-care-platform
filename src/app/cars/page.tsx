'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Car,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Palette,
  Fuel,
  Hash,
  Gauge,
  Building2,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  Star
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CarItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  fuelType: string;
  licensePlate: string;
  mileage?: number;
  engineSize?: string;
  totalCost: number;
  maintenanceCount: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
  createdAt: string;
}

export default function CarsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const MAX_CARS = 10;
  const [cars, setCars] = useState<CarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingCarId, setDeletingCarId] = useState<string | null>(null);

  // 인증 확인
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // 차량 목록 조회
  const fetchCars = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/cars');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '차량 목록을 불러오는데 실패했습니다.');
      }

      setCars(data.data);

    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCars();
    }
  }, [status]);

  // 차량 삭제
  const handleDeleteCar = async (carId: string) => {
    if (!confirm('정말로 이 차량을 삭제하시겠습니까?')) return;

    try {
      setDeletingCarId(carId);

      const response = await fetch(`/api/cars/${carId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '차량 삭제에 실패했습니다.');
      }

      // 목록에서 제거
      setCars(cars.filter(car => car.id !== carId));

    } catch (err) {
      setError(err instanceof Error ? err.message : '차량 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingCarId(null);
    }
  };

  // 연료 타입 한국어 변환
  const getFuelTypeDisplay = (fuelType: string) => {
    const fuelTypes: { [key: string]: string } = {
      'GASOLINE': '휘발유',
      'DIESEL': '경유',
      'HYBRID': '하이브리드',
      'ELECTRIC': '전기',
      'LPG': 'LPG'
    };
    return fuelTypes[fuelType] || fuelType;
  };

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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  내 차량 관리
                </h1>
                <p className="text-gray-600 mt-1">
                  등록된 차량을 관리하고 새로운 차량을 추가하세요
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => router.push('/cars/register')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              차량 등록
            </Button>
          </div>

          {/* 차량 개수 표시 */}
          {!loading && cars.length > 0 && (
            <div className="text-gray-600 mb-4">
              총 {cars.length}대의 차량이 등록되어 있습니다. (최대 {MAX_CARS}대)
            </div>
          )}
        </div>

        {/* 오류 메시지 */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        {/* 차량 목록 */}
        {!loading && !error && (
          <>
            {cars.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    등록된 차량이 없습니다
                  </h3>
                  <p className="text-gray-500 mb-6">
                    첫 번째 차량을 등록하여 정비 예약을 시작하세요
                  </p>
                  <Button
                    onClick={() => router.push('/cars/register')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    차량 등록하기
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <Card 
                    key={car.id} 
                    className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-200"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              {car.name}
                            </CardTitle>
                            {car.maintenanceCount > 0 && (
                              <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                                <Star className="h-3 w-3 mr-1" />
                                정비 {car.maintenanceCount}회
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="flex items-center text-gray-600">
                            <Building2 className="h-4 w-4 mr-1" />
                            {car.brand} {car.model} ({car.year})
                          </CardDescription>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/cars/${car.id}/edit`)}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteCar(car.id)}
                              className="text-red-600"
                              disabled={deletingCarId === car.id}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {deletingCarId === car.id ? '삭제 중...' : '삭제'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* 기본 정보 */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                          <Hash className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-mono">{car.licensePlate}</span>
                        </div>
                        <div className="flex items-center">
                          <Fuel className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{getFuelTypeDisplay(car.fuelType)}</span>
                        </div>
                        {car.mileage !== undefined && (
                          <div className="flex items-center">
                            <Gauge className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{car.mileage.toLocaleString()}km</span>
                          </div>
                        )}
                        {car.color && (
                          <div className="flex items-center">
                            <Palette className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{car.color}</span>
                          </div>
                        )}
                      </div>

                      {/* 추가 정보 */}
                      {car.engineSize && (
                        <div className="text-sm text-gray-600">
                          엔진: {car.engineSize}
                        </div>
                      )}

                      {/* 정비 정보 */}
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="text-sm">
                          <span className="text-gray-500">총 정비비용:</span>
                          <span className="font-medium text-green-600 ml-2">
                            {car.totalCost.toLocaleString()}원
                          </span>
                        </div>
                        {car.lastMaintenance && (
                          <div className="text-sm">
                            <span className="text-gray-500">최근 정비:</span>
                            <span className="ml-2">
                              {new Date(car.lastMaintenance).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        )}
                        {car.nextMaintenance && (
                          <div className="text-sm">
                            <span className="text-gray-500">다음 정비 예정:</span>
                            <span className="ml-2">
                              {new Date(car.nextMaintenance).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 등록일 */}
                      <div className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        등록일: {new Date(car.createdAt).toLocaleDateString('ko-KR')}
                      </div>

                      {/* 액션 버튼들 */}
                      <div className="flex space-x-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/booking/new?carId=${car.id}`)}
                          className="flex-1"
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          예약하기
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/cars/${car.id}/history`)}
                          className="flex-1"
                        >
                          정비기록
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* 차량 등록 한도 안내 */}
        {!loading && cars.length > 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 mt-8">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">차량 등록 안내</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 최대 {MAX_CARS}대까지 등록 가능합니다 ({cars.length}/{MAX_CARS})</li>
                    <li>• 등록된 차량으로 정비 예약을 할 수 있습니다</li>
                    <li>• 차량 정보는 언제든지 수정 가능합니다</li>
                    <li>• 삭제된 차량의 정비 기록은 복구할 수 없습니다</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
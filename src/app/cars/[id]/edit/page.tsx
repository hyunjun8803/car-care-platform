'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Car,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Send,
  Calendar,
  Palette,
  Fuel,
  Hash,
  Gauge,
  Building2
} from 'lucide-react';

interface Car {
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
}

interface CarFormData {
  name: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  mileage: number;
  fuelType: string;
  engineSize: string;
  color: string;
}

export default function CarEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();

  const [car, setCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState<CarFormData>({
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    mileage: 0,
    fuelType: '',
    engineSize: '',
    color: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 인증 확인
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // 차량 정보 조회
  const fetchCar = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/cars/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '차량 정보를 불러오는데 실패했습니다.');
      }

      const carData = data.data;
      setCar(carData);
      setFormData({
        name: carData.name || '',
        brand: carData.brand || '',
        model: carData.model || '',
        year: carData.year || new Date().getFullYear(),
        licensePlate: carData.licensePlate || '',
        mileage: carData.mileage || 0,
        fuelType: carData.fuelType || '',
        engineSize: carData.engineSize || '',
        color: carData.color || ''
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && params.id) {
      fetchCar();
    }
  }, [status, params.id]);

  const handleInputChange = (field: keyof CarFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return '차량명을 입력해주세요.';
    if (!formData.brand.trim()) return '제조사를 입력해주세요.';
    if (!formData.model.trim()) return '모델명을 입력해주세요.';
    if (!formData.licensePlate.trim()) return '차량번호를 입력해주세요.';
    if (!formData.fuelType) return '연료 타입을 선택해주세요.';
    if (formData.year < 1990 || formData.year > new Date().getFullYear() + 1) {
      return '올바른 연식을 입력해주세요.';
    }
    if (formData.mileage < 0) return '주행거리는 0 이상이어야 합니다.';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(`/api/cars/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '차량 정보 수정에 실패했습니다.');
      }

      setSuccess(true);
      
      // 3초 후 차량 목록으로 이동
      setTimeout(() => {
        router.push('/cars');
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : '차량 정보 수정 중 오류가 발생했습니다.');
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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-8">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm w-full max-w-md">
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              차량 정보 수정 완료!
            </h3>
            <p className="text-gray-600 mb-6">
              차량 정보가 성공적으로 수정되었습니다.
            </p>
            <Button 
              onClick={() => router.push('/cars')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              내 차량 목록으로 이동
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">
              {error || '차량 정보를 찾을 수 없습니다.'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              돌아가기
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                차량 정보 수정
              </h1>
              <p className="text-gray-600">
                {car.name}의 정보를 수정하세요
              </p>
            </div>
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        {/* 차량 수정 폼 */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-blue-600" />
              <span>차량 정보 수정</span>
            </CardTitle>
            <CardDescription>
              변경하실 차량 정보를 입력해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 차량명 */}
                <div>
                  <Label htmlFor="name" className="text-base font-medium">
                    차량명 *
                  </Label>
                  <div className="relative mt-2">
                    <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="예: 내 아반떼"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* 제조사 */}
                <div>
                  <Label htmlFor="brand" className="text-base font-medium">
                    제조사 *
                  </Label>
                  <div className="relative mt-2">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="brand"
                      type="text"
                      placeholder="예: 현대"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* 모델명 */}
                <div>
                  <Label htmlFor="model" className="text-base font-medium">
                    모델명 *
                  </Label>
                  <Input
                    id="model"
                    type="text"
                    placeholder="예: 아반떼"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>

                {/* 연식 */}
                <div>
                  <Label htmlFor="year" className="text-base font-medium">
                    연식 *
                  </Label>
                  <div className="relative mt-2">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="year"
                      type="number"
                      min="1990"
                      max={new Date().getFullYear() + 1}
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* 차량번호 */}
                <div>
                  <Label htmlFor="licensePlate" className="text-base font-medium">
                    차량번호 *
                  </Label>
                  <div className="relative mt-2">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="licensePlate"
                      type="text"
                      placeholder="예: 12가3456"
                      value={formData.licensePlate}
                      onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* 주행거리 */}
                <div>
                  <Label htmlFor="mileage" className="text-base font-medium">
                    주행거리 (km)
                  </Label>
                  <div className="relative mt-2">
                    <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="mileage"
                      type="number"
                      min="0"
                      placeholder="예: 50000"
                      value={formData.mileage}
                      onChange={(e) => handleInputChange('mileage', parseInt(e.target.value) || 0)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* 연료 타입 */}
                <div>
                  <Label htmlFor="fuelType" className="text-base font-medium">
                    연료 타입 *
                  </Label>
                  <Select 
                    value={formData.fuelType} 
                    onValueChange={(value) => handleInputChange('fuelType', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <div className="flex items-center">
                        <Fuel className="h-4 w-4 mr-2 text-gray-400" />
                        <SelectValue placeholder="연료 타입을 선택하세요" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GASOLINE">휘발유</SelectItem>
                      <SelectItem value="DIESEL">경유</SelectItem>
                      <SelectItem value="HYBRID">하이브리드</SelectItem>
                      <SelectItem value="ELECTRIC">전기</SelectItem>
                      <SelectItem value="LPG">LPG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 엔진 크기 */}
                <div>
                  <Label htmlFor="engineSize" className="text-base font-medium">
                    엔진 크기
                  </Label>
                  <Input
                    id="engineSize"
                    type="text"
                    placeholder="예: 1.6L"
                    value={formData.engineSize}
                    onChange={(e) => handleInputChange('engineSize', e.target.value)}
                    className="mt-2"
                  />
                </div>

                {/* 색상 */}
                <div>
                  <Label htmlFor="color" className="text-base font-medium">
                    차량 색상
                  </Label>
                  <div className="relative mt-2">
                    <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="color"
                      type="text"
                      placeholder="예: 흰색"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* 제출 버튼 */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                >
                  {submitting ? (
                    <>처리 중...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      정보 수정
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
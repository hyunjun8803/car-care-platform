'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Search,
  Loader2,
  Car,
  Hash,
  CheckCircle,
  AlertCircle,
  User,
  Building2,
  Calendar
} from 'lucide-react';
import { ShimmerButton } from '@/components/ui/shimmer-button';

interface VehicleSearchResult {
  licensePlate: string;
  brand: string;
  model: string;
  name: string;
  year: number;
  color: string;
  engineSize: string;
  fuelType: string;
  transmission: string;
  registrationDate: string;
  carType: string;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  engine: {
    maxPower: string;
    maxTorque: string;
  };
}

export default function VehicleSearchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [licensePlate, setLicensePlate] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<VehicleSearchResult | null>(null);
  const [showOwnerForm, setShowOwnerForm] = useState(false);

  // 인증 확인
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  // 차량번호 검색 함수
  const handleVehicleSearch = async () => {
    if (!licensePlate.trim()) {
      setError('차량번호를 입력해주세요.');
      return;
    }

    setSearchLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/vehicles/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          licensePlate: licensePlate
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '차량 정보 조회에 실패했습니다.');
      }

      setSearchResult(data.data);
      setShowOwnerForm(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : '차량 정보 조회 중 오류가 발생했습니다.');
    } finally {
      setSearchLoading(false);
    }
  };

  // 소유자 확인 및 등록
  const handleOwnerConfirm = async (isOwner: boolean) => {
    if (isOwner) {
      if (!ownerName.trim()) {
        setError('소유자명을 입력해주세요.');
        return;
      }

      // 검색된 데이터로 직접 차량 등록
      await registerVehicle();
    } else {
      // 브랜드 선택 페이지로 이동
      router.push('/cars/brand');
    }
  };

  // 차량 등록 함수
  const registerVehicle = async () => {
    if (!searchResult) return;

    setRegistrationLoading(true);
    setError(null);

    try {
      const carData = {
        name: `${ownerName}의 ${searchResult.name}`,
        brand: searchResult.brand,
        model: searchResult.model,
        year: searchResult.year,
        licensePlate: searchResult.licensePlate,
        mileage: 0, // 기본값
        fuelType: mapFuelTypeToFormValue(searchResult.fuelType),
        engineSize: searchResult.engineSize,
        color: searchResult.color
      };

      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '차량 등록에 실패했습니다.');
      }

      // 대시보드로 이동
      router.push('/dashboard?success=차량이 성공적으로 등록되었습니다.');

    } catch (err) {
      setError(err instanceof Error ? err.message : '차량 등록 중 오류가 발생했습니다.');
    } finally {
      setRegistrationLoading(false);
    }
  };

  // 연료 타입 매핑 함수
  const mapFuelTypeToFormValue = (fuelType: string): string => {
    const mapping: { [key: string]: string } = {
      '가솔린': 'GASOLINE',
      '휘발유': 'GASOLINE',
      '디젤': 'DIESEL',
      '경유': 'DIESEL',
      '하이브리드': 'HYBRID',
      '전기': 'ELECTRIC',
      'LPG': 'LPG'
    };
    return mapping[fuelType] || 'GASOLINE';
  };

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
                차량 검색
              </h1>
              <p className="text-gray-600">
                차량번호로 정보를 조회하세요
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

        {/* 차량번호 검색 */}
        {!searchResult && (
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-blue-600" />
                <span>차량번호 검색</span>
              </CardTitle>
              <CardDescription>
                차량번호를 입력하여 차량 정보를 조회합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="licensePlate" className="text-base font-medium">
                    차량번호 *
                  </Label>
                  <div className="flex space-x-2 mt-2">
                    <div className="relative flex-1">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="licensePlate"
                        type="text"
                        placeholder="예: 12가3456"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <ShimmerButton
                      onClick={handleVehicleSearch}
                      disabled={searchLoading || !licensePlate.trim()}
                      shimmerColor="#ffffff"
                      background="linear-gradient(135deg, #3b82f6, #8b5cf6)"
                      className="px-6 py-2 text-white font-medium"
                    >
                      {searchLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          검색
                        </>
                      )}
                    </ShimmerButton>
                  </div>
                </div>

                {/* 안내사항 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">검색 안내</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li className="flex items-start">
                      <Search className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      차량번호를 정확히 입력해주세요.
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      검색 후 소유자 확인이 필요합니다.
                    </li>
                    <li className="flex items-start">
                      <Car className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      정확한 정보 확인 후 등록이 진행됩니다.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 검색 결과 및 소유자 확인 */}
        {searchResult && (
          <div className="space-y-6">
            {/* 차량 정보 */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Car className="h-5 w-5 text-green-600" />
                  <span>검색된 차량 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 기본 정보 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">차량번호</p>
                        <p className="font-semibold">{searchResult.licensePlate}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">제조사</p>
                        <p className="font-semibold">{searchResult.brand}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Car className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">모델명</p>
                        <p className="font-semibold">{searchResult.model}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">연식</p>
                        <p className="font-semibold">{searchResult.year}년</p>
                      </div>
                    </div>
                  </div>

                  {/* 추가 세부 정보 */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">상세 정보</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">색상:</span>
                        <span className="ml-2 font-medium">{searchResult.color}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">연료:</span>
                        <span className="ml-2 font-medium">{searchResult.fuelType}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">배기량:</span>
                        <span className="ml-2 font-medium">{searchResult.engineSize}cc</span>
                      </div>
                      <div>
                        <span className="text-gray-500">변속기:</span>
                        <span className="ml-2 font-medium">{searchResult.transmission}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">차종:</span>
                        <span className="ml-2 font-medium">{searchResult.carType}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">중량:</span>
                        <span className="ml-2 font-medium">{searchResult.weight}</span>
                      </div>
                    </div>
                  </div>

                  {/* 크기 정보 */}
                  {searchResult.dimensions && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">차량 크기</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">전장:</span>
                          <span className="ml-2 font-medium">{searchResult.dimensions.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">전폭:</span>
                          <span className="ml-2 font-medium">{searchResult.dimensions.width}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">전고:</span>
                          <span className="ml-2 font-medium">{searchResult.dimensions.height}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 엔진 정보 */}
                  {searchResult.engine && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">엔진 정보</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">최고출력:</span>
                          <span className="ml-2 font-medium">{searchResult.engine.maxPower}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">최대토크:</span>
                          <span className="ml-2 font-medium">{searchResult.engine.maxTorque}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 소유자 확인 */}
            {showOwnerForm && (
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-purple-600" />
                    <span>소유자 확인</span>
                  </CardTitle>
                  <CardDescription>
                    이 차량의 소유자이신가요? 소유자명을 입력해주세요.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="ownerName" className="text-base font-medium">
                        소유자명 *
                      </Label>
                      <div className="relative mt-2">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="ownerName"
                          type="text"
                          placeholder="소유자 이름을 입력하세요"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleOwnerConfirm(true)}
                        disabled={registrationLoading || !ownerName.trim()}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        {registrationLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            등록 중...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            네, 맞습니다
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleOwnerConfirm(false)}
                        disabled={registrationLoading}
                        className="flex-1"
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        아니요, 다른 차량입니다
                      </Button>
                    </div>

                    {/* 안내사항 */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-medium text-purple-900 mb-2">확인 안내</h4>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>"네, 맞습니다"</strong>를 선택하면 검색된 정보로 차량이 등록됩니다.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <AlertCircle className="h-4 w-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>"아니요"</strong>를 선택하면 브랜드 선택 페이지로 이동합니다.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Fuel,
  Hash,
  Gauge,
  Building2,
  Search,
  Loader2
} from 'lucide-react';
import { ShimmerButton } from '@/components/ui/shimmer-button';

interface CarFormData {
  name: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  mileage: number;
  fuelType: string;
}

// 브랜드 이름 매핑
const brandNames: Record<string, string> = {
  'hyundai': '현대',
  'kia': '기아',
  'genesis': '제네시스',
  'kgm': 'KGM',
  'renault': '르노코리아',
  'bmw': 'BMW',
  'mercedes': '벤츠',
  'audi': '아우디',
  'tesla': '테슬라',
  'toyota': '토요타',
  'honda': '혼다',
  'nissan': '닛산',
  'mazda': '마쯔다',
  'lexus': '렉서스',
  'infiniti': '인피니티',
  'volkswagen': '폭스바겐',
  'porsche': '포르쉐',
  'ford': '포드',
  'chevrolet': '쉐보레',
  'cadillac': '캐딜락',
  'lincoln': '링컨',
  'volvo': '볼보',
  'jaguar': '재규어',
  'landrover': '랜드로버',
  'mini': '미니',
  'peugeot': '푸조',
  'citroen': '시트로엥'
};

// 모델 이름 매핑
const modelNames: Record<string, Record<string, string>> = {
  'hyundai': {
    'avante': '아반떼',
    'sonata': '쏘나타',
    'grandeur': '그랜저',
    'venue': '베뉴',
    'kona': '코나',
    'tucson': '투싼',
    'santafe': '싼타페',
    'palisade': '팰리세이드',
    'staria': '스타리아',
    'ioniq5': '아이오닉5',
    'ioniq6': '아이오닉6',
    'porter2': '포터2'
  },
  'kia': {
    'morning': '모닝',
    'ray': '레이',
    'k3': 'K3',
    'k5': 'K5',
    'k7': 'K7',
    'k9': 'K9',
    'seltos': '셀토스',
    'sportage': '스포티지',
    'sorento': '쏘렌토',
    'mohave': '모하비',
    'carnival': '카니발',
    'ev6': 'EV6',
    'ev9': 'EV9'
  },
  'genesis': {
    'g70': 'G70',
    'g80': 'G80',
    'g90': 'G90',
    'gv60': 'GV60',
    'gv70': 'GV70',
    'gv80': 'GV80'
  },
  'tesla': {
    'model3': 'Model 3',
    'models': 'Model S',
    'modelx': 'Model X',
    'modely': 'Model Y'
  },
  'bmw': {
    '1series': '1시리즈',
    '2series': '2시리즈',
    '3series': '3시리즈',
    '4series': '4시리즈',
    '5series': '5시리즈',
    '6series': '6시리즈',
    '7series': '7시리즈',
    '8series': '8시리즈',
    'x1': 'X1',
    'x3': 'X3',
    'x5': 'X5',
    'x7': 'X7'
  },
  'mercedes': {
    'aclass': 'A-Class',
    'cclass': 'C-Class',
    'eclass': 'E-Class',
    'sclass': 'S-Class',
    'gla': 'GLA',
    'glb': 'GLB',
    'glc': 'GLC',
    'gle': 'GLE',
    'gls': 'GLS'
  },
  'audi': {
    'a3': 'A3',
    'a4': 'A4',
    'a6': 'A6',
    'a8': 'A8',
    'q3': 'Q3',
    'q5': 'Q5',
    'q7': 'Q7',
    'q8': 'Q8'
  },
  'toyota': {
    'corolla': '코롤라',
    'camry': '캠리',
    'avalon': '아발론',
    'chr': 'C-HR',
    'rav4': 'RAV4',
    'highlander': '하이랜더',
    'prius': '프리우스'
  }
};

export default function CarRegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState<CarFormData>({
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    mileage: 0,
    fuelType: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // 차량번호 검색 관련 상태
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [showSearchResult, setShowSearchResult] = useState(false);

  // URL 파라미터에서 브랜드/모델 정보 가져오기
  useEffect(() => {
    const brand = searchParams.get('brand');
    const model = searchParams.get('model');
    
    if (brand || model) {
      setFormData(prev => ({
        ...prev,
        brand: getBrandDisplayName(brand || ''),
        model: getModelDisplayName(brand || '', model || ''),
        name: model ? `내 ${getModelDisplayName(brand || '', model || '')}` : prev.name
      }));
    }
  }, [searchParams]);

  // 브랜드 표시 이름 가져오기
  const getBrandDisplayName = (brandId: string): string => {
    return brandNames[brandId] || brandId;
  };

  // 모델 표시 이름 가져오기
  const getModelDisplayName = (brandId: string, modelId: string): string => {
    return modelNames[brandId]?.[modelId] || modelId;
  };

  // 인증 확인
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

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

  // 차량번호 검색 함수
  const handleVehicleSearch = async () => {
    if (!formData.licensePlate.trim()) {
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
          licensePlate: formData.licensePlate
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '차량 정보 조회에 실패했습니다.');
      }

      setSearchResult(data.data);
      setShowSearchResult(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : '차량 정보 조회 중 오류가 발생했습니다.');
    } finally {
      setSearchLoading(false);
    }
  };

  // 검색 결과를 폼에 적용
  const applySearchResult = () => {
    if (searchResult) {
      setFormData(prev => ({
        ...prev,
        name: searchResult.name || `${searchResult.brand} ${searchResult.model}`,
        brand: searchResult.brand || '',
        model: searchResult.model || '',
        year: searchResult.year || prev.year,
        fuelType: mapFuelTypeToFormValue(searchResult.fuelType) || ''
      }));
      setShowSearchResult(false);
      setError(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '차량 등록에 실패했습니다.');
      }

      setSuccess(true);
      
      // 3초 후 차량 목록으로 이동
      setTimeout(() => {
        router.push('/cars');
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : '차량 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-8">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm w-full max-w-md">
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              차량 등록 완료!
            </h3>
            <p className="text-gray-600 mb-6">
              차량이 성공적으로 등록되었습니다.
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
                차량 등록
              </h1>
              <p className="text-gray-600">
                새로운 차량 정보를 등록하세요
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

        {/* 차량 등록 폼 */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-blue-600" />
              <span>차량 정보</span>
            </CardTitle>
            <CardDescription>
              정확한 차량 정보를 입력해주세요. 예약 시 이 정보가 사용됩니다.
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
                <div className="md:col-span-2">
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
              </div>

              {/* 차량 검색 결과 */}
              {showSearchResult && searchResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-green-900 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      차량 정보 검색 결과
                    </h4>
                    <Button
                      type="button"
                      onClick={() => setShowSearchResult(false)}
                      variant="ghost"
                      size="sm"
                      className="text-green-700"
                    >
                      닫기
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <span className="text-green-700 font-medium">차량명:</span>
                      <span className="ml-2 text-green-900">{searchResult.name}</span>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">제조사:</span>
                      <span className="ml-2 text-green-900">{searchResult.brand}</span>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">모델:</span>
                      <span className="ml-2 text-green-900">{searchResult.model}</span>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">연식:</span>
                      <span className="ml-2 text-green-900">{searchResult.year}년</span>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">연료:</span>
                      <span className="ml-2 text-green-900">{searchResult.fuelType}</span>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">변속기:</span>
                      <span className="ml-2 text-green-900">{searchResult.transmission || '미지정'}</span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      onClick={() => setShowSearchResult(false)}
                      variant="outline"
                      size="sm"
                    >
                      취소
                    </Button>
                    <ShimmerButton
                      type="button"
                      onClick={applySearchResult}
                      shimmerColor="#ffffff"
                      background="linear-gradient(135deg, #059669, #10b981)"
                      className="px-4 py-2 text-white text-sm font-medium"
                    >
                      이 정보로 채우기
                    </ShimmerButton>
                  </div>
                </div>
              )}

              {/* 안내사항 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">등록 안내</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    최대 10대까지 등록 가능합니다.
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    정확한 차량 정보를 입력해주세요.
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    등록 후에도 정보를 수정할 수 있습니다.
                  </li>
                </ul>
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
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                >
                  {loading ? (
                    <>처리 중...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      차량 등록
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
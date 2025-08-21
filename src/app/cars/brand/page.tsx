'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BrandLogo } from '@/components/ui/brand-logos';
import { 
  ArrowLeft,
  Car,
  CheckCircle,
  ChevronRight
} from 'lucide-react';

interface CarBrand {
  id: string;
  name: string;
  logo?: string;
  description: string;
  country: string;
}

const carBrands: CarBrand[] = [
  // 국산차
  { id: 'hyundai', name: '현대', description: '현대자동차', country: '한국' },
  { id: 'kia', name: '기아', description: '기아자동차', country: '한국' },
  { id: 'genesis', name: '제네시스', description: '제네시스', country: '한국' },
  { id: 'kgm', name: 'KGM', description: 'KG모빌리티 (구 쌍용)', country: '한국' },
  { id: 'renault', name: '르노코리아', description: '르노삼성자동차', country: '한국' },
  
  // 수입차 - 독일
  { id: 'bmw', name: 'BMW', description: 'BMW', country: '독일' },
  { id: 'mercedes', name: '벤츠', description: '메르세데스-벤츠', country: '독일' },
  { id: 'audi', name: '아우디', description: '아우디', country: '독일' },
  { id: 'volkswagen', name: '폭스바겐', description: '폭스바겐', country: '독일' },
  { id: 'porsche', name: '포르쉐', description: '포르쉐', country: '독일' },
  
  // 수입차 - 일본
  { id: 'toyota', name: '토요타', description: '토요타', country: '일본' },
  { id: 'honda', name: '혼다', description: '혼다', country: '일본' },
  { id: 'nissan', name: '닛산', description: '닛산', country: '일본' },
  { id: 'mazda', name: '마쯔다', description: '마쯔다', country: '일본' },
  { id: 'lexus', name: '렉서스', description: '렉서스', country: '일본' },
  { id: 'infiniti', name: '인피니티', description: '인피니티', country: '일본' },
  
  // 수입차 - 미국
  { id: 'tesla', name: '테슬라', description: '테슬라', country: '미국' },
  { id: 'ford', name: '포드', description: '포드', country: '미국' },
  { id: 'chevrolet', name: '쉐보레', description: '쉐보레', country: '미국' },
  { id: 'cadillac', name: '캐딜락', description: '캐딜락', country: '미국' },
  { id: 'lincoln', name: '링컨', description: '링컨', country: '미국' },
  
  // 수입차 - 기타
  { id: 'volvo', name: '볼보', description: '볼보', country: '스웨덴' },
  { id: 'jaguar', name: '재규어', description: '재규어', country: '영국' },
  { id: 'landrover', name: '랜드로버', description: '랜드로버', country: '영국' },
  { id: 'mini', name: '미니', description: '미니', country: '영국' },
  { id: 'peugeot', name: '푸조', description: '푸조', country: '프랑스' },
  { id: 'citroen', name: '시트로엥', description: '시트로엥', country: '프랑스' },
];

// 국가별 그룹핑
const brandsByCountry = carBrands.reduce((acc, brand) => {
  if (!acc[brand.country]) {
    acc[brand.country] = [];
  }
  acc[brand.country].push(brand);
  return acc;
}, {} as Record<string, CarBrand[]>);

export default function BrandSelectionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  // 인증 확인
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const handleBrandSelect = (brandId: string) => {
    setSelectedBrand(brandId);
    // 모델 선택 페이지로 이동
    router.push(`/cars/model?brand=${brandId}`);
  };

  const getCountryFlag = (country: string): string => {
    const flags: Record<string, string> = {
      '한국': '🇰🇷',
      '독일': '🇩🇪',
      '일본': '🇯🇵',
      '미국': '🇺🇸',
      '스웨덴': '🇸🇪',
      '영국': '🇬🇧',
      '프랑스': '🇫🇷'
    };
    return flags[country] || '🌍';
  };

  const getBrandColor = (brandId: string): string => {
    const colors: Record<string, string> = {
      'hyundai': 'from-blue-500 to-blue-600',
      'kia': 'from-red-500 to-red-600',
      'genesis': 'from-gray-700 to-gray-800',
      'kgm': 'from-orange-500 to-orange-600',
      'renault': 'from-yellow-500 to-yellow-600',
      'bmw': 'from-blue-600 to-blue-700',
      'mercedes': 'from-gray-600 to-gray-700',
      'audi': 'from-red-600 to-red-700',
      'tesla': 'from-red-500 to-red-600',
      'toyota': 'from-red-500 to-red-600',
      'honda': 'from-red-600 to-red-700',
      'volkswagen': 'from-blue-500 to-blue-600',
      'porsche': 'from-yellow-500 to-yellow-600',
      'nissan': 'from-blue-600 to-blue-700',
      'mazda': 'from-red-500 to-red-600',
      'lexus': 'from-gray-600 to-gray-700',
      'infiniti': 'from-purple-600 to-purple-700',
      'ford': 'from-blue-600 to-blue-700',
      'chevrolet': 'from-yellow-500 to-yellow-600',
      'cadillac': 'from-gray-700 to-gray-800',
      'lincoln': 'from-gray-600 to-gray-700',
      'volvo': 'from-blue-500 to-blue-600',
      'jaguar': 'from-green-600 to-green-700',
      'landrover': 'from-green-600 to-green-700',
      'mini': 'from-green-500 to-green-600',
      'peugeot': 'from-blue-500 to-blue-600',
      'citroen': 'from-red-500 to-red-600'
    };
    return colors[brandId] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                브랜드 선택
              </h1>
              <p className="text-gray-600">
                차량 제조사를 선택해주세요
              </p>
            </div>
          </div>
        </div>

        {/* 안내사항 */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Car className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            원하는 브랜드를 선택하면 해당 브랜드의 모델 목록으로 이동합니다.
          </AlertDescription>
        </Alert>

        {/* 브랜드 목록 */}
        <div className="space-y-8">
          {Object.entries(brandsByCountry).map(([country, brands]) => (
            <div key={country}>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">{getCountryFlag(country)}</span>
                {country} 브랜드
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {brands.map((brand) => (
                  <Card
                    key={brand.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border-0 shadow-lg bg-white/70 backdrop-blur-sm group ${
                      selectedBrand === brand.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleBrandSelect(brand.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 bg-gradient-to-r ${getBrandColor(brand.id)} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-200`}>
                        <BrandLogo brand={brand.id} className="h-8 w-8 text-white" />
                      </div>
                      
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {brand.name}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {brand.description}
                      </p>
                      
                      <div className="flex items-center justify-center text-xs text-gray-500">
                        <span className="mr-1">{getCountryFlag(brand.country)}</span>
                        {brand.country}
                      </div>
                      
                      <div className="mt-4 flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="text-sm font-medium mr-1">선택하기</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 하단 안내 */}
        <div className="mt-12 text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <h3 className="font-bold text-gray-800 mb-3">찾으시는 브랜드가 없나요?</h3>
            <p className="text-gray-600 mb-4">
              목록에 없는 브랜드의 경우 직접 입력하여 등록할 수 있습니다.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push('/cars/register')}
              className="border-gray-300 hover:bg-gray-50"
            >
              <Car className="h-4 w-4 mr-2" />
              직접 입력하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
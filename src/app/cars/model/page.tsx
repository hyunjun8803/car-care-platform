'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Car,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

interface CarModel {
  id: string;
  name: string;
  category: string;
  description: string;
}

// 브랜드별 모델 데이터
const carModelsByBrand: Record<string, CarModel[]> = {
  'hyundai': [
    { id: 'avante', name: '아반떼', category: '준중형', description: '준중형 세단' },
    { id: 'sonata', name: '쏘나타', category: '중형', description: '중형 세단' },
    { id: 'grandeur', name: '그랜저', category: '대형', description: '대형 세단' },
    { id: 'venue', name: '베뉴', category: '소형SUV', description: '소형 SUV' },
    { id: 'kona', name: '코나', category: '소형SUV', description: '소형 SUV' },
    { id: 'tucson', name: '투싼', category: '준중형SUV', description: '준중형 SUV' },
    { id: 'santafe', name: '싼타페', category: '중형SUV', description: '중형 SUV' },
    { id: 'palisade', name: '팰리세이드', category: '대형SUV', description: '대형 SUV' },
    { id: 'staria', name: '스타리아', category: 'MPV', description: 'MPV' },
    { id: 'ioniq5', name: '아이오닉5', category: '전기차', description: '전기 SUV' },
    { id: 'ioniq6', name: '아이오닉6', category: '전기차', description: '전기 세단' },
    { id: 'porter2', name: '포터2', category: '상용차', description: '소형 트럭' }
  ],
  'kia': [
    { id: 'morning', name: '모닝', category: '경차', description: '경차' },
    { id: 'ray', name: '레이', category: '경차', description: '경차' },
    { id: 'k3', name: 'K3', category: '준중형', description: '준중형 세단' },
    { id: 'k5', name: 'K5', category: '중형', description: '중형 세단' },
    { id: 'k7', name: 'K7', category: '준대형', description: '준대형 세단' },
    { id: 'k9', name: 'K9', category: '대형', description: '대형 세단' },
    { id: 'seltos', name: '셀토스', category: '소형SUV', description: '소형 SUV' },
    { id: 'sportage', name: '스포티지', category: '준중형SUV', description: '준중형 SUV' },
    { id: 'sorento', name: '쏘렌토', category: '중형SUV', description: '중형 SUV' },
    { id: 'mohave', name: '모하비', category: '대형SUV', description: '대형 SUV' },
    { id: 'carnival', name: '카니발', category: 'MPV', description: 'MPV' },
    { id: 'ev6', name: 'EV6', category: '전기차', description: '전기 SUV' },
    { id: 'ev9', name: 'EV9', category: '전기차', description: '전기 대형 SUV' }
  ],
  'genesis': [
    { id: 'g70', name: 'G70', category: '준중형', description: '럭셔리 준중형 세단' },
    { id: 'g80', name: 'G80', category: '중형', description: '럭셔리 중형 세단' },
    { id: 'g90', name: 'G90', category: '대형', description: '럭셔리 대형 세단' },
    { id: 'gv60', name: 'GV60', category: '전기차', description: '럭셔리 전기 SUV' },
    { id: 'gv70', name: 'GV70', category: '준중형SUV', description: '럭셔리 준중형 SUV' },
    { id: 'gv80', name: 'GV80', category: '중형SUV', description: '럭셔리 중형 SUV' }
  ],
  'tesla': [
    { id: 'model3', name: 'Model 3', category: '전기차', description: '전기 세단' },
    { id: 'models', name: 'Model S', category: '전기차', description: '프리미엄 전기 세단' },
    { id: 'modelx', name: 'Model X', category: '전기차', description: '전기 SUV' },
    { id: 'modely', name: 'Model Y', category: '전기차', description: '전기 크로스오버' }
  ],
  'bmw': [
    { id: '1series', name: '1시리즈', category: '소형', description: '프리미엄 소형차' },
    { id: '2series', name: '2시리즈', category: '소형', description: '프리미엄 쿠페/컨버터블' },
    { id: '3series', name: '3시리즈', category: '준중형', description: '프리미엄 준중형 세단' },
    { id: '4series', name: '4시리즈', category: '준중형', description: '프리미엄 쿠페/컨버터블' },
    { id: '5series', name: '5시리즈', category: '중형', description: '프리미엄 중형 세단' },
    { id: '6series', name: '6시리즈', category: '중형', description: '프리미엄 쿠페/컨버터블' },
    { id: '7series', name: '7시리즈', category: '대형', description: '프리미엄 대형 세단' },
    { id: '8series', name: '8시리즈', category: '대형', description: '프리미엄 쿠페/컨버터블' },
    { id: 'x1', name: 'X1', category: '소형SUV', description: '프리미엄 소형 SUV' },
    { id: 'x3', name: 'X3', category: '준중형SUV', description: '프리미엄 준중형 SUV' },
    { id: 'x5', name: 'X5', category: '중형SUV', description: '프리미엄 중형 SUV' },
    { id: 'x7', name: 'X7', category: '대형SUV', description: '프리미엄 대형 SUV' }
  ],
  'mercedes': [
    { id: 'aclass', name: 'A-Class', category: '소형', description: '프리미엄 소형차' },
    { id: 'cclass', name: 'C-Class', category: '준중형', description: '프리미엄 준중형 세단' },
    { id: 'eclass', name: 'E-Class', category: '중형', description: '프리미엄 중형 세단' },
    { id: 'sclass', name: 'S-Class', category: '대형', description: '프리미엄 대형 세단' },
    { id: 'gla', name: 'GLA', category: '소형SUV', description: '프리미엄 소형 SUV' },
    { id: 'glb', name: 'GLB', category: '소형SUV', description: '프리미엄 소형 SUV' },
    { id: 'glc', name: 'GLC', category: '준중형SUV', description: '프리미엄 준중형 SUV' },
    { id: 'gle', name: 'GLE', category: '중형SUV', description: '프리미엄 중형 SUV' },
    { id: 'gls', name: 'GLS', category: '대형SUV', description: '프리미엄 대형 SUV' }
  ],
  'audi': [
    { id: 'a3', name: 'A3', category: '소형', description: '프리미엄 소형차' },
    { id: 'a4', name: 'A4', category: '준중형', description: '프리미엄 준중형 세단' },
    { id: 'a6', name: 'A6', category: '중형', description: '프리미엄 중형 세단' },
    { id: 'a8', name: 'A8', category: '대형', description: '프리미엄 대형 세단' },
    { id: 'q3', name: 'Q3', category: '소형SUV', description: '프리미엄 소형 SUV' },
    { id: 'q5', name: 'Q5', category: '준중형SUV', description: '프리미엄 준중형 SUV' },
    { id: 'q7', name: 'Q7', category: '중형SUV', description: '프리미엄 중형 SUV' },
    { id: 'q8', name: 'Q8', category: '대형SUV', description: '프리미엄 대형 SUV' }
  ],
  'toyota': [
    { id: 'corolla', name: '코롤라', category: '준중형', description: '준중형 세단' },
    { id: 'camry', name: '캠리', category: '중형', description: '중형 세단' },
    { id: 'avalon', name: '아발론', category: '대형', description: '대형 세단' },
    { id: 'chr', name: 'C-HR', category: '소형SUV', description: '소형 SUV' },
    { id: 'rav4', name: 'RAV4', category: '준중형SUV', description: '준중형 SUV' },
    { id: 'highlander', name: '하이랜더', category: '중형SUV', description: '중형 SUV' },
    { id: 'prius', name: '프리우스', category: '하이브리드', description: '하이브리드 세단' }
  ]
};

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

export default function ModelSelectionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  
  const brandId = searchParams.get('brand');
  const brandName = brandId ? brandNames[brandId] : '';
  const models = brandId ? carModelsByBrand[brandId] || [] : [];

  // 인증 확인
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  // 브랜드가 선택되지 않은 경우
  if (!brandId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">
              브랜드가 선택되지 않았습니다. 브랜드 선택 페이지로 이동해주세요.
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Button onClick={() => router.push('/cars/brand')}>
              브랜드 선택하기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    // 선택된 브랜드와 모델 정보를 가지고 차량 등록 페이지로 이동
    router.push(`/cars/register?brand=${brandId}&model=${modelId}`);
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      '경차': 'from-green-400 to-green-500',
      '소형': 'from-blue-400 to-blue-500',
      '준중형': 'from-indigo-400 to-indigo-500',
      '중형': 'from-purple-400 to-purple-500',
      '준대형': 'from-pink-400 to-pink-500',
      '대형': 'from-red-400 to-red-500',
      '소형SUV': 'from-teal-400 to-teal-500',
      '준중형SUV': 'from-cyan-400 to-cyan-500',
      '중형SUV': 'from-sky-400 to-sky-500',
      '대형SUV': 'from-violet-400 to-violet-500',
      'MPV': 'from-orange-400 to-orange-500',
      '전기차': 'from-emerald-400 to-emerald-500',
      '하이브리드': 'from-lime-400 to-lime-500',
      '상용차': 'from-gray-400 to-gray-500'
    };
    return colors[category] || 'from-gray-400 to-gray-500';
  };

  // 카테고리별 그룹핑
  const modelsByCategory = models.reduce((acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = [];
    }
    acc[model.category].push(model);
    return acc;
  }, {} as Record<string, CarModel[]>);

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
                {brandName} 모델 선택
              </h1>
              <p className="text-gray-600">
                원하는 차량 모델을 선택해주세요
              </p>
            </div>
          </div>
        </div>

        {/* 안내사항 */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Car className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            모델을 선택하면 차량 등록 페이지로 이동합니다.
          </AlertDescription>
        </Alert>

        {/* 모델이 없는 경우 */}
        {models.length === 0 && (
          <div className="text-center py-12">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              등록된 모델이 없습니다
            </h3>
            <p className="text-gray-500 mb-6">
              {brandName} 브랜드의 모델 정보가 준비 중입니다.
            </p>
            <Button
              onClick={() => router.push('/cars/register')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              직접 입력하기
            </Button>
          </div>
        )}

        {/* 모델 목록 */}
        {models.length > 0 && (
          <div className="space-y-8">
            {Object.entries(modelsByCategory).map(([category, categoryModels]) => (
              <div key={category}>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getCategoryColor(category)} mr-3`}></div>
                  {category}
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {categoryModels.map((model) => (
                    <Card
                      key={model.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border-0 shadow-lg bg-white/70 backdrop-blur-sm group ${
                        selectedModel === model.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleModelSelect(model.id)}
                    >
                      <CardContent className="p-6 text-center">
                        <div className={`w-16 h-16 bg-gradient-to-r ${getCategoryColor(model.category)} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-200`}>
                          <Car className="h-8 w-8 text-white" />
                        </div>
                        
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          {model.name}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {model.description}
                        </p>
                        
                        <div className="flex items-center justify-center text-xs text-gray-500 mb-3">
                          <span className={`px-2 py-1 rounded-full bg-gradient-to-r ${getCategoryColor(model.category)} text-white font-medium`}>
                            {model.category}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <InteractiveHoverButton 
                            className="text-xs px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleModelSelect(model.id);
                            }}
                          >
                            선택하기
                          </InteractiveHoverButton>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 하단 안내 */}
        <div className="mt-12 text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <h3 className="font-bold text-gray-800 mb-3">찾으시는 모델이 없나요?</h3>
            <p className="text-gray-600 mb-4">
              목록에 없는 모델의 경우 직접 입력하여 등록할 수 있습니다.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push(`/cars/register?brand=${brandId}`)}
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
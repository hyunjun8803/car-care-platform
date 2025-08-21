'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Star, 
  Phone, 
  Clock, 
  Search, 
  Navigation, 
  Filter,
  AlertCircle,
  Car,
  Wrench,
  DollarSign,
  ArrowRight
} from 'lucide-react';

interface Shop {
  id: string;
  businessName: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  operatingHours: string;
  rating: number;
  totalReviews: number;
  distance: number | null;
  serviceCategories: string[];
  services: Array<{
    id: string;
    name: string;
    description: string;
    basePrice: number;
    estimatedDuration: number;
    category: string;
  }>;
  isApproved: boolean;
}

export default function BookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState<'requesting' | 'granted' | 'denied' | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');

  // 인증 확인
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/booking');
    }
  }, [status, router]);

  // 위치 정보 요청
  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setError('위치 서비스가 지원되지 않는 브라우저입니다.');
      setLocationPermission('denied');
      return;
    }

    setLocationPermission('requesting');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        setLocationPermission('granted');
        console.log('사용자 위치:', location);
      },
      (error) => {
        console.error('위치 정보 오류:', error);
        setLocationPermission('denied');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('위치 정보 액세스가 거부되었습니다.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('위치 정보를 사용할 수 없습니다.');
            break;
          case error.TIMEOUT:
            setError('위치 정보 요청이 시간초과되었습니다.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5분
      }
    );
  };

  // 정비소 목록 조회
  const fetchShops = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('search', searchQuery);
      if (userLocation) {
        params.append('latitude', userLocation.lat.toString());
        params.append('longitude', userLocation.lng.toString());
      }
      params.append('sort', sortBy);

      const response = await fetch(`/api/shops?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '정비소 목록을 불러오는데 실패했습니다.');
      }

      setShops(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드 및 위치 요청
  useEffect(() => {
    if (status === 'authenticated') {
      requestLocation();
    }
  }, [status]);

  // 위치 정보를 얻은 후 또는 검색/정렬 변경 시 정비소 조회
  useEffect(() => {
    if (status === 'authenticated' && locationPermission !== 'requesting') {
      fetchShops();
    }
  }, [status, locationPermission, searchQuery, sortBy, userLocation]);

  // 정비소 선택 핸들러
  const handleShopSelect = (shopId: string) => {
    router.push(`/booking/new?shopId=${shopId}`);
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Car className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            정비소 찾기
          </h1>
          <p className="text-gray-600 text-lg">
            가까운 정비소를 찾아 간편하게 예약하세요
          </p>
        </div>

        {/* 위치 정보 요청 */}
        {locationPermission === 'denied' && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <Navigation className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">위치 정보를 허용하시면</p>
                  <p className="text-sm text-amber-600">가까운 정비소부터 보여드릴 수 있어요</p>
                </div>
              </div>
              <Button onClick={requestLocation} variant="outline" className="border-amber-300">
                위치 허용
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="정비소명, 주소로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === 'distance' ? 'default' : 'outline'}
                  onClick={() => setSortBy('distance')}
                  disabled={!userLocation}
                  size="sm"
                >
                  거리순
                </Button>
                <Button
                  variant={sortBy === 'rating' ? 'default' : 'outline'}
                  onClick={() => setSortBy('rating')}
                  size="sm"
                >
                  평점순
                </Button>
                <Button
                  variant={sortBy === 'name' ? 'default' : 'outline'}
                  onClick={() => setSortBy('name')}
                  size="sm"
                >
                  이름순
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">정비소 목록을 불러오는 중...</p>
          </div>
        )}

        {/* 정비소 목록 */}
        {!loading && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {userLocation ? '가까운 정비소' : '승인된 정비소'} ({shops.length}개)
              </h2>
              {userLocation && (
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  <Navigation className="h-3 w-3 mr-1" />
                  위치 기반 정렬
                </Badge>
              )}
            </div>

            {shops.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? '검색 결과가 없습니다' : '등록된 정비소가 없습니다'}
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery ? '다른 검색어로 시도해보세요.' : '승인된 정비소가 등록되면 표시됩니다.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shops.map((shop) => (
                  <Card 
                    key={shop.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-md bg-white/70 backdrop-blur-sm"
                    onClick={() => handleShopSelect(shop.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg text-gray-900">
                          {shop.businessName}
                        </CardTitle>
                        {shop.distance && (
                          <Badge variant="secondary" className="ml-2">
                            {shop.distance}km
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                          <span>{shop.rating.toFixed(1)} ({shop.totalReviews})</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{shop.operatingHours}</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{shop.address}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">{shop.phone}</span>
                        </div>

                        {/* 서비스 카테고리 */}
                        <div className="flex flex-wrap gap-1">
                          {shop.serviceCategories.map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>

                        {/* 주요 서비스 */}
                        <div className="border-t pt-3">
                          <p className="text-xs text-gray-500 mb-2">주요 서비스</p>
                          {shop.services.slice(0, 2).map((service) => (
                            <div key={service.id} className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-700">{service.name}</span>
                              <span className="text-blue-600 font-medium">
                                {service.basePrice.toLocaleString()}원
                              </span>
                            </div>
                          ))}
                        </div>

                        <Button 
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShopSelect(shop.id);
                          }}
                        >
                          예약하기
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
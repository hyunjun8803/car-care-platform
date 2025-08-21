"use client";

import { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Star, Phone, Clock, DollarSign, Car, Calendar, Filter } from "lucide-react";

interface Shop {
  id: string;
  businessName: string;
  address: string;
  phone: string;
  email?: string;
  operatingHours?: string;
  rating: number;
  totalReviews: number;
  distance?: number;
  serviceCategories: string[];
  services: Array<{
    id: string;
    name: string;
    description: string;
    basePrice: number;
    estimatedDuration: number;
    category: string;
  }>;
  totalBookings: number;
  createdAt: string;
}

interface ShopFilters {
  search: string;
  category: string;
  sort: string;
}

export default function ShopsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ShopFilters>({
    search: '',
    category: 'all',
    sort: 'rating'
  });
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [selectedShop, setSelectedShop] = useState<string>("");

  // 위치 권한 요청
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('위치 권한을 허용하지 않음:', error);
        }
      );
    }
  }, []);

  // 정비소 목록 조회
  const fetchShops = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        sort: filters.sort
      });

      if (filters.search) {
        params.append('search', filters.search);
      }

      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }

      if (userLocation) {
        params.append('latitude', userLocation.latitude.toString());
        params.append('longitude', userLocation.longitude.toString());
      }

      const response = await fetch(`/api/shops?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '정비소 목록을 불러오는데 실패했습니다.');
      }

      setShops(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 필터 변경 시 재조회
  useEffect(() => {
    if (status === 'authenticated') {
      fetchShops(1);
    }
  }, [filters, userLocation, status]);

  // 인증 확인
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const handleFilterChange = (key: keyof ShopFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleShopClick = (shopId: string) => {
    router.push(`/shops/${shopId}`);
  };

  const handleBookingClick = (shopId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/booking/new?shopId=${shopId}`);
  };

  const selectedShopData = shops.find(shop => shop.id === selectedShop);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                정비소 찾기
              </h1>
              <p className="text-gray-600 mt-1">
                믿을 수 있는 정비소에서 차량 정비를 예약하세요
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 검색어 */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="정비소 이름, 주소, 서비스로 검색..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-10 bg-white/70 border-gray-200 focus:border-blue-500 shadow-sm"
                    />
                  </div>
                </div>

                {/* 카테고리 필터 */}
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger className="bg-white/70 border-gray-200">
                    <SelectValue placeholder="서비스 카테고리" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="정기점검">정기점검</SelectItem>
                    <SelectItem value="엔진수리">엔진수리</SelectItem>
                    <SelectItem value="타이어/휠">타이어/휠</SelectItem>
                    <SelectItem value="브레이크">브레이크</SelectItem>
                    <SelectItem value="전기계통">전기계통</SelectItem>
                    <SelectItem value="에어컨">에어컨</SelectItem>
                  </SelectContent>
                </Select>

                {/* 정렬 */}
                <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value)}>
                  <SelectTrigger className="bg-white/70 border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">평점순</SelectItem>
                    <SelectItem value="reviews">리뷰순</SelectItem>
                    <SelectItem value="distance">거리순</SelectItem>
                    <SelectItem value="name">이름순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 결과 정보 */}
          {!loading && shops.length > 0 && (
            <div className="text-gray-600 mb-4">
              총 {pagination.total}개의 정비소 (페이지 {pagination.current}/{pagination.pages})
            </div>
          )}
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="text-gray-500">정비소를 검색하고 있습니다...</div>
          </div>
        )}

        {/* 오류 상태 */}
        {error && (
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm border-red-200">
            <CardContent className="p-6">
              <div className="text-red-600">{error}</div>
            </CardContent>
          </Card>
        )}

        {/* 정비소 목록 */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Card 
                key={shop.id} 
                className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-200 cursor-pointer"
                onClick={() => handleShopClick(shop.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                        {shop.businessName}
                      </CardTitle>
                      <CardDescription className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {shop.address}
                        {shop.distance && (
                          <span className="ml-2 text-blue-600">
                            ({shop.distance}km)
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {/* 평점 및 리뷰 */}
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                      <span className="font-medium">{shop.rating.toFixed(1)}</span>
                      <span className="text-gray-600 ml-1">({shop.totalReviews} 리뷰)</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-1" />
                      <span>{shop.phone}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* 운영시간 */}
                  {shop.operatingHours && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {shop.operatingHours}
                    </div>
                  )}

                  {/* 서비스 카테고리 */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {shop.serviceCategories.slice(0, 3).map((category) => (
                        <Badge key={category} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          {category}
                        </Badge>
                      ))}
                      {shop.serviceCategories.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{shop.serviceCategories.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* 가격 범위 */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-600">
                      서비스 가격: {Math.min(...shop.services.map(s => s.basePrice)).toLocaleString()}원 ~ {Math.max(...shop.services.map(s => s.basePrice)).toLocaleString()}원
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      총 {shop.services.length}개 서비스 • {shop.totalBookings}건 예약 완료
                    </div>
                  </div>

                  {/* 예약 버튼 */}
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                    onClick={(e) => handleBookingClick(shop.id, e)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    예약하기
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 빈 결과 */}
        {!loading && !error && shops.length === 0 && (
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="text-gray-500">
                검색 조건에 맞는 정비소를 찾을 수 없습니다.
              </div>
              <Button 
                variant="outline" 
                className="mt-4 border-gray-200 text-gray-600 hover:bg-blue-50"
                onClick={() => setFilters({ search: '', category: '', sort: 'rating' })}
              >
                필터 초기화
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 페이지네이션 */}
        {!loading && pagination.pages > 1 && (
          <div className="flex justify-center space-x-2 mt-8">
            <Button
              variant="outline"
              onClick={() => fetchShops(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="border-gray-200 text-gray-600 hover:bg-blue-50"
            >
              이전
            </Button>
            
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const page = pagination.current <= 3 ? i + 1 : 
                          pagination.current > pagination.pages - 2 ? pagination.pages - 4 + i : 
                          pagination.current - 2 + i;
              
              if (page < 1 || page > pagination.pages) return null;
              
              return (
                <Button
                  key={page}
                  variant={pagination.current === page ? "default" : "outline"}
                  onClick={() => fetchShops(page)}
                  className={pagination.current === page ? 
                    "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" : 
                    "border-gray-200 text-gray-600 hover:bg-blue-50"
                  }
                >
                  {page}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              onClick={() => fetchShops(pagination.current + 1)}
              disabled={pagination.current === pagination.pages}
              className="border-gray-200 text-gray-600 hover:bg-blue-50"
            >
              다음
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
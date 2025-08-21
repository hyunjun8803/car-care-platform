'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import ShopReviews from '@/components/ShopReviews';
import { 
  MapPin,
  Phone,
  Clock,
  Star,
  Calendar,
  DollarSign,
  Wrench,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Shield
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  estimatedDuration: number;
  isAvailable: boolean;
  category: {
    id: string;
    name: string;
    description: string;
    icon: string;
  };
}

interface Shop {
  id: string;
  businessName: string;
  businessNumber: string;
  address: string;
  phone: string;
  email?: string;
  description?: string;
  operatingHours?: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  isActive: boolean;
  services: Service[];
  createdAt: string;
}

export default function ShopDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 정비소 상세 정보 조회
  const fetchShopDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/shops/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '정비소 정보를 불러오는데 실패했습니다.');
      }

      setShop(data.data);

    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchShopDetail();
    }
  }, [params.id]);

  // 예약하기 버튼 클릭
  const handleBooking = (serviceId: string) => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    router.push(`/booking/new?shopId=${params.id}&serviceId=${serviceId}`);
  };

  // 로딩 상태
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">
            {error || '정비소 정보를 찾을 수 없습니다.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Button>
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 정비소 정보 및 서비스 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 정비소 기본 정보 */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <CardTitle className="text-2xl">{shop.businessName}</CardTitle>
                      {shop.isVerified && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                          <Shield className="h-3 w-3 mr-1" />
                          인증
                        </Badge>
                      )}
                      {!shop.isActive && (
                        <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                          운영중지
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{shop.rating.toFixed(1)}</span>
                        <span className="text-gray-500">({shop.totalReviews}개 리뷰)</span>
                      </div>
                    </div>
                  </div>
                </div>
                {shop.description && (
                  <CardDescription className="text-base mt-3">
                    {shop.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">주소</p>
                      <p className="text-gray-600">{shop.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">연락처</p>
                      <p className="text-gray-600">{shop.phone}</p>
                    </div>
                  </div>
                  {shop.operatingHours && (
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">운영시간</p>
                        <p className="text-gray-600">{shop.operatingHours}</p>
                      </div>
                    </div>
                  )}
                  {shop.email && (
                    <div className="flex items-start space-x-3">
                      <ExternalLink className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">이메일</p>
                        <p className="text-gray-600">{shop.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 제공 서비스 */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wrench className="h-5 w-5 text-blue-600" />
                  <span>제공 서비스</span>
                </CardTitle>
                <CardDescription>
                  이 정비소에서 제공하는 서비스 목록입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                {shop.services.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {shop.services
                      .filter(service => service.isAvailable)
                      .map((service) => (
                        <div
                          key={service.id}
                          className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-medium text-gray-900">{service.name}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {service.category.name}
                                </Badge>
                              </div>
                              {service.description && (
                                <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                              )}
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  {service.basePrice.toLocaleString()}원~
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  약 {service.estimatedDuration}분
                                </div>
                              </div>
                            </div>
                            <div className="ml-4">
                              <Button
                                onClick={() => handleBooking(service.id)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                disabled={!shop.isActive}
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                예약하기
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    현재 제공 중인 서비스가 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽: 추가 정보 */}
          <div className="space-y-6">
            {/* 빠른 연락 */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>빠른 연락</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(`tel:${shop.phone}`)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  전화하기
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(shop.address)}`)}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  길찾기
                </Button>
              </CardContent>
            </Card>

            {/* 정비소 정보 */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>정비소 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm text-gray-500">사업자등록번호</Label>
                  <p className="font-mono">{shop.businessNumber}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">등록일</Label>
                  <p>{new Date(shop.createdAt).toLocaleDateString('ko-KR')}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">상태</Label>
                  <div className="flex items-center space-x-2">
                    {shop.isActive ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">운영중</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-red-600">운영중지</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 리뷰 섹션 */}
        <div className="mt-12">
          <ShopReviews
            shopId={shop.id}
            shopName={shop.businessName}
            averageRating={shop.rating}
            totalReviews={shop.totalReviews}
          />
        </div>
      </div>
    </div>
  );
}
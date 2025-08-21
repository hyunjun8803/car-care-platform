import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Wrench, 
  DollarSign, 
  Clock, 
  Building2,
  ArrowLeft,
  Search,
  Filter,
  Plus,
  MoreVertical,
  TrendingUp,
  Star
} from 'lucide-react';

// 임시 데이터 (실제로는 데이터베이스에서 가져와야 함)
const sampleServices = [
  {
    id: 1,
    name: '엔진오일 교환',
    category: '정기점검',
    shop: '서울정비소',
    price: 45000,
    duration: 30,
    rating: 4.8,
    bookingCount: 156,
    status: 'active'
  },
  {
    id: 2,
    name: '브레이크 패드 교체',
    category: '안전점검',
    shop: '부산정비센터',
    price: 180000,
    duration: 90,
    rating: 4.9,
    bookingCount: 89,
    status: 'active'
  },
  {
    id: 3,
    name: '종합점검',
    category: '정기점검',
    shop: '대구자동차정비',
    price: 120000,
    duration: 120,
    rating: 4.7,
    bookingCount: 203,
    status: 'active'
  },
  {
    id: 4,
    name: '에어컨 점검',
    category: '계절정비',
    shop: '서울정비소',
    price: 80000,
    duration: 60,
    rating: 4.6,
    bookingCount: 78,
    status: 'inactive'
  }
];

export default async function ServicesPage() {
  const adminUser = await getAdminSession();
  
  if (!adminUser) {
    redirect('/auth/signin?callbackUrl=/admin/services');
  }

  const activeServices = sampleServices.filter(service => service.status === 'active');
  const totalRevenue = sampleServices.reduce((sum, service) => sum + (service.price * service.bookingCount), 0);
  const totalBookings = sampleServices.reduce((sum, service) => sum + service.bookingCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <a href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  대시보드로
                </a>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">정비상품 관리</h1>
                <p className="text-gray-600">등록된 정비 서비스와 상품을 관리합니다</p>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              새 서비스 등록
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Wrench className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {sampleServices.length}
              </div>
              <p className="text-sm text-gray-600">전체 서비스</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {activeServices.length}
              </div>
              <p className="text-sm text-gray-600">활성 서비스</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {(totalRevenue / 1000000).toFixed(1)}M
              </div>
              <p className="text-sm text-gray-600">총 매출 (원)</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-amber-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-600">
                {totalBookings}
              </div>
              <p className="text-sm text-gray-600">총 예약 수</p>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="서비스명, 정비소, 카테고리로 검색..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                필터
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 카테고리 탭 */}
        <div className="flex space-x-2 mb-6">
          <Button variant="default" size="sm">전체</Button>
          <Button variant="outline" size="sm">정기점검</Button>
          <Button variant="outline" size="sm">안전점검</Button>
          <Button variant="outline" size="sm">계절정비</Button>
          <Button variant="outline" size="sm">긴급수리</Button>
        </div>

        {/* 서비스 목록 */}
        <div className="space-y-4">
          {sampleServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      service.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Wrench className={`h-6 w-6 ${
                        service.status === 'active' ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {service.name}
                        </h3>
                        <Badge variant="outline">
                          {service.category}
                        </Badge>
                        <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                          {service.status === 'active' ? '활성' : '비활성'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2" />
                          {service.shop}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          {service.price.toLocaleString()}원
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {service.duration}분
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-2 text-yellow-500" />
                          {service.rating} ({service.bookingCount}건)
                        </div>
                        <div className="text-xs text-gray-500">
                          매출: {(service.price * service.bookingCount).toLocaleString()}원
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      편집
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 인기 서비스 순위 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              인기 서비스 순위
            </CardTitle>
            <CardDescription>예약 건수 기준 상위 서비스</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sampleServices
                .sort((a, b) => b.bookingCount - a.bookingCount)
                .slice(0, 5)
                .map((service, index) => (
                  <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-500">{service.shop}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{service.bookingCount}건</p>
                      <p className="text-sm text-gray-500">★ {service.rating}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
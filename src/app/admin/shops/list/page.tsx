import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-auth';
import { supabaseUserStorage } from '@/lib/supabase-storage';
import { userStorage } from '@/lib/storage';
import { fileUserStorage } from '@/lib/file-storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowLeft,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';

async function getAllShops() {
  let allShops: any[] = [];
  
  // Supabase에서 정비소 조회
  try {
    const supabaseUsers = await supabaseUserStorage.getAll();
    const supabaseShops = supabaseUsers.filter(user => 
      user.userType === 'SHOP_OWNER' && 
      user.shopInfo
    );
    allShops.push(...supabaseShops);
    console.log('Supabase shops:', supabaseShops.length);
  } catch (error) {
    console.log('Supabase query failed:', error);
  }
  
  // 파일 저장소에서 정비소 조회 (개발 환경에서 중요)
  try {
    const fileUsers = await fileUserStorage.getAll();
    const fileShops = fileUsers.filter(user => 
      user.userType === 'SHOP_OWNER' && 
      user.shopInfo
    );
    allShops.push(...fileShops);
    console.log('File storage shops:', fileShops.length);
  } catch (error) {
    console.log('File storage query failed:', error);
  }
  
  // 메모리 저장소에서 정비소 조회
  try {
    const memoryUsers = await userStorage.getAll();
    const memoryShops = memoryUsers.filter(user => 
      user.userType === 'SHOP_OWNER' && 
      user.shopInfo
    );
    allShops.push(...memoryShops);
    console.log('Memory shops:', memoryShops.length);
  } catch (error) {
    console.log('Memory storage query failed:', error);
  }

  // 중복 제거 (이메일 기준)
  const uniqueShops = allShops.filter((shop, index, self) =>
    index === self.findIndex(s => s.email === shop.email)
  );

  console.log('Total unique shops:', uniqueShops.length);
  return uniqueShops;
}

export default async function ShopsListPage() {
  const adminUser = await getAdminSession();
  
  if (!adminUser) {
    redirect('/auth/signin?callbackUrl=/admin/shops/list');
  }

  const allShops = await getAllShops();
  const approvedShops = allShops.filter(shop => shop.shopInfo?.status === 'APPROVED');
  const pendingShops = allShops.filter(shop => shop.shopInfo?.status === 'PENDING');
  const rejectedShops = allShops.filter(shop => shop.shopInfo?.status === 'REJECTED');

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
                <h1 className="text-2xl font-bold text-gray-900">정비소 관리</h1>
                <p className="text-gray-600">등록된 정비소 목록과 상태를 관리합니다</p>
              </div>
            </div>
            <Badge variant="secondary">
              총 {allShops.length}개 정비소
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Building2 className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {allShops.length}
              </div>
              <p className="text-sm text-gray-600">전체 정비소</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {approvedShops.length}
              </div>
              <p className="text-sm text-gray-600">승인 완료</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-amber-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-600">
                {pendingShops.length}
              </div>
              <p className="text-sm text-gray-600">승인 대기</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                {rejectedShops.length}
              </div>
              <p className="text-sm text-gray-600">승인 거부</p>
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
                  placeholder="정비소명, 이메일, 전화번호로 검색..."
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

        {/* 정비소 목록 */}
        {allShops.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                등록된 정비소가 없습니다
              </h3>
              <p className="text-gray-500">
                정비소 가입 신청이 들어오면 여기에 표시됩니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {allShops.map((shop) => (
              <Card key={shop.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${
                        shop.shopInfo?.status === 'APPROVED' ? 'bg-green-100' :
                        shop.shopInfo?.status === 'PENDING' ? 'bg-amber-100' :
                        'bg-red-100'
                      }`}>
                        <Building2 className={`h-6 w-6 ${
                          shop.shopInfo?.status === 'APPROVED' ? 'text-green-600' :
                          shop.shopInfo?.status === 'PENDING' ? 'text-amber-600' :
                          'text-red-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {shop.shopInfo?.shopName || '정비소명 없음'}
                          </h3>
                          <Badge variant={
                            shop.shopInfo?.status === 'APPROVED' ? 'default' :
                            shop.shopInfo?.status === 'PENDING' ? 'secondary' :
                            'destructive'
                          }>
                            {shop.shopInfo?.status === 'APPROVED' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                승인됨
                              </>
                            ) : shop.shopInfo?.status === 'PENDING' ? (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                대기중
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                거부됨
                              </>
                            )}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            {shop.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            {shop.phone || '전화번호 없음'}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {shop.shopInfo?.address || '주소 없음'}
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500">
                          사업자번호: {shop.shopInfo?.businessNumber || '정보 없음'} | 
                          대표자: {shop.name} | 
                          가입일: {new Date(shop.createdAt).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        상세보기
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
        )}
      </div>
    </div>
  );
}
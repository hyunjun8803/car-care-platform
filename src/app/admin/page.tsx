import { redirect } from 'next/navigation';
import { getAdminSession, isSuperAdmin } from '@/lib/admin-auth';
import { supabaseUserStorage } from '@/lib/supabase-storage';
import { userStorage } from '@/lib/storage';
import { fileUserStorage } from '@/lib/file-storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building2, 
  FileText, 
  Settings, 
  BarChart3, 
  Shield,
  CheckCircle,
  Clock,
  XCircle 
} from 'lucide-react';

async function getAllUsers() {
  let allUsers: any[] = [];
  
  // 1. Supabase에서 조회
  try {
    const supabaseUsers = await supabaseUserStorage.getAll();
    allUsers.push(...supabaseUsers);
    console.log('Supabase users:', supabaseUsers.length);
  } catch (error) {
    console.log('Supabase query failed:', error);
  }
  
  // 2. 파일 저장소에서 조회 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    try {
      const fileUsers = await fileUserStorage.getAll();
      allUsers.push(...fileUsers);
      console.log('File users:', fileUsers.length);
    } catch (error) {
      console.log('File storage query failed:', error);
    }
  }
  
  // 3. 메모리 저장소에서 조회
  try {
    const memoryUsers = await userStorage.getAll();
    allUsers.push(...memoryUsers);
    console.log('Memory users:', memoryUsers.length);
  } catch (error) {
    console.log('Memory storage query failed:', error);
  }

  // 중복 제거 (이메일 기준)
  const uniqueUsers = allUsers.filter((user, index, self) =>
    index === self.findIndex(u => u.email === user.email)
  );

  console.log('Total unique users:', uniqueUsers.length);
  return uniqueUsers;
}

export default async function AdminDashboard() {
  const adminUser = await getAdminSession();
  
  if (!adminUser) {
    redirect('/auth/signin?callbackUrl=/admin');
  }

  const users = await getAllUsers();
  const totalUsers = users.length;
  const customerUsers = users.filter(user => user.userType === 'CUSTOMER').length;
  const shopOwners = users.filter(user => user.userType === 'SHOP_OWNER').length;
  const pendingShops = users.filter(user => 
    user.userType === 'SHOP_OWNER' && 
    user.shopInfo?.status === 'PENDING'
  ).length;
  const approvedShops = users.filter(user => 
    user.userType === 'SHOP_OWNER' && 
    user.shopInfo?.status === 'APPROVED'
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
                <p className="text-gray-600">CarCare 플랫폼 관리</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={isSuperAdmin(adminUser) ? "destructive" : "secondary"}>
                {isSuperAdmin(adminUser) ? '최고관리자' : '관리자'}
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{adminUser.name}</p>
                <p className="text-xs text-gray-500">{adminUser.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 통계 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                고객 {customerUsers}명, 정비소 {shopOwners}명
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">승인 대기 정비소</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{pendingShops}</div>
              <p className="text-xs text-muted-foreground">
                승인이 필요한 정비소
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">승인된 정비소</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedShops}</div>
              <p className="text-xs text-muted-foreground">
                활성화된 정비소
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">시스템 상태</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">정상</div>
              <p className="text-xs text-muted-foreground">
                모든 서비스 운영 중
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 주요 기능 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">사용자 관리</CardTitle>
                  <CardDescription>고객 및 정비소 계정 관리</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <a href="/admin/users">
                  사용자 목록 보기
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Building2 className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">정비소 승인</CardTitle>
                  <CardDescription>정비소 가입 승인 처리</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <a href="/admin/shops/approvals">
                  {pendingShops > 0 ? `${pendingShops}개 승인 대기` : '승인 관리'}
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Building2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">정비소 관리</CardTitle>
                  <CardDescription>등록된 정비소 목록 관리</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <a href="/admin/shops/list">
                  정비소 목록 보기
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Settings className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">정비상품 관리</CardTitle>
                  <CardDescription>정비 서비스 및 상품 관리</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <a href="/admin/services">
                  상품 관리하기
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">예약 모니터링</CardTitle>
                  <CardDescription>전체 예약 현황 모니터링</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <a href="/admin/bookings">
                  예약 현황 보기
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">콘텐츠 관리</CardTitle>
                  <CardDescription>공지사항 및 콘텐츠 관리</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                콘텐츠 관리하기
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>최근 가입 사용자</span>
            </CardTitle>
            <CardDescription>최근 7일간 가입한 사용자</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      user.userType === 'CUSTOMER' ? 'bg-blue-500' : 'bg-amber-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.userType === 'CUSTOMER' ? 'default' : 'secondary'}>
                      {user.userType === 'CUSTOMER' ? '고객' : '정비소'}
                    </Badge>
                    {user.shopInfo && (
                      <Badge variant={
                        user.shopInfo.status === 'APPROVED' ? 'default' : 
                        user.shopInfo.status === 'PENDING' ? 'secondary' : 'destructive'
                      }>
                        {user.shopInfo.status === 'APPROVED' ? '승인됨' : 
                         user.shopInfo.status === 'PENDING' ? '대기중' : '거절됨'}
                      </Badge>
                    )}
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
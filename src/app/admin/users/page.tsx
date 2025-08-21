import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-auth';
import { supabaseUserStorage } from '@/lib/supabase-storage';
import { userStorage } from '@/lib/storage';
import { fileUserStorage } from '@/lib/file-storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Building2,
  User,
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

export default async function UsersPage() {
  const adminUser = await getAdminSession();
  
  if (!adminUser) {
    redirect('/auth/signin?callbackUrl=/admin/users');
  }

  const users = await getAllUsers();
  const totalUsers = users.length;
  const customerUsers = users.filter(user => user.userType === 'CUSTOMER');
  const shopOwners = users.filter(user => user.userType === 'SHOP_OWNER');
  const pendingShops = users.filter(user => 
    user.userType === 'SHOP_OWNER' && 
    user.shopInfo?.status === 'PENDING'
  );
  const approvedShops = users.filter(user => 
    user.userType === 'SHOP_OWNER' && 
    user.shopInfo?.status === 'APPROVED'
  );

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
                <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
                <p className="text-gray-600">전체 사용자 목록 및 정보 관리</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                총 {totalUsers}명
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
                등록된 전체 사용자
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">고객</CardTitle>
              <User className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{customerUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                일반 고객 사용자
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">정비소</CardTitle>
              <Building2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{shopOwners.length}</div>
              <p className="text-xs text-muted-foreground">
                정비소 사업자
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">승인된 정비소</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{approvedShops.length}</div>
              <p className="text-xs text-muted-foreground">
                활성화된 정비소
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 사용자 목록 */}
        <div className="grid grid-cols-1 gap-6">
          {/* 고객 목록 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-500" />
                <span>고객 ({customerUsers.length}명)</span>
              </CardTitle>
              <CardDescription>일반 고객 사용자 목록</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerUsers.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">등록된 고객이 없습니다.</p>
                ) : (
                  customerUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </span>
                            {user.phone && (
                              <span className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {user.phone}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="default">고객</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* 정비소 목록 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-green-500" />
                <span>정비소 ({shopOwners.length}명)</span>
              </CardTitle>
              <CardDescription>정비소 사업자 목록</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shopOwners.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">등록된 정비소가 없습니다.</p>
                ) : (
                  shopOwners.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <div>
                          <p className="text-sm font-medium">
                            {user.shopInfo?.shopName || '정비소명 없음'} ({user.name})
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </span>
                            {user.phone && (
                              <span className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {user.phone}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          {user.shopInfo?.address && (
                            <p className="text-xs text-gray-400 mt-1">{user.shopInfo.address}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">정비소</Badge>
                        {user.shopInfo && (
                          <Badge variant={
                            user.shopInfo.status === 'APPROVED' ? 'default' : 
                            user.shopInfo.status === 'PENDING' ? 'secondary' : 'destructive'
                          }>
                            {user.shopInfo.status === 'APPROVED' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                승인됨
                              </>
                            ) : user.shopInfo.status === 'PENDING' ? (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                대기중
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                거절됨
                              </>
                            )}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
import { supabaseUserStorage } from '@/lib/supabase-storage';
import { userStorage } from '@/lib/storage';
import { fileUserStorage } from '@/lib/file-storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function AllUsersDebugPage() {
  // Supabase에서 모든 사용자 조회
  let supabaseUsers: any[] = [];
  let supabaseError = null;
  
  try {
    supabaseUsers = await supabaseUserStorage.getAll();
  } catch (error: any) {
    supabaseError = error.message;
  }

  // 메모리 저장소에서 모든 사용자 조회
  let memoryUsers: any[] = [];
  let memoryError = null;
  
  try {
    memoryUsers = await userStorage.getAll();
  } catch (error: any) {
    memoryError = error.message;
  }

  // 파일 저장소에서 모든 사용자 조회
  let fileUsers: any[] = [];
  let fileError = null;
  
  try {
    fileUsers = await fileUserStorage.getAll();
  } catch (error: any) {
    fileError = error.message;
  }

  // 정비소 사용자만 필터링
  const supabaseShops = supabaseUsers.filter(user => user.userType === 'SHOP_OWNER');
  const memoryShops = memoryUsers.filter(user => user.userType === 'SHOP_OWNER');
  const fileShops = fileUsers.filter(user => user.userType === 'SHOP_OWNER');
  
  // 승인 대기 중인 정비소
  const pendingSupabaseShops = supabaseShops.filter(user => user.shopInfo?.status === 'PENDING');
  const pendingMemoryShops = memoryShops.filter(user => user.shopInfo?.status === 'PENDING');
  const pendingFileShops = fileShops.filter(user => user.shopInfo?.status === 'PENDING');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">전체 사용자 디버그 정보</h1>
      
      {/* 요약 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{supabaseUsers.length}</div>
            <p className="text-sm text-gray-600">Supabase 전체</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{memoryUsers.length}</div>
            <p className="text-sm text-gray-600">메모리 전체</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{fileUsers.length}</div>
            <p className="text-sm text-gray-600">파일 전체</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{pendingSupabaseShops.length}</div>
            <p className="text-sm text-gray-600">Supabase 대기중</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{pendingMemoryShops.length}</div>
            <p className="text-sm text-gray-600">메모리 대기중</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{pendingFileShops.length}</div>
            <p className="text-sm text-gray-600">파일 대기중</p>
          </CardContent>
        </Card>
      </div>

      {/* Supabase 사용자 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Supabase 사용자 ({supabaseUsers.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          {supabaseError ? (
            <div className="text-red-600">
              <p><strong>오류:</strong> {supabaseError}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {supabaseUsers.map((user) => (
                <div key={user.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{user.name} ({user.email})</p>
                      <p className="text-sm text-gray-500">ID: {user.id}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.userType === 'CUSTOMER' ? 'default' : 'secondary'}>
                        {user.userType}
                      </Badge>
                      {user.role && (
                        <Badge variant="destructive">{user.role}</Badge>
                      )}
                    </div>
                  </div>
                  {user.shopInfo && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <p><strong>정비소명:</strong> {user.shopInfo.shopName}</p>
                      <p><strong>사업자번호:</strong> {user.shopInfo.businessNumber}</p>
                      <p><strong>상태:</strong> 
                        <Badge variant={
                          user.shopInfo.status === 'APPROVED' ? 'default' :
                          user.shopInfo.status === 'PENDING' ? 'secondary' : 'destructive'
                        } className="ml-2">
                          {user.shopInfo.status}
                        </Badge>
                      </p>
                      <p><strong>주소:</strong> {user.shopInfo.address}</p>
                      {user.shopInfo.description && (
                        <p><strong>소개:</strong> {user.shopInfo.description}</p>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    가입일: {new Date(user.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              ))}
              {supabaseUsers.length === 0 && (
                <p className="text-gray-500 text-center py-4">등록된 사용자가 없습니다.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 파일 저장소 사용자 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>파일 저장소 사용자 ({fileUsers.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          {fileError ? (
            <div className="text-red-600">
              <p><strong>오류:</strong> {fileError}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fileUsers.map((user) => (
                <div key={user.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{user.name} ({user.email})</p>
                      <p className="text-sm text-gray-500">ID: {user.id}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.userType === 'CUSTOMER' ? 'default' : 'secondary'}>
                        {user.userType}
                      </Badge>
                      {user.role && (
                        <Badge variant="destructive">{user.role}</Badge>
                      )}
                    </div>
                  </div>
                  {user.shopInfo && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <p><strong>정비소명:</strong> {user.shopInfo.shopName}</p>
                      <p><strong>사업자번호:</strong> {user.shopInfo.businessNumber}</p>
                      <p><strong>상태:</strong> 
                        <Badge variant={
                          user.shopInfo.status === 'APPROVED' ? 'default' :
                          user.shopInfo.status === 'PENDING' ? 'secondary' : 'destructive'
                        } className="ml-2">
                          {user.shopInfo.status}
                        </Badge>
                      </p>
                      <p><strong>주소:</strong> {user.shopInfo.address}</p>
                      {user.shopInfo.description && (
                        <p><strong>소개:</strong> {user.shopInfo.description}</p>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    가입일: {new Date(user.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              ))}
              {fileUsers.length === 0 && (
                <p className="text-gray-500 text-center py-4">등록된 사용자가 없습니다.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 메모리 저장소 사용자 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>메모리 저장소 사용자 ({memoryUsers.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          {memoryError ? (
            <div className="text-red-600">
              <p><strong>오류:</strong> {memoryError}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {memoryUsers.map((user) => (
                <div key={user.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{user.name} ({user.email})</p>
                      <p className="text-sm text-gray-500">ID: {user.id}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.userType === 'CUSTOMER' ? 'default' : 'secondary'}>
                        {user.userType}
                      </Badge>
                      {user.role && (
                        <Badge variant="destructive">{user.role}</Badge>
                      )}
                    </div>
                  </div>
                  {user.shopInfo && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <p><strong>정비소명:</strong> {user.shopInfo.shopName}</p>
                      <p><strong>사업자번호:</strong> {user.shopInfo.businessNumber}</p>
                      <p><strong>상태:</strong> 
                        <Badge variant={
                          user.shopInfo.status === 'APPROVED' ? 'default' :
                          user.shopInfo.status === 'PENDING' ? 'secondary' : 'destructive'
                        } className="ml-2">
                          {user.shopInfo.status}
                        </Badge>
                      </p>
                      <p><strong>주소:</strong> {user.shopInfo.address}</p>
                      {user.shopInfo.description && (
                        <p><strong>소개:</strong> {user.shopInfo.description}</p>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    가입일: {new Date(user.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              ))}
              {memoryUsers.length === 0 && (
                <p className="text-gray-500 text-center py-4">등록된 사용자가 없습니다.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
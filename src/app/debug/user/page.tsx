import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseUserStorage } from '@/lib/supabase-storage';
import { userStorage } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function UserDebugPage() {
  const session = await getServerSession(authOptions);
  
  // 사용자 정보 조회
  let supabaseUser = null;
  let memoryUser = null;
  let supabaseError = null;
  let memoryError = null;

  if (session?.user?.email) {
    try {
      supabaseUser = await supabaseUserStorage.findByEmail(session.user.email);
    } catch (error: any) {
      supabaseError = error.message;
    }

    try {
      memoryUser = await userStorage.findByEmail(session.user.email);
    } catch (error: any) {
      memoryError = error.message;
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">사용자 디버그 정보</h1>
      
      {/* NextAuth 세션 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>NextAuth 세션</CardTitle>
        </CardHeader>
        <CardContent>
          {session ? (
            <div className="space-y-2">
              <p><strong>이메일:</strong> {session.user?.email}</p>
              <p><strong>이름:</strong> {session.user?.name}</p>
              <p><strong>세션 만료:</strong> {session.expires}</p>
            </div>
          ) : (
            <p className="text-red-600">세션 없음</p>
          )}
        </CardContent>
      </Card>

      {/* Supabase 사용자 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Supabase 사용자 정보</CardTitle>
        </CardHeader>
        <CardContent>
          {supabaseError ? (
            <div className="text-red-600">
              <p><strong>오류:</strong> {supabaseError}</p>
            </div>
          ) : supabaseUser ? (
            <div className="space-y-2">
              <p><strong>ID:</strong> {supabaseUser.id}</p>
              <p><strong>이메일:</strong> {supabaseUser.email}</p>
              <p><strong>이름:</strong> {supabaseUser.name}</p>
              <p><strong>사용자 타입:</strong> {supabaseUser.userType}</p>
              <p><strong>역할:</strong> <Badge>{supabaseUser.role || '없음'}</Badge></p>
              <p><strong>가입일:</strong> {new Date(supabaseUser.createdAt).toLocaleString('ko-KR')}</p>
            </div>
          ) : (
            <p className="text-amber-600">Supabase에서 사용자를 찾을 수 없음</p>
          )}
        </CardContent>
      </Card>

      {/* 메모리 저장소 사용자 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>메모리 저장소 사용자 정보</CardTitle>
        </CardHeader>
        <CardContent>
          {memoryError ? (
            <div className="text-red-600">
              <p><strong>오류:</strong> {memoryError}</p>
            </div>
          ) : memoryUser ? (
            <div className="space-y-2">
              <p><strong>ID:</strong> {memoryUser.id}</p>
              <p><strong>이메일:</strong> {memoryUser.email}</p>
              <p><strong>이름:</strong> {memoryUser.name}</p>
              <p><strong>사용자 타입:</strong> {memoryUser.userType}</p>
              <p><strong>역할:</strong> <Badge>{memoryUser.role || '없음'}</Badge></p>
              <p><strong>가입일:</strong> {new Date(memoryUser.createdAt).toLocaleString('ko-KR')}</p>
            </div>
          ) : (
            <p className="text-amber-600">메모리 저장소에서 사용자를 찾을 수 없음</p>
          )}
        </CardContent>
      </Card>

      {/* 관리자 권한 체크 */}
      <Card>
        <CardHeader>
          <CardTitle>관리자 권한 체크</CardTitle>
        </CardHeader>
        <CardContent>
          {session?.user?.email ? (
            <div className="space-y-2">
              <p><strong>현재 이메일:</strong> {session.user.email}</p>
              <p><strong>Supabase 역할:</strong> 
                <Badge variant={supabaseUser?.role === 'SUPER_ADMIN' ? 'destructive' : 'secondary'}>
                  {supabaseUser?.role || '없음'}
                </Badge>
              </p>
              <p><strong>메모리 역할:</strong> 
                <Badge variant={memoryUser?.role === 'SUPER_ADMIN' ? 'destructive' : 'secondary'}>
                  {memoryUser?.role || '없음'}
                </Badge>
              </p>
              <p><strong>관리자 접근 가능:</strong> 
                <Badge variant={
                  (supabaseUser?.role === 'ADMIN' || supabaseUser?.role === 'SUPER_ADMIN') ||
                  (memoryUser?.role === 'ADMIN' || memoryUser?.role === 'SUPER_ADMIN') 
                    ? 'default' : 'destructive'
                }>
                  {(supabaseUser?.role === 'ADMIN' || supabaseUser?.role === 'SUPER_ADMIN') ||
                   (memoryUser?.role === 'ADMIN' || memoryUser?.role === 'SUPER_ADMIN') 
                     ? '가능' : '불가능'}
                </Badge>
              </p>
            </div>
          ) : (
            <p className="text-red-600">로그인되지 않음</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
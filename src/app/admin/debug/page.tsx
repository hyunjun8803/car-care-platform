import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { userStorage } from '@/lib/storage';
import { supabaseUserStorage } from '@/lib/supabase-storage';

export default async function AdminDebugPage() {
  const session = await getServerSession(authOptions);
  
  // 모든 사용자 조회
  let memoryUsers, supabaseUsers;
  
  try {
    memoryUsers = await userStorage.getAll();
  } catch (error) {
    memoryUsers = [];
  }
  
  try {
    supabaseUsers = await supabaseUserStorage.getAll();
  } catch (error) {
    supabaseUsers = [];
  }

  // hyunjun2@naver.com 사용자 조회
  let memoryAdmin, supabaseAdmin;
  
  try {
    memoryAdmin = await userStorage.findByEmail('hyunjun2@naver.com');
  } catch (error) {
    memoryAdmin = null;
  }
  
  try {
    supabaseAdmin = await supabaseUserStorage.findByEmail('hyunjun2@naver.com');
  } catch (error) {
    supabaseAdmin = null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">관리자 시스템 디버그</h1>
        
        {/* 현재 세션 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">현재 세션</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        {/* 메모리 저장소 상태 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">메모리 저장소</h2>
          <p className="mb-2">총 사용자 수: {memoryUsers.length}</p>
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">hyunjun2@naver.com 계정:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(memoryAdmin, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">모든 사용자:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto max-h-64">
              {JSON.stringify(memoryUsers, null, 2)}
            </pre>
          </div>
        </div>

        {/* Supabase 저장소 상태 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Supabase 저장소</h2>
          <p className="mb-2">총 사용자 수: {supabaseUsers.length}</p>
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">hyunjun2@naver.com 계정:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(supabaseAdmin, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">모든 사용자:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto max-h-64">
              {JSON.stringify(supabaseUsers, null, 2)}
            </pre>
          </div>
        </div>

        {/* 환경변수 상태 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">환경변수 상태</h2>
          <ul className="space-y-2">
            <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '미설정'}</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '미설정'}</li>
            <li>NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? '설정됨' : '미설정'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, User, CheckCircle } from 'lucide-react';

export default function FixAccessPage() {
  const upgradeUser = async (email: string, role: string) => {
    try {
      const response = await fetch('/api/admin/upgrade-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`성공: ${result.message}`);
        window.location.reload();
      } else {
        alert(`오류: ${result.error}`);
      }
    } catch (error) {
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  const fixSupabaseRole = async (email: string) => {
    try {
      const response = await fetch('/api/admin/fix-supabase-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`성공: ${result.message}`);
        window.location.reload();
      } else {
        alert(`오류: ${result.error}\n상세: ${result.details || ''}`);
      }
    } catch (error) {
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  const updateSupabaseTable = async () => {
    try {
      const response = await fetch('/api/admin/update-supabase-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`성공: ${result.message}\n결과: ${JSON.stringify(result.results, null, 2)}`);
      } else {
        alert(`오류: ${result.error}\n상세: ${result.details || ''}`);
      }
    } catch (error) {
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>관리자 권한 수정</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>
                이 페이지는 관리자 권한 문제를 해결하기 위한 임시 페이지입니다.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                <h3 className="font-semibold mb-2 text-purple-800">🔨 Supabase 테이블 업데이트 (먼저 실행)</h3>
                <p className="text-sm text-purple-700 mb-3">
                  Supabase 테이블에 role과 shopInfo 컬럼을 추가합니다. 정비소 가입이 안 될 때 먼저 시도하세요.
                </p>
                <Button 
                  onClick={updateSupabaseTable}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Supabase 테이블 업데이트
                </Button>
              </div>

              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h3 className="font-semibold mb-2 text-red-800">🔧 Supabase 역할 수정</h3>
                <p className="text-sm text-red-700 mb-3">
                  Supabase의 사용자 역할이 비어있어 관리자 접속이 안됩니다. 이 버튼을 클릭하세요.
                </p>
                <Button 
                  onClick={() => fixSupabaseRole('hyunjun2@naver.com')}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Supabase 역할 수정하기
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">hyunjun2@naver.com을 최고관리자로 업그레이드</h3>
                <p className="text-sm text-gray-600 mb-3">
                  현재 계정을 SUPER_ADMIN 권한으로 업그레이드합니다. (메모리 저장소용)
                </p>
                <Button 
                  onClick={() => upgradeUser('hyunjun2@naver.com', 'SUPER_ADMIN')}
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  최고관리자 권한 부여 (메모리)
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">문제 해결 단계</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>먼저 <a href="/debug/user" className="text-blue-600 underline">사용자 디버그 페이지</a>에서 현재 상태 확인</li>
                  <li><strong className="text-purple-600">🔨 Supabase 테이블 업데이트</strong> 버튼 클릭 (정비소 가입 문제 해결)</li>
                  <li><strong className="text-red-600">🔧 Supabase 역할 수정하기</strong> 버튼 클릭 (관리자 접속 문제 해결)</li>
                  <li>필요시 메모리 저장소 권한도 업그레이드</li>
                  <li><a href="/admin" className="text-blue-600 underline">관리자 대시보드</a>로 접속 시도</li>
                  <li><a href="/debug/all-users" className="text-blue-600 underline">전체 사용자 디버그</a>에서 정비소 가입 데이터 확인</li>
                  <li>문제가 지속되면 다시 로그인 시도</li>
                </ol>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">추가 정보</h3>
                <p className="text-sm text-gray-600">
                  현재 시스템은 Supabase와 메모리 저장소 두 곳을 모두 확인합니다. 
                  권한 업그레이드는 두 곳 모두에 적용됩니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
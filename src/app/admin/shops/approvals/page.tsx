'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowLeft,
  Download
} from 'lucide-react';

interface PendingShop {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userType: string;
  createdAt: string;
  shopInfo?: {
    shopName: string;
    businessNumber: string;
    address: string;
    description?: string;
    businessLicenseUrl?: string;
    status: string;
  };
}

export default function ShopApprovalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pendingShops, setPendingShops] = useState<PendingShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=/admin/shops/approvals');
      return;
    }

    fetchPendingShops();
  }, [session, status, router]);

  const fetchPendingShops = async () => {
    try {
      const response = await fetch('/api/admin/pending-shops');
      if (response.ok) {
        const data = await response.json();
        setPendingShops(data.shops || []);
      } else {
        console.error('Failed to fetch pending shops');
      }
    } catch (error) {
      console.error('Error fetching pending shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (shopId: string, action: 'approve' | 'reject') => {
    setProcessing(shopId);
    
    try {
      const response = await fetch('/api/admin/shop-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shopId, action }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(result.message);
        // 목록에서 해당 정비소 제거
        setPendingShops(prev => prev.filter(shop => shop.id !== shopId));
        
        // 승인/거부 완료 후 약간의 지연 후 전체 페이지 새로고침으로 최신 데이터 반영
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        alert(`오류: ${result.error}`);
      }
    } catch (error) {
      alert('네트워크 오류가 발생했습니다.');
      console.error('Approval error:', error);
    } finally {
      setProcessing(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900">정비소 승인 관리</h1>
                <p className="text-gray-600">가입 신청한 정비소를 승인하거나 거부합니다</p>
              </div>
            </div>
            <Badge variant="secondary">
              {pendingShops.length}개 승인 대기
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {pendingShops.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                승인 대기 중인 정비소가 없습니다
              </h3>
              <p className="text-gray-500">
                새로운 정비소 가입 신청이 들어오면 여기에 표시됩니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pendingShops.map((shop) => (
              <Card key={shop.id} className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-amber-100 p-2 rounded-lg">
                        <Building2 className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          {shop.shopInfo?.shopName || '정비소명 없음'}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-4 mt-1">
                          <span className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {shop.email}
                          </span>
                          <span className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {shop.phone || '전화번호 없음'}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      <Clock className="h-4 w-4 mr-1" />
                      승인 대기
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 기본 정보 */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">기본 정보</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start">
                          <span className="font-medium text-gray-600 w-20">대표자:</span>
                          <span>{shop.name}</span>
                        </div>
                        <div className="flex items-start">
                          <span className="font-medium text-gray-600 w-20">사업자번호:</span>
                          <span className="font-mono">
                            {shop.shopInfo?.businessNumber || '정보 없음'}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-1" />
                          <div>
                            <span className="font-medium text-gray-600 mr-2">주소:</span>
                            <span>{shop.shopInfo?.address || '주소 없음'}</span>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <span className="font-medium text-gray-600 w-20">신청일:</span>
                          <span>
                            {new Date(shop.createdAt).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 정비소 소개 */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">정비소 소개</h4>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                        {shop.shopInfo?.description || '소개글이 없습니다.'}
                      </div>
                      
                      {/* 사업자등록증 */}
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">사업자등록증</h5>
                        {shop.shopInfo?.businessLicenseUrl ? (
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-600">
                              {shop.shopInfo.businessLicenseUrl}
                            </span>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              다운로드
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">파일이 없습니다.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 승인/거부 버튼 */}
                  <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t">
                    <Button 
                      variant="outline" 
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleApproval(shop.id, 'reject')}
                      disabled={processing === shop.id}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {processing === shop.id ? '처리 중...' : '거부'}
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApproval(shop.id, 'approve')}
                      disabled={processing === shop.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {processing === shop.id ? '처리 중...' : '승인'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 승인/거부 통계 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">0</div>
              <p className="text-sm text-gray-600">승인 완료</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">0</div>
              <p className="text-sm text-gray-600">승인 거부</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
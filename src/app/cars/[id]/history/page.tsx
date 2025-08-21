'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Car,
  ArrowLeft,
  Search,
  Calendar,
  DollarSign,
  MapPin,
  Wrench,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Gauge,
  FileText,
  History
} from 'lucide-react';

interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  totalCost: number;
  maintenanceCount: number;
}

interface MaintenanceRecord {
  id: string;
  carId: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  mileage: number;
  shopName: string;
  shopAddress?: string;
  parts?: string;
  notes?: string;
  createdAt: string;
}

interface Pagination {
  current: number;
  limit: number;
  total: number;
  pages: number;
}

export default function CarHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const carId = params.id as string;

  const [car, setCar] = useState<Car | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

  // 인증 확인
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // 차량 정보 조회
  const fetchCarInfo = async () => {
    try {
      const response = await fetch(`/api/cars/${carId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '차량 정보를 불러오는데 실패했습니다.');
      }

      setCar(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '차량 정보 조회 중 오류가 발생했습니다.');
    }
  };

  // 정비 기록 조회
  const fetchMaintenanceRecords = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        carId: carId,
        page: page.toString(),
        limit: '10'
      });

      if (search.trim()) {
        params.set('search', search.trim());
      }

      const response = await fetch(`/api/maintenance?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '정비 기록을 불러오는데 실패했습니다.');
      }

      setMaintenanceRecords(data.data);
      setPagination(data.pagination);

    } catch (err) {
      setError(err instanceof Error ? err.message : '정비 기록 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && carId) {
      fetchCarInfo();
      fetchMaintenanceRecords(currentPage, searchTerm);
    }
  }, [status, carId, currentPage, searchTerm]);

  // 검색 핸들러
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 정비 기록 삭제 핸들러
  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('정말로 이 정비 기록을 삭제하시겠습니까?\n삭제된 기록은 복구할 수 없습니다.')) {
      return;
    }

    try {
      setDeletingRecordId(recordId);
      setError(null);

      const response = await fetch(`/api/maintenance/${recordId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '정비 기록 삭제에 실패했습니다.');
      }

      // 성공 시 목록에서 제거
      setMaintenanceRecords(prev => prev.filter(record => record.id !== recordId));
      
      // 차량 정보 새로고침
      fetchCarInfo();
      
      // 페이지네이션 정보 업데이트를 위해 목록 새로고침
      if (maintenanceRecords.length === 1 && currentPage > 1) {
        // 마지막 페이지의 마지막 항목을 삭제하는 경우 이전 페이지로 이동
        setCurrentPage(currentPage - 1);
      } else {
        fetchMaintenanceRecords(currentPage, searchTerm);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '정비 기록 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingRecordId(null);
    }
  };

  // 정비 비용 형식화
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 로딩 상태
  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (error && !car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              돌아가기
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <History className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  정비 기록
                </h1>
                {car && (
                  <p className="text-gray-600">
                    {car.name} ({car.brand} {car.model})
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => router.push(`/maintenance/new?carId=${carId}`)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            정비 기록 추가
          </Button>
        </div>

        {/* 차량 요약 정보 */}
        {car && (
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Car className="h-5 w-5 text-blue-600" />
                <span>차량 정보</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  <Wrench className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">총 정비 횟수</p>
                  <p className="font-bold text-gray-900">{car.maintenanceCount}회</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">총 정비 비용</p>
                  <p className="font-bold text-gray-900">{formatCurrency(car.totalCost)}원</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
                  <Car className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">차량번호</p>
                  <p className="font-bold text-gray-900">{car.licensePlate}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">연식</p>
                  <p className="font-bold text-gray-900">{car.year}년</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 검색 */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-blue-600" />
              <span>정비 기록 검색</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="정비 내용, 종류, 정비소명으로 검색..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* 오류 메시지 */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        {/* 정비 기록 목록 */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>정비 기록 목록</span>
              </CardTitle>
              {pagination && (
                <Badge variant="outline">
                  총 {pagination.total}건
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">로딩 중...</p>
              </div>
            ) : maintenanceRecords.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? '검색 결과가 없습니다' : '정비 기록이 없습니다'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? '다른 검색어로 시도해보세요.' 
                    : '첫 번째 정비 기록을 추가해보세요.'
                  }
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => router.push(`/maintenance/new?carId=${carId}`)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    정비 기록 추가
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {maintenanceRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge 
                            variant="outline"
                            className="bg-blue-100 text-blue-800 border-blue-300"
                          >
                            {record.type}
                          </Badge>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(record.date).toLocaleDateString('ko-KR')}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Gauge className="h-3 w-3 mr-1" />
                            {record.mileage.toLocaleString()}km
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-2">{record.description}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <div>
                              <p className="font-medium">{record.shopName}</p>
                              {record.shopAddress && (
                                <p className="text-xs text-gray-500">{record.shopAddress}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            <span className="font-medium text-green-600">
                              {formatCurrency(record.cost)}원
                            </span>
                          </div>
                        </div>
                        {record.parts && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-500">교체 부품: </span>
                            <span className="text-sm text-gray-700">{record.parts}</span>
                          </div>
                        )}
                        {record.notes && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-500">메모: </span>
                            <span className="text-sm text-gray-700">{record.notes}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/maintenance/${record.id}/edit`)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          disabled={deletingRecordId === record.id}
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          {deletingRecordId === record.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 페이지네이션 */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  이전
                </Button>
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={page === currentPage ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.pages}
                >
                  다음
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
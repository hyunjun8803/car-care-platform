'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Car,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Send,
  Calendar,
  DollarSign,
  MapPin,
  Wrench,
  Gauge,
  FileText,
  Building2
} from 'lucide-react';

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

interface MaintenanceFormData {
  carId: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  mileage: number;
  shopName: string;
  shopAddress: string;
  parts: string;
  notes: string;
}

export default function EditMaintenancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const maintenanceId = params.id as string;

  const [maintenance, setMaintenance] = useState<MaintenanceRecord | null>(null);
  const [formData, setFormData] = useState<MaintenanceFormData>({
    carId: '',
    date: '',
    type: '',
    description: '',
    cost: 0,
    mileage: 0,
    shopName: '',
    shopAddress: '',
    parts: '',
    notes: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 인증 확인
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // 정비 기록 정보 조회
  const fetchMaintenanceRecord = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/maintenance/${maintenanceId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '정비 기록을 불러오는데 실패했습니다.');
      }

      const record = data.data;
      setMaintenance(record);
      setFormData({
        carId: record.carId || '',
        date: record.date || '',
        type: record.type || '',
        description: record.description || '',
        cost: record.cost || 0,
        mileage: record.mileage || 0,
        shopName: record.shopName || '',
        shopAddress: record.shopAddress || '',
        parts: record.parts || '',
        notes: record.notes || ''
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : '정비 기록 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && maintenanceId) {
      fetchMaintenanceRecord();
    }
  }, [status, maintenanceId]);

  const handleInputChange = (field: keyof MaintenanceFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.date) return '정비 날짜를 입력해주세요.';
    if (!formData.type.trim()) return '정비 종류를 선택해주세요.';
    if (!formData.description.trim()) return '정비 내용을 입력해주세요.';
    if (formData.cost < 0) return '정비 비용은 0 이상이어야 합니다.';
    if (formData.mileage < 0) return '주행거리는 0 이상이어야 합니다.';
    if (!formData.shopName.trim()) return '정비소명을 입력해주세요.';

    // 날짜 검증 (미래 날짜 불가)
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // 오늘 끝까지 허용
    if (selectedDate > today) {
      return '정비 날짜는 미래일 수 없습니다.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(`/api/maintenance/${maintenanceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          cost: Number(formData.cost),
          mileage: Number(formData.mileage),
          shopAddress: formData.shopAddress || undefined,
          parts: formData.parts || undefined,
          notes: formData.notes || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '정비 기록 수정에 실패했습니다.');
      }

      setSuccess(true);
      
      // 3초 후 차량 정비 기록 페이지로 이동
      setTimeout(() => {
        router.push(`/cars/${formData.carId}/history`);
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : '정비 기록 수정 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 로딩 상태
  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-8">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm w-full max-w-md">
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              정비 기록 수정 완료!
            </h3>
            <p className="text-gray-600 mb-6">
              정비 기록이 성공적으로 수정되었습니다.
            </p>
            <Button 
              onClick={() => router.push(`/cars/${formData.carId}/history`)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              정비 기록 보기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !maintenance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
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
      <div className="container mx-auto px-4 max-w-2xl">
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
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                정비 기록 수정
              </h1>
              <p className="text-gray-600">
                정비 기록 정보를 수정하세요
              </p>
            </div>
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        {/* 정비 기록 수정 폼 */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              <span>정비 기록 수정</span>
            </CardTitle>
            <CardDescription>
              수정하실 정비 기록 정보를 입력해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 정비 날짜 */}
                <div>
                  <Label htmlFor="date" className="text-base font-medium">
                    정비 날짜 *
                  </Label>
                  <div className="relative mt-2">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* 정비 종류 */}
                <div>
                  <Label htmlFor="type" className="text-base font-medium">
                    정비 종류 *
                  </Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="정비 종류를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="정기점검">정기점검</SelectItem>
                      <SelectItem value="엔진오일 교환">엔진오일 교환</SelectItem>
                      <SelectItem value="타이어 교체">타이어 교체</SelectItem>
                      <SelectItem value="브레이크 패드 교체">브레이크 패드 교체</SelectItem>
                      <SelectItem value="배터리 교체">배터리 교체</SelectItem>
                      <SelectItem value="에어컨 점검">에어컨 점검</SelectItem>
                      <SelectItem value="수리">수리</SelectItem>
                      <SelectItem value="기타">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 정비 비용 */}
                <div>
                  <Label htmlFor="cost" className="text-base font-medium">
                    정비 비용 (원) *
                  </Label>
                  <div className="relative mt-2">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="cost"
                      type="number"
                      min="0"
                      placeholder="예: 50000"
                      value={formData.cost}
                      onChange={(e) => handleInputChange('cost', parseInt(e.target.value) || 0)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* 주행거리 */}
                <div>
                  <Label htmlFor="mileage" className="text-base font-medium">
                    주행거리 (km) *
                  </Label>
                  <div className="relative mt-2">
                    <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="mileage"
                      type="number"
                      min="0"
                      placeholder="예: 30000"
                      value={formData.mileage}
                      onChange={(e) => handleInputChange('mileage', parseInt(e.target.value) || 0)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 정비 내용 */}
              <div>
                <Label htmlFor="description" className="text-base font-medium">
                  정비 내용 *
                </Label>
                <Textarea
                  id="description"
                  placeholder="정비받은 내용을 상세히 입력해주세요..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="mt-2"
                  rows={3}
                  required
                />
              </div>

              {/* 정비소 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="shopName" className="text-base font-medium">
                    정비소명 *
                  </Label>
                  <div className="relative mt-2">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="shopName"
                      type="text"
                      placeholder="예: ABC정비소"
                      value={formData.shopName}
                      onChange={(e) => handleInputChange('shopName', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="shopAddress" className="text-base font-medium">
                    정비소 주소
                  </Label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="shopAddress"
                      type="text"
                      placeholder="정비소 주소 (선택사항)"
                      value={formData.shopAddress}
                      onChange={(e) => handleInputChange('shopAddress', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* 교체 부품 */}
              <div>
                <Label htmlFor="parts" className="text-base font-medium">
                  교체 부품
                </Label>
                <Input
                  id="parts"
                  type="text"
                  placeholder="교체한 부품이 있다면 입력하세요 (선택사항)"
                  value={formData.parts}
                  onChange={(e) => handleInputChange('parts', e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* 메모 */}
              <div>
                <Label htmlFor="notes" className="text-base font-medium">
                  추가 메모
                </Label>
                <Textarea
                  id="notes"
                  placeholder="기타 특이사항이나 메모사항을 입력하세요 (선택사항)"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>

              {/* 제출 버튼 */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                >
                  {submitting ? (
                    <>수정 중...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      정비 기록 수정
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
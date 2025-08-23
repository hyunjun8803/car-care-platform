"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { 
  ArrowLeft, Camera, Save, Receipt, Fuel, Wrench, Car,
  MapPin, CreditCard, Calendar, Clock
} from "lucide-react";

interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  licensePlate: string;
}

export default function AddExpensePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 폼 데이터
  const [formData, setFormData] = useState({
    carId: '',
    category: '',
    subcategory: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    mileage: '',
    paymentMethod: 'CARD',
    notes: '',
    receiptImage: null as File | null
  });

  // OCR 상태
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // 차량 목록 조회
  const fetchCars = async () => {
    try {
      const response = await fetch('/api/cars');
      const data = await response.json();
      if (data.success) {
        setCars(data.data);
        if (data.data.length > 0) {
          setFormData(prev => ({ ...prev, carId: data.data[0].id }));
        }
      }
    } catch (error) {
      console.error('차량 조회 오류:', error);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCars();
    }
  }, [status]);

  // 입력값 변경 핸들러
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 이미지 업로드 및 OCR 처리
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFormData(prev => ({ ...prev, receiptImage: file }));
    
    // OCR 처리 시작
    setOcrLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/ocr/receipt', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setOcrResult(data.data);
        
        // OCR 결과로 폼 자동 채우기
        setFormData(prev => ({
          ...prev,
          category: data.data.category || prev.category,
          subcategory: data.data.subcategory || prev.subcategory,
          amount: data.data.amount ? data.data.amount.toString() : prev.amount,
          description: data.data.description || prev.description,
          date: data.data.date || prev.date,
          location: data.data.location || prev.location,
          paymentMethod: data.data.paymentMethod || prev.paymentMethod
        }));

        setSuccess('영수증 정보를 자동으로 인식했습니다! 필요시 수정해주세요.');
      } else {
        setError('영수증 인식에 실패했습니다. 수동으로 입력해주세요.');
      }
    } catch (error) {
      setError('영수증 처리 중 오류가 발생했습니다.');
    } finally {
      setOcrLoading(false);
    }
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 필수 필드 검증
      if (!formData.carId || !formData.category || !formData.amount || !formData.description) {
        throw new Error('필수 필드를 모두 입력해주세요.');
      }

      // 지출 기록 추가
      const expenseData = {
        carId: formData.carId,
        category: formData.category,
        subcategory: formData.subcategory || null,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        location: formData.location || null,
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || null
      };

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || '지출 기록 추가에 실패했습니다.');
      }

      setSuccess('지출 기록이 성공적으로 추가되었습니다.');
      
      // 2초 후 목록 페이지로 이동
      setTimeout(() => {
        router.push('/expenses');
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 카테고리별 서브카테고리 옵션
  const getSubcategoryOptions = (category: string) => {
    const subcategories: { [key: string]: string[] } = {
      'FUEL': ['휘발유', '경유', '하이브리드', 'LPG', '전기'],
      'MAINTENANCE': ['엔진오일', '브레이크', '타이어', '필터', '배터리', '에어컨', '기타'],
      'INSURANCE': ['자동차보험', '운전자보험', '정비보험'],
      'TAX': ['자동차세', '등록세', '검사비', '번호판'],
      'PARKING': ['공영주차장', '민영주차장', '아파트', '쇼핑몰'],
      'TOLL': ['고속도로', '시내도로', '교량'],
      'CARWASH': ['셀프세차', '기계세차', '손세차'],
      'ACCESSORIES': ['인테리어', '익스테리어', '전자기기', '타이어/휠']
    };
    return subcategories[category] || [];
  };

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          
          {/* 헤더 */}
          <div className="flex items-center space-x-4 mb-8">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>뒤로</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                지출 추가
              </h1>
              <p className="text-gray-600 mt-1">새로운 차량 관련 지출을 기록하세요</p>
            </div>
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Receipt className="h-5 w-5 text-blue-600" />
                  <span>기본 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 차량 선택 */}
                <div>
                  <Label htmlFor="carId">차량 *</Label>
                  <Select value={formData.carId} onValueChange={(value) => handleInputChange('carId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="차량을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {cars.filter(car => car && car.brand && car.model).map((car) => (
                        <SelectItem key={car.id} value={car.id}>
                          {car.brand} {car.model} ({car.licensePlate})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 카테고리 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">카테고리 *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FUEL">연료</SelectItem>
                        <SelectItem value="MAINTENANCE">정비/수리</SelectItem>
                        <SelectItem value="INSURANCE">보험</SelectItem>
                        <SelectItem value="TAX">세금/등록비</SelectItem>
                        <SelectItem value="PARKING">주차비</SelectItem>
                        <SelectItem value="TOLL">통행료</SelectItem>
                        <SelectItem value="CARWASH">세차</SelectItem>
                        <SelectItem value="ACCESSORIES">용품/액세서리</SelectItem>
                        <SelectItem value="RENTAL">렌트/리스</SelectItem>
                        <SelectItem value="OTHER">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subcategory">세부 카테고리</Label>
                    <Select 
                      value={formData.subcategory} 
                      onValueChange={(value) => handleInputChange('subcategory', value)}
                      disabled={!formData.category}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="세부 카테고리" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">선택 안함</SelectItem>
                        {getSubcategoryOptions(formData.category).map((sub) => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 금액과 설명 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">금액 *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="date">날짜 *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">설명 *</Label>
                  <Input
                    id="description"
                    placeholder="지출 내용을 입력하세요"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span>추가 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 장소와 주행거리 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">장소</Label>
                    <Input
                      id="location"
                      placeholder="주유소, 정비소 등"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="mileage">주행거리 (km)</Label>
                    <Input
                      id="mileage"
                      type="number"
                      placeholder="0"
                      value={formData.mileage}
                      onChange={(e) => handleInputChange('mileage', e.target.value)}
                    />
                  </div>
                </div>

                {/* 결제 방법 */}
                <div>
                  <Label htmlFor="paymentMethod">결제 방법</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">현금</SelectItem>
                      <SelectItem value="CARD">카드</SelectItem>
                      <SelectItem value="BANK_TRANSFER">계좌이체</SelectItem>
                      <SelectItem value="MOBILE_PAY">모바일페이</SelectItem>
                      <SelectItem value="OTHER">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 메모 */}
                <div>
                  <Label htmlFor="notes">메모</Label>
                  <Textarea
                    id="notes"
                    placeholder="추가 메모사항을 입력하세요"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 영수증 업로드 */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5 text-blue-600" />
                  <span>영수증 업로드</span>
                </CardTitle>
                <CardDescription>
                  영수증 사진을 업로드하면 자동으로 정보를 인식합니다 (준비중)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  {ocrLoading ? (
                    <div className="space-y-4">
                      <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-blue-600 font-medium">영수증 인식 중...</p>
                      <p className="text-sm text-gray-600">잠시만 기다려주세요</p>
                    </div>
                  ) : (
                    <>
                      <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-4">영수증 사진을 업로드하면 자동으로 정보를 인식합니다</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="receipt-upload"
                        disabled={ocrLoading}
                      />
                      <label htmlFor="receipt-upload">
                        <Button type="button" variant="outline" className="cursor-pointer" disabled={ocrLoading}>
                          <Camera className="h-4 w-4 mr-2" />
                          영수증 촬영/선택
                        </Button>
                      </label>
                      {formData.receiptImage && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm text-green-600">
                            📸 {formData.receiptImage.name}
                          </p>
                          {ocrResult && (
                            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                              <p className="text-green-800 font-medium mb-1">
                                ✅ 인식 완료! (신뢰도: {Math.round(ocrResult.confidence * 100)}%)
                              </p>
                              <p className="text-green-700">
                                아래 정보가 자동으로 입력되었습니다. 확인 후 필요시 수정해주세요.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* OCR 결과 표시 */}
                {ocrResult && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                      <Receipt className="h-4 w-4 mr-2" />
                      인식된 영수증 정보
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {ocrResult.amount && (
                        <div>
                          <span className="text-blue-700 font-medium">금액:</span>
                          <span className="ml-2 text-blue-900">₩{ocrResult.amount.toLocaleString()}</span>
                        </div>
                      )}
                      {ocrResult.date && (
                        <div>
                          <span className="text-blue-700 font-medium">날짜:</span>
                          <span className="ml-2 text-blue-900">{ocrResult.date}</span>
                        </div>
                      )}
                      {ocrResult.location && (
                        <div>
                          <span className="text-blue-700 font-medium">장소:</span>
                          <span className="ml-2 text-blue-900">{ocrResult.location}</span>
                        </div>
                      )}
                      {ocrResult.category && (
                        <div>
                          <span className="text-blue-700 font-medium">카테고리:</span>
                          <span className="ml-2 text-blue-900">{ocrResult.category}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 제출 버튼 */}
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                disabled={loading}
              >
                취소
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>저장 중...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>저장</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
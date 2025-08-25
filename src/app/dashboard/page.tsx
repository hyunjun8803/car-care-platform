"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { 
  Car, Calendar, MapPin, Plus, TrendingUp, AlertCircle, Clock, Wrench, History,
  Fuel, Gauge, Bell, CreditCard, Camera, Navigation, DropletIcon as Oil,
  Disc3 as Brake, Zap, Thermometer, Shield, Settings2, Eye, BookOpen,
  DollarSign, PieChart, Receipt, Scan, Target, FileText, ParkingCircle,
  Route, Waves, Package, Key
} from "lucide-react";

// 새로운 대시보드 데이터 구조
interface DashboardOverview {
  totalCars: number;
  thisMonthMaintenanceCost: number;
  upcomingBookings: number;
  maintenanceAlerts: number;
}

interface CarDetails {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  mileage: number;
  lastMileageUpdate: string;
  image?: string;
  
  // 정비 예측 데이터
  maintenancePredictions: {
    engineOil: {
      status: 'good' | 'warning' | 'urgent';
      remainingKm: number;
      recommendedInterval: number;
      lastChangedKm: number;
      daysUntilDue: number;
    };
    brakeFluid: {
      status: 'good' | 'warning' | 'urgent';
      remainingPercent: number;
      lastReplacedKm: number;
      lastReplacedDate: string;
    };
    brakePads: {
      status: 'good' | 'warning' | 'urgent';
      remainingPercent: number;
      lastReplacedKm: number;
    };
    tires: {
      status: 'good' | 'warning' | 'urgent';
      remainingPercent: number;
      lastReplacedKm: number;
    };
  };
  
  // 최근 정비 이력
  recentMaintenance: Array<{
    id: string;
    date: string;
    type: string;
    cost: number;
    description: string;
  }>;
}

interface UpcomingBooking {
  id: string;
  date: string;
  time: string;
  shopName: string;
  services: string[];
  status: 'pending' | 'confirmed' | 'in_progress';
  carName: string;
  estimatedCost?: number;
}

interface MaintenanceAlert {
  id: string;
  carId: string;
  carName: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  daysOverdue: number;
  kmOverdue?: number;
  recommendedAction: string;
}

interface ExpenseSnapshot {
  thisMonthTotal: number;
  categories: {
    fuel: number;
    maintenance: number;
    insurance: number;
    tax: number;
    parking: number;
    toll: number;
    carWash: number;
    accessories: number;
    rental: number;
    other: number;
  };
  recentExpenses: Array<{
    id: string;
    date: string;
    category: string;
    amount: number;
    description: string;
  }>;
}

interface NewDashboardData {
  overview: DashboardOverview;
  cars: CarDetails[];
  upcomingBookings: UpcomingBooking[];
  maintenanceAlerts: MaintenanceAlert[];
  expenseSnapshot: ExpenseSnapshot;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<NewDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // 새로운 대시보드 데이터 조회
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 병렬로 여러 API 호출
      const [statsResponse, carsResponse, bookingsResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/cars'),
        fetch('/api/bookings?upcoming=true')
      ]);

      const [statsData, carsData, bookingsData] = await Promise.all([
        statsResponse.json(),
        carsResponse.json(),
        bookingsResponse.json()
      ]);

      if (!statsResponse.ok) {
        throw new Error(statsData.error || '대시보드 통계를 불러오는데 실패했습니다.');
      }

      // 실제 데이터를 새로운 구조로 변환
      const transformedData: NewDashboardData = {
        overview: {
          totalCars: statsData.data.overview.totalCars || 0,
          thisMonthMaintenanceCost: statsData.data.overview.thisMonthExpenseTotal || statsData.data.overview.thisMonthMaintenanceCost || 0,
          upcomingBookings: statsData.data.overview.upcomingBookings || 0,
          maintenanceAlerts: statsData.data.overview.maintenanceAlerts || 0,
        },
        
        // 실제 차량 데이터 변환
        cars: carsData.success && carsData.data ? carsData.data.map((car: any) => ({
          id: car.id,
          name: car.name,
          brand: car.brand,
          model: car.model,
          year: car.year,
          licensePlate: car.licensePlate,
          mileage: car.mileage,
          lastMileageUpdate: car.lastMaintenance ? 
            new Date(car.lastMaintenance).toLocaleDateString('ko-KR') : "정보 없음",
          
          // 정비 예측 데이터 (임시 계산 로직)
          maintenancePredictions: {
            engineOil: {
              status: car.mileage % 10000 < 1000 ? 'warning' : 'good',
              remainingKm: 10000 - (car.mileage % 10000),
              recommendedInterval: 10000,
              lastChangedKm: car.mileage - (car.mileage % 10000),
              daysUntilDue: Math.ceil((10000 - (car.mileage % 10000)) / 50)
            },
            brakeFluid: {
              status: car.mileage > 40000 ? 'warning' : 'good',
              remainingPercent: Math.max(20, 100 - Math.floor(car.mileage / 500)),
              lastReplacedKm: car.mileage - 20000,
              lastReplacedDate: "2024-01-01"
            },
            brakePads: {
              status: car.mileage > 50000 ? 'urgent' : car.mileage > 30000 ? 'warning' : 'good',
              remainingPercent: Math.max(10, 100 - Math.floor(car.mileage / 600)),
              lastReplacedKm: car.mileage - 25000
            },
            tires: {
              status: car.mileage > 60000 ? 'warning' : 'good',
              remainingPercent: Math.max(30, 100 - Math.floor(car.mileage / 800)),
              lastReplacedKm: car.mileage - 40000
            }
          },
          
          // 최근 정비 이력 (statsData에서 가져오기)
          recentMaintenance: statsData.data.recentActivity?.maintenanceRecords
            ?.filter((record: any) => record.car.licensePlate === car.licensePlate)
            ?.slice(0, 2)
            ?.map((record: any) => ({
              id: record.id,
              date: record.date,
              type: record.type,
              cost: record.cost,
              description: record.description
            })) || []
        })) : [
          // 데이터가 없을 때 더미 데이터 표시
          {
            id: "sample",
            name: "샘플 차량",
            brand: "현대",
            model: "아반떼",
            year: 2023,
            licensePlate: "샘플123",
            mileage: 0,
            lastMileageUpdate: "정보 없음",
            maintenancePredictions: {
              engineOil: { status: 'good', remainingKm: 10000, recommendedInterval: 10000, lastChangedKm: 0, daysUntilDue: 200 },
              brakeFluid: { status: 'good', remainingPercent: 100, lastReplacedKm: 0, lastReplacedDate: "2024-01-01" },
              brakePads: { status: 'good', remainingPercent: 100, lastReplacedKm: 0 },
              tires: { status: 'good', remainingPercent: 100, lastReplacedKm: 0 }
            },
            recentMaintenance: []
          }
        ],
        
        // 실제 예약 데이터 변환
        upcomingBookings: bookingsData.success && bookingsData.data ? 
          bookingsData.data.map((booking: any) => ({
            id: booking.id,
            date: new Date(booking.bookingDate).toLocaleDateString('ko-KR'),
            time: booking.bookingTime,
            shopName: booking.shop?.businessName || "정비소 정보 없음",
            services: [booking.service?.name || "서비스 정보 없음"],
            status: booking.status.toLowerCase(),
            carName: booking.car?.name || (booking.car?.brand && booking.car?.model ? `${booking.car.brand} ${booking.car.model}` : "차량 정보 없음"),
            estimatedCost: booking.estimatedCost
          })) : [],
        
        // 정비 알림 (실제 데이터 기반으로 생성)
        maintenanceAlerts: statsData.data.overview.maintenanceAlerts > 0 ? [
          {
            id: "alert1",
            carId: "sample",
            carName: "정비 필요 차량",
            type: "정기점검",
            severity: 'medium' as const,
            message: "정기점검 시기가 다가왔습니다",
            daysOverdue: 0,
            recommendedAction: "정비소 예약을 권장합니다"
          }
        ] : [],
        
        // 지출 스냅샷 (실제 차계부 데이터)
        expenseSnapshot: {
          thisMonthTotal: statsData.data.expenseSnapshot?.thisMonthTotal || statsData.data.overview.thisMonthExpenseTotal || 0,
          categories: {
            fuel: statsData.data.expenseSnapshot?.categories?.fuel || 0,
            maintenance: statsData.data.expenseSnapshot?.categories?.maintenance || statsData.data.overview.thisMonthMaintenanceCost || 0,
            insurance: statsData.data.expenseSnapshot?.categories?.insurance || 0,
            tax: statsData.data.expenseSnapshot?.categories?.tax || 0,
            parking: statsData.data.expenseSnapshot?.categories?.parking || 0,
            toll: statsData.data.expenseSnapshot?.categories?.toll || 0,
            carWash: statsData.data.expenseSnapshot?.categories?.carWash || 0,
            accessories: statsData.data.expenseSnapshot?.categories?.accessories || 0,
            rental: statsData.data.expenseSnapshot?.categories?.rental || 0,
            other: statsData.data.expenseSnapshot?.categories?.other || 0
          },
          recentExpenses: statsData.data.expenseSnapshot?.recentExpenses || []
        }
      };

      setDashboardData(transformedData);
      
      // 첫 번째 차량을 기본 선택으로 설정
      if (transformedData.cars.length > 0 && !selectedCarId) {
        setSelectedCarId(transformedData.cars[0].id);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '대시보드 데이터 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status]);

  // 헬퍼 함수들
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getMaintenanceStatusColor = (status: 'good' | 'warning' | 'urgent') => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenanceStatusIcon = (status: 'good' | 'warning' | 'urgent') => {
    switch (status) {
      case 'good': return '✓';
      case 'warning': return '⚠️';
      case 'urgent': return '🚨';
      default: return '○';
    }
  };

  const getAlertSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low': return 'border-l-blue-500 bg-blue-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'high': return 'border-l-red-500 bg-red-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getBrandLogo = (brand: string) => {
    const brandLogos: { [key: string]: string } = {
      '현대': '🏢',
      '기아': '🚗', 
      '삼성': '⭐',
      '쌍용': '🦁',
      'BMW': '🔵',
      '벤츠': '💎',
      '아우디': '🔷',
      '볼보': '🇸🇪',
      '토요타': '🔴',
      '혼다': '🎯'
    };
    return brandLogos[brand] || '🚙';
  };

  // 선택된 차량 데이터 가져오기
  const selectedCar = dashboardData?.cars.find(car => car.id === selectedCarId) || dashboardData?.cars[0];

  // 차량 변경 핸들러
  const handleCarChange = (carId: string) => {
    setSelectedCarId(carId);
  };

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  }

  if (!session || !dashboardData) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          
          {/* 차량 선택 헤더 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                차량 대시보드
              </h1>
              <Link href="/cars/search">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  차량 추가
                </Button>
              </Link>
            </div>
            
            {/* 차량 선택 드롭다운 */}
            {dashboardData && dashboardData.cars.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Car className="h-6 w-6 text-blue-600" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        차량 선택
                      </label>
                      <Select value={selectedCarId} onValueChange={handleCarChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="차량을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {dashboardData.cars.filter(car => car && car.brand && car.model).map((car) => (
                            <SelectItem key={car.id} value={car.id}>
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">{getBrandLogo(car.brand)}</span>
                                <span>{car.brand} {car.model} ({car.licensePlate})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 선택된 차량이 없을 때 */}
          {!selectedCar && (
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Car className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">등록된 차량이 없습니다</h3>
                <p className="text-gray-600 mb-6">첫 번째 차량을 등록하여 스마트 차량 관리를 시작하세요</p>
                <Link href="/cars/brand">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    차량 등록하기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* 선택된 차량 정보 */}
          {selectedCar && (
            <>
              {/* 메인 차량 카드 */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm mb-8">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                        {getBrandLogo(selectedCar.brand)}
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                          {selectedCar.brand} {selectedCar.model}
                        </CardTitle>
                        <CardDescription className="text-lg text-gray-600">
                          {selectedCar.licensePlate} • {selectedCar.year}년
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600">{selectedCar.mileage.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">주행거리 (km)</p>
                      <p className="text-xs text-gray-500">{selectedCar.lastMileageUpdate}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* 통계 요약 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <DollarSign className="h-8 w-8 mx-auto mb-3 text-green-500" />
                    <p className="text-2xl font-bold text-green-600">₩{formatCurrency(dashboardData.overview.thisMonthMaintenanceCost)}</p>
                    <p className="text-sm text-gray-600">이번 달 총 지출</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                    <p className="text-2xl font-bold text-purple-600">{dashboardData.overview.upcomingBookings}</p>
                    <p className="text-sm text-gray-600">예정된 예약</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Bell className="h-8 w-8 mx-auto mb-3 text-orange-500" />
                    <p className="text-2xl font-bold text-orange-600">{dashboardData.overview.maintenanceAlerts}</p>
                    <p className="text-sm text-gray-600">정비 알림</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Wrench className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                    <p className="text-2xl font-bold text-blue-600">{selectedCar.recentMaintenance.length}</p>
                    <p className="text-sm text-gray-600">정비 기록</p>
                  </CardContent>
                </Card>
              </div>

              {/* 정비 예측 상태 */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    <span>정비 예측 상태</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 엔진오일 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Oil className="h-5 w-5 text-amber-500" />
                        <div>
                          <p className="font-medium">엔진오일</p>
                          <p className="text-sm text-gray-600">{selectedCar.maintenancePredictions.engineOil.remainingKm}km 남음</p>
                        </div>
                      </div>
                      <Badge className={`${getMaintenanceStatusColor(selectedCar.maintenancePredictions.engineOil.status)}`}>
                        {getMaintenanceStatusIcon(selectedCar.maintenancePredictions.engineOil.status)} {selectedCar.maintenancePredictions.engineOil.status === 'good' ? '양호' : selectedCar.maintenancePredictions.engineOil.status === 'warning' ? '주의' : '긴급'}
                      </Badge>
                    </div>
                    <Progress 
                      value={Math.max(0, Math.min(100, (selectedCar.maintenancePredictions.engineOil.remainingKm / selectedCar.maintenancePredictions.engineOil.recommendedInterval) * 100))} 
                      className="h-2"
                    />
                  </div>

                  {/* 브레이크패드 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Brake className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium">브레이크패드</p>
                          <p className="text-sm text-gray-600">{selectedCar.maintenancePredictions.brakePads.remainingPercent}% 잔량</p>
                        </div>
                      </div>
                      <Badge className={`${getMaintenanceStatusColor(selectedCar.maintenancePredictions.brakePads.status)}`}>
                        {getMaintenanceStatusIcon(selectedCar.maintenancePredictions.brakePads.status)} {selectedCar.maintenancePredictions.brakePads.status === 'good' ? '양호' : selectedCar.maintenancePredictions.brakePads.status === 'warning' ? '주의' : '긴급'}
                      </Badge>
                    </div>
                    <Progress 
                      value={selectedCar.maintenancePredictions.brakePads.remainingPercent} 
                      className="h-2"
                    />
                  </div>

                  {/* 타이어 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Gauge className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium">타이어</p>
                          <p className="text-sm text-gray-600">{selectedCar.maintenancePredictions.tires.remainingPercent}% 수명</p>
                        </div>
                      </div>
                      <Badge className={`${getMaintenanceStatusColor(selectedCar.maintenancePredictions.tires.status)}`}>
                        {getMaintenanceStatusIcon(selectedCar.maintenancePredictions.tires.status)} {selectedCar.maintenancePredictions.tires.status === 'good' ? '양호' : selectedCar.maintenancePredictions.tires.status === 'warning' ? '주의' : '긴급'}
                      </Badge>
                    </div>
                    <Progress 
                      value={selectedCar.maintenancePredictions.tires.remainingPercent} 
                      className="h-2"
                    />
                  </div>

                  {/* 브레이크 오일 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Settings2 className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">브레이크 오일</p>
                          <p className="text-sm text-gray-600">{selectedCar.maintenancePredictions.brakeFluid.remainingPercent}% 잔량</p>
                        </div>
                      </div>
                      <Badge className={`${getMaintenanceStatusColor(selectedCar.maintenancePredictions.brakeFluid.status)}`}>
                        {getMaintenanceStatusIcon(selectedCar.maintenancePredictions.brakeFluid.status)} {selectedCar.maintenancePredictions.brakeFluid.status === 'good' ? '양호' : selectedCar.maintenancePredictions.brakeFluid.status === 'warning' ? '주의' : '긴급'}
                      </Badge>
                    </div>
                    <Progress 
                      value={selectedCar.maintenancePredictions.brakeFluid.remainingPercent} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 최근 정비 이력과 빠른 액션 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* 최근 정비 이력 */}
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <History className="h-5 w-5 text-blue-600" />
                      <span>최근 정비 이력</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCar.recentMaintenance.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>정비 이력이 없습니다</p>
                        <p className="text-sm">차계부에서 정비 기록을 추가하세요</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedCar.recentMaintenance.map((record) => (
                          <div key={record.id} className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-gray-900">{record.type}</p>
                              <p className="text-sm font-bold text-green-600">₩{formatCurrency(record.cost)}</p>
                            </div>
                            <p className="text-sm text-gray-600">{record.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{record.date}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 빠른 액션 */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>빠른 액션</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Link href="/booking">
                      <Button className="w-full bg-white/20 hover:bg-white/30 border-white/30 text-white">
                        <Calendar className="h-4 w-4 mr-2" />
                        정비 예약하기
                      </Button>
                    </Link>
                    <Link href="/expenses/add">
                      <Button className="w-full bg-white/20 hover:bg-white/30 border-white/30 text-white">
                        <Receipt className="h-4 w-4 mr-2" />
                        차계부 입력
                      </Button>
                    </Link>
                    <Button className="w-full bg-white/20 hover:bg-white/30 border-white/30 text-white">
                      <Gauge className="h-4 w-4 mr-2" />
                      주행거리 업데이트
                    </Button>
                    <Link href="/expenses/add">
                      <Button className="w-full bg-white/20 hover:bg-white/30 border-white/30 text-white">
                        <Scan className="h-4 w-4 mr-2" />
                        영수증 OCR
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              {/* 정비 예약 및 알림 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* 다가오는 예약 */}
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <span>다가오는 예약</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dashboardData.upcomingBookings.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>예정된 예약이 없습니다</p>
                        <Link href="/booking">
                          <Button className="mt-3 bg-blue-600 hover:bg-blue-700">정비 예약하기</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dashboardData.upcomingBookings.map((booking) => (
                          <div key={booking.id} className="border rounded-lg p-4 bg-blue-50">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium">{booking.shopName}</p>
                                <p className="text-sm text-gray-600">{booking.date} {booking.time}</p>
                              </div>
                              <Badge className="bg-blue-100 text-blue-800">
                                {booking.status === 'confirmed' ? '확정' : '대기'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700">{booking.services.join(', ')}</p>
                            <p className="text-xs text-gray-500 mt-1">{booking.carName}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 정비 필요 알림 */}
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="h-5 w-5 text-orange-600" />
                      <span>정비 알림</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData.maintenanceAlerts.map((alert) => (
                        <div key={alert.id} className={`border-l-4 p-4 rounded-r-lg ${getAlertSeverityColor(alert.severity)}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{alert.carName}</p>
                              <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                              <p className="text-xs text-gray-600 mt-2">{alert.recommendedAction}</p>
                            </div>
                            <Badge className={alert.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                              {alert.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 차계부 스냅샷 */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-green-600" />
                    <span>이번 달 차량 지출</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 총 지출 및 카테고리 */}
                    <div>
                      <div className="text-center mb-4">
                        <p className="text-3xl font-bold text-gray-900">₩{formatCurrency(dashboardData.expenseSnapshot.thisMonthTotal)}</p>
                        <p className="text-sm text-gray-600">이번 달 총 지출</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Fuel className="h-4 w-4 text-blue-500" />
                            <span>연료</span>
                          </div>
                          <span className="font-medium">₩{formatCurrency(dashboardData.expenseSnapshot.categories.fuel)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Wrench className="h-4 w-4 text-red-500" />
                            <span>정비/수리</span>
                          </div>
                          <span className="font-medium">₩{formatCurrency(dashboardData.expenseSnapshot.categories.maintenance)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-purple-500" />
                            <span>보험</span>
                          </div>
                          <span className="font-medium">₩{formatCurrency(dashboardData.expenseSnapshot.categories.insurance)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-orange-500" />
                            <span>세금/등록비</span>
                          </div>
                          <span className="font-medium">₩{formatCurrency(dashboardData.expenseSnapshot.categories.tax)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <ParkingCircle className="h-4 w-4 text-indigo-500" />
                            <span>주차비</span>
                          </div>
                          <span className="font-medium">₩{formatCurrency(dashboardData.expenseSnapshot.categories.parking)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Route className="h-4 w-4 text-teal-500" />
                            <span>통행료</span>
                          </div>
                          <span className="font-medium">₩{formatCurrency(dashboardData.expenseSnapshot.categories.toll)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Waves className="h-4 w-4 text-cyan-500" />
                            <span>세차</span>
                          </div>
                          <span className="font-medium">₩{formatCurrency(dashboardData.expenseSnapshot.categories.carWash)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-pink-500" />
                            <span>용품/액세서리</span>
                          </div>
                          <span className="font-medium">₩{formatCurrency(dashboardData.expenseSnapshot.categories.accessories)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Key className="h-4 w-4 text-amber-500" />
                            <span>렌트/리스</span>
                          </div>
                          <span className="font-medium">₩{formatCurrency(dashboardData.expenseSnapshot.categories.rental)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Settings2 className="h-4 w-4 text-gray-500" />
                            <span>기타</span>
                          </div>
                          <span className="font-medium">₩{formatCurrency(dashboardData.expenseSnapshot.categories.other)}</span>
                        </div>
                      </div>
                    </div>

                    {/* 최근 3건 */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">최근 지출</h4>
                      <div className="space-y-2">
                        {dashboardData.expenseSnapshot.recentExpenses.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            <Receipt className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">최근 지출이 없습니다</p>
                          </div>
                        ) : (
                          dashboardData.expenseSnapshot.recentExpenses.map((expense) => (
                            <div key={expense.id} className="flex items-center justify-between text-sm">
                              <div>
                                <p className="font-medium">{expense.description}</p>
                                <p className="text-xs text-gray-500">{expense.date} · {expense.category}</p>
                              </div>
                              <span className="font-medium">₩{formatCurrency(expense.amount)}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
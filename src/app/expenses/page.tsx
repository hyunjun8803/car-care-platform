"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { 
  Plus, Calendar, Filter, TrendingUp, CreditCard, Receipt, 
  Fuel, Wrench, Car, DollarSign, PieChart, BarChart3,
  MapPin, Clock, Search, Download, Edit, Trash2
} from "lucide-react";

// 타입 정의
interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  licensePlate: string;
}

interface Expense {
  id: string;
  category: string;
  subcategory?: string;
  amount: number;
  description: string;
  date: string;
  location?: string;
  mileage?: number;
  paymentMethod: string;
  tags?: string;
  notes?: string;
  car: Car;
  createdAt: string;
}

interface ExpenseStats {
  summary: {
    totalAmount: number;
    averageAmount: number;
    totalTransactions: number;
  };
  categoryStats: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  recentTrend: Array<{
    date: string;
    total: number;
    count: number;
  }>;
}

export default function ExpensesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 필터 상태
  const [selectedCarId, setSelectedCarId] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

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
      }
    } catch (error) {
      console.error('차량 조회 오류:', error);
    }
  };

  // 차계부 데이터 조회
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      if (selectedCarId && selectedCarId !== 'all') params.set('carId', selectedCarId);
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);

      const [expensesResponse, statsResponse] = await Promise.all([
        fetch(`/api/expenses?${params}`),
        fetch(`/api/expenses/stats${selectedCarId && selectedCarId !== 'all' ? `?carId=${selectedCarId}` : ''}`)
      ]);

      const [expensesData, statsData] = await Promise.all([
        expensesResponse.json(),
        statsResponse.json()
      ]);

      if (expensesData.success) {
        setExpenses(expensesData.data.expenses);
      } else {
        setError(expensesData.error);
      }

      if (statsData.success) {
        setStats(statsData.data);
      }

    } catch (error) {
      setError('차계부 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCars();
      fetchExpenses();
    }
  }, [status, selectedCarId, selectedCategory, currentPage]);

  // 카테고리 표시 이름
  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      'FUEL': '연료',
      'MAINTENANCE': '정비/수리', 
      'INSURANCE': '보험',
      'TAX': '세금/등록비',
      'PARKING': '주차비',
      'TOLL': '통행료',
      'CARWASH': '세차',
      'ACCESSORIES': '용품/액세서리',
      'RENTAL': '렌트/리스',
      'OTHER': '기타'
    };
    return categories[category] || category;
  };

  // 카테고리 아이콘
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FUEL': return <Fuel className="h-4 w-4" />;
      case 'MAINTENANCE': return <Wrench className="h-4 w-4" />;
      case 'INSURANCE': return <Car className="h-4 w-4" />;
      case 'PARKING': return <MapPin className="h-4 w-4" />;
      case 'CARWASH': return <Car className="h-4 w-4" />;
      default: return <Receipt className="h-4 w-4" />;
    }
  };

  // 결제 방법 표시
  const getPaymentMethodName = (method: string) => {
    const methods: { [key: string]: string } = {
      'CASH': '현금',
      'CARD': '카드',
      'BANK_TRANSFER': '계좌이체', 
      'MOBILE_PAY': '모바일페이',
      'OTHER': '기타'
    };
    return methods[method] || method;
  };

  // 금액 포맷팅
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                차계부
              </h1>
              <p className="text-gray-600 mt-1">차량 관련 모든 지출을 관리하세요</p>
            </div>
            <Link href="/expenses/add">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                지출 추가
              </Button>
            </Link>
          </div>

          {error && (
            <Alert className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 통계 카드 */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-3 text-green-500" />
                  <p className="text-2xl font-bold text-green-600">₩{formatCurrency(stats.summary.totalAmount)}</p>
                  <p className="text-sm text-gray-600">이번 달 총 지출</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                  <p className="text-2xl font-bold text-blue-600">₩{formatCurrency(stats.summary.averageAmount)}</p>
                  <p className="text-sm text-gray-600">평균 지출</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Receipt className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                  <p className="text-2xl font-bold text-purple-600">{stats.summary.totalTransactions}</p>
                  <p className="text-sm text-gray-600">총 거래 수</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 필터 */}
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <Select value={selectedCarId} onValueChange={setSelectedCarId}>
                    <SelectTrigger>
                      <SelectValue placeholder="모든 차량" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 차량</SelectItem>
                      {cars.map((car) => (
                        <SelectItem key={car.id} value={car.id}>
                          {car.brand} {car.model} ({car.licensePlate})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="모든 카테고리" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 카테고리</SelectItem>
                      <SelectItem value="FUEL">연료</SelectItem>
                      <SelectItem value="MAINTENANCE">정비/수리</SelectItem>
                      <SelectItem value="INSURANCE">보험</SelectItem>
                      <SelectItem value="PARKING">주차비</SelectItem>
                      <SelectItem value="CARWASH">세차</SelectItem>
                      <SelectItem value="OTHER">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>내보내기</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 카테고리별 통계 */}
          {stats && stats.categoryStats.length > 0 && (
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  <span>카테고리별 지출</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.categoryStats.map((category) => (
                    <div key={category.category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getCategoryIcon(category.category)}
                        <div>
                          <p className="font-medium">{getCategoryName(category.category)}</p>
                          <p className="text-sm text-gray-600">{category.count}건</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₩{formatCurrency(category.amount)}</p>
                        <p className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 지출 목록 */}
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-blue-600" />
                <span>지출 내역</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Receipt className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">등록된 지출 내역이 없습니다</p>
                  <p className="text-sm mb-4">첫 번째 지출을 기록해보세요</p>
                  <Link href="/expenses/add">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      지출 추가하기
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getCategoryIcon(expense.category)}
                            <div>
                              <p className="font-medium text-lg">{expense.description}</p>
                              <div className="flex items-center space-x-3 text-sm text-gray-600">
                                <span>{getCategoryName(expense.category)}</span>
                                {expense.subcategory && (
                                  <span>• {expense.subcategory}</span>
                                )}
                                <span>• {expense.car.brand} {expense.car.model}</span>
                                <span>• {formatDate(expense.date)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {expense.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{expense.location}</span>
                              </div>
                            )}
                            {expense.mileage && (
                              <div className="flex items-center space-x-1">
                                <Car className="h-3 w-3" />
                                <span>{expense.mileage.toLocaleString()}km</span>
                              </div>
                            )}
                            <Badge variant="outline">
                              {getPaymentMethodName(expense.paymentMethod)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <p className="text-2xl font-bold text-red-600">₩{formatCurrency(expense.amount)}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {expense.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-600">
                          {expense.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
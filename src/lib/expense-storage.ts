// 차계부 메모리 저장소
interface Expense {
  id: string;
  userId: string;
  carId: string;
  category: string;
  subcategory?: string;
  amount: number;
  description: string;
  date: string;
  location?: string;
  mileage?: number;
  paymentMethod: string;
  receiptImageUrl?: string;
  tags?: string;
  notes?: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

// 런타임 메모리 저장소
let expenseStore: Expense[] = [];

// 샘플 데이터 생성
const initializeSampleExpenses = () => {
  if (expenseStore.length > 0) return;
  
  const sampleExpenses: Expense[] = [
    {
      id: 'expense_1',
      userId: 'user_sample',
      carId: 'car_sample', 
      category: '연료',
      amount: 65000,
      description: '주유 - 셀프 주유소',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: '서울 강남구',
      paymentMethod: 'CARD',
      isRecurring: false,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'expense_2',
      userId: 'user_sample',
      carId: 'car_sample',
      category: '정비',
      subcategory: '엔진오일',
      amount: 45000,
      description: '엔진오일 교환',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      location: '정비소 ABC',
      mileage: 25000,
      paymentMethod: 'CASH',
      isRecurring: false,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'expense_3',
      userId: 'user_sample',
      carId: 'car_sample',
      category: '세차',
      amount: 15000,
      description: '실내외 세차',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      location: '세차장 XYZ',
      paymentMethod: 'CARD',
      isRecurring: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  expenseStore.push(...sampleExpenses);
};

// ID 생성 헬퍼
const generateId = () => `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 차계부 저장소 클래스
export class ExpenseMemoryStorage {
  constructor() {
    initializeSampleExpenses();
  }

  // 모든 지출 조회
  async findAll(): Promise<Expense[]> {
    return [...expenseStore];
  }

  // 사용자별 지출 조회
  async findByUserId(userId: string, options: {
    carId?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ expenses: Expense[]; total: number }> {
    let filtered = expenseStore.filter(expense => expense.userId === userId);

    // 필터링
    if (options.carId) {
      filtered = filtered.filter(expense => expense.carId === options.carId);
    }
    
    if (options.category) {
      filtered = filtered.filter(expense => expense.category === options.category);
    }
    
    if (options.startDate && options.endDate) {
      const start = new Date(options.startDate);
      const end = new Date(options.endDate);
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= start && expenseDate <= end;
      });
    }

    // 정렬 (최신순)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 페이지네이션
    const page = options.page || 1;
    const limit = options.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      expenses: filtered.slice(startIndex, endIndex),
      total: filtered.length
    };
  }

  // ID로 지출 조회
  async findById(id: string): Promise<Expense | null> {
    return expenseStore.find(expense => expense.id === id) || null;
  }

  // 지출 생성
  async create(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    const now = new Date().toISOString();
    const newExpense: Expense = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    
    expenseStore.push(newExpense);
    return newExpense;
  }

  // 지출 수정
  async update(id: string, data: Partial<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Expense | null> {
    const index = expenseStore.findIndex(expense => expense.id === id);
    if (index === -1) return null;

    expenseStore[index] = {
      ...expenseStore[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return expenseStore[index];
  }

  // 지출 삭제
  async delete(id: string): Promise<boolean> {
    const index = expenseStore.findIndex(expense => expense.id === id);
    if (index === -1) return false;

    expenseStore.splice(index, 1);
    return true;
  }

  // 통계 조회
  async getStats(userId: string, options: {
    carId?: string;
    period?: 'month' | 'year';
  } = {}): Promise<any> {
    const { expenses } = await this.findByUserId(userId, options);
    
    // 기간 설정
    const now = new Date();
    let startDate: Date;
    if (options.period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // 기간 내 지출 필터링
    const periodExpenses = expenses.filter(expense => 
      new Date(expense.date) >= startDate
    );

    // 총 지출액
    const totalAmount = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // 카테고리별 통계
    const categoryStats = periodExpenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = { amount: 0, count: 0 };
      }
      acc[expense.category].amount += expense.amount;
      acc[expense.category].count++;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    // 결제 방법별 통계
    const paymentMethodStats = periodExpenses.reduce((acc, expense) => {
      if (!acc[expense.paymentMethod]) {
        acc[expense.paymentMethod] = { amount: 0, count: 0 };
      }
      acc[expense.paymentMethod].amount += expense.amount;
      acc[expense.paymentMethod].count++;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    return {
      period: options.period || 'month',
      summary: {
        totalAmount,
        averageAmount: totalAmount / Math.max(periodExpenses.length, 1),
        totalTransactions: periodExpenses.length
      },
      categoryStats: Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        amount: stats.amount,
        count: stats.count,
        percentage: (stats.amount / totalAmount) * 100
      })),
      paymentMethodStats: Object.entries(paymentMethodStats).map(([method, stats]) => ({
        method,
        amount: stats.amount,
        count: stats.count
      })),
      recentExpenses: expenses.slice(0, 5)
    };
  }
}

// 싱글톤 인스턴스
export const expenseMemoryStorage = new ExpenseMemoryStorage();
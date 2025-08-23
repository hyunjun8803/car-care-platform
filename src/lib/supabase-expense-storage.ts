import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export interface Expense {
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

// ID 생성 헬퍼
const generateId = () => `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Supabase 차계부 저장소 클래스
export class SupabaseExpenseStorage {
  private supabase = supabase;

  // 모든 지출 조회
  async findAll(): Promise<Expense[]> {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await this.supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch expenses: ${error.message}`);
    }

    return data || [];
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
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }

    let query = this.supabase
      .from('expenses')
      .select('*', { count: 'exact' })
      .eq('userId', userId);

    // 필터링
    if (options.carId) {
      query = query.eq('carId', options.carId);
    }
    
    if (options.category) {
      query = query.eq('category', options.category);
    }
    
    if (options.startDate && options.endDate) {
      query = query
        .gte('date', options.startDate)
        .lte('date', options.endDate);
    }

    // 정렬
    query = query.order('date', { ascending: false });

    // 페이지네이션
    const page = options.page || 1;
    const limit = options.limit || 20;
    const startIndex = (page - 1) * limit;
    
    query = query.range(startIndex, startIndex + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch user expenses: ${error.message}`);
    }

    return {
      expenses: data || [],
      total: count || 0
    };
  }

  // ID로 지출 조회
  async findById(id: string): Promise<Expense | null> {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await this.supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw new Error(`Failed to fetch expense: ${error.message}`);
    }

    return data || null;
  }

  // 지출 생성
  async create(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const now = new Date().toISOString();
    const newExpense = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };

    const { data: result, error } = await this.supabase
      .from('expenses')
      .insert([newExpense])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create expense: ${error.message}`);
    }

    return result;
  }

  // 지출 수정
  async update(id: string, data: Partial<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Expense | null> {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { data: result, error } = await this.supabase
      .from('expenses')
      .update({
        ...data,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to update expense: ${error.message}`);
    }

    return result || null;
  }

  // 지출 삭제
  async delete(id: string): Promise<boolean> {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { error } = await this.supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete expense: ${error.message}`);
    }

    return true;
  }

  // 사용자의 지출 총 개수
  async countByUserId(userId: string): Promise<number> {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { count, error } = await this.supabase
      .from('expenses')
      .select('*', { count: 'exact', head: true })
      .eq('userId', userId);

    if (error) {
      throw new Error(`Failed to count expenses: ${error.message}`);
    }

    return count || 0;
  }

  // 통계 조회
  async getStats(userId: string, options: {
    carId?: string;
    period?: 'month' | 'year';
  } = {}): Promise<any> {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }

    // 기간 설정
    const now = new Date();
    let startDate: string;
    if (options.period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1).toISOString();
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }

    // 기본 쿼리
    let query = this.supabase
      .from('expenses')
      .select('*')
      .eq('userId', userId)
      .gte('date', startDate);

    if (options.carId) {
      query = query.eq('carId', options.carId);
    }

    const { data: expenses, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch expenses for stats: ${error.message}`);
    }

    if (!expenses || expenses.length === 0) {
      return {
        period: options.period || 'month',
        summary: {
          totalAmount: 0,
          averageAmount: 0,
          totalTransactions: 0
        },
        categoryStats: [],
        paymentMethodStats: [],
        recentExpenses: []
      };
    }

    // 총 지출액
    const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0);

    // 카테고리별 통계
    const categoryStats = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = { amount: 0, count: 0 };
      }
      acc[expense.category].amount += parseFloat(expense.amount.toString());
      acc[expense.category].count++;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    // 결제 방법별 통계
    const paymentMethodStats = expenses.reduce((acc, expense) => {
      if (!acc[expense.paymentMethod]) {
        acc[expense.paymentMethod] = { amount: 0, count: 0 };
      }
      acc[expense.paymentMethod].amount += parseFloat(expense.amount.toString());
      acc[expense.paymentMethod].count++;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    return {
      period: options.period || 'month',
      summary: {
        totalAmount,
        averageAmount: totalAmount / expenses.length,
        totalTransactions: expenses.length
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
export const supabaseExpenseStorage = new SupabaseExpenseStorage();
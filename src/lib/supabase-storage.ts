// Supabase 기반 사용자 저장소
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabase 클라이언트 생성 (환경변수가 없으면 null)
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  userType: string;
  role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
  shopInfo?: {
    shopName: string;
    businessNumber: string;
    address: string;
    description?: string;
    businessLicenseUrl?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
  };
}

export const supabaseUserStorage = {
  async findByEmail(email: string): Promise<User | null> {
    try {
      if (!supabase) {
        console.warn('Supabase 클라이언트가 초기화되지 않았습니다.');
        return null;
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        console.error('Supabase findByEmail error:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  },

  async create(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    try {
      if (!supabase) {
        throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
      }
      
      const user: User = {
        ...userData,
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        createdAt: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select()
        .single();

      if (error) {
        console.error('Supabase create user error:', error);
        throw new Error(`Failed to create user: ${error.message}`);
      }

      return data as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async findById(id: string): Promise<User | null> {
    try {
      if (!supabase) {
        console.warn('Supabase 클라이언트가 초기화되지 않았습니다.');
        return null;
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Supabase findById error:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  },

  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    try {
      if (!supabase) {
        console.warn('Supabase 클라이언트가 초기화되지 않았습니다.');
        return null;
      }
      
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update user error:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  },

  async getAll(): Promise<User[]> {
    try {
      if (!supabase) {
        console.warn('Supabase 클라이언트가 초기화되지 않았습니다.');
        return [];
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Supabase getAll users error:', error);
        return [];
      }

      return data as User[];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  },

  // Supabase 테이블 생성 함수
  async createTable(): Promise<boolean> {
    try {
      if (!supabase) {
        console.warn('Supabase 클라이언트가 초기화되지 않았습니다.');
        return false;
      }
      
      // users 테이블이 존재하는지 확인
      const { data: tableExists } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (tableExists !== null) {
        console.log('Users table already exists');
        return true;
      }

      // 테이블이 존재하지 않으면 수동으로 생성 필요
      console.log('Users table does not exist. Please create it manually in Supabase.');
      return false;
    } catch (error) {
      console.error('Error checking/creating table:', error);
      return false;
    }
  }
};

// 테이블 생성 SQL (Supabase 대시보드에서 실행)
export const createUsersTableSQL = `
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  phone VARCHAR,
  "userType" VARCHAR NOT NULL DEFAULT 'CUSTOMER',
  role VARCHAR(20) DEFAULT 'USER',
  "shopInfo" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users("createdAt");
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_shop_status ON users(("shopInfo"->>'status'));

-- RLS (Row Level Security) 정책 (필요시)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
`;
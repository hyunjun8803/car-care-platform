import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null

// 데이터베이스 연결 테스트 함수
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('_test')
      .select('*')
      .limit(1)
    
    if (error && error.code !== 'PGRST116') {
      // 테이블이 없다는 에러가 아닌 경우에만 에러로 처리
      throw error
    }
    
    return { success: true, message: 'Supabase connection successful' }
  } catch (error) {
    return { 
      success: false, 
      message: 'Supabase connection failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// User 관련 타입 정의
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  userType: string;
  createdAt: string;
}

// Supabase를 사용한 사용자 저장소
export const supabaseUserStorage = {
  async findByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          // 데이터가 없는 경우
          return null
        }
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Error finding user by email:', error)
      return null
    }
  },

  async create(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...userData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      return {
        ...data,
        createdAt: data.created_at
      }
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },

  async findById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }
      
      return {
        ...data,
        createdAt: data.created_at
      }
    } catch (error) {
      console.error('Error finding user by id:', error)
      return null
    }
  },

  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      return {
        ...data,
        createdAt: data.created_at
      }
    } catch (error) {
      console.error('Error updating user:', error)
      return null
    }
  },

  async getAll(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
      
      if (error) {
        throw error
      }
      
      return data.map(user => ({
        ...user,
        createdAt: user.created_at
      }))
    } catch (error) {
      console.error('Error getting all users:', error)
      return []
    }
  }
}
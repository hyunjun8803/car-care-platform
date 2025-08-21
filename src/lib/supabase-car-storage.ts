// Supabase를 사용한 차량 데이터 저장소
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

interface Car {
  id: string;
  userId: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  mileage: number;
  fuelType: string;
  engineSize?: string;
  color?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  totalCost: number;
  maintenanceCount: number;
  createdAt: string;
  updatedAt: string;
}

export const supabaseCarStorage = {
  // 사용자별 차량 목록 조회
  async findByUserId(userId: string): Promise<Car[]> {
    try {
      if (!supabase) {
        console.warn('Supabase 연결이 설정되지 않았습니다.');
        return [];
      }
      
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Supabase 차량 조회 오류:', error);
        throw new Error(`차량 목록 조회 실패: ${error.message}`);
      }

      return data as Car[] || [];
    } catch (error) {
      console.error('차량 조회 중 오류:', error);
      throw error;
    }
  },

  // 차량 ID로 조회
  async findById(carId: string): Promise<Car | null> {
    try {
      if (!supabase) {
        console.warn('Supabase 연결이 설정되지 않았습니다.');
        return null;
      }
      
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        console.error('Supabase 차량 조회 오류:', error);
        throw new Error(`차량 조회 실패: ${error.message}`);
      }

      return data as Car;
    } catch (error) {
      console.error('차량 조회 중 오류:', error);
      throw error;
    }
  },

  // 차량 생성
  async create(carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>): Promise<Car> {
    try {
      if (!supabase) {
        throw new Error('Supabase 연결이 설정되지 않았습니다.');
      }
      
      const car: Omit<Car, 'createdAt' | 'updatedAt'> = {
        ...carData,
        id: `car_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      };

      const { data, error } = await supabase
        .from('cars')
        .insert([car])
        .select()
        .single();

      if (error) {
        console.error('Supabase 차량 생성 오류:', error);
        throw new Error(`차량 등록 실패: ${error.message}`);
      }

      return data as Car;
    } catch (error) {
      console.error('차량 생성 중 오류:', error);
      throw error;
    }
  },

  // 차량 수정
  async update(carId: string, updateData: Partial<Omit<Car, 'id' | 'userId' | 'createdAt'>>): Promise<Car | null> {
    try {
      if (!supabase) {
        console.warn('Supabase 연결이 설정되지 않았습니다.');
        return null;
      }
      
      const { data, error } = await supabase
        .from('cars')
        .update(updateData)
        .eq('id', carId)
        .select()
        .single();

      if (error) {
        console.error('Supabase 차량 수정 오류:', error);
        throw new Error(`차량 수정 실패: ${error.message}`);
      }

      return data as Car;
    } catch (error) {
      console.error('차량 수정 중 오류:', error);
      throw error;
    }
  },

  // 차량 삭제
  async delete(carId: string): Promise<boolean> {
    try {
      if (!supabase) {
        console.warn('Supabase 연결이 설정되지 않았습니다.');
        return false;
      }
      
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', carId);

      if (error) {
        console.error('Supabase 차량 삭제 오류:', error);
        throw new Error(`차량 삭제 실패: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('차량 삭제 중 오류:', error);
      throw error;
    }
  },

  // 사용자의 차량 수 조회
  async countByUserId(userId: string): Promise<number> {
    try {
      if (!supabase) {
        console.warn('Supabase 연결이 설정되지 않았습니다.');
        return 0;
      }
      
      const { count, error } = await supabase
        .from('cars')
        .select('*', { count: 'exact', head: true })
        .eq('userId', userId);

      if (error) {
        console.error('Supabase 차량 수 조회 오류:', error);
        throw new Error(`차량 수 조회 실패: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      console.error('차량 수 조회 중 오류:', error);
      throw error;
    }
  },

  // 차량번호 중복 확인
  async findByLicensePlate(licensePlate: string, excludeCarId?: string): Promise<Car | null> {
    try {
      if (!supabase) {
        console.warn('Supabase 연결이 설정되지 않았습니다.');
        return null;
      }
      
      let query = supabase
        .from('cars')
        .select('*')
        .eq('licensePlate', licensePlate);

      if (excludeCarId) {
        query = query.neq('id', excludeCarId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Supabase 차량번호 조회 오류:', error);
        throw new Error(`차량번호 확인 실패: ${error.message}`);
      }

      return data as Car | null;
    } catch (error) {
      console.error('차량번호 조회 중 오류:', error);
      throw error;
    }
  },

  // 전체 저장소 상태 확인 (디버그용)
  async getAll(): Promise<Car[]> {
    try {
      if (!supabase) {
        console.warn('Supabase 연결이 설정되지 않았습니다.');
        return [];
      }
      
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Supabase 전체 차량 조회 오류:', error);
        throw new Error(`전체 차량 조회 실패: ${error.message}`);
      }

      return data as Car[] || [];
    } catch (error) {
      console.error('전체 차량 조회 중 오류:', error);
      throw error;
    }
  },

  // 데이터베이스 연결 테스트
  async testConnection(): Promise<boolean> {
    try {
      if (!supabase) {
        console.warn('Supabase 연결이 설정되지 않았습니다.');
        return false;
      }
      
      const { error } = await supabase
        .from('cars')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Supabase 연결 테스트 실패:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('연결 테스트 중 오류:', error);
      return false;
    }
  }
};

export type { Car };
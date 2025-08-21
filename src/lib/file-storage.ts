// 파일 기반 영구 저장소 (개발 환경용)
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// 파일 저장소는 개발 환경에서만 사용
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

interface ShopInfo {
  shopName: string;
  businessNumber: string;
  address: string;
  description?: string;
  businessLicenseUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  userType: string;
  role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  shopInfo?: ShopInfo;
  createdAt: string;
}

// 데이터 파일 경로
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// 디렉토리 생성
const ensureDataDir = async () => {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
};

// 사용자 데이터 로드
const loadUsers = async (): Promise<User[]> => {
  try {
    await ensureDataDir();
    if (!existsSync(USERS_FILE)) {
      // 최고관리자 초기 데이터
      const initialData: User[] = [{
        id: 'super_admin_001',
        name: '최고관리자',
        email: 'hyunjun2@naver.com',
        password: '',
        userType: 'ADMIN',
        role: 'SUPER_ADMIN',
        createdAt: new Date().toISOString(),
      }];
      await saveUsers(initialData);
      return initialData;
    }
    
    const data = await readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('사용자 데이터 로드 오류:', error);
    return [];
  }
};

// 사용자 데이터 저장
const saveUsers = async (users: User[]): Promise<void> => {
  try {
    await ensureDataDir();
    await writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    console.error('사용자 데이터 저장 오류:', error);
    throw error;
  }
};

export const fileUserStorage = {
  async findByEmail(email: string): Promise<User | null> {
    if (isProduction) return null; // 프로덕션에서는 비활성화
    const users = await loadUsers();
    return users.find(user => user.email === email) || null;
  },

  async create(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    if (isProduction) {
      throw new Error('파일 저장소는 프로덕션 환경에서 지원되지 않습니다.');
    }
    
    const users = await loadUsers();
    
    const user: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      createdAt: new Date().toISOString(),
    };
    
    users.push(user);
    await saveUsers(users);
    
    console.log('파일 저장소에 사용자 저장 완료:', user.id, user.email);
    return user;
  },

  async findById(id: string): Promise<User | null> {
    if (isProduction) return null;
    const users = await loadUsers();
    return users.find(user => user.id === id) || null;
  },

  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    if (isProduction) return null;
    const users = await loadUsers();
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) return null;
    
    users[userIndex] = { ...users[userIndex], ...updateData };
    await saveUsers(users);
    
    return users[userIndex];
  },

  async getAll(): Promise<User[]> {
    if (isProduction) return []; // 프로덕션에서는 빈 배열 반환
    return await loadUsers();
  }
};
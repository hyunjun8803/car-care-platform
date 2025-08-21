// Vercel KV 기반 사용자 저장소
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

// 런타임 메모리 저장소 (Vercel serverless 환경용)
let userStore: User[] = [];

// 최고관리자 계정 초기화
const initializeSuperAdmin = async () => {
  const superAdminEmail = 'hyunjun2@naver.com';
  
  // 이미 존재하는지 확인
  const existingAdmin = userStore.find(user => user.email === superAdminEmail);
  if (existingAdmin) {
    // 이미 존재하면 권한만 업데이트
    existingAdmin.role = 'SUPER_ADMIN';
    return;
  }

  // 최고관리자 계정 생성
  const superAdmin: User = {
    id: 'super_admin_001',
    name: '최고관리자',
    email: superAdminEmail,
    password: '', // 패스워드는 별도로 설정 필요
    userType: 'ADMIN',
    role: 'SUPER_ADMIN',
    createdAt: new Date().toISOString(),
  };
  
  userStore.push(superAdmin);
};

// 앱 시작 시 최고관리자 초기화
initializeSuperAdmin();

export const userStorage = {
  async findByEmail(email: string): Promise<User | null> {
    return userStore.find(user => user.email === email) || null;
  },

  async create(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      createdAt: new Date().toISOString(),
    };
    
    userStore.push(user);
    return user;
  },

  async findById(id: string): Promise<User | null> {
    return userStore.find(user => user.id === id) || null;
  },

  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    const userIndex = userStore.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    userStore[userIndex] = { ...userStore[userIndex], ...updateData };
    return userStore[userIndex];
  },

  async getAll(): Promise<User[]> {
    return userStore;
  }
};
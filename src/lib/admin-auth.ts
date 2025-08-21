import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseUserStorage } from '@/lib/supabase-storage';
import { userStorage } from '@/lib/storage';

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  userType: string;
}

/**
 * 서버 컴포넌트에서 관리자 권한 확인
 */
export async function getAdminSession(): Promise<AdminUser | null> {
  try {
    const session = await getServerSession(authOptions);
    console.log('Admin session check - session:', session?.user?.email);
    
    if (!session?.user?.email) {
      console.log('No session found');
      return null;
    }

    // 사용자 정보 조회 (Supabase와 메모리 저장소 모두 확인)
    let supabaseUser;
    let memoryUser;
    
    try {
      supabaseUser = await supabaseUserStorage.findByEmail(session.user.email);
      console.log('Supabase user found:', supabaseUser?.email, supabaseUser?.role);
    } catch (error) {
      console.log('Supabase failed');
    }

    try {
      memoryUser = await userStorage.findByEmail(session.user.email);
      console.log('Memory user found:', memoryUser?.email, memoryUser?.role);
    } catch (error) {
      console.log('Memory storage failed');
    }

    // 사용자가 어느 저장소에서든 존재하는지 확인
    if (!supabaseUser && !memoryUser) {
      console.log('No user found in any storage');
      return null;
    }

    // 메모리 저장소에 관리자 역할이 있으면 우선 사용
    let finalUser = supabaseUser;
    if (memoryUser?.role === 'ADMIN' || memoryUser?.role === 'SUPER_ADMIN') {
      console.log('Using memory user with admin role:', memoryUser.role);
      finalUser = memoryUser;
    } else if (supabaseUser?.role === 'ADMIN' || supabaseUser?.role === 'SUPER_ADMIN') {
      console.log('Using Supabase user with admin role:', supabaseUser.role);
      finalUser = supabaseUser;
    } else {
      // 둘 다 관리자 역할이 없으면 첫 번째로 찾은 사용자 사용
      finalUser = supabaseUser || memoryUser;
    }

    // 관리자 권한 확인
    if (finalUser?.role !== 'ADMIN' && finalUser?.role !== 'SUPER_ADMIN') {
      console.log('User found but insufficient role:', finalUser?.role);
      return null;
    }

    console.log('Admin access granted for:', finalUser.email, finalUser.role);
    return {
      id: finalUser.id,
      email: finalUser.email,
      name: finalUser.name,
      role: finalUser.role,
      userType: finalUser.userType,
    };
  } catch (error) {
    console.error('Admin session verification error:', error);
    return null;
  }
}

/**
 * API 라우트에서 관리자 권한 확인
 */
export async function verifyAdminRequest(request: NextRequest): Promise<AdminUser | null> {
  try {
    // 세션 확인 로직 (실제 구현에서는 JWT 토큰 검증 등)
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return null;
    }

    // 사용자 정보 조회
    let user;
    try {
      user = await supabaseUserStorage.findByEmail(session.user.email);
    } catch (error) {
      user = await userStorage.findByEmail(session.user.email);
    }

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      userType: user.userType,
    };
  } catch (error) {
    console.error('Admin request verification error:', error);
    return null;
  }
}

/**
 * 최고관리자 권한 확인
 */
export function isSuperAdmin(user: AdminUser): boolean {
  return user.role === 'SUPER_ADMIN';
}

/**
 * 관리자 권한 확인
 */
export function isAdmin(user: AdminUser): boolean {
  return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
}
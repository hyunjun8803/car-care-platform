import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { supabaseUserStorage } from '@/lib/supabase-storage';
import { userStorage } from '@/lib/storage';
import { fileUserStorage } from '@/lib/file-storage';

export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const adminUser = await getAdminSession();
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 401 }
      );
    }

    let allUsers: any[] = [];
    
    // 1. Supabase에서 조회
    try {
      const supabaseUsers = await supabaseUserStorage.getAll();
      allUsers.push(...supabaseUsers);
      console.log('Supabase users:', supabaseUsers.length);
    } catch (error) {
      console.log('Supabase query failed:', error);
    }
    
    // 2. 파일 저장소에서 조회 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      try {
        const fileUsers = await fileUserStorage.getAll();
        allUsers.push(...fileUsers);
        console.log('File users:', fileUsers.length);
      } catch (error) {
        console.log('File storage query failed:', error);
      }
    }
    
    // 3. 메모리 저장소에서 조회
    try {
      const memoryUsers = await userStorage.getAll();
      allUsers.push(...memoryUsers);
      console.log('Memory users:', memoryUsers.length);
    } catch (error) {
      console.log('Memory storage query failed:', error);
    }

    // 중복 제거 (이메일 기준)
    const uniqueUsers = allUsers.filter((user, index, self) =>
      index === self.findIndex(u => u.email === user.email)
    );

    console.log('Total unique users:', uniqueUsers.length);

    const totalUsers = uniqueUsers.length;
    const customerUsers = uniqueUsers.filter(user => user.userType === 'CUSTOMER').length;
    const shopOwners = uniqueUsers.filter(user => user.userType === 'SHOP_OWNER').length;
    const pendingShops = uniqueUsers.filter(user => 
      user.userType === 'SHOP_OWNER' && 
      user.shopInfo?.status === 'PENDING'
    ).length;
    const approvedShops = uniqueUsers.filter(user => 
      user.userType === 'SHOP_OWNER' && 
      user.shopInfo?.status === 'APPROVED'
    ).length;
    
    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        customerUsers,
        shopOwners,
        pendingShops,
        approvedShops
      },
      environment: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Stats API 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
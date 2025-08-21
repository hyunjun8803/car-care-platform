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

    let allPendingShops: any[] = [];
    
    // Supabase에서 승인 대기 정비소 조회
    try {
      const supabaseUsers = await supabaseUserStorage.getAll();
      const supabasePendingShops = supabaseUsers.filter(user => 
        user.userType === 'SHOP_OWNER' && 
        user.shopInfo?.status === 'PENDING'
      );
      allPendingShops.push(...supabasePendingShops);
      console.log('Supabase pending shops:', supabasePendingShops.length);
    } catch (error) {
      console.log('Supabase query failed:', error);
    }
    
    // 파일 저장소에서 승인 대기 정비소 조회 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      try {
        const fileUsers = await fileUserStorage.getAll();
        const filePendingShops = fileUsers.filter(user => 
          user.userType === 'SHOP_OWNER' && 
          user.shopInfo?.status === 'PENDING'
        );
        allPendingShops.push(...filePendingShops);
        console.log('File pending shops:', filePendingShops.length);
      } catch (error) {
        console.log('File storage query failed:', error);
      }
    }

    // 메모리 저장소에서 승인 대기 정비소 조회
    try {
      const memoryUsers = await userStorage.getAll();
      const memoryPendingShops = memoryUsers.filter(user => 
        user.userType === 'SHOP_OWNER' && 
        user.shopInfo?.status === 'PENDING'
      );
      allPendingShops.push(...memoryPendingShops);
      console.log('Memory pending shops:', memoryPendingShops.length);
    } catch (error) {
      console.log('Memory storage query failed:', error);
    }

    // 중복 제거 (이메일 기준)
    const uniquePendingShops = allPendingShops.filter((shop, index, self) =>
      index === self.findIndex(s => s.email === shop.email)
    );

    console.log('Total unique pending shops:', uniquePendingShops.length);
    
    return NextResponse.json({
      success: true,
      shops: uniquePendingShops
    });

  } catch (error) {
    console.error('Pending shops API 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
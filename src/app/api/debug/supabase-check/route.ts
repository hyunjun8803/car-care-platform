import { NextRequest, NextResponse } from 'next/server';
import { supabaseUserStorage } from '@/lib/supabase-storage';
import { userStorage } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Supabase 상태 확인 시작 ===');

    let results = {
      environment: process.env.NODE_ENV,
      supabase: {
        configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Missing',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configured' : 'Missing'
      },
      supabaseUsers: [],
      supabaseError: null,
      memoryUsers: [],
      memoryError: null,
      stats: {
        supabaseTotal: 0,
        memoryTotal: 0,
        supabaseShops: 0,
        memoryShops: 0
      }
    };

    // 1. Supabase에서 사용자 조회 시도
    try {
      console.log('Supabase에서 사용자 조회 중...');
      const supabaseUsers = await supabaseUserStorage.getAll();
      results.supabaseUsers = supabaseUsers.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        role: user.role,
        hasShopInfo: !!user.shopInfo,
        shopStatus: user.shopInfo?.status,
        shopName: user.shopInfo?.shopName,
        createdAt: user.createdAt
      }));
      results.stats.supabaseTotal = supabaseUsers.length;
      results.stats.supabaseShops = supabaseUsers.filter(u => u.userType === 'SHOP_OWNER').length;
      console.log(`Supabase 사용자 ${supabaseUsers.length}명 조회 성공`);
    } catch (error) {
      console.error('Supabase 조회 실패:', error);
      results.supabaseError = error instanceof Error ? error.message : String(error);
    }

    // 2. 메모리에서 사용자 조회
    try {
      console.log('메모리에서 사용자 조회 중...');
      const memoryUsers = await userStorage.getAll();
      results.memoryUsers = memoryUsers.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        role: user.role,
        hasShopInfo: !!user.shopInfo,
        shopStatus: user.shopInfo?.status,
        shopName: user.shopInfo?.shopName,
        createdAt: user.createdAt
      }));
      results.stats.memoryTotal = memoryUsers.length;
      results.stats.memoryShops = memoryUsers.filter(u => u.userType === 'SHOP_OWNER').length;
      console.log(`메모리 사용자 ${memoryUsers.length}명 조회 성공`);
    } catch (error) {
      console.error('메모리 조회 실패:', error);
      results.memoryError = error instanceof Error ? error.message : String(error);
    }

    console.log('=== Supabase 상태 확인 완료 ===');
    console.log('최종 결과:', results.stats);

    // 추가 통계 계산 - 관리자 페이지들이 표시해야 할 수치들
    const allUsers = [
      ...(results.supabaseUsers || []),
      ...(results.memoryUsers || [])
    ].filter((user, index, self) => 
      index === self.findIndex(u => u.email === user.email)
    );

    const pendingShops = allUsers.filter(u => 
      u.userType === 'SHOP_OWNER' && u.shopStatus === 'PENDING'
    );
    const approvedShops = allUsers.filter(u => 
      u.userType === 'SHOP_OWNER' && u.shopStatus === 'APPROVED'
    );
    const allShops = allUsers.filter(u => u.userType === 'SHOP_OWNER');

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results,
      adminPagesExpected: {
        dashboardPendingCount: pendingShops.length,
        approvalsPageCount: pendingShops.length,
        usersPageShopCount: allShops.length,
        shopListPageCount: allShops.length,
        totalUniqueUsers: allUsers.length,
        pendingShopsDetails: pendingShops.map(s => ({
          id: s.id,
          email: s.email,
          shopName: s.shopName,
          status: s.shopStatus
        }))
      }
    });

  } catch (error) {
    console.error('Supabase 체크 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
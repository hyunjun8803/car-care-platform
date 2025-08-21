import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/storage';
import { supabaseUserStorage } from '@/lib/supabase-storage';
import { fileUserStorage } from '@/lib/file-storage';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const shopId = searchParams.get('shopId');
  
  if (action === 'approve' && shopId) {
    try {
      const shop = await userStorage.findById(shopId);
      if (!shop || shop.userType !== 'SHOP_OWNER') {
        return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
      }
      
      const updated = await userStorage.update(shopId, {
        shopInfo: {
          ...shop.shopInfo,
          status: 'APPROVED'
        }
      });
      
      if (updated) {
        const allUsers = await userStorage.getAll();
        const pendingCount = allUsers.filter(u => u.userType === 'SHOP_OWNER' && u.shopInfo?.status === 'PENDING').length;
        const approvedCount = allUsers.filter(u => u.userType === 'SHOP_OWNER' && u.shopInfo?.status === 'APPROVED').length;
        
        return NextResponse.json({
          success: true,
          message: '정비소 승인 완료',
          shop: {
            id: updated.id,
            email: updated.email,
            shopName: updated.shopInfo?.shopName,
            status: updated.shopInfo?.status
          },
          currentState: {
            pendingShops: pendingCount,
            approvedShops: approvedCount,
            totalShops: pendingCount + approvedCount
          }
        });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Approval failed' }, { status: 500 });
    }
  }
  
  return handleShopRegisterTest();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.action === 'approve' && body.shopId) {
      return handleShopApproval(body.shopId, body.action);
    }
  } catch (e) {
    // If JSON parsing fails, proceed with normal registration test
  }
  return handleShopRegisterTest();
}

async function handleShopApproval(shopId: string, action: string) {
  try {
    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    let updatedShop = null;

    console.log(`테스트 정비소 ${action} 처리 시작:`, shopId, newStatus);

    // 메모리 저장소에서 업데이트 시도
    try {
      const memoryShop = await userStorage.findById(shopId);
      if (memoryShop && memoryShop.userType === 'SHOP_OWNER') {
        const updated = await userStorage.update(shopId, {
          shopInfo: {
            ...memoryShop.shopInfo,
            status: newStatus
          }
        });
        if (updated) {
          updatedShop = updated;
          console.log('메모리 저장소 업데이트 성공:', shopId);
        }
      }
    } catch (error) {
      console.log('메모리 저장소 업데이트 실패:', error);
    }

    if (!updatedShop) {
      return NextResponse.json(
        { success: false, error: '정비소를 찾을 수 없거나 업데이트에 실패했습니다.' },
        { status: 404 }
      );
    }

    const actionText = action === 'approve' ? '승인' : '거부';
    
    // 업데이트 후 전체 상태 확인
    let currentState = {
      memory: { shops: 0, pending: 0, approved: 0 }
    };

    try {
      const memoryUsers = await userStorage.getAll();
      const memoryShops = memoryUsers.filter(u => u.userType === 'SHOP_OWNER');
      currentState.memory = {
        shops: memoryShops.length,
        pending: memoryShops.filter(s => s.shopInfo?.status === 'PENDING').length,
        approved: memoryShops.filter(s => s.shopInfo?.status === 'APPROVED').length
      };
    } catch (error) {
      console.log('메모리 상태 확인 실패:', error);
    }
    
    return NextResponse.json({
      success: true,
      message: `테스트 정비소 ${actionText} 처리가 완료되었습니다.`,
      shop: {
        id: updatedShop.id,
        shopName: updatedShop.shopInfo?.shopName,
        status: newStatus,
        email: updatedShop.email
      },
      currentState
    });

  } catch (error) {
    console.error('테스트 정비소 승인 처리 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

async function handleShopRegisterTest() {
  try {
    console.log('=== 테스트 정비소 등록 시작 ===');

    // 테스트 데이터 생성
    const testEmail = `test-shop-${Date.now()}@example.com`;
    const hashedPassword = await bcrypt.hash('testpassword123', 12);
    
    const userData = {
      name: '테스트 정비소 사장',
      email: testEmail,
      password: hashedPassword,
      phone: '010-1234-5678',
      userType: 'SHOP_OWNER',
      shopInfo: {
        shopName: '테스트 정비소',
        businessNumber: '123-45-67890',
        address: '서울시 강남구 테스트로 123',
        description: '테스트용 정비소입니다',
        businessLicenseUrl: 'test-file-url.jpg',
        status: 'PENDING' as const,
        createdAt: new Date().toISOString()
      }
    };

    console.log('테스트 데이터:', {
      email: userData.email,
      userType: userData.userType,
      shopName: userData.shopInfo.shopName,
      environment: process.env.NODE_ENV
    });

    let results = {
      environment: process.env.NODE_ENV,
      attempts: {
        supabase: { success: false, error: null, data: null },
        memory: { success: false, error: null, data: null }
      }
    };

    // 1. Supabase 저장 시도
    try {
      console.log('Supabase 저장 시도...');
      const supabaseUser = await supabaseUserStorage.create(userData);
      results.attempts.supabase = {
        success: true,
        error: null,
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          userType: supabaseUser.userType,
          hasShopInfo: !!supabaseUser.shopInfo,
          shopStatus: supabaseUser.shopInfo?.status
        }
      };
      console.log('Supabase 저장 성공:', supabaseUser.id);
    } catch (supabaseError) {
      console.error('Supabase 저장 실패:', supabaseError);
      results.attempts.supabase = {
        success: false,
        error: supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
        data: null
      };

      // 2. 메모리 저장소 시도 (프로덕션 환경 fallback)
      try {
        console.log('메모리 저장소 시도...');
        const memoryUser = await userStorage.create(userData);
        results.attempts.memory = {
          success: true,
          error: null,
          data: {
            id: memoryUser.id,
            email: memoryUser.email,
            userType: memoryUser.userType,
            hasShopInfo: !!memoryUser.shopInfo,
            shopStatus: memoryUser.shopInfo?.status
          }
        };
        console.log('메모리 저장소 저장 성공:', memoryUser.id);
      } catch (memoryError) {
        console.error('메모리 저장소 저장 실패:', memoryError);
        results.attempts.memory = {
          success: false,
          error: memoryError instanceof Error ? memoryError.message : String(memoryError),
          data: null
        };
      }
    }

    // 3. 저장 후 조회 테스트
    let queryResults = {
      supabase: { users: [], shops: 0 },
      memory: { users: [], shops: 0 }
    };

    try {
      const supabaseUsers = await supabaseUserStorage.getAll();
      queryResults.supabase.users = supabaseUsers.map(u => ({
        id: u.id,
        email: u.email,
        userType: u.userType,
        hasShopInfo: !!u.shopInfo,
        shopStatus: u.shopInfo?.status
      }));
      queryResults.supabase.shops = supabaseUsers.filter(u => u.userType === 'SHOP_OWNER').length;
    } catch (error) {
      console.error('Supabase 조회 실패:', error);
    }

    try {
      const memoryUsers = await userStorage.getAll();
      queryResults.memory.users = memoryUsers.map(u => ({
        id: u.id,
        email: u.email,
        userType: u.userType,
        hasShopInfo: !!u.shopInfo,
        shopStatus: u.shopInfo?.status
      }));
      queryResults.memory.shops = memoryUsers.filter(u => u.userType === 'SHOP_OWNER').length;
    } catch (error) {
      console.error('메모리 조회 실패:', error);
    }

    console.log('=== 테스트 정비소 등록 완료 ===');

    return NextResponse.json({
      success: true,
      message: '테스트 정비소 등록 완료',
      testEmail,
      results,
      queryResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('테스트 정비소 등록 오류:', error);
    return NextResponse.json({
      success: false,
      error: '테스트 실패',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
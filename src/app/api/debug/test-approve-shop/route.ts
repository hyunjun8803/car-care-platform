import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/storage';
import { supabaseUserStorage } from '@/lib/supabase-storage';
import { fileUserStorage } from '@/lib/file-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shopId, action } = body; // action: 'approve' 또는 'reject'

    if (!shopId || !action) {
      return NextResponse.json(
        { success: false, error: '정비소 ID와 액션이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 액션입니다.' },
        { status: 400 }
      );
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    let updatedShop = null;

    console.log(`테스트 정비소 ${action} 처리 시작:`, shopId, newStatus);

    // 1. Supabase에서 업데이트 시도
    try {
      const supabaseShop = await supabaseUserStorage.findById(shopId);
      if (supabaseShop && supabaseShop.userType === 'SHOP_OWNER') {
        const updated = await supabaseUserStorage.update(shopId, {
          shopInfo: {
            ...supabaseShop.shopInfo,
            status: newStatus
          }
        });
        if (updated) {
          updatedShop = updated;
          console.log('Supabase 업데이트 성공:', shopId);
        }
      }
    } catch (error) {
      console.log('Supabase 업데이트 실패:', error);
    }

    // 2. 파일 저장소에서 업데이트 시도 (개발 환경에서만)
    if (!updatedShop && process.env.NODE_ENV === 'development') {
      try {
        const fileShop = await fileUserStorage.findById(shopId);
        if (fileShop && fileShop.userType === 'SHOP_OWNER') {
          const updated = await fileUserStorage.update(shopId, {
            shopInfo: {
              ...fileShop.shopInfo,
              status: newStatus
            }
          });
          if (updated) {
            updatedShop = updated;
            console.log('파일 저장소 업데이트 성공:', shopId);
            
            // 메모리 저장소도 동기화
            try {
              await userStorage.update(shopId, {
                shopInfo: {
                  ...fileShop.shopInfo,
                  status: newStatus
                }
              });
              console.log('메모리 저장소 동기화 완료');
            } catch (memSyncError) {
              console.warn('메모리 저장소 동기화 실패:', memSyncError);
            }
          }
        }
      } catch (error) {
        console.log('파일 저장소 업데이트 실패:', error);
      }
    }

    // 3. 메모리 저장소에서 업데이트 시도 (최후의 수단)
    if (!updatedShop) {
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
      supabase: { shops: 0, pending: 0, approved: 0 },
      memory: { shops: 0, pending: 0, approved: 0 }
    };

    try {
      const supabaseUsers = await supabaseUserStorage.getAll();
      const supabaseShops = supabaseUsers.filter(u => u.userType === 'SHOP_OWNER');
      currentState.supabase = {
        shops: supabaseShops.length,
        pending: supabaseShops.filter(s => s.shopInfo?.status === 'PENDING').length,
        approved: supabaseShops.filter(s => s.shopInfo?.status === 'APPROVED').length
      };
    } catch (error) {
      console.log('Supabase 상태 확인 실패:', error);
    }

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
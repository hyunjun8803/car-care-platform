import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/storage';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('=== 승인된 테스트 정비소 생성 시작 ===');

    const testShops = [
      {
        name: '강남 오토케어',
        email: `approved-shop-gangnam-${Date.now()}@example.com`,
        password: await bcrypt.hash('testpassword123', 12),
        phone: '02-1234-5678',
        userType: 'SHOP_OWNER',
        shopInfo: {
          shopName: '강남 오토케어',
          businessNumber: '123-45-67890',
          address: '서울특별시 강남구 테헤란로 123',
          description: '20년 경력의 숙련된 정비사들이 정확하고 빠른 정비 서비스를 제공합니다.',
          businessLicenseUrl: 'gangnam-license.jpg',
          status: 'APPROVED',
          createdAt: new Date().toISOString()
        }
      },
      {
        name: '서초 모터스',
        email: `approved-shop-seocho-${Date.now()}@example.com`,
        password: await bcrypt.hash('testpassword123', 12),
        phone: '02-2345-6789',
        userType: 'SHOP_OWNER',
        shopInfo: {
          shopName: '서초 모터스',
          businessNumber: '234-56-78901',
          address: '서울특별시 서초구 반포대로 456',
          description: '친절하고 정확한 정비 서비스로 고객만족을 최우선으로 합니다.',
          businessLicenseUrl: 'seocho-license.jpg',
          status: 'APPROVED',
          createdAt: new Date().toISOString()
        }
      },
      {
        name: '송파 카센터',
        email: `approved-shop-songpa-${Date.now()}@example.com`,
        password: await bcrypt.hash('testpassword123', 12),
        phone: '02-3456-7890',
        userType: 'SHOP_OWNER',
        shopInfo: {
          shopName: '송파 카센터',
          businessNumber: '345-67-89012',
          address: '서울특별시 송파구 올림픽로 789',
          description: '최신 장비와 정품 부품으로 안전하고 믿을 수 있는 정비 서비스를 제공합니다.',
          businessLicenseUrl: 'songpa-license.jpg',
          status: 'APPROVED',
          createdAt: new Date().toISOString()
        }
      }
    ];

    const results = [];

    for (const shopData of testShops) {
      try {
        const newShop = await userStorage.create(shopData);
        results.push({
          success: true,
          id: newShop.id,
          email: newShop.email,
          shopName: newShop.shopInfo?.shopName,
          status: newShop.shopInfo?.status
        });
        console.log(`승인된 정비소 생성 성공: ${newShop.shopInfo?.shopName} (${newShop.id})`);
      } catch (error) {
        results.push({
          success: false,
          shopName: shopData.shopInfo.shopName,
          error: error instanceof Error ? error.message : String(error)
        });
        console.error(`정비소 생성 실패 (${shopData.shopInfo.shopName}):`, error);
      }
    }

    // 현재 상태 확인
    const allUsers = await userStorage.getAll();
    const approvedShops = allUsers.filter(u => 
      u.userType === 'SHOP_OWNER' && u.shopInfo?.status === 'APPROVED'
    );

    console.log('=== 승인된 테스트 정비소 생성 완료 ===');

    return NextResponse.json({
      success: true,
      message: `${results.filter(r => r.success).length}개의 승인된 정비소가 생성되었습니다`,
      results,
      currentState: {
        totalApprovedShops: approvedShops.length,
        createdShops: results.filter(r => r.success).length,
        failedShops: results.filter(r => !r.success).length
      },
      nextStep: 'Now visit /booking to see the approved shops',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('승인된 정비소 생성 오류:', error);
    return NextResponse.json({
      success: false,
      error: '승인된 정비소 생성 실패',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // 현재 승인된 정비소 상태 확인
    const allUsers = await userStorage.getAll();
    const approvedShops = allUsers.filter(u => 
      u.userType === 'SHOP_OWNER' && u.shopInfo?.status === 'APPROVED'
    );
    const pendingShops = allUsers.filter(u => 
      u.userType === 'SHOP_OWNER' && u.shopInfo?.status === 'PENDING'
    );

    return NextResponse.json({
      success: true,
      currentState: {
        approvedShops: approvedShops.length,
        pendingShops: pendingShops.length,
        totalShopOwners: allUsers.filter(u => u.userType === 'SHOP_OWNER').length
      },
      approvedShopsList: approvedShops.map(shop => ({
        id: shop.id,
        email: shop.email,
        shopName: shop.shopInfo?.shopName,
        address: shop.shopInfo?.address,
        status: shop.shopInfo?.status
      })),
      instruction: 'Use POST method to create approved test shops for booking page testing'
    });
  } catch (error) {
    console.error('정비소 상태 확인 오류:', error);
    return NextResponse.json({
      success: false,
      error: '정비소 상태 확인 실패',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
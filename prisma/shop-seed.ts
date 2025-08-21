import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createShopsAndServices() {
  console.log('🏪 정비소 및 서비스 데이터 생성을 시작합니다...');

  // 기존 데이터 삭제
  await prisma.booking.deleteMany();
  await prisma.review.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.shop.deleteMany();

  console.log('🗑️  기존 정비소 데이터 정리 완료');

  // 서비스 카테고리 생성
  const categories = await Promise.all([
    prisma.serviceCategory.create({
      data: {
        name: '정기점검',
        description: '정기적인 차량 점검 및 예방 정비',
        icon: 'Wrench'
      }
    }),
    prisma.serviceCategory.create({
      data: {
        name: '엔진수리',
        description: '엔진 관련 수리 및 교체',
        icon: 'Settings'
      }
    }),
    prisma.serviceCategory.create({
      data: {
        name: '타이어/휠',
        description: '타이어 교체 및 휠 얼라인먼트',
        icon: 'Circle'
      }
    }),
    prisma.serviceCategory.create({
      data: {
        name: '브레이크',
        description: '브레이크 패드/디스크 교체',
        icon: 'Disc'
      }
    }),
    prisma.serviceCategory.create({
      data: {
        name: '전기계통',
        description: '배터리, 전기 시스템 수리',
        icon: 'Zap'
      }
    }),
    prisma.serviceCategory.create({
      data: {
        name: '에어컨',
        description: '에어컨 수리 및 가스 충전',
        icon: 'Wind'
      }
    })
  ]);

  console.log('📋 서비스 카테고리 생성 완료');

  // 테스트 정비소 운영자 생성
  const shopOwner1 = await prisma.user.create({
    data: {
      email: 'shop1@carcare.com',
      name: '김정비',
      userType: 'SHOP_OWNER',
      isVerified: true,
      createdAt: new Date('2024-01-10')
    }
  });

  const shopOwner2 = await prisma.user.create({
    data: {
      email: 'shop2@carcare.com',
      name: '박수리',
      userType: 'SHOP_OWNER',
      isVerified: true,
      createdAt: new Date('2024-01-15')
    }
  });

  const shopOwner3 = await prisma.user.create({
    data: {
      email: 'shop3@carcare.com',
      name: '이오토',
      userType: 'SHOP_OWNER',
      isVerified: true,
      createdAt: new Date('2024-01-20')
    }
  });

  console.log('👤 정비소 운영자 계정 생성 완료');

  // 정비소 생성
  const shop1 = await prisma.shop.create({
    data: {
      ownerId: shopOwner1.id,
      businessName: '현대 블루핸즈 강남점',
      businessNumber: '123-45-67890',
      address: '서울시 강남구 테헤란로 123',
      latitude: 37.5019,
      longitude: 127.0263,
      phone: '02-1234-5678',
      email: 'gangnam@bluehands.com',
      operatingHours: '평일 09:00-18:00, 토요일 09:00-13:00',
      rating: 4.8,
      totalReviews: 245,
      isVerified: true
    }
  });

  const shop2 = await prisma.shop.create({
    data: {
      ownerId: shopOwner2.id,
      businessName: '기아 오토큐 서초점',
      businessNumber: '234-56-78901',
      address: '서울시 서초구 강남대로 456',
      latitude: 37.4944,
      longitude: 127.0218,
      phone: '02-2345-6789',
      email: 'seocho@autoq.com',
      operatingHours: '평일 08:30-19:00, 주말 09:00-16:00',
      rating: 4.6,
      totalReviews: 189,
      isVerified: true
    }
  });

  const shop3 = await prisma.shop.create({
    data: {
      ownerId: shopOwner3.id,
      businessName: '스피드 오토서비스',
      businessNumber: '345-67-89012',
      address: '서울시 서초구 반포대로 789',
      latitude: 37.4979,
      longitude: 127.0276,
      phone: '02-3456-7890',
      email: 'info@speedauto.co.kr',
      operatingHours: '24시간 운영',
      rating: 4.4,
      totalReviews: 156,
      isVerified: true
    }
  });

  console.log('🏪 정비소 생성 완료');

  // 각 정비소별 서비스 생성
  const services = [];

  // 현대 블루핸즈 강남점 서비스
  services.push(...await Promise.all([
    prisma.service.create({
      data: {
        shopId: shop1.id,
        categoryId: categories[0].id, // 정기점검
        name: '정기점검 (종합)',
        description: '엔진오일, 필터, 브레이크, 타이어 등 전반적인 점검',
        basePrice: 120000,
        estimatedDuration: 90
      }
    }),
    prisma.service.create({
      data: {
        shopId: shop1.id,
        categoryId: categories[1].id, // 엔진수리
        name: '엔진오일 교환',
        description: '고급 엔진오일 교환 및 필터 교체',
        basePrice: 80000,
        estimatedDuration: 30
      }
    }),
    prisma.service.create({
      data: {
        shopId: shop1.id,
        categoryId: categories[3].id, // 브레이크
        name: '브레이크 패드 교체',
        description: '전후 브레이크 패드 교체 (순정부품)',
        basePrice: 180000,
        estimatedDuration: 120
      }
    }),
    prisma.service.create({
      data: {
        shopId: shop1.id,
        categoryId: categories[4].id, // 전기계통
        name: '배터리 교체',
        description: '고성능 배터리 교체 (3년 보증)',
        basePrice: 150000,
        estimatedDuration: 45
      }
    })
  ]));

  // 기아 오토큐 서초점 서비스
  services.push(...await Promise.all([
    prisma.service.create({
      data: {
        shopId: shop2.id,
        categoryId: categories[0].id, // 정기점검
        name: '기본 점검',
        description: '기본 안전점검 및 소모품 점검',
        basePrice: 60000,
        estimatedDuration: 60
      }
    }),
    prisma.service.create({
      data: {
        shopId: shop2.id,
        categoryId: categories[2].id, // 타이어/휠
        name: '타이어 4개 교체',
        description: '브랜드 타이어 4개 교체 및 휠 얼라인먼트',
        basePrice: 400000,
        estimatedDuration: 180
      }
    }),
    prisma.service.create({
      data: {
        shopId: shop2.id,
        categoryId: categories[5].id, // 에어컨
        name: '에어컨 가스 충전',
        description: '에어컨 시스템 점검 및 냉매 충전',
        basePrice: 70000,
        estimatedDuration: 40
      }
    }),
    prisma.service.create({
      data: {
        shopId: shop2.id,
        categoryId: categories[1].id, // 엔진수리
        name: '변속기 오일 교환',
        description: 'AT/CVT 변속기 오일 교환',
        basePrice: 120000,
        estimatedDuration: 90
      }
    })
  ]));

  // 스피드 오토서비스 서비스
  services.push(...await Promise.all([
    prisma.service.create({
      data: {
        shopId: shop3.id,
        categoryId: categories[0].id, // 정기점검
        name: '24시간 응급점검',
        description: '24시간 응급 출장 점검 서비스',
        basePrice: 100000,
        estimatedDuration: 60
      }
    }),
    prisma.service.create({
      data: {
        shopId: shop3.id,
        categoryId: categories[3].id, // 브레이크
        name: '브레이크 오일 교환',
        description: '브레이크 오일 및 클러치 오일 교환',
        basePrice: 90000,
        estimatedDuration: 60
      }
    }),
    prisma.service.create({
      data: {
        shopId: shop3.id,
        categoryId: categories[4].id, // 전기계통
        name: '전기계통 진단',
        description: '컴퓨터 진단기를 이용한 전기계통 종합 진단',
        basePrice: 50000,
        estimatedDuration: 30
      }
    }),
    prisma.service.create({
      data: {
        shopId: shop3.id,
        categoryId: categories[2].id, // 타이어/휠
        name: '타이어 펑크 수리',
        description: '24시간 출장 타이어 펑크 수리',
        basePrice: 30000,
        estimatedDuration: 20
      }
    })
  ]));

  console.log('🔧 정비 서비스 생성 완료');
  console.log(`   - 총 ${services.length}개 서비스 생성`);
  console.log('');
  console.log('✅ 정비소 및 서비스 데이터 생성 완료!');
  console.log('');
  console.log('📊 생성된 데이터:');
  console.log(`   - 서비스 카테고리: ${categories.length}개`);
  console.log('   - 정비소: 3개');
  console.log(`   - 서비스: ${services.length}개`);
  console.log('   - 정비소 운영자: 3명');
  console.log('');
  console.log('🏪 생성된 정비소:');
  console.log('   1. 현대 블루핸즈 강남점 - 4.8⭐ (245 리뷰)');
  console.log('   2. 기아 오토큐 서초점 - 4.6⭐ (189 리뷰)');
  console.log('   3. 스피드 오토서비스 - 4.4⭐ (156 리뷰)');
}

createShopsAndServices()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ 정비소 데이터 생성 중 오류:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 추가를 시작합니다...');

  // 기존 데이터 삭제 (개발용)
  await prisma.expense.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.car.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  기존 데이터 정리 완료');

  // 테스트 사용자 생성
  const user = await prisma.user.create({
    data: {
      id: 'user1',
      email: 'test@example.com',
      name: '테스트 사용자',
      phone: '010-1234-5678',
      address: '서울시 강남구 테헤란로 123',
      userType: 'CUSTOMER',
      isVerified: true,
      notificationSettings: JSON.stringify({
        email: true,
        sms: true,
        push: true
      }),
      preferences: JSON.stringify({
        language: 'ko',
        theme: 'light'
      }),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  });

  console.log('👤 테스트 사용자 생성 완료');

  // 차량 데이터 생성
  const car1 = await prisma.car.create({
    data: {
      id: '1',
      userId: 'user1',
      name: '내 소나타',
      brand: '현대',
      model: '소나타 DN8',
      year: 2022,
      licensePlate: '123가4567',
      mileage: 35000,
      fuelType: '가솔린',
      engineSize: '2.0L',
      color: '흰색',
      lastMaintenance: '2024-07-15',
      nextMaintenance: '2024-12-15',
      totalCost: 850000,
      maintenanceCount: 5,
      createdAt: new Date('2024-01-15')
    }
  });

  const car2 = await prisma.car.create({
    data: {
      id: '2',
      userId: 'user1',
      name: '가족 카니발',
      brand: '기아',
      model: '카니발 4세대',
      year: 2021,
      licensePlate: '456나7890',
      mileage: 42000,
      fuelType: '디젤',
      engineSize: '2.2L',
      color: '검은색',
      lastMaintenance: '2024-06-20',
      nextMaintenance: '2024-11-20',
      totalCost: 1200000,
      maintenanceCount: 7,
      createdAt: new Date('2024-02-10')
    }
  });

  console.log('🚗 차량 데이터 생성 완료');

  // 정비 기록 데이터 생성
  await prisma.maintenanceLog.createMany({
    data: [
      {
        id: '1',
        carId: '1',
        userId: 'user1',
        date: '2024-07-15',
        type: '정기점검',
        description: '엔진오일 교환, 에어필터 교체',
        cost: 120000,
        mileage: 35000,
        shopName: '현대 블루핸즈 강남점',
        shopAddress: '서울시 강남구 테헤란로 123',
        parts: '엔진오일, 에어필터',
        createdAt: new Date('2024-07-15')
      },
      {
        id: '2',
        carId: '1',
        userId: 'user1',
        date: '2024-05-10',
        type: '수리',
        description: '브레이크패드 교체',
        cost: 180000,
        mileage: 33000,
        shopName: '현대 블루핸즈 강남점',
        shopAddress: '서울시 강남구 테헤란로 123',
        parts: '브레이크패드',
        createdAt: new Date('2024-05-10')
      },
      {
        id: '3',
        carId: '2',
        userId: 'user1',
        date: '2024-06-20',
        type: '정기점검',
        description: '엔진오일 교환, 타이어 로테이션',
        cost: 95000,
        mileage: 42000,
        shopName: '기아 오토큐 서초점',
        shopAddress: '서울시 서초구 강남대로 456',
        parts: '엔진오일',
        createdAt: new Date('2024-06-20')
      }
    ]
  });

  console.log('🔧 정비 기록 데이터 생성 완료');

  // 차계부 데이터 생성
  await prisma.expense.createMany({
    data: [
      {
        id: '1',
        userId: 'user1',
        carId: '1',
        category: 'FUEL',
        subcategory: '휘발유',
        amount: 65000,
        description: '주유 (65L)',
        date: new Date('2024-08-10'),
        location: 'GS칼텍스 강남역점',
        mileage: 35500,
        paymentMethod: 'CARD',
        createdAt: new Date('2024-08-10')
      },
      {
        id: '2',
        userId: 'user1',
        carId: '1',
        category: 'MAINTENANCE',
        subcategory: '엔진오일',
        amount: 120000,
        description: '정기점검 및 엔진오일 교환',
        date: new Date('2024-07-15'),
        location: '현대 블루핸즈 강남점',
        mileage: 35000,
        paymentMethod: 'CARD',
        createdAt: new Date('2024-07-15')
      },
      {
        id: '3',
        userId: 'user1',
        carId: '2',
        category: 'FUEL',
        subcategory: '경유',
        amount: 85000,
        description: '주유 (70L)',
        date: new Date('2024-08-08'),
        location: 'SK에너지 서초점',
        mileage: 42200,
        paymentMethod: 'CARD',
        createdAt: new Date('2024-08-08')
      },
      {
        id: '4',
        userId: 'user1',
        carId: '1',
        category: 'CARWASH',
        amount: 15000,
        description: '실내외 세차',
        date: new Date('2024-08-05'),
        location: '셀프세차장',
        paymentMethod: 'CASH',
        createdAt: new Date('2024-08-05')
      },
      {
        id: '5',
        userId: 'user1',
        carId: '2',
        category: 'PARKING',
        amount: 8000,
        description: '주차비',
        date: new Date('2024-08-01'),
        location: '코엑스몰',
        paymentMethod: 'CARD',
        createdAt: new Date('2024-08-01')
      }
    ]
  });

  console.log('💰 차계부 데이터 생성 완료');

  // 생성된 데이터 확인
  const carsCount = await prisma.car.count();
  const maintenanceCount = await prisma.maintenanceLog.count();
  const expenseCount = await prisma.expense.count();
  
  console.log(`✅ 시드 데이터 추가 완료!`);
  console.log(`   - 사용자: 1명`);
  console.log(`   - 차량: ${carsCount}대`);
  console.log(`   - 정비 기록: ${maintenanceCount}건`);
  console.log(`   - 차계부 기록: ${expenseCount}건`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ 시드 데이터 추가 중 오류:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
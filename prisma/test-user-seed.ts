import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  console.log('🔐 테스트 사용자 생성을 시작합니다...');

  // 기존 테스트 사용자 삭제
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['test@example.com', 'user@carcare.com']
      }
    }
  });

  console.log('🗑️  기존 테스트 사용자 정리 완료');

  // 비밀번호 해시
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 테스트 사용자 생성
  const testUser = await prisma.user.create({
    data: {
      email: 'user@carcare.com',
      name: '테스트 사용자',
      password: hashedPassword,
      userType: 'CUSTOMER',
      isVerified: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  });

  console.log('👤 테스트 사용자 생성 완료');
  console.log(`   - 이메일: user@carcare.com`);
  console.log(`   - 비밀번호: password123`);
  console.log(`   - ID: ${testUser.id}`);

  // 기존 차량과 정비 기록을 새 사용자 ID로 업데이트
  await prisma.car.updateMany({
    where: { userId: 'user1' },
    data: { userId: testUser.id }
  });

  await prisma.maintenanceLog.updateMany({
    where: { userId: 'user1' },
    data: { userId: testUser.id }
  });

  console.log('🚗 기존 차량 및 정비 기록을 새 사용자로 연결 완료');

  // 기존 user1 사용자 삭제
  await prisma.user.deleteMany({
    where: { id: 'user1' }
  });

  console.log('✅ 테스트 사용자 설정 완료!');
  console.log('   브라우저에서 다음 정보로 로그인할 수 있습니다:');
  console.log('   📧 이메일: user@carcare.com');
  console.log('   🔑 비밀번호: password123');
}

createTestUser()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ 테스트 사용자 생성 중 오류:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
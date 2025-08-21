// Supabase 연결 및 테이블 생성 테스트 스크립트
// 사용법: node test-supabase-connection.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oxqwzitldabsstxhojeg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94cXd6aXRsZGFic3N0eGhvamVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyOTYyODcsImV4cCI6MjA3MDg3MjI4N30.6pMXE2ox9AIcTM09fZ304B_Iv_8eV6mggYFYOf0rcgk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  console.log('🔗 Supabase 연결 테스트 시작\n');

  try {
    // 1. 연결 테스트
    console.log('1. 기본 연결 테스트...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (connectionError && connectionError.code !== '42P01') {
      console.error('❌ 연결 실패:', connectionError);
      return;
    }

    console.log('✅ Supabase 연결 성공');

    // 2. 테이블 존재 확인
    console.log('\n2. users 테이블 존재 확인...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (tableError) {
      if (tableError.code === '42P01') {
        console.log('⚠️ users 테이블이 존재하지 않습니다.');
        console.log('📋 Supabase 대시보드에서 다음 SQL을 실행하세요:\n');
        console.log(createUsersTableSQL);
        return;
      } else {
        console.error('❌ 테이블 확인 실패:', tableError);
        return;
      }
    }

    console.log('✅ users 테이블이 존재합니다');

    // 3. 테스트 사용자 생성
    console.log('\n3. 테스트 사용자 생성...');
    const testUser = {
      id: `test_${Date.now()}`,
      name: '테스트 사용자',
      email: `test_${Date.now()}@example.com`,
      password: 'hashedpassword123',
      userType: 'CUSTOMER',
      createdAt: new Date().toISOString()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single();

    if (insertError) {
      console.error('❌ 사용자 생성 실패:', insertError);
      return;
    }

    console.log('✅ 테스트 사용자 생성 성공:', insertData);

    // 4. 사용자 조회 테스트
    console.log('\n4. 사용자 조회 테스트...');
    const { data: userData, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testUser.email)
      .single();

    if (selectError) {
      console.error('❌ 사용자 조회 실패:', selectError);
      return;
    }

    console.log('✅ 사용자 조회 성공:', userData);

    // 5. 테스트 사용자 삭제
    console.log('\n5. 테스트 사용자 삭제...');
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', testUser.id);

    if (deleteError) {
      console.error('❌ 사용자 삭제 실패:', deleteError);
      return;
    }

    console.log('✅ 테스트 사용자 삭제 성공');

    // 6. 전체 사용자 수 확인
    console.log('\n6. 전체 사용자 수 확인...');
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ 사용자 수 확인 실패:', countError);
      return;
    }

    console.log(`✅ 현재 등록된 사용자 수: ${count}명`);

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  }

  console.log('\n🏁 Supabase 연결 테스트 완료');
}

const createUsersTableSQL = `
-- Supabase에서 실행할 사용자 테이블 생성 SQL
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  phone VARCHAR,
  "userType" VARCHAR NOT NULL DEFAULT 'CUSTOMER',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users("createdAt");
`;

// 테스트 실행
testSupabaseConnection().catch(console.error);
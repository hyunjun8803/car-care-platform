import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase가 설정되지 않았습니다. 환경변수를 확인해주세요.',
        tableExists: false
      }, { status: 500 });
    }

    console.log('🔗 데이터베이스 설정 시작...');

    // 1. 현재 테이블 존재 확인
    const { data: existingTable, error: checkError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (!checkError) {
      return NextResponse.json({
        success: true,
        message: 'users 테이블이 이미 존재합니다.',
        tableExists: true
      });
    }

    if (checkError.code !== 'PGRST205' && checkError.code !== '42P01') {
      console.error('테이블 확인 중 오류:', checkError);
      return NextResponse.json({
        success: false,
        error: '테이블 확인 중 오류가 발생했습니다.',
        details: checkError
      }, { status: 500 });
    }

    // 2. 테이블이 존재하지 않으므로 생성 시도
    console.log('📋 users 테이블 생성 시도...');

    // Supabase의 직접 SQL 실행은 service_role 키가 필요하므로
    // 여기서는 테이블 생성 상태만 확인하고 안내
    return NextResponse.json({
      success: false,
      message: 'users 테이블이 존재하지 않습니다.',
      instruction: 'Supabase 대시보드의 SQL Editor에서 다음 SQL을 실행해주세요.',
      sql: `
-- users 테이블 생성
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
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users("userType");
      `,
      tableExists: false
    }, { status: 400 });

  } catch (error) {
    console.error('데이터베이스 설정 오류:', error);
    return NextResponse.json({
      success: false,
      error: '데이터베이스 설정 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({
        tableExists: false,
        error: 'Supabase가 설정되지 않았습니다. 환경변수를 확인해주세요.'
      }, { status: 500 });
    }

    // 데이터베이스 상태 확인
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST205' || error.code === '42P01') {
        return NextResponse.json({
          tableExists: false,
          error: 'users 테이블이 존재하지 않습니다.',
          instruction: 'POST /api/setup/database 를 호출하여 테이블을 생성하세요.'
        });
      }
      
      return NextResponse.json({
        tableExists: false,
        error: '데이터베이스 연결 오류',
        details: error
      }, { status: 500 });
    }

    // 사용자 수 확인
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      tableExists: true,
      userCount: count || 0,
      message: 'users 테이블이 정상적으로 작동합니다.'
    });

  } catch (error) {
    console.error('데이터베이스 상태 확인 오류:', error);
    return NextResponse.json({
      tableExists: false,
      error: '데이터베이스 상태 확인 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}
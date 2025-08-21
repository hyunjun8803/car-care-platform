import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase 클라이언트가 초기화되지 않았습니다. 환경변수를 확인하세요.',
        details: 'NEXT_PUBLIC_SUPABASE_URL 및 NEXT_PUBLIC_SUPABASE_ANON_KEY가 필요합니다.'
      }, { status: 500 });
    }
    
    console.log('Supabase 테이블 업데이트 시도 중...');
    
    // 테이블 컬럼 추가 시도
    const queries = [
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT \'USER\';',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "shopInfo" JSONB;',
      'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);',
      'CREATE INDEX IF NOT EXISTS idx_users_shop_status ON users(("shopInfo"->>\'status\'));'
    ];

    const results = [];
    
    for (const query of queries) {
      try {
        console.log('실행 중:', query);
        const { data, error } = await supabase.rpc('execute_sql', { sql: query });
        
        if (error) {
          console.error('SQL 실행 오류:', error);
          results.push({ query, error: error.message, success: false });
        } else {
          console.log('SQL 실행 성공:', query);
          results.push({ query, success: true });
        }
      } catch (err) {
        console.error('SQL 실행 예외:', err);
        results.push({ query, error: String(err), success: false });
      }
    }

    // 현재 테이블 구조 확인
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('execute_sql', { 
        sql: `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'users';
        `
      });

    if (tableError) {
      console.error('테이블 구조 확인 오류:', tableError);
    } else {
      console.log('현재 테이블 구조:', tableInfo);
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase 테이블 업데이트 시도 완료',
      results,
      tableInfo
    });

  } catch (error) {
    console.error('테이블 업데이트 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.',
      details: String(error)
    }, { status: 500 });
  }
}